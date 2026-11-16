import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  messageDraft,
  unreadMessages,
  messageAuthor,
  attentionItems,
  matchingActivity,
  Settlements,
  CaseDecisions,
  transition,
  visibleCases,
  visibleDocuments,
  familyPreview,
  eligibleRecipients,
  restoreSession,
  routeHash,
  readWorkspaceRoute,
  readHandoff,
  nextRenewal,
  viewsForActor,
  Deliveries,
  PeopleDesk,
  SubscriptionCalendar,
  WorkspaceContext,
  translate,
  translations,
  languages,
  exampleText,
  services,
  href,
  route,
  render,
} from "../.ssr/entry-server.js";
function apply(s, role, a) {
  const r = transition(s, role, a);
  assert.equal(r.ok, true, `${a.type}: ${r.error}`);
  return r.state;
}
function reject(s, role, a, pattern) {
  const r = transition(s, role, a);
  assert.equal(r.ok, false, a.type);
  assert.equal(r.state, s);
  assert.ok(r.error?.every(Boolean));
  if (pattern) assert.match(r.error[0], pattern);
}
function element(Component, state, role = "member", lang = "fr", props = {}) {
  return renderToStaticMarkup(
    createElement(
      WorkspaceContext.Provider,
      {
        value: {
          state,
          role,
          lang,
          t: (fr, pt) => translate(fr, pt, lang),
          act: () => false,
          go() {},
          select() {},
          selected: "DEMO-001",
        },
      },
      createElement(Component, props),
    ),
  );
}

test("A delivery needs a report and case-scoped approved documents; closure needs the client’s current-version acceptance", () => {
  let s = initialState();
  reject(
    s,
    "partner",
    { type: "stage", id: "DEMO-001", stage: "delivered", summary: "Done" },
    /tâches/,
  );
  s = apply(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "",
  });
  reject(
    s,
    "partner",
    { type: "stage", id: "DEMO-001", stage: "delivered" },
    /compte rendu/,
  );
  reject(s, "partner", {
    type: "stage",
    id: "DEMO-001",
    stage: "delivered",
    summary: "Done",
    documents: ["doc-2"],
  });
  s = apply(s, "partner", {
    type: "stage",
    id: "DEMO-001",
    stage: "delivered",
    summary: "Report version one",
    documents: ["doc-1"],
  });
  reject(
    s,
    "team",
    { type: "stage", id: "DEMO-001", stage: "completed" },
    /client/,
  );
  reject(s, "team", { type: "delivery-accept", id: "DEMO-001", version: 1 });
  s = apply(s, "member", {
    type: "correction",
    id: "DEMO-001",
    reason: "Add a detail",
  });
  assert.equal(s.cases[0].deliveries[0].status, "correction");
  reject(s, "member", { type: "delivery-accept", id: "DEMO-001", version: 1 });
  s = apply(s, "team", {
    type: "task-update",
    id: s.tasks.at(-1).id,
    status: "done",
    note: "Added",
  });
  s = apply(s, "team", {
    type: "stage",
    id: "DEMO-001",
    stage: "delivered",
    summary: "Report version two",
    documents: [],
  });
  reject(s, "member", { type: "delivery-accept", id: "DEMO-001", version: 1 });
  assert.equal(s.cases[0].deliveries[0].summary, "Report version one");
  assert.deepEqual(s.cases[0].deliveries[0].documents, [
    { id: "doc-1", name: initialState().documents[0].name, version: 1 },
  ]);
  s = apply(s, "member", {
    type: "delivery-accept",
    id: "DEMO-001",
    version: 2,
  });
  s = apply(s, "team", { type: "stage", id: "DEMO-001", stage: "completed" });
  assert.equal(s.cases[0].stage, "completed");
  for (const lang of languages) {
    const html = element(Deliveries, s, "member", lang, { c: s.cases[0] });
    assert.match(html, /Report version two/);
    assert.match(html, /Report version one/);
    assert.match(html, /Add a detail/);
  }
});

