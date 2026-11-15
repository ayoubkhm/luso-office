import { useEffect, useRef, useState } from "react";
import {
  demoScenarios,
  type DemoScenario,
  type DemoStep,
  type ScenarioId,
} from "./scenarios";
import { useWorkspace, Button, Badge, roleNames } from "./ui";

export function DemoGuide({
  start,
  active,
  completed,
  openStep,
}: {
  start: (id: ScenarioId) => void;
  active?: DemoScenario;
  completed: number;
  openStep: (step: DemoStep) => void;
}) {
  const { t } = useWorkspace();
  const [pending, setPending] = useState<ScenarioId | null>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (pending) confirmation.current?.focus();
  }, [pending]);
  const candidate = demoScenarios.find((s) => s.id === pending);
  return (
    <>
      <p className="ws-guide-intro">
        {t(
          "Choisissez une situation à tester. La démo vous indiquera quelle action réaliser et dans quel rôle, en conservant le même dossier entre les étapes.",
          "Escolha uma situação para testar. A demo indicará a ação e o papel, mantendo o mesmo pedido entre etapas.",
        )}
      </p>
      <div className="ws-guide-principles">
        <p>
          <strong>
            {t("Des exemples prêts à explorer", "Exemplos prontos a explorar")}
          </strong>
          {t(
            "Chaque parcours charge les données fictives dont il a besoin.",
            "Cada percurso carrega os dados fictícios de que precisa.",
          )}
        </p>
        <p>
          <strong>{t("Vous gardez la main", "Mantém o controlo")}</strong>
          {t(
            "Les étapes se valident après vos actions. Aucun envoi ni paiement réel.",
            "As etapas são verificadas após as suas ações. Sem envio nem pagamento real.",
          )}
        </p>
      </div>
      {candidate && (
        <div
          ref={confirmation}
          tabIndex={-1}
          className="ws-guide-confirm"
          role="region"
          aria-label={t("Charger un parcours", "Carregar percurso")}
        >
          <h2>
            {t("Charger", "Carregar")} « {t(...candidate.title)} » ?
          </h2>
          <p>
            {t(
              "Cela remplacera les dossiers, messages, brouillons et autres modifications de la session actuelle. Les changements ne sont pas sauvegardés ailleurs.",
              "Isto substituirá os pedidos, mensagens, rascunhos e outras alterações da sessão atual. As alterações não são guardadas noutro local.",
            )}
          </p>
          <div className="ws-actions">
            <Button
              onClick={() => {
                start(candidate.id);
                setPending(null);
              }}
            >
              {t("Charger cet exemple", "Carregar este exemplo")}
            </Button>
            <Button
              secondary
              onClick={() => {
                setPending(null);
                requestAnimationFrame(() => opener.current?.focus());
              }}
            >
              {t("Conserver ma session", "Manter a minha sessão")}
            </Button>
          </div>
        </div>
      )}
      <div className="ws-guide-grid">
        {demoScenarios.map((s) => (
          <article className="ws-guide-card" key={s.id}>
            <small>
              {s.steps.length} {t("étapes", "etapas")}
            </small>
            <h2>{t(...s.title)}</h2>
            <p>{t(...s.description)}</p>
            <ol>
              {s.steps.map((step, i) => (
                <li key={i}>
                  <span>{t(...roleNames[step.role])}</span>
                  {t(...step.title)}
                </li>
              ))}
            </ol>
            <div className="ws-actions">
              {active?.id === s.id && completed < s.steps.length && (
                <Button onClick={() => openStep(s.steps[completed])}>
                  {t("Reprendre à l’étape", "Retomar na etapa")} {completed + 1}
                </Button>
              )}
              <Button
                secondary
                onClick={() => {
                  opener.current =
                    document.activeElement instanceof HTMLButtonElement
                      ? document.activeElement
                      : null;
                  setPending(s.id);
                }}
              >
                {t(
                  active?.id === s.id
                    ? "Recommencer cet exemple"
                    : "Explorer cet exemple",
                  active?.id === s.id
                    ? "Recomeçar este exemplo"
                    : "Explorar este exemplo",
                )}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function GuideProgress({
  scenario,
  completed,
  openStep,
  exit,
}: {
  scenario: DemoScenario;
  completed: number;
  openStep: (step: DemoStep) => void;
  exit: () => void;
}) {
  const { t, go } = useWorkspace();
  const next = scenario.steps[completed];
  return (
    <aside
      className="ws-guide-progress"
      aria-label={t("Parcours en cours", "Percurso em curso")}
    >
      <div className="ws-guide-progress-title">
        <strong>{t(...scenario.title)}</strong>
        <Badge good={!next}>
          {completed}/{scenario.steps.length}
        </Badge>
      </div>
      <progress
        value={completed}
        max={scenario.steps.length}
        aria-label={t("Étapes réalisées", "Etapas realizadas")}
      />
      <div aria-live="polite">
        {next ? (
          <>
            <p>
              <strong>
                {t("Étape", "Etapa")} {completed + 1} · {t(...next.title)}
              </strong>
            </p>
            <p>{t(...next.instruction)}</p>
          </>
        ) : (
          <p>
            {t(
              "Parcours réalisé. Vous pouvez continuer à explorer cette session ou charger un autre exemple.",
              "Percurso realizado. Pode continuar a explorar esta sessão ou carregar outro exemplo.",
            )}
          </p>
        )}
      </div>
      <div className="ws-actions">
        {next && (
          <Button onClick={() => openStep(next)}>
            {t("Ouvrir cette étape", "Abrir esta etapa")} ·{" "}
            {t(...roleNames[next.role])}
          </Button>
        )}
        <Button secondary onClick={() => go("guide")}>
          {t("Voir les parcours", "Ver percursos")}
        </Button>
        <button className="ws-inline-link" onClick={exit}>
          {t(
            "Quitter le guide, garder la session",
            "Sair do guia, manter a sessão",
          )}
        </button>
      </div>
    </aside>
  );
}
