import { renderToString } from "react-dom/server";
import { App } from "./App";
import type { Lang } from "./catalogue";
import {
  pageNames,
  files,
  titles,
  descriptions,
  href,
  type Page,
} from "./routes";
export { pageNames, files, titles, descriptions, href };
export { services, areas, plans, filterServices, price } from "./catalogue";
export { requestText, route } from "./routes";
export const render = (page: Page, lang: Lang) =>
  renderToString(<App page={page} lang={lang} />);

export * from "./workspace/model";

export * from "./workspace/scenarios";
export { matchingActivity } from "./workspace/activity";
export { CaseDetail } from "./workspace/Workspace";
export { WorkspaceContext } from "./workspace/ui";
export { Tasks } from "./workspace/Operations";
export { matchingTasks, taskTiming, taskSummary } from "./workspace/taskBoard";
export { Documents } from "./workspace/Documents";
export { matchingDocuments } from "./workspace/documentBoard";
export { Billing } from "./workspace/Workspace";
export { subscriptionSummary } from "./workspace/SubscriptionHistory";
export { Newsletter } from "./workspace/Newsletter";
