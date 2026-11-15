import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  matchingDocuments,
  attentionItems,
  Documents,
  WorkspaceContext,
  services,
} from "../.ssr/entry-server.js";

const apply = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, true, action.type);
  return r.state;
};
function markup(state, role, selected, lang = "fr") {
  return renderToStaticMarkup(
    createElement(
      WorkspaceContext.Provider,
      {
        value: {
          state,
          role,
          lang,
          selected,
          select() {},
          go() {},
          act() {
            return false;
          },
          t: (fr, pt) => (lang === "fr" ? fr : pt),
        },
      },
      createElement(Documents),
    ),
  );
}

test("Document filters combine title, case, status, custody and explicit sharing without widening partner access", () => {
  let s = initialState();
  assert.deepEqual(
    matchingDocuments(
      s,
      "team",
      {
        caseId: "DEMO-001",
        query: "AUTORISATION",
        review: "accepted",
        custody: "received",
        sharing: "private",
      },
      "fr",
    ).map((d) => d.id),
    ["doc-2"],
  );
  assert.equal(
    matchingDocuments(s, "partner", { custody: "received" }, "fr").length,
    0,
  );
  assert.equal(
    matchingDocuments(s, "partner", { sharing: "private" }, "fr").length,
    0,
  );
  assert.equal(
    matchingDocuments(s, "team", { query: "casa da familia" }, "pt").length,
    2,
  );
  assert.equal(
    matchingDocuments(
      s,
      "team",
      {
        query: services.find((service) => service.id === s.cases[0].service)
          .name.pt,
      },
      "pt",
    ).length,
    2,
  );
  s = apply(s, "team", { type: "share", id: "doc-2", shared: true });
  assert.equal(
    matchingDocuments(s, "partner", { custody: "received" }, "pt").length,
    1,
  );
  s = apply(s, "team", { type: "assign", id: "DEMO-001", assigned: false });
  assert.equal(matchingDocuments(s, "partner", {}, "fr").length, 0);
  assert.equal(
    matchingDocuments(s, "team", { sharing: "shared" }, "fr").length,
    2,
  );
  assert.match(
    markup(s, "team", "DEMO-001"),
    /aucun partenaire n’a actuellement accès/,
  );
});

test("The missing-piece action opens Documents and the deposit stays linked through review and replacement", () => {
  let s = initialState();
  const action = attentionItems(s, "member").find((a) => a.kind === "provide");
  assert.equal(action.target, "documents");
  const html = markup(s, "member", action.caseId);
  assert.match(html, /Pièces attendues pour ce dossier/);
  assert.match(html, /<option value="need-1">/);
  assert.match(html, /Ce dépôt répond à/);
  s = apply(s, "member", {
    type: "document",
    id: action.caseId,
    name: "Pièce fictive",
    requirement: "need-1",
  });
  const id = s.documents.at(-1).id;
  assert.equal(
    attentionItems(s, "member").some((a) => a.kind === "provide"),
    false,
  );
  assert.deepEqual(
    matchingDocuments(
      s,
      "team",
      { review: "pending", query: "pieces disponibles" },
      "fr",
    ).map((d) => d.id),
    [id],
  );
  assert.doesNotMatch(
    markup(s, "member", action.caseId),
    /<option value="need-1">/,
    "A supplied requirement cannot be deposited twice",
  );
  s = apply(s, "team", {
    type: "document-review",
    id,
    review: "rejected",
    reason: "Compléter l’exemple",
  });
  assert.equal(
    matchingDocuments(s, "member", { review: "rejected" }, "fr").length,
    1,
  );
  s = apply(s, "member", {
    type: "document-replace",
    id,
    name: "Pièce corrigée",
  });
  assert.equal(
    matchingDocuments(s, "member", { review: "rejected" }, "fr").length,
    0,
  );
  assert.equal(s.documents.at(-1).requirement, "need-1");
  assert.equal(s.documents.at(-1).revisions.length, 1);
});

test("Closed-case documents remain searchable for original return without offering a deposit in another case", () => {
  let s = initialState();
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-001",
    reason: "Demo",
  });
  s = apply(s, "team", {
    type: "cancel-decision",
    id: "DEMO-001",
    confirm: true,
    reason: "Demo",
  });
  const html = markup(s, "team", "DEMO-001");
  assert.doesNotMatch(html, /Ajouter le document d’exemple/);
  assert.match(html, /Simuler la restitution de l’original/);
  assert.doesNotMatch(html, /Simuler la réception de l’original/);
  assert.deepEqual(
    matchingDocuments(
      s,
      "team",
      { custody: "received", caseId: "DEMO-001" },
      "fr",
    ).map((d) => d.id),
    ["doc-2"],
  );
  s = apply(s, "team", { type: "custody", id: "doc-2", custody: "returned" });
  assert.equal(
    matchingDocuments(s, "team", { custody: "received" }, "fr").length,
    0,
  );
  assert.equal(
    matchingDocuments(s, "team", { custody: "returned" }, "fr").length,
    1,
  );
});

test("Document center renders both languages and keeps private needs and originals out of the partner view", () => {
  let s = initialState();
  s = apply(s, "team", {
    type: "requirement",
    id: "DEMO-001",
    label: "PRIVATE_REQUIREMENT",
  });
  for (const lang of ["fr", "pt"]) {
    const partner = markup(s, "partner", "DEMO-001", lang);
    assert.doesNotMatch(
      partner,
      /PRIVATE_REQUIREMENT|Autorisation \/ Autorização/,
    );
    assert.doesNotMatch(partner, /name="requirement"|type="file"/);
    assert.match(
      partner,
      lang === "fr" ? /Rechercher une pièce/ : /Pesquisar documento/,
    );
    const member = markup(s, "member", "DEMO-001", lang);
    assert.match(member, /PRIVATE_REQUIREMENT/);
    assert.match(member, /name="requirement"/);
    assert.doesNotMatch(member, /type="file"/);
  }
});
