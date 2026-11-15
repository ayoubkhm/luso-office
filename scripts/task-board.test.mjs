import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  initialState,
  transition,
  matchingTasks,
  taskTiming,
  taskSummary,
  Tasks,
  WorkspaceContext,
  services,
} from "../.ssr/entry-server.js";

const today = "2026-12-28";
const apply = (s, role, action) => {
  const r = transition(s, role, action);
  assert.equal(r.ok, true, action.type);
  return r.state;
};
const add = (s, title, due, caseId = "DEMO-001", assignee = "team") =>
  apply(s, "team", { type: "task-create", id: caseId, title, due, assignee });

test("Task timing uses calendar-day boundaries and never treats finished or paused work as overdue", () => {
  const s = initialState();
  const task = s.tasks[0];
  for (const [due, expected] of [
    ["2026-12-27", "overdue"],
    [today, "today"],
    ["2026-12-29", "upcoming"],
    ["2027-01-04", "upcoming"],
    ["2027-01-05", "later"],
    ["", "undated"],
  ]) {
    assert.equal(taskTiming(s, { ...task, due }, today), expected);
  }
  assert.equal(
    taskTiming(s, { ...task, due: "2024-03-01" }, "2024-02-23"),
    "upcoming",
    "Leap day must count as a calendar day",
  );
  assert.equal(
    taskTiming(s, { ...task, due: "2026-03-30" }, "2026-03-23"),
    "upcoming",
    "DST does not change the seven-day window",
  );
  assert.equal(
    taskTiming(s, { ...task, status: "done", due: "2020-01-01" }, today),
    "done",
  );
  const paused = apply(s, "member", {
    type: "cancel-request",
    id: task.caseId,
    reason: "Demo",
  });
  assert.equal(
    taskTiming(paused, { ...task, due: "2020-01-01" }, today),
    "paused",
  );
});

test("Task search combines accents, localized service, case, assignee and deadline while preserving role boundaries", () => {
  let s = add(
    initialState(),
    "Vérifier les accès",
    today,
    "DEMO-001",
    "partner",
  );
  const wanted = s.tasks.at(-1).id;
  s = add(s, "Vérifier les accès équipe", today);
  s = add(s, "Vérifier les accès autre dossier", today, "DEMO-002");
  const filter = {
    query: " VERIFIER LES ACCES ",
    caseId: "DEMO-001",
    assignee: "partner",
    timing: "today",
    status: "open",
  };
  assert.deepEqual(
    matchingTasks(s, "team", filter, today, "fr").map((t) => t.id),
    [wanted],
  );
  assert.deepEqual(
    matchingTasks(s, "partner", filter, today, "pt").map((t) => t.id),
    [wanted],
  );
  assert.equal(
    matchingTasks(s, "partner", { caseId: "DEMO-002" }, today, "fr").length,
    0,
  );
  const service = services.find((service) => service.id === s.cases[0].service);
  assert.equal(
    matchingTasks(
      s,
      "team",
      { query: service.name.pt, caseId: "DEMO-001" },
      today,
      "pt",
    ).length,
    3,
  );
  assert.equal(
    matchingTasks(s, "team", { query: "casa da familia" }, today, "fr").length,
    4,
  );
  assert.equal(
    matchingTasks(s, "team", { ...filter, timing: "overdue" }, today, "fr")
      .length,
    0,
  );
  s = apply(s, "team", { type: "partner-access", enabled: false });
  assert.equal(matchingTasks(s, "partner", {}, today, "fr").length, 0);
  assert.deepEqual(
    taskSummary(s, matchingTasks(s, "partner", {}, today, "fr"), today),
    { open: 0, overdue: 0, today: 0, undated: 0 },
  );
});

test("Task ordering and counters follow updates, cancellation and resumption without changing source order", () => {
  let s = add(initialState(), "Plus tard", "2027-01-05");
  s = add(s, "Aujourd’hui", today);
  const current = s.tasks.at(-1).id;
  s = add(s, "Retard", "2026-12-27");
  const overdue = s.tasks.at(-1).id;
  const before = s.tasks.map((t) => t.id);
  let found = matchingTasks(s, "team", { status: "open" }, today, "fr");
  assert.deepEqual(
    found.map((t) => t.id),
    [overdue, current, "task-2", "task-1"],
  );
  assert.deepEqual(
    s.tasks.map((t) => t.id),
    before,
  );
  assert.deepEqual(taskSummary(s, found, today), {
    open: 4,
    overdue: 1,
    today: 1,
    undated: 1,
  });
  s = apply(s, "team", {
    type: "task-update",
    id: overdue,
    status: "done",
    note: "",
  });
  assert.equal(
    taskSummary(s, matchingTasks(s, "team", {}, today, "fr"), today).overdue,
    0,
  );
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-001",
    reason: "Demo",
  });
  assert.equal(
    matchingTasks(s, "team", { status: "open" }, today, "fr").length,
    0,
  );
  assert.equal(
    matchingTasks(s, "team", { status: "paused" }, today, "fr").length,
    3,
  );
  assert.equal(
    matchingTasks(s, "team", { status: "done" }, today, "fr").length,
    1,
  );
  s = apply(s, "member", { type: "cancel-withdraw", id: "DEMO-001" });
  assert.equal(
    matchingTasks(s, "team", { status: "open" }, today, "fr").length,
    3,
  );
});

function markup(state, role, caseId, lang = "fr") {
  return renderToStaticMarkup(
    createElement(
      WorkspaceContext.Provider,
      {
        value: {
          state,
          role,
          lang,
          selected: "DEMO-002",
          select() {},
          go() {},
          act() {
            return false;
          },
          t: (fr, pt) => (lang === "fr" ? fr : pt),
        },
      },
      createElement(Tasks, { caseId }),
    ),
  );
}
test("A scoped task form cannot fall back to a different case when its case is suspended or closed", () => {
  let s = initialState();
  const html = markup(s, "team", "DEMO-001");
  assert.match(html, /Ajouter la tâche/);
  assert.doesNotMatch(html, /<option[^>]*>DEMO-002<\/option>/);
  assert.match(
    html,
    /<select disabled=""><option[^>]*selected="">DEMO-001<\/option><\/select>/,
  );
  for (const role of ["member", "partner"])
    assert.doesNotMatch(markup(s, role, "DEMO-001"), /Ajouter la tâche/);
  s = apply(s, "member", {
    type: "cancel-request",
    id: "DEMO-001",
    reason: "Demo",
  });
  assert.doesNotMatch(markup(s, "team", "DEMO-001"), /Ajouter la tâche/);
  assert.match(
    markup(s, "team", undefined),
    /Ajouter la tâche/,
    "The other active case remains available in the global view",
  );
  s = apply(s, "team", {
    type: "cancel-decision",
    id: "DEMO-001",
    confirm: true,
    reason: "Demo",
  });
  assert.doesNotMatch(markup(s, "team", "DEMO-001"), /Ajouter la tâche/);
  assert.match(markup(s, "team", undefined, "pt"), /Pesquisar tarefa/);
});
