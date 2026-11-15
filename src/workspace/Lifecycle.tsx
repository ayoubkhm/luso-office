import { useState } from "react";
import { canWork, settlementLocked, type Case } from "./model";
import { useWorkspace, Button, Field, Form, value, roleNames } from "./ui";

const decisionLabels: Record<
  Case["decisions"][number]["kind"],
  [string, string]
> = {
  "cancel-request": ["Annulation demandée", "Cancelamento pedido"],
  "cancel-withdraw": [
    "Demande d’annulation retirée",
    "Pedido de cancelamento retirado",
  ],
  "cancel-confirm": ["Annulation confirmée", "Cancelamento confirmado"],
  "cancel-decline": [
    "Annulation refusée avec motif",
    "Cancelamento recusado com motivo",
  ],
  correction: [
    "Livrable renvoyé pour correction",
    "Entrega devolvida para correção",
  ],
  reopen: ["Dossier rouvert par l’équipe", "Pedido reaberto pela equipa"],
  restart: [
    "Nouveau dossier issu d’un besoin précédent",
    "Novo pedido a partir de uma necessidade anterior",
  ],
};

export function CaseSituation({ c }: { c: Case }) {
  const { role, t } = useWorkspace();
  if (!c.cancellation && c.stage !== "cancelled") return null;
  return (
    <section
      className="ws-situation"
      aria-label={t("Situation du dossier", "Situação do pedido")}
    >
      <h3>
        {t(
          c.cancellation ? "Annulation à examiner" : "Ce dossier est annulé",
          c.cancellation
            ? "Cancelamento em análise"
            : "Este pedido foi cancelado",
        )}
      </h3>
      <p>
        {t(
          c.cancellation
            ? "Le travail et les nouveaux paiements sont suspendus pendant l’examen. Les messages restent disponibles."
            : "Le dossier et ses échanges sont conservés. L’accès du partenaire a été retiré.",
          c.cancellation
            ? "O trabalho e os novos pagamentos estão suspensos durante a análise. As mensagens continuam disponíveis."
            : "O pedido e as mensagens são conservados. O acesso do parceiro foi retirado.",
        )}
      </p>
      {role !== "partner" && c.cancellation && (
        <blockquote>{c.cancellation.reason}</blockquote>
      )}
      {role !== "partner" && c.payment === "paid" && (
        <p className="ws-hint">
          {t(
            "Provision déjà réglée dans la démo. Après annulation, son bilan est suivi dans « Bilans des dossiers ». Aucun mouvement bancaire réel n’est effectué.",
            "Provisão já paga na demo. Após cancelamento, o balanço é acompanhado em « Balanços dos pedidos ». Não é efetuado nenhum movimento bancário real.",
          )}
        </p>
      )}
      {role !== "partner" && (
        <a className="ws-inline-link" href="#case-decisions">
          {t(
            c.cancellation
              ? "Voir les options d’annulation"
              : "Voir l’historique et les suites",
            c.cancellation
              ? "Ver opções de cancelamento"
              : "Ver histórico e próximos passos",
          )}
        </a>
      )}
      {role !== "partner" && c.payment === "pending" && (
        <p className="ws-hint">
          {t(
            "Une tentative de paiement est encore en attente. Simulez son résultat dans la vue adhérent avant de confirmer l’annulation.",
            "Uma tentativa de pagamento está pendente. Simule o resultado na vista do aderente antes de confirmar o cancelamento.",
          )}
        </p>
      )}
    </section>
  );
}

