import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  unreadMessages,
  attentionItems,
  transition,
  visibleCases,
  visibleDocuments,
  total,
  eligibleRecipients,
  services,
  missingRequirements,
  openTasks,
  visibleTasks,
  matchingCases,
} from "../.ssr/entry-server.js";

const apply = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, true, `${role}: ${action.type}`);
  return r.state;
};
const rejected = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, false);
  assert.equal(
    r.state,
    s,
    "Rejected action preserves state identity and history",
  );
};
test("A request passes from member to team to partner only after agreement and confirmed provision", () => {
  let s = initialState();
  s = apply(s, "member", {
    type: "request",
    service: services[0].id,
    property: "home-1",
    description: "Démo",
  });
  const id = s.cases.at(-1).id;
  rejected(s, "team", { type: "stage", id, stage: "completed" });
  rejected(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "team", { type: "stage", id, stage: "review" });
  rejected(s, "team", {
    type: "quote",
    scope: "Périmètre fictif à revoir",
    exclusions: "Conditions TBD",
    id,
    quote: -10,
    fees: 0,
    thirdParty: 0,
  });
  rejected(s, "team", {
    type: "quote",
    scope: "Périmètre fictif à revoir",
    exclusions: "Conditions TBD",
    id,
    quote: 1.001,
    fees: 0,
    thirdParty: 0,
  });
  s = apply(s, "team", {
    type: "quote",
    scope: "Périmètre fictif à revoir",
    exclusions: "Conditions TBD",
    id,
    quote: 39,
    fees: 10,
    thirdParty: 20,
  });
  assert.equal(total(s.cases.at(-1)), 69);
  rejected(s, "team", { type: "accept-quote", id, version: 1 });
  s = apply(s, "member", { type: "accept-quote", id, version: 1 });
  rejected(s, "team", { type: "stage", id, stage: "inprogress" });
  rejected(s, "member", { type: "pay", id, result: "paid" });
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", { type: "pay", id, result: "failed" });
  rejected(s, "team", { type: "stage", id, stage: "inprogress" });
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", { type: "pay", id, result: "paid" });
  rejected(s, "member", { type: "pay", id, result: "paid" });
  s = apply(s, "team", { type: "assign", id, assigned: true });
  s = apply(s, "team", { type: "stage", id, stage: "inprogress" });
  s = apply(s, "partner", { type: "stage", id, stage: "delivered" });
  rejected(s, "partner", { type: "stage", id, stage: "completed" });
  s = apply(s, "team", { type: "stage", id, stage: "completed" });
  assert.equal(s.cases.at(-1).history.length, 7);
});
test("Partner access requires assignment plus explicit document sharing; revocation removes visibility", () => {
  let s = initialState();
  assert.deepEqual(
    visibleCases(s, "partner").map((c) => c.id),
    ["DEMO-001"],
  );
  assert.deepEqual(
    visibleDocuments(s, "partner").map((d) => d.id),
    ["doc-1"],
  );
  rejected(s, "partner", { type: "message", id: "DEMO-002", body: "test" });
  rejected(s, "partner", { type: "note", id: "DEMO-001", body: "private" });
  rejected(s, "partner", { type: "share", id: "doc-2", shared: true });
  rejected(s, "member", { type: "assign", id: "DEMO-001", assigned: false });
  s = apply(s, "member", { type: "share", id: "doc-2", shared: true });
  assert.equal(visibleDocuments(s, "partner").length, 2);
  s = apply(s, "team", { type: "assign", id: "DEMO-001", assigned: false });
  assert.equal(visibleDocuments(s, "partner").length, 0);
  rejected(s, "partner", { type: "document", id: "DEMO-001", name: "test" });
  s.cases.push({ ...s.cases[0], id: "OTHER", owner: "other" });
  assert.ok(!visibleCases(s, "member").some((c) => c.id === "OTHER"));
});
test("Original custody is sequential and team-only", () => {
  let s = initialState();
  rejected(s, "member", { type: "custody", id: "doc-2", custody: "returned" });
  rejected(s, "team", { type: "custody", id: "doc-1", custody: "returned" });
  s = apply(s, "team", { type: "custody", id: "doc-1", custody: "received" });
  s = apply(s, "team", { type: "custody", id: "doc-1", custody: "returned" });
  rejected(s, "team", { type: "custody", id: "doc-1", custody: "received" });
});
test("Failed subscription changes preserve the existing plan; cancellation preserves current rights", () => {
  let s = initialState();
  s = apply(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "monthly",
  });
  assert.equal(s.subscription.plan, "Member");
  s = apply(s, "member", { type: "subscription-payment", result: "failed" });
  assert.equal(s.subscription.plan, "Member");
  assert.equal(s.subscription.active, true);
  s = apply(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  assert.equal(s.subscription.plan, "Family");
  assert.equal(s.subscription.period, "monthly");
  rejected(s, "member", { type: "subscription-payment", result: "paid" });
  s = apply(s, "member", { type: "cancel", cancel: true });
  assert.equal(s.subscription.active, true);
  s = apply(s, "member", { type: "cancel", cancel: false });
  rejected(s, "member", {
    type: "subscription",
    plan: "Premium",
    period: "annual",
  });
  for (let i = 0; i < 3; i++)
    s = apply(s, "member", { type: "invite", email: `demo${i}@example.test` });
  rejected(s, "member", { type: "invite", email: "fourth@example.test" });
});
test("Newsletter is reviewed before publication and consent is rechecked after queuing", () => {
  let s = initialState();
  rejected(s, "team", { type: "publish" });
  rejected(s, "team", {
    type: "edition",
    edition: { ...s.edition, status: "review" },
  });
  s = apply(s, "team", {
    type: "edition",
    edition: {
      title: "DEMO",
      excerpt: "Extrait",
      sections: ["A", "B", "C", "D"],
      status: "review",
    },
  });
  rejected(s, "member", { type: "publish" });
  s = apply(s, "team", { type: "publish" });
  rejected(s, "team", {
    type: "edition",
    edition: { ...s.edition, title: "Overwrite" },
  });
  s = apply(s, "team", { type: "queue" });
  assert.deepEqual(s.campaign.recipients, ["demo"]);
  s = apply(s, "member", {
    type: "profile",
    profile: { ...s.profile, consent: false },
  });
  assert.equal(eligibleRecipients(s).length, 0);
  s = apply(s, "team", { type: "dispatch" });
  assert.equal(s.campaign.delivered.length, 0);
  rejected(s, "team", { type: "dispatch" });
  rejected(s, "team", { type: "queue" });
});
test("Demo mutations reject blank inputs and do not mutate their starting snapshot", () => {
  const s = initialState();
  const before = JSON.stringify(s);
  rejected(s, "member", {
    type: "request",
    service: services[0].id,
    property: "",
    description: "   ",
  });
  rejected(s, "member", { type: "message", id: "DEMO-001", body: "  " });
  rejected(s, "member", { type: "property", name: "  ", town: "X" });
  apply(s, "member", {
    type: "message",
    id: "DEMO-001",
    body: "<script>example</script>",
  });
  assert.equal(JSON.stringify(s), before);
  assert.ok(s.cases.every((c) => services.some((s) => s.id === c.service)));
});

