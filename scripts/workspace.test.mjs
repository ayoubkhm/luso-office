import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
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
    id,
    quote: -10,
    fees: 0,
    thirdParty: 0,
  });
  rejected(s, "team", {
    type: "quote",
    id,
    quote: 1.001,
    fees: 0,
    thirdParty: 0,
  });
  s = apply(s, "team", {
    type: "quote",
    id,
    quote: 39,
    fees: 10,
    thirdParty: 20,
  });
  assert.equal(total(s.cases.at(-1)), 69);
  rejected(s, "team", { type: "stage", id, stage: "approved" });
  s = apply(s, "member", { type: "stage", id, stage: "approved" });
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
  s = apply(s, "member", { type: "stage", id, stage: "approved" });
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
  s = apply(s, "member", { type: "stage", id, stage: "approved" });
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
