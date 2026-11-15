import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  CaseDetail,
  WorkspaceContext,
  attentionItems,
  attentionDestination,
  applicableCaseIntent,
  caseNavigationContext,
} from "../.ssr/entry-server.js";

function renderCase(state, role, id, lang = "fr", caseIntent) {
  const c = state.cases.find((c) => c.id === id);
  return renderToStaticMarkup(
    createElement(
      WorkspaceContext.Provider,
      {
        value: {
          state,
          role,
          lang,
          selected: id,
          caseIntent,
          select() {},
          go() {},
          act() {
            return false;
          },
          t: (fr, pt) => (lang === "fr" ? fr : pt),
        },
      },
      createElement(CaseDetail, { c }),
    ),
  );
}
function activeSection(html) {
  const panels = [
    ...html.matchAll(/<section class="ws-case-section"[^>]*>/g),
  ].map((m) => m[0]);
  const visible = panels.filter((tag) => !tag.includes("hidden="));
  assert.equal(visible.length, 1, "Only the current panel may be visible");
  return visible[0].match(/-(progress|proposal|decisions|team)-panel/)[1];
}
function apply(s, role, action) {
  const result = transition(s, role, action);
  assert.equal(result.ok, true);
  return result.state;
}

test("Case panels open the relevant step as a real proposal becomes approved, paid and started", () => {
  let s = initialState();
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "proposal");
  s = apply(s, "member", { type: "accept-quote", id: "DEMO-002", version: 1 });
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "proposal");
  assert.equal(activeSection(renderCase(s, "team", "DEMO-002")), "progress");
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "pending" });
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "paid" });
  s = apply(s, "member", {
    type: "document",
    id: "DEMO-002",
    name: "Demo",
    requirement: "need-1",
  });
  s = apply(s, "team", {
    type: "document-review",
    id: s.documents.at(-1).id,
    review: "accepted",
    reason: "",
  });
  s = apply(s, "team", { type: "stage", id: "DEMO-002", stage: "inprogress" });
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "progress");
  s = apply(s, "team", { type: "stage", id: "DEMO-002", stage: "delivered" });
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "decisions");
  assert.equal(activeSection(renderCase(s, "team", "DEMO-002")), "progress");
  s = apply(s, "team", { type: "stage", id: "DEMO-002", stage: "completed" });
  const closed = renderCase(s, "member", "DEMO-002");
  assert.equal(activeSection(closed), "decisions");
  assert.match(closed, /Ce dossier est clôturé/);
  assert.match(closed, /Consulter le bilan du dossier/);
});

test("Cancellation navigation keeps pending payments reachable before moving to the decision", () => {
  let s = initialState();
  s = apply(s, "member", { type: "accept-quote", id: "DEMO-002", version: 1 });
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "pending" });
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-002",
    reason: "Demo",
  });
  const html = renderCase(s, "member", "DEMO-002");
  assert.equal(activeSection(html), "proposal");
  assert.match(html, /Voir le paiement en attente/);
  assert.match(html, /Voir les options d’annulation/);
  assert.equal(activeSection(renderCase(s, "team", "DEMO-002")), "decisions");
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "failed" });
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "decisions");
  s = apply(s, "team", {
    type: "cancel-decision",
    id: "DEMO-002",
    confirm: true,
    reason: "Demo",
  });
  assert.equal(activeSection(renderCase(s, "member", "DEMO-002")), "decisions");
});

test("Bilingual case tabs link to unique panels and omit financial and internal panels from partner markup", () => {
  let s = initialState();
  s = apply(s, "team", {
    type: "note",
    id: "DEMO-001",
    body: "TEAM_ONLY_CONTENT",
  });
  for (const lang of ["fr", "pt"]) {
    for (const role of ["member", "team", "partner"]) {
      const html = renderCase(s, role, "DEMO-001", lang);
      const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(
        (m) => m[0],
      );
      assert.equal(
        tabs.length,
        role === "partner" ? 1 : role === "team" ? 4 : 3,
      );
      assert.equal(
        tabs.filter(
          (tag) =>
            tag.includes('aria-selected="true"') &&
            tag.includes('tabindex="0"'),
        ).length,
        1,
      );
      for (const tab of tabs) {
        const panel = tab.match(/aria-controls="([^"]+)"/)[1];
        const tabId = tab.match(/id="([^"]+)"/)[1];
        assert.ok(html.includes(`id="${panel}" aria-labelledby="${tabId}"`));
      }
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length);
      assert.equal(html.includes("TEAM_ONLY_CONTENT"), role === "team");
      assert.equal(html.includes("-proposal-panel"), role !== "partner");
      assert.equal(html.includes("-team-panel"), role === "team");
      assert.equal(activeSection(html), "progress");
      assert.ok(
        html.includes(lang === "fr" ? "Suivi de la mission" : "Acompanhamento"),
      );
    }
  }
});

function intentFor(state, role, id, destination, token = 1) {
  return {
    caseId: id,
    role,
    token,
    context: caseNavigationContext(state.cases.find((c) => c.id === id)),
    destination,
  };
}

