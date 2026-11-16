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
  localNotice: string;
  metaDescription: string;
};

export const aboutCopy: Record<Lang, AboutCopy> = {
  fr: {
    title: "Vivre ailleurs.\nGarder un lien avec le Portugal.",
    mission:
      "LusoOffice se construit pour accompagner les Portugais et leurs descendants vivant à l’étranger dans les affaires qu’ils ont à organiser au Portugal : maison, documents, famille, retour ou projet professionnel.",
    services: "Découvrir nos services",
    storyLink: "Lire notre histoire",
    storyTitle: "Une histoire entre\nla France et le Portugal.",
    story: [
      "À l’origine de LusoOffice, il y a le parcours d’une fondatrice, fille d’émigrants portugais en France. Cette histoire familiale donne au projet son point de départ : les liens avec le Portugal continuent de compter, même lorsque l’on vit ailleurs.",
      "Une maison à entretenir, des documents à réunir, un bien hérité ou un projet de retour : les sujets changent selon les générations. LusoOffice souhaite apporter un relais au Portugal à ceux qui sont partis comme à leurs enfants et petits-enfants, y compris ceux nés à l’étranger.",
    ],
    methodTitle: "Un accompagnement pensé\npour être clair.",
    methodIntro:
      "Le fonctionnement prévu repose sur une mission définie ensemble et un interlocuteur chargé d’en coordonner les étapes au Portugal.",
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
      "Le lien avec le Portugal passe aussi par la langue, la culture et ce que l’on transmet aux enfants. Le projet de journal de LusoOffice et les échanges envisagés avec les associations et les écoles de portugais prolongent cette intention.",
    journal: "Découvrir le projet de journal",
    outlookTitle: "Associations et projets de proximité",
    outlook:
      "LusoOffice étudie des relais de proximité dans les pays de la diaspora. Les lieux et les modalités restent à confirmer ; aucun bureau à l’étranger n’est annoncé comme ouvert.",
    partnership:
      "Vous représentez une association, une école ou un réseau de la diaspora ? Présentez votre communauté et les sujets sur lesquels vous souhaitez échanger. Les partenariats restent à construire.",
    partnerAction: "Préparer un échange partenaire",
    contactTitle: "Et vous, qu’avez-vous\nà organiser au Portugal ?",
    contact:
      "Une maison, une démarche ou un projet : décrivez votre situation et les questions que vous souhaitez aborder lors d’un premier échange.",
    contactAction: "Préparer mon échange",
    localNotice:
      "Cette version permet de préparer un récapitulatif sur votre appareil. Aucun message n’est envoyé. Les coordonnées et les zones d’intervention seront publiées après confirmation.",
    metaDescription:
      "Découvrez l’origine familiale de LusoOffice, son projet d’accompagnement au Portugal et les liens qu’il souhaite entretenir avec la diaspora et ses descendants.",
  },
  pt: {
    title: "Viver noutro país.\nManter a ligação a Portugal.",
    mission:
      "A LusoOffice está a ser criada para acompanhar os portugueses e lusodescendentes que vivem no estrangeiro nos assuntos que precisam de organizar em Portugal: casa, documentos, família, regresso ou projeto profissional.",
    services: "Conhecer os nossos serviços",
    storyLink: "Ler a nossa história",
    storyTitle: "Uma história entre\nFrança e Portugal.",
    story: [
      "Na origem da LusoOffice está o percurso de uma fundadora, filha de emigrantes portugueses em França. Esta história familiar é o ponto de partida do projeto: os laços com Portugal continuam a contar, mesmo quando se vive noutro país.",
      "Uma casa para cuidar, documentos para reunir, um imóvel herdado ou um projeto de regresso: os assuntos mudam de geração para geração. A LusoOffice pretende ser um apoio em Portugal para quem partiu e para os seus filhos e netos, incluindo os que nasceram no estrangeiro.",
    ],
    methodTitle: "Um acompanhamento pensado\npara ser claro.",
    methodIntro:
      "O funcionamento previsto assenta numa missão definida em conjunto e num interlocutor responsável por coordenar as suas etapas em Portugal.",
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
      "A ligação a Portugal passa também pela língua, pela cultura e pelo que se transmite aos filhos. O projeto do jornal da LusoOffice e os contactos previstos com associações e escolas de português dão continuidade a esta intenção.",
    journal: "Conhecer o projeto do jornal",
    outlookTitle: "Associações e projetos de proximidade",
    outlook:
      "A LusoOffice estuda formas de presença local nos países da diáspora. Os locais e as condições continuam por confirmar; nenhum escritório no estrangeiro é anunciado como aberto.",
    partnership:
      "Representa uma associação, uma escola ou uma rede da diáspora? Apresente a sua comunidade e os assuntos que gostaria de abordar. As parcerias continuam por construir.",
    partnerAction: "Preparar uma conversa de parceria",
    contactTitle: "E no seu caso, o que precisa\nde organizar em Portugal?",
    contact:
      "Uma casa, uma diligência ou um projeto: descreva a sua situação e as perguntas que gostaria de abordar numa primeira conversa.",
    contactAction: "Preparar a conversa",
    localNotice:
      "Esta versão permite preparar um resumo no seu dispositivo. Nenhuma mensagem é enviada. Os contactos e as zonas de intervenção serão publicados após confirmação.",
    metaDescription:
      "Conheça a origem familiar da LusoOffice, o seu projeto de acompanhamento em Portugal e os laços que pretende manter com a diáspora e os lusodescendentes.",
  },
  en: {
    title: "Living abroad.\nKeeping a connection to Portugal.",
    mission:
      "LusoOffice is being developed to support Portuguese people and their descendants living abroad with matters they need to organise in Portugal: a home, documents, family, a return or a business project.",
    services: "Explore our services",
    storyLink: "Read our story",
    storyTitle: "A story between\nFrance and Portugal.",
    story: [
      "LusoOffice begins with the story of a founder whose parents emigrated from Portugal to France. This family background is the starting point for the project: ties to Portugal continue to matter, even when you live elsewhere.",
      "A home to look after, documents to gather, an inherited property or plans to return: each generation faces different questions. LusoOffice aims to provide support in Portugal for those who left and for their children and grandchildren, including those born abroad.",
    ],
    methodTitle: "Support designed\nto be clear.",
    methodIntro:
      "The planned approach starts with an agreed scope and a contact person responsible for coordinating the steps in Portugal.",
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
      "The connection to Portugal also lives through language, culture and what we pass on to our children. LusoOffice’s proposed journal and planned conversations with associations and Portuguese schools are part of this intention.",
    journal: "Explore the journal project",
    outlookTitle: "Associations and local presence",
    outlook:
      "LusoOffice is exploring local points of contact in countries with Portuguese communities. Locations and arrangements remain to be confirmed; no overseas office is being presented as open.",
    partnership:
      "Do you represent an association, a school or a diaspora network? Introduce your community and the subjects you would like to discuss. Partnerships are still to be developed.",
    partnerAction: "Prepare a partner conversation",
    contactTitle: "What do you need\nto organise in Portugal?",
    contact:
      "A home, an administrative matter or a project: describe your situation and the questions you would like to discuss in a first conversation.",
    contactAction: "Prepare for my conversation",
    localNotice:
      "This version lets you prepare a summary on your device. No message is sent. Contact details and service areas will be published once confirmed.",
    metaDescription:
      "Discover LusoOffice’s family origins, its planned support in Portugal and the connections it aims to build with Portuguese communities abroad and their descendants.",
  },
  de: {
    title: "Im Ausland leben.\nMit Portugal verbunden bleiben.",
    mission:
      "LusoOffice entsteht, um Portugiesen und ihre Nachkommen im Ausland bei Angelegenheiten zu unterstützen, die sie in Portugal organisieren müssen: Haus, Dokumente, Familie, Rückkehr oder berufliche Vorhaben.",
    services: "Unsere Leistungen entdecken",
    storyLink: "Unsere Geschichte lesen",
    storyTitle: "Eine Geschichte zwischen\nFrankreich und Portugal.",
    story: [
      "Am Anfang von LusoOffice steht die Geschichte einer Gründerin, deren Eltern aus Portugal nach Frankreich ausgewandert sind. Diese Familiengeschichte bildet den Ausgangspunkt des Projekts: Die Verbindung zu Portugal bleibt wichtig, auch wenn man anderswo lebt.",
      "Ein Haus, um das man sich kümmern muss, benötigte Dokumente, eine geerbte Immobilie oder Pläne für die Rückkehr: Jede Generation hat andere Anliegen. LusoOffice möchte vor Ort in Portugal unterstützen – sowohl die Ausgewanderten als auch ihre Kinder und Enkel, einschließlich der im Ausland Geborenen.",
    ],
    methodTitle: "Begleitung, die verständlich\nsein soll.",
    methodIntro:
      "Das geplante Vorgehen beruht auf einem gemeinsam definierten Auftrag und einer Ansprechperson, die die Schritte in Portugal koordiniert.",
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
      "Die Verbindung zu Portugal lebt auch durch die Sprache, die Kultur und das, was wir unseren Kindern weitergeben. Das geplante Journal von LusoOffice und der angestrebte Austausch mit Vereinen und portugiesischen Schulen knüpfen daran an.",
    journal: "Das Journal-Projekt entdecken",
    outlookTitle: "Vereine und lokale Anlaufstellen",
    outlook:
      "LusoOffice prüft lokale Anlaufstellen in Ländern mit portugiesischen Gemeinschaften. Orte und Rahmenbedingungen stehen noch nicht fest; kein Büro im Ausland wird als bereits eröffnet dargestellt.",
    partnership:
      "Vertreten Sie einen Verein, eine Schule oder ein Netzwerk der Diaspora? Stellen Sie Ihre Gemeinschaft und die Themen vor, über die Sie sprechen möchten. Die Partnerschaften befinden sich noch im Aufbau.",
    partnerAction: "Partnergespräch vorbereiten",
    contactTitle: "Was möchten Sie\nin Portugal organisieren?",
    contact:
      "Ein Haus, eine Behördensache oder ein Projekt: Beschreiben Sie Ihre Situation und die Fragen, die Sie in einem ersten Gespräch klären möchten.",
    contactAction: "Mein Gespräch vorbereiten",
    localNotice:
      "In dieser Version können Sie eine Zusammenfassung auf Ihrem Gerät erstellen. Es wird keine Nachricht gesendet. Kontaktdaten und Einsatzgebiete werden nach Bestätigung veröffentlicht.",
    metaDescription:
      "Entdecken Sie die familiären Wurzeln von LusoOffice, die geplante Begleitung in Portugal und die Verbindung zu portugiesischen Gemeinschaften im Ausland.",
  },
};
