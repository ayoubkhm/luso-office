import type { Action, AttentionItem, Case, Role } from "./model";

export type CaseSectionName = "progress" | "proposal" | "decisions" | "team";
export type CaseDestination = {
  section: CaseSectionName;
  tasks?: "open" | "all";
};
export type CaseIntent = {
  caseId: string;
  role: Role;
  token: number;
  context: string;
  destination: CaseDestination;
};
export const caseNavigationContext = (c: Case) =>
  `${c.stage}:${Boolean(c.cancellation)}:${Boolean(c.cancellation && c.payment === "pending")}`;

export function attentionDestination(
  item: AttentionItem,
  c: Case,
): CaseDestination | undefined {
  if (item.target !== "requests") return undefined;
  switch (item.kind) {
    case "tasks":
      return { section: "progress", tasks: "open" };
    case "approve":
    case "pay":
    case "payment-result":
      return { section: "proposal" };
    case "cancellation":
    case "review-delivery":
      return { section: "decisions" };
    case "scope":
      return { section: c.stage === "submitted" ? "progress" : "proposal" };
    default:
      return { section: "progress" };
  }
}

export function activityDestination(
  type: Action["type"],
): CaseDestination | undefined {
  switch (type) {
    case "quote":
    case "accept-quote":
    case "revise-quote":
    case "pay":
      return { section: "proposal" };
    case "cancel-request":
    case "cancel-withdraw":
    case "cancel-decision":
    case "delivery-accept":
    case "correction":
    case "reopen":
      return { section: "decisions" };
    case "assign":
    case "note":
      return { section: "team" };
    case "task-create":
    case "task-update":
    case "task-assign":
      return { section: "progress", tasks: "all" };
    case "request":
    case "restart":
    case "stage":
      return { section: "progress" };
    default:
      return undefined;
  }
}

export function applicableCaseIntent(
  intent: CaseIntent | undefined,
  c: Case,
  role: Role,
): CaseIntent | undefined {
  if (
    !intent ||
    intent.caseId !== c.id ||
    intent.role !== role ||
    intent.context !== caseNavigationContext(c)
  )
    return undefined;
  if (role === "partner" && intent.destination.section !== "progress")
    return undefined;
  if (role !== "team" && intent.destination.section === "team")
    return undefined;
  return intent;
}