test("Document correction retains its prior version and blocks execution until the requested piece is verified", () => {
  let s = initialState();
  const id = "DEMO-002";
  s = apply(s, "member", { type: "accept-quote", id, version: 1 });
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", { type: "pay", id, result: "paid" });
  rejected(s, "team", { type: "stage", id, stage: "inprogress" });
  rejected(s, "member", {
    type: "document",
    id: "DEMO-001",
    name: "Wrong case",
    requirement: "need-1",
  });
  s = apply(s, "member", {
    type: "document",
    id,
    name: "First copy",
    requirement: "need-1",
  });
  const docId = s.documents.at(-1).id;
  rejected(s, "member", {
    type: "document",
    id,
    name: "Duplicate",
    requirement: "need-1",
  });
  rejected(s, "member", {
    type: "document-review",
    id: docId,
    review: "accepted",
    reason: "",
  });
  rejected(s, "team", {
    type: "document-review",
    id: docId,
    review: "rejected",
    reason: "  ",
  });
  s = apply(s, "team", {
    type: "document-review",
    id: docId,
    review: "rejected",
    reason: "Missing page",
  });
  s = apply(s, "member", {
    type: "document-replace",
    id: docId,
    name: "Corrected copy",
  });
  assert.equal(s.documents.at(-1).version, 2);
  assert.equal(s.documents.at(-1).revisions[0].reason, "Missing page");
  assert.equal(missingRequirements(s, id).length, 1);
  s = apply(s, "team", {
    type: "document-review",
    id: docId,
    review: "accepted",
    reason: "",
  });
  assert.equal(missingRequirements(s, id).length, 0);
  s = apply(s, "team", { type: "stage", id, stage: "inprogress" });
});
test("Tasks have explicit blockers, valid dates, restricted assignments and gate delivery", () => {
  let s = initialState();
  const id = "DEMO-001";
  rejected(s, "partner", { type: "stage", id, stage: "delivered" });
  rejected(s, "team", {
    type: "task-create",
    id,
    title: "X",
    due: "2026-02-30",
    assignee: "team",
  });
  rejected(s, "team", {
    type: "task-create",
    id: "DEMO-002",
    title: "X",
    due: "",
    assignee: "partner",
  });
  rejected(s, "member", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "",
  });
  rejected(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "blocked",
    note: "",
  });
  s = apply(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "blocked",
    note: "Access to confirm",
  });
  assert.equal(openTasks(s, id).length, 1);
  s = apply(s, "team", {
    type: "task-assign",
    id: "task-1",
    assignee: "team",
    due: "2026-12-01",
  });
  assert.equal(visibleTasks(s, "partner").length, 0);
  rejected(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "",
  });
  s = apply(s, "team", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "Done",
  });
  s = apply(s, "team", { type: "stage", id, stage: "delivered" });
  s = apply(s, "team", { type: "stage", id, stage: "completed" });
  rejected(s, "team", {
    type: "task-update",
    id: "task-1",
    status: "todo",
    note: "",
  });
  rejected(s, "team", { type: "requirement", id, label: "Late requirement" });
});
test("Global partner suspension removes all simulated access and can be safely reassigned", () => {
  let s = initialState();
  rejected(s, "partner", { type: "partner-access", enabled: false });
  s = apply(s, "team", { type: "partner-access", enabled: false });
  assert.equal(visibleCases(s, "partner").length, 0);
  assert.equal(visibleTasks(s, "partner").length, 0);
  assert.equal(visibleDocuments(s, "partner").length, 0);
  rejected(s, "partner", { type: "message", id: "DEMO-001", body: "Denied" });
  rejected(s, "team", { type: "assign", id: "DEMO-002", assigned: true });
  s = apply(s, "team", {
    type: "task-assign",
    id: "task-1",
    assignee: "team",
    due: "",
  });
  s = apply(s, "team", { type: "partner-access", enabled: true });
  assert.equal(visibleCases(s, "partner").length, 1);
  assert.equal(visibleTasks(s, "partner").length, 0);
});
test("A new edition archives an immutable published snapshot and cannot discard a queued campaign", () => {
  let s = initialState();
  s = apply(s, "team", {
    type: "edition",
    edition: {
      title: "Issue one",
      excerpt: "Public",
      sections: ["A", "B", "C", "D"],
      status: "review",
    },
  });
  s = apply(s, "team", { type: "publish" });
  s = apply(s, "team", { type: "queue" });
  rejected(s, "team", { type: "next-edition" });
  rejected(s, "member", { type: "cancel-campaign" });
  s = apply(s, "team", { type: "cancel-campaign" });
  s = apply(s, "team", { type: "next-edition" });
  assert.equal(s.archives[0].edition.title, "Issue one");
  assert.equal(s.edition.status, "draft");
  assert.equal(s.campaign.status, "idle");
  s = apply(s, "team", {
    type: "edition",
    edition: {
      title: "Issue two",
      excerpt: "New",
      sections: ["1", "2", "3", "4"],
      status: "review",
    },
  });
  assert.deepEqual(s.archives[0].edition.sections, ["A", "B", "C", "D"]);
});
test("Property edits retain case links, and search combines accents, role isolation and stage", () => {
  let s = initialState();
  rejected(s, "partner", {
    type: "property-edit",
    id: "home-1",
    name: "X",
    town: "Y",
  });
  s = apply(s, "member", {
    type: "property-edit",
    id: "home-1",
    name: "Maison rénovée",
    town: "Démo",
  });
  assert.equal(s.cases[0].property, "home-1");
  assert.equal(matchingCases(s, "member", "renovee", "all", "fr").length, 2);
  assert.equal(matchingCases(s, "partner", "renovee", "all", "fr").length, 1);
  assert.equal(matchingCases(s, "member", "renovee", "quote", "fr").length, 1);
  assert.equal(
    matchingCases(s, "member", "does not exist", "all", "fr").length,
    0,
  );
  rejected(s, "member", {
    type: "request",
    service: "invented",
    property: "",
    description: "X",
  });
});