export function CaseDecisions({ c }: { c: Case }) {
  const { state, role, t, act, go } = useWorkspace();
  const [outcome, setOutcome] = useState("confirm");
  if (role === "partner") return null;
  return (
    <section className="ws-decisions" id="case-decisions">
      {c.stage === "completed" && role === "team" && settlementLocked(c) && (
        <p className="ws-blocker">
          {t(
            "Le bilan financier a déjà été approuvé. Cette démo conserve ce dossier clos ; un nouveau besoin doit être cadré dans une nouvelle demande.",
            "O balanço financeiro já foi aprovado. Esta demo mantém o pedido encerrado; uma nova necessidade deve ser analisada num novo pedido.",
          )}
        </p>
      )}
      {c.cancellation ? (
        <>
          <h3>{t("Examiner l’annulation", "Analisar cancelamento")}</h3>
          {role === "team" && (
            <Form
              onSave={(d) =>
                act({
                  type: "cancel-decision",
                  id: c.id,
                  confirm: outcome === "confirm",
                  reason: value(d, "reason"),
                })
              }
            >
              <Field label={t("Décision de l’équipe", "Decisão da equipa")}>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  <option value="confirm">
                    {t("Confirmer l’annulation", "Confirmar cancelamento")}
                  </option>
                  <option value="decline">
                    {t("Refuser et expliquer", "Recusar e explicar")}
                  </option>
                </select>
              </Field>
              <Field
                label={t(
                  "Motif (obligatoire en cas de refus)",
                  "Motivo (obrigatório em caso de recusa)",
                )}
              >
                <textarea
                  name="reason"
                  rows={3}
                  maxLength={1000}
                  required={outcome === "decline"}
                />
              </Field>
              <p className="ws-hint">
                {t(
                  "La confirmation arrête ce dossier et retire son accès au partenaire. Les tâches restent dans l’historique ; les originaux confiés restent à restituer.",
                  "A confirmação encerra este pedido e retira o acesso do parceiro. As tarefas ficam no histórico; os originais entregues continuam por devolver.",
                )}
              </p>
              <Button
                type="submit"
                disabled={outcome === "confirm" && c.payment === "pending"}
              >
                {t("Enregistrer la décision démo", "Guardar decisão demo")}
              </Button>
            </Form>
          )}
          {role === c.cancellation.by && (
            <Button
              secondary
              onClick={() => act({ type: "cancel-withdraw", id: c.id })}
            >
              {t(
                "Retirer ma demande d’annulation",
                "Retirar o meu pedido de cancelamento",
              )}
            </Button>
          )}
        </>
      ) : (
        <>
          {(c.stage === "delivered" ||
            (c.stage === "completed" &&
              role === "team" &&
              !settlementLocked(c))) && (
            <details className="ws-decision-action">
              <summary>
                {t(
                  c.stage === "completed"
                    ? "Rouvrir pour une correction"
                    : "Demander une correction du livrable",
                  c.stage === "completed"
                    ? "Reabrir para correção"
                    : "Pedir correção da entrega",
                )}
              </summary>
              <Form
                onSave={(d) =>
                  act({
                    type: c.stage === "completed" ? "reopen" : "correction",
                    id: c.id,
                    reason: value(d, "reason"),
                  })
                }
              >
                <p>
                  {t(
                    "Décrivez la correction dans le périmètre convenu. Le dossier repasse en cours avec une tâche attribuée à l’équipe. La provision existante est conservée.",
                    "Descreva a correção no âmbito acordado. O pedido volta a estar em curso com uma tarefa atribuída à equipa. A provisão existente mantém-se.",
                  )}
                </p>
                <Field label={t("Correction attendue", "Correção pretendida")}>
                  <textarea name="reason" required rows={3} maxLength={1000} />
                </Field>
                <Button type="submit">
                  {t(
                    "Créer la tâche de correction",
                    "Criar tarefa de correção",
                  )}
                </Button>
              </Form>
            </details>
          )}
          {canWork(c) && (
            <details className="ws-decision-action">
              <summary>
                {t(
                  "Demander l’annulation du dossier",
                  "Pedir cancelamento do pedido",
                )}
              </summary>
              <Form
                onSave={(d) =>
                  act({
                    type: "cancel-request",
                    id: c.id,
                    reason: value(d, "reason"),
                  })
                }
              >
                <p>
                  {t(
                    "L’équipe examinera la demande et ses conséquences. Le travail est suspendu jusqu’à sa décision ou au retrait de votre demande.",
                    "A equipa analisará o pedido e as suas consequências. O trabalho fica suspenso até à decisão ou à retirada do pedido.",
                  )}
                </p>
                <Field label={t("Motif de la demande", "Motivo do pedido")}>
                  <textarea name="reason" required rows={3} maxLength={1000} />
                </Field>
                <Button secondary type="submit">
                  {t(
                    "Soumettre l’annulation démo",
                    "Submeter cancelamento demo",
                  )}
                </Button>
              </Form>
            </details>
          )}
          {c.stage === "cancelled" && role === "member" && (
            <details className="ws-decision-action">
              <summary>
                {t(
                  "Reprendre ce besoin dans un nouveau dossier",
                  "Retomar esta necessidade num novo pedido",
                )}
              </summary>
              <p>
                {t(
                  "Le service, le bien et la description seront repris. Une nouvelle proposition sera nécessaire ; aucun paiement, document ni accès partenaire ne sera transféré.",
                  "O serviço, o imóvel e a descrição serão reutilizados. Será necessária uma nova proposta; nenhum pagamento, documento ou acesso do parceiro será transferido.",
                )}
              </p>
              <Button
                onClick={() => {
                  if (act({ type: "restart", id: c.id }))
                    go(
                      "requests",
                      `DEMO-${String(state.cases.length + 1).padStart(3, "0")}`,
                    );
                }}
              >
                {t("Créer le nouveau dossier démo", "Criar novo pedido demo")}
              </Button>
            </details>
          )}
        </>
      )}
      {c.decisions.length > 0 && (
        <div className="ws-decision-history">
          <h3>{t("Décisions et reprises", "Decisões e retomas")}</h3>
          <p className="ws-hint">
            {t(
              "Historique de cette session, du plus récent au plus ancien.",
              "Histórico desta sessão, do mais recente ao mais antigo.",
            )}
          </p>
          <ol>
            {[...c.decisions].reverse().map((event, index) => (
              <li key={c.decisions.length - index}>
                <strong>{t(...decisionLabels[event.kind])}</strong>
                <span className="ws-hint">{t(...roleNames[event.role])}</span>
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
