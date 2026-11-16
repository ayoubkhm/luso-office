import { requestMessageLimit } from "../requestLimits";
import { validAction } from "./validateAction";
import { initialState, transition, type Action, type Role } from "./model";
import { demoScenarios, scenarioState, type ScenarioId } from "./scenarios";
import { viewsForRole, type View } from "./ui";
import type { CaseDestination } from "./caseRouting";
export const sessionKey = "lusooffice-demo-session-v2";
export type SessionLog = {
  version: 2;
  base: ScenarioId | null;
  events: { role: Role; action: Action }[];
};
export function restoreSession(raw: string) {
  if (raw.length > 2_000_000) throw new Error("session-size");
  const log = JSON.parse(raw) as SessionLog;
  if (
    log.version !== 2 ||
    !Array.isArray(log.events) ||
    log.events.length > 5000 ||
    (log.base !== null && !demoScenarios.some((s) => s.id === log.base))
  )
    throw new Error("session-version");
  let state = log.base ? scenarioState(log.base) : initialState();
  for (const event of log.events) {
    if (
      !event ||
      !["member", "team", "partner"].includes(event.role) ||
      !validAction(event.action)
    )
      throw new Error("session-action");
    const result = transition(state, event.role, event.action);
    if (!result.ok) throw new Error("session-transition");
    state = result.state;
  }
  return { state, log };
}
export function routeHash(
  view: View,
  role: Role,
  id?: string,
  destination?: CaseDestination,
) {
  const p = new URLSearchParams({ view, role });
  if (id) p.set("case", id);
  if (destination) {
    p.set("section", destination.section);
    if (destination.tasks) p.set("tasks", destination.tasks);
  }
  return "#" + p.toString();
}
export function readWorkspaceRoute(hash: string) {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const role: Role =
    p.get("role") === "team"
      ? "team"
      : p.get("role") === "partner"
        ? "partner"
        : "member";
  const candidate = p.get("view") as View;
  const view = viewsForRole(role).includes(candidate) ? candidate : "overview";
  const section = p.get("section");
  const destination = ["progress", "proposal", "decisions", "team"].includes(
    section || "",
  )
    ? ({
        section,
        ...(p.get("tasks") === "all" || p.get("tasks") === "open"
          ? { tasks: p.get("tasks") }
          : {}),
      } as CaseDestination)
    : undefined;
  const id = p.get("case") || undefined;
  return { view, role, id, destination };
}
export const handoffKey = "lusooffice-demo-request";
export type RequestHandoff = {
  version: 1;
  service: string;
  description: string;
  name: string;
  country: string;
  plan?: string;
  currency?: "EUR" | "GBP" | "CHF" | "USD";
};
export function readHandoff(raw: string): RequestHandoff | null {
  try {
    const d = JSON.parse(raw);
    return d.version === 1 &&
      typeof d.service === "string" &&
      typeof d.description === "string" &&
      d.description.length <= requestMessageLimit &&
      typeof d.name === "string" &&
      d.name.length <= 100 &&
      typeof d.country === "string"
      ? d
      : null;
  } catch {
    return null;
  }
}