test("Cancellation pauses execution, preserves history and can be withdrawn or declined without changing payment", () => {
  let s = initialState();
  const id = "DEMO-001";
  rejected(s, "partner", { type: "cancel-request", id, reason: "Pause" });
  rejected(s, "member", { type: "cancel-request", id, reason: " " });
  s = apply(s, "member", {
    type: "cancel-request",
    id,
    reason: "Arrivée reportée",
  });
  assert.equal(matchingCases(s, "team", "", "cancellation", "fr").length, 1);
  rejected(s, "member", { type: "cancel-request", id, reason: "Doublon" });
  for (const action of [
    { type: "task-update", id: "task-1", status: "done", note: "" },
    { type: "document", id, name: "Pièce" },
    { type: "requirement", id, label: "Pièce" },
    { type: "stage", id, stage: "delivered" },
    { type: "share", id: "doc-2", shared: true },
    { type: "assign", id, assigned: true },
  ])
    rejected(s, "team", action);
  s = apply(s, "partner", { type: "message", id, body: "Bien reçu" });
  rejected(s, "team", { type: "cancel-withdraw", id });
  s = apply(s, "member", { type: "cancel-withdraw", id });
  assert.equal(s.cases[0].stage, "inprogress");
  assert.equal(s.cases[0].payment, "paid");
  assert.equal(s.cases[0].cancellation, undefined);
  s = apply(s, "member", {
    type: "cancel-request",
    id,
    reason: "Nouvelle demande",
  });
  rejected(s, "team", {
    type: "cancel-decision",
    id,
    confirm: false,
    reason: " ",
  });
  s = apply(s, "team", {
    type: "cancel-decision",
    id,
    confirm: false,
    reason: "Périmètre à revoir ensemble",
  });
  assert.equal(s.cases[0].decisions.length, 4);
  assert.equal(
    s.cases[0].decisions.at(-1).reason,
    "Périmètre à revoir ensemble",
  );
  assert.equal(s.cases[0].cancellation, undefined);
  s = apply(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "Fait",
  });
});

