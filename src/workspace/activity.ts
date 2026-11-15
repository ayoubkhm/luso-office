import type { Action, Role, State } from "./model";

type Text = [string, string];
export const activityCategories = {
  requests: ["Dossiers", "Pedidos"],
  documents: ["Documents", "Documentos"],
  tasks: ["Tâches", "Tarefas"],
  messages: ["Échanges", "Conversas"],
  properties: ["Biens", "Imóveis"],
  billing: ["Adhésion et paiements", "Adesão e pagamentos"],
  settlements: ["Bilans", "Balanços"],
  profile: ["Compte et Family", "Conta e Family"],
  newsletter: ["Journal éditorial", "Jornal editorial"],
  admin: ["Accès partenaire", "Acesso do parceiro"],
} satisfies Record<string, Text>;
export type ActivityCategory = keyof typeof activityCategories;
export interface ActivityEvent {
  id: number;
  role: Role;
  category: ActivityCategory;
  title: Text;
  caseId?: string;
}

// Deliberately omit action payloads: no message, note, address or email is copied
// into the activity feed. This is a session sequence, not a dated audit record.
const definitions: Record<Action["type"], [ActivityCategory, string, string]> =
  {
    request: ["requests", "Demande créée", "Pedido criado"],
    stage: [
      "requests",
      "Étape du dossier mise à jour",
      "Etapa do pedido atualizada",
    ],
    quote: ["requests", "Proposition préparée", "Proposta preparada"],
    "accept-quote": ["requests", "Proposition acceptée", "Proposta aceite"],
    "revise-quote": [
      "requests",
      "Ajustement de la proposition demandé",
      "Ajuste da proposta pedido",
    ],
    assign: [
      "requests",
      "Mission attribuée au partenaire",
      "Missão atribuída ao parceiro",
    ],
    "cancel-request": [
      "requests",
      "Annulation demandée",
      "Cancelamento pedido",
    ],
    "cancel-withdraw": [
      "requests",
      "Demande d’annulation retirée",
      "Pedido de cancelamento retirado",
    ],
    "cancel-decision": [
      "requests",
      "Annulation confirmée",
      "Cancelamento confirmado",
    ],
    correction: [
      "requests",
      "Correction de la mission demandée",
      "Correção da missão pedida",
    ],
    reopen: ["requests", "Dossier rouvert", "Pedido reaberto"],
    restart: [
      "requests",
      "Nouveau dossier créé depuis le besoin précédent",
      "Novo pedido criado a partir da necessidade anterior",
    ],
    note: ["requests", "Note interne ajoutée", "Nota interna adicionada"],
    document: [
      "documents",
      "Pièce d’exemple ajoutée",
      "Documento de exemplo adicionado",
    ],
    "document-review": ["documents", "Pièce validée", "Documento validado"],
    "document-replace": [
      "documents",
      "Nouvelle version de la pièce déposée",
      "Nova versão do documento apresentada",
    ],
    share: [
      "documents",
      "Pièce partagée avec le partenaire",
      "Documento partilhado com o parceiro",
    ],
    custody: [
      "documents",
      "Garde de l’original mise à jour",
      "Custódia do original atualizada",
    ],
    requirement: [
      "documents",
      "Pièce demandée à l’adhérent",
      "Documento pedido ao aderente",
    ],
    "task-create": ["tasks", "Tâche créée", "Tarefa criada"],
    "task-update": ["tasks", "Tâche mise à jour", "Tarefa atualizada"],
    "task-assign": [
      "tasks",
      "Attribution de la tâche mise à jour",
      "Atribuição da tarefa atualizada",
    ],
    message: [
      "messages",
      "Message ajouté à la conversation",
      "Mensagem adicionada à conversa",
    ],
    "message-read": [
      "messages",
      "Conversation marquée comme lue",
      "Conversa marcada como lida",
    ],
    "message-draft": ["messages", "Brouillon conservé", "Rascunho guardado"],
    property: ["properties", "Bien ajouté", "Imóvel adicionado"],
    "property-edit": [
      "properties",
      "Informations du bien mises à jour",
      "Informações do imóvel atualizadas",
    ],
    pay: ["requests", "Provision mise à jour", "Provisão atualizada"],
    subscription: [
      "billing",
      "Changement d’adhésion préparé",
      "Alteração da adesão preparada",
    ],
    "subscription-payment": [
      "billing",
      "Paiement de l’adhésion mis à jour",
      "Pagamento da adesão atualizado",
    ],
    cancel: [
      "billing",
      "Renouvellement arrêté à l’échéance",
      "Renovação desativada no fim do período",
    ],
    profile: [
      "profile",
      "Préférences du compte enregistrées",
      "Preferências da conta guardadas",
    ],
    invite: [
      "profile",
      "Invitation Family préparée",
      "Convite Family preparado",
    ],
    "invite-state": [
      "profile",
      "Invitation Family mise à jour",
      "Convite Family atualizado",
    ],
    "invite-renew": [
      "profile",
      "Invitation Family renouvelée",
      "Convite Family renovado",
    ],
    "family-case": [
      "profile",
      "Dossier partagé avec le bénéficiaire",
      "Pedido partilhado com o beneficiário",
    ],
    "family-document": [
      "profile",
      "Pièce partagée avec le bénéficiaire",
      "Documento partilhado com o beneficiário",
    ],
    "partner-access": [
      "admin",
      "Accès partenaire réactivé",
      "Acesso do parceiro reativado",
    ],
    edition: ["newsletter", "Édition enregistrée", "Edição guardada"],
    publish: [
      "newsletter",
      "Publication de l’édition simulée",
      "Publicação da edição simulada",
    ],
    queue: ["newsletter", "Distribution préparée", "Distribuição preparada"],
    dispatch: ["newsletter", "Distribution simulée", "Distribuição simulada"],
    "cancel-campaign": [
      "newsletter",
      "Distribution annulée",
      "Distribuição cancelada",
    ],
    "next-edition": [
      "newsletter",
      "Nouvelle édition ouverte",
      "Nova edição aberta",
    ],
    "settlement-propose": ["settlements", "Bilan proposé", "Balanço proposto"],
    "settlement-respond": ["settlements", "Bilan approuvé", "Balanço aprovado"],
    "settlement-payment": [
      "settlements",
      "Règlement du bilan mis à jour",
      "Acerto do balanço atualizado",
    ],
  };

