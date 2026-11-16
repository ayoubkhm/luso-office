import { translate, languages, languageNames } from "../locales";
import { Button, Field, Form, Panel, useWorkspace, value } from "./ui";
export function SubscriptionCalendar() {
  const { state, role, t, act, lang } = useWorkspace();
  const sub = state.subscription;
  const date = (s?: string) =>
    s
      ? new Intl.DateTimeFormat(lang, {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(new Date(s + "T12:00:00Z"))
      : t("Pas encore commencée", "Ainda não iniciada");
  return (
    <Panel title={t("Calendrier de l’adhésion", "Calendário da adesão")}>
      <p className="ws-hint">
        {t(
          "Dates fictives pour tester le parcours. Ce calendrier ne fixe aucune condition commerciale, période de grâce ou règle de prorata.",
          "Datas fictícias para testar o percurso. Este calendário não define condições comerciais, períodos de tolerância ou regras de proporcionalidade.",
        )}
      </p>
      <dl className="ws-breakdown">
        <div>
          <dt>{t("Date simulée", "Data simulada")}</dt>
          <dd>{date(state.demoToday)}</dd>
        </div>
        <div>
          <dt>{t("Début de la période", "Início do período")}</dt>
          <dd>{date(sub.startedOn)}</dd>
        </div>
        <div>
          <dt>
            {t(
              sub.cancelAtEnd ? "Fin prévue des droits" : "Prochaine échéance",
              sub.cancelAtEnd
                ? "Fim previsto dos direitos"
                : "Próximo vencimento",
            )}
          </dt>
          <dd>{date(sub.renewsOn)}</dd>
        </div>
      </dl>
      {!sub.active && sub.startedOn && (
        <p className="ws-blocker">
          {t(
            sub.cancelAtEnd
              ? "L’adhésion a expiré dans ce scénario. Vos dossiers restent accessibles."
              : "L’échéance est dépassée : préparez une nouvelle tentative dans les formules ci-dessous. Les droits adhérent sont suspendus dans ce scénario.",
            sub.cancelAtEnd
              ? "A adesão expirou neste cenário. Os pedidos continuam acessíveis."
              : "O vencimento foi ultrapassado: prepare uma nova tentativa nos planos abaixo. Os direitos de aderente estão suspensos neste cenário.",
          )}
        </p>
      )}
      <ol>
        {sub.timeline?.map((event, i) => (
          <li key={i}>
            {date(event.day)} ·{" "}
            {t(
              {
                started: "Adhésion commencée",
                renewed: "Nouvelle période confirmée",
                expired: "Adhésion expirée",
                overdue: "Échéance non réglée",
              }[event.event],
              {
                started: "Adesão iniciada",
                renewed: "Novo período confirmado",
                expired: "Adesão expirada",
                overdue: "Vencimento não pago",
              }[event.event],
            )}
          </li>
        ))}
      </ol>
      {role === "member" && (
        <details>
          <summary>{t("Tester une échéance", "Testar um vencimento")}</summary>
          <Form
            onSave={(d) => act({ type: "demo-date", day: value(d, "day") })}
          >
            <Field
              label={t(
                "Avancer la date de démonstration",
                "Avançar a data de demonstração",
              )}
            >
              <input
                type="date"
                name="day"
                required
                min={state.demoToday}
                defaultValue={sub.renewsOn || state.demoToday}
              />
            </Field>
            <p>
              {t(
                "Les droits peuvent expirer. Aucun paiement automatique ne sera déclenché. La réinitialisation permet de revenir au scénario initial.",
                "Os direitos podem expirar. Nenhum pagamento automático será iniciado. Reponha a demo para voltar ao cenário inicial.",
              )}
            </p>
            <Button disabled={sub.payment === "pending"} type="submit">
              {t("Avancer dans le scénario", "Avançar no cenário")}
            </Button>
            {sub.payment === "pending" && (
              <p>
                {t(
                  "Résolvez d’abord le paiement en attente.",
                  "Resolva primeiro o pagamento pendente.",
                )}
              </p>
            )}
          </Form>
        </details>
      )}
    </Panel>
  );
}
