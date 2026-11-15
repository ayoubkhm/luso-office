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
