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
