import { useState } from "react";
import { canWork, type Case, type Proposal } from "./model";
import {
  useWorkspace,
  useMoney,
  Badge,
  Button,
  Field,
  Form,
  value,
  roleNames,
} from "./ui";

const statuses: Record<Proposal["status"], [string, string]> = {
  proposed: ["Votre accord attendu", "A aguardar aprovação"],
  "revision-requested": ["Ajustement demandé", "Ajuste pedido"],
  superseded: ["Remplacée", "Substituída"],
  accepted: ["Accord simulé enregistré", "Aprovação simulada registada"],
};
function ProposalAmounts({ p }: { p: Proposal }) {
  const { t } = useWorkspace();
  const money = useMoney();
  return (
    <dl>
      <div>
        <dt>{t("Coordination LusoOffice", "Coordenação LusoOffice")}</dt>
        <dd>{money(p.quote)}</dd>
      </div>
      <div>
        <dt>{t("Frais officiels (scénario)", "Taxas oficiais (cenário)")}</dt>
        <dd>{money(p.fees)}</dd>
      </div>
      <div>
        <dt>
          {t(
            "Prestations de tiers (scénario)",
            "Serviços de terceiros (cenário)",
          )}
        </dt>
        <dd>{money(p.thirdParty)}</dd>
      </div>
      <div>
        <dt>{t("Provision illustrée", "Provisão ilustrativa")}</dt>
        <dd>
          {money(Math.round((p.quote + p.fees + p.thirdParty) * 100) / 100)}
        </dd>
      </div>
    </dl>
  );
}
export function Proposals({ c }: { c: Case }) {
  const { role, t, act } = useWorkspace();
  const money = useMoney();
  const [confirm, setConfirm] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  if (role === "partner") return null;
  const latest = c.proposals.at(-1);
  const previous = c.proposals.at(-2);
  const amount = latest
    ? Math.round((latest.quote + latest.fees + latest.thirdParty) * 100) / 100
    : 0;
  const difference = previous
    ? Math.round(
        (amount - previous.quote - previous.fees - previous.thirdParty) * 100,
      ) / 100
    : 0;
  return (
    <section className="ws-proposal">
      <h3>{t("Proposition de démonstration", "Proposta de demonstração")}</h3>
      <p className="ws-hint">
        {t(
          "Simulation sans valeur contractuelle. L’adhésion et cette prestation restent distinctes. TVA, conditions, déplacements et frais réels sont à confirmer avant toute offre réelle.",
          "Simulação sem valor contratual. A adesão e este serviço são distintos. IVA, condições, deslocações e custos reais devem ser confirmados antes de qualquer proposta real.",
        )}
      </p>
      {latest ? (
        <div className="ws-breakdown">
          <div className="ws-detail-heading">
            <strong>
              {t("Version", "Versão")} {latest.version}
            </strong>
            <Badge good={latest.status === "accepted"}>
              {t(...statuses[latest.status])}
            </Badge>
          </div>
          <h4>
            {t("Ce que couvre la proposition", "O que abrange a proposta")}
          </h4>
          <p className="ws-proposal-copy">{latest.scope}</p>
          <h4>
            {t(
              "Hors périmètre et points à confirmer",
              "Fora do âmbito e pontos a confirmar",
            )}
          </h4>
          <p className="ws-proposal-copy">
            {latest.exclusions ||
              t("À préciser avec l’équipe.", "A definir com a equipa.")}
          </p>
          <ProposalAmounts p={latest} />
          {previous && (
            <p className="ws-hint">
              {t(
                "Écart de provision par rapport à la version précédente",
                "Diferença da provisão face à versão anterior",
              )}{" "}
              : {difference > 0 ? "+" : ""}
              {money(difference)}.
            </p>
          )}
          {latest.revisionReason && (
            <div className="ws-proposal-reason">
              <strong>
                {t("Ajustement demandé par", "Ajuste pedido por")}{" "}
                {t(...roleNames[latest.revisionBy!])}
              </strong>
              <p>{latest.revisionReason}</p>
            </div>
          )}
          {latest.status === "accepted" && (
            <p>
              {t(
                "Cette version est liée à l’accord et à la provision du dossier. Un changement de périmètre après accord demandera un avenant à concevoir séparément.",
                "Esta versão está ligada à aprovação e à provisão do pedido. Uma alteração de âmbito após aprovação exigirá um aditamento a conceber separadamente.",
              )}
            </p>
          )}
        </div>
      ) : (
        <p>
          {t(
            "L’équipe prépare une proposition après le cadrage de votre besoin.",
            "A equipa prepara uma proposta depois de analisar a sua necessidade.",
          )}
        </p>
      )}
      {canWork(c) && c.stage === "quote" && latest?.status === "proposed" && (
        <>
          {role === "member" && (
            <div className="ws-proposal-accept">
              {!confirm ? (
                <Button onClick={() => setConfirm(true)}>
                  {t(
                    "Vérifier avant de simuler mon accord",
                    "Rever antes de simular aprovação",
                  )}
                </Button>
              ) : (
                <>
                  <p>
                    <strong>
                      {t(
                        "Vous examinez la version",
                        "Está a analisar a versão",
                      )}{" "}
                      {latest.version} · {money(amount)}
                    </strong>
                  </p>
                  <label className="ws-check">
                    <input
                      type="checkbox"
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                    />
                    <span>
                      {t(
                        "J’ai consulté le périmètre, les points à confirmer et le détail de cette proposition de démonstration.",
                        "Consultei o âmbito, os pontos a confirmar e o detalhe desta proposta de demonstração.",
                      )}
                    </span>
                  </label>
                  <div className="ws-actions">
                    <Button
                      disabled={!reviewed}
                      onClick={() =>
                        act({
                          type: "accept-quote",
                          id: c.id,
                          version: latest.version,
                        })
                      }
                    >
                      {t(
                        "Simuler mon accord sur cette version",
                        "Simular aprovação desta versão",
                      )}
                    </Button>
                    <Button
                      secondary
                      onClick={() => {
                        setConfirm(false);
                        setReviewed(false);
                      }}
                    >
                      {t("Revenir à la proposition", "Voltar à proposta")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          <details className="ws-decision-action">
            <summary>
              {t(
                role === "member"
                  ? "Demander un ajustement"
                  : "Retirer cette version pour la réviser",
                role === "member"
                  ? "Pedir um ajuste"
                  : "Retirar esta versão para rever",
              )}
            </summary>
            <Form
              onSave={(d) =>
                act({
                  type: "revise-quote",
                  id: c.id,
                  version: latest.version,
                  reason: value(d, "reason"),
                })
              }
            >
              <p>
                {t(
                  "Cette version ne pourra plus être acceptée. L’équipe préparera une nouvelle proposition ; l’ancienne restera consultable.",
                  "Esta versão deixará de poder ser aprovada. A equipa preparará nova proposta; a anterior continuará disponível.",
                )}
              </p>
              <Field
                label={t("Modification souhaitée", "Alteração pretendida")}
              >
                <textarea name="reason" required rows={3} maxLength={1000} />
              </Field>
              <Button secondary type="submit">
                {t(
                  "Renvoyer au cadrage dans la démo",
                  "Devolver à análise na demo",
                )}
              </Button>
            </Form>
          </details>
        </>
      )}
      {canWork(c) && role === "team" && c.stage === "review" && (
        <Form
          onSave={(d) =>
            act({
              type: "quote",
              id: c.id,
              quote: Number(value(d, "quote")),
              fees: Number(value(d, "fees")),
              thirdParty: Number(value(d, "thirdParty")),
              scope: value(d, "scope"),
              exclusions: value(d, "exclusions"),
            })
          }
        >
          <h4>
            {t("Préparer la version", "Preparar versão")}{" "}
            {c.proposals.length + 1}
          </h4>
          <Field label={t("Périmètre proposé", "Âmbito proposto")}>
            <textarea
              name="scope"
              required
              rows={4}
              maxLength={4000}
              defaultValue={latest?.scope || ""}
            />
          </Field>
          <Field
            label={t(
              "Exclusions et points à confirmer",
              "Exclusões e pontos a confirmar",
            )}
          >
            <textarea
              name="exclusions"
              rows={3}
              maxLength={2000}
              defaultValue={latest?.exclusions || ""}
            />
          </Field>
          <div className="ws-three">
            {[
              ["quote", t("Coordination (€)", "Coordenação (€)")],
              ["fees", t("Frais officiels (€)", "Taxas oficiais (€)")],
              ["thirdParty", t("Tiers (€)", "Terceiros (€)")],
            ].map(([name, label]) => (
              <Field key={name} label={label}>
                <input
                  name={name}
                  type="number"
                  min={name === "quote" ? "0.01" : "0"}
                  max="100000"
                  step="0.01"
                  required
                  defaultValue={
                    latest
                      ? latest[name as "quote" | "fees" | "thirdParty"]
                      : name === "quote"
                        ? ""
                        : "0"
                  }
                />
              </Field>
            ))}
          </div>
          <Button type="submit">
            {t(
              "Soumettre cette version à l’adhérent",
              "Submeter esta versão ao aderente",
            )}
          </Button>
        </Form>
      )}
      {c.proposals.length > 1 && (
        <details className="ws-proposal-history">
          <summary>
            {t(
              "Consulter les versions précédentes",
              "Consultar versões anteriores",
            )}{" "}
            ({c.proposals.length - 1})
          </summary>
          {c.proposals
            .slice(0, -1)
            .reverse()
            .map((p) => (
              <article className="ws-breakdown" key={p.version}>
                <div className="ws-detail-heading">
                  <strong>
                    {t("Version", "Versão")} {p.version}
                  </strong>
                  <Badge>{t(...statuses[p.status])}</Badge>
                </div>
                <p className="ws-proposal-copy">{p.scope}</p>
                <p className="ws-proposal-copy ws-hint">
                  {p.exclusions ||
                    t(
                      "Points à confirmer non précisés.",
                      "Pontos a confirmar não especificados.",
                    )}
                </p>
                <ProposalAmounts p={p} />
                {p.revisionReason && (
                  <p className="ws-proposal-copy">
                    {t("Motif de révision", "Motivo da revisão")} :{" "}
                    {p.revisionReason}
                  </p>
                )}
              </article>
            ))}
        </details>
      )}
    </section>
  );
}