test("Attention shortcuts distinguish tasks, payment decisions and document screens throughout a cancellation", () => {
  let s = initialState();
  const destination = (role, kind) => {
    const item = attentionItems(s, role).find((item) => item.kind === kind);
    assert.ok(item, kind);
    return attentionDestination(
      item,
      s.cases.find((c) => c.id === item.caseId),
    );
  };
  assert.deepEqual(destination("partner", "tasks"), {
    section: "progress",
    tasks: "open",
  });
  assert.deepEqual(destination("member", "approve"), { section: "proposal" });
  assert.equal(destination("member", "provide"), undefined);
  s = apply(s, "member", { type: "accept-quote", id: "DEMO-002", version: 1 });
  assert.deepEqual(destination("member", "pay"), { section: "proposal" });
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "pending" });
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-002",
    reason: "Demo",
  });
  assert.deepEqual(destination("member", "payment-result"), {
    section: "proposal",
  });
  assert.deepEqual(destination("team", "cancellation"), {
    section: "decisions",
  });
});

test("An activity shortcut opens the task panel and includes a completed task hidden by the ordinary filter, in both languages", () => {
  let s = apply(initialState(), "team", {
    type: "task-create",
    id: "DEMO-002",
    title: "ROUTING_COMPLETED_TASK",
    due: "",
    assignee: "team",
  });
  s = apply(s, "team", {
    type: "task-update",
    id: s.tasks.at(-1).id,
    status: "done",
    note: "",
  });
  const event = s.audit.at(-1);
  assert.equal(event.caseId, "DEMO-002");
  assert.deepEqual(event.caseDestination, {
    section: "progress",
    tasks: "all",
  });
  for (const lang of ["fr", "pt"]) {
    const ordinary = renderCase(s, "team", event.caseId, lang);
    assert.equal(activeSection(ordinary), "proposal");
    assert.equal(ordinary.includes("ROUTING_COMPLETED_TASK"), false);
    const linked = renderCase(
      s,
      "team",
      event.caseId,
      lang,
      intentFor(s, "team", event.caseId, event.caseDestination),
    );
    assert.equal(activeSection(linked), "progress");
    assert.match(linked, /<details class="ws-case-tasks" open="">/);
    assert.match(linked, /ROUTING_COMPLETED_TASK/);
  }
});

test("Activity links preserve the purpose of proposal, internal note and cancellation actions", () => {
  let s = apply(initialState(), "member", {
    type: "accept-quote",
    id: "DEMO-002",
    version: 1,
  });
  assert.deepEqual(s.audit.at(-1).caseDestination, { section: "proposal" });
  const proposal = intentFor(
    s,
    "team",
    "DEMO-002",
    s.audit.at(-1).caseDestination,
  );
  assert.equal(
    activeSection(renderCase(s, "team", "DEMO-002", "fr", proposal)),
    "proposal",
  );
  s = apply(s, "team", {
    type: "note",
    id: "DEMO-002",
    body: "PRIVATE_NOTE_ROUTING",
  });
  assert.deepEqual(s.audit.at(-1).caseDestination, { section: "team" });
  assert.equal(
    JSON.stringify(s.audit.at(-1)).includes("PRIVATE_NOTE_ROUTING"),
    false,
  );
  assert.equal(
    activeSection(
      renderCase(
        s,
        "team",
        "DEMO-002",
        "pt",
        intentFor(s, "team", "DEMO-002", s.audit.at(-1).caseDestination),
      ),
    ),
    "team",
  );
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-002",
    reason: "Demo",
  });
  assert.deepEqual(s.audit.at(-1).caseDestination, { section: "decisions" });
});

test("Navigation intents expire when case or role changes and cannot expose restricted panels", () => {
  let s = initialState();
  const c = s.cases.find((c) => c.id === "DEMO-002");
  const intent = intentFor(s, "member", c.id, {
    section: "progress",
    tasks: "all",
  });
  assert.equal(applicableCaseIntent(intent, c, "member"), intent);
  assert.equal(applicableCaseIntent(intent, s.cases[0], "member"), undefined);
  assert.equal(applicableCaseIntent(intent, c, "team"), undefined);
  s = apply(s, "member", { type: "accept-quote", id: c.id, version: 1 });
  assert.equal(
    applicableCaseIntent(
      intent,
      s.cases.find((c) => c.id === intent.caseId),
      "member",
    ),
    undefined,
  );
  assert.equal(
    activeSection(renderCase(s, "member", c.id, "fr", intent)),
    "proposal",
  );
  const beforeCancellation = intentFor(s, "member", c.id, {
    section: "progress",
  });
  s = apply(s, "member", { type: "cancel-request", id: c.id, reason: "Demo" });
  assert.equal(
    activeSection(renderCase(s, "member", c.id, "fr", beforeCancellation)),
    "decisions",
  );
  const partner = intentFor(s, "partner", "DEMO-001", { section: "proposal" });
  const html = renderCase(s, "partner", "DEMO-001", "fr", partner);
  assert.equal(activeSection(html), "progress");
  assert.equal(html.includes("-proposal-panel"), false);
  const member = intentFor(s, "member", "DEMO-001", { section: "team" });
  assert.equal(
    activeSection(renderCase(s, "member", "DEMO-001", "pt", member)),
    "progress",
  );
});
