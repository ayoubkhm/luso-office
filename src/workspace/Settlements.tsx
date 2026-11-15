import { useState } from "react";
import {
  isClosed,
  visibleCases,
  total,
  settlementTotal,
  settlementBalance,
  type Case,
  type Settlement,
} from "./model";
import {
  useWorkspace,
  useMoney,
  Panel,
  Badge,
  Button,
  Form,
  Field,
  value,
  serviceName,
} from "./ui";
export const settlementLabels: Record<Settlement["status"], [string, string]> =
  {
    proposed: ["Bilan à examiner", "Balanço por analisar"],
    disputed: ["Correction demandée", "Correção pedida"],
    approved: ["Bilan approuvé dans la démo", "Balanço aprovado na demo"],
    pending: ["Opération simulée en attente", "Operação simulada pendente"],
    failed: ["Tentative simulée échouée", "Tentativa simulada falhada"],
    settled: ["Bilan soldé dans la démo", "Balanço liquidado na demo"],
    superseded: ["Bilan remplacé", "Balanço substituído"],
  };
function Amounts({ c, b }: { c: Case; b: Settlement }) {
  const { t } = useWorkspace();
  const money = useMoney();
  const balance = settlementBalance(c, b);
  return (
    <div className="ws-breakdown">
      <dl>
        <div>
          <dt>
            {t("Provision simulée déjà versée", "Provisão simulada já paga")}
          </dt>
          <dd>{money(total(c))}</dd>
        </div>
        <div>
          <dt>
            {t(
              "Coordination retenue dans ce bilan",
              "Coordenação neste balanço",
            )}
          </dt>
          <dd>{money(b.coordination)}</dd>
        </div>
        <div>
          <dt>
            {t(
              "Frais officiels déclarés (démo)",
              "Taxas oficiais declaradas (demo)",
            )}
          </dt>
          <dd>{money(b.official)}</dd>
        </div>
        <div>
          <dt>
            {t(
              "Prestations de tiers déclarées (démo)",
              "Serviços de terceiros declarados (demo)",
            )}
          </dt>
          <dd>{money(b.thirdParty)}</dd>
        </div>
        <div>
          <dt>{t("Total du bilan proposé", "Total do balanço proposto")}</dt>
          <dd>{money(settlementTotal(b))}</dd>
        </div>
        <div>
          <dt>
            {t(
              balance < 0
                ? "À rembourser dans le scénario"
                : balance > 0
                  ? "Solde à payer dans le scénario"
                  : "Aucun solde supplémentaire",
              balance < 0
                ? "A reembolsar no cenário"
                : balance > 0
                  ? "Saldo a pagar no cenário"
                  : "Sem saldo adicional",
            )}
          </dt>
          <dd>{money(Math.abs(balance))}</dd>
        </div>
      </dl>
    </div>
  );
}
export function Settlements() {
  const { state, role, lang, t, selected, select, go } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const all = visibleCases(state, role).filter(
    (c) => c.payment === "paid" && (isClosed(c) || c.settlements.length),
  );
  const cases = all.filter(
    (c) =>
      filter === "all" ||
      (filter === "done"
        ? c.settlements.at(-1)?.status === "settled"
        : c.settlements.at(-1)?.status !== "settled"),
  );
  const current = cases.find((c) => c.id === selected) || cases[0];
  if (role === "partner") return null;
  return (
    <>
      <p className="ws-intro">
        {t(
          "Après une clôture ou une annulation, comparez la provision avec le bilan proposé par l’équipe. L’accord sur le bilan précède toute simulation de solde ou de remboursement.",
          "Após conclusão ou cancelamento, compare a provisão com o balanço proposto pela equipa. A aprovação do balanço precede qualquer simulação de saldo ou reembolso.",
        )}
      </p>
      <p className="ws-hint">
        {t(
          "Exemples sans valeur fiscale ni contractuelle. Aucun prélèvement, virement, remboursement ou avoir réel. Les montants et leurs justificatifs restent à faire valider hors de cette maquette.",
          "Exemplos sem valor fiscal ou contratual. Sem débito, transferência, reembolso ou nota de crédito real. Os valores e comprovativos continuam sujeitos a validação fora deste protótipo.",
        )}
      </p>
      <Field label={t("Afficher les bilans", "Mostrar balanços")}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="open">{t("À suivre", "Por acompanhar")}</option>
          <option value="done">
            {t("Soldés dans la démo", "Liquidados na demo")}
          </option>
          <option value="all">{t("Tous", "Todos")}</option>
        </select>
      </Field>
      <div className="ws-case-layout ws-settlement-layout">
        <section
          className="ws-case-list"
          aria-label={t("Dossiers à rapprocher", "Pedidos para reconciliação")}
        >
          {cases.map((c) => (
            <button
              key={c.id}
              className={current?.id === c.id ? "selected" : ""}
              aria-pressed={current?.id === c.id}
              onClick={() => select(c.id)}
            >
              <small>{c.id}</small>
              <strong>{serviceName(c.service, lang)}</strong>
              <Badge>
                {c.settlements.at(-1)
                  ? t(...settlementLabels[c.settlements.at(-1)!.status])
                  : t("Bilan à préparer", "Balanço por preparar")}
              </Badge>
            </button>
          ))}
        </section>
        {current ? (
          <SettlementDetail
            key={`${current.id}-${current.settlements.length}-${current.settlements.at(-1)?.status}`}
            c={current}
          />
        ) : (
          <Panel
            title={t("Aucun bilan dans cette vue", "Sem balanços nesta vista")}
          >
            <p>
              {t(
                "Les dossiers ayant une provision confirmée apparaissent après leur clôture ou annulation. Les bilans soldés restent accessibles avec le filtre correspondant.",
                "Os pedidos com provisão confirmada aparecem após conclusão ou cancelamento. Os balanços liquidados continuam disponíveis no respetivo filtro.",
              )}
            </p>
            <Button secondary onClick={() => go("guide")}>
              {t("Explorer un parcours guidé", "Explorar um percurso guiado")}
            </Button>
          </Panel>
        )}
      </div>
    </>
  );
}
function SettlementDetail({ c }: { c: Case }) {
  const { role, lang, t, act, go } = useWorkspace();
  const money = useMoney();
  const [reviewed, setReviewed] = useState(false);
  const b = c.settlements.at(-1);
  const balance = b ? settlementBalance(c, b) : 0;
  const canPrepare =
    role === "team" &&
    isClosed(c) &&
    (!b || ["disputed", "superseded"].includes(b.status));
  const operator = balance < 0 ? "team" : "member";
  return (
    <Panel title={`${c.id} · ${serviceName(c.service, lang)}`}>
      <Button secondary onClick={() => go("requests", c.id)}>
        {t("Consulter le dossier", "Consultar pedido")}
      </Button>
      {!isClosed(c) && (
        <p className="ws-blocker">
          {t(
            "Le dossier a été rouvert. Un nouveau bilan pourra être préparé après sa clôture.",
            "O pedido foi reaberto. Um novo balanço poderá ser preparado após a conclusão.",
          )}
        </p>
      )}
      {b && (
        <>
          <div className="ws-detail-heading ws-settlement-heading">
            <strong>
              {t("Bilan version", "Balanço versão")} {b.version}
            </strong>
            <Badge good={b.status === "settled"}>
              {t(...settlementLabels[b.status])}
            </Badge>
          </div>
          <p className="ws-settlement-note">{b.explanation}</p>
          <Amounts c={c} b={b} />
          {b.dispute && (
            <p className="ws-blocker">
              {t("Correction demandée :", "Correção pedida:")} {b.dispute}
            </p>
          )}
        </>
      )}
      {canPrepare && (
        <Form
          onSave={(d) =>
            act({
              type: "settlement-propose",
              id: c.id,
              coordination: Number(value(d, "coordination")),
              official: Number(value(d, "official")),
              thirdParty: Number(value(d, "thirdParty")),
              explanation: value(d, "explanation"),
            })
          }
        >
          <h3>
            {t("Préparer le bilan", "Preparar balanço")} · v
            {c.settlements.length + 1}
          </h3>
          <p>
            {t(
              "Saisissez les montants retenus pour ce scénario et expliquez les écarts. La provision reste",
              "Indique os valores deste cenário e explique as diferenças. A provisão mantém-se em",
            )}{" "}
            {money(total(c))}.
          </p>
          <div className="ws-three">
            {[
              [
                "coordination",
                t("Coordination (€)", "Coordenação (€)"),
                b?.coordination ?? c.quote,
              ],
              [
                "official",
                t("Frais officiels (€)", "Taxas oficiais (€)"),
                b?.official ?? c.fees,
              ],
              [
                "thirdParty",
                t("Tiers (€)", "Terceiros (€)"),
                b?.thirdParty ?? c.thirdParty,
              ],
            ].map(([name, label, amount]) => (
              <Field key={String(name)} label={String(label)}>
                <input
                  name={String(name)}
                  type="number"
                  required
                  min="0"
                  max="100000"
                  step="0.01"
                  defaultValue={amount}
                />
              </Field>
            ))}
          </div>
          <Field
            label={t(
              "Explication et références fictives du bilan",
              "Explicação e referências fictícias do balanço",
            )}
          >
            <textarea
              name="explanation"
              required
              rows={4}
              maxLength={2000}
              defaultValue={b?.explanation || ""}
            />
          </Field>
          <Button type="submit">
            {t("Soumettre le bilan démo", "Submeter balanço demo")}
          </Button>
        </Form>
      )}
      {!b && role === "member" && (
        <p>
          {t(
            "L’équipe doit préparer le bilan. Aucun remboursement n’est déclenché automatiquement par l’annulation.",
            "A equipa deve preparar o balanço. O cancelamento não desencadeia um reembolso automático.",
          )}
        </p>
      )}
      {b?.status === "proposed" && role === "member" && (
        <>
          <label className="ws-check">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            <span>
              {t(
                "J’ai relu les montants et l’explication de cette version démo.",
                "Revi os valores e a explicação desta versão demo.",
              )}
            </span>
          </label>
          <Button
            disabled={!reviewed}
            onClick={() =>
              act({
                type: "settlement-respond",
                id: c.id,
                version: b.version,
                approve: true,
                reason: "",
              })
            }
          >
            {t(
              "Simuler mon accord sur le bilan",
              "Simular aprovação do balanço",
            )}
          </Button>
          <details className="ws-decision-action">
            <summary>
              {t(
                "Demander une correction du bilan",
                "Pedir correção do balanço",
              )}
            </summary>
            <Form
              onSave={(d) =>
                act({
                  type: "settlement-respond",
                  id: c.id,
                  version: b.version,
                  approve: false,
                  reason: value(d, "reason"),
                })
              }
            >
              <Field label={t("Point à corriger", "Ponto a corrigir")}>
                <textarea name="reason" required maxLength={1000} rows={3} />
              </Field>
              <Button secondary type="submit">
                {t("Renvoyer à l’équipe", "Devolver à equipa")}
              </Button>
            </Form>
          </details>
        </>
      )}
      {b && ["approved", "pending", "failed"].includes(b.status) && (
        <div className="ws-payment">
          <p>
            {t(
              balance < 0
                ? "Remboursement simulé à suivre par l’équipe."
                : "Solde simulé à régler dans la vue adhérent.",
              balance < 0
                ? "Reembolso simulado a acompanhar pela equipa."
                : "Saldo simulado a pagar na vista do aderente.",
            )}
          </p>
          {role === operator &&
            (b.status === "pending" ? (
              <div className="ws-actions">
                <Button
                  onClick={() =>
                    act({
                      type: "settlement-payment",
                      id: c.id,
                      version: b.version,
                      result: "paid",
                    })
                  }
                >
                  {t(
                    "Simuler la confirmation du prestataire",
                    "Simular confirmação do prestador",
                  )}
                </Button>
                <Button
                  secondary
                  onClick={() =>
                    act({
                      type: "settlement-payment",
                      id: c.id,
                      version: b.version,
                      result: "failed",
                    })
                  }
                >
                  {t("Simuler un échec", "Simular falha")}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() =>
                  act({
                    type: "settlement-payment",
                    id: c.id,
                    version: b.version,
                    result: "pending",
                  })
                }
              >
                {t(
                  b.status === "failed"
                    ? "Réessayer la simulation"
                    : balance < 0
                      ? "Préparer le remboursement démo"
                      : "Préparer le paiement du solde démo",
                  b.status === "failed"
                    ? "Repetir simulação"
                    : balance < 0
                      ? "Preparar reembolso demo"
                      : "Preparar pagamento do saldo demo",
                )}
              </Button>
            ))}
        </div>
      )}
      {b && b.attempts.length > 0 && (
        <details className="ws-settlement-history">
          <summary>
            {t(
              "Historique des tentatives simulées",
              "Histórico das tentativas simuladas",
            )}
          </summary>
          <ol>
            {b.attempts.map((a, i) => (
              <li key={i}>
                {t(
                  a === "pending"
                    ? "Tentative démarrée"
                    : a === "failed"
                      ? "Échec sans mouvement confirmé"
                      : "Mouvement confirmé dans la démo",
                  a === "pending"
                    ? "Tentativa iniciada"
                    : a === "failed"
                      ? "Falha sem movimento confirmado"
                      : "Movimento confirmado na demo",
                )}
              </li>
            ))}
          </ol>
        </details>
      )}
      {c.settlements.length > 1 && (
        <details className="ws-settlement-history">
          <summary>
            {t(
              "Versions précédentes du bilan",
              "Versões anteriores do balanço",
            )}
          </summary>
          {c.settlements
            .slice(0, -1)
            .reverse()
            .map((old) => (
              <article key={old.version}>
                <h4>
                  v{old.version} · {t(...settlementLabels[old.status])}
                </h4>
                <p className="ws-settlement-note">{old.explanation}</p>
                {old.dispute && <p>{old.dispute}</p>}
                <Amounts c={c} b={old} />
              </article>
            ))}
        </details>
      )}
    </Panel>
  );
}