test("Catalogue handoff atomically creates an independent non-member customer and request without borrowing another customer’s property", () => {
  let s = initialState();
  const customer = {
    name: "Fictitious customer",
    country: "UK",
    currency: "GBP",
  };
  reject(s, "member", {
    type: "request",
    service: services[0].id,
    property: "home-1",
    description: "A visit",
    customer,
  });
  reject(s, "member", {
    type: "request",
    service: "unknown",
    property: "",
    description: "A visit",
    customer,
  });
  assert.equal(s.accounts.length, 0);
  s = apply(s, "member", {
    type: "request",
    service: services[0].id,
    property: "",
    description: "A visit",
    customer,
  });
  assert.equal(s.profile.currency, "GBP");
  assert.equal(s.subscription.active, false);
  assert.equal(s.cases.at(-1).owner, s.activeClient);
  assert.deepEqual(
    visibleCases(s, "member").map((c) => c.id),
    ["DEMO-003"],
  );
  assert.equal(visibleDocuments(s, "member").length, 0);
  reject(s, "member", {
    type: "property-edit",
    id: "home-1",
    name: "Changed",
    town: "Changed",
  });
  s = apply(s, "member", { type: "client-select", id: "demo" });
  assert.deepEqual(
    visibleCases(s, "member").map((c) => c.id),
    ["DEMO-001", "DEMO-002"],
  );
  assert.equal(s.subscription.active, true);
  assert.equal(
    readHandoff(
      JSON.stringify({
        version: 1,
        service: "x",
        description: "Test",
        name: "Demo",
        country: "FR",
      }),
    ).name,
    "Demo",
  );
  assert.equal(readHandoff("{bad"), null);
});

test("Named partners receive only their cases, and reassignment removes the previous document grants", () => {
  let s = initialState();
  s = apply(s, "team", {
    type: "staff-assign",
    id: "DEMO-001",
    operatorId: "operator-2",
    partnerId: "partner-2",
  });
  assert.equal(visibleCases(s, "partner").length, 0);
  s = apply(s, "partner", { type: "actor-select", id: "partner-2" });
  assert.deepEqual(
    visibleCases(s, "partner").map((c) => c.id),
    ["DEMO-001"],
  );
  assert.equal(visibleDocuments(s, "partner").length, 0);
  s = apply(s, "team", { type: "share", id: "doc-1", shared: true });
  assert.equal(visibleDocuments(s, "partner").length, 1);
  s = apply(s, "team", {
    type: "person-access",
    id: "partner-2",
    enabled: false,
  });
  assert.equal(visibleCases(s, "partner").length, 0);
  reject(s, "partner", {
    type: "message",
    id: "DEMO-001",
    body: "not allowed",
  });
  s = apply(s, "team", { type: "actor-select", id: "operator-2" });
  assert.deepEqual(
    visibleCases(s, "team").map((c) => c.id),
    ["DEMO-001"],
  );
  assert.ok(!viewsForActor(s, "team").includes("admin"));
  reject(s, "team", { type: "note", id: "DEMO-002", body: "not assigned" });
  reject(s, "team", { type: "person-access", id: "partner-2", enabled: true });
  s = apply(s, "team", { type: "actor-select", id: "editor-1" });
  assert.equal(visibleCases(s, "team").length, 0);
  assert.equal(visibleDocuments(s, "team").length, 0);
  assert.deepEqual(viewsForActor(s, "team"), ["newsletter"]);
  reject(s, "team", { type: "client-select", id: "demo" });
  reject(s, "team", { type: "note", id: "DEMO-001", body: "private" });
});

