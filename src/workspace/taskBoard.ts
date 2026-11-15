import { services, type Lang } from "../catalogue";
import {
  canWork,
  visibleTasks,
  type State,
  type Role,
  type Task,
} from "./model";

export type TaskTiming =
  | "overdue"
  | "today"
  | "upcoming"
  | "later"
  | "undated"
  | "paused"
  | "done";
export type TaskFilters = {
  query?: string;
  caseId?: string;
  assignee?: string;
  status?: string;
  timing?: string;
};
export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function taskTiming(
  state: State,
  task: Task,
  today: string,
): TaskTiming {
  if (task.status === "done") return "done";
  const c = state.cases.find((c) => c.id === task.caseId);
  if (!c || !canWork(c)) return "paused";
  if (!task.due) return "undated";
  if (task.due < today) return "overdue";
  if (task.due === today) return "today";
  // ISO calendar days, without local daylight-saving shifts.
  const days =
    (Date.parse(`${task.due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
    86400000;
  return days <= 7 ? "upcoming" : "later";
}

export function matchingTasks(
  state: State,
  role: Role,
  filters: TaskFilters,
  today: string,
  lang: Lang,
) {
  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  return visibleTasks(state, role)
    .filter((task) => {
      const c = state.cases.find((c) => c.id === task.caseId)!;
      const timing = taskTiming(state, task, today);
      return (
        (!filters.caseId ||
          filters.caseId === "all" ||
          task.caseId === filters.caseId) &&
        (!filters.assignee ||
          filters.assignee === "all" ||
          task.assignee === filters.assignee) &&
        (!filters.status ||
          filters.status === "all" ||
          (filters.status === "open"
            ? !["done", "paused"].includes(timing)
            : filters.status === "paused"
              ? timing === "paused"
              : task.status === filters.status)) &&
        (!filters.timing ||
          filters.timing === "all" ||
          timing === filters.timing) &&
        norm(
          [
            task.title,
            task.caseId,
            services.find((s) => s.id === c.service)?.name[lang],
            state.properties.find((p) => p.id === c.property)?.name,
          ].join(" "),
        ).includes(norm(filters.query ?? ""))
      );
    })
    .sort(
      (a, b) =>
        (a.due || "9999-99-99").localeCompare(b.due || "9999-99-99") ||
        a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
}

export function taskSummary(state: State, tasks: Task[], today: string) {
  const timings = tasks.map((task) => taskTiming(state, task, today));
  return {
    open: timings.filter((t) => t !== "done" && t !== "paused").length,
    overdue: timings.filter((t) => t === "overdue").length,
    today: timings.filter((t) => t === "today").length,
    undated: timings.filter((t) => t === "undated").length,
  };
}
