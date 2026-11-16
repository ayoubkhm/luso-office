import { createRoot } from "react-dom/client";
import { App } from "./App";
import { languageHref, route } from "./routes";
import { publicCopy } from "./publicCopy";
import "./styles.css";
import { entryLanguageRedirect, readLanguagePreference } from "./languagePreference";
const languageRedirect = entryLanguageRedirect(
  location.pathname,
  location.search,
  location.hash,
  readLanguagePreference(),
  navigator.languages?.length ? navigator.languages : [navigator.language],
);
const current = route(location.pathname, location.search);
if (languageRedirect) location.replace(languageRedirect);
else if (location.pathname.endsWith("/tarifs.html"))
  location.replace(languageHref("membership", current.lang, location.search, location.hash));
else if (current.page === "workspace") {
  const container = document.getElementById("root")!;
  const status = document.createElement("p");
  status.className = "workspace-loading";
  status.setAttribute("role", "status");
  status.textContent = publicCopy[current.lang].workspaceLoading;
  container.setAttribute("aria-busy", "true");
  container.before(status);
  import("./workspace/Workspace")
    .then(({ Workspace }) => {
      createRoot(container).render(<Workspace lang={current.lang} />);
      container.removeAttribute("aria-busy");
      status.remove();
    })
    .catch(() => {
      container.removeAttribute("aria-busy");
      status.setAttribute("role", "alert");
      status.textContent = publicCopy[current.lang].workspaceLoadError + " ";
      const retry = document.createElement("button");
      retry.className = "button secondary";
      retry.textContent = publicCopy[current.lang].retryLoading;
      retry.onclick = () => location.reload();
      status.append(retry);
    });
} else
  createRoot(document.getElementById("root")!).render(
    <App page={current.page} lang={current.lang} search={location.search} />,
  );