test("A pending payment must settle before cancellation, and no new attempt starts while cancellation is examined", () => {
  let s = initialState();
  const id = "DEMO-002";
  s = apply(s, "member", { type: "accept-quote", id, version: 1 });
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", {
    type: "cancel-request",
    id,
    reason: "Changement de projet",
  });
  rejected(s, "team", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "",
  });
  rejected(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", { type: "pay", id, result: "paid" });
  rejected(s, "member", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "",
  });
  s = apply(s, "team", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "Accord de l’équipe",
  });
  assert.equal(s.cases[1].stage, "cancelled");
  assert.equal(s.cases[1].payment, "paid");
  assert.equal(s.cases[1].quote, 125);
  rejected(s, "member", { type: "pay", id, result: "pending" });
  rejected(s, "team", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "",
  });
});

test("Cancelled cases lose partner access and restart as independent requests without copying money or private content", () => {
  let s = initialState();
  const id = "DEMO-001";
  s = apply(s, "team", {
    type: "cancel-request",
    id,
    reason: "Mission abandonnée",
  });
  s = apply(s, "team", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "",
  });
  assert.equal(visibleCases(s, "partner").length, 0);
  assert.equal(visibleDocuments(s, "partner").length, 0);
  assert.equal(visibleTasks(s, "partner").length, 0);
  assert.equal(
    s.tasks[0].status,
    "doing",
    "An abandoned task is never falsely marked completed",
  );
  rejected(s, "team", {
    type: "document-review",
    id: "doc-1",
    review: "accepted",
    reason: "",
  });
  rejected(s, "team", { type: "custody", id: "doc-1", custody: "received" });
  s = apply(s, "team", { type: "custody", id: "doc-2", custody: "returned" });
  s = apply(s, "member", { type: "share", id: "doc-1", shared: false });
  s = apply(s, "member", {
    type: "message",
    id,
    body: "Merci de restituer l’original",
  });
  rejected(s, "team", { type: "reopen", id, reason: "Rouvrir" });
  rejected(s, "team", { type: "restart", id });
  s = apply(s, "member", { type: "restart", id });
  const fresh = s.cases.at(-1);
  assert.equal(fresh.sourceCase, id);
  assert.equal(fresh.stage, "submitted");
  assert.equal(fresh.payment, "unpaid");
  assert.equal(total(fresh), 0);
  assert.equal(fresh.partner, false);
  assert.equal(fresh.description, s.cases[0].description);
  assert.equal(s.documents.filter((d) => d.caseId === fresh.id).length, 0);
  assert.deepEqual(fresh.notes, []);
  assert.equal(s.cases[0].stage, "cancelled");
});