export function createActivity(
  before: State,
  after: State,
  role: Role,
  action: Action,
): ActivityEvent {
  const [category, fr, pt] = definitions[action.type];
  let title: Text = [fr, pt];
  const id = "id" in action ? action.id : undefined;
  let caseId =
    before.cases.find((c) => c.id === id)?.id ??
    before.documents.find((d) => d.id === id)?.caseId ??
    before.tasks.find((t) => t.id === id)?.caseId;
  if (action.type === "request" || action.type === "restart")
    caseId = after.cases.at(-1)?.id;
  if (action.type === "family-case") caseId = action.caseId;
  if (action.type === "family-document")
    caseId = before.documents.find((d) => d.id === action.documentId)?.caseId;
  switch (action.type) {
    case "stage":
      title = {
        submitted: ["Demande reçue", "Pedido recebido"],
        review: ["Cadrage commencé", "Análise iniciada"],
        quote: ["Proposition prête à relire", "Proposta pronta para revisão"],
        approved: ["Proposition acceptée", "Proposta aceite"],
        inprogress: ["Mission démarrée", "Missão iniciada"],
        delivered: [
          "Mission remise pour vérification",
          "Missão entregue para verificação",
        ],
        completed: [
          "Clôture du dossier validée",
          "Conclusão do pedido validada",
        ],
        cancelled: ["Dossier annulé", "Pedido cancelado"],
      }[action.stage] as Text;
      break;
    case "quote":
      title = [
        `Proposition v${after.cases.find((c) => c.id === id)?.proposals.at(-1)?.version} préparée`,
        `Proposta v${after.cases.find((c) => c.id === id)?.proposals.at(-1)?.version} preparada`,
      ];
      break;
    case "accept-quote":
      title = [
        `Proposition v${action.version} acceptée`,
        `Proposta v${action.version} aceite`,
      ];
      break;
    case "assign":
      if (!action.assigned)
        title = [
          "Accès au dossier retiré au partenaire",
          "Acesso ao pedido retirado ao parceiro",
        ];
      break;
    case "cancel-decision":
      if (!action.confirm)
        title = [
          "Annulation refusée par l’équipe",
          "Cancelamento recusado pela equipa",
        ];
      break;
    case "document-review":
      if (action.review === "rejected")
        title = [
          "Correction de la pièce demandée",
          "Correção do documento pedida",
        ];
      break;
    case "share":
      if (!action.shared)
        title = [
          "Partage de la pièce retiré au partenaire",
          "Partilha do documento retirada ao parceiro",
        ];
      break;
    case "custody":
      title =
        action.custody === "returned"
          ? [
              "Restitution de l’original enregistrée",
              "Devolução do original registada",
            ]
          : [
              "Réception de l’original enregistrée",
              "Receção do original registada",
            ];
      break;
    case "task-update":
      title = {
        todo: ["Tâche à faire", "Tarefa por fazer"],
        doing: ["Tâche commencée", "Tarefa iniciada"],
        blocked: ["Tâche bloquée", "Tarefa bloqueada"],
        done: ["Tâche terminée", "Tarefa concluída"],
      }[action.status] as Text;
      break;
    case "pay":
    case "subscription-payment":
    case "settlement-payment": {
      const subject =
        action.type === "pay"
          ? ["Provision", "Provisão"]
          : action.type === "subscription-payment"
            ? ["Paiement de l’adhésion", "Pagamento da adesão"]
            : ["Règlement du bilan", "Acerto do balanço"];
      const result = {
        unpaid: ["à régler", "por pagar"],
        pending: ["en vérification", "em verificação"],
        failed: ["refusé (simulation)", "recusado (simulação)"],
        paid: ["confirmé (simulation)", "confirmado (simulação)"],
      }[action.result];
      title = [`${subject[0]} : ${result[0]}`, `${subject[1]}: ${result[1]}`];
      break;
    }
    case "cancel":
      if (!action.cancel)
        title = ["Renouvellement réactivé", "Renovação reativada"];
      break;
    case "invite-state":
      title = {
        active: [
          "Invitation Family acceptée (simulation)",
          "Convite Family aceite (simulação)",
        ],
        expired: ["Invitation Family expirée", "Convite Family expirado"],
        revoked: ["Accès Family retiré", "Acesso Family retirado"],
      }[action.status] as Text;
      break;
    case "family-case":
      if (!action.granted)
        title = [
          "Partage du dossier retiré au bénéficiaire",
          "Partilha do pedido retirada ao beneficiário",
        ];
      break;
    case "family-document":
      if (!action.granted)
        title = [
          "Partage de la pièce retiré au bénéficiaire",
          "Partilha do documento retirada ao beneficiário",
        ];
      break;
    case "partner-access":
      if (!action.enabled)
        title = ["Accès partenaire suspendu", "Acesso do parceiro suspenso"];
      break;
    case "edition":
      if (action.edition.status === "review")
        title = [
          "Édition soumise à relecture",
          "Edição submetida para revisão",
        ];
      break;
    case "settlement-respond":
      if (!action.approve)
        title = ["Correction du bilan demandée", "Correção do balanço pedida"];
      break;
  }
  return {
    id: before.audit.length + 1,
    role,
    category,
    title,
    ...(caseId ? { caseId } : {}),
  };
}

export function matchingActivity(
  state: State,
  role: Role,
  filters: {
    query?: string;
    category?: string;
    actor?: string;
    caseId?: string;
  },
  lang: "fr" | "pt",
) {
  // The operational journal includes internal events and is team-only.
  if (role !== "team") return [];
  const norm = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  return state.audit
    .filter(
      (event) =>
        (!filters.category ||
          filters.category === "all" ||
          event.category === filters.category) &&
        (!filters.actor ||
          filters.actor === "all" ||
          event.role === filters.actor) &&
        (!filters.caseId ||
          filters.caseId === "all" ||
          event.caseId === filters.caseId) &&
        norm(
          `${event.title[lang === "fr" ? 0 : 1]} ${event.caseId ?? ""}`,
        ).includes(norm(filters.query ?? "")),
    )
    .slice()
    .reverse();
}
