import { useEffect, useRef, useState } from "react";
import {
  attentionItems,
  unreadMessages,
  visibleCases,
  type AttentionKind,
} from "./model";
import {
  useWorkspace,
  Panel,
  Badge,
  Button,
  Field,
  Form,
  serviceName,
  roleNames,
} from "./ui";

const actions: Record<AttentionKind, [string, string]> = {
  "settlement-prepare": [
    "Préparer le bilan du dossier",
    "Preparar balanço do pedido",
  ],
  "settlement-review": [
    "Examiner le bilan proposé",
    "Analisar balanço proposto",
  ],
  "settlement-pay": ["Régler le solde dans la démo", "Pagar saldo na demo"],
  "settlement-refund": [
    "Suivre le remboursement démo",
    "Acompanhar reembolso demo",
  ],
  messages: ["Lire les nouveaux messages", "Ler novas mensagens"],
  cancellation: ["Examiner l’annulation", "Analisar cancelamento"],
  approve: ["Examiner la proposition", "Analisar proposta"],
  pay: ["Préparer la provision", "Preparar provisão"],
  "payment-result": [
    "Résoudre la tentative de paiement démo",
    "Resolver tentativa de pagamento demo",
  ],
  scope: ["Cadrer la demande", "Analisar pedido"],
  start: ["Démarrer la mission", "Iniciar missão"],
  deliver: ["Remettre le livrable", "Entregar resultado"],
  "review-delivery": [
    "Vérifier le livrable remis",
    "Verificar resultado entregue",
  ],
  close: ["Vérifier et clôturer", "Verificar e concluir"],
  provide: ["Fournir les pièces attendues", "Entregar documentos pedidos"],
  "review-documents": [
    "Vérifier les pièces déposées",
    "Verificar documentos entregues",
  ],
  "correct-documents": [
    "Corriger les pièces refusées",
    "Corrigir documentos recusados",
  ],
  tasks: ["Traiter les tâches du dossier", "Tratar tarefas do pedido"],
  "return-originals": [
    "Organiser la restitution des originaux",
    "Organizar devolução dos originais",
  ],
};
export function ActionQueue() {
  const { state, role, lang, t, go } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const all = attentionItems(state, role);
  const shown = all.filter(
    (a) =>
      filter === "all" ||
      (filter === "messages" ? a.kind === "messages" : a.kind !== "messages"),
  );
  return (
    <Panel
      title={t("Ce qui attend votre attention", "O que precisa da sua atenção")}
      className="ws-attention"
    >
      <p className="ws-hint">
        {t(
          "Cette liste suit l’état des dossiers de la démo. Chaque ligne mène au dossier ou à l’échange concerné.",
          "Esta lista acompanha o estado dos pedidos da demo. Cada linha abre o pedido ou a conversa correspondente.",
        )}
      </p>
      <div
        className="ws-filter-tabs"
        aria-label={t("Filtrer les actions", "Filtrar ações")}
      >
        {[
          ["all", t("Tout", "Tudo")],
          ["actions", t("Actions à traiter", "Ações por tratar")],
          ["messages", t("Messages non lus", "Mensagens não lidas")],
        ].map(([v, l]) => (
          <button
            key={v}
            aria-pressed={filter === v}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>
      {shown.length ? (
        <ul className="ws-action-list">
          {shown.map((item) => {
            const c = state.cases.find((c) => c.id === item.caseId)!;
            return (
              <li key={`${item.caseId}-${item.kind}`}>
                <button onClick={() => go(item.target, item.caseId)}>
                  <span>
                    <small>
                      {item.caseId} · {serviceName(c.service, lang)}
                    </small>
                    <strong>{t(...actions[item.kind])}</strong>
                  </span>
                  <Badge>{item.count}</Badge>
                  <span aria-hidden="true">↗</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ws-empty">
          {t(
            "Rien à traiter dans cette vue. Les dossiers restent consultables dans Demandes.",
            "Nada por tratar nesta vista. Os pedidos continuam disponíveis em Pedidos.",
          )}
        </p>
      )}
    </Panel>
  );
}

export function Messages() {
  const { state, role, lang, t, act, selected, select, go } = useWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const cases = visibleCases(state, role).filter(
    (c) =>
      normalize(
        `${c.id} ${serviceName(c.service, lang)} ${c.description}`,
      ).includes(normalize(query.trim())) &&
      (filter === "all" ||
        (filter === "unread"
          ? unreadMessages(state, role, c.id).length > 0
          : Boolean(state.drafts[role][c.id]?.trim()))),
  );
  const current = cases.find((c) => c.id === selected) || cases[0];
  const thread = state.messages.filter((m) => m.caseId === current?.id);
  const unread = current ? unreadMessages(state, role, current.id).length : 0;
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [current?.id, thread.length]);
  const draft = current ? state.drafts[role][current.id] || "" : "";
  return (
    <div className="ws-inbox">
      <Panel
        title={t("Conversations", "Conversas")}
        className="ws-conversations"
      >
        <Field label={t("Rechercher une conversation", "Pesquisar conversa")}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Dossier ou service", "Pedido ou serviço")}
          />
        </Field>
        <Field label={t("Afficher les conversations", "Mostrar conversas")}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t("Toutes", "Todas")}</option>
            <option value="unread">
              {t("Avec messages non lus", "Com mensagens não lidas")}
            </option>
            <option value="drafts">
              {t("Avec mon brouillon", "Com o meu rascunho")}
            </option>
          </select>
        </Field>
        <p className="ws-hint" role="status">
          {cases.length} {t("conversation(s)", "conversa(s)")}
        </p>
        {cases.map((c) => {
          const count = unreadMessages(state, role, c.id).length;
          const last = state.messages.filter((m) => m.caseId === c.id).at(-1);
          return (
            <button
              className="ws-conversation"
              key={c.id}
              aria-pressed={current?.id === c.id}
              onClick={() => select(c.id)}
            >
              <span className="ws-conversation-top">
                <small>{c.id}</small>
                {count > 0 && (
                  <Badge>
                    {count} {t("non lu(s)", "não lida(s)")}
                  </Badge>
                )}
              </span>
              <strong>{serviceName(c.service, lang)}</strong>
              <span className="ws-conversation-preview">
                {last
                  ? `${t(...roleNames[last.role])} : ${last.body.slice(0, 85)}${last.body.length > 85 ? "…" : ""}`
                  : t("Aucun échange pour l’instant", "Ainda sem mensagens")}
              </span>
              {state.drafts[role][c.id]?.trim() && (
                <small className="ws-draft-tag">
                  {t("Brouillon conservé", "Rascunho guardado")}
                </small>
              )}
            </button>
          );
        })}
        {!cases.length && (
          <>
            <p className="ws-empty">
              {t(
                "Aucune conversation ne correspond à ces critères.",
                "Nenhuma conversa corresponde a estes critérios.",
              )}
            </p>
            {(query || filter !== "all") && (
              <Button
                secondary
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                {t("Effacer les filtres", "Limpar filtros")}
              </Button>
            )}
          </>
        )}
      </Panel>
      {current ? (
        <Panel
          title={serviceName(current.service, lang)}
          className="ws-conversation-detail"
        >
          <div className="ws-detail-heading">
            <small>{current.id}</small>
            <Button secondary onClick={() => go("requests", current.id)}>
              {t("Ouvrir le dossier", "Abrir pedido")}
            </Button>
          </div>
          <p className="ws-hint">
            {t(
              "Échange commun à l’adhérent, l’équipe et au partenaire lorsqu’il a accès au dossier. Les notes internes restent dans Demandes. Aucun message n’est envoyé hors de la démo.",
              "Conversa partilhada pelo aderente, equipa e parceiro enquanto tem acesso ao pedido. As notas internas ficam em Pedidos. Nenhuma mensagem sai da demo.",
            )}
          </p>
          <div className="ws-read-status">
            <span>
              {unread
                ? `${unread} ${t("message(s) non lu(s) dans cette vue", "mensagem(ns) não lida(s) nesta vista")}`
                : t(
                    "Aucun message non lu dans cette vue",
                    "Sem mensagens não lidas nesta vista",
                  )}
            </span>
            {unread > 0 && (
              <Button
                secondary
                onClick={() =>
                  act({
                    type: "message-read",
                    id: current.id,
                    through: thread.at(-1)!.id,
                  })
                }
              >
                {t(
                  "Marquer cette conversation comme lue",
                  "Marcar esta conversa como lida",
                )}
              </Button>
            )}
          </div>
          <div
            className="ws-thread"
            ref={threadRef}
            role="region"
            tabIndex={0}
            aria-label={t("Messages du dossier", "Mensagens do pedido")}
          >
            {thread.map((m) => (
              <article
                className={`ws-message ${m.role === role ? "mine" : ""}`}
                key={m.id}
              >
                <div className="ws-detail-heading">
                  <strong>
                    {t(...roleNames[m.role])} · {t("démo", "demo")}
                  </strong>
                  {m.role !== role && !m.readBy.includes(role) && (
                    <Badge>{t("Non lu", "Não lida")}</Badge>
                  )}
                </div>
                <p>{m.body}</p>
              </article>
            ))}
            {!thread.length && (
              <p>
                {t(
                  "Commencez l’échange sur ce dossier.",
                  "Inicie a conversa sobre este pedido.",
                )}
              </p>
            )}
          </div>
          <Form
            key={current.id}
            onSave={() => act({ type: "message", id: current.id, body: draft })}
          >
            <Field
              label={t("Votre message d’exemple", "A sua mensagem de exemplo")}
            >
              <textarea
                value={draft}
                onChange={(e) =>
                  act({
                    type: "message-draft",
                    id: current.id,
                    body: e.target.value,
                  })
                }
                required
                rows={4}
                maxLength={2000}
              />
            </Field>
            <p className="ws-hint">
              {draft.length}/2000 ·{" "}
              {t(
                "Brouillon propre à cette vue et à ce dossier, conservé jusqu’au rechargement.",
                "Rascunho próprio desta vista e deste pedido, guardado até recarregar.",
              )}
            </p>
            <Button type="submit" disabled={!draft.trim()}>
              {t("Ajouter à la conversation démo", "Adicionar à conversa demo")}
            </Button>
          </Form>
        </Panel>
      ) : (
        <Panel
          title={t("Vos échanges par dossier", "As suas conversas por pedido")}
        >
          <p>
            {t(
              "Choisissez une conversation ou ajustez les filtres. Seuls les dossiers accessibles à cette vue sont affichés.",
              "Escolha uma conversa ou ajuste os filtros. Apenas os pedidos acessíveis nesta vista são apresentados.",
            )}
          </p>
        </Panel>
      )}
    </div>
  );
}