test("Delivery corrections and justified reopening create mandatory tasks without charging again", () => {
  let s = initialState();
  const id = "DEMO-001";
  rejected(s, "member", { type: "correction", id, reason: "Trop tôt" });
  s = apply(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "",
  });
  s = apply(s, "team", { type: "stage", id, stage: "delivered" });
  rejected(s, "partner", { type: "correction", id, reason: "Correction" });
  rejected(s, "member", { type: "correction", id, reason: " " });
  s = apply(s, "member", {
    type: "correction",
    id,
    reason: "Compléter le compte rendu",
  });
  assert.equal(s.cases[0].stage, "inprogress");
  assert.equal(s.tasks.at(-1).assignee, "team");
  assert.equal(openTasks(s, id).length, 1);
  rejected(s, "team", { type: "stage", id, stage: "delivered" });
  s = apply(s, "team", {
    type: "task-update",
    id: s.tasks.at(-1).id,
    status: "done",
    note: "Ajout effectué",
  });
  s = apply(s, "team", { type: "stage", id, stage: "delivered" });
  s = apply(s, "team", { type: "stage", id, stage: "completed" });
  rejected(s, "member", { type: "reopen", id, reason: "Correction" });
  rejected(s, "team", { type: "reopen", id, reason: " " });
  s = apply(s, "team", { type: "assign", id, assigned: false });
  s = apply(s, "team", {
    type: "reopen",
    id,
    reason: "Vérification complémentaire convenue",
  });
  assert.equal(
    s.cases[0].partner,
    false,
    "Reopening never restores a revoked assignment",
  );
  assert.equal(s.cases[0].payment, "paid");
  assert.equal(total(s.cases[0]), 39);
  assert.equal(openTasks(s, id).length, 1);
  assert.deepEqual(
    s.cases[0].decisions.map((e) => e.kind),
    ["correction", "reopen"],
  );
  assert.equal(s.cases[0].history.filter((x) => x === "inprogress").length, 3);
});

