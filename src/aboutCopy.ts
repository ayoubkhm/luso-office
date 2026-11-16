import type { Lang } from "./locales";

type AboutCopy = {
  title: string;
  mission: string;
  services: string;
  storyLink: string;
  storyTitle: string;
  story: string[];
  methodTitle: string;
  methodIntro: string;
  steps: { title: string; body: string }[];
  specialist: string;
  diasporaTitle: string;
  diaspora: string;
  journal: string;
  outlookTitle: string;
  outlook: string;
  partnership: string;
  partnerAction: string;
  contactTitle: string;
  contact: string;
  contactAction: string;
  metaDescription: string;
};

export const aboutCopy: Record<Lang, AboutCopy> = {
  fr: {
    title: "Vivre ailleurs.\nGarder un lien avec le Portugal.",
    mission:
      "LusoOffice accompagne les Portugais et leurs descendants vivant à l’étranger dans leurs affaires au Portugal : maison, documents, famille, retour ou projet professionnel.",
    services: "Découvrir nos services",
    storyLink: "Lire notre histoire",
    storyTitle: "Une histoire entre\nla France et le Portugal.",
    story: [
      "À l’origine de LusoOffice, il y a le parcours d’une fondatrice, fille d’émigrants portugais en France. Cette histoire familiale donne au projet son point de départ : les liens avec le Portugal continuent de compter, même lorsque l’on vit ailleurs.",
      "Une maison à entretenir, des documents à réunir, un bien hérité ou un projet de retour : les sujets changent selon les générations. LusoOffice apporte un relais au Portugal à ceux qui sont partis comme à leurs enfants et petits-enfants, y compris ceux nés à l’étranger.",
    ],
    methodTitle: "Un accompagnement pensé\npour être clair.",
    methodIntro:
      "Une mission définie ensemble et un interlocuteur chargé d’en coordonner les étapes au Portugal.",
    steps: [
      {
        title: "Comprendre votre situation",
        body: "Identifier le sujet, le lieu concerné, les démarches déjà entreprises et les échéances que vous avez à respecter.",
      },
      {
        title: "Définir la mission",
        body: "Préciser les actions possibles, les autorisations nécessaires, le prix et les frais externes avant tout accord.",
      },
      {
        title: "Organiser les interventions",
        body: "Coordonner les échanges et les démarches convenus, avec les professionnels compétents lorsque la mission le nécessite.",
      },
      {
        title: "Vous tenir informé",
        body: "Prévoir les points de suivi, les documents à vous remettre et les décisions qui nécessitent votre accord.",
      },
    ],
    specialist:
      "LusoOffice a un rôle de coordination. Les actes juridiques, comptables ou autres prestations réglementées relèvent des professionnels habilités concernés. Leurs interventions et leurs honoraires sont à préciser séparément.",
    diasporaTitle: "Un lien qui traverse\nles générations.",
    diaspora:
      "Le lien avec le Portugal passe aussi par la langue, la culture et ce que l’on transmet aux enfants. Notre journal et notre démarche auprès des associations et des écoles de portugais prolongent cette intention.",
    journal: "Découvrir le journal",
    outlookTitle: "Associations et projets de proximité",
    outlook:
      "Les associations et les écoles de portugais font vivre les liens entre les générations. Nous souhaitons échanger avec celles qui partagent cette attention aux communautés de la diaspora.",
    partnership:
      "Vous représentez une association, une école ou un réseau de la diaspora ? Présentez votre communauté et les sujets sur lesquels vous souhaitez échanger.",
    partnerAction: "Échanger avec LusoOffice",
    contactTitle: "Et vous, qu’avez-vous\nà organiser au Portugal ?",
    contact:
      "Une maison, une démarche ou un projet : décrivez votre situation et les questions que vous souhaitez aborder lors d’un premier échange.",
    contactAction: "Parlons de votre besoin",
    metaDescription:
      "Découvrez l’origine familiale de LusoOffice, sa mission au Portugal et son lien avec les Portugais et leurs descendants à l’étranger.",
  },
  pt: {
    title: "Viver noutro país.\nManter a ligação a Portugal.",
    mission:
      "A LusoOffice acompanha os portugueses e lusodescendentes que vivem no estrangeiro nos seus assuntos em Portugal: casa, documentos, família, regresso ou projeto profissional.",
    services: "Conhecer os nossos serviços",
    storyLink: "Ler a nossa história",
    storyTitle: "Uma história entre\nFrança e Portugal.",
    story: [
      "Na origem da LusoOffice está o percurso de uma fundadora, filha de emigrantes portugueses em França. Esta história familiar é o ponto de partida do projeto: os laços com Portugal continuam a contar, mesmo quando se vive noutro país.",
      "Uma casa para cuidar, documentos para reunir, um imóvel herdado ou um projeto de regresso: os assuntos mudam de geração para geração. A LusoOffice é um apoio em Portugal para quem partiu e para os seus filhos e netos, incluindo os que nasceram no estrangeiro.",
    ],
    methodTitle: "Um acompanhamento pensado\npara ser claro.",
    methodIntro:
      "Uma missão definida em conjunto e um interlocutor responsável por coordenar as etapas em Portugal.",
    steps: [
      {
        title: "Compreender a sua situação",
        body: "Identificar o assunto, o local, as diligências já realizadas e os prazos que tem de cumprir.",
      },
      {
        title: "Definir a missão",
        body: "Especificar as ações possíveis, as autorizações necessárias, o preço e as despesas externas antes de qualquer acordo.",
      },
      {
        title: "Organizar as intervenções",
        body: "Coordenar os contactos e as diligências acordados, com os profissionais competentes quando a missão o exigir.",
      },
      {
        title: "Manter o contacto",
        body: "Prever os momentos de acompanhamento, os documentos a entregar e as decisões que exigem a sua aprovação.",
      },
    ],
    specialist:
      "A LusoOffice tem um papel de coordenação. Os atos jurídicos, contabilísticos ou outras prestações regulamentadas cabem aos respetivos profissionais habilitados. As suas intervenções e os seus honorários devem ser especificados separadamente.",
    diasporaTitle: "Uma ligação que atravessa\ngerações.",
    diaspora:
      "A ligação a Portugal passa também pela língua, pela cultura e pelo que transmitimos aos filhos. O nosso jornal e a aproximação às associações e escolas de português prolongam esta intenção.",
    journal: "Conhecer o jornal",
    outlookTitle: "Associações e projetos de proximidade",
    outlook:
      "As associações e as escolas de português mantêm vivos os laços entre gerações. Queremos conversar com quem partilha esta atenção às comunidades da diáspora.",
    partnership:
      "Representa uma associação, uma escola ou uma rede da diáspora? Apresente a sua comunidade e os assuntos sobre os quais gostaria de conversar.",
    partnerAction: "Conversar com a LusoOffice",
    contactTitle: "E no seu caso, o que precisa\nde organizar em Portugal?",
    contact:
      "Uma casa, uma diligência ou um projeto: descreva a sua situação e as perguntas que gostaria de abordar numa primeira conversa.",
    contactAction: "Fale-nos do que precisa",
    metaDescription:
      "Conheça a origem familiar da LusoOffice, a sua missão em Portugal e a ligação aos portugueses e lusodescendentes no estrangeiro.",
  },
  en: {
    title: "Living abroad.\nKeeping a connection to Portugal.",
    mission:
      "LusoOffice supports Portuguese people and their descendants living abroad with their affairs in Portugal: home, documents, family, returning or a business project.",
    services: "Explore our services",
    storyLink: "Read our story",
    storyTitle: "A story between\nFrance and Portugal.",
    story: [
      "LusoOffice begins with the story of a founder whose parents emigrated from Portugal to France. This family background is the starting point for the project: ties to Portugal continue to matter, even when you live elsewhere.",
      "A home to look after, documents to gather, an inherited property or plans to return: each generation faces different questions. LusoOffice provides support in Portugal for those who left and for their children and grandchildren, including those born abroad.",
    ],
    methodTitle: "Support designed\nto be clear.",
    methodIntro:
      "An assignment agreed together and a contact person to coordinate each step in Portugal.",
    steps: [
      {
        title: "Understand your situation",
        body: "Identify the matter, the location, any steps already taken and the deadlines you need to meet.",
      },
      {
        title: "Agree the scope",
        body: "Set out the possible actions, required authorisations, price and external costs before reaching an agreement.",
      },
      {
        title: "Organise the work",
        body: "Coordinate the agreed communication and tasks, involving qualified professionals where the assignment requires them.",
      },
      {
        title: "Keep you informed",
        body: "Plan progress updates, the documents to be provided and the decisions that need your approval.",
      },
    ],
    specialist:
      "LusoOffice’s role is coordination. Legal, accounting and other regulated services are the responsibility of the relevant qualified professionals. Their work and fees must be specified separately.",
    diasporaTitle: "A connection across\ngenerations.",
    diaspora:
      "The connection to Portugal also lives through language, culture and what we pass on to children. Our journal and outreach to associations and Portuguese schools build on that connection.",
    journal: "Explore the journal",
    outlookTitle: "Associations and local presence",
    outlook:
      "Associations and Portuguese schools keep connections between generations alive. We welcome conversations with those who share this commitment to Portuguese communities abroad.",
    partnership:
      "Do you represent an association, school or diaspora network? Introduce your community and the topics you would like to discuss.",
    partnerAction: "Talk to LusoOffice",
    contactTitle: "What do you need\nto organise in Portugal?",
    contact:
      "A home, an administrative matter or a project: describe your situation and the questions you would like to discuss in a first conversation.",
    contactAction: "Tell us what you need",
    metaDescription:
      "Discover LusoOffice’s family origins, its mission in Portugal and its connection with Portuguese people and their descendants abroad.",
  },
  de: {
    title: "Im Ausland leben.\nMit Portugal verbunden bleiben.",
    mission:
      "LusoOffice unterstützt Portugiesen und ihre Nachkommen im Ausland bei ihren Angelegenheiten in Portugal: Haus, Dokumente, Familie, Rückkehr oder berufliche Vorhaben.",
    services: "Unsere Leistungen entdecken",
    storyLink: "Unsere Geschichte lesen",
    storyTitle: "Eine Geschichte zwischen\nFrankreich und Portugal.",
    story: [
      "Am Anfang von LusoOffice steht die Geschichte einer Gründerin, deren Eltern aus Portugal nach Frankreich ausgewandert sind. Diese Familiengeschichte bildet den Ausgangspunkt des Projekts: Die Verbindung zu Portugal bleibt wichtig, auch wenn man anderswo lebt.",
      "Ein Haus, um das man sich kümmern muss, benötigte Dokumente, eine geerbte Immobilie oder Pläne für die Rückkehr: Jede Generation hat andere Anliegen. LusoOffice unterstützt vor Ort in Portugal – sowohl die Ausgewanderten als auch ihre Kinder und Enkel, einschließlich der im Ausland Geborenen.",
    ],
    methodTitle: "Eine klare\nBegleitung.",
    methodIntro:
      "Ein gemeinsam vereinbarter Auftrag und eine Ansprechperson, die die Schritte in Portugal koordiniert.",
    steps: [
      {
        title: "Ihre Situation verstehen",
        body: "Das Anliegen, den Ort, bereits unternommene Schritte und die von Ihnen einzuhaltenden Fristen klären.",
      },
      {
        title: "Den Auftrag festlegen",
        body: "Mögliche Maßnahmen, erforderliche Vollmachten, Preise und externe Kosten vor einer Vereinbarung benennen.",
      },
      {
        title: "Die Umsetzung organisieren",
        body: "Die vereinbarten Kontakte und Aufgaben koordinieren und bei Bedarf qualifizierte Fachleute einbeziehen.",
      },
      {
        title: "Sie auf dem Laufenden halten",
        body: "Zwischenberichte, die Übergabe von Dokumenten und Entscheidungen planen, für die Ihre Zustimmung erforderlich ist.",
      },
    ],
    specialist:
      "LusoOffice übernimmt eine koordinierende Rolle. Rechtliche, buchhalterische und andere reglementierte Leistungen liegen in der Verantwortung der jeweiligen befugten Fachleute. Deren Leistungen und Honorare sind gesondert festzulegen.",
    diasporaTitle: "Eine Verbindung über\nGenerationen hinweg.",
    diaspora:
      "Die Verbindung zu Portugal lebt auch durch Sprache, Kultur und das, was wir Kindern weitergeben. Unser Journal und der Austausch mit Vereinen und portugiesischen Schulen knüpfen daran an.",
    journal: "Das Journal entdecken",
    outlookTitle: "Vereine und lokale Anlaufstellen",
    outlook:
      "Vereine und portugiesische Schulen halten die Verbindung zwischen Generationen lebendig. Wir freuen uns auf den Austausch mit denen, die dieses Anliegen für die Gemeinschaften im Ausland teilen.",
    partnership:
      "Vertreten Sie einen Verein, eine Schule oder ein Netzwerk der Diaspora? Stellen Sie Ihre Gemeinschaft und die Themen vor, über die Sie sprechen möchten.",
    partnerAction: "Mit LusoOffice sprechen",
    contactTitle: "Was möchten Sie\nin Portugal organisieren?",
    contact:
      "Ein Haus, eine Behördensache oder ein Projekt: Beschreiben Sie Ihre Situation und die Fragen, die Sie in einem ersten Gespräch klären möchten.",
    contactAction: "Sprechen wir über Ihr Anliegen",
    metaDescription:
      "Entdecken Sie die familiären Wurzeln von LusoOffice, seine Aufgabe in Portugal und die Verbindung zu Portugiesen und ihren Nachkommen im Ausland.",
  },
};
