import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  CaseDetail,
  WorkspaceContext,
} from "../.ssr/entry-server.js";

function renderCase(state, role, id, lang = "fr") {
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
