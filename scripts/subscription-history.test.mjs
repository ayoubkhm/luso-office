import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  Billing,
  WorkspaceContext,
  subscriptionSummary,
} from "../.ssr/entry-server.js";

const apply = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, true, action.type);
  return r.state;
};
function rejected(s, role, action) {
  const r = transition(s, role, action);
  assert.equal(r.ok, false);
  assert.equal(r.state, s);
}
function markup(state, role, lang = "fr") {
  return renderToStaticMarkup(
    createElement(
      WorkspaceContext.Provider,
      {
        value: {
          state,
          role,
          lang,
          selected: "DEMO-001",
          select() {},
          go() {},
          act() {
            return false;
          },
          t: (fr, pt) => (lang === "fr" ? fr : pt),
        },
      },
      createElement(Billing),
    ),
  );
}

test("Subscription attempts preserve requested terms, reference price and failed results across retries", () => {
  const initial = initialState();
  let s = apply(initial, "member", {
    type: "subscription",
    plan: "Family",
    period: "annual",
  });
  assert.deepEqual(s.subscription.attempts[0], {
    id: 1,
    plan: "Family",
    period: "annual",
    previousPlan: "Member",
    previousPeriod: "annual",
    amount: 499,
    status: "pending",
  });
  const pending = s;
  rejected(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "failed" });
  assert.equal(
    pending.subscription.attempts[0].status,
    "pending",
    "Do not mutate the prior snapshot",
  );
  assert.equal(s.subscription.plan, "Member");
  s = apply(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  assert.deepEqual(
    s.subscription.attempts.map((a) => [a.id, a.period, a.amount, a.status]),
    [
      [1, "annual", 499, "failed"],
      [2, "monthly", 49.9, "paid"],
    ],
  );
  assert.equal(s.subscription.plan, "Family");
  assert.equal(s.subscription.period, "monthly");
  assert.equal(initial.subscription.attempts.length, 0);
  rejected(s, "member", { type: "subscription-payment", result: "paid" });
});

test("No-op, invalid and unauthorized subscription changes cannot create an attempt", () => {
  const s = initialState();
  rejected(s, "member", {
    type: "subscription",
    plan: "Member",
    period: "annual",
  });
  rejected(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "weekly",
  });
  rejected(s, "member", {
    type: "subscription",
    plan: "Unknown",
    period: "annual",
  });
  rejected(s, "member", {
    type: "subscription",
    plan: "Premium",
    period: "annual",
  });
  for (const role of ["team", "partner"])
    rejected(s, role, {
      type: "subscription",
      plan: "Family",
      period: "annual",
    });
  const pending = apply(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "annual",
  });
  for (const role of ["team", "partner"])
    rejected(pending, role, { type: "subscription-payment", result: "paid" });
  const inactive = { ...s, subscription: { ...s.subscription, active: false } };
  assert.equal(
    apply(inactive, "member", {
      type: "subscription",
      plan: "Member",
      period: "annual",
    }).subscription.attempts.length,
    1,
    "An inactive plan may be activated",
  );
});

test("Pending billing renders frozen terms, team history is read-only and partners get no billing markup", () => {
  let s = initialState();
  assert.match(
    markup(s, "member"),
    /<button[^>]*disabled=""[^>]*>Préparer le paiement démo<\/button>/,
  );
  s = apply(s, "member", {
    type: "subscription",
    plan: "Family",
    period: "annual",
  });
  const html = markup(s, "member");
  assert.match(html, /Formule proposée<\/span><select disabled="">/);
  assert.match(html, /Modalité<\/span><select disabled="">/);
  assert.match(html, /<option selected="">Family<\/option>/);
  assert.match(html, /Historique des changements d’adhésion/);
  assert.match(html, /Member \/ annuel.*Family \/ annuel/);
  assert.match(markup(s, "team", "pt"), /Histórico de alterações da adesão/);
  assert.doesNotMatch(
    markup(s, "team"),
    /Simuler la confirmation|Préparer le paiement démo/,
  );
  assert.equal(markup(s, "partner"), "");
});

test("Text summaries describe only the selected attempt, carry demo disclaimers and never claim an old plan is still current", () => {
  let s = apply(initialState(), "member", {
    type: "subscription",
    plan: "Family",
    period: "annual",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  const old = s.subscription.attempts[0];
  s = apply(s, "member", {
    type: "subscription",
    plan: "Member",
    period: "monthly",
  });
  s = apply(s, "member", { type: "subscription-payment", result: "paid" });
  assert.deepEqual(s.subscription.attempts[0], old);
  const fr = subscriptionSummary(old, "fr");
  const pt = subscriptionSummary(old, "pt");
  assert.match(fr, /DEMO/);
  assert.match(fr, /ni une facture ni une preuve de paiement/);
  assert.match(fr, /Changement demandé : Family \/ annuel/);
  assert.match(fr, /Des changements ultérieurs peuvent l’avoir remplacée/);
  assert.match(pt, /não é uma fatura nem um comprovativo de pagamento/);
  assert.match(pt, /Alteração pedida : Family \/ anual/);
  assert.doesNotMatch(fr, /Changement demandé : Member/);
});