test("Read state is role-specific, scoped to a visible thread and never consumes later messages", () => {
  let s = initialState();
  assert.equal(unreadMessages(s, "member").length, 1);
  assert.equal(unreadMessages(s, "team").length, 0);
  s = apply(s, "team", {
    type: "message",
    id: "DEMO-001",
    body: "Nouvelle précision",
  });
  s = apply(s, "member", {
    type: "message-read",
    id: "DEMO-001",
    through: "message-1",
  });
  assert.equal(unreadMessages(s, "member").length, 1);
  assert.equal(unreadMessages(s, "partner").length, 2);
  rejected(s, "member", {
    type: "message-read",
    id: "DEMO-002",
    through: "message-1",
  });
  rejected(s, "partner", {
    type: "message-read",
    id: "DEMO-002",
    through: "message-1",
  });
  s = apply(s, "member", {
    type: "message-read",
    id: "DEMO-001",
    through: "message-2",
  });
  assert.equal(unreadMessages(s, "member").length, 0);
  s = apply(s, "member", {
    type: "message",
    id: "DEMO-001",
    body: "Bien reçu",
  });
  assert.equal(unreadMessages(s, "member").length, 0);
  assert.equal(unreadMessages(s, "team").length, 1);
  s = apply(s, "team", { type: "partner-access", enabled: false });
  assert.equal(unreadMessages(s, "partner").length, 0);
  rejected(s, "partner", {
    type: "message-read",
    id: "DEMO-001",
    through: "message-3",
  });
  s = apply(s, "team", { type: "partner-access", enabled: true });
  assert.equal(unreadMessages(s, "partner").length, 3);
});

test("Drafts stay separate by role and dossier, survive failed sends and clear only after a successful message", () => {
  let s = initialState();
  const audit = s.audit.length;
  s = apply(s, "member", {
    type: "message-draft",
    id: "DEMO-001",
    body: "Brouillon A\nà conserver",
  });
  s = apply(s, "member", {
    type: "message-draft",
    id: "DEMO-002",
    body: "Brouillon B",
  });
  s = apply(s, "team", {
    type: "message-draft",
    id: "DEMO-001",
    body: "Brouillon équipe",
  });
  assert.equal(
    s.audit.length,
    audit,
    "Typing does not flood the operational audit",
  );
  assert.equal(s.messages.length, 1);
  rejected(s, "member", { type: "message", id: "DEMO-001", body: " " });
  rejected(s, "member", {
    type: "message-draft",
    id: "DEMO-001",
    body: "x".repeat(2001),
  });
  assert.equal(s.drafts.member["DEMO-001"], "Brouillon A\nà conserver");
  s = apply(s, "member", {
    type: "message",
    id: "DEMO-001",
    body: s.drafts.member["DEMO-001"],
  });
  assert.equal(s.drafts.member["DEMO-001"], "");
  assert.equal(s.drafts.member["DEMO-002"], "Brouillon B");
  assert.equal(s.drafts.team["DEMO-001"], "Brouillon équipe");
  s = apply(s, "team", { type: "assign", id: "DEMO-001", assigned: false });
  rejected(s, "partner", {
    type: "message-draft",
    id: "DEMO-001",
    body: "Interdit",
  });
  assert.deepEqual(initialState().drafts, {
    member: {},
    team: {},
    partner: {},
  });
});

