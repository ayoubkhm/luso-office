import { exampleText } from "../locales/examples";
import { useState } from "react";
import { canWork, visibleCases, type Document } from "./model";
import { matchingDocuments, documentReviewLabels } from "./documentBoard";
import { CaseRequirements, DocumentReview } from "./Operations";
import { useWorkspace, Panel, Field, Button, Form, Badge, value } from "./ui";

export function Documents() {
  const { state, role, lang, t, selected } = useWorkspace();
  const cases = visibleCases(state, role);
  const initial = cases.some((c) => c.id === selected) ? selected : "all";
  const [filter, setFilter] = useState(initial);
  const [query, setQuery] = useState("");
  const [review, setReview] = useState("all");
  const [custody, setCustody] = useState("all");
  const [sharing, setSharing] = useState("all");
  const clearSearch = () => {
    setQuery("");
    setReview("all");
    setCustody("all");
    setSharing("all");
  };
  const shown = matchingDocuments(
    state,
    role,
    { query, caseId: filter, review, custody, sharing },
    lang,
  );
  const current = cases.find((c) => c.id === filter);
  const filtered = Boolean(
    query || review !== "all" || custody !== "all" || sharing !== "all",
  );
  return (
    <>
      <p className="ws-intro">
        {t(
          "Retrouvez les pièces, leur vérification et les originaux confiés. Une autorisation de partage et une mission attribuée sont toutes deux nécessaires pour donner accès au partenaire.",
          "Encontre os documentos, a sua verificação e os originais entregues. A autorização de partilha e a atribuição da missão são ambas necessárias para dar acesso ao parceiro.",
        )}
      </p>
      <div className="ws-toolbar">
        <Field label={t("Filtrer par dossier", "Filtrar por pedido")}>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              clearSearch();
            }}
          >
            <option value="all">
              {t("Tous les dossiers", "Todos os pedidos")}
            </option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Rechercher une pièce", "Pesquisar documento")}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Nom, dossier, bien ou pièce demandée…",
              "Nome, pedido, imóvel ou documento pedido…",
            )}
          />
        </Field>
      </div>
      <div className="ws-two">
        <Panel title={t("Documents accessibles", "Documentos acessíveis")}>
          <div className="ws-document-filters">
            <Field label={t("Vérification", "Verificação")}>
              <select
                value={review}
                onChange={(e) => setReview(e.target.value)}
              >
                <option value="all">
                  {t("Tous les états", "Todos os estados")}
                </option>
                {Object.entries(documentReviewLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {t(...label)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Original", "Original")}>
              <select
                value={custody}
                onChange={(e) => setCustody(e.target.value)}
              >
                <option value="all">{t("Tous", "Todos")}</option>
                <option value="received">
                  {t("À restituer", "Por devolver")}
                </option>
                <option value="returned">{t("Restitué", "Devolvido")}</option>
                <option value="digital">
                  {t("Aucun original confié", "Sem original entregue")}
                </option>
              </select>
            </Field>
            {role !== "partner" && (
              <Field label={t("Partage partenaire", "Partilha com parceiro")}>
                <select
                  value={sharing}
                  onChange={(e) => setSharing(e.target.value)}
                >
                  <option value="all">{t("Tous", "Todos")}</option>
                  <option value="shared">{t("Autorisé", "Autorizada")}</option>
                  <option value="private">
                    {t("Non autorisé", "Não autorizada")}
                  </option>
                </select>
              </Field>
            )}
          </div>
          <div className="ws-activity-count">
            <p className="ws-hint" role="status">
              {shown.length}{" "}
              {t("pièce(s) trouvée(s)", "documento(s) encontrado(s)")}
            </p>
            {filtered && (
              <Button secondary onClick={clearSearch}>
                {t(
                  "Effacer la recherche et les filtres",
                  "Limpar pesquisa e filtros",
                )}
              </Button>
            )}
          </div>
          {shown.map((d) => (
            <DocumentCard key={d.id} d={d} />
          ))}
          {!shown.length && (
            <p className="ws-empty">
              {t(
                role === "partner"
                  ? "Aucune pièce partagée ne correspond à cette vue. Vérifiez le dossier et les filtres."
                  : "Aucune pièce accessible ne correspond à cette vue. Vérifiez le dossier et les filtres ; les pièces encore à fournir figurent dans la liste des pièces attendues.",
                role === "partner"
                  ? "Nenhum documento partilhado corresponde a esta vista. Verifique o pedido e os filtros."
                  : "Nenhum documento acessível corresponde a esta vista. Verifique o pedido e os filtros; os documentos por entregar constam da lista de documentos necessários.",
              )}
            </p>
          )}
        </Panel>
        <div>
          {current && role !== "partner" && (
            <Panel
              title={t("À réunir pour", "A reunir para") + " " + current.id}
            >
              <CaseRequirements
                key={current.id}
                caseId={current.id}
                onOpenDocuments={clearSearch}
              />
            </Panel>
          )}
          {!current && role !== "partner" && (
            <p className="ws-hint">
              {t(
                "Sélectionnez un dossier pour retrouver sa liste de pièces attendues.",
                "Selecione um pedido para consultar a lista de documentos necessários.",
              )}
            </p>
          )}
          <DocumentDeposit
            key={filter}
            caseId={filter === "all" ? undefined : filter}
            onCreated={(id) => {
              setFilter(id);
              clearSearch();
            }}
          />
        </div>
      </div>
    </>
  );
}

function DocumentDeposit({
  caseId,
  onCreated,
}: {
  caseId?: string;
  onCreated: (id: string) => void;
}) {
  const { state, role, t, act, lang } = useWorkspace();
  const cases = visibleCases(state, role).filter(
    (c) => canWork(c) && (!caseId || c.id === caseId),
  );
  const [id, setId] = useState(caseId || cases[0]?.id || "");
  const current = cases.find((c) => c.id === id);
  const needs = state.requirements.filter(
    (r) =>
      r.caseId === id && !state.documents.some((d) => d.requirement === r.id),
  );
  return (
    <Panel title={t("Simuler un dépôt", "Simular entrega")}>
      <p>
        {t(
          "Ajoutez uniquement un intitulé fictif. Aucun fichier n’est lu ou téléversé.",
          "Adicione apenas um título fictício. Nenhum ficheiro é lido ou enviado.",
        )}
      </p>
      {current ? (
        <Form
          key={id}
          onSave={(data) => {
            const ok = act({
              type: "document",
              id,
              name: value(data, "name"),
              requirement: value(data, "requirement") || undefined,
            });
            if (ok) onCreated(id);
            return ok;
          }}
        >
          <Field label={t("Dossier du dépôt", "Pedido da entrega")}>
            <select
              value={id}
              disabled={Boolean(caseId)}
              onChange={(e) => setId(e.target.value)}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </Field>
          {role !== "partner" && (
            <Field label={t("Ce dépôt répond à", "Esta entrega corresponde a")}>
              <select name="requirement">
                <option value="">
                  {t("Une pièce complémentaire", "Um documento adicional")}
                </option>
                {needs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {exampleText(r.label, lang)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label={t("Nom du document démo", "Nome do documento demo")}>
            <input name="name" required maxLength={120} />
          </Field>
          <Button type="submit">
            {t(
              "Ajouter le document d’exemple",
              "Adicionar documento de exemplo",
            )}
          </Button>
        </Form>
      ) : (
        <p className="ws-empty">
          {t(
            "Aucun dossier ouvert dans cette sélection pour un dépôt. Les pièces existantes restent consultables.",
            "Nenhum pedido aberto nesta seleção para entrega. Os documentos existentes continuam disponíveis.",
          )}
        </p>
      )}
    </Panel>
  );
}

function DocumentCard({ d }: { d: Document }) {
  const { state, role, t, act, go, lang } = useWorkspace();
  const cases = visibleCases(state, role);
  const c = cases.find((c) => c.id === d.caseId)!;
  return (
    <article className="ws-document">
      <button
        className="ws-inline-link"
        type="button"
        onClick={() => go("requests", d.caseId)}
      >
        {d.caseId}
      </button>
      <h3>{exampleText(d.name, lang)}</h3>
      <Badge good={d.review === "accepted"}>
        {t(...documentReviewLabels[d.review])} · v{d.version}
      </Badge>
      <details className="ws-document-controls">
        <summary>
          {t(
            "Consulter et gérer cette pièce",
            "Consultar e gerir este documento",
          )}
        </summary>
        {!canWork(c) && (
          <p className="ws-hint">
            {t(
              "Dossier suspendu ou clos : consultation, retrait des partages et restitution des originaux uniquement.",
              "Pedido suspenso ou encerrado: apenas consulta, retirada de partilhas e devolução de originais.",
            )}
          </p>
        )}
        {d.requirement && (
          <p className="ws-hint">
            {t("Pièce demandée", "Documento pedido")} :{" "}
            {state.requirements.find((r) => r.id === d.requirement)?.label}
          </p>
        )}
        <DocumentReview key={`${d.id}-${d.version}-${d.review}`} doc={d} />
        <Badge>
          {t(
            d.shared
              ? "Partage partenaire autorisé"
              : "Partage partenaire non autorisé",
            d.shared
              ? "Partilha com parceiro autorizada"
              : "Partilha com parceiro não autorizada",
          )}
        </Badge>
        {d.shared && (!c.partner || !state.partnerEnabled) && (
          <p className="ws-hint">
            {t(
              "Autorisation de partage conservée, mais aucun partenaire n’a actuellement accès à ce dossier.",
              "Autorização de partilha conservada, mas nenhum parceiro tem atualmente acesso a este pedido.",
            )}
          </p>
        )}
        <p>
          {t("Original", "Original")} :{" "}
          {t(
            d.custody === "digital"
              ? "aucun original confié"
              : d.custody === "received"
                ? "réception simulée"
                : "restitution simulée",
            d.custody === "digital"
              ? "sem original entregue"
              : d.custody === "received"
                ? "receção simulada"
                : "devolução simulada",
          )}
        </p>
        <details>
          <summary>
            {t("Aperçu du document démo", "Pré-visualizar documento demo")}
          </summary>
          <p className="ws-sample">
            DEMO — {exampleText(d.name, lang)}
            <br />
            {t(
              "Aucun contenu réel. L’accès au fichier et son téléchargement sécurisé seront connectés ultérieurement.",
              "Sem conteúdo real. O acesso ao ficheiro e a transferência segura serão ligados posteriormente.",
            )}
          </p>
        </details>
        <div className="ws-actions">
          {role !== "partner" &&
            (d.shared ||
              cases.some((c) => c.id === d.caseId && canWork(c))) && (
              <Button
                secondary
                onClick={() =>
                  act({ type: "share", id: d.id, shared: !d.shared })
                }
              >
                {t(
                  d.shared
                    ? "Retirer le partage"
                    : "Autoriser le partage partenaire",
                  d.shared
                    ? "Retirar partilha"
                    : "Autorizar partilha com parceiro",
                )}
              </Button>
            )}
          {role === "team" &&
            d.custody !== "returned" &&
            (d.custody === "received" ||
              cases.some((c) => c.id === d.caseId && canWork(c))) && (
              <Button
                secondary
                onClick={() =>
                  act({
                    type: "custody",
                    id: d.id,
                    custody: d.custody === "digital" ? "received" : "returned",
                  })
                }
              >
                {t(
                  d.custody === "digital"
                    ? "Simuler la réception de l’original"
                    : "Simuler la restitution de l’original",
                  d.custody === "digital"
                    ? "Simular receção do original"
                    : "Simular devolução do original",
                )}
              </Button>
            )}
        </div>
      </details>
    </article>
  );
}
