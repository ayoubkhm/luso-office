import type { Action, Role, State } from "./model";
export type View =
  | "guide"
  | "settlements"
  | "overview"
  | "requests"
  | "properties"
  | "documents"
  | "messages"
  | "billing"
  | "profile"
  | "newsletter"
  | "admin"
  | "tasks";
export function viewsForRole(role: Role): View[] {
  return role === "member"
    ? [
        "overview",
        "guide",
        "requests",
        "tasks",
        "properties",
        "documents",
        "messages",
        "billing",
        "settlements",
        "newsletter",
        "profile",
      ]
    : role === "team"
      ? [
          "overview",
          "guide",
          "requests",
          "tasks",
          "documents",
          "messages",
          "billing",
          "settlements",
          "newsletter",
          "admin",
          "profile",
        ]
      : [
          "overview",
          "guide",
          "requests",
          "tasks",
          "documents",
          "messages",
          "profile",
        ];
}

export function viewsForActor(state: State, role: Role): View[] {
  if (role !== "team") return viewsForRole(role);
  const person = state.people.find((p) => p.id === state.operatorId);
  if (!person?.enabled) return ["overview"];
  if (person?.kind === "editor") return ["newsletter", "profile"];
  if (person?.kind === "operator")
    return [
      "overview",
      "requests",
      "tasks",
      "documents",
      "messages",
      "profile",
    ];
  return viewsForRole(role);
}

export const canAccessView = (state: State, role: Role, view: View) =>
  viewsForActor(state, role).includes(view);

// UI routes and model actions share the same actor policy. Domain-specific
// checks (ownership, case stage, amounts) remain in the model transition.
export function canPerformAction(state: State, role: Role, action: Action) {
  if (role !== "team" || action.type === "actor-select") return true;
  const actor = state.people.find((p) => p.id === state.operatorId);
  if (!actor?.enabled) return false;
  const editorial: Action["type"][] = [
    "edition",
    "edition-draft",
    "edition-review",
    "publish",
    "queue",
    "dispatch",
    "cancel-campaign",
    "next-edition",
  ];
  if (actor.kind === "editor") return editorial.includes(action.type);
  if (actor.kind === "admin") return true;
  const operational: Action["type"][] = [
    "client-select",
    "stage",
    "quote",
    "assign",
    "cancel-decision",
    "correction",
    "reopen",
    "note",
    "requirement",
    "document",
    "document-review",
    "document-replace",
    "share",
    "custody",
    "task-create",
    "task-update",
    "task-assign",
    "message",
    "message-draft",
    "message-read",
  ];
  return actor.kind === "operator" && operational.includes(action.type);
}
