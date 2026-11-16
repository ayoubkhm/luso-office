import { sitePath } from "./sitePath";
import {
  ServiceChoice,
  BusinessTopics,
  BusinessPreparation,
  JournalSample,
  JournalAccess,
} from "./PublicGuides";
import { rememberLanguage } from "./languagePreference";
import { publicCopy } from "./publicCopy";
import { requestMessageLimit } from "./requestLimits";
import { About } from "./About";
import { CountrySelect } from "./CountrySelect";
import { MarketChoice, type Currency } from "./MarketChoice";
import { translate, languages, languageNames } from "./locales";
import {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  areas,
  services,
  plans,
  L,
  filterServices,
  price,
  type Lang,
  type Service,
} from "./catalogue";
import {
  href,
  languageHref,
  titles,
  requestText,
  requestSummaryFields,
  type Page,
  type RequestDraft,
} from "./routes";

function Icon({
  name = "arrow",
  className = "",
}: {
  name?: string;
  className?: string;
}) {
  const shapes: Record<string, ReactNode> = {
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    house: (
      <>
        <path d="m3 10 9-8 9 8M5 9v12h14V9M9 21v-8h6v8" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    family: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 3 5v3" />
      </>
    ),
    route: (
      <>
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9" />
      </>
    ),
    business: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M3 12c5 4 13 4 18 0M12 12v4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    check: <path d="m5 12 4 4 10-10" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
  };
  return (
    <svg className={`icon ${className}`} aria-hidden="true" viewBox="0 0 24 24">
      {shapes[name] || shapes.arrow}
    </svg>
  );
}
const SiteContext = createContext<{ lang: Lang; open: (s?: string) => void }>({
  lang: "fr",
  open: () => {},
});
function useSite() {
  const { lang, open } = useContext(SiteContext);
  return {
    lang,
    open,
    t: (fr: string, pt: string) => translate(fr, pt, lang),
  };
}
function Button({
  subject = "",
  children,
}: {
  subject?: string;
  children?: ReactNode;
}) {
  const { t, open } = useSite();
  return (
    <button className="button primary" onClick={() => open(subject)}>
      {children || t("Parlons de votre besoin", "Fale-nos do que precisa")}
    </button>
  );
}
const PageIntro = ({
  title,
  children,
  eyebrow,
}: {
  title: string;
  children: ReactNode;
  eyebrow?: string;
}) => (
  <section className="page-intro wrap">
    {eyebrow && <p className="overline">{eyebrow}</p>}
    <h1>{title}</h1>
    <div className="intro-copy">{children}</div>
  </section>
);
function PriceNote() {
  const { lang } = useSite();
  return (
    <p className="notice">
      <span className="notice-dot" aria-hidden="true" />
      {publicCopy[lang].draftNotice}
    </p>
  );
}
function ServiceRow({ service: s }: { service: Service }) {
  const { lang, t } = useSite();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const openTarget = () => {
      if (location.hash === `#${s.id}` && ref.current) ref.current.open = true;
    };
    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, [s.id]);
  return (
    <details ref={ref} className="service-row" id={s.id}>
      <summary>
        <span>
          <strong>{s.name[lang]}</strong>
          <span className="service-lead">{s.description[lang]}</span>
        </span>
        <span className="expand" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="service-body">
        <div>
          <h3>{t("Ce que vous recevez", "O que recebe")}</h3>
          <p>{s.result[lang]}</p>
          <h3>{t("Le cadre de l’intervention", "O âmbito da intervenção")}</h3>
          <p>{s.limits[lang]}</p>
          <p className="unit">{s.unit[lang]}</p>
        </div>
        <aside className="service-price">
          <p className="price-status">{publicCopy[lang].indicativePrice}</p>
          <dl>
            <div>
              <dt>{t("Sans adhésion", "Sem adesão")}</dt>
              <dd>{price(s, false, lang)}</dd>
            </div>
            <div>
              <dt>{t("Adhérent", "Aderente")}</dt>
              <dd>{price(s, true, lang)}</dd>
            </div>
          </dl>
          <p>
            {t(
              "Services facturés séparément de l’adhésion. Extras et conditions à convenir avant intervention.",
              "Serviços cobrados separadamente da adesão. Extras e condições a acordar antes da intervenção.",
            )}
          </p>
          <Button subject={s.id}>
            {t("Préparer ce besoin", "Preparar este assunto")}
          </Button>
        </aside>
      </div>
    </details>
  );
}
function Steps() {
  const { lang, t } = useSite();
  return (
    <section className="section wrap steps-layout">
      <div>
        <h2>
          {t(
            "Un besoin précis.\nDes étapes lisibles.",
            "Uma necessidade concreta.\nEtapas claras.",
          )}
        </h2>
        <p className="muted">
          {t(
            "Avec ou sans adhésion, chaque prestation commence par un périmètre défini ensemble.",
            "Com ou sem adesão, cada serviço começa com um âmbito definido em conjunto.",
          )}
        </p>
      </div>
      <ol className="steps">
        {[
          L("Vous décrivez votre situation", "Descreva a sua situação"),
          L("Nous précisons le cadre", "Definimos o âmbito"),
          L("Les actions sont organisées", "As ações são organizadas"),
        ].map((title, i) => (
          <li key={i}>
            <span className="step-number">{i + 1}</span>
            <div>
              <h3>{title[lang]}</h3>
              <p>
                {
                  [
                    L(
                      "Le sujet, la commune, les démarches déjà entreprises et vos échéances.",
                      "O assunto, o concelho, os passos já dados e os seus prazos.",
                    ),
                    L(
                      "Les interventions possibles, les autorisations, le prix et les frais externes sont à convenir avant de commencer.",
                      "As intervenções possíveis, as autorizações, o preço e as despesas externas são acordados antes de começar.",
                    ),
                    L(
                      "Un interlocuteur coordonne les échanges selon la mission convenue. Les professionnels spécialisés conservent leur propre rôle.",
                      "Um interlocutor coordena os contactos conforme a missão acordada. Os profissionais especializados mantêm o seu próprio papel.",
                    ),
                  ][i][lang]
                }
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
function Cta() {
  const { t } = useSite();
  return (
    <section className="contact-band">
      <div className="wrap">
        <div>
          <h2>
            {t(
              "Et vous, qu’avez-vous\nà organiser au Portugal ?",
              "E no seu caso, o que precisa\nde organizar em Portugal?",
            )}
          </h2>
          <p>
            {t(
              "Une maison, une démarche, un retour : dites-nous ce qui vous amène.",
              "Uma casa, uma diligência, um regresso: conte-nos o que precisa.",
            )}
          </p>
        </div>
        <div>
          <Button />
        </div>
      </div>
    </section>
  );
}
export function App({
  page,
  lang,
  search = "",
}: {
  page: Exclude<Page, "workspace">;
  lang: Lang;
  search?: string;
}) {
  const t = (fr: string, pt: string) => translate(fr, pt, lang);
  const copy = publicCopy[lang];
  const [menu, setMenu] = useState(false),
    [request, setRequest] = useState<{
      subject: string;
      period?: RequestDraft["period"];
    } | null>(null),
    [privacy, setPrivacy] = useState(false),
    [access, setAccess] = useState(false);
  const requestDrafts = useRef<Record<string, RememberedRequest>>({});
  const [anchor, setAnchor] = useState("");
  const [publicSearch, setPublicSearch] = useState(search);
  useEffect(() => {
    const sync = () => {
      setAnchor(location.hash);
      setPublicSearch(location.search);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("luso-public-location", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("luso-public-location", sync);
    };
  }, []);
  const menuRef = useRef<HTMLButtonElement>(null);
  const nav = [
    ["services", t("Services", "Serviços")],
    ["membership", t("Adhésion", "Adesão")],
    ["business", "Business Portugal"],
    ["about", t("Notre histoire", "A nossa história")],
    ["journal", t("Le journal", "O jornal")],
  ] as [Page, string][];
  useEffect(() => {
    document.title = titles[page][lang];
    document.documentElement.lang = lang;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuRef.current?.focus();
      }
    };
    const outside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".site-header")) setMenu(false);
    };
    const mq = matchMedia("(min-width: 1201px)"),
      resize = () => setMenu(false);
    document.addEventListener("keydown", listener);
    document.addEventListener("click", outside);
    mq.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", listener);
      document.removeEventListener("click", outside);
      mq.removeEventListener("change", resize);
    };
  }, [page, lang, menu]);
  const open = (subject = "", period?: RequestDraft["period"]) => {
    setMenu(false);
    setRequest({ subject, period });
  };
  const link = (p: Page, q = "") => href(p, lang, q);

  return (
    <SiteContext.Provider value={{ lang, open }}>
      <a className="skip-link" href="#main">
        {t("Aller au contenu", "Ir para o conteúdo")}
      </a>
      <header className="site-header">
        <div className="header-inner wrap">
          <a
            className="wordmark"
            href={link("home")}
            aria-label={t("LusoOffice, accueil", "LusoOffice, início")}
          >
            Luso<span>Office</span>
          </a>
          <nav
            className="desktop-nav"
            aria-label={t("Navigation principale", "Navegação principal")}
          >
            {nav.map(([p, label]) => (
              <a
                key={p}
                href={link(p)}
                aria-current={page === p ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <div
              className="language-switch"
              aria-label={t("Langue du site", "Idioma do site")}
            >
              {languages.map((l) => (
                <a
                  key={l}
                  href={languageHref(page, l, publicSearch, anchor)}
                  onClick={(e) => {
                    rememberLanguage(l);
                    // Preserve the live filters and the current section in every language.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                      return;
                    e.preventDefault();
                    location.assign(
                      languageHref(page, l, location.search, location.hash),
                    );
                  }}
                  onAuxClick={(e) => {
                    if (e.button === 1) rememberLanguage(l);
                  }}
                  lang={l}
                  aria-label={languageNames[l]}
                  aria-current={lang === l ? "true" : undefined}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
            <button className="contact-link" onClick={() => open()}>
              {t("Parlons-en", "Vamos conversar")}
              <Icon />
            </button>
            <button
              ref={menuRef}
              className="menu-button"
              aria-expanded={menu}
              aria-controls="mobile-nav"
              aria-label={
                menu
                  ? t("Fermer le menu", "Fechar menu")
                  : t("Ouvrir le menu", "Abrir menu")
              }
              onClick={() => setMenu(!menu)}
            >
              <Icon name={menu ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          hidden={!menu}
          className="mobile-nav wrap"
          aria-label={t("Navigation mobile", "Navegação móvel")}
        >
          {nav.map(([p, label]) => (
            <a
              key={p}
              href={link(p)}
              aria-current={page === p ? "page" : undefined}
            >
              {label}
            </a>
          ))}
          <button
            className="account-entry"
            onClick={() => {
              setMenu(false);
              setAccess(true);
            }}
          >
            {copy.accountAccess}
          </button>
          <button onClick={() => open()}>
            {t("Parlons de votre besoin", "Fale-nos do que precisa")}
          </button>
        </nav>
      </header>
      <main id="main">
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <p className="hero-signature">
                  {t(
                    "Le Portugal, une histoire qui continue.",
                    "Portugal, uma história que continua.",
                  )}
                </p>
                <h1>
                  {t(
                    "Votre vie est ailleurs.\nVos liens sont ici.",
                    "A sua vida está lá.\nOs seus laços estão cá.",
                  )}
                </h1>
                <p>{copy.homeIntro}</p>
                <div className="hero-actions">
                  <a className="button primary" href={link("services")}>
                    {t("Trouver mon service", "Encontrar o meu serviço")}
                    <Icon />
                  </a>
                  <a className="text-link" href={link("membership")}>
                    {t("Comprendre l’adhésion", "Compreender a adesão")}
                  </a>
                </div>
                <p className="hero-footnote">{copy.withoutMembership}</p>
              </div>
              <div className="hero-art">
                <img
                  src={sitePath("/assets/azulejos-960.webp")}
                  srcSet={`${sitePath("/assets/azulejos-640.webp")}  640w, ${sitePath("/assets/azulejos-960.webp")}  960w, ${sitePath("/assets/azulejos-1536.webp")}  1536w`}
                  sizes="(max-width:760px) 100vw, 48vw"
                  width="1536"
                  height="1024"
                  alt={t(
                    "Azulejos portugais bleus et blancs, avec un carreau jaune.",
                    "Azulejos portugueses azuis e brancos, com um azulejo amarelo.",
                  )}
                  fetchPriority="high"
                />
                <span className="image-caption" lang="pt">
                  Ligamos Portugal aos Portugueses no Mundo
                </span>
              </div>
            </section>
            <section className="section wrap">
              <div className="section-heading">
                <h2>{copy.homeAreas}</h2>
                <p>{copy.homeAreasIntro}</p>
              </div>
              <div className="areas-grid">
                {areas.map((a) => (
                  <a
                    className={`area-card area-${a.id}`}
                    href={link("services", `?area=${a.id}`)}
                    key={a.id}
                  >
                    <Icon name={a.icon} />
                    <span className="area-category">{a.name[lang]}</span>
                    <h3>
                      {
                        {
                          maison: copy.intentHouse,
                          documents: copy.intentDocuments,
                          famille: copy.intentFamily,
                          retour: copy.intentReturn,
                          business: copy.intentBusiness,
                        }[a.id]
                      }
                    </h3>
                    <p>{a.description[lang]}</p>
                    <span className="area-bottom">
                      {services.filter((s) => s.area === a.id).length}{" "}
                      {t("services à découvrir", "serviços a descobrir")}
                      <Icon />
                    </span>
                  </a>
                ))}
              </div>
            </section>
            <section className="membership-teaser">
              <div className="wrap teaser-layout">
                <div>
                  <p className="overline">
                    {t("À votre rythme", "Ao seu ritmo")}
                  </p>
                  <h2>
                    {t(
                      "Un besoin ponctuel.\nOu un lien dans la durée.",
                      "Uma necessidade pontual.\nOu uma ligação duradoura.",
                    )}
                  </h2>
                  <a className="text-link" href={link("membership")}>
                    {t(
                      "Découvrir le fonctionnement",
                      "Conhecer o funcionamento",
                    )}
                    <Icon />
                  </a>
                </div>
                <div className="two-paths">
                  <article>
                    <h3>{copy.oneOff}</h3>
                    <p>{copy.oneOffBody}</p>
                  </article>
                  <article>
                    <h3>{copy.considerMembership}</h3>
                    <p>{copy.membershipBody}</p>
                  </article>
                </div>
              </div>
            </section>
            <Steps />
            <section className="story-teaser wrap">
              <div className="tile-quote">
                <span aria-hidden="true">“</span>
                <p>
                  {t(
                    "Partir n’efface pas\nce qui nous relie.",
                    "Partir não apaga\no que nos liga.",
                  )}
                </p>
                <small>LusoOffice</small>
              </div>
              <div>
                <h2>
                  {t(
                    "Une histoire de famille.\nUn projet pour la diaspora.",
                    "Uma história de família.\nUm projeto para a diáspora.",
                  )}
                </h2>
                <p>
                  {t(
                    "Le projet prend racine dans l’expérience d’une fondatrice fille d’émigrants en France. Il s’adresse à ceux qui sont partis, mais aussi à leurs enfants et petits-enfants.",
                    "O projeto nasce da experiência de uma fundadora filha de emigrantes em França. Dirige-se a quem partiu e também aos seus filhos e netos.",
                  )}
                </p>
                <a className="text-link" href={link("about")}>
                  {t("Découvrir notre histoire", "Conhecer a nossa história")}
                  <Icon />
                </a>
              </div>
            </section>
            <section className="journal-teaser wrap">
              <Icon name="mail" />
              <div>
                <p>
                  {t(
                    "Votre rendez-vous avec le Portugal",
                    "O seu encontro com Portugal",
                  )}
                </p>
                <h2 lang="pt">Portugal — Tão longe e tão perto</h2>
              </div>
              <a className="text-link" href={link("journal")}>
                {t("Découvrir le journal", "Conhecer o jornal")}
                <Icon />
              </a>
            </section>
            <Cta />
          </>
        )}
        {page === "services" && (
          <>
            <PageIntro
              title={t(
                "Votre besoin a sa place ici.",
                "O que precisa tem lugar aqui.",
              )}
            >
              <p>
                {t(
                  "Maison, démarches, famille, retour ou activité professionnelle : trouvez la prestation adaptée à votre situation.",
                  "Casa, diligências, família, regresso ou atividade profissional: encontre o serviço adequado à sua situação.",
                )}
              </p>
            </PageIntro>
            <section
              className="catalogue wrap"
              aria-label={t("Catalogue des services", "Catálogo de serviços")}
            >
              <PriceNote />
              <ServiceChoice lang={lang} />
              <Catalogue
                lang={lang}
                search={search}
                render={(s) => <ServiceRow key={s.id} service={s} />}
              />
            </section>
            <section className="section wrap future-topics">
              <h2>
                {t(
                  "Votre besoin ne figure pas dans le catalogue ?",
                  "Não encontra o que precisa no catálogo?",
                )}
              </h2>
              <p>
                {t(
                  "Nationalité portugaise, NIF, retraite, permis de conduire, traductions, études ou véhicule : décrivez votre situation pour définir l’accompagnement et les professionnels à solliciter.",
                  "Nacionalidade portuguesa, NIF, reforma, carta de condução, traduções, estudos ou veículo: descreva a situação para definir o acompanhamento e os profissionais a contactar.",
                )}
              </p>
              <p>{copy.insuranceExploration}</p>
              <Button subject="other">
                {t("Décrire un autre besoin", "Descrever outro assunto")}
              </Button>
            </section>
            <Cta />
          </>
        )}
        {page === "membership" && (
          <>
            <PageIntro
              title={t(
                "Un lien dans la durée.\nDes services à la demande.",
                "Uma ligação duradoura.\nServiços à medida do pedido.",
              )}
            >
              <p>{copy.membershipIntro}</p>
              <a className="text-link" href={link("services")}>
                {t(
                  "Vous pouvez aussi faire appel à nous sans adhérer.",
                  "Também pode recorrer aos serviços sem aderir.",
                )}
                <Icon />
              </a>
            </PageIntro>
            <section className="wrap plans-section">
              <PriceNote />
              <Membership lang={lang} onChoose={open} />
            </section>
            <section className="section wrap benefit-layout">
              <div>
                <h2>
                  {t(
                    "Les avantages de votre adhésion.",
                    "As vantagens da sua adesão.",
                  )}
                </h2>
                <p className="muted">
                  {t(
                    "Des tarifs adhérent, un lien régulier avec le Portugal et un accompagnement adapté à votre situation.",
                    "Preços de aderente, uma ligação regular a Portugal e acompanhamento adaptado à sua situação.",
                  )}
                </p>
              </div>
              <ul className="benefits">
                {[
                  L(
                    "Accès aux prix adhérent sur les services",
                    "Acesso aos preços de aderente nos serviços",
                  ),
                  L(
                    "Orientation pour organiser vos démarches",
                    "Orientação para organizar as suas diligências",
                  ),
                  L(
                    "Newsletter mensuelle « Portugal — Tão longe e tão perto »",
                    "Newsletter mensal « Portugal — Tão longe e tão perto »",
                  ),
                  L(
                    "Une adhésion individuelle ou familiale",
                    "Uma adesão individual ou familiar",
                  ),
                ].map((x) => (
                  <li key={x.fr}>
                    <Icon name="check" />
                    {x[lang]}
                  </li>
                ))}
              </ul>
            </section>
            <section className="portal-section">
              <div className="wrap portal-layout">
                <div>
                  <h2 lang="pt">O meu Portugal</h2>
                  <p>{copy.portalIntro}</p>
                  <button
                    className="button primary account-entry"
                    onClick={() => setAccess(true)}
                  >
                    {copy.accountAccess}
                  </button>
                </div>
                <ul className="portal-list">
                  {[
                    L(
                      "Mes demandes et leur historique",
                      "Os meus pedidos e histórico",
                    ),
                    L("Mes biens et documents", "Os meus imóveis e documentos"),
                    L(
                      "Mes échanges et factures",
                      "As minhas mensagens e faturas",
                    ),
                  ].map((x) => (
                    <li key={x.fr}>
                      <Icon name="file" />
                      {x[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            <Faq lang={lang} />
            <Cta />
          </>
        )}
        {page === "business" && (
          <>
            <PageIntro
              title={t(
                "Votre projet au Portugal.\nLes bons interlocuteurs.",
                "O seu projeto em Portugal.\nOs interlocutores certos.",
              )}
              eyebrow="Business Portugal"
            >
              <p>{copy.businessIntro}</p>
              <Button subject="business-entretien">
                {t("Préparer mon projet", "Preparar o meu projeto")}
              </Button>
            </PageIntro>
            <section className="wrap business-roles">
              <article>
                <Icon name="business" />
                <h2>LusoOffice</h2>
                <p>
                  {t(
                    "Coordination, organisation documentaire, rendez-vous, fournisseurs et tâches pratiques sur place.",
                    "Coordenação, organização documental, agendamentos, fornecedores e tarefas práticas no local.",
                  )}
                </p>
              </article>
              <article>
                <Icon name="file" />
                <h2>
                  {t(
                    "Comptabilité et fiscalité",
                    "Contabilidade e fiscalidade",
                  )}
                </h2>
                <p>
                  {t(
                    "Les questions comptables et fiscales relèvent d’un comptable, avec une mission et des honoraires distincts.",
                    "As questões contabilísticas e fiscais cabem a um contabilista, com missão e honorários distintos.",
                  )}
                </p>
              </article>
              <article>
                <Icon name="route" />
                <h2>{t("Projet et financement", "Projeto e financiamento")}</h2>
                <p>
                  {t(
                    "Les études de viabilité et les dossiers de financement nécessitent l’intervention de spécialistes selon la nature du projet.",
                    "Os estudos de viabilidade e os processos de financiamento requerem especialistas conforme a natureza do projeto.",
                  )}
                </p>
              </article>
            </section>
            <section className="section wrap">
              <div className="section-heading">
                <h2>
                  {t("De l’idée à l’installation.", "Da ideia à instalação.")}
                </h2>
                <p>
                  {t(
                    "Chaque projet commence par un cadrage. La coordination LusoOffice et les prestations spécialisées font l’objet de propositions distinctes.",
                    "Cada projeto começa pela definição do âmbito. A coordenação LusoOffice e os serviços especializados têm propostas distintas.",
                  )}
                </p>
              </div>
              <BusinessTopics lang={lang} />
            </section>
            <BusinessPreparation lang={lang} />
            <section className="section pale">
              <div className="wrap">
                <h2>
                  {t(
                    "L’accompagnement opérationnel.",
                    "O acompanhamento operacional.",
                  )}
                </h2>
                <PriceNote />
                {services
                  .filter((s) => s.area === "business")
                  .map((s) => (
                    <ServiceRow key={s.id} service={s} />
                  ))}
              </div>
            </section>
            <Cta />
          </>
        )}
        {page === "about" && <About lang={lang} onContact={open} />}
        {page === "journal" && (
          <>
            <section className="journal-cover wrap">
              <div>
                <p className="overline">
                  {t("Le journal de LusoOffice", "O jornal da LusoOffice")}
                </p>
                <h1 lang="pt">
                  Portugal
                  <br />
                  Tão longe
                  <br />e tão perto.
                </h1>
                <p>
                  {t(
                    "Un rendez-vous pour rester proche du Portugal, comprendre les sujets du quotidien et préparer les prochaines étapes.",
                    "Um encontro para continuar perto de Portugal, compreender os assuntos do dia a dia e preparar os próximos passos.",
                  )}
                </p>
                <span className="status-pill">{copy.journalStatus}</span>
              </div>
              <div className="journal-tile" aria-hidden="true">
                <img
                  src={sitePath("/assets/azulejos-960.webp")}
                  alt=""
                  width="960"
                  height="640"
                />
              </div>
            </section>
            <section className="section wrap">
              <div className="section-heading">
                <h2>
                  {t(
                    "Un format simple.\nUn lien régulier.",
                    "Um formato simples.\nUma ligação regular.",
                  )}
                </h2>
                <p>
                  {t(
                    "Une lecture en portugais pour garder le lien : des sujets pratiques, des repères et une question à explorer, en 3 à 5 minutes.",
                    "Uma leitura em português para manter a ligação: temas práticos, referências e uma questão para explorar, em 3 a 5 minutos.",
                  )}
                </p>
              </div>
              <div className="journal-sections">
                {[
                  [
                    L("À la une", "Em destaque"),
                    L(
                      "Un thème pratique autour de la maison, des démarches ou du retour.",
                      "Um tema prático sobre a casa, os assuntos administrativos ou o regresso.",
                    ),
                  ],
                  [
                    L("Ce mois-ci, soyez attentif", "Este mês, tenha atenção"),
                    L(
                      "Des échéances et nouveautés à vérifier auprès de sources fiables.",
                      "Prazos e novidades a verificar junto de fontes fiáveis.",
                    ),
                  ],
                  [
                    L("La question du mois", "A pergunta do mês"),
                    L(
                      "Une explication accessible à partir d’une question concrète.",
                      "Uma explicação acessível a partir de uma dúvida concreta.",
                    ),
                  ],
                  [
                    L("Comment nous pouvons aider", "Como podemos ajudar"),
                    L(
                      "Un service en lien avec le sujet et son périmètre d’intervention.",
                      "Um serviço relacionado com o tema e o seu âmbito de intervenção.",
                    ),
                  ],
                ].map(([a, b]) => (
                  <article key={a.fr}>
                    <h3>{a[lang]}</h3>
                    <p>{b[lang]}</p>
                  </article>
                ))}
              </div>
              <p className="editorial-note">{copy.journalTiming}</p>
            </section>
            <JournalSample lang={lang} />
            <section className="cultural-section">
              <div className="wrap cultural-layout">
                <div>
                  <p className="overline">
                    {t("La culture se transmet", "A cultura transmite-se")}
                  </p>
                  <h2 lang="pt">Coffret da Lis</h2>
                  <p>
                    {t(
                      "Six illustrations autour de symboles portugais et un livre à construire avec les élèves des écoles de portugais à l’étranger, coautrices et coauteurs de leurs contributions.",
                      "Seis ilustrações sobre símbolos portugueses e um livro a construir com os alunos das escolas de português no estrangeiro, coautores dos seus contributos.",
                    )}
                  </p>
                  <p className="muted">
                    {t(
                      "Vous représentez une école de portugais ? Échangeons sur la participation des élèves, leurs textes et leurs illustrations.",
                      "Representa uma escola de português? Vamos conversar sobre a participação dos alunos, os seus textos e ilustrações.",
                    )}
                  </p>
                  <Button subject="partnership">{copy.contribute}</Button>
                </div>
                <ul>
                  {[
                    L("Hirondelle", "Andorinha"),
                    L("Sardine", "Sardinha"),
                    L("Tramway", "Elétrico"),
                    L("Cœur de Viana", "Coração de Viana"),
                    L("Coq de Barcelos", "Galo de Barcelos"),
                    L("Azulejo", "Azulejo"),
                  ].map((x) => (
                    <li key={x.fr}>{x[lang]}</li>
                  ))}
                </ul>
              </div>
            </section>
            <JournalAccess lang={lang} />
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="wrap footer-top">
          <div>
            <a className="wordmark" href={link("home")}>
              Luso<span>Office</span>
            </a>
            <p lang="pt">Ligamos Portugal aos Portugueses no Mundo</p>
          </div>
          <nav aria-label={t("Liens de pied de page", "Ligações do rodapé")}>
            <button
              className="account-entry"
              onClick={() => {
                setMenu(false);
                setAccess(true);
              }}
            >
              {copy.accountAccess}
            </button>
            {nav.map(([p, label]) => (
              <a key={p} href={link(p)}>
                {label}
              </a>
            ))}
            <a href={link("about", "#contact")}>{t("Contact", "Contactos")}</a>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          <p>LusoOffice</p>
          <button onClick={() => setPrivacy(true)}>
            {t("Confidentialité", "Privacidade")}
          </button>
        </div>
      </footer>
      {request !== null && (
        <RequestEntry
          lang={lang}
          initial={request.subject}
          initialPeriod={request.period}
          remembered={requestDrafts.current[request.subject || "other"]}
          onRemember={(saved) => {
            requestDrafts.current[request.subject || "other"] = saved;
          }}
          onClose={() => setRequest(null)}
        />
      )}
      {access && (
        <Modal
          title={copy.accountAccess}
          lang={lang}
          onClose={() => setAccess(false)}
        >
          <p>{copy.accountUnavailable}</p>
          <button
            className="button primary full"
            onClick={() => {
              setAccess(false);
              open();
            }}
          >
            {copy.accountContact}
          </button>
        </Modal>
      )}
      {privacy && (
        <Modal
          title={t("Confidentialité", "Privacidade")}
          lang={lang}
          onClose={() => setPrivacy(false)}
        >
          <p>{copy.privacyText}</p>
        </Modal>
      )}
    </SiteContext.Provider>
  );
}

function Catalogue({
  lang,
  search,
  render,
}: {
  lang: Lang;
  search: string;
  render: (s: Service) => ReactNode;
}) {
  const params = new URLSearchParams(search),
    init = params.get("area") || "all";
  const [area, setArea] = useState(
      areas.some((a) => a.id === init) ? init : "all",
    ),
    [query, setQuery] = useState(params.get("q") || "");
  const filtered = filterServices(area, query, lang),
    fr = lang === "fr";
  useEffect(() => {
    const url = new URL(location.href);
    area === "all"
      ? url.searchParams.delete("area")
      : url.searchParams.set("area", area);
    query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    window.dispatchEvent(new Event("luso-public-location"));
  }, [area, query]);
  return (
    <>
      <div className="catalogue-tools">
        <label className="search-label" htmlFor="service-search">
          {translate(
            "Quel sujet souhaitez-vous organiser ?",
            "Que assunto pretende organizar?",
            lang,
          )}
          <input
            id="service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translate(
              "Maison, documents, retour…",
              "Casa, documentos, regresso…",
              lang,
            )}
          />
        </label>
        <div
          className="filters"
          role="group"
          aria-label={translate(
            "Filtrer par domaine",
            "Filtrar por área",
            lang,
          )}
        >
          {[
            { id: "all", name: L("Tous les domaines", "Todas as áreas") },
            ...areas,
          ].map((a) => (
            <button
              key={a.id}
              aria-pressed={area === a.id}
              onClick={() => setArea(a.id)}
            >
              {a.name[lang]}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count" role="status">
        {filtered.length}{" "}
        {
          {
            fr: filtered.length === 1 ? "service trouvé" : "services trouvés",
            pt:
              filtered.length === 1
                ? "serviço encontrado"
                : "serviços encontrados",
            en: filtered.length === 1 ? "service found" : "services found",
            de:
              filtered.length === 1
                ? "Leistung gefunden"
                : "Leistungen gefunden",
          }[lang]
        }
      </p>
      {areas.map((a) => {
        const items = filtered.filter((s) => s.area === a.id);
        return items.length ? (
          <section
            className="catalogue-group"
            key={a.id}
            aria-labelledby={`group-${a.id}`}
          >
            <div className="group-heading">
              <Icon name={a.icon} />
              <h2 id={`group-${a.id}`}>{a.name[lang]}</h2>
            </div>
            {items.map(render)}
          </section>
        ) : null;
      })}
      {!filtered.length && (
        <div className="empty-state">
          <h2>
            {translate(
              "Aucun service ne correspond à cette recherche.",
              "Nenhum serviço corresponde a esta pesquisa.",
              lang,
            )}
          </h2>
          <p>
            {translate(
              "Essayez un terme plus simple ou consultez tous les domaines.",
              "Experimente um termo mais simples ou consulte todas as áreas.",
              lang,
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setArea("all");
            }}
          >
            {translate("Effacer les filtres", "Limpar os filtros", lang)}
          </button>
        </div>
      )}
    </>
  );
}
function Membership({
  lang,
  onChoose,
}: {
  lang: Lang;
  onChoose: (s: string, period?: RequestDraft["period"]) => void;
}) {
  const [annual, setAnnual] = useState(true);
  const copy = publicCopy[lang];
  return (
    <>
      <div
        className="plan-period"
        role="group"
        aria-label={translate(
          "Périodicité indicative",
          "Periodicidade indicativa",
          lang,
        )}
      >
        <button aria-pressed={!annual} onClick={() => setAnnual(false)}>
          {translate("Mensuelle", "Mensal", lang)}
        </button>
        <button aria-pressed={annual} onClick={() => setAnnual(true)}>
          {translate("Annuelle", "Anual", lang)}
        </button>
      </div>
      <div className="plan-grid">
        {plans
          .filter((p) => p.id !== "Premium")
          .map((p) => (
            <article
              className={`plan ${p.id === "Family" ? "family-plan" : ""}`}
              key={p.id}
            >
              <h2>{p.id}</h2>
              <p className="plan-people">{p.people[lang]}</p>
              <p className="plan-amount">
                {new Intl.NumberFormat(lang, {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: annual ? 0 : 2,
                }).format(annual ? p.annual : p.monthly)}
                <span>
                  {" "}
                  /{" "}
                  {annual
                    ? translate("an", "ano", lang)
                    : translate("mois", "mês", lang)}
                </span>
              </p>
              <small>
                {translate(
                  "Tarif indicatif. Conditions détaillées avant adhésion.",
                  "Preço indicativo. Condições detalhadas antes da adesão.",
                  lang,
                )}
              </small>
              <p className="plan-description">{p.description[lang]}</p>
              {annual && (
                <p className="plan-saving">
                  {copy.annualSaving}{" "}
                  <strong>
                    {new Intl.NumberFormat(lang, {
                      style: "currency",
                      currency: "EUR",
                    }).format(p.monthly * 12 - p.annual)}
                  </strong>
                </p>
              )}
              <button
                className={`button ${p.id === "Family" ? "primary" : "secondary"}`}
                onClick={() => onChoose(p.id, annual ? "annual" : "monthly")}
              >
                {translate(
                  "Choisir cette formule",
                  "Escolher esta modalidade",
                  lang,
                )}
              </button>
            </article>
          ))}
      </div>
      <p className="plan-disclaimer">
        {translate(
          "Choisissez une formule mensuelle ou annuelle. Les prestations sont facturées séparément ; les conditions de l’adhésion sont précisées avant tout engagement.",
          "Escolha uma modalidade mensal ou anual. Os serviços são cobrados separadamente; as condições de adesão são especificadas antes de qualquer compromisso.",
          lang,
        )}
      </p>
    </>
  );
}
function Faq({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const questions = [
    [
      L(
        "Faut-il adhérer pour demander un service ?",
        "É preciso aderir para pedir um serviço?",
      ),
      L(
        "Non. Vous pouvez choisir une prestation ponctuelle sans adhérer. L’adhésion donne accès aux tarifs adhérent.",
        "Não. Pode escolher um serviço pontual sem aderir. A adesão dá acesso aos preços de aderente.",
      ),
    ],
    [
      L(
        "Les prestations sont-elles comprises dans l’adhésion ?",
        "Os serviços estão incluídos na adesão?",
      ),
      L(
        "Non. Les visites, démarches et interventions sont choisies et facturées séparément de l’adhésion.",
        "Não. As visitas, diligências e intervenções são escolhidas e cobradas separadamente da adesão.",
      ),
    ],
    [
      L("Comment le prix est-il confirmé ?", "Como é confirmado o preço?"),
      L(
        "Les tarifs du catalogue sont indicatifs. Le périmètre, la TVA, les déplacements et les frais externes sont détaillés dans la proposition, avant votre accord.",
        "Os preços do catálogo são indicativos. O âmbito, o IVA, as deslocações e as despesas externas são detalhados na proposta, antes da sua aprovação.",
      ),
    ],
    [
      L(
        "Quels frais doivent être distingués ?",
        "Que despesas devem ser distinguidas?",
      ),
      L(
        "La prestation LusoOffice, les frais officiels et les honoraires des professionnels extérieurs sont distingués dans la proposition.",
        "O serviço LusoOffice, as taxas oficiais e os honorários dos profissionais externos são discriminados na proposta.",
      ),
    ],
    [
      L(
        "Que faut-il préciser lors du premier échange ?",
        "O que devo indicar na primeira conversa?",
      ),
      L(
        "Votre besoin, la commune concernée, les démarches déjà entreprises et votre calendrier. Ces informations permettent de cadrer la mission.",
        "A necessidade, o concelho, as diligências já realizadas e o calendário. Estas informações ajudam a definir a missão.",
      ),
    ],
  ];
  return (
    <section className="section wrap faq-layout">
      <h2>
        {translate(
          "Comprendre avant de choisir.",
          "Compreender antes de escolher.",
          lang,
        )}
      </h2>
      <div>
        {questions.map(([q, a]) => (
          <details className="faq" key={q.fr}>
            <summary>
              {q[lang]}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{a[lang]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function Modal({
  title,
  lang,
  onClose,
  children,
}: {
  title: string;
  lang: Lang;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    const prior = document.body.style.overflow;
    d.showModal();
    document.body.style.overflow = "hidden";
    d.querySelector<HTMLElement>("h2")?.focus();
    return () => {
      document.body.style.overflow = prior;
      if (d.open) d.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const b = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < b.left ||
            e.clientX > b.right ||
            e.clientY < b.top ||
            e.clientY > b.bottom
          )
            onClose();
        }
      }}
    >
      <button
        className="modal-close"
        aria-label={translate("Fermer", "Fechar", lang)}
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <span className="modal-brand">LusoOffice</span>
      <h2 id="modal-title" tabIndex={-1}>
        {title}
      </h2>
      {children}
    </dialog>
  );
}
type RememberedRequest = {
  draft: RequestDraft;
  subject: string;
  currency: Currency;
  period?: RequestDraft["period"];
};
function requestSubject(initial: string) {
  return plans.some((p) => p.id === initial)
    ? `plan-${initial}`
    : initial || "other";
}
function requestSubjectLabel(subject: string, lang: Lang) {
  return (
    services.find((s) => s.id === subject)?.name[lang] ||
    (subject.startsWith("plan-")
      ? `${translate("Adhésion", "Adesão", lang)} ${subject.slice(5)}`
      : subject === "partnership"
        ? translate(
            "Partenariat ou association",
            "Parceria ou associação",
            lang,
          )
        : translate("À définir ensemble", "A definir em conjunto", lang))
  );
}
type RequestEntryProps = {
  lang: Lang;
  initial: string;
  initialPeriod?: RequestDraft["period"];
  remembered?: RememberedRequest;
  onRemember: (saved: RememberedRequest) => void;
  onClose: () => void;
};
function RequestEntry(props: RequestEntryProps) {
  const { lang, initial, remembered, onClose } = props;
  const copy = publicCopy[lang];
  const target = requestSubject(initial);
  const [mode, setMode] = useState<"choose" | "resume" | "new">(
    remembered && target !== "other" && remembered.subject !== target
      ? "choose"
      : "resume",
  );
  if (mode === "choose" && remembered)
    return (
      <Modal title={copy.draftChoiceTitle} lang={lang} onClose={onClose}>
        <p>{copy.draftChoiceIntro}</p>
        <p>
          <strong>{requestSubjectLabel(remembered.subject, lang)}</strong>
        </p>
        <button
          className="button primary full"
          data-request-action="resume"
          onClick={() => setMode("resume")}
        >
          {copy.resumeDraft}
        </button>
        <button
          className="button secondary full"
          data-request-action="new"
          onClick={() => setMode("new")}
        >
          {copy.newPreparation} · {requestSubjectLabel(target, lang)}
        </button>
      </Modal>
    );
  return (
    <RequestModal
      {...props}
      key={mode}
      remembered={mode === "new" ? undefined : remembered}
      onNew={() => setMode("new")}
    />
  );
}
function RequestModal({
  lang,
  initial,
  initialPeriod,
  remembered,
  onRemember,
  onClose,
  onNew,
}: RequestEntryProps & { onNew: () => void }) {
  const fr = lang === "fr",
    t = (a: string, b: string) => translate(a, b, lang);
  const [draft, setDraft] = useState<RequestDraft | null>(
      remembered?.draft || null,
    ),
    [editing, setEditing] = useState(true);
  const [currency, setCurrency] = useState<Currency>(
    remembered?.currency || "EUR",
  );
  const [period, setPeriod] = useState<RequestDraft["period"]>(
    remembered ? remembered.period : initialPeriod,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const copy = publicCopy[lang];
  const initialSubject = requestSubject(initial);
  const options = [
    ...services.map((s) => ({ value: s.id, label: s.name[lang] })),
    ...plans
      .filter((p) => p.id !== "Premium")
      .map((p) => ({
        value: `plan-${p.id}`,
        label: t("Adhésion", "Adesão") + " " + p.id,
      })),
    {
      value: "partnership",
      label: t("Partenariat ou association", "Parceria ou associação"),
    },
    { value: "other", label: t("À définir ensemble", "A definir em conjunto") },
  ];
  const [subject, setSubject] = useState(remembered?.subject || initialSubject);
  const close = () => {
    const data = formRef.current ? new FormData(formRef.current) : undefined;
    const field = (name: "name" | "email" | "country" | "message") =>
      data ? String(data.get(name) || "") : draft?.[name] || "";
    onRemember({
      subject,
      currency,
      period,
      draft: {
        name: field("name"),
        email: field("email"),
        country: field("country"),
        message: field("message"),
        subjectId: subject,
        subject:
          options.find((option) => option.value === subject)?.label || "",
        currency,
        period: subject.startsWith("plan-") ? period : undefined,
      },
    });
    onClose();
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    for (const key of ["name", "message"]) {
      const input = form.elements.namedItem(key) as HTMLInputElement;
      if (!input.value.trim()) {
        input.setCustomValidity(
          t("Veuillez renseigner ce champ.", "Preencha este campo."),
        );
        input.reportValidity();
        return;
      }
    }
    const message = form.elements.namedItem("message") as HTMLTextAreaElement;
    if (message.value.length > requestMessageLimit) {
      message.setCustomValidity(copy.messageLimit);
      message.reportValidity();
      return;
    }
    setDraft({
      currency,
      period: subject.startsWith("plan-") ? period : undefined,
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      country: String(data.get("country")),
      subjectId: subject,
      subject: options.find((o) => o.value === subject)?.label || "",
      message: String(data.get("message")).trim(),
    });
    setEditing(false);
  };
  useEffect(() => {
    const h = document.querySelector<HTMLElement>("#modal-title");
    h?.closest("dialog")?.scrollTo(0, 0);
    h?.focus();
  }, [editing]);
  const download = () => {
    if (!draft) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          requestText(
            {
              ...draft,
              subjectId: subject,
              currency,
              period: subject.startsWith("plan-") ? period : undefined,
            },
            lang,
          ),
        ],
        {
          type: "text/plain;charset=utf-8",
        },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = translate(
      "luso-office-mon-echange.txt",
      "luso-office-a-minha-conversa.txt",
      lang,
    );
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Modal
      title={
        editing
          ? t("Préparons votre échange.", "Preparemos a sua conversa.")
          : t("Votre récapitulatif est prêt.", "O seu resumo está preparado.")
      }
      lang={lang}
      onClose={close}
    >
      {editing ? (
        <>
          <p className="modal-intro">
            {t(
              "Décrivez votre besoin et votre calendrier. Vous pourrez vérifier vos informations avant de poursuivre.",
              "Descreva a necessidade e o calendário. Poderá verificar as informações antes de continuar.",
            )}
          </p>
          {remembered && (
            <div className="draft-resumed">
              <p>{copy.draftResumed}</p>
              <button
                className="text-link"
                data-request-action="new"
                onClick={onNew}
              >
                {copy.newPreparation} ·{" "}
                {requestSubjectLabel(initialSubject, lang)}
              </button>
            </div>
          )}
          <form ref={formRef} onSubmit={submit}>
            <p className="form-note">
              {t(
                "* Champs obligatoires. Les autres sont facultatifs.",
                "* Campos obrigatórios. Os restantes são facultativos.",
              )}
            </p>
            <div className="form-row">
              <label>
                {t("Votre nom *", "O seu nome *")}
                <input
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  defaultValue={draft?.name}
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </label>
              <label>
                {t("Votre e-mail", "O seu e-mail")}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  defaultValue={draft?.email}
                />
              </label>
            </div>
            <label>
              {t("Pays de résidence", "País de residência")}
              <CountrySelect
                name="country"
                lang={lang}
                defaultValue={draft?.country || ""}
              />
            </label>
            <label>
              {t("Sujet à aborder", "Assunto a abordar")}
              <select
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="other">
                  {t("À définir ensemble", "A definir em conjunto")}
                </option>
                {areas.map((a) => (
                  <optgroup key={a.id} label={a.name[lang]}>
                    {services
                      .filter((s) => s.area === a.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name[lang]}
                        </option>
                      ))}
                  </optgroup>
                ))}
                <optgroup
                  label={t("Adhésion et partenariat", "Adesão e parceria")}
                >
                  {options
                    .filter(
                      (o) =>
                        o.value.startsWith("plan-") ||
                        o.value === "partnership",
                    )
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              </select>
            </label>
            {subject.startsWith("plan-") && (
              <label>
                {copy.periodLabel}
                <select
                  name="period"
                  value={period || ""}
                  onChange={(e) =>
                    setPeriod(
                      (e.target.value || undefined) as RequestDraft["period"],
                    )
                  }
                >
                  <option value="">{copy.periodUndecided}</option>
                  <option value="monthly">{t("Mensuelle", "Mensal")}</option>
                  <option value="annual">{t("Annuelle", "Anual")}</option>
                </select>
              </label>
            )}
            <label>
              {t("Votre situation *", "A sua situação *")}
              <textarea
                name="message"
                rows={4}
                maxLength={requestMessageLimit}
                required
                defaultValue={draft?.message}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                aria-describedby="sensitive-note message-limit"
                placeholder={t(
                  "Quel besoin, dans quelle commune, pour quelle échéance ?",
                  "Qual a necessidade, em que concelho e para quando?",
                )}
              />
            </label>
            <p id="message-limit" className="form-note">
              {copy.messageLimit}
            </p>
            <p id="sensitive-note" className="form-note">
              {t(
                "Ne saisissez pas de documents d’identité, de coordonnées bancaires ou d’informations sensibles.",
                "Não introduza documentos de identificação, dados bancários ou informações sensíveis.",
              )}
            </p>
            <button type="submit" className="button primary full">
              {t(
                "Vérifier mes informations",
                "Verificar as minhas informações",
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="modal-intro">
            {t(
              "Votre récapitulatif est prêt à être téléchargé. L’envoi en ligne n’est pas encore activé ; aucun message n’a été transmis.",
              "O resumo está pronto para descarregar. O envio online ainda não está ativo; nenhuma mensagem foi transmitida.",
            )}
          </p>
          <dl className="request-summary">
            {draft &&
              requestSummaryFields(
                { ...draft, subjectId: subject, currency, period },
                lang,
              ).map(([label, value]) => (
                <Fragment key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </Fragment>
              ))}
            <dt>{t("Situation", "Situação")}</dt>
            <dd>{draft?.message}</dd>
          </dl>
          <MarketChoice lang={lang} value={currency} onChange={setCurrency} />
          <button className="button primary full" onClick={download}>
            <Icon name="download" />
            {t("Télécharger le récapitulatif", "Descarregar o resumo")}
          </button>
          <button className="text-link full" onClick={() => setEditing(true)}>
            {t("Modifier les informations", "Alterar as informações")}
          </button>
          <p className="next-note">{copy.contactPending}</p>
          <a className="text-link" href={href("about", lang)}>
            {copy.returnProject}
            <Icon />
          </a>
        </>
      )}
    </Modal>
  );
}