test("Attention distinguishes pieces to provide from pieces awaiting team review and updates when decisions change", () => {
  let s = initialState();
  const has = (role, kind, id = "DEMO-002") =>
    attentionItems(s, role).some((a) => a.kind === kind && a.caseId === id);
  assert.ok(has("member", "approve"));
  assert.ok(has("member", "provide"));
  assert.equal(has("team", "approve"), false);
  s = apply(s, "member", {
    type: "document",
    id: "DEMO-002",
    name: "Pièce démo",
    requirement: "need-1",
  });
  assert.equal(has("member", "provide"), false);
  assert.ok(has("team", "review-documents"));
  s = apply(s, "team", {
    type: "document-review",
    id: s.documents.at(-1).id,
    review: "rejected",
    reason: "Version à compléter",
  });
  assert.ok(has("member", "correct-documents"));
  assert.equal(has("team", "review-documents"), false);
  s = apply(s, "member", { type: "accept-quote", id: "DEMO-002", version: 1 });
  assert.ok(has("member", "pay"));
  assert.equal(has("member", "approve"), false);
  s = apply(s, "member", { type: "pay", id: "DEMO-002", result: "pending" });
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-002",
    reason: "Pause",
  });
  assert.ok(has("team", "cancellation"));
  assert.ok(has("member", "payment-result"));
  assert.equal(has("member", "correct-documents"), false);
  assert.equal(has("member", "pay"), false);
});

test("Attention never exposes other partner dossiers and keeps original returns visible after closure", () => {
  let s = initialState();
  assert.ok(attentionItems(s, "partner").every((a) => a.caseId === "DEMO-001"));
  assert.ok(attentionItems(s, "partner").some((a) => a.kind === "tasks"));
  assert.equal(
    attentionItems(s, "partner").some((a) => a.kind === "deliver"),
    false,
  );
  s = apply(s, "partner", {
    type: "task-update",
    id: "task-1",
    status: "done",
    note: "",
  });
  assert.ok(attentionItems(s, "partner").some((a) => a.kind === "deliver"));
  s = apply(s, "team", { type: "stage", id: "DEMO-001", stage: "delivered" });
  assert.ok(
    attentionItems(s, "member").some((a) => a.kind === "review-delivery"),
  );
  s = apply(s, "team", { type: "stage", id: "DEMO-001", stage: "completed" });
  assert.ok(
    attentionItems(s, "team").some((a) => a.kind === "return-originals"),
  );
  s = apply(s, "team", { type: "custody", id: "doc-2", custody: "returned" });
  assert.equal(
    attentionItems(s, "team").some((a) => a.kind === "return-originals"),
    false,
  );
  s = apply(s, "team", { type: "partner-access", enabled: false });
  assert.deepEqual(attentionItems(s, "partner"), []);
});

test("A revised proposal retains its original scope and amounts, and only the current version can be accepted", () => {
  let s = initialState();
  const id = "DEMO-002";
  const original = structuredClone(s.cases[1].proposals[0]);
  rejected(s, "member", { type: "stage", id, stage: "approved" });
  rejected(s, "member", { type: "accept-quote", id, version: 2 });
  rejected(s, "partner", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Revoir",
  });
  s = apply(s, "member", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Ajouter le classement des copies",
  });
  const pendingSnapshot = s;
  assert.equal(s.cases[1].stage, "review");
  assert.equal(
    attentionItems(s, "member").some(
      (a) => a.caseId === id && a.kind === "approve",
    ),
    false,
  );
  assert.ok(
    attentionItems(s, "team").some(
      (a) => a.caseId === id && a.kind === "scope",
    ),
  );
  rejected(s, "member", { type: "accept-quote", id, version: 1 });
  rejected(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "team", {
    type: "quote",
    id,
    scope: "Organisation et classement des copies — démo",
    exclusions: "Conditions à confirmer",
    quote: 140,
    fees: 10,
    thirdParty: 5,
  });
  const c = s.cases[1];
  assert.equal(c.proposals.length, 2);
  assert.equal(c.proposals[0].status, "superseded");
  assert.equal(c.proposals[0].scope, original.scope);
  assert.equal(c.proposals[0].quote, original.quote);
  assert.equal(
    c.proposals[0].revisionReason,
    "Ajouter le classement des copies",
  );
  assert.equal(
    pendingSnapshot.cases[1].proposals[0].status,
    "revision-requested",
    "Earlier state is immutable",
  );
  rejected(s, "member", { type: "accept-quote", id, version: 1 });
  rejected(s, "team", { type: "accept-quote", id, version: 2 });
  s = apply(s, "member", { type: "accept-quote", id, version: 2 });
  assert.equal(s.cases[1].proposals[1].status, "accepted");
  assert.equal(total(s.cases[1]), 155);
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  s = apply(s, "member", { type: "pay", id, result: "paid" });
  assert.equal(s.cases[1].proposals[1].scope, c.proposals[1].scope);
});

