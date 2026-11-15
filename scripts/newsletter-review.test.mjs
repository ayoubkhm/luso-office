import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  editionDirty,
  Newsletter,
  WorkspaceContext,
} from "../.ssr/entry-server.js";

const content = {
  title: "Édition fictive",
  excerpt: "Extrait fictif",
  sections: ["Un", "Deux", "Trois", "Quatre"],
};
const apply = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, true, action.type);
  return r.state;
};
const rejected = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, false, action.type);
  assert.equal(r.state, s);
};
const saveReview = (s) =>
  apply(s, "team", {
    type: "edition",
    edition: { ...s.editionDraft, status: "review" },
  });
const approve = (s) =>
  apply(s, "team", {
    type: "edition-review",
    revision: s.editionRevision,
    confirmed: true,
  });
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
      createElement(Newsletter),
    ),
  );
}

test("Newsletter input survives remounting, stays private to the team and does not flood activity", () => {
  const initial = initialState();
  const s = apply(initial, "team", {
    type: "edition-draft",
    content: { ...content, title: "UNSAVED_EDITOR_TEXT" },
  });
  assert.equal(editionDirty(s), true);
  assert.equal(s.edition.title, initial.edition.title);
  assert.equal(s.audit.length, initial.audit.length);
  assert.match(markup(s, "team"), /value="UNSAVED_EDITOR_TEXT"/);
  assert.match(markup(s, "team", "pt"), /value="UNSAVED_EDITOR_TEXT"/);
  assert.doesNotMatch(markup(s, "member"), /UNSAVED_EDITOR_TEXT/);
  assert.equal(markup(s, "partner"), "");
  assert.equal(editionDirty(initial), false);
});

test("Publication requires approval of the exact saved version and edits revoke that approval", () => {
  let s = saveReview(
    apply(initialState(), "team", { type: "edition-draft", content }),
  );
  const originalRevision = s.editionRevision;
  rejected(s, "team", { type: "publish" });
  assert.match(
    markup(s, "team"),
    /<button[^>]*disabled=""[^>]*>Simuler la publication<\/button>/,
  );
  s = approve(s);
  s = apply(s, "team", {
    type: "edition-draft",
    content: { ...content, title: "Version modifiée" },
  });
  assert.equal(s.reviewedEditionRevision, undefined);
  rejected(s, "team", { type: "publish" });
  rejected(s, "team", {
    type: "edition-review",
    revision: originalRevision,
    confirmed: true,
  });
  s = saveReview(s);
  rejected(s, "team", {
    type: "edition-review",
    revision: originalRevision,
    confirmed: true,
  });
  s = approve(s);
  s = apply(s, "team", {
    type: "edition-review",
    revision: s.editionRevision,
    confirmed: false,
  });
  rejected(s, "team", { type: "publish" });
  s = apply(approve(s), "team", { type: "publish" });
  assert.equal(s.edition.title, "Version modifiée");
  assert.match(markup(s, "member"), /Version modifiée/);
});

test("Restoring saved text still requires review; published editions and archives cannot be changed by typing", () => {
  let s = saveReview(
    apply(initialState(), "team", { type: "edition-draft", content }),
  );
  s = approve(s);
  s = apply(s, "team", {
    type: "edition-draft",
    content: { ...content, excerpt: "Modification à abandonner" },
  });
  s = apply(s, "team", { type: "edition-draft", content: s.edition });
  assert.equal(editionDirty(s), false);
  rejected(s, "team", { type: "publish" });
  s = apply(approve(s), "team", { type: "publish" });
  const revision = s.editionRevision;
  const published = structuredClone(s.edition);
  rejected(s, "team", {
    type: "edition-draft",
    content: { ...content, title: "Overwrite" },
  });
  s = apply(s, "team", { type: "next-edition" });
  assert.equal(s.reviewedEditionRevision, undefined);
  assert.equal(editionDirty(s), false);
  assert.deepEqual(s.editionDraft.sections, ["", "", "", ""]);
  s = saveReview(
    apply(s, "team", {
      type: "edition-draft",
      content: { ...content, title: "Édition suivante" },
    }),
  );
  assert.ok(s.editionRevision > revision);
  rejected(s, "team", { type: "edition-review", revision, confirmed: true });
  assert.deepEqual(s.archives[0].edition, published);
});

test("Draft and review transitions enforce role, size and independent snapshots", () => {
  let s = initialState();
  for (const role of ["member", "partner"])
    rejected(s, role, { type: "edition-draft", content });
  rejected(s, "team", {
    type: "edition-draft",
    content: { ...content, title: "x".repeat(151) },
  });
  rejected(s, "team", {
    type: "edition-draft",
    content: { ...content, sections: ["A"] },
  });
  rejected(s, "team", {
    type: "edition",
    edition: { ...content, excerpt: "x".repeat(601), status: "review" },
  });
  const input = structuredClone(content);
  s = apply(s, "team", { type: "edition-draft", content: input });
  input.sections[0] = "MUTATED";
  assert.equal(s.editionDraft.sections[0], "Un");
  s = saveReview(s);
  assert.notEqual(s.edition.sections, s.editionDraft.sections);
  for (const role of ["member", "partner"])
    rejected(s, role, {
      type: "edition-review",
      revision: s.editionRevision,
      confirmed: true,
    });
});
