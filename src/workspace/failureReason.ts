import { validDay } from "./calendar";
import {
  canWork,
  missingRequirements,
  openTasks,
  visibleCases,
  type State,
  type Role,
  type Action,
} from "./model";
type Reason = [string, string];
export function failureReason(s: State, role: Role, a: Action): Reason {
  if (a.type === "demo-date")
    return !validDay(a.day) || a.day < s.demoToday
      ? [
          "Choisissez une date valide, égale ou postérieure à la date simulée.",
          "Escolha uma data válida, igual ou posterior à data simulada.",
        ]
      : [
          "Terminez les tentatives de paiement en attente avant d’avancer la date.",
          "Conclua as tentativas de pagamento pendentes antes de avançar a data.",
        ];
  if (a.type === "client-create")
    return [
      "Renseignez un nom fictif de 80 caractères maximum et un pays.",
      "Preencha um nome fictício com até 80 caracteres e um país.",
    ];
  if (a.type === "client-select")
    return [
      "Choisissez un client disponible dans le sélecteur de démonstration.",
      "Escolha um cliente disponível no seletor de demonstração.",
    ];
  if (
    a.type === "staff-assign" ||
    a.type === "actor-select" ||
    a.type === "person-access"
  )
    return [
      "Choisissez des intervenants actifs autorisés à traiter ce dossier.",
      "Escolha intervenientes ativos autorizados a tratar este pedido.",
    ];
  if (a.type === "pay")
    return [
      "Acceptez la dernière proposition avant de préparer la provision ; une tentative doit être en attente avant de confirmer son résultat.",
      "Aceite a última proposta antes de preparar a provisão; uma tentativa deve estar pendente antes de confirmar o resultado.",
    ];
  const id = "id" in a ? a.id : "";
  const c = s.cases.find(
    (c) =>
      c.id === id ||
      c.id === s.tasks.find((t) => t.id === id)?.caseId ||
      c.id === s.documents.find((d) => d.id === id)?.caseId,
  );
  if (c && !visibleCases(s, role).some((x) => x.id === c.id))
    return [
      "Ce dossier n’est plus accessible dans cette vue. Revenez à la liste des demandes.",
      "Este pedido já não está acessível nesta vista. Volte à lista de pedidos.",
    ];
  if (
    c &&
    !canWork(c) &&
    [
      "stage",
      "quote",
      "task-create",
      "task-update",
      "document",
      "document-replace",
      "delivery-accept",
    ].includes(a.type)
  )
    return [
      "Le dossier est suspendu ou clos. Consultez Décisions et suites avant de reprendre le travail.",
      "O pedido está suspenso ou encerrado. Consulte Decisões antes de retomar o trabalho.",
    ];
  if (a.type === "stage" && c) {
    if (missingRequirements(s, c.id).length)
      return [
        "Des pièces obligatoires attendent une validation. Ouvrez les documents du dossier.",
        "Há documentos obrigatórios por validar. Abra os documentos do pedido.",
      ];
    if (
      ["delivered", "completed"].includes(a.stage) &&
      openTasks(s, c.id).length
    )
      return [
        "Terminez les tâches ouvertes avant la remise ou la clôture.",
        "Conclua as tarefas abertas antes da entrega ou conclusão.",
      ];
    if (a.stage === "delivered")
      return [
        "Renseignez le compte rendu (3 000 caractères maximum) et choisissez uniquement des pièces validées de ce dossier.",
        "Preencha o relatório (máximo de 3 000 caracteres) e selecione apenas documentos validados deste pedido.",
      ];
    if (a.stage === "completed")
      return [
        "Le client doit valider la dernière version du livrable avant la clôture.",
        "O cliente deve validar a última versão da entrega antes da conclusão.",
      ];
    if (a.stage === "inprogress" && c.payment !== "paid")
      return [
        "La provision doit être confirmée avant le démarrage de la mission.",
        "A provisão deve ser confirmada antes do início da missão.",
      ];
  }
  if ("body" in a && !a.body.trim())
    return [
      "Saisissez un texte avant de l’enregistrer.",
      "Escreva um texto antes de guardar.",
    ];
  if ("reason" in a && !a.reason.trim())
    return [
      "Expliquez le motif de votre décision.",
      "Explique o motivo da sua decisão.",
    ];
  if ("version" in a)
    return [
      "Cette version ne peut plus être validée dans cette vue. Relisez la dernière version et son état.",
      "Esta versão já não pode ser validada nesta vista. Reveja a última versão e o seu estado.",
    ];
  if (a.type.startsWith("subscription") || a.type === "cancel")
    return [
      "Vérifiez la formule choisie et terminez la tentative de paiement en attente avant une nouvelle opération.",
      "Verifique o plano escolhido e conclua a tentativa de pagamento pendente antes de uma nova operação.",
    ];
  if (a.type.startsWith("invite") || a.type.startsWith("family"))
    return [
      "Vérifiez l’adhésion Family, les places disponibles et l’état actuel de cette invitation.",
      "Verifique a adesão Family, as vagas disponíveis e o estado atual deste convite.",
    ];
  if (a.type.startsWith("task"))
    return [
      "Vérifiez le responsable, la date au format valide et le motif obligatoire d’une tâche bloquée.",
      "Verifique o responsável, a data válida e o motivo obrigatório de uma tarefa bloqueada.",
    ];
  if (
    a.type.startsWith("document") ||
    a.type === "requirement" ||
    a.type === "share" ||
    a.type === "custody"
  )
    return [
      "Vérifiez l’intitulé, le besoin associé et l’état de la pièce. Un refus exige un motif ; une pièce déjà liée à un besoin doit être remplacée.",
      "Verifique o título, o requisito e o estado do documento. Uma recusa exige um motivo; um documento já associado deve ser substituído.",
    ];
  if (a.type === "quote" || a.type === "settlement-propose")
    return [
      "Renseignez le périmètre ou l’explication, puis des montants positifs ou nuls avec deux décimales maximum.",
      "Preencha o âmbito ou a explicação e valores não negativos com um máximo de duas casas decimais.",
    ];
  if (
    [
      "edition",
      "publish",
      "edition-review",
      "queue",
      "dispatch",
      "next-edition",
    ].includes(a.type)
  )
    return [
      "Enregistrez une édition complète, validez sa relecture et vérifiez l’état de la campagne avant de continuer.",
      "Guarde uma edição completa, valide a revisão e verifique o estado da campanha antes de continuar.",
    ];
  if (a.type === "request")
    return [
      "Choisissez un service du catalogue et décrivez le besoin (2 000 caractères maximum).",
      "Escolha um serviço do catálogo e descreva o pedido (máximo de 2 000 caracteres).",
    ];
  return [
    "Cette opération n’est pas autorisée à cette étape. Revenez au dossier et consultez sa prochaine action.",
    "Esta operação não é permitida nesta etapa. Volte ao pedido e consulte a próxima ação.",
  ];
}
