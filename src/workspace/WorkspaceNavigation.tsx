import { useRef, useState } from "react";
import { unreadMessages } from "./model";
import { viewsForActor } from "./permissions";
import { labels, navigationGroups, useWorkspace, type View } from "./ui";

const paths: Record<View, string> = {
  overview: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  requests: "M3 7h7l2 2h9v11H3ZM3 7V4h7l2 3",
  tasks: "m4 6 2 2 3-4m-5 9 2 2 3-4M13 6h7M13 13h7M4 20h16",
  documents: "M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6",
  messages: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
  properties: "M3 10 9 5l6 5v11H5V9m10-2 4-2 3 3v13h-7M8 21v-6h4v6",
  billing: "M3 5h18v14H3ZM3 9h18M6 15h4",
  settlements: "M4 4h16v16H4ZM8 8h8M8 12h3M8 16h3m3-3 1 1 3-3",
  profile: "M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M4 21v-3a8 8 0 0 1 16 0v3",
  newsletter: "M4 4h16v17H4ZM8 8h8M8 12h3v4H8ZM14 12h2M14 16h2",
  admin: "M12 3 4 6v6c0 4 5 8 8 9 3-1 8-5 8-9V6ZM8 12l3 3 5-6",
  guide: "M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4ZM12 6v16",
};
function NavigationIcon({ view }: { view: View }) {
  return (
    <svg
      className="ws-navigation-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[view]} />
    </svg>
  );
}

export function WorkspaceNavigation({ view }: { view: View }) {
  const { state, role, t, go } = useWorkspace();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const groups = navigationGroups(
    viewsForActor(state, role).filter((v) => v !== "guide"),
  );
  const unread = unreadMessages(state, role).length;
  return (
    <aside
      className="ws-sidebar"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <p className="ws-title">
        O meu Portugal
        <span>
          {t("Votre lien, au quotidien.", "A sua ligação, todos os dias.")}
        </span>
      </p>
      <button
        ref={toggle}
        className="ws-navigation-toggle"
        aria-expanded={open}
        aria-controls="workspace-navigation"
        onClick={() => setOpen(!open)}
      >
        <NavigationIcon view={view} />
        <span className="ws-navigation-current">
          <small>{t("Menu de l’espace", "Menu da área")}</small>
          <strong>{t(...labels[view])}</strong>
        </span>
        {unread > 0 && (
          <span
            className="ws-nav-count"
            aria-label={`${t("Messages non lus", "Mensagens por ler")} : ${unread}`}
          >
            {unread}
          </span>
        )}
        <svg
          className="ws-navigation-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <nav
        id="workspace-navigation"
        className="ws-navigation"
        data-open={open}
        aria-label={t("Navigation de l’espace", "Navegação da área")}
      >
        {groups.map((group, index) => (
          <div className="ws-navigation-group" key={group.views[0]}>
            {index > 0 && group.views.length > 1 && (
              <p className="ws-navigation-heading">{t(...group.title)}</p>
            )}
            <ul>
              {group.views.map((v) => (
                <li key={v}>
                  <button
                    aria-current={view === v ? "page" : undefined}
                    onClick={() => {
                      if (go(v) !== false) setOpen(false);
                    }}
                  >
                    <NavigationIcon view={v} />
                    <span className="ws-navigation-label">
                      {t(...labels[v])}
                    </span>
                    {v === "messages" && unread > 0 && (
                      <span className="ws-nav-count">{unread}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
