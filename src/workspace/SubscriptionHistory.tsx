import { translate, languages, languageNames } from "../locales";
import { useState } from "react";
import type { SubscriptionAttempt } from "./model";
import type { Lang } from "../catalogue";
import { Badge, Button, Field, Panel, useMoney, useWorkspace } from "./ui";

const statuses: Record<SubscriptionAttempt["status"], [string, string]> = {
  pending: ["Résultat en attente", "Resultado pendente"],
  failed: ["Tentative refusée (simulation)", "Tentativa recusada (simulação)"],
  paid: [
    "Changement confirmé (simulation)",
    "Alteração confirmada (simulação)",
  ],
};
export function subscriptionSummary(a: SubscriptionAttempt, lang: Lang) {
  const t = (fr: string, pt: string) => translate(fr, pt, lang);
  const period = (value: SubscriptionAttempt["period"]) =>
    value === "annual" ? t("annuel", "anual") : t("mensuel", "mensal");
  return [
    "LusoOffice — DEMO",
    t(
      "Simulation sans valeur fiscale, contractuelle ou bancaire. Aucun paiement réel. Ce document n’est ni une facture ni une preuve de paiement.",
      "Simulação sem valor fiscal, contratual ou bancário. Sem pagamento real. Este documento não é uma fatura nem um comprovativo de pagamento.",
    ),
    `${t("Essai de la session", "Tentativa da sessão")} #${a.id}`,
    `${t("Avant la tentative", "Antes da tentativa")} : ${a.previousPlan} / ${period(a.previousPeriod)}`,
    `${t("Changement demandé", "Alteração pedida")} : ${a.plan} / ${period(a.period)}`,
    `${t("Tarif indicatif de référence", "Preço indicativo de referência")} : ${new Intl.NumberFormat(lang, { style: "currency", currency: "EUR" }).format(a.amount)}`,
    t(
      "TVA, prorata, date d’effet et conditions : à valider. Aucun montant effectivement débité n’est calculé.",
      "IVA, proporção, data de efeito e condições: por validar. Não é calculado qualquer montante efetivamente debitado.",
    ),
    `${t("Résultat", "Resultado")} : ${t(...statuses[a.status])}`,
    a.status === "paid"
      ? t(
          "Cette tentative a activé la formule demandée dans la démo. Des changements ultérieurs peuvent l’avoir remplacée.",
          "Esta tentativa ativou o plano pedido na demo. Alterações posteriores podem tê-lo substituído.",
        )
      : t(
          "Cette tentative n’a pas modifié les droits du compte.",
          "Esta tentativa não alterou os direitos da conta.",
        ),
  ].join("\n\n");
}

export function SubscriptionHistory() {
  const { state, role, lang, t } = useWorkspace();
  const money = useMoney();
  const [filter, setFilter] = useState("all");
  if (role === "partner") return null;
  const attempts = state.subscription.attempts
    .filter((a) => filter === "all" || a.status === filter)
    .slice()
    .reverse();
  const download = (a: SubscriptionAttempt) => {
    const url = URL.createObjectURL(
      new Blob([subscriptionSummary(a, lang)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `lusooffice-DEMO-adhesion-${a.id}-${lang}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Panel
      title={t(
        "Historique des changements d’adhésion",
        "Histórico de alterações da adesão",
      )}
    >
      <p className="ws-hint">
        {t(
          "Les essais du scénario sont conservés pendant cette session. Aucun relevé bancaire historique, prélèvement réel ni facture.",
          "As tentativas do cenário são conservadas durante esta sessão. Sem extrato bancário histórico, débito real ou fatura.",
        )}
      </p>
      <Field label={t("Résultat de la tentative", "Resultado da tentativa")}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">
            {t("Tous les essais", "Todas as tentativas")}
          </option>
          {Object.entries(statuses).map(([key, label]) => (
            <option value={key} key={key}>
              {t(...label)}
            </option>
          ))}
        </select>
      </Field>
      <p className="ws-hint" role="status">
        {attempts.length} {t("essai(s)", "tentativa(s)")}
      </p>
      {attempts.map((a) => (
        <article className="ws-subscription-attempt" key={a.id}>
          <div className="ws-detail-heading">
            <strong>
              {t("Essai", "Tentativa")} #{a.id} · {a.plan}
            </strong>
            <Badge good={a.status === "paid"}>{t(...statuses[a.status])}</Badge>
          </div>
          <p>
            {a.previousPlan} /{" "}
            {a.previousPeriod === "annual"
              ? t("annuel", "anual")
              : t("mensuel", "mensal")}{" "}
            → {a.plan} /{" "}
            {a.period === "annual"
              ? t("annuel", "anual")
              : t("mensuel", "mensal")}
          </p>
          <p className="ws-hint">
            {t(
              "Tarif indicatif de référence",
              "Preço indicativo de referência",
            )}{" "}
            : {money(a.amount)}.{" "}
            {t(
              "Prorata et date d’effet non calculés.",
              "Proporção e data de efeito não calculadas.",
            )}
          </p>
          <details>
            <summary>
              {t("Consulter le récapitulatif démo", "Consultar resumo demo")}
            </summary>
            <p className="ws-sample ws-attempt-summary">
              {subscriptionSummary(a, lang)}
            </p>
            <Button secondary onClick={() => download(a)}>
              {t(
                "Télécharger le récapitulatif texte",
                "Descarregar resumo em texto",
              )}
            </Button>
          </details>
        </article>
      ))}
      {!attempts.length && (
        <p className="ws-empty">
          {t(
            state.subscription.attempts.length
              ? "Aucun essai ne correspond à ce filtre."
              : "Aucun changement essayé pendant cette session.",
            state.subscription.attempts.length
              ? "Nenhuma tentativa corresponde a este filtro."
              : "Nenhuma alteração tentada nesta sessão.",
          )}
        </p>
      )}
    </Panel>
  );
}
