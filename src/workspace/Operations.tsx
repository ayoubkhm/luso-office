import { documentReviewLabels } from "./documentBoard";
import {
  localDay,
  matchingTasks,
  taskSummary,
  taskTiming,
  type TaskTiming,
} from "./taskBoard";
import { useState } from "react";
import { useWorkspace, Button, Panel, Field, Form, Badge, value } from "./ui";
import {
  canWork,
  visibleCases,
  type Task,
  type TaskStatus,
  type Document,
} from "./model";

const taskLabels: Record<TaskStatus, [string, string]> = {
  todo: ["À faire", "Por fazer"],
  doing: ["En cours", "Em curso"],
  blocked: ["Bloquée", "Bloqueada"],
  done: ["Terminée", "Concluída"],
};
const timingLabels: Record<TaskTiming, [string, string]> = {
  overdue: ["Date souhaitée dépassée", "Data pretendida ultrapassada"],
  today: ["Prévue aujourd’hui", "Prevista para hoje"],
  upcoming: ["Dans les 7 prochains jours", "Nos próximos 7 dias"],
  later: ["Prévue plus tard", "Prevista para mais tarde"],
  undated: ["Date à convenir", "Data a combinar"],
  done: ["Terminée", "Concluída"],
  paused: ["Dossier suspendu ou clos", "Pedido suspenso ou encerrado"],
};
export function Tasks({ caseId }: { caseId?: string }) {
  const { state, role, lang, t, selected } = useWorkspace();
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [dossier, setDossier] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [timing, setTiming] = useState("all");
  const today = localDay();
  const filters = { query, caseId: caseId || dossier, assignee };
  const summary = taskSummary(
    state,
    matchingTasks(state, role, filters, today, lang),
    today,
  );
  const tasks = matchingTasks(
    state,
    role,
    { ...filters, status: filter, timing },
    today,
    lang,
  );
  const clear = () => {
    setQuery("");
    setDossier("all");
    setAssignee("all");
    setTiming("all");
    setFilter("open");
  };
  const filtered = Boolean(
    query ||
      dossier !== "all" ||
      assignee !== "all" ||
      timing !== "all" ||
      filter !== "open",
  );
  const dayLabel = new Intl.DateTimeFormat(lang, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${today}T00:00:00Z`));
  return (
    <>
      <div className="ws-task-heading">
        <div>
          <h2>{t("Les actions à mener", "As ações a realizar")}</h2>
          <p>
            {t(
              "Les dates sont des objectifs de scénario, sans engagement de délai. Repère du jour :",
              "As datas são objetivos do cenário, sem garantia de prazo. Data de referência:",
            )}{" "}
            {dayLabel}.
          </p>
        </div>
        <Badge>
          {summary.open} {t("à terminer", "por concluir")}
        </Badge>
      </div>
      <div
        className="ws-task-priorities"
        aria-label={t(
          "Échéances des tâches recherchées",
          "Prazos das tarefas pesquisadas",
        )}
      >
        {(
          [
            [
              "overdue",
              t("Date dépassée", "Data ultrapassada"),
              summary.overdue,
            ],
            ["today", t("Aujourd’hui", "Hoje"), summary.today],
            ["undated", t("Sans date", "Sem data"), summary.undated],
          ] as const
        ).map(([key, label, count]) => (
          <button
            type="button"
            key={key}
            aria-pressed={filter === "open" && timing === key}
            onClick={() => {
              setFilter("open");
              setTiming(timing === key && filter === "open" ? "all" : key);
            }}
          >
            <strong>{count}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="ws-toolbar ws-task-filters">
        <Field label={t("Rechercher une tâche", "Pesquisar tarefa")}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Tâche, dossier, service ou bien…",
              "Tarefa, pedido, serviço ou imóvel…",
            )}
          />
        </Field>
        {!caseId && (
          <Field label={t("Dossier", "Pedido")}>
            <select
              value={dossier}
              onChange={(e) => setDossier(e.target.value)}
            >
              <option value="all">
                {t("Tous les dossiers", "Todos os pedidos")}
              </option>
              {visibleCases(state, role).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </Field>
        )}
        {role !== "partner" && (
          <Field label={t("Responsable", "Responsável")}>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="all">{t("Tous", "Todos")}</option>
              <option value="team">{t("Équipe", "Equipa")}</option>
              <option value="partner">{t("Partenaire", "Parceiro")}</option>
            </select>
          </Field>
        )}
        <Field label={t("Échéance", "Prazo")}>
          <select
            value={timing}
            disabled={["done", "paused"].includes(filter)}
            onChange={(e) => setTiming(e.target.value)}
          >
            <option value="all">
              {t("Toutes les dates", "Todas as datas")}
            </option>
            <option value="overdue">
              {t("Date dépassée", "Data ultrapassada")}
            </option>
            <option value="today">{t("Aujourd’hui", "Hoje")}</option>
            <option value="upcoming">
              {t("Les 7 prochains jours", "Os próximos 7 dias")}
            </option>
            <option value="later">{t("Plus tard", "Mais tarde")}</option>
            <option value="undated">{t("Sans date", "Sem data")}</option>
          </select>
        </Field>
      </div>
      <p className="ws-hint">
        {t(
          "Les repères de dates excluent les tâches terminées et les dossiers suspendus ou clos.",
          "Os indicadores de datas excluem as tarefas concluídas e os pedidos suspensos ou encerrados.",
        )}
      </p>
      <div
        className="ws-filter-tabs"
        aria-label={t("Filtrer les tâches", "Filtrar tarefas")}
      >
        {[
          ["open", t("À traiter", "Por tratar")],
          ["blocked", t("Bloquées", "Bloqueadas")],
          [
            "paused",
            t("Dossiers suspendus ou clos", "Pedidos suspensos ou encerrados"),
          ],
          ["done", t("Terminées", "Concluídas")],
          ["all", t("Toutes", "Todas")],
        ].map(([f, label]) => (
          <button
            type="button"
            key={f}
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setTiming("all");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ws-activity-count">
        <p className="ws-hint" role="status">
          {tasks.length}{" "}
          {t(
            "tâche(s) trouvée(s), par date croissante",
            "tarefa(s) encontrada(s), por data crescente",
          )}
        </p>
        {filtered && (
          <Button secondary onClick={clear}>
            {t("Effacer les filtres", "Limpar filtros")}
          </Button>
        )}
      </div>
      <div className="ws-task-grid">
        {tasks.map((task) => (
          <TaskCard
            task={task}
            today={today}
            key={`${task.id}-${task.status}-${task.assignee}-${task.due}`}
          />
        ))}
      </div>
      {!tasks.length && (
        <p className="ws-empty">
          {t(
            "Aucune tâche dans cette vue. Modifiez les filtres ; les tâches terminées et celles des dossiers suspendus restent consultables.",
            "Sem tarefas nesta vista. Altere os filtros; as tarefas concluídas e as dos pedidos suspensos continuam disponíveis.",
          )}
        </p>
      )}
      {role === "team" && (
        <TaskCreate
          key={caseId || dossier}
          caseId={caseId || (dossier !== "all" ? dossier : selected)}
          lockedCase={Boolean(caseId) || dossier !== "all"}
          onCreated={(id) => {
            clear();
            if (!caseId) setDossier(id);
          }}
        />
      )}
    </>
  );
}

function TaskCreate({
  caseId,
  lockedCase,
  onCreated,
}: {
  caseId: string;
  lockedCase: boolean;
  onCreated: (id: string) => void;
}) {
  const { state, role, t, act } = useWorkspace();
  const cases = visibleCases(state, role).filter(
    (c) => canWork(c) && (!lockedCase || c.id === caseId),
  );
  const [id, setId] = useState(
    cases.find((c) => c.id === caseId)?.id || cases[0]?.id || "",
  );
  const selected = cases.find((c) => c.id === id);
  if (!selected) return null;
  return (
    <details className="ws-add-task">
      <summary>
        {t("Ajouter une tâche au dossier", "Adicionar tarefa ao pedido")}
      </summary>
      <Form
        key={id}
        onSave={(d) => {
          const ok = act({
            type: "task-create",
            id,
            title: value(d, "title"),
            assignee: value(d, "assignee") as Task["assignee"],
            due: value(d, "due"),
          });
          if (ok) onCreated(id);
          return ok;
        }}
      >
        <Field label={t("Dossier", "Pedido")}>
          <select
            value={id}
            disabled={lockedCase}
            onChange={(e) => setId(e.target.value)}
          >
            {cases.map((c) => (
              <option key={c.id}>{c.id}</option>
            ))}
          </select>
        </Field>
        <Field label={t("Action à réaliser", "Ação a realizar")}>
          <input name="title" required maxLength={160} />
        </Field>
        <div className="ws-two">
          <Field label={t("Responsable", "Responsável")}>
            <select name="assignee">
              <option value="team">{t("Équipe", "Equipa")}</option>
              <option
                value="partner"
                disabled={!selected.partner || !state.partnerEnabled}
              >
                {t("Partenaire attribué", "Parceiro atribuído")}
              </option>
            </select>
          </Field>
          <Field
            label={t(
              "Date souhaitée (facultative)",
              "Data pretendida (facultativa)",
            )}
          >
            <input type="date" name="due" />
          </Field>
        </div>
        <Button type="submit">
          {t("Ajouter la tâche", "Adicionar tarefa")}
        </Button>
      </Form>
    </details>
  );
}
function TaskCard({ task, today }: { task: Task; today: string }) {
  const { state, role, lang, t, act, go } = useWorkspace();
  const [status, setStatus] = useState(task.status);
  const c = state.cases.find((c) => c.id === task.caseId)!;
  const timing = taskTiming(state, task, today);
  const date = task.due
    ? new Intl.DateTimeFormat(lang, {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(task.due))
    : t("À convenir", "A combinar");
  return (
    <article className={`ws-task-card ws-task-${task.status}`}>
      <div className="ws-detail-heading">
        <button
          className="ws-inline-link"
          onClick={() => go("requests", task.caseId)}
        >
          {task.caseId}
        </button>
        <Badge good={task.status === "done"}>
          {t(...taskLabels[task.status])}
        </Badge>
      </div>
      <h3>{task.title}</h3>
      {!["done", "paused"].includes(timing) && (
        <p className={`ws-task-timing ws-timing-${timing}`}>
          {t(...timingLabels[timing])}
        </p>
      )}
      {!canWork(c) && (
        <p className="ws-task-warning">
          {t(
            "Dossier suspendu ou clos : tâche conservée en lecture seule.",
            "Pedido suspenso ou encerrado: tarefa conservada só para leitura.",
          )}
        </p>
      )}
      <p className="ws-hint">
        {t(
          task.assignee === "team" ? "Équipe" : "Partenaire",
          task.assignee === "team" ? "Equipa" : "Parceiro",
        )}{" "}
        · {date}
      </p>
      {task.assignee === "partner" && (!c.partner || !state.partnerEnabled) && (
        <p className="ws-task-warning">
          {t(
            "L’accès du partenaire est suspendu. Réattribuez cette tâche ou rétablissez son accès.",
            "O acesso do parceiro está suspenso. Reatribua a tarefa ou restabeleça o acesso.",
          )}
        </p>
      )}
      {task.note && <p className="ws-task-note">{task.note}</p>}
      {role !== "member" && canWork(c) && (
        <details>
          <summary>{t("Mettre à jour la tâche", "Atualizar tarefa")}</summary>
          <Form
            onSave={(d) =>
              act({
                type: "task-update",
                id: task.id,
                status,
                note: value(d, "note"),
              })
            }
          >
            <Field label={t("Avancement", "Progresso")}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {Object.entries(taskLabels).map(([s, l]) => (
                  <option key={s} value={s}>
                    {t(...l)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t(
                status === "blocked"
                  ? "Motif du blocage (obligatoire)"
                  : "Note de suivi",
                status === "blocked"
                  ? "Motivo do bloqueio (obrigatório)"
                  : "Nota de acompanhamento",
              )}
            >
              <textarea
                name="note"
                defaultValue={task.note}
                required={status === "blocked"}
                maxLength={1000}
                rows={2}
              />
            </Field>
            <Button type="submit">
              {t("Enregistrer l’avancement", "Guardar progresso")}
            </Button>
          </Form>
        </details>
      )}
      {role === "team" && canWork(c) && (
        <details>
          <summary>
            {t(
              "Modifier le responsable ou la date",
              "Alterar responsável ou data",
            )}
          </summary>
          <Form
            onSave={(d) => {
              return act({
                type: "task-assign",
                id: task.id,
                assignee: value(d, "assignee") as Task["assignee"],
                due: value(d, "due"),
              });
            }}
          >
            <Field label={t("Responsable", "Responsável")}>
              <select name="assignee" defaultValue={task.assignee}>
                <option value="team">{t("Équipe", "Equipa")}</option>
                <option
                  value="partner"
                  disabled={!c.partner || !state.partnerEnabled}
                >
                  {t("Partenaire", "Parceiro")}
                </option>
              </select>
            </Field>
            <Field label={t("Date souhaitée", "Data pretendida")}>
              <input name="due" type="date" defaultValue={task.due} />
            </Field>
            <Button type="submit">
              {t("Enregistrer l’attribution", "Guardar atribuição")}
            </Button>
          </Form>
        </details>
      )}
    </article>
  );
}
export function CaseRequirements({
  caseId,
  onOpenDocuments,
}: {
  caseId: string;
  onOpenDocuments?: () => void;
}) {
  const { state, role, t, act, go } = useWorkspace();
  if (role === "partner") return null;
  const c = state.cases.find((c) => c.id === caseId)!;
  const needs = state.requirements.filter((r) => r.caseId === caseId);
  return (
    <section className="ws-required">
      <h3>
        {t(
          "Pièces attendues pour ce dossier",
          "Documentos necessários para este pedido",
        )}
      </h3>
      <p className="ws-hint">
        {t(
          "Une pièce fournie doit être vérifiée par l’équipe avant d’être considérée comme complète.",
          "Um documento entregue deve ser verificado pela equipa antes de ser considerado completo.",
        )}
      </p>
      {needs.map((r) => {
        const doc = state.documents.find((d) => d.requirement === r.id);
        return (
          <div className="ws-required-row" key={r.id}>
            <strong>{r.label}</strong>
            <Badge good={doc?.review === "accepted"}>
              {t(
                !doc
                  ? "À fournir"
                  : doc.review === "pending"
                    ? "À vérifier"
                    : doc.review === "accepted"
                      ? "Vérifiée"
                      : "À corriger",
                !doc
                  ? "Por entregar"
                  : doc.review === "pending"
                    ? "Por verificar"
                    : doc.review === "accepted"
                      ? "Verificado"
                      : "Por corrigir",
              )}
            </Badge>
            {doc?.reason && <p>{doc.reason}</p>}
            {!doc && role === "member" && canWork(c) && (
              <Button
                secondary
                onClick={() => {
                  if (
                    act({
                      type: "document",
                      id: caseId,
                      name: `${r.label} · DEMO`,
                      requirement: r.id,
                    })
                  )
                    onOpenDocuments?.();
                }}
              >
                {t("Fournir un document démo", "Entregar documento demo")}
              </Button>
            )}
            {doc && (
              <Button
                secondary
                onClick={() =>
                  onOpenDocuments ? onOpenDocuments() : go("documents", caseId)
                }
              >
                {t("Ouvrir les documents", "Abrir documentos")}
              </Button>
            )}
          </div>
        );
      })}
      {!needs.length && (
        <p>
          {t(
            "Aucune pièce demandée pour l’instant.",
            "Nenhum documento pedido por enquanto.",
          )}
        </p>
      )}
      {role === "team" && canWork(c) && (
        <Form
          onSave={(d) =>
            act({ type: "requirement", id: caseId, label: value(d, "label") })
          }
        >
          <Field
            label={t(
              "Demander une pièce à l’adhérent",
              "Pedir documento ao aderente",
            )}
          >
            <input
              name="label"
              required
              maxLength={160}
              placeholder={t(
                "Ex. autorisation d’intervention",
                "Ex. autorização de intervenção",
              )}
            />
          </Field>
          <Button secondary type="submit">
            {t(
              "Ajouter à la liste des pièces",
              "Adicionar à lista de documentos",
            )}
          </Button>
        </Form>
      )}
    </section>
  );
}
export function DocumentReview({ doc }: { doc: Document }) {
  const { state, role, t, act } = useWorkspace();
  const [decision, setDecision] = useState<"accepted" | "rejected">("accepted");
  const closed = !canWork(state.cases.find((c) => c.id === doc.caseId)!);
  return (
    <div className="ws-doc-review">
      <Badge good={doc.review === "accepted"}>
        {t(...documentReviewLabels[doc.review])} · v{doc.version}
      </Badge>
      {doc.reason && <p>{doc.reason}</p>}
      {role === "team" && doc.review === "pending" && !closed && (
        <Form
          onSave={(d) =>
            act({
              type: "document-review",
              id: doc.id,
              review: decision,
              reason: value(d, "reason"),
            })
          }
        >
          <Field
            label={t("Résultat de la vérification", "Resultado da verificação")}
          >
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as typeof decision)}
            >
              <option value="accepted">
                {t("Pièce conforme au besoin", "Documento adequado ao pedido")}
              </option>
              <option value="rejected">
                {t("Correction nécessaire", "Correção necessária")}
              </option>
            </select>
          </Field>
          <Field
            label={t(
              "Commentaire (obligatoire en cas de correction)",
              "Comentário (obrigatório para correção)",
            )}
          >
            <textarea
              name="reason"
              required={decision === "rejected"}
              maxLength={1000}
              rows={2}
            />
          </Field>
          <Button type="submit">
            {t("Enregistrer la vérification", "Guardar verificação")}
          </Button>
        </Form>
      )}
      {doc.review === "rejected" && !closed && (
        <Form
          onSave={(d) =>
            act({
              type: "document-replace",
              id: doc.id,
              name: value(d, "name"),
            })
          }
        >
          <Field
            label={t(
              "Intitulé de la nouvelle version fictive",
              "Título da nova versão fictícia",
            )}
          >
            <input
              name="name"
              required
              maxLength={160}
              defaultValue={doc.name}
            />
          </Field>
          <Button secondary type="submit">
            {t(
              "Déposer une nouvelle version démo",
              "Entregar nova versão demo",
            )}
          </Button>
        </Form>
      )}
      {doc.revisions.length > 0 && (
        <details>
          <summary>
            {t("Historique des versions", "Histórico de versões")} (
            {doc.revisions.length})
          </summary>
          {doc.revisions.map((r) => (
            <p key={r.version}>
              v{r.version} — {r.name}
              <br />
              {r.reason}
            </p>
          ))}
        </details>
      )}
    </div>
  );
}
export function PropertyEditor({ id }: { id: string }) {
  const { state, t, act } = useWorkspace();
  const p = state.properties.find((p) => p.id === id)!;
  return (
    <details className="ws-property-editor">
      <summary>
        {t("Modifier la fiche du bien", "Editar ficha do imóvel")}
      </summary>
      <Form
        onSave={(d) => {
          act({
            type: "property-edit",
            id,
            name: value(d, "name"),
            town: value(d, "town"),
          });
        }}
      >
        <Field label={t("Nom du bien d’exemple", "Nome do imóvel de exemplo")}>
          <input name="name" defaultValue={p.name} required maxLength={80} />
        </Field>
        <Field label={t("Commune fictive", "Localidade fictícia")}>
          <input name="town" defaultValue={p.town} required maxLength={100} />
        </Field>
        <Button type="submit">
          {t("Enregistrer la fiche", "Guardar ficha")}
        </Button>
      </Form>
    </details>
  );
}
export function PartnerAccess() {
  const { state, t, act } = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  return (
    <Panel title={t("Accès du partenaire démo", "Acesso do parceiro demo")}>
      <Badge good={state.partnerEnabled}>
        {t(
          state.partnerEnabled ? "Accès actif" : "Accès suspendu",
          state.partnerEnabled ? "Acesso ativo" : "Acesso suspenso",
        )}
      </Badge>
      <p>
        {state.cases.filter((c) => c.partner).length}{" "}
        {t(
          "mission(s) attribuée(s). La suspension masque tous les dossiers, documents, tâches et messages de la vue partenaire. Les attributions sont conservées pour l’équipe.",
          "missão(ões) atribuída(s). A suspensão oculta todos os pedidos, documentos, tarefas e mensagens da vista do parceiro. As atribuições mantêm-se para a equipa.",
        )}
      </p>
      <Button secondary onClick={() => setConfirm(!confirm)}>
        {t(
          state.partnerEnabled
            ? "Suspendre l’accès démo"
            : "Rétablir l’accès démo",
          state.partnerEnabled
            ? "Suspender acesso demo"
            : "Restabelecer acesso demo",
        )}
      </Button>
      {confirm && (
        <div className="ws-confirm">
          <p>
            {t(
              state.partnerEnabled
                ? "Les tâches attribuées devront être réaffectées ou attendre le rétablissement de l’accès."
                : "Le partenaire retrouvera toutes ses missions encore attribuées et leurs documents partagés.",
              state.partnerEnabled
                ? "As tarefas atribuídas deverão ser reatribuídas ou aguardar o restabelecimento do acesso."
                : "O parceiro voltará a ver todas as missões atribuídas e os documentos partilhados.",
            )}
          </p>
          <Button
            onClick={() => {
              act({ type: "partner-access", enabled: !state.partnerEnabled });
              setConfirm(false);
            }}
          >
            {t("Confirmer dans la démo", "Confirmar na demo")}
          </Button>
          <Button secondary onClick={() => setConfirm(false)}>
            {t("Annuler", "Cancelar")}
          </Button>
        </div>
      )}
    </Panel>
  );
}
export function EditionArchives() {
  const { state, role, t, act } = useWorkspace();
  return (
    <Panel title={t("Les éditions précédentes", "Edições anteriores")}>
      {role === "team" && state.edition.status === "published" && (
        <>
          <p>
            {t(
              "La nouvelle édition repart d’un brouillon vide. L’édition publiée et son bilan sont conservés ici.",
              "A nova edição começa com um rascunho vazio. A edição publicada e o balanço ficam guardados aqui.",
            )}
          </p>
          {state.campaign.status === "queued" && (
            <Button secondary onClick={() => act({ type: "cancel-campaign" })}>
              {t(
                "Annuler la campagne en attente",
                "Cancelar campanha pendente",
              )}
            </Button>
          )}
          <Button
            disabled={state.campaign.status === "queued"}
            onClick={() => act({ type: "next-edition" })}
          >
            {t("Préparer l’édition suivante", "Preparar edição seguinte")}
          </Button>
        </>
      )}
      {!state.archives.length && (
        <p className="ws-empty">
          {t(
            "Aucune édition archivée dans cette session.",
            "Sem edições arquivadas nesta sessão.",
          )}
        </p>
      )}
      {state.archives.map((a, i) => (
        <details className="ws-archive" key={i}>
          <summary>
            {a.edition.title} · {t("édition démo", "edição demo")} {i + 1}
          </summary>
          <p>{a.edition.excerpt}</p>
          {(role === "team" || state.subscription.active) &&
            a.edition.sections.map((text, i) => (
              <p key={i} lang="pt">
                {text}
              </p>
            ))}
          {role === "team" && (
            <small>
              {a.delivered}{" "}
              {t(
                "destinataire(s) simulé(s), aucun envoi réel",
                "destinatário(s) simulado(s), sem envio real",
              )}
            </small>
          )}
        </details>
      ))}
    </Panel>
  );
}
