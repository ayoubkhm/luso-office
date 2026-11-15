import { useState } from "react";
import { activityCategories, matchingActivity } from "./activity";
import { Button, Field, Panel, roleNames, useWorkspace } from "./ui";

export function Activity({ caseId }: { caseId?: string }) {
  const { state, role, lang, t, go } = useWorkspace();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [actor, setActor] = useState("all");
  const [dossier, setDossier] = useState("all");
  if (role !== "team") return null;
  const filtered = Boolean(
    query || category !== "all" || actor !== "all" || dossier !== "all",
  );
  const events = matchingActivity(
    state,
    role,
    { query, category, actor, caseId: caseId ?? dossier },
    lang,
  );
  const reset = () => {
    setQuery("");
    setCategory("all");
    setActor("all");
    setDossier("all");
  };
  return (
    <Panel
      title={t(
        caseId ? "Activité de ce dossier" : "Activité de la session",
        caseId ? "Atividade deste pedido" : "Atividade da sessão",
      )}
    >
      <p className="ws-hint">
        {t(
          "Actions de cette démonstration, de la plus récente à la plus ancienne. L’historique disparaît au rechargement ; il ne constitue pas un journal d’audit officiel.",
          "Ações desta demonstração, da mais recente à mais antiga. O histórico desaparece ao recarregar; não constitui um registo de auditoria oficial.",
        )}
      </p>
      {!caseId && (
        <div className="ws-toolbar ws-activity-filters">
          <Field label={t("Rechercher une action", "Pesquisar ação")}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "Action ou numéro de dossier…",
                "Ação ou número do pedido…",
              )}
            />
          </Field>
          <Field label={t("Rubrique", "Área")}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">
                {t("Toutes les rubriques", "Todas as áreas")}
              </option>
              {Object.entries(activityCategories).map(([key, label]) => (
                <option key={key} value={key}>
                  {t(...label)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Auteur de l’action", "Autor da ação")}>
            <select value={actor} onChange={(e) => setActor(e.target.value)}>
              <option value="all">
                {t("Tous les rôles", "Todas as funções")}
              </option>
              {Object.entries(roleNames).map(([key, label]) => (
                <option key={key} value={key}>
                  {t(...label)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Dossier", "Pedido")}>
            <select
              value={dossier}
              onChange={(e) => setDossier(e.target.value)}
            >
              <option value="all">
                {t(
                  "Tous les dossiers et autres actions",
                  "Todos os pedidos e outras ações",
                )}
              </option>
              {state.cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
      <div className="ws-activity-count">
        <p className="ws-hint" role="status">
          {events.length} {t("action(s)", "ação(ões)")}
        </p>
        {filtered && (
          <Button secondary onClick={reset}>
            {t("Effacer les filtres", "Limpar filtros")}
          </Button>
        )}
      </div>
      {events.length ? (
        <ol
          className="ws-audit"
          aria-label={t("Actions récentes", "Ações recentes")}
        >
          {events.map((event) => (
            <li key={event.id}>
              <div>
                <small>
                  #{event.id} · {t(...roleNames[event.role])} ·{" "}
                  {t(...activityCategories[event.category])}
                  {event.caseId && ` · ${event.caseId}`}
                </small>
                <strong>{t(...event.title)}</strong>
              </div>
              <Button
                secondary
                onClick={() =>
                  go(
                    event.category === "tasks" ? "requests" : event.category,
                    event.caseId,
                  )
                }
              >
                {t("Ouvrir", "Abrir")} ·{" "}
                {event.caseId ?? t(...activityCategories[event.category])}
              </Button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ws-empty">
          {filtered
            ? t(
                "Aucune action ne correspond aux filtres.",
                "Nenhuma ação corresponde aos filtros.",
              )
            : t(
                "Aucune action enregistrée ici. Faites avancer un dossier pour voir son suivi.",
                "Nenhuma ação registada aqui. Avance num pedido para ver o seu acompanhamento.",
              )}
        </p>
      )}
    </Panel>
  );
}
