import { WorkspaceNavigation } from "./WorkspaceNavigation";
import { canAccessView } from "./permissions";
import {
  hasUnsavedFields,
  historyCursor,
  initializeHistory,
  navigationEvent,
  pushWorkspaceHistory,
  replaceWorkspaceHistory,
} from "./navigation";
import { exampleText } from "../locales/examples";
import { MarketChoice, type Currency } from "../MarketChoice";
import { translate, languages, languageNames } from "../locales";
import {
  PeopleSelectors,
  PeopleDesk,
  ClientForm,
  StaffAssignment,
  viewsForActor,
} from "./People";
import { SubscriptionCalendar } from "./SubscriptionCalendar";
import { SessionTools } from "./SessionTools";
import {
  sessionKey,
  restoreSession,
  routeHash,
  readWorkspaceRoute,
  handoffKey,
  readHandoff,
  type SessionLog,
  type RequestHandoff,
} from "./session";
import { Deliveries } from "./Deliveries";
import {
  caseNavigationContext,
  type CaseDestination,
  type CaseIntent,
} from "./caseRouting";
import { Newsletter } from "./Newsletter";
import { SubscriptionHistory } from "./SubscriptionHistory";
import { Documents } from "./Documents";
import {
  CaseNavigation,
  CaseSection,
  useCaseNavigation,
} from "./CaseNavigation";
import { Activity } from "./ActivityJournal";
import { Settlements, settlementLabels } from "./Settlements";
import { DemoGuide, GuideProgress } from "./DemoGuide";
import {
  demoScenarios,
  scenarioState,
  advanceScenario,
  type ScenarioId,
  type DemoStep,
} from "./scenarios";
import { Family } from "./Family";
import { Proposals } from "./Proposals";
import { ActionQueue, Messages } from "./Inbox";
import { CaseSituation, CaseDecisions } from "./Lifecycle";
import {
  WorkspaceContext,
  useWorkspace,
  labels,
  roleNames,
  type View,
  Button,
  Field,
  Panel,
  Badge,
  Form,
  value,
  useMoney,
  serviceName,
} from "./ui";
import {
  Tasks,
  CaseRequirements,
  PropertyEditor,
  PartnerAccess,
} from "./Operations";
import { useEffect, useRef, useState } from "react";
import { services, plans, type Lang } from "../catalogue";
import { href, route as pageRoute } from "../routes";
import {
  initialState,
  attentionItems,
  unreadMessages,
  canWork,
  isClosed,
  transition,
  visibleCases,
  visibleDocuments,
  matchingCases,
  missingRequirements,
  openTasks,
  total,
  stageLabels,
  stages,
  type Role,
  type Action,
  type Case,
  type PaymentState,
} from "./model";
import "./workspace.css";

function PaymentControls({
  status,
  onChange,
}: {
  status: PaymentState;
  onChange: (status: PaymentState) => void;
}) {
  const { t, lang } = useWorkspace();
  return (
    <div className="ws-payment">
      <Badge good={status === "paid"}>
        {t(
          {
            unpaid: "À régler",
            pending: "Vérification en cours",
            failed: "Paiement refusé",
            paid: "Paiement simulé confirmé",
          }[status],
          {
            unpaid: "Por pagar",
            pending: "Em verificação",
            failed: "Pagamento recusado",
            paid: "Pagamento simulado confirmado",
          }[status],
        )}
      </Badge>
      {status === "pending" ? (
        <>
          <p>
            {t(
              "Scénario du retour du prestataire de paiement. Aucune carte ni opération bancaire.",
              "Cenário de resposta do prestador de pagamento. Sem cartão nem operação bancária.",
            )}
          </p>
          <div className="ws-actions">
            <Button onClick={() => onChange("paid")}>
              {t("Simuler la confirmation", "Simular confirmação")}
            </Button>
            <Button secondary onClick={() => onChange("failed")}>
              {t("Simuler un refus", "Simular recusa")}
            </Button>
          </div>
        </>
      ) : (
        status !== "paid" && (
          <Button onClick={() => onChange("pending")}>
            {t(
              status === "failed"
                ? "Réessayer la simulation"
                : "Simuler le paiement",
              status === "failed" ? "Repetir simulação" : "Simular pagamento",
            )}
          </Button>
        )
      )}
    </div>
  );
}