test("Proposal revision requires a reason, pauses with cancellation, and cannot rewrite an accepted agreement", () => {
  let s = initialState();
  const id = "DEMO-002";
  rejected(s, "member", { type: "revise-quote", id, version: 1, reason: " " });
  rejected(s, "team", {
    type: "revise-quote",
    id,
    version: 7,
    reason: "Obsolète",
  });
  s = apply(s, "member", { type: "cancel-request", id, reason: "Pause" });
  rejected(s, "member", { type: "accept-quote", id, version: 1 });
  rejected(s, "team", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Revoir",
  });
  s = apply(s, "member", { type: "cancel-withdraw", id });
  s = apply(s, "member", { type: "accept-quote", id, version: 1 });
  const accepted = structuredClone(s.cases[1].proposals);
  rejected(s, "member", { type: "accept-quote", id, version: 1 });
  rejected(s, "team", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Hausse",
  });
  rejected(s, "team", {
    type: "quote",
    id,
    scope: "Autre",
    exclusions: "",
    quote: 999,
    fees: 0,
    thirdParty: 0,
  });
  s = apply(s, "member", { type: "pay", id, result: "pending" });
  rejected(s, "member", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Changer",
  });
  s = apply(s, "member", { type: "pay", id, result: "failed" });
  assert.deepEqual(s.cases[1].proposals, accepted);
});

test("The team can withdraw an unaccepted version, but publishing requires a valid scope and amounts", () => {
  let s = initialState();
  const id = "DEMO-002";
  s = apply(s, "team", {
    type: "revise-quote",
    id,
    version: 1,
    reason: "Préciser le périmètre",
  });
  const proposal = {
    type: "quote",
    id,
    scope: "Périmètre démo",
    exclusions: "",
    quote: 125,
    fees: 0,
    thirdParty: 0,
  };
  rejected(s, "member", proposal);
  rejected(s, "team", { ...proposal, scope: " " });
  rejected(s, "team", { ...proposal, scope: "a".repeat(4001) });
  rejected(s, "team", { ...proposal, exclusions: "a".repeat(2001) });
  rejected(s, "team", { ...proposal, fees: -1 });
  s = apply(s, "team", proposal);
  assert.equal(s.cases[1].proposals[0].revisionBy, "team");
  assert.equal(s.cases[1].proposals[1].version, 2);
  assert.ok(
    attentionItems(s, "member").some(
      (a) => a.caseId === id && a.kind === "approve",
    ),
  );
});

test("Restarting a cancelled need never carries a proposal or its agreement into the new case", () => {
  let s = initialState();
  const id = "DEMO-001";
  const accepted = structuredClone(s.cases[0].proposals);
  s = apply(s, "member", {
    type: "cancel-request",
    id,
    reason: "Arrêt du besoin",
  });
  s = apply(s, "team", {
    type: "cancel-decision",
    id,
    confirm: true,
    reason: "",
  });
  s = apply(s, "member", { type: "restart", id });
  assert.deepEqual(s.cases.at(-1).proposals, []);
  assert.deepEqual(s.cases[0].proposals, accepted);
  rejected(s, "member", {
    type: "accept-quote",
    id: s.cases.at(-1).id,
    version: 1,
  });
  rejected(s, "member", {
    type: "pay",
    id: s.cases.at(-1).id,
    result: "pending",
  });
});
