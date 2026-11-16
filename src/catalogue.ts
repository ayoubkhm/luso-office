import { translate, languages, languageNames } from "./locales";
import type { Lang } from "./locales";
export type { Lang } from "./locales";
export type Text = Record<Lang, string>;
export const L = (fr: string, pt: string): Text => ({
  fr,
  pt,
  en: translate(fr, pt, "en"),
  de: translate(fr, pt, "de"),
});
export type AreaId = "maison" | "documents" | "famille" | "retour" | "business";
export const areas: {
  id: AreaId;
  name: Text;
  description: Text;
  icon: string;
}[] = [
  {
    id: "maison",
    name: L("Maison et patrimoine", "Casa e património"),
    description: L(
      "Garder un œil sur votre maison, préparer une arrivée ou organiser une intervention.",
      "Acompanhar a sua casa, preparar uma chegada ou organizar uma intervenção.",
    ),
    icon: "house",
  },
  {
    id: "documents",
    name: L("Documents et administration", "Documentos e administração"),
    description: L(
      "Réunir les bonnes pièces et organiser vos démarches, même depuis l’étranger.",
      "Reunir os documentos necessários e organizar os seus assuntos, mesmo no estrangeiro.",
    ),
    icon: "file",
  },
  {
    id: "famille",
    name: L("Famille et successions", "Família e heranças"),
    description: L(
      "Structurer un dossier familial et faire le lien avec les professionnels concernés.",
      "Organizar um processo familiar e fazer a ligação com os profissionais envolvidos.",
    ),
    icon: "family",
  },
  {
    id: "retour",
    name: L("Retour au Portugal", "Regresso a Portugal"),
    description: L(
      "Préparer le retour, les démarches et l’installation dans votre nouveau quotidien.",
      "Preparar o regresso, as formalidades e a instalação no seu novo dia a dia.",
    ),
    icon: "route",
  },
  {
    id: "business",
    name: L("Business Portugal", "Business Portugal"),
    description: L(
      "Organiser votre projet au Portugal avec les intervenants adaptés.",
      "Organizar o seu projeto em Portugal com os intervenientes adequados.",
    ),
    icon: "business",
  },
];
export interface Service {
  id: string;
  area: AreaId;
  name: Text;
  description: Text;
  result: Text;
  limits: Text;
  unit: Text;
  prices: [number | null, number | null];
  from?: boolean;
  hourly?: boolean;
}
export const services: Service[] = [
  {
    id: "visite-rapport",
    area: "maison",
    name: L("Visite du bien avec rapport", "Visita ao imóvel com relatório"),
    description: L(
      "Observer l’état apparent du bien pour vous permettre de faire le point à distance.",
      "Observar o estado aparente do imóvel para poder fazer o ponto à distância.",
    ),
    result: L(
      "Photographies et rapport descriptif sur l’état général visible.",
      "Fotografias e relatório descritivo sobre o estado geral visível.",
    ),
    limits: L(
      "Ce n’est ni une expertise immobilière ni une inspection technique. Durée, accès et zone à préciser.",
      "Não é uma avaliação imobiliária nem uma inspeção técnica. Duração, acesso e zona a definir.",
    ),
    unit: L("Par visite, périmètre à convenir", "Por visita, âmbito a acordar"),
    prices: [69, 49],
  },
  {
    id: "maison-inoccupee",
    area: "maison",
    name: L(
      "Vérification d’une maison inoccupée",
      "Verificação de imóvel desocupado",
    ),
    description: L(
      "Une visite de routine pour repérer les signes visibles d’humidité ou de fuite et vérifier les ouvertures.",
      "Uma visita de rotina para identificar sinais visíveis de humidade ou fugas e verificar portas e janelas.",
    ),
    result: L(
      "Vérification visuelle, aération et bref relevé photographique des anomalies observées.",
      "Verificação visual, arejamento e breve registo fotográfico das anomalias observadas.",
    ),
    limits: L(
      "Sans surveillance de sécurité, nettoyage ou réparation. Durée et fréquence à convenir.",
      "Sem vigilância de segurança, limpeza ou reparações. Duração e frequência a acordar.",
    ),
    unit: L("Par visite", "Por visita"),
    prices: [59, 39],
  },
  {
    id: "reception-technicien",
    area: "maison",
    name: L("Réception d’un technicien", "Receção de técnico"),
    description: L(
      "Permettre l’accès à votre maison à un technicien que vous avez préalablement mandaté.",
      "Facultar acesso à sua casa a um técnico previamente contratado por si.",
    ),
    result: L(
      "Accueil, ouverture du logement et retour sur l’intervention réalisée.",
      "Receção, abertura da casa e informação sobre a intervenção realizada.",
    ),
    limits: L(
      "Prestation du technicien et attente au-delà du temps convenu facturées séparément.",
      "Trabalho do técnico e espera além do período acordado cobrados separadamente.",
    ),
    unit: L(
      "Par intervention, temps à définir",
      "Por intervenção, tempo a definir",
    ),
    prices: [55, 39],
  },
  {
    id: "ouverture-maison",
    area: "maison",
    name: L(
      "Préparation et ouverture de la maison",
      "Preparação e abertura da casa",
    ),
    description: L(
      "Préparer l’utilisation de votre maison avant votre arrivée au Portugal.",
      "Preparar a utilização da sua casa antes da chegada a Portugal.",
    ),
    result: L(
      "Ouverture, aération et vérification des conditions de base de l’eau, de l’électricité et des équipements accessibles.",
      "Abertura, arejamento e verificação das condições básicas de água, eletricidade e equipamentos acessíveis.",
    ),
    limits: L(
      "Nettoyage, courses et interventions techniques sont des prestations supplémentaires.",
      "Limpeza, compras e intervenções técnicas são serviços adicionais.",
    ),
    unit: L(
      "Par préparation, périmètre à convenir",
      "Por preparação, âmbito a acordar",
    ),
    prices: [75, 55],
  },
  {
    id: "fermeture-maison",
    area: "maison",
    name: L(
      "Fermeture et vérification de la maison",
      "Fecho e verificação da casa",
    ),
    description: L(
      "Organiser la fermeture du logement après votre départ.",
      "Organizar o fecho da casa após a sua partida.",
    ),
    result: L(
      "Vérification des portes et fenêtres, arrêt des équipements ou fermeture de l’eau selon vos instructions, puis confirmation.",
      "Verificação de portas e janelas, desligar equipamentos ou fechar a água conforme as suas instruções e envio de confirmação.",
    ),
    limits: L(
      "Sans nettoyage, transport de biens ou sécurité permanente.",
      "Sem limpeza, transporte de bens ou segurança permanente.",
    ),
    unit: L("Par intervention", "Por intervenção"),
    prices: [65, 45],
  },
  {
    id: "petite-maintenance",
    area: "maison",
    name: L(
      "Petite intervention de maintenance",
      "Pequena intervenção de manutenção",
    ),
    description: L(
      "Une tâche simple et identifiée, comme resserrer une charnière ou remplacer une poignée.",
      "Uma tarefa simples e identificada, como apertar uma dobradiça ou substituir um puxador.",
    ),
    result: L(
      "Réalisation de la tâche préalablement acceptée et retour au propriétaire.",
      "Execução da tarefa previamente aceite e informação ao proprietário.",
    ),
    limits: L(
      "Temps inclus à définir. Matériaux et travaux spécialisés sur devis séparé.",
      "Tempo incluído a definir. Materiais e trabalhos especializados com orçamento próprio.",
    ),
    unit: L("Par tâche acceptée", "Por tarefa aceite"),
    prices: [65, 45],
  },
  {
    id: "inventaire-photo",
    area: "maison",
    name: L(
      "Inventaire photographique du bien",
      "Inventário fotográfico do imóvel",
    ),
    description: L(
      "Conserver une vue organisée du mobilier et des équipements présents dans chaque pièce.",
      "Guardar um registo organizado do mobiliário e dos equipamentos de cada divisão.",
    ),
    result: L(
      "Photographies classées par pièce et relevé de l’état apparent des biens.",
      "Fotografias organizadas por divisão e registo do estado aparente dos bens.",
    ),
    limits: L(
      "Sans estimation de valeur ni certification du fonctionnement. Volume du bien à préciser.",
      "Sem avaliação monetária nem certificação do funcionamento. Dimensão do imóvel a definir.",
    ),
    unit: L(
      "Par inventaire, volume à définir",
      "Por inventário, volume a definir",
    ),
    prices: [149, 109],
  },
  {
    id: "suivi-travaux",
    area: "maison",
    name: L(
      "Suivi opérationnel de travaux",
      "Acompanhamento operacional de obra",
    ),
    description: L(
      "Faire le lien avec l’entreprise intervenante et vous tenir informé des éléments recueillis sur place.",
      "Fazer a ligação com o empreiteiro e transmitir as informações recolhidas no local.",
    ),
    result: L(
      "Visites convenues, photographies et informations sur l’avancement.",
      "Visitas acordadas, fotografias e informação sobre o progresso.",
    ),
    limits: L(
      "Ne remplace pas la direction ou la surveillance technique du chantier. Nombre de visites et durée sur devis.",
      "Não substitui a direção ou fiscalização técnica de obra. Número de visitas e duração sob orçamento.",
    ),
    unit: L(
      "Selon mission et visites convenues",
      "Conforme a missão e as visitas acordadas",
    ),
    prices: [150, 110],
    from: true,
  },
  {
    id: "collecte-documents",
    area: "documents",
    name: L(
      "Collecte et remise de documents",
      "Recolha e entrega de documentos",
    ),
    description: L(
      "Récupérer des documents et les remettre à destination selon vos instructions.",
      "Recolher documentos e entregá-los no destino de acordo com as suas instruções.",
    ),
    result: L(
      "Collecte et livraison dans le cadre du trajet autorisé.",
      "Recolha e entrega no âmbito do percurso autorizado.",
    ),
    limits: L(
      "Trajet et nombre d’arrêts à fixer. Courrier et transports spécifiques en supplément.",
      "Percurso e número de paragens a definir. Correio e transportes especiais são adicionais.",
    ),
    unit: L("Par trajet convenu", "Por percurso acordado"),
    prices: [49, 35],
  },
  {
    id: "demande-document",
    area: "documents",
    name: L(
      "Demande et suivi d’un document",
      "Pedido e acompanhamento de documento",
    ),
    description: L(
      "Préparer une demande, la déposer lorsque cela est autorisé et suivre la réponse de l’organisme.",
      "Preparar um pedido, submetê-lo quando autorizado e acompanhar a resposta da entidade.",
    ),
    result: L(
      "Préparation du dossier de demande et suivi de son état auprès de l’entité concernée.",
      "Preparação do pedido e acompanhamento do seu estado junto da entidade.",
    ),
    limits: L(
      "Par document ou procédure définie. Frais officiels et d’émission supplémentaires ; résultat non garanti.",
      "Por documento ou procedimento definido. Taxas oficiais e de emissão adicionais; sem garantia de resultado.",
    ),
    unit: L("Par document ou procédure", "Por documento ou procedimento"),
    prices: [45, 30],
  },
  {
    id: "demarche-sur-place",
    area: "documents",
    name: L(
      "Démarche administrative sur place",
      "Diligência presencial administrativa",
    ),
    description: L(
      "Se rendre auprès d’un organisme pour remettre des pièces ou recueillir des informations autorisées.",
      "Deslocação a uma entidade para entregar documentos ou obter informação autorizada.",
    ),
    result: L(
      "Réalisation de la démarche convenue et retour sur les informations obtenues.",
      "Realização da diligência acordada e informação sobre os elementos obtidos.",
    ),
    limits: L(
      "Temps d’attente à définir. Sans garantie de résolution ni représentation réservée à un professionnel habilité.",
      "Tempo de espera a definir. Sem garantia de resolução nem representação reservada a profissional habilitado.",
    ),
    unit: L("Par démarche convenue", "Por diligência acordada"),
    prices: [75, 50],
  },
  {
    id: "aide-administrative",
    area: "documents",
    name: L("Aide administrative à distance", "Apoio administrativo remoto"),
    description: L(
      "Comprendre un courrier, organiser les tâches et remplir un formulaire avec vos informations.",
      "Compreender uma comunicação, organizar tarefas e preencher um formulário com os seus dados.",
    ),
    result: L(
      "Assistance par téléphone ou visioconférence sur le sujet convenu.",
      "Apoio por telefone ou videochamada sobre o assunto acordado.",
    ),
    limits: L(
      "Facturation au temps passé. Sans conseil juridique ou fiscal spécialisé.",
      "Cobrança por tempo. Sem aconselhamento jurídico ou fiscal especializado.",
    ),
    unit: L("Par heure", "Por hora"),
    prices: [45, 30],
    hourly: true,
  },
  {
    id: "dossier-documentaire",
    area: "documents",
    name: L(
      "Organisation d’un dossier documentaire",
      "Organização de dossier documental",
    ),
    description: L(
      "Regrouper les pièces d’un même sujet pour retrouver plus facilement les informations utiles.",
      "Reunir os documentos de um assunto para encontrar mais facilmente a informação útil.",
    ),
    result: L(
      "Documents classés, index et liste des éléments manquants.",
      "Documentos classificados, índice e lista de elementos em falta.",
    ),
    limits: L(
      "Volume et nombre de sujets à définir. Distinguer le classement de la numérisation pour éviter les doublons.",
      "Volume e número de assuntos a definir. Distinguir organização de digitalização para evitar duplicações.",
    ),
    unit: L("Par dossier défini", "Por dossier definido"),
    prices: [95, 65],
  },
  {
    id: "numerisation",
    area: "documents",
    name: L("Numérisation et archivage", "Digitalização e arquivo"),
    description: L(
      "Transformer les documents papier en fichiers identifiés et organisés.",
      "Converter documentos em papel em ficheiros identificados e organizados.",
    ),
    result: L(
      "Fichiers numériques nommés et classés en dossiers.",
      "Ficheiros digitais identificados e organizados em pastas.",
    ),
    limits: L(
      "Prix selon le volume et l’état des documents. Les copies certifiées ne sont pas incluses.",
      "Preço conforme o volume e o estado dos documentos. Não inclui cópias certificadas.",
    ),
    unit: L("Selon volume de documents", "Conforme o volume de documentos"),
    prices: [50, 35],
    from: true,
  },
  {
    id: "dossier-succession",
    area: "famille",
    name: L(
      "Organisation des documents de succession",
      "Organização de documentação sucessória",
    ),
    description: L(
      "Préparer les informations nécessaires à la prise en charge du dossier par les professionnels.",
      "Preparar a informação necessária para os profissionais responsáveis pelo processo.",
    ),
    result: L(
      "Dossier ordonné et liste des pièces manquantes à réunir.",
      "Dossier organizado e lista dos documentos em falta.",
    ),
    limits: L(
      "Sans conseil juridique, acte d’hérédité, inventaire judiciaire ou partage.",
      "Sem aconselhamento jurídico, habilitação de herdeiros, inventário judicial ou partilha.",
    ),
    unit: L("Par dossier, volume à définir", "Por dossier, volume a definir"),
    prices: [175, 125],
  },
  {
    id: "recensement-patrimoine",
    area: "famille",
    name: L(
      "Recensement documentaire du patrimoine",
      "Levantamento documental de património",
    ),
    description: L(
      "Compiler les informations disponibles sur les biens à partir des pièces et consultations autorisées.",
      "Compilar a informação disponível sobre bens a partir dos documentos e consultas autorizadas.",
    ),
    result: L(
      "Synthèse documentaire des biens identifiés.",
      "Síntese documental dos bens identificados.",
    ),
    limits: L(
      "Ne garantit pas l’identification de tout le patrimoine. Certificats, recherches supplémentaires et frais en sus.",
      "Não garante a identificação de todo o património. Certidões, pesquisas adicionais e taxas à parte.",
    ),
    unit: L("Selon périmètre de recherche", "Conforme o âmbito da pesquisa"),
    prices: [175, 125],
    from: true,
  },
  {
    id: "inventaire-biens",
    area: "famille",
    name: L(
      "Inventaire descriptif des biens mobiliers",
      "Inventário descritivo de bens móveis",
    ),
    description: L(
      "Recenser les meubles et objets présents dans un lieu déterminé.",
      "Listar o mobiliário e os objetos existentes num local determinado.",
    ),
    result: L(
      "Liste descriptive accompagnée de photographies.",
      "Lista descritiva acompanhada de fotografias.",
    ),
    limits: L(
      "Sans inventaire judiciaire, évaluation ni détermination de la propriété des biens.",
      "Sem inventário judicial, avaliação ou determinação da propriedade dos bens.",
    ),
    unit: L(
      "Par inventaire, volume à définir",
      "Por inventário, volume a definir",
    ),
    prices: [195, 145],
  },
  {
    id: "visite-bien-herite",
    area: "famille",
    name: L("Vérification d’un bien hérité", "Verificação de imóvel herdado"),
    description: L(
      "Observer l’état apparent du logement et informer les intéressés autorisés des besoins immédiats.",
      "Observar o estado aparente do imóvel e informar os interessados autorizados das necessidades imediatas.",
    ),
    result: L(
      "Retour de visite et observations utiles au dossier familial.",
      "Informação da visita e observações úteis ao processo familiar.",
    ),
    limits: L(
      "Accès autorisé requis. Sans gestion de conflit ni expertise. Le travail supplémentaire par rapport à une visite classique reste à préciser.",
      "É necessário acesso autorizado. Sem gestão de conflitos nem avaliação técnica. O trabalho adicional face a uma visita geral está por definir.",
    ),
    unit: L(
      "Par visite, coordination à préciser",
      "Por visita, coordenação a definir",
    ),
    prices: [75, 50],
  },
  {
    id: "coordination-professionnels",
    area: "famille",
    name: L(
      "Coordination avec les professionnels",
      "Coordenação com profissionais",
    ),
    description: L(
      "Organiser les échanges avec les avocats, notaires ou autres professionnels choisis.",
      "Organizar os contactos com advogados, notários ou outros profissionais escolhidos.",
    ),
    result: L(
      "Prise de rendez-vous, transmission convenue des pièces et suivi des demandes d’information.",
      "Agendamentos, transmissão acordada de documentos e acompanhamento dos pedidos de informação.",
    ),
    limits: L(
      "LusoOffice assure l’appui administratif. Les honoraires des professionnels sont séparés.",
      "A LusoOffice presta apoio administrativo. Os honorários dos profissionais são separados.",
    ),
    unit: L("Par heure", "Por hora"),
    prices: [60, 40],
    hourly: true,
  },
  {
    id: "orientation-retour",
    area: "retour",
    name: L("Premier entretien pour le retour", "Sessão inicial de orientação"),
    description: L(
      "Faire le point sur votre situation et les besoins liés à votre retour au Portugal.",
      "Fazer o ponto da sua situação e das necessidades ligadas ao regresso a Portugal.",
    ),
    result: L(
      "Identification des besoins et liste des prochaines étapes.",
      "Identificação das necessidades e lista dos próximos passos.",
    ),
    limits: L(
      "Durée à définir. Les questions juridiques et fiscales spécialisées sont orientées vers les professionnels concernés.",
      "Duração a definir. Questões jurídicas e fiscais especializadas são encaminhadas para os profissionais adequados.",
    ),
    unit: L("Par entretien", "Por sessão"),
    prices: [75, 50],
  },
  {
    id: "retour-essential",
    area: "retour",
    name: L("Pack Regresso Essential", "Pack Regresso Essential"),
    description: L(
      "Structurer la préparation du retour avec un plan adapté et un accompagnement à distance.",
      "Estruturar a preparação do regresso com um plano adaptado e acompanhamento à distância.",
    ),
    result: L(
      "Entretien initial, plan de tâches, liste documentaire et suivi à distance envisagés.",
      "Sessão inicial, plano de tarefas, lista documental e acompanhamento remoto previstos.",
    ),
    limits: L(
      "Pack en préparation : réunions, heures et durée à fixer. Aucune démarche sur place incluse dans cette proposition.",
      "Pack em preparação: reuniões, horas e duração por definir. Sem diligências presenciais incluídas nesta proposta.",
    ),
    unit: L("Par pack, contenu à valider", "Por pack, conteúdo a validar"),
    prices: [390, 290],
  },
  {
    id: "retour-plus",
    area: "retour",
    name: L("Pack Regresso Plus", "Pack Regresso Plus"),
    description: L(
      "Ajouter à la préparation du retour la coordination pratique de votre installation.",
      "Acrescentar à preparação do regresso a coordenação prática da instalação.",
    ),
    result: L(
      "Contenu Essential et coordination envisagée des rendez-vous, fournisseurs et tâches d’installation.",
      "Conteúdo Essential e coordenação prevista de agendamentos, fornecedores e tarefas de instalação.",
    ),
    limits: L(
      "Pack en préparation : nombre de démarches, heures et durée à fixer. Déplacements et prestations externes à préciser.",
      "Pack em preparação: número de procedimentos, horas e duração por definir. Deslocações e serviços externos a esclarecer.",
    ),
    unit: L("Par pack, contenu à valider", "Por pack, conteúdo a validar"),
    prices: [750, 590],
  },
  {
    id: "installation-logement",
    area: "retour",
    name: L(
      "Aide à l’installation dans le logement",
      "Apoio à instalação na habitação",
    ),
    description: L(
      "Organiser les accès, les livraisons et les échanges nécessaires à l’utilisation de la maison.",
      "Organizar acessos, entregas e contactos necessários à utilização da casa.",
    ),
    result: L(
      "Coordination des tâches d’installation convenues.",
      "Coordenação das tarefas de instalação acordadas.",
    ),
    limits: L(
      "Achats, montage, nettoyage, contrats et travaux des tiers sont supplémentaires.",
      "Compras, montagem, limpeza, contratos e trabalhos de terceiros são adicionais.",
    ),
    unit: L("Selon mission convenue", "Conforme a missão acordada"),
    prices: [250, 190],
    from: true,
  },
  {
    id: "accompagnement-presentiel",
    area: "retour",
    name: L("Accompagnement sur place", "Acompanhamento presencial"),
    description: L(
      "Être accompagné lors de rendez-vous ou de tâches d’installation convenus à l’avance.",
      "Ter acompanhamento em compromissos ou tarefas de instalação previamente acordados.",
    ),
    result: L(
      "Présence d’un collaborateur pour les tâches définies ensemble.",
      "Presença de um colaborador nas tarefas definidas em conjunto.",
    ),
    limits: L(
      "Minimum de temps et déplacements à définir. Sans actes réservés à des professionnels habilités.",
      "Tempo mínimo e deslocações a definir. Sem atos reservados a profissionais habilitados.",
    ),
    unit: L("Par heure", "Por hora"),
    prices: [45, 32],
    hourly: true,
  },
  {
    id: "business-entretien",
    area: "business",
    name: L(
      "Business Portugal — premier entretien",
      "Business Portugal — reunião inicial",
    ),
    description: L(
      "Identifier votre projet, vos besoins d’installation et les interlocuteurs à mobiliser.",
      "Identificar o projeto, as necessidades de instalação e os interlocutores a envolver.",
    ),
    result: L(
      "Synthèse du besoin et des prochaines étapes après l’entretien.",
      "Síntese das necessidades e dos próximos passos após a reunião.",
    ),
    limits: L(
      "Sans étude de viabilité ni avis juridique, fiscal ou financier.",
      "Sem estudo de viabilidade nem parecer jurídico, fiscal ou financeiro.",
    ),
    unit: L(
      "Par entretien, durée à préciser",
      "Por reunião, duração a definir",
    ),
    prices: [95, 65],
  },
  {
    id: "recherche-fournisseurs",
    area: "business",
    name: L(
      "Recherche et coordination de fournisseurs",
      "Pesquisa e coordenação de fornecedores",
    ),
    description: L(
      "Rechercher des prestataires pour un besoin défini et rassembler leurs propositions.",
      "Pesquisar fornecedores para uma necessidade definida e reunir as suas propostas.",
    ),
    result: L(
      "Propositions organisées pour éclairer votre choix.",
      "Propostas organizadas para apoiar a sua decisão.",
    ),
    limits: L(
      "Nombre de fournisseurs, de contacts et de propositions à fixer. Décision finale au client.",
      "Número de fornecedores, contactos e propostas a definir. A decisão final cabe ao cliente.",
    ),
    unit: L("Par mission définie", "Por missão definida"),
    prices: [150, 100],
  },
  {
    id: "installation-activite",
    area: "business",
    name: L(
      "Aide opérationnelle à l’installation",
      "Apoio operacional à instalação",
    ),
    description: L(
      "Coordonner les tâches pratiques d’installation de votre activité au Portugal.",
      "Coordenar as tarefas práticas de instalação da sua atividade em Portugal.",
    ),
    result: L(
      "Organisation des contacts, rendez-vous, documents et fournisseurs convenus.",
      "Organização dos contactos, agendamentos, documentos e fornecedores acordados.",
    ),
    limits: L(
      "Périmètre et calendrier sur devis. Création de société et autorisations non incluses automatiquement.",
      "Âmbito e prazo sob orçamento. Constituição de empresa e licenciamento não incluídos automaticamente.",
    ),
    unit: L("Selon mission et périmètre", "Conforme a missão e o âmbito"),
    prices: [450, 350],
    from: true,
  },
  {
    id: "suivi-projet",
    area: "business",
    name: L(
      "Accompagnement de projet ou d’investissement",
      "Acompanhamento de projeto ou investimento",
    ),
    description: L(
      "Organiser à distance les échanges et les tâches opérationnelles de votre projet.",
      "Organizar à distância os contactos e as tarefas operacionais do seu projeto.",
    ),
    result: L(
      "Réunions, documentation et informations d’avancement selon une proposition spécifique.",
      "Reuniões, documentação e informação de progresso conforme uma proposta específica.",
    ),
    limits: L(
      "Livrables, délai et prix à convenir. Sans recommandation de produits financiers.",
      "Resultados, prazo e preço a acordar. Sem recomendação de produtos financeiros.",
    ),
    unit: L("Sur devis", "Sob orçamento"),
    prices: [null, null],
  },
];
export const plans = [
  {
    id: "Member",
    monthly: 29.9,
    annual: 299,
    people: L("Pour un titulaire", "Para um titular"),
    description: L(
      "Pour organiser vos propres sujets au Portugal.",
      "Para organizar os seus assuntos em Portugal.",
    ),
  },
  {
    id: "Family",
    monthly: 49.9,
    annual: 499,
    people: L("Jusqu’à quatre utilisateurs", "Até quatro utilizadores"),
    description: L(
      "Pour rassembler les besoins de la famille.",
      "Para reunir as necessidades da família.",
    ),
  },
  {
    id: "Premium",
    monthly: 99.9,
    annual: 999,
    people: L(
      "Pour un titulaire · plan à l’étude",
      "Para um titular · plano em estudo",
    ),
    description: L(
      "Un accompagnement renforcé dont les limites restent à définir.",
      "Um acompanhamento reforçado cujos limites estão por definir.",
    ),
  },
];
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function filterServices(area: string, query: string, _lang: Lang) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return services.filter(
    (s) =>
      (area === "all" || s.area === area) &&
      terms.every((term) =>
        normalize(
          ["fr", "pt", "en", "de"]
            .flatMap((language) => {
              const lang = language as Lang;
              return [
                s.name[lang],
                s.description[lang],
                s.result[lang],
                areas.find((a) => a.id === s.area)?.name[lang],
              ];
            })
            .join(" "),
        ).includes(term),
      ),
  );
}
export function price(service: Service, member: boolean, lang: Lang) {
  const amount = service.prices[member ? 1 : 0];
  if (amount === null) return translate("Sur devis", "Sob orçamento", lang);
  return (
    (service.from ? translate("Dès ", "Desde ", lang) : "") +
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount) +
    (service.hourly ? " / h" : "")
  );
}