export function Workspace({ lang: initialLang }: { lang: Lang }) {
  const [lang, setLang] = useState(initialLang),
    [state, setState] = useState(initialState),
    [role, setRole] = useState<Role>("member"),
    [view, setView] = useState<View>("overview"),
    [selected, setSelected] = useState("DEMO-001"),
    [notice, setNotice] = useState(""),
    [actionError, setActionError] = useState(""),
    [reset, setReset] = useState(false),
    [scenarioId, setScenarioId] = useState<ScenarioId | null>(null),
    [completed, setCompleted] = useState(0),
    [epoch, setEpoch] = useState(0);
  const [caseIntent, setCaseIntent] = useState<CaseIntent>();
  const navigationCounter = useRef(0);
  const cursor = useRef<{ url: string; index: number } | undefined>(undefined);
  const restoringCursor = useRef(false);
  const confirmLeave = () =>
    !hasUnsavedFields() ||
    window.confirm(
      t(
        "Une saisie n’a pas été enregistrée. Quitter cet écran et abandonner cette saisie ?",
        "Há dados por guardar. Sair deste ecrã e descartar esses dados?",
      ),
    );
  const log = useRef<SessionLog>({ version: 2, base: null, events: [] });
  const [savedSession, setSavedSession] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [handoff, setHandoff] = useState<RequestHandoff | null>(null);
  const [ready, setReady] = useState(false);
  const applyRoute = (hash: string, source = state) => {
    const route = readWorkspaceRoute(hash);
    const c = visibleCases(source, route.role).find((c) => c.id === route.id);
    if (!route.destination)
      requestAnimationFrame(() => heading.current?.focus());
    setRole(route.role);
    const target = canAccessView(source, route.role, route.view)
      ? route.view
      : viewsForActor(source, route.role)[0];
    setView(target);
    if (target !== route.view)
      replaceWorkspaceHistory(routeHash(target, route.role));
    setSelected(c?.id || visibleCases(source, route.role)[0]?.id || "");
    setCaseIntent(
      c && route.destination
        ? {
            caseId: c.id,
            role: route.role,
            context: caseNavigationContext(c),
            token: ++navigationCounter.current,
            destination: route.destination,
          }
        : undefined,
    );
  };
  useEffect(() => {
    initializeHistory();
    cursor.current = historyCursor();
    applyRoute(location.hash);
    try {
      setSavedSession(Boolean(localStorage.getItem(sessionKey)));
      const raw = sessionStorage.getItem(handoffKey);
      if (raw) setHandoff(readHandoff(raw));
    } catch {
      setStorageError(
        t(
          "Le stockage du navigateur n’est pas disponible. La démo reste utilisable en mémoire.",
          "O armazenamento não está disponível. A demo continua utilizável em memória.",
        ),
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    const remember = () => {
      cursor.current = historyCursor();
    };
    window.addEventListener(navigationEvent, remember);
    return () => window.removeEventListener(navigationEvent, remember);
  }, []);
  useEffect(() => {
    const back = () => {
      if (restoringCursor.current) {
        restoringCursor.current = false;
        cursor.current = historyCursor();
        return;
      }
      const target = readWorkspaceRoute(location.hash);
      const cases = visibleCases(state, target.role);
      const id =
        cases.find((c) => c.id === target.id)?.id || cases[0]?.id || "";
      const leavesForm =
        target.role !== role || target.view !== view || id !== selected;
      if (leavesForm && !confirmLeave()) {
        const previous = cursor.current;
        const delta = previous ? previous.index - historyCursor().index : 0;
        if (delta) {
          restoringCursor.current = true;
          history.go(delta);
        } else if (previous) replaceWorkspaceHistory(previous.url);
        return;
      }
      cursor.current = historyCursor();
      setLang(pageRoute(location.pathname, location.search).lang);
      applyRoute(location.hash);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [state, role, view, selected, lang]);
  useEffect(() => {
    if (!ready || !saveEnabled) return;
    try {
      const content = JSON.stringify(log.current);
      if (content.length > 2_000_000 || log.current.events.length > 5000)
        throw new Error("session-size");
      localStorage.setItem(sessionKey, content);
      setSavedSession(true);
      setStorageError("");
    } catch {
      setSaveEnabled(false);
      setStorageError(
        t(
          "La sauvegarde a échoué. Votre session reste ouverte ; libérez de l’espace puis réessayez.",
          "A gravação falhou. A sessão continua aberta; liberte espaço e tente novamente.",
        ),
      );
    }
  }, [state, saveEnabled, ready]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      const unsaved = hasUnsavedFields();
      if (unsaved || (log.current.events.length && !saveEnabled)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveEnabled]);
  const discardSave = () => {
    try {
      localStorage.removeItem(sessionKey);
      setSavedSession(false);
      setSaveEnabled(false);
      setStorageError("");
    } catch {
      setStorageError(
        t(
          "Impossible d’effacer la sauvegarde dans ce navigateur.",
          "Não foi possível apagar a gravação neste navegador.",
        ),
      );
    }
  };
  const resumeSave = () => {
    if (!confirmLeave()) return;
    try {
      const restored = restoreSession(localStorage.getItem(sessionKey) || "");
      log.current = restored.log;
      setState(restored.state);
      setEpoch((x) => x + 1);
      setScenarioId(null);
      setSaveEnabled(true);
      applyRoute(location.hash, restored.state);
      setStorageError("");
    } catch {
      setStorageError(
        t(
          "Cette sauvegarde est incompatible ou endommagée. Vous pouvez l’effacer et repartir du scénario initial.",
          "Esta gravação é incompatível ou está danificada. Pode apagá-la e iniciar o cenário inicial.",
        ),
      );
    }
  };

  const select = (id: string) => {
    if (id !== selected && !confirmLeave()) return;
    setSelected(id);
    setCaseIntent(undefined);
    pushWorkspaceHistory(routeHash(view, role, id));
  };
  const scenario = demoScenarios.find((s) => s.id === scenarioId);
  const t = (fr: string, pt: string) => translate(fr, pt, lang);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title =
      "O meu Portugal — " + t("Maquette LusoOffice", "Protótipo LusoOffice");
    document.documentElement.lang = lang;
    if (ready) {
      const query = new URLSearchParams(location.search);
      query.delete("lang");
      replaceWorkspaceHistory(
        href(
          "workspace",
          lang,
          (query.size ? `?${query}` : "") + location.hash,
        ),
      );
    }
  }, [lang, ready]);
  const go = (
    v: View,
    id?: string,
    destination?: CaseDestination,
    asRole: Role = role,
    source = state,
    discardConfirmed = false,
  ) => {
    if (!canAccessView(source, asRole, v)) return false;
    if (
      !discardConfirmed &&
      (v !== view ||
        asRole !== role ||
        (id !== undefined && id !== selected)) &&
      !confirmLeave()
    )
      return false;
    pushWorkspaceHistory(routeHash(v, asRole, id, destination));
    setRole(asRole);
    setView(v);
    if (id) setSelected(id);
    const c = id
      ? visibleCases(source, asRole).find((c) => c.id === id)
      : undefined;
    setCaseIntent(
      v === "requests" && c && destination
        ? {
            caseId: c.id,
            role: asRole,
            token: ++navigationCounter.current,
            context: caseNavigationContext(c),
            destination,
          }
        : undefined,
    );
    setNotice("");
    setActionError("");
    if (!destination) requestAnimationFrame(() => heading.current?.focus());
    return true;
  };
  const act = (a: Action) => {
    if (["actor-select", "client-select"].includes(a.type) && !confirmLeave())
      return false;
    const result = transition(state, role, a);
    setActionError(result.ok ? "" : t(...result.error!));
    const event = result.ok ? result.state.audit.at(-1) : undefined;
    if (!["message-draft", "message-read", "edition-draft"].includes(a.type))
      setNotice(
        event
          ? `${t(...event.title)}${event.caseId ? ` · ${event.caseId}` : ""}. ${t("Enregistré dans la démo.", "Guardado na demo.")}`
          : t(
              ...(result.error || ["Opération refusée.", "Operação recusada."]),
            ),
      );
    if (result.ok) {
      const last = log.current.events.at(-1);
      if (
        last?.role === role &&
        last.action.type === a.type &&
        ["message-draft", "edition-draft"].includes(a.type) &&
        ("id" in a ? "id" in last.action && last.action.id === a.id : true)
      )
        log.current.events[log.current.events.length - 1] = { role, action: a };
      else log.current.events.push({ role, action: a });
      setState(result.state);
      if (["actor-select", "client-select", "client-create"].includes(a.type)) {
        setEpoch((x) => x + 1);
        const allowed = viewsForActor(result.state, role);
        const target =
          a.type === "client-create"
            ? "requests"
            : allowed.includes(view)
              ? view
              : allowed[0];
        setView(target);
        setSelected(visibleCases(result.state, role)[0]?.id || "");
        setCaseIntent(undefined);
        pushWorkspaceHistory(routeHash(target, role));
      }
      if (
        scenario &&
        !["message-draft", "message-read", "edition-draft"].includes(a.type)
      )
        setCompleted(advanceScenario(scenario, result.state, completed));
    }
    return result.ok;
  };
  const views = viewsForActor(state, role);
  const openStep = (step: DemoStep) => {
    const accessible = visibleCases(state, step.role);
    const id =
      accessible.find((c) => c.id === step.caseId)?.id ||
      accessible[0]?.id ||
      "";
    go(step.view, id, undefined, step.role);
  };
  const startScenario = (id: ScenarioId) => {
    if (!confirmLeave()) return;
    const chosen = demoScenarios.find((s) => s.id === id)!;
    const next = scenarioState(id);
    log.current = { version: 2, base: id, events: [] };
    setState(next);
    setScenarioId(id);
    setCompleted(0);
    setEpoch((x) => x + 1);
    setReset(false);
    setRole(chosen.steps[0].role);
    setSelected(
      chosen.steps[0].caseId ||
        visibleCases(next, chosen.steps[0].role)[0]?.id ||
        "",
    );
    go(
      chosen.steps[0].view,
      chosen.steps[0].caseId,
      undefined,
      chosen.steps[0].role,
      next,
      true,
    );
  };
  return (
    <WorkspaceContext.Provider
      value={{
        state,
        role,
        lang,
        act,
        go,
        selected,
        select,
        t,
        caseIntent,
        error: actionError,
      }}
    >
      <div className="workspace">
        <a className="skip-link" href="#workspace-main">
          {t("Aller au contenu", "Ir para o conteúdo")}
        </a>
        <div className="ws-demo">
          <span>
            <strong>{t("Atelier de conception", "Atelier de conceção")}</strong>{" "}
            {t(
              "Données fictives. Sauvegarde locale facultative dans « Session de démonstration ».",
              "Dados fictícios. Gravação local facultativa em « Sessão de demonstração ».",
            )}
          </span>
        </div>
        <header className="ws-top">
          <a href={href("home", lang)} className="wordmark">
            Luso<span>Office</span>
          </a>
          <a className="ws-back" href={href("home", lang)}>
            {t("Retour au site", "Voltar ao site")}
          </a>
          <div className="ws-language" aria-label={t("Langue", "Idioma")}>
            {languages.map((l) => (
              <button
                key={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                lang={l}
                title={languageNames[l]}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
        <details
          className="ws-demo-tools"
          open={savedSession && !saveEnabled ? true : undefined}
        >
          <summary>
            {t("Réglages de la démo", "Definições da demo")}
            <span>{t(...roleNames[role])}</span>
          </summary>
          <div className="ws-demo-selectors">
            <Field label={t("Explorer la vue démo", "Explorar a vista demo")}>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value as Role;
                  const accessible = visibleCases(state, r);
                  const id =
                    accessible.find((c) => c.id === selected)?.id ||
                    accessible[0]?.id ||
                    "";
                  go(
                    viewsForActor(state, r).includes(view)
                      ? view
                      : viewsForActor(state, r)[0],
                    id,
                    undefined,
                    r,
                  );
                }}
              >
                {Object.entries(roleNames).map(([r, l]) => (
                  <option key={r} value={r}>
                    {t(...l)}
                  </option>
                ))}
              </select>
            </Field>
            <PeopleSelectors />
          </div>
          <div className="ws-demo-actions">
            {views.includes("guide") && (
              <button onClick={() => go("guide")}>
                {t("Parcours guidés", "Percursos guiados")}
              </button>
            )}
            <button onClick={() => setReset(!reset)}>
              {t("Réinitialiser", "Repor")}
            </button>
          </div>
          {reset && (
            <div className="ws-reset">
              <p>
                {t(
                  "Revenir au scénario initial ? Les modifications de cette maquette seront effacées.",
                  "Voltar ao cenário inicial? As alterações deste protótipo serão apagadas.",
                )}
              </p>
              <Button
                onClick={() => {
                  log.current = { version: 2, base: null, events: [] };
                  setState(initialState());
                  setScenarioId(null);
                  setCompleted(0);
                  setEpoch((x) => x + 1);
                  setReset(false);
                  setSelected("DEMO-001");
                  go(
                    "overview",
                    "DEMO-001",
                    undefined,
                    role,
                    initialState(),
                    true,
                  );
                }}
              >
                {t("Revenir au début", "Voltar ao início")}
              </Button>
              <Button secondary onClick={() => setReset(false)}>
                {t("Conserver", "Manter")}
              </Button>
            </div>
          )}
          <SessionTools
            t={t}
            saved={savedSession}
            enabled={saveEnabled}
            error={storageError}
            resume={resumeSave}
            discard={discardSave}
            enable={() => setSaveEnabled(true)}
          />
        </details>
        {handoff && (
          <div className="ws-handoff">
            <h2>
              {t(
                "Votre préparation depuis le catalogue",
                "A sua preparação do catálogo",
              )}
            </h2>
            <p>
              {handoff.name} · {handoff.country}
            </p>
            <p>{handoff.description}</p>
            <p>
              {t(
                "Ce brouillon n’a pas été envoyé. Vous pourrez le modifier avant de créer une demande fictive.",
                "Este rascunho não foi enviado. Pode alterá-lo antes de criar um pedido fictício.",
              )}
            </p>
            <Button
              onClick={() => {
                go("requests", undefined, undefined, "member");
              }}
            >
              {t("Continuer ma demande", "Continuar pedido")}
            </Button>
            <Button
              secondary
              onClick={() => {
                setHandoff(null);
                try {
                  sessionStorage.removeItem(handoffKey);
                } catch {}
              }}
            >
              {t("Abandonner cette préparation", "Descartar preparação")}
            </Button>
          </div>
        )}
        <div className="ws-layout">
          <WorkspaceNavigation view={view} />
          <main id="workspace-main" className="ws-main">
            <div className="ws-page-heading">
              <p>LusoOffice / {t(...roleNames[role])}</p>
              <h1 ref={heading} tabIndex={-1}>
                {view === "overview"
                  ? t(
                      role === "member"
                        ? "Le Portugal, à portée de main."
                        : role === "team"
                          ? "À chaque dossier, sa prochaine étape."
                          : "Vos missions, au bon endroit.",
                      role === "member"
                        ? "Portugal, sempre por perto."
                        : role === "team"
                          ? "Cada pedido tem um próximo passo."
                          : "As suas missões, no lugar certo.",
                    )
                  : t(...labels[view])}
              </h1>
            </div>
            <p className="ws-feedback" role="status" aria-live="polite">
              {notice}
            </p>
            {scenario && (
              <GuideProgress
                scenario={scenario}
                completed={completed}
                openStep={openStep}
                exit={() => setScenarioId(null)}
              />
            )}
            <div key={`${role}-${epoch}`}>
              {views.includes(view) && (
                <>
                  {view === "guide" && (
                    <DemoGuide
                      start={startScenario}
                      active={scenario}
                      completed={completed}
                      openStep={openStep}
                    />
                  )}
                  {view === "overview" && <Overview />}
                  {view === "requests" && (
                    <Requests
                      handoff={handoff}
                      consumed={() => {
                        setHandoff(null);
                        try {
                          sessionStorage.removeItem(handoffKey);
                        } catch {}
                      }}
                    />
                  )}
                  {view === "tasks" && <Tasks />}
                  {view === "properties" && <Properties />}
                  {view === "documents" && <Documents key={selected} />}
                  {view === "messages" && <Messages />}
                  {view === "billing" && <Billing />}
                  {view === "settlements" && <Settlements />}
                  {view === "profile" && <Profile />}
                  {view === "newsletter" && (
                    <Newsletter key={state.archives.length} />
                  )}
                  {view === "admin" && <Administration />}
                </>
              )}
            </div>
            <footer className="ws-footer">
              <strong>
                {t(
                  "Confidentialité de la maquette",
                  "Privacidade do protótipo",
                )}
              </strong>
              <p>
                {t(
                  "N’utilisez que des exemples. Aucun fichier réel, mot de passe ou numéro de carte n’est demandé. Les vues de rôle servent à la revue de conception ; elles ne constituent pas une authentification.",
                  "Utilize apenas exemplos. Não são pedidos ficheiros reais, palavras-passe ou números de cartão. As vistas servem para rever a conceção; não constituem autenticação.",
                )}
              </p>
            </footer>
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
function Overview() {
  const { state, role, lang, t, go } = useWorkspace();
  const cases = visibleCases(state, role);
  const pending = attentionItems(state, role);
  if (role === "partner" && !state.partnerEnabled)
    return (
      <Panel
        title={t("Votre accès est suspendu", "O seu acesso está suspenso")}
      >
        <p>
          {t(
            "Aucun dossier ou document n’est accessible dans cette vue. L’équipe peut revoir l’accès depuis Administration.",
            "Nenhum pedido ou documento está acessível nesta vista. A equipa pode rever o acesso em Administração.",
          )}
        </p>
      </Panel>
    );
  return (
    <>
      <div className="ws-welcome">
        <div>
          <Badge>
            {t("Scénario de démonstration", "Cenário de demonstração")}
          </Badge>
          <h2>
            {t(
              role === "member"
                ? "Une maison, des projets. Un fil à garder."
                : "Le bon interlocuteur, au bon moment.",
              role === "member"
                ? "Uma casa, projetos. Uma ligação a manter."
                : "O interlocutor certo, no momento certo.",
            )}
          </h2>
          <p>
            {t(
              role === "member"
                ? "Retrouvez ce qui attend votre accord et ce qui avance au Portugal."
                : "Consultez les dossiers attribués, les pièces partagées et les échanges utiles.",
              role === "member"
                ? "Veja o que espera pela sua aprovação e o que avança em Portugal."
                : "Consulte os pedidos atribuídos, os documentos partilhados e as mensagens úteis.",
            )}
          </p>
          <Button onClick={() => go("requests")}>
            {t(
              role === "member"
                ? "Préparer une demande"
                : "Ouvrir les dossiers",
              role === "member" ? "Preparar um pedido" : "Abrir pedidos",
            )}
          </Button>
        </div>
        <div className="ws-tile" aria-hidden="true" />
      </div>
      <div className="ws-summary">
        <div>
          <strong>{cases.filter((c) => !isClosed(c)).length}</strong>
          <span>{t("dossiers ouverts", "pedidos abertos")}</span>
        </div>
        <div>
          <strong>{pending.length}</strong>
          <span>{t("actions à examiner", "ações a analisar")}</span>
        </div>
        <div>
          <strong>{visibleDocuments(state, role).length}</strong>
          <span>{t("documents accessibles", "documentos acessíveis")}</span>
        </div>
      </div>
      <p className="ws-guide-discovery">
        {t("Première visite de la démo ?", "Primeira visita à demo?")}{" "}
        <button className="ws-inline-link" onClick={() => go("guide")}>
          {t("Choisir un parcours guidé", "Escolher um percurso guiado")}
        </button>
      </p>
      <ActionQueue />
      <div className="ws-two">
        <Panel
          title={t(
            "Un échange rattaché à chaque dossier",
            "Uma conversa por pedido",
          )}
        >
          <p>
            {t(
              "Les messages et documents restent dans leur contexte. L’équipe garde ses notes internes à part.",
              "As mensagens e os documentos mantêm o contexto. A equipa guarda as notas internas separadamente.",
            )}
          </p>
          <Button secondary onClick={() => go("messages")}>
            {t("Voir les échanges", "Ver conversas")}
          </Button>
        </Panel>
        <Panel
          title={
            role === "member"
              ? `${state.subscription.plan} · DEMO`
              : t(
                  "Accès limités au nécessaire",
                  "Acessos limitados ao necessário",
                )
          }
        >
          <p>
            {t(
              role === "member"
                ? "Votre adhésion et vos prestations restent deux éléments distincts. Consultez le détail avant chaque règlement."
                : "Le partenaire ne voit que ses missions et les documents explicitement partagés. Les notes internes et la facturation client lui sont masquées.",
              role === "member"
                ? "A adesão e os serviços são distintos. Consulte o detalhe antes de cada pagamento."
                : "O parceiro vê apenas as suas missões e os documentos partilhados. As notas internas e a faturação do cliente não são visíveis.",
            )}
          </p>
        </Panel>
      </div>
    </>
  );
}
function Requests({
  handoff,
  consumed,
}: {
  handoff: RequestHandoff | null;
  consumed: () => void;
}) {
  const { state, role, lang, t, act, selected, select, caseIntent } =
    useWorkspace();
  const cases = visibleCases(state, role);
  const [filter, setFilter] = useState("all"),
    [create, setCreate] = useState(Boolean(handoff)),
    [query, setQuery] = useState("");
  useEffect(() => {
    setFilter("all");
    setQuery("");
  }, [state.cases.length, caseIntent?.token]);
  const shown = matchingCases(state, role, query, filter, lang);
  const current = shown.find((c) => c.id === selected) || shown[0];
  return (
    <>
      {role === "member" && <ClientForm />}
      <div className="ws-toolbar">
        <Field label={t("Rechercher un dossier", "Pesquisar pedido")}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Service, numéro, bien…",
              "Serviço, número, imóvel…",
            )}
          />
        </Field>
        <Field label={t("État du dossier", "Estado do pedido")}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t("Tous", "Todos")}</option>
            <option value="cancellation">
              {t("Annulation à examiner", "Cancelamento em análise")}
            </option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {t(...stageLabels[s])}
              </option>
            ))}
          </select>
        </Field>
        {role === "member" && (
          <Button onClick={() => setCreate(!create)}>
            {t(
              create ? "Fermer le formulaire" : "Nouvelle demande démo",
              create ? "Fechar formulário" : "Novo pedido demo",
            )}
          </Button>
        )}
      </div>
      {create && (
        <Panel title={t("Décrivez votre besoin", "Descreva o que precisa")}>
          <Form
            onSave={(d) => {
              const ok = act({
                type: "request",
                customer: handoff
                  ? {
                      name: handoff.name,
                      country: handoff.country || "TBD",
                      currency: handoff.currency || "EUR",
                    }
                  : undefined,
                service: value(d, "service"),
                property: value(d, "property"),
                description: value(d, "description"),
              });
              if (ok) {
                consumed();
                setCreate(false);
                setFilter("all");
                setQuery("");
                select(
                  `DEMO-${String(state.cases.length + 1).padStart(3, "0")}`,
                );
              }
              return ok;
            }}
          >
            <Field label={t("Service", "Serviço")}>
              <select name="service" defaultValue={handoff?.service}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[lang]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Bien concerné", "Imóvel associado")}>
              <select name="property">
                <option value="">
                  {t("Sans bien associé", "Sem imóvel associado")}
                </option>
                {state.properties
                  .filter(
                    (p) =>
                      !handoff && (p.owner || "demo") === state.activeClient,
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {exampleText(p.name, lang)}
                    </option>
                  ))}
              </select>
            </Field>
            <Field
              label={t(
                "Situation et échéance souhaitée — exemple uniquement",
                "Situação e prazo pretendido — apenas exemplo",
              )}
            >
              <textarea
                name="description"
                required
                maxLength={2000}
                rows={3}
                defaultValue={handoff?.description}
              />
            </Field>
            <p className="ws-hint">
              {t(
                "Après réception : cadrage par l’équipe, proposition détaillée, votre accord, puis provision. Aucun délai n’est garanti.",
                "Após receção: análise da equipa, proposta detalhada, aprovação e provisão. Sem prazo garantido.",
              )}
            </p>
            <Button type="submit">
              {t("Simuler l’envoi à l’équipe", "Simular envio à equipa")}
            </Button>
          </Form>
        </Panel>
      )}
      <p className="ws-hint" role="status">
        {shown.length} {t("dossier(s) trouvé(s)", "pedido(s) encontrado(s)")}
      </p>
      <div className="ws-case-layout">
        <section
          className="ws-case-list"
          aria-label={t("Liste des demandes", "Lista de pedidos")}
        >
          {shown.length ? (
            shown.map((c) => (
              <button
                className={current?.id === c.id ? "selected" : ""}
                key={c.id}
                onClick={() => select(c.id)}
                aria-pressed={current?.id === c.id}
              >
                <small>{c.id}</small>
                <strong>{serviceName(c.service, lang)}</strong>
                <Badge>
                  {c.cancellation
                    ? t("Annulation à examiner", "Cancelamento em análise")
                    : t(...stageLabels[c.stage])}
                </Badge>
              </button>
            ))
          ) : (
            <div className="ws-empty">
              <p>
                {t(
                  "Aucun dossier ne correspond à votre recherche.",
                  "Nenhum pedido corresponde à sua pesquisa.",
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
            </div>
          )}
        </section>
        {current && <CaseDetail key={current.id} c={current} />}
      </div>
    </>
  );
}
export function CaseDetail({ c }: { c: Case }) {
  const { state, role, lang, t, act, go } = useWorkspace();
  const missing = missingRequirements(state, c.id).length;
  const remaining = openTasks(state, c.id).length;
  const navigation = useCaseNavigation(c, role);
  return (
    <article ref={navigation.root} className="ws-panel ws-case-detail">
      <div className="ws-detail-heading">
        <small>{c.id}</small>
        <Badge good={c.stage === "completed"}>
          {t(...stageLabels[c.stage])}
        </Badge>
      </div>
      <h2>{serviceName(c.service, lang)}</h2>
      <p>{exampleText(c.description, lang)}</p>
      <p className="ws-hint">
        {t("Bien", "Imóvel")} :{" "}
        {state.properties.find((p) => p.id === c.property)?.name ||
          t("Non associé", "Não associado")}
      </p>
      <CaseSituation
        c={c}
        onDecisions={() => navigation.open("decisions")}
        onPayment={() => navigation.open("proposal")}
      />
      {c.sourceCase && (
        <p className="ws-hint">
          {t("Besoin repris depuis", "Necessidade retomada de")} {c.sourceCase}.{" "}
          {t("Proposition indépendante.", "Proposta independente.")}
        </p>
      )}
      <div className="ws-actions">
        <Button secondary onClick={() => go("messages", c.id)}>
          {t("Ouvrir les messages", "Abrir mensagens")}
        </Button>
        <Button secondary onClick={() => go("documents", c.id)}>
          {t("Voir les documents", "Ver documentos")}
        </Button>
      </div>
      <CaseNavigation navigation={navigation} />
      <CaseSection navigation={navigation} name="progress">
        <ol className="ws-timeline">
          {c.history.map((s, i) => (
            <li key={i}>
              <span aria-hidden="true">✓</span>
              {t(...stageLabels[s as keyof typeof stageLabels])}
            </li>
          ))}
        </ol>
        <div className="ws-actions">
          {canWork(c) && role === "team" && c.stage === "submitted" && (
            <Button
              onClick={() => act({ type: "stage", id: c.id, stage: "review" })}
            >
              {t("Commencer le cadrage", "Iniciar análise")}
            </Button>
          )}
          {canWork(c) && role === "team" && c.stage === "approved" && (
            <Button
              disabled={c.payment !== "paid" || missing > 0}
              onClick={() =>
                act({ type: "stage", id: c.id, stage: "inprogress" })
              }
            >
              {t("Démarrer la mission", "Iniciar missão")}
            </Button>
          )}
          {canWork(c) && role === "team" && c.stage === "delivered" && (
            <Button
              disabled={
                missing > 0 ||
                remaining > 0 ||
                c.deliveries?.at(-1)?.status !== "accepted"
              }
              onClick={() =>
                act({ type: "stage", id: c.id, stage: "completed" })
              }
            >
              {t("Valider la clôture", "Validar conclusão")}
            </Button>
          )}
        </div>
        {canWork(c) && (missing > 0 || remaining > 0) && (
          <p className="ws-blocker">
            {t("Avant la remise du dossier :", "Antes da entrega do pedido:")}{" "}
            {missing > 0 &&
              t(
                "des pièces restent à vérifier. ",
                "há documentos por verificar. ",
              )}
            {remaining > 0 &&
              `${remaining} ${t("tâche(s) à terminer.", "tarefa(s) por concluir.")}`}
          </p>
        )}
        <Deliveries key={`${c.id}-${c.deliveries?.length}`} c={c} />
        <CaseRequirements caseId={c.id} />
        <details
          className="ws-case-tasks"
          ref={navigation.tasksRef}
          open={navigation.taskFilter ? true : undefined}
        >
          <summary>
            {t("Tâches du dossier", "Tarefas do pedido")} ({remaining})
          </summary>
          <Tasks
            key={c.id}
            caseId={c.id}
            initialFilter={navigation.taskFilter}
            navigationToken={navigation.intentToken}
          />
        </details>
        {canWork(c) && role === "team" && c.stage === "approved" && (
          <p>
            {t(
              "La mission démarre après confirmation de la provision dans la vue adhérent.",
              "A missão começa após confirmação da provisão na vista do aderente.",
            )}
          </p>
        )}
      </CaseSection>
      <CaseSection navigation={navigation} name="proposal">
        <Proposals key={`${c.id}-${c.stage}-${c.proposals.length}`} c={c} />
        {role === "member" &&
          c.stage === "approved" &&
          (canWork(c) || c.payment === "pending") && (
            <PaymentControls
              status={c.payment}
              onChange={(result) => act({ type: "pay", id: c.id, result })}
            />
          )}
      </CaseSection>
      <CaseSection navigation={navigation} name="decisions">
        <Deliveries readOnly key={`${c.id}-${c.deliveries?.length}`} c={c} />
        <CaseDecisions
          key={`${c.id}-${c.stage}-${Boolean(c.cancellation)}`}
          c={c}
        />
      </CaseSection>
      <CaseSection navigation={navigation} name="team">
        {role === "team" && (
          <div className="ws-assignment">
            <h3>{t("Attribution de la mission", "Atribuição da missão")}</h3>
            <StaffAssignment c={c} />
            <p>
              {t(
                c.partner
                  ? "Attribuée au partenaire démo. Seules les pièces partagées lui sont visibles."
                  : "Traitée par l’équipe. Aucun partenaire n’a accès à ce dossier.",
                c.partner
                  ? "Atribuída ao parceiro demo. Apenas os documentos partilhados são visíveis."
                  : "Tratada pela equipa. Nenhum parceiro tem acesso a este pedido.",
              )}
            </p>
            <Button
              secondary
              disabled={!c.partner && (!canWork(c) || !state.partnerEnabled)}
              onClick={() =>
                act({ type: "assign", id: c.id, assigned: !c.partner })
              }
            >
              {t(
                c.partner
                  ? "Retirer l’accès du partenaire"
                  : "Attribuer au partenaire démo",
                c.partner
                  ? "Retirar acesso do parceiro"
                  : "Atribuir ao parceiro demo",
              )}
            </Button>
          </div>
        )}
        {role === "team" && (
          <details className="ws-internal">
            <summary>
              {t(
                "Notes internes · équipe uniquement",
                "Notas internas · apenas equipa",
              )}
            </summary>
            {c.notes.map((n, i) => (
              <p key={i}>{n}</p>
            ))}
            <Form
              onSave={(d) =>
                act({ type: "note", id: c.id, body: value(d, "note") })
              }
            >
              <Field
                label={t("Ajouter une note interne", "Adicionar nota interna")}
              >
                <textarea name="note" required maxLength={1000} />
              </Field>
              <Button secondary type="submit">
                {t("Conserver la note", "Guardar nota")}
              </Button>
            </Form>
          </details>
        )}
        {role === "team" && (
          <details className="ws-internal">
            <summary>
              {t(
                "Consulter l’activité du dossier",
                "Consultar atividade do pedido",
              )}
            </summary>
            <Activity caseId={c.id} />
          </details>
        )}
      </CaseSection>
    </article>
  );
}
function Properties() {
  const { state, t, act, go, lang } = useWorkspace();
  return (
    <div className="ws-two">
      <div>
        {state.properties
          .filter((p) => (p.owner || "demo") === state.activeClient)
          .map((p) => (
            <Panel title={exampleText(p.name, lang)} key={p.id}>
              <Badge>
                {t("Bien de démonstration", "Imóvel de demonstração")}
              </Badge>
              <p>{exampleText(p.town, lang)}</p>
              <p>
                {state.cases.filter((c) => c.property === p.id).length}{" "}
                {t("dossier(s) associé(s)", "pedido(s) associado(s)")}
              </p>
              {state.cases
                .filter((c) => c.property === p.id)
                .map((c) => (
                  <Button
                    key={c.id}
                    secondary
                    onClick={() => go("requests", c.id)}
                  >
                    {c.id}
                  </Button>
                ))}
              <PropertyEditor id={p.id} />
            </Panel>
          ))}
      </div>
      <Panel
        title={t("Ajouter un bien d’exemple", "Adicionar imóvel de exemplo")}
      >
        <Form
          onSave={(d) =>
            act({
              type: "property",
              name: value(d, "name"),
              town: value(d, "town"),
            })
          }
        >
          <Field label={t("Nom du bien", "Nome do imóvel")}>
            <input name="name" required maxLength={80} />
          </Field>
          <Field label={t("Commune fictive", "Localidade fictícia")}>
            <input name="town" required maxLength={100} />
          </Field>
          <p>
            {t(
              "La version connectée prévoira adresse, accès autorisés et justificatifs de mandat. Ne saisissez pas de code d’accès ici.",
              "A versão ligada incluirá morada, acessos autorizados e comprovativos de mandato. Não introduza códigos de acesso aqui.",
            )}
          </p>
          <Button type="submit">
            {t("Ajouter à la maquette", "Adicionar ao protótipo")}
          </Button>
        </Form>
      </Panel>
    </div>
  );
}

export function Billing() {
  const { state, role, t, lang, act, go } = useWorkspace();
  const money = useMoney();
  const sub = state.subscription;
  const [plan, setPlan] = useState(sub.pending?.plan ?? sub.plan),
    [period, setPeriod] = useState(sub.pending?.period ?? sub.period),
    [confirm, setConfirm] = useState(false);
  const displayedPlan = sub.pending?.plan ?? plan;
  const displayedPeriod = sub.pending?.period ?? period;
  const proposal = plans.find((p) => p.id === displayedPlan)!;
  const currentChoice =
    sub.active && plan === sub.plan && period === sub.period;
  const pendingAttempt = sub.pending ? sub.attempts.at(-1) : undefined;
  if (role === "partner") return null;
  return (
    <>
      <SubscriptionCalendar />
      <p className="ws-intro">
        {t(
          "L’adhésion donne accès aux avantages du plan. Chaque prestation, provision et éventuel ajustement conserve son propre suivi.",
          "A adesão dá acesso às vantagens do plano. Cada serviço, provisão e eventual acerto tem o seu próprio acompanhamento.",
        )}
      </p>
      <div className="ws-two">
        <Panel title={t("Adhésion de démonstration", "Adesão de demonstração")}>
          <div className="ws-membership-card">
            <span>LusoOffice</span>
            <strong>{sub.plan}</strong>
            <span>O meu Portugal</span>
            <small>
              DEMO · 0001 ·{" "}
              {t("Carte fictive, sans valeur", "Cartão fictício, sem validade")}
            </small>
          </div>
          <p>
            {t(
              sub.period === "annual"
                ? "Modalité annuelle"
                : "Modalité mensuelle",
              sub.period === "annual"
                ? "Modalidade anual"
                : "Modalidade mensal",
            )}
          </p>
          <Badge good={sub.active}>
            {t(
              sub.active
                ? "Droits actifs dans le scénario"
                : "Adhésion inactive",
              sub.active ? "Direitos ativos no cenário" : "Adesão inativa",
            )}
          </Badge>
          <p>
            {t(
              sub.cancelAtEnd
                ? "Renouvellement désactivé. Le calendrier ci-dessus montre la fin des droits dans ce scénario."
                : "Renouvellement prévu dans le calendrier de démonstration. Conditions commerciales à valider.",
              sub.cancelAtEnd
                ? "Renovação desativada no protótipo. Os direitos mantêm-se até ao termo, a definir no contrato."
                : "Renovação prevista no cenário. Data, modalidades e condições: por validar.",
            )}
          </p>
          {role === "member" && (
            <>
              <Button secondary onClick={() => setConfirm(true)}>
                {t(
                  sub.cancelAtEnd
                    ? "Réactiver le renouvellement démo"
                    : "Préparer la résiliation à échéance",
                  sub.cancelAtEnd
                    ? "Reativar renovação demo"
                    : "Preparar cancelamento no termo",
                )}
              </Button>
              {confirm && (
                <div className="ws-confirm">
                  <p>
                    {t(
                      "Cette action modifie uniquement le scénario de renouvellement, sans annuler les demandes en cours.",
                      "Esta ação altera apenas o cenário de renovação, sem cancelar os pedidos em curso.",
                    )}
                  </p>
                  <Button
                    onClick={() => {
                      act({ type: "cancel", cancel: !sub.cancelAtEnd });
                      setConfirm(false);
                    }}
                  >
                    {t("Confirmer la simulation", "Confirmar simulação")}
                  </Button>
                  <Button secondary onClick={() => setConfirm(false)}>
                    {t("Revenir", "Voltar")}
                  </Button>
                </div>
              )}
            </>
          )}
        </Panel>
        <Panel
          title={t(
            "Préparer un changement de formule",
            "Preparar alteração de plano",
          )}
        >
          {role === "member" ? (
            <>
              <div className="ws-form">
                <Field label={t("Formule proposée", "Plano proposto")}>
                  <select
                    value={displayedPlan}
                    disabled={sub.payment === "pending"}
                    onChange={(e) => setPlan(e.target.value as typeof plan)}
                  >
                    <option>Member</option>
                    <option>Family</option>
                    <option disabled>Premium</option>
                  </select>
                </Field>
                <Field label={t("Modalité", "Modalidade")}>
                  <select
                    value={displayedPeriod}
                    disabled={sub.payment === "pending"}
                    onChange={(e) => setPeriod(e.target.value as typeof period)}
                  >
                    <option value="annual">{t("Annuelle", "Anual")}</option>
                    <option value="monthly">{t("Mensuelle", "Mensal")}</option>
                  </select>
                </Field>
              </div>
              <p className="ws-plan-price">
                {money(
                  pendingAttempt?.amount ??
                    (displayedPeriod === "annual"
                      ? proposal.annual
                      : proposal.monthly),
                )}
                <small>
                  {" "}
                  /{" "}
                  {t(
                    displayedPeriod === "annual" ? "an" : "mois",
                    displayedPeriod === "annual" ? "ano" : "mês",
                  )}
                </small>
              </p>
              <p>
                {t(
                  "Tarif indicatif du brief, TVA et conditions à valider. Premium reste à l’étude. Prorata et date d’effet ne sont pas calculés dans cette maquette.",
                  "Valor indicativo do briefing, IVA e condições por validar. Premium permanece em estudo. Proporção e data de efeito não são calculadas neste protótipo.",
                )}
              </p>
              {sub.plan === "Family" && displayedPlan === "Member" && (
                <p className="ws-blocker">
                  {t(
                    "Dans la démo, un passage confirmé à Member retirera les invitations et accès Family. Une tentative échouée conserve les droits actuels. Aucun partage ne sera rétabli automatiquement lors d’un retour à Family.",
                    "Na demo, uma mudança confirmada para Member retirará os convites e acessos Family. Uma tentativa falhada mantém os direitos atuais. Nenhuma partilha será restabelecida automaticamente ao regressar a Family.",
                  )}
                </p>
              )}
              <Button
                disabled={sub.payment === "pending" || currentChoice}
                onClick={() => act({ type: "subscription", plan, period })}
              >
                {t("Préparer le paiement démo", "Preparar pagamento demo")}
              </Button>
              {currentChoice && !sub.pending && (
                <p className="ws-hint">
                  {t(
                    "Cette formule et cette modalité sont déjà actives. Choisissez un changement pour préparer un essai.",
                    "Este plano e esta modalidade já estão ativos. Escolha uma alteração para preparar uma tentativa.",
                  )}
                </p>
              )}
              {sub.pending && (
                <p>
                  {t("Changement en attente", "Alteração pendente")} #
                  {pendingAttempt?.id} : {sub.pending.plan} /{" "}
                  {sub.pending.period === "annual"
                    ? t("annuel", "anual")
                    : t("mensuel", "mensal")}
                </p>
              )}
              {sub.payment === "pending" && (
                <p className="ws-hint">
                  {t(
                    "Le choix est figé pour cette tentative. Simulez son résultat avant de préparer un autre changement ; les droits actuels restent inchangés en attendant.",
                    "A escolha fica fixada para esta tentativa. Simule o resultado antes de preparar outra alteração; os direitos atuais mantêm-se entretanto.",
                  )}
                </p>
              )}
              {sub.payment === "pending" && (
                <PaymentControls
                  status={sub.payment}
                  onChange={(result) =>
                    act({ type: "subscription-payment", result })
                  }
                />
              )}
              {sub.payment === "failed" && (
                <p role="status">
                  {t(
                    "Paiement refusé dans le scénario. Votre formule précédente est conservée ; vous pouvez préparer un nouvel essai.",
                    "Pagamento recusado no cenário. O plano anterior mantém-se; pode preparar nova tentativa.",
                  )}
                </p>
              )}
              <p className="ws-hint">
                {t(
                  "Parcours prévus : carte ou mandat de prélèvement chez le prestataire de paiement. Aucun renseignement bancaire ici.",
                  "Percursos previstos: cartão ou mandato de débito direto no prestador de pagamento. Sem dados bancários aqui.",
                )}
              </p>
            </>
          ) : (
            <p>
              {t(
                "Les changements de formule et le paiement sont à explorer dans la vue adhérent. L’équipe ne marque pas manuellement un paiement comme réussi.",
                "As alterações de plano e o pagamento estão na vista do aderente. A equipa não marca manualmente um pagamento como concluído.",
              )}
            </p>
          )}
        </Panel>
      </div>
      <SubscriptionHistory />
      <Panel
        title={t(
          "Prestations, provisions et pièces de facturation",
          "Serviços, provisões e documentos de faturação",
        )}
      >
        <p>
          {t(
            "Exemples non fiscaux. Une confirmation de paiement ne remplace pas une facture ; l’émission numérotée et les avoirs seront reliés à la facturation.",
            "Exemplos sem valor fiscal. Uma confirmação de pagamento não substitui uma fatura; a emissão numerada e as notas de crédito serão ligadas à faturação.",
          )}
        </p>
        {visibleCases(state, role)
          .filter((c) => c.quote > 0)
          .map((c) => (
            <div className="ws-invoice" key={c.id}>
              <div>
                <small>{c.id} · DEMO</small>
                <strong>{serviceName(c.service, lang)}</strong>
              </div>
              <strong>{money(total(c))}</strong>
              <Badge
                good={
                  c.settlements.length
                    ? c.settlements.at(-1)?.status === "settled"
                    : c.payment === "paid"
                }
              >
                {c.settlements.at(-1)
                  ? t(...settlementLabels[c.settlements.at(-1)!.status])
                  : t(
                      c.stage === "review"
                        ? "Proposition en révision"
                        : c.stage === "quote"
                          ? "Proposition non acceptée"
                          : c.stage === "cancelled" && c.payment === "paid"
                            ? "Annulée · bilan à préparer"
                            : c.stage === "cancelled"
                              ? "Annulée · aucune provision encaissée"
                              : c.payment === "paid"
                                ? "Provision simulée réglée"
                                : "Provision à suivre",
                      c.stage === "review"
                        ? "Proposta em revisão"
                        : c.stage === "quote"
                          ? "Proposta não aprovada"
                          : c.stage === "cancelled" && c.payment === "paid"
                            ? "Cancelado · balanço por preparar"
                            : c.stage === "cancelled"
                              ? "Cancelado · sem provisão recebida"
                              : c.payment === "paid"
                                ? "Provisão simulada paga"
                                : "Provisão a acompanhar",
                    )}
              </Badge>
              <Button
                secondary
                onClick={() => go("requests", c.id, { section: "proposal" })}
              >
                {t("Voir le détail", "Ver detalhe")}
              </Button>
              {isClosed(c) && c.payment === "paid" && (
                <Button secondary onClick={() => go("settlements", c.id)}>
                  {t("Ouvrir le bilan", "Abrir balanço")}
                </Button>
              )}
              <details>
                <summary>
                  {t(
                    "Aperçu de pièce de démonstration",
                    "Pré-visualizar documento demo",
                  )}
                </summary>
                <div className="ws-sample">
                  <strong>
                    DEMO — {t("Sans valeur fiscale", "Sem valor fiscal")}
                  </strong>
                  <p>
                    {t(
                      "Émetteur / NIPC / adresse / TVA : TBD. Client : compte démo. Aucun numéro de facture émis.",
                      "Emitente / NIPC / morada / IVA: TBD. Cliente: conta demo. Sem número de fatura emitido.",
                    )}
                  </p>
                  <p>
                    {t("Prestation", "Serviço")} :{" "}
                    {serviceName(c.service, lang)} · {money(total(c))}
                  </p>
                </div>
              </details>
            </div>
          ))}
      </Panel>
    </>
  );
}
function Profile() {
  const { state, t, act, lang } = useWorkspace();
  return (
    <div className="ws-two">
      <Panel title={t("Profil et préférences", "Perfil e preferências")}>
        <Form
          onSave={(d) => {
            return act({
              type: "profile",
              profile: {
                name: value(d, "name"),
                country: value(d, "country"),
                language: value(d, "language") as Lang,
                currency: value(d, "currency") as Currency,
                consent: d.has("consent"),
              },
            });
          }}
        >
          <MarketChoice
            lang={lang}
            name="currency"
            value={state.profile.currency || "EUR"}
          />
          <Field label={t("Nom de démonstration", "Nome de demonstração")}>
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={state.profile.name}
            />
          </Field>
          <Field label={t("Pays de résidence", "País de residência")}>
            <select name="country" defaultValue={state.profile.country}>
              {[
                "France",
                "Portugal",
                "United States",
                "Luxembourg",
                "Belgique / België",
                "Deutschland",
                "United Kingdom",
                "Schweiz / Suisse",
                "Autre / Outro",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field
            label={t("Langue de correspondance", "Idioma de correspondência")}
          >
            <select name="language" defaultValue={state.profile.language}>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {languageNames[l]}
                </option>
              ))}
            </select>
          </Field>
          <p>
            {t(
              "Les montants de démonstration restent en EUR. La devise souhaitée est transmise comme préférence pour un futur devis.",
              "Os valores de demonstração mantêm-se em EUR. A moeda pretendida é transmitida como preferência para um futuro orçamento.",
            )}
          </p>
          <label className="ws-check">
            <input
              name="consent"
              type="checkbox"
              defaultChecked={state.profile.consent}
            />
            <span>
              {t(
                "Recevoir le journal mensuel en portugais (préférence simulée)",
                "Receber o jornal mensal em português (preferência simulada)",
              )}
            </span>
          </label>
          <Button type="submit">
            {t("Conserver les préférences démo", "Guardar preferências demo")}
          </Button>
        </Form>
      </Panel>
      <div>
        <Panel
          title={t(
            "Compte et sécurité : parcours prévu",
            "Conta e segurança: percurso previsto",
          )}
        >
          <ol className="ws-steps">
            <li>
              {t(
                "Vérifier l’adresse e-mail avant l’ouverture du compte.",
                "Verificar o endereço de e-mail antes da abertura da conta.",
              )}
            </li>
            <li>
              {t(
                "Se connecter, récupérer son accès et fermer ses sessions.",
                "Entrar, recuperar o acesso e terminar sessões.",
              )}
            </li>
            <li>
              {t(
                "Renforcer la connexion de l’équipe et des partenaires.",
                "Reforçar o acesso da equipa e dos parceiros.",
              )}
            </li>
            <li>
              {t(
                "Demander l’export ou la suppression des données selon les règles de conservation à définir.",
                "Pedir exportação ou eliminação dos dados conforme as regras de conservação a definir.",
              )}
            </li>
          </ol>
          <p className="ws-hint">
            {t(
              "La maquette n’ouvre aucun compte et ne collecte aucun mot de passe.",
              "O protótipo não abre contas nem recolhe palavras-passe.",
            )}
          </p>
        </Panel>
        <Family />
      </div>
    </div>
  );
}