test("Subscription calendar handles month ends, expiry, renewal failures and confirmation without altering existing cases", () => {
  assert.equal(nextRenewal("2028-01-31", "monthly"), "2028-02-29");
  assert.equal(nextRenewal("2028-02-29", "annual"), "2029-02-28");
  let s = apply(initialState(), "member", { type: "cancel", cancel: true });
  s = apply(s, "member", { type: "demo-date", day: "2027-11-01" });
  assert.equal(s.subscription.active, false);
  assert.equal(s.subscription.timeline.at(-1).event, "expired");
  assert.equal(visibleCases(s, "member").length, 2);
  assert.deepEqual(eligibleRecipients(s), []);
  s = apply(s, "member", {
    type: "subscription",
    plan: "Member",
    period: "monthly",
  });
  reject(s, "member", { type: "demo-date", day: "2027-12-01" });
  s = apply(s, "member", { type: "subscription-payment", result: "failed" });
  assert.equal(s.subscription.active, false);
  s = apply(s, "member", {
    type: "subscription",
    plan: "Member",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  assert.equal(s.subscription.active, true);
  assert.equal(s.subscription.renewsOn, "2027-12-01");
  assert.equal(s.subscription.cancelAtEnd, false);
  s = apply(s, "member", { type: "demo-date", day: "2027-12-01" });
  assert.equal(s.subscription.timeline.at(-1).event, "overdue");
  assert.equal(s.subscription.active, false);
  reject(s, "member", { type: "demo-date", day: "2027-11-30" });
  for (const lang of languages)
    assert.match(element(SubscriptionCalendar, s, "member", lang), /2027/);
});

test("A saved session replays validated transitions including clients, drafts, receipts and subscription dates; malformed or stale actions are rejected", () => {
  const events = [
    {
      role: "partner",
      action: {
        type: "task-update",
        id: "task-1",
        status: "done",
        note: "Done",
      },
    },
    {
      role: "partner",
      action: {
        type: "stage",
        id: "DEMO-001",
        stage: "delivered",
        summary: "Fictitious report",
      },
    },
    {
      role: "member",
      action: { type: "delivery-accept", id: "DEMO-001", version: 1 },
    },
    {
      role: "member",
      action: { type: "message-draft", id: "DEMO-001", body: "Saved draft" },
    },
    { role: "member", action: { type: "demo-date", day: "2027-11-01" } },
    {
      role: "member",
      action: { type: "client-create", name: "Second", country: "PT" },
    },
    { role: "member", action: { type: "client-select", id: "demo" } },
  ];
  let s = initialState();
  for (const e of events) s = apply(s, e.role, e.action);
  const raw = JSON.stringify({ version: 2, base: null, events });
  assert.deepEqual(restoreSession(raw).state, s);
  assert.throws(() =>
    restoreSession(raw.replace('"version":2', '"version":1')),
  );
  assert.throws(() => restoreSession("{broken"));
  assert.throws(() =>
    restoreSession(
      JSON.stringify({
        version: 2,
        base: null,
        events: [
          {
            role: "member",
            action: { type: "delivery-accept", id: "DEMO-001", version: 99 },
          },
        ],
      }),
    ),
  );
  assert.throws(() =>
    restoreSession(
      JSON.stringify({
        version: 2,
        base: null,
        events: [{ role: "stranger", action: { type: "note" } }],
      }),
    ),
  );
  assert.throws(() =>
    restoreSession(
      JSON.stringify({
        version: 2,
        base: null,
        events: [{ role: "member", action: { type: "unknown" } }],
      }),
    ),
  );
});

test("Workspace routes preserve case and section, and reject unknown destinations and unavailable role views", () => {
  const hash = routeHash("requests", "team", "DEMO-002", {
    section: "progress",
    tasks: "all",
  });
  assert.deepEqual(readWorkspaceRoute(hash), {
    view: "requests",
    role: "team",
    id: "DEMO-002",
    destination: { section: "progress", tasks: "all" },
  });
  assert.equal(readWorkspaceRoute("#view=admin&role=partner").view, "overview");
  assert.equal(
    readWorkspaceRoute("#view=not-a-page&role=unknown&section=secret")
      .destination,
    undefined,
  );
  for (const lang of languages)
    assert.deepEqual(route(href("workspace", lang)), {
      page: "workspace",
      lang,
    });
});

test("Every supplied locale key has nonempty EN/DE translations and all four static sites are generated", async () => {
  for (const shard of ["1", "2", "3", "extra"]) {
    const source = JSON.parse(
      await readFile(`src/locales/source-${shard}.json`, "utf8"),
    );
    for (const text of source) {
      assert.ok(translations[text]?.[0]?.trim(), `English: ${text}`);
      assert.ok(translations[text]?.[1]?.trim(), `German: ${text}`);
    }
  }
  for (const lang of languages) {
    for (const page of ["home", "services", "membership", "workspace"]) {
      const html = await readFile("dist" + href(page, lang), "utf8");
      assert.ok(html.includes(`lang="${lang}"`));
      assert.ok(!html.includes("undefined"));
    }
    assert.equal(
      services.filter(
        (s) => s.name[lang] && s.description[lang] && s.limits[lang],
      ).length,
      28,
    );
  }
  assert.equal(translate("Documents", "Documentos", "en"), "Documents");
  assert.equal(translate("Documents", "Documentos", "de"), "Dokumente");
  assert.equal(
    exampleText(initialState().cases[0].description, "en"),
    "Example: house visit before an arrival.",
  );
  assert.equal(
    exampleText("My text / remains unchanged", "de"),
    "My text / remains unchanged",
  );
});

test("Saved sessions reject malformed nested payloads before they can corrupt a profile or customer", () => {
  for (const action of [
    { type: "profile", profile: { name: "Incomplete" } },
    {
      type: "request",
      service: "maison-inoccupee",
      property: "",
      description: "Visit",
      customer: { name: "Missing country" },
    },
    { type: "edition-draft", content: { title: "Missing sections" } },
    { type: "task-update", id: "task-1", status: "unexpected", note: "" },
  ])
    assert.throws(() =>
      restoreSession(
        JSON.stringify({
          version: 2,
          base: null,
          events: [{ role: "member", action }],
        }),
      ),
    );
});

test("Newsletter audience and subscription expiry follow all fictitious clients independently of the selected client", () => {
  let s = apply(initialState(), "member", {
    type: "client-create",
    name: "Second customer",
    country: "PT",
  });
  const other = s.activeClient;
  assert.deepEqual(eligibleRecipients(s), ["demo"]);
  s = apply(s, "member", {
    type: "subscription",
    plan: "Member",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  s = apply(s, "member", {
    type: "profile",
    profile: { ...s.profile, consent: true },
  });
  assert.deepEqual(new Set(eligibleRecipients(s)), new Set(["demo", other]));
  s = apply(s, "member", { type: "client-select", id: "demo" });
  s = apply(s, "member", { type: "demo-date", day: "2026-12-16" });
  assert.deepEqual(eligibleRecipients(s), ["demo"]);
  s = apply(s, "member", { type: "client-select", id: other });
  assert.equal(s.subscription.active, false);
  assert.equal(s.subscription.timeline.at(-1).event, "overdue");
});

test("Drafts and read receipts belong to named actors, including after reassignment and session replay", () => {
  let s = initialState();
  const events = [];
  const run = (role, action) => {
    events.push({ role, action });
    s = apply(s, role, action);
  };
  run("partner", {
    type: "message-draft",
    id: "DEMO-001",
    body: "PRIVATE_JOAO",
  });
  run("partner", {
    type: "message-read",
    id: "DEMO-001",
    through: s.messages.at(-1).id,
  });
  assert.equal(unreadMessages(s, "partner").length, 0);
  run("team", { type: "message", id: "DEMO-001", body: "From Camille" });
  run("team", {
    type: "message-draft",
    id: "DEMO-001",
    body: "PRIVATE_CAMILLE",
  });
  run("team", {
    type: "staff-assign",
    id: "DEMO-001",
    operatorId: "operator-2",
    partnerId: "partner-2",
  });
  run("partner", { type: "actor-select", id: "partner-2" });
  assert.equal(messageDraft(s, "partner", "DEMO-001"), "");
  assert.equal(unreadMessages(s, "partner", "DEMO-001").length, 2);
  run("team", { type: "actor-select", id: "operator-2" });
  assert.equal(messageDraft(s, "team", "DEMO-001"), "");
  assert.equal(unreadMessages(s, "team", "DEMO-001").length, 2);
  assert.match(messageAuthor(s, s.messages.at(-1)), /Camille/);
  run("partner", { type: "message-draft", id: "DEMO-001", body: "SOFIA_ONLY" });
  const restored = restoreSession(
    JSON.stringify({ version: 2, base: null, events }),
  ).state;
  assert.equal(messageDraft(restored, "partner", "DEMO-001"), "SOFIA_ONLY");
  assert.equal(messageDraft(restored, "team", "DEMO-001"), "");
  run("team", { type: "actor-select", id: "operator-1" });
  run("team", {
    type: "staff-assign",
    id: "DEMO-001",
    operatorId: "operator-1",
    partnerId: "partner-1",
  });
  run("partner", { type: "actor-select", id: "partner-1" });
  assert.equal(messageDraft(s, "partner", "DEMO-001"), "PRIVATE_JOAO");
  assert.equal(messageDraft(s, "team", "DEMO-001"), "PRIVATE_CAMILLE");
  run("member", {
    type: "message-draft",
    id: "DEMO-001",
    body: "PRIVATE_CLIENT",
  });
  run("member", {
    type: "client-create",
    name: "Another client",
    country: "UK",
  });
  assert.equal(messageDraft(s, "member", "DEMO-001"), "");
});

function deliveredCase() {
  let s = apply(initialState(), "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "Done",
  });
  return apply(s, "team", {
    type: "stage",
    id: "DEMO-001",
    stage: "delivered",
    summary: "Visit report",
    documents: ["doc-1", "doc-2"],
  });
}

test("Delivery attachments, including archived versions, obey current partner grants and document versions", () => {
  let s = deliveredCase();
  const markup = (role) =>
    element(Deliveries, s, role, "fr", { c: s.cases[0] });
  assert.match(markup("team"), /Autorisation/);
  assert.doesNotMatch(markup("partner"), /Autorisation/);
  assert.match(markup("partner"), /Liste de visite/);
  s = apply(s, "member", {
    type: "correction",
    id: "DEMO-001",
    reason: "More detail",
  });
  for (const task of s.tasks.filter(
    (t) => t.caseId === "DEMO-001" && t.status !== "done",
  ))
    s = apply(s, "team", {
      type: "task-update",
      id: task.id,
      status: "done",
      note: "Corrected",
    });
  s = apply(s, "team", {
    type: "stage",
    id: "DEMO-001",
    stage: "delivered",
    summary: "Revised report",
    documents: [],
  });
  s = apply(s, "team", {
    type: "staff-assign",
    id: "DEMO-001",
    operatorId: "operator-2",
    partnerId: "partner-2",
  });
  s = apply(s, "partner", { type: "actor-select", id: "partner-2" });
  assert.doesNotMatch(markup("partner"), /Autorisation|Liste de visite/);
  s = apply(s, "team", { type: "share", id: "doc-1", shared: true });
  assert.match(markup("partner"), /Liste de visite/);
  // Sharing a newer version must not expose a historical attachment snapshot.
  s = {
    ...s,
    documents: s.documents.map((d) =>
      d.id === "doc-1"
        ? {
            ...d,
            version: d.version + 1,
            name: "New shared version",
            shared: true,
          }
        : d,
    ),
  };
  assert.doesNotMatch(markup("partner"), /Liste de visite/);
  assert.match(markup("member"), /Autorisation/);
  s = apply(s, "team", { type: "partner-access", enabled: false });
  assert.doesNotMatch(markup("partner"), /Autorisation|Liste de visite/);
});

test("Operator financial access is blocked in actions, shortcuts, screens, alerts and the activity journal", () => {
  let s = deliveredCase();
  s = apply(s, "team", {
    type: "staff-assign",
    id: "DEMO-001",
    operatorId: "operator-2",
    partnerId: "partner-1",
  });
  s = apply(s, "member", {
    type: "delivery-accept",
    id: "DEMO-001",
    version: 1,
  });
  s = apply(s, "team", { type: "stage", id: "DEMO-001", stage: "completed" });
  const proposal = {
    type: "settlement-propose",
    id: "DEMO-001",
    coordination: 30,
    official: 0,
    thirdParty: 0,
    explanation: "Final costs",
  };
  const admin = s;
  s = apply(s, "team", { type: "actor-select", id: "operator-2" });
  reject(s, "team", proposal, /réservée/);
  assert.ok(!viewsForActor(s, "team").includes("settlements"));
  assert.equal(element(Settlements, s, "team"), "");
  assert.doesNotMatch(
    element(CaseDecisions, s, "team", "fr", { c: s.cases[0] }),
    /Consulter le bilan/,
  );
  assert.ok(
    !attentionItems(s, "team").some((item) => item.target === "settlements"),
  );
  s = apply(admin, "team", proposal);
  const response = {
    type: "settlement-respond",
    id: "DEMO-001",
    version: 1,
    approve: true,
    reason: "",
  };
  const operator = apply(s, "team", { type: "actor-select", id: "operator-2" });
  reject(operator, "team", response, /réservée/);
  assert.ok(
    !matchingActivity(operator, "team", {}, "fr").some(
      (event) => event.category === "settlements",
    ),
  );
  s = apply(s, "member", response);
  s = apply(s, "team", { type: "actor-select", id: "operator-2" });
  const refund = {
    type: "settlement-payment",
    id: "DEMO-001",
    version: 1,
    result: "pending",
  };
  reject(s, "team", refund, /réservée/);
  s = apply(s, "team", { type: "actor-select", id: "operator-1" });
  s = apply(s, "team", refund);
  assert.equal(s.cases[0].settlements.at(-1).status, "pending");
});
