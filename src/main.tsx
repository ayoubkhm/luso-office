import { createRoot } from "react-dom/client";
import { App } from "./App";
import { route } from "./routes";
import "./styles.css";
const current = route(location.pathname, location.search);
if (location.pathname.endsWith("/tarifs.html"))
  location.replace(
    (current.lang === "fr" ? "/" : `/${current.lang}/`) +
      "adhesion.html" +
      location.search +
      location.hash,
  );
else
  createRoot(document.getElementById("root")!).render(
    <App {...current} search={location.search} />,
  );