function Administration() {
  const { state, t, lang } = useWorkspace();
  return (
    <>
      <PeopleDesk />
      <PartnerAccess />
      <div className="ws-two">
        <Panel
          title={t(
            "Accès et responsabilités proposés",
            "Acessos e responsabilidades propostos",
          )}
        >
          <div className="ws-permissions">
            {[
              [
                t("Adhérent", "Aderente"),
                t(
                  "Ses dossiers, biens, documents, paiements et préférences.",
                  "Os seus pedidos, imóveis, documentos, pagamentos e preferências.",
                ),
              ],
              [
                t("Opérateur", "Operador"),
                t(
                  "Dossiers autorisés, tâches, propositions et suivi des originaux.",
                  "Pedidos autorizados, tarefas, propostas e seguimento de originais.",
                ),
              ],
              [
                t("Partenaire", "Parceiro"),
                t(
                  "Uniquement les missions attribuées et pièces partagées. Aucun accès aux notes internes ou à la facturation client.",
                  "Apenas missões atribuídas e documentos partilhados. Sem acesso a notas internas ou faturação do cliente.",
                ),
              ],
              [
                t("Éditeur", "Editor"),
                t(
                  "Brouillons et relecture du journal. Pas d’accès aux pièces des clients.",
                  "Rascunhos e revisão do jornal. Sem acesso a documentos dos clientes.",
                ),
              ],
              [
                t("Administrateur", "Administrador"),
                t(
                  "Invitations, révocations et configuration. Attribution nominative et journalisée.",
                  "Convites, revogações e configuração. Atribuição nominativa e registada.",
                ),
              ],
            ].map(([r, d]) => (
              <div key={r}>
                <h3>{r}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <p className="ws-hint">
            {t(
              "La vue équipe réunit ces fonctions pour la revue. Leur séparation devra être appliquée côté serveur.",
              "A vista da equipa reúne estas funções para revisão. A separação deverá ser aplicada no servidor.",
            )}
          </p>
        </Panel>
        <Panel title={t("Dossiers et opérations", "Pedidos e operações")}>
          <dl className="ws-admin-counts">
            <div>
              <dt>{t("Compte fictif", "Conta fictícia")}</dt>
              <dd>1</dd>
            </div>
            <div>
              <dt>{t("Dossiers", "Pedidos")}</dt>
              <dd>{state.cases.length}</dd>
            </div>
            <div>
              <dt>
                {t(
                  "Missions attribuées au partenaire",
                  "Missões atribuídas ao parceiro",
                )}
              </dt>
              <dd>{state.cases.filter((c) => c.partner).length}</dd>
            </div>
            <div>
              <dt>
                {t(
                  "Originaux à restituer (démo)",
                  "Originais por devolver (demo)",
                )}
              </dt>
              <dd>
                {state.documents.filter((d) => d.custody === "received").length}
              </dd>
            </div>
          </dl>
          <h3>
            {t("Gestion du contenu public", "Gestão do conteúdo público")}
          </h3>
          <p>
            {t(
              "Le catalogue et les tarifs restent dans une version contrôlée. Parcours cible : rédaction, relecture, validation, publication et retour à une version précédente. Aucun tarif provisoire ne devient définitif depuis cette maquette.",
              "O catálogo e os preços mantêm-se numa versão controlada. Percurso previsto: redação, revisão, validação, publicação e regresso a versão anterior. Nenhum preço provisório se torna definitivo neste protótipo.",
            )}
          </p>
        </Panel>
      </div>
      <Activity />
    </>
  );
}
