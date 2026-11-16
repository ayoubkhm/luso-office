import { CountrySelect } from "./CountrySelect";
import { MarketChoice, type Currency } from "./MarketChoice";
import { translate, languages, languageNames } from "./locales";
import { handoffKey } from "./workspace/session";
import { Workspace } from "./workspace/Workspace";
import {
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
  titles,
  requestText,
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
      {children || t("Préparer mon échange", "Preparar a conversa")}
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
function DraftNotice() {
  const { t } = useSite();
  return (
    <p className="notice">
      <span className="notice-dot" aria-hidden="true" />
      {t(
        "Proposition à valider avec Hélèna. Prix en euros indicatifs ; périmètres, TVA, déplacements et frais de tiers à préciser. Aucune commande ni souscription sur cette version.",
        "Proposta a validar com Hélèna. Valores indicativos em euros; âmbitos, IVA, deslocações e despesas de terceiros por esclarecer. Sem encomendas ou adesões nesta versão.",
      )}
    </p>
  );
}
function ServiceRow({ service: s }: { service: Service }) {
  const { lang, t } = useSite();
  return (
    <details className="service-row" id={s.id}>
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
          <p className="price-status">
            {t(
              "Montants de travail · à valider",
              "Valores de trabalho · a validar",
            )}
          </p>
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
              "Un sujet suffit pour commencer. Préparez les éléments de votre premier échange.",
              "Um assunto é suficiente para começar. Prepare os elementos da primeira conversa.",
            )}
          </p>
        </div>
        <div>
          <Button />
          <small>
            {t(
              "Récapitulatif local, sans envoi de données.",
              "Resumo local, sem envio de dados.",
            )}
          </small>
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
  page: Page;
  lang: Lang;
  search?: string;
}) {
  const t = (fr: string, pt: string) => translate(fr, pt, lang);
  const [menu, setMenu] = useState(false),
    [request, setRequest] = useState<string | null>(null),
    [privacy, setPrivacy] = useState(false);
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
  const open = (subject = "") => {
    setMenu(false);
    setRequest(subject);
  };
  const link = (p: Page, q = "") => href(p, lang, q);

  if (page === "workspace") return <Workspace lang={lang} />;
  return (
    <SiteContext.Provider value={{ lang, open }}>
      <a className="skip-link" href="#main">
        {t("Aller au contenu", "Ir para o conteúdo")}
      </a>
      <div className="preview-bar">
        {t(
          "Version de présentation — services et conditions en cours de validation.",
          "Versão de apresentação — serviços e condições em validação.",
        )}
      </div>
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
                  href={href(
                    page,
                    l,
                    search
                      .replace(/([?&])lang=[^&]*/, "$1")
                      .replace(/[?&]$/, ""),
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    const q = new URLSearchParams(location.search);
                    q.delete("lang");
                    location.assign(
                      href(page, l, q.size ? "?" + q.toString() : ""),
                    );
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
          <a href={link("workspace")}>
            O meu Portugal · {t("maquette", "protótipo")}
          </a>
          <button onClick={() => open()}>
            {t("Préparer mon échange", "Preparar a conversa")}
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
                <p>
                  {t(
                    "Une maison de famille, des documents, un retour ou un projet à construire. LusoOffice est votre relais au Portugal, où que vous viviez.",
                    "Uma casa de família, documentos, um regresso ou um projeto a construir. A LusoOffice é o seu apoio em Portugal, onde quer que viva.",
                  )}
                </p>
                <div className="hero-actions">
                  <a className="button primary" href={link("services")}>
                    {t("Trouver mon service", "Encontrar o meu serviço")}
                    <Icon />
                  </a>
                  <a className="text-link" href={link("membership")}>
                    {t("Comprendre l’adhésion", "Compreender a adesão")}
                  </a>
                </div>
                <p className="hero-footnote">
                  {t(
                    "Prestations ponctuelles accessibles avec ou sans adhésion.",
                    "Serviços pontuais disponíveis com ou sem adesão.",
                  )}
                </p>
              </div>
              <div className="hero-art">
                <img
                  src="/assets/azulejos-960.webp"
                  srcSet="/assets/azulejos-640.webp 640w, /assets/azulejos-960.webp 960w, /assets/azulejos-1536.webp 1536w"
                  sizes="(max-width:760px) 100vw, 48vw"
                  width="1536"
                  height="1024"
                  alt={t(
                    "Azulejos portugais bleus et blancs, avec un carreau jaune.",
                    "Azulejos portugueses azuis e brancos, com um azulejo amarelo.",
                  )}
                  fetchPriority="high"
                />
                <span className="image-caption">
                  Ligamos Portugal aos Portugueses no Mundo
                </span>
              </div>
            </section>
            <section className="section wrap">
              <div className="section-heading">
                <h2>
                  {t(
                    "Cinq façons de garder\nle lien avec le Portugal.",
                    "Cinco formas de manter\na ligação a Portugal.",
                  )}
                </h2>
                <p>
                  {t(
                    "Partez de ce qui compte pour vous. Chaque domaine rassemble des prestations précises et leurs limites.",
                    "Comece pelo que lhe importa. Cada área reúne serviços concretos e os seus limites.",
                  )}
                </p>
              </div>
              <div className="areas-grid">
                {areas.map((a) => (
                  <a
                    className={`area-card area-${a.id}`}
                    href={link("services", `?area=${a.id}`)}
                    key={a.id}
                  >
                    <Icon name={a.icon} />
                    <h3>{a.name[lang]}</h3>
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
                    <h3>{t("Commander un service", "Pedir um serviço")}</h3>
                    <p>
                      {t(
                        "Vous avez un besoin précis ? Les prestations sont accessibles sans adhésion, selon le périmètre convenu.",
                        "Tem uma necessidade concreta? Os serviços estão disponíveis sem adesão, conforme o âmbito acordado.",
                      )}
                    </p>
                  </article>
                  <article>
                    <h3>{t("Devenir adhérent", "Tornar-se aderente")}</h3>
                    <p>
                      {t(
                        "Une adhésion pour des avantages dédiés et des prix adhérent. Les prestations restent facturées séparément.",
                        "Uma adesão com vantagens próprias e preços de aderente. Os serviços continuam a ser cobrados separadamente.",
                      )}
                    </p>
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
                    "Le rendez-vous mensuel envisagé pour les adhérents",
                    "O encontro mensal previsto para os aderentes",
                  )}
                </p>
                <h2>Portugal — Tão longe e tão perto</h2>
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
                  "Maison, démarches, famille, retour ou activité professionnelle : explorez les 28 prestations envisagées et préparez votre premier échange.",
                  "Casa, assuntos administrativos, família, regresso ou atividade profissional: explore os 28 serviços previstos e prepare a primeira conversa.",
                )}
              </p>
            </PageIntro>
            <section
              className="catalogue wrap"
              aria-label={t("Catalogue des services", "Catálogo de serviços")}
            >
              <DraftNotice />
              <Catalogue
                lang={lang}
                search={search}
                render={(s) => <ServiceRow key={s.id} service={s} />}
              />
            </section>
            <section className="section wrap future-topics">
              <h2>
                {t(
                  "D’autres sujets à préparer ensemble.",
                  "Outros assuntos a preparar em conjunto.",
                )}
              </h2>
              <p>
                {t(
                  "Nationalité portugaise, NIF, retraites, permis de conduire, traductions, études ou véhicule : ces thèmes sont à l’étude. Leur prise en charge et leurs conditions restent à confirmer.",
                  "Nacionalidade portuguesa, NIF, pensões, cartas de condução, traduções, estudos ou veículo: estes temas estão em estudo. O âmbito e as condições estão por confirmar.",
                )}
              </p>
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
              <p>
                {t(
                  "L’adhésion donne accès aux avantages de votre plan et aux prix adhérent. Les interventions au Portugal se choisissent et se paient séparément.",
                  "A adesão dá acesso às vantagens do plano e aos preços de aderente. As intervenções em Portugal são escolhidas e pagas separadamente.",
                )}
              </p>
              <a className="text-link" href={link("services")}>
                {t(
                  "Vous pouvez aussi faire appel à nous sans adhérer.",
                  "Também pode recorrer aos serviços sem aderir.",
                )}
                <Icon />
              </a>
            </PageIntro>
            <section className="wrap plans-section">
              <DraftNotice />
              <Membership lang={lang} onChoose={open} />
            </section>
            <section className="section wrap benefit-layout">
              <div>
                <h2>
                  {t(
                    "Ce que l’adhésion\na vocation à apporter.",
                    "O que a adesão\npretende oferecer.",
                  )}
                </h2>
                <p className="muted">
                  {t(
                    "Des avantages communs sont prévus. Le niveau d’orientation et les limites de chaque plan restent à définir.",
                    "Estão previstas vantagens comuns. O nível de orientação e os limites de cada plano estão por definir.",
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
                    "Orientation et accompagnement selon le plan défini",
                    "Orientação e acompanhamento conforme o plano definido",
                  ),
                  L(
                    "Newsletter mensuelle « Portugal — Tão longe e tão perto »",
                    "Newsletter mensal « Portugal — Tão longe e tão perto »",
                  ),
                  L(
                    "Carte physique numérotée envisagée",
                    "Cartão físico numerado previsto",
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
                  <span className="status-pill">
                    {t(
                      "Espace en conception · explorer la maquette",
                      "Área em conceção · explorar o protótipo",
                    )}
                  </span>
                  <h2>O meu Portugal</h2>
                  <a className="button primary" href={link("workspace")}>
                    {t(
                      "Explorer l’espace de démonstration",
                      "Explorar a área de demonstração",
                    )}
                  </a>
                  <p>
                    {t(
                      "À terme, un même espace pour votre adhésion, vos demandes, vos biens, vos documents et vos échanges.",
                      "No futuro, um só espaço para a adesão, os pedidos, os imóveis, os documentos e os contactos.",
                    )}
                  </p>
                  <p>
                    {t(
                      "L’accès au compte, les paiements et le suivi des dossiers seront développés dans une phase dédiée.",
                      "O acesso à conta, os pagamentos e o acompanhamento dos processos serão desenvolvidos numa fase própria.",
                    )}
                  </p>
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
              <p>
                {t(
                  "Créer, installer ou développer une activité demande de réunir plusieurs compétences. LusoOffice organise le lien avec les intervenants adaptés à votre projet.",
                  "Criar, instalar ou desenvolver uma atividade exige reunir várias competências. A LusoOffice organiza a ligação com os intervenientes adequados ao seu projeto.",
                )}
              </p>
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
                    "Intervention envisagée d’un comptable partenaire, selon une prestation et des honoraires propres.",
                    "Intervenção prevista de um contabilista parceiro, com serviço e honorários próprios.",
                  )}
                </p>
              </article>
              <article>
                <Icon name="route" />
                <h2>{t("Projet et financement", "Projeto e financiamento")}</h2>
                <p>
                  {t(
                    "Appui envisagé d’un consultant. Ses missions et qualifications sont à confirmer avant présentation d’une offre spécialisée.",
                    "Apoio previsto de um consultor. As funções e habilitações estão por confirmar antes da apresentação de uma oferta especializada.",
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
                    "Ces axes de travail sont à développer avec les partenaires. Les prestations spécialisées font l’objet de propositions distinctes.",
                    "Estes eixos serão desenvolvidos com os parceiros. Os serviços especializados têm propostas separadas.",
                  )}
                </p>
              </div>
              <div className="business-topics">
                {[
                  L("Créer une entreprise", "Criar empresa"),
                  L("Comptabilité et fiscalité", "Contabilidade e fiscalidade"),
                  L(
                    "Plan d’affaires et viabilité",
                    "Plano de negócio e viabilidade",
                  ),
                  L(
                    "Préparer un dossier de financement",
                    "Preparar um dossier de financiamento",
                  ),
                  L(
                    "Organiser un projet d’investissement",
                    "Organizar um projeto de investimento",
                  ),
                  L(
                    "S’installer et trouver des fournisseurs",
                    "Instalar-se e encontrar fornecedores",
                  ),
                  L(
                    "Suivre l’activité depuis l’étranger",
                    "Acompanhar a atividade no estrangeiro",
                  ),
                ].map((x, i) => (
                  <div key={x.fr}>
                    <Icon name={i % 2 ? "file" : "business"} />
                    <h3>{x[lang]}</h3>
                  </div>
                ))}
              </div>
            </section>
            <section className="section pale">
              <div className="wrap">
                <h2>
                  {t(
                    "L’accompagnement opérationnel.",
                    "O acompanhamento operacional.",
                  )}
                </h2>
                <DraftNotice />
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
        {page === "about" && (
          <>
            <PageIntro
              title={t(
                "Le lien avec le Portugal\nse transmet aussi.",
                "A ligação a Portugal\ntambém se transmite.",
              )}
            >
              <p>
                {t(
                  "LusoOffice est né d’une réalité familiale : vivre ailleurs et garder au Portugal des proches, une maison, des responsabilités et des projets.",
                  "A LusoOffice nasceu de uma realidade familiar: viver noutro país e manter em Portugal familiares, uma casa, responsabilidades e projetos.",
                )}
              </p>
            </PageIntro>
            <section className="wrap about-story">
              <div className="tile-quote">
                <span aria-hidden="true">“</span>
                <p>Ligamos Portugal aos Portugueses no Mundo</p>
                <small>LusoOffice Global</small>
              </div>
              <div>
                <h2>
                  {t(
                    "Pour ceux qui sont partis.\nEt ceux qui ont grandi ailleurs.",
                    "Para quem partiu.\nE quem cresceu noutro país.",
                  )}
                </h2>
                <p>
                  {t(
                    "La fondatrice, fille d’émigrants en France, porte cette double appartenance. Le projet s’adresse autant aux générations parties du Portugal qu’à leurs enfants et petits-enfants, y compris ceux nés à l’étranger.",
                    "A fundadora, filha de emigrantes em França, traz essa dupla pertença. O projeto dirige-se às gerações que saíram de Portugal e aos seus filhos e netos, incluindo os que nasceram no estrangeiro.",
                  )}
                </p>
                <p>
                  {t(
                    "L’opération est pensée depuis le Portugal, avec la France comme premier marché. La proximité se construit par la clarté des échanges et le rôle de chacun.",
                    "A operação é pensada a partir de Portugal, com França como primeiro mercado. A proximidade constrói-se pela clareza dos contactos e do papel de cada interveniente.",
                  )}
                </p>
                <div className="tbd-person">
                  <strong>
                    {t(
                      "Présentation de votre interlocuteur",
                      "Apresentação do seu interlocutor",
                    )}
                  </strong>
                  <span>TBD</span>
                </div>
              </div>
            </section>
            <section className="section wrap">
              <div className="section-heading">
                <h2>
                  {t(
                    "Une ambition internationale.",
                    "Uma ambição internacional.",
                  )}
                </h2>
                <p>
                  {t(
                    "Une présence de proximité est à l’étude dans les pays de la diaspora. Aucune de ces adresses n’est encore annoncée comme un bureau ouvert.",
                    "Está em estudo uma presença próxima nos países da diáspora. Nenhuma destas moradas é anunciada como escritório aberto.",
                  )}
                </p>
              </div>
              <div className="presence-list">
                {[
                  [
                    "Paris",
                    t("France", "França"),
                    t(
                      "Adresse professionnelle recherchée",
                      "Morada profissional em pesquisa",
                    ),
                  ],
                  [
                    "Londres",
                    t("Royaume-Uni", "Reino Unido"),
                    t(
                      "Adresse professionnelle recherchée",
                      "Morada profissional em pesquisa",
                    ),
                  ],
                  [
                    t("Francfort", "Frankfurt"),
                    t("Allemagne", "Alemanha"),
                    t(
                      "Ville proposée, à confirmer",
                      "Cidade proposta, por confirmar",
                    ),
                  ],
                  [
                    t("Genève", "Genebra"),
                    t("Suisse", "Suíça"),
                    t(
                      "Ville proposée, à confirmer",
                      "Cidade proposta, por confirmar",
                    ),
                  ],
                  [
                    "Fall River",
                    "Massachusetts, USA",
                    t(
                      "Ville retenue pour la recherche",
                      "Cidade escolhida para a pesquisa",
                    ),
                  ],
                ].map(([city, country, status]) => (
                  <article key={city}>
                    <h3>{city}</h3>
                    <p>{country}</p>
                    <small>{status}</small>
                  </article>
                ))}
              </div>
            </section>
            <section className="pale section">
              <div className="wrap partnership">
                <div>
                  <h2>
                    {t(
                      "Associations, écoles\net liens entre générations.",
                      "Associações, escolas\ne laços entre gerações.",
                    )}
                  </h2>
                  <p>
                    {t(
                      "LusoOffice souhaite construire des relations avec les associations portugaises, les écoles et les réseaux de la diaspora. Les conditions du programme de partenariat restent à définir.",
                      "A LusoOffice pretende construir relações com associações portuguesas, escolas e redes da diáspora. As condições do programa de parcerias estão por definir.",
                    )}
                  </p>
                </div>
                <div>
                  <h3>
                    {t(
                      "Vous représentez une structure ?",
                      "Representa uma organização?",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Présentez votre pays, votre communauté et les sujets sur lesquels vous souhaitez échanger.",
                      "Apresente o país, a comunidade e os assuntos que pretende abordar.",
                    )}
                  </p>
                  <Button subject="partnership">
                    {t(
                      "Préparer un échange partenaire",
                      "Preparar uma conversa de parceria",
                    )}
                  </Button>
                </div>
              </div>
            </section>
            <section id="contact" className="section wrap contact-details">
              <div>
                <h2>
                  {t(
                    "Préparons le premier échange.",
                    "Preparemos a primeira conversa.",
                  )}
                </h2>
                <p>
                  {t(
                    "Les coordonnées publiques et les zones couvertes au Portugal seront précisées ici une fois confirmées.",
                    "Os contactos públicos e as zonas abrangidas em Portugal serão indicados aqui após confirmação.",
                  )}
                </p>
                <Button />
              </div>
              <dl>
                {[
                  t("E-mail", "E-mail"),
                  t("Téléphone", "Telefone"),
                  t(
                    "Zones couvertes au Portugal",
                    "Zonas abrangidas em Portugal",
                  ),
                  t(
                    "Identité juridique et siège",
                    "Identificação jurídica e sede",
                  ),
                ].map((x) => (
                  <div key={x}>
                    <dt>{x}</dt>
                    <dd>TBD</dd>
                  </div>
                ))}
              </dl>
            </section>
          </>
        )}
        {page === "journal" && (
          <>
            <section className="journal-cover wrap">
              <div>
                <p className="overline">
                  {t("Le journal de LusoOffice", "O jornal da LusoOffice")}
                </p>
                <h1>
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
                <span className="status-pill">
                  {t(
                    "Première édition à venir",
                    "Primeira edição em preparação",
                  )}
                </span>
              </div>
              <div className="journal-tile" aria-hidden="true">
                <img
                  src="/assets/azulejos-960.webp"
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
                    "Une newsletter mensuelle en portugais, conçue pour 3 à 5 minutes de lecture. L’édition complète est prévue pour les adhérents, avec un extrait public.",
                    "Uma newsletter mensal em português, pensada para 3 a 5 minutos de leitura. A edição completa está prevista para os aderentes, com um excerto público.",
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
              <p className="editorial-note">
                {t(
                  "Le calendrier et la responsabilité éditoriale restent à confirmer. Aucun abonnement à la newsletter n’est activé sur cette version.",
                  "O calendário e a responsabilidade editorial estão por confirmar. Não é possível subscrever a newsletter nesta versão.",
                )}
              </p>
            </section>
            <section className="cultural-section">
              <div className="wrap cultural-layout">
                <div>
                  <p className="overline">
                    {t(
                      "Projet culturel à développer",
                      "Projeto cultural a desenvolver",
                    )}
                  </p>
                  <h2>Coffret da Lis</h2>
                  <p>
                    {t(
                      "Six illustrations autour de symboles portugais et un livre à construire avec les élèves des écoles de portugais à l’étranger, coautrices et coauteurs de leurs contributions.",
                      "Seis ilustrações sobre símbolos portugueses e um livro a construir com os alunos das escolas de português no estrangeiro, coautores dos seus contributos.",
                    )}
                  </p>
                  <p className="muted">
                    {t(
                      "Écoles, contenus, autorisations et production restent à organiser. Aucun coffret n’est proposé à la vente.",
                      "Escolas, conteúdos, autorizações e produção estão por organizar. Não há coffrets à venda.",
                    )}
                  </p>
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
            <Cta />
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="wrap footer-top">
          <div>
            <a className="wordmark" href={link("home")}>
              Luso<span>Office</span>
            </a>
            <p>Ligamos Portugal aos Portugueses no Mundo</p>
          </div>
          <nav aria-label={t("Liens de pied de page", "Ligações do rodapé")}>
            <a href={link("workspace")}>
              O meu Portugal · {t("maquette", "protótipo")}
            </a>
            {nav.map(([p, label]) => (
              <a key={p} href={link(p)}>
                {label}
              </a>
            ))}
            <a href={link("about", "#contact")}>{t("Contact", "Contactos")}</a>
          </nav>
        </div>
        <div className="wrap footer-bottom">
          <p>
            {t(
              "Version de présentation. Aucun paiement ni envoi de demande.",
              "Versão de apresentação. Sem pagamentos nem envio de pedidos.",
            )}
          </p>
          <button onClick={() => setPrivacy(true)}>
            {t("Confidentialité", "Privacidade")}
          </button>
        </div>
      </footer>
      {request !== null && (
        <RequestModal
          lang={lang}
          initial={request}
          onClose={() => setRequest(null)}
        />
      )}
      {privacy && (
        <Modal
          title={t("Confidentialité", "Privacidade")}
          lang={lang}
          onClose={() => setPrivacy(false)}
        >
          <p>
            {t(
              "Les informations servent à préparer votre exemple. Le transfert vers la démo utilise le stockage de cet onglet ; la sauvegarde sur cet appareil est facultative et peut être effacée dans « Session de démonstration ». Aucun envoi ni outil publicitaire. Le fichier téléchargé reste sur votre appareil jusqu’à sa suppression.",
              "As informações servem para preparar o exemplo. A transferência para a demo usa o armazenamento deste separador; a gravação neste dispositivo é facultativa e pode ser apagada em « Sessão de demonstração ». Sem envio nem ferramentas publicitárias. O ficheiro descarregado permanece no dispositivo até o eliminar.",
            )}
          </p>
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
        {fr
          ? filtered.length === 1
            ? "service trouvé"
            : "services trouvés"
          : filtered.length === 1
            ? "serviço encontrado"
            : "serviços encontrados"}
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
  onChoose: (s: string) => void;
}) {
  const [annual, setAnnual] = useState(true),
    fr = lang === "fr";
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
        {plans.map((p) => (
          <article
            className={`plan ${p.id === "Family" ? "family-plan" : ""}`}
            key={p.id}
          >
            <p className="plan-state">
              {p.id === "Premium"
                ? translate("Plan à l’étude", "Plano em estudo", lang)
                : translate("Proposition de plan", "Proposta de plano", lang)}
            </p>
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
                "Montant indicatif, conditions et TVA à valider.",
                "Valor indicativo, condições e IVA a validar.",
                lang,
              )}
            </small>
            <p className="plan-description">{p.description[lang]}</p>
            <button
              className={`button ${p.id === "Family" ? "primary" : "secondary"}`}
              onClick={() => onChoose(p.id)}
            >
              {translate(
                "Parler de ce plan",
                "Conversar sobre este plano",
                lang,
              )}
            </button>
          </article>
        ))}
      </div>
      <p className="plan-disclaimer">
        {translate(
          "L’annuel et le mensuel sont deux modalités distinctes. Échéances, renouvellement, bénéficiaires et limites d’accompagnement restent à préciser. Les services sont toujours facturés séparément.",
          "Anual e mensal são duas modalidades distintas. Pagamentos, renovação, beneficiários e limites de acompanhamento estão por definir. Os serviços são sempre cobrados separadamente.",
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
        "Non. Les prestations ponctuelles sont accessibles aux non-adhérents. L’adhésion donne accès à des avantages et à des tarifs propres, selon les conditions qui seront validées.",
        "Não. Os serviços pontuais estão disponíveis para não aderentes. A adesão dá acesso a vantagens e preços próprios, conforme as condições a validar.",
      ),
    ],
    [
      L(
        "Les prestations sont-elles comprises dans l’adhésion ?",
        "Os serviços estão incluídos na adesão?",
      ),
      L(
        "Non. Visites, démarches et interventions sont facturées séparément. Les avantages et le niveau d’orientation de chaque plan sont encore à préciser.",
        "Não. Visitas, diligências e intervenções são cobradas separadamente. As vantagens e o nível de orientação de cada plano estão por definir.",
      ),
    ],
    [
      L("Les prix sont-ils définitifs ?", "Os preços são definitivos?"),
      L(
        "Les montants présentés sont des propositions de travail en euros. TVA, frais, déplacements, périmètres et unités de facturation doivent être validés avant toute commercialisation.",
        "Os valores apresentados são propostas de trabalho em euros. IVA, despesas, deslocações, âmbitos e unidades de cobrança devem ser validados antes da comercialização.",
      ),
    ],
    [
      L(
        "Quels frais doivent être distingués ?",
        "Que despesas devem ser distinguidas?",
      ),
      L(
        "L’accompagnement LusoOffice, les frais officiels et les honoraires des professionnels extérieurs doivent être identifiés séparément. Les modalités de provision et de régularisation restent à définir.",
        "O acompanhamento LusoOffice, as taxas oficiais e os honorários de profissionais externos devem ser identificados separadamente. As condições de provisão e acerto estão por definir.",
      ),
    ],
    [
      L(
        "Puis-je déjà souscrire ou envoyer une demande ?",
        "Já posso aderir ou enviar um pedido?",
      ),
      L(
        "Cette version permet de découvrir l’offre et de préparer un récapitulatif local. Aucun paiement, compte client ou envoi de demande n’est activé.",
        "Esta versão permite conhecer a oferta e preparar um resumo local. Não estão ativos pagamentos, contas de cliente ou envio de pedidos.",
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
function RequestModal({
  lang,
  initial,
  onClose,
}: {
  lang: Lang;
  initial: string;
  onClose: () => void;
}) {
  const fr = lang === "fr",
    t = (a: string, b: string) => translate(a, b, lang);
  const [draft, setDraft] = useState<RequestDraft | null>(null),
    [editing, setEditing] = useState(true);
  const [handoffError, setHandoffError] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const selected = services.find((s) => s.id === initial),
    plan = plans.find((p) => p.id === initial);
  const initialSubject =
    selected?.id || (plan ? `plan-${plan.id}` : initial || "other");
  const options = [
    ...services.map((s) => ({ value: s.id, label: s.name[lang] })),
    ...plans.map((p) => ({
      value: `plan-${p.id}`,
      label: t("Adhésion", "Adesão") + " " + p.id,
    })),
    {
      value: "partnership",
      label: t("Partenariat ou association", "Parceria ou associação"),
    },
    { value: "other", label: t("À définir ensemble", "A definir em conjunto") },
  ];
  const [subject, setSubject] = useState(initialSubject);
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
    setDraft({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      country: String(data.get("country")),
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
      new Blob([requestText(draft, lang)], {
        type: "text/plain;charset=utf-8",
      }),
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
      onClose={onClose}
    >
      {editing ? (
        <>
          <p className="modal-intro">
            {t(
              "Ce formulaire prépare un document à télécharger. Aucune demande n’est envoyée et aucune souscription n’est créée.",
              "Este formulário prepara um documento para descarregar. Não envia pedidos nem cria adesões.",
            )}
          </p>
          <form onSubmit={submit}>
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
            <label>
              {t("Votre situation *", "A sua situação *")}
              <textarea
                name="message"
                rows={4}
                maxLength={3000}
                required
                defaultValue={draft?.message}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                aria-describedby="sensitive-note"
                placeholder={t(
                  "Quel besoin, dans quelle commune, pour quelle échéance ?",
                  "Qual a necessidade, em que concelho e para quando?",
                )}
              />
            </label>
            <p id="sensitive-note" className="form-note">
              {t(
                "Ne saisissez pas de documents d’identité, de coordonnées bancaires ou d’informations sensibles.",
                "Não introduza documentos de identificação, dados bancários ou informações sensíveis.",
              )}
            </p>
            <button type="submit" className="button primary full">
              {t("Créer mon récapitulatif", "Criar o meu resumo")}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="modal-intro">
            {t(
              "Aucune information n’a été envoyée. Conservez ce document pour votre futur échange avec LusoOffice.",
              "Nenhuma informação foi enviada. Guarde este documento para a futura conversa com a LusoOffice.",
            )}
          </p>
          <dl className="request-summary">
            <dt>{t("Nom", "Nome")}</dt>
            <dd>{draft?.name}</dd>
            <dt>{t("Sujet", "Assunto")}</dt>
            <dd>{draft?.subject}</dd>
            <dt>{t("Situation", "Situação")}</dt>
            <dd>{draft?.message}</dd>
          </dl>
          {services.some((s) => s.id === subject) && (
            <>
              <button
                className="button primary full"
                onClick={() => {
                  try {
                    sessionStorage.setItem(
                      handoffKey,
                      JSON.stringify({
                        version: 1,
                        service: subject,
                        description: draft?.message || "",
                        name: draft?.name || "",
                        country: draft?.country || "",
                        currency,
                      }),
                    );
                    location.assign(
                      href("workspace", lang, "#view=requests&role=member"),
                    );
                  } catch {
                    setHandoffError(
                      t(
                        "Le navigateur ne permet pas ce transfert local. Téléchargez votre récapitulatif.",
                        "O navegador não permite esta transferência local. Descarregue o resumo.",
                      ),
                    );
                  }
                }}
              >
                {t(
                  "Continuer dans la démo O meu Portugal",
                  "Continuar na demo O meu Portugal",
                )}
              </button>
              <p>
                {t(
                  "Transfert local de cet exemple uniquement, sans envoi à l’équipe.",
                  "Transferência local deste exemplo, sem envio à equipa.",
                )}
              </p>
              {handoffError && <p role="alert">{handoffError}</p>}
            </>
          )}
          <MarketChoice lang={lang} value={currency} onChange={setCurrency} />
          <button className="button primary full" onClick={download}>
            <Icon name="download" />
            {t("Télécharger le récapitulatif", "Descarregar o resumo")}
          </button>
          <button className="text-link full" onClick={() => setEditing(true)}>
            {t("Modifier les informations", "Alterar as informações")}
          </button>
          <p className="next-note">
            {t(
              "Coordonnées de contact : TBD. Aucun dossier n’est en attente de traitement.",
              "Contactos: TBD. Nenhum processo está a aguardar tratamento.",
            )}
          </p>
          <a className="text-link" href={href("about", lang, "#contact")}>
            {t("Voir les informations de contact", "Ver os contactos")}
            <Icon />
          </a>
        </>
      )}
    </Modal>
  );
}
