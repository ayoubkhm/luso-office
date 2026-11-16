import {
  initialState,
  transition,
  type State,
  type Action,
  type Role,
} from "./model";
import type { View } from "./ui";
type Copy = [string, string];
export type ScenarioId =
  | "proposal"
  | "documents"
  | "mission"
  | "family"
  | "journal"
  | "settlement";
export interface DemoStep {
  title: Copy;
  instruction: Copy;
  role: Role;
  view: View;
  caseId?: string;
  done: (s: State) => boolean;
}
export interface DemoScenario {
  id: ScenarioId;
  title: Copy;
  description: Copy;
  steps: DemoStep[];
}
const case2 = (s: State) => s.cases.find((c) => c.id === "DEMO-002")!;
const document2 = (s: State) =>
  s.documents.find((d) => d.requirement === "need-1");
export const demoScenarios: DemoScenario[] = [
  {
    id: "settlement",
    title: ["Le bilan d’une mission", "O balanço de uma missão"],
    description: [
      "Comparer la provision au bilan final et suivre un remboursement entièrement simulé.",
      "Comparar a provisão com o balanço final e acompanhar um reembolso totalmente simulado.",
    ],
    steps: [
      {
        title: ["Proposer le bilan final", "Propor o balanço final"],
        instruction: [
          "DEMO-001 est clos avec une provision fictive de 39 €. Pour ce test, proposez 25 € de coordination, 0 € de frais et 0 € de tiers, avec une explication fictive.",
          "DEMO-001 está concluído com provisão fictícia de 39 €. Para este teste, proponha 25 € de coordenação, 0 € de taxas e 0 € de terceiros, com explicação fictícia.",
        ],
        role: "team",
        view: "settlements",
        caseId: "DEMO-001",
        done: (s) =>
          Boolean(
            s.cases[0].settlements.at(-1)?.status === "proposed" &&
              s.cases[0].settlements.at(-1)!.coordination +
                s.cases[0].settlements.at(-1)!.official +
                s.cases[0].settlements.at(-1)!.thirdParty <
                39,
          ),
      },
      {
        title: ["Examiner puis approuver", "Analisar e aprovar"],
        instruction: [
          "Relisez le bilan et la différence avec la provision. Cochez la relecture puis simulez l’accord sur cette version.",
          "Reveja o balanço e a diferença face à provisão. Assinale a revisão e simule a aprovação desta versão.",
        ],
        role: "member",
        view: "settlements",
        caseId: "DEMO-001",
        done: (s) =>
          ["approved", "pending", "failed", "settled"].includes(
            s.cases[0].settlements.at(-1)?.status || "",
          ),
      },
      {
        title: ["Simuler le remboursement", "Simular reembolso"],
        instruction: [
          "Préparez le remboursement démo puis simulez la confirmation du prestataire. Vous pouvez tester un échec puis réessayer. Aucun virement réel.",
          "Prepare o reembolso demo e simule a confirmação do prestador. Pode testar uma falha e repetir. Sem transferência real.",
        ],
        role: "team",
        view: "settlements",
        caseId: "DEMO-001",
        done: (s) => s.cases[0].settlements.at(-1)?.status === "settled",
      },
    ],
  },
  {
    id: "proposal",
    title: ["Une proposition à ajuster", "Uma proposta a ajustar"],
    description: [
      "Du changement de périmètre à l’accord sur la bonne version, puis au paiement simulé.",
      "Da alteração do âmbito à aprovação da versão certa e ao pagamento simulado.",
    ],
    steps: [
      {
        title: ["Demander un ajustement", "Pedir um ajuste"],
        instruction: [
          "Dans la proposition de DEMO-002, demandez un ajustement et indiquez un motif fictif.",
          "Na proposta de DEMO-002, peça um ajuste com um motivo fictício.",
        ],
        role: "member",
        view: "requests",
        caseId: "DEMO-002",
        done: (s) => Boolean(case2(s).proposals[0]?.revisionReason),
      },
      {
        title: ["Préparer la version suivante", "Preparar a versão seguinte"],
        instruction: [
          "Modifiez le périmètre ou les montants de la proposition, puis soumettez la version 2 à l’adhérent.",
          "Altere o âmbito ou os valores e submeta a versão 2 ao aderente.",
        ],
        role: "team",
        view: "requests",
        caseId: "DEMO-002",
        done: (s) => case2(s).proposals.length >= 2,
      },
      {
        title: ["Relire et accepter", "Rever e aprovar"],
        instruction: [
          "Comparez les versions, ouvrez la confirmation, cochez la relecture et simulez l’accord sur la dernière version.",
          "Compare as versões, abra a confirmação, assinale a revisão e simule a aprovação da última versão.",
        ],
        role: "member",
        view: "requests",
        caseId: "DEMO-002",
        done: (s) =>
          case2(s).proposals.some(
            (p) => p.version >= 2 && p.status === "accepted",
          ),
      },
      {
        title: ["Simuler la provision", "Simular a provisão"],
        instruction: [
          "Simulez le paiement puis sa confirmation. Vous pouvez aussi tester un refus avant de réessayer.",
          "Simule o pagamento e a confirmação. Pode também testar uma recusa antes de repetir.",
        ],
        role: "member",
        view: "requests",
        caseId: "DEMO-002",
        done: (s) => case2(s).payment === "paid",
      },
    ],
  },
  {
    id: "documents",
    title: ["Une pièce à corriger", "Um documento a corrigir"],
    description: [
      "Dépôt fictif, contrôle de l’équipe, nouvelle version et vérification finale.",
      "Entrega fictícia, controlo da equipa, nova versão e verificação final.",
    ],
    steps: [
      {
        title: ["Fournir la pièce attendue", "Entregar o documento pedido"],
        instruction: [
          "Dans DEMO-002, utilisez « Fournir un document démo ». Aucun fichier réel n’est nécessaire.",
          "Em DEMO-002, utilize « Entregar documento demo ». Não é necessário um ficheiro real.",
        ],
        role: "member",
        view: "requests",
        caseId: "DEMO-002",
        done: (s) => Boolean(document2(s)),
      },
      {
        title: ["Demander une correction", "Pedir correção"],
        instruction: [
          "Dans Documents, choisissez « Correction nécessaire » pour la pièce déposée et expliquez le défaut fictif.",
          "Em Documentos, escolha « Correção necessária » para o documento entregue e explique o problema fictício.",
        ],
        role: "team",
        view: "documents",
        caseId: "DEMO-002",
        done: (s) =>
          document2(s)?.review === "rejected" ||
          Boolean(document2(s)?.revisions.some((r) => r.review === "rejected")),
      },
      {
        title: ["Déposer la version corrigée", "Entregar a versão corrigida"],
        instruction: [
          "Donnez un intitulé à la nouvelle version. L’ancienne et le motif de correction restent dans l’historique.",
          "Dê um título à nova versão. A anterior e o motivo da correção permanecem no histórico.",
        ],
        role: "member",
        view: "documents",
        caseId: "DEMO-002",
        done: (s) => (document2(s)?.version || 0) >= 2,
      },
      {
        title: ["Vérifier la nouvelle version", "Verificar a nova versão"],
        instruction: [
          "Marquez la version 2 comme conforme au besoin et enregistrez la vérification.",
          "Marque a versão 2 como adequada ao pedido e guarde a verificação.",
        ],
        role: "team",
        view: "documents",
        caseId: "DEMO-002",
        done: (s) =>
          (document2(s)?.version || 0) >= 2 &&
          document2(s)?.review === "accepted",
      },
    ],
  },
  {
    id: "mission",
    title: ["Une mission avec un partenaire", "Uma missão com parceiro"],
    description: [
      "Partager une pièce utile, terminer le travail et contrôler la remise du dossier.",
      "Partilhar um documento útil, concluir o trabalho e verificar a entrega do pedido.",
    ],
    steps: [
      {
        title: ["Partager la liste de visite", "Partilhar a lista da visita"],
        instruction: [
          "Dans DEMO-001, autorisez le partage partenaire de la liste de visite. L’autorisation originale reste privée.",
          "Em DEMO-001, autorize a partilha da lista da visita com o parceiro. A autorização original fica privada.",
        ],
        role: "team",
        view: "documents",
        caseId: "DEMO-001",
        done: (s) => Boolean(s.documents.find((d) => d.id === "doc-1")?.shared),
      },
      {
        title: ["Terminer le compte rendu", "Concluir o relatório"],
        instruction: [
          "Ouvrez la tâche de visite, choisissez « Terminée » et enregistrez. Vous pouvez tester un blocage avant de la terminer.",
          "Abra a tarefa da visita, escolha « Concluída » e guarde. Pode testar um bloqueio antes de a concluir.",
        ],
        role: "partner",
        view: "tasks",
        caseId: "DEMO-001",
        done: (s) => s.tasks.find((t) => t.id === "task-1")?.status === "done",
      },
      {
        title: ["Remettre la mission", "Entregar a missão"],
        instruction: [
          "Dans la demande DEMO-001, remettez la mission pour vérification.",
          "No pedido DEMO-001, entregue a missão para verificação.",
        ],
        role: "partner",
        view: "requests",
        caseId: "DEMO-001",
        done: (s) => s.cases[0].history.includes("delivered"),
      },
      {
        title: ["Valider le livrable", "Validar a entrega"],
        instruction: [
          "Relisez le compte rendu, cochez la relecture et validez cette version.",
          "Leia o relatório, assinale a revisão e valide esta versão.",
        ],
        role: "member",
        view: "requests",
        caseId: "DEMO-001",
        done: (s) => s.cases[0].deliveries?.at(-1)?.status === "accepted",
      },
      {
        title: ["Contrôler et clôturer", "Verificar e concluir"],
        instruction: [
          "Validez la clôture du dossier. L’accueil de l’équipe rappellera ensuite l’original encore à restituer.",
          "Valide a conclusão do pedido. O início da equipa lembrará depois o original ainda por devolver.",
        ],
        role: "team",
        view: "requests",
        caseId: "DEMO-001",
        done: (s) => s.cases[0].stage === "completed",
      },
    ],
  },
  {
    id: "family",
    title: ["Un bénéficiaire Family", "Um beneficiário Family"],
    description: [
      "Accepter une invitation, limiter les partages et vérifier l’effet du retrait d’accès.",
      "Aceitar um convite, limitar as partilhas e verificar a retirada de acesso.",
    ],
    steps: [
      {
        title: ["Accepter l’invitation démo", "Aceitar o convite demo"],
        instruction: [
          "Family est déjà actif dans cet exemple. Dans Mon compte, simulez l’acceptation de l’invitation préparée.",
          "Family já está ativo neste exemplo. Na minha conta, simule a aceitação do convite preparado.",
        ],
        role: "member",
        view: "profile",
        done: (s) => Boolean(s.invitations[0]?.history.includes("accepted")),
      },
      {
        title: [
          "Choisir le dossier et la pièce",
          "Escolher pedido e documento",
        ],
        instruction: [
          "Partagez DEMO-001 et sa liste de visite, puis ouvrez l’aperçu bénéficiaire. Les autres informations restent masquées.",
          "Partilhe DEMO-001 e a lista da visita e abra a pré-visualização. As restantes informações ficam ocultas.",
        ],
        role: "member",
        view: "profile",
        done: (s) => Boolean(s.invitations[0]?.documents.includes("doc-1")),
      },
      {
        title: ["Retirer l’accès", "Retirar o acesso"],
        instruction: [
          "Retirez l’accès et confirmez. Rouvrez l’aperçu : aucun dossier ne doit être accessible.",
          "Retire o acesso e confirme. Reabra a pré-visualização: nenhum pedido deve estar acessível.",
        ],
        role: "member",
        view: "profile",
        done: (s) => s.invitations[0]?.status === "revoked",
      },
    ],
  },
  {
    id: "journal",
    title: ["Une édition du journal", "Uma edição do jornal"],
    description: [
      "Relire, publier et tester la désinscription avant une distribution entièrement simulée.",
      "Rever, publicar e testar a anulação da subscrição antes de uma distribuição totalmente simulada.",
    ],
    steps: [
      {
        title: ["Soumettre à relecture", "Submeter a revisão"],
        instruction: [
          "Un brouillon fictif est prêt. Dans Le journal, soumettez-le à relecture sans remplacer les textes par des informations réelles.",
          "Um rascunho fictício está pronto. No jornal, submeta-o a revisão sem substituir os textos por informações reais.",
        ],
        role: "team",
        view: "newsletter",
        done: (s) => s.edition.status !== "draft",
      },
      {
        title: ["Publier dans la démo", "Publicar na demo"],
        instruction: [
          "Ouvrez l’aperçu de la version enregistrée, confirmez sa relecture avec la case prévue, puis simulez sa publication.",
          "Abra a pré-visualização da versão guardada, confirme a revisão na caixa prevista e simule a publicação.",
        ],
        role: "team",
        view: "newsletter",
        done: (s) => s.edition.status === "published",
      },
      {
        title: ["Préparer la distribution", "Preparar distribuição"],
        instruction: [
          "Préparez la file de distribution. Le compte démo est encore abonné à ce stade.",
          "Prepare a fila de distribuição. A conta demo ainda está subscrita nesta fase.",
        ],
        role: "team",
        view: "newsletter",
        done: (s) => s.campaign.status !== "idle",
      },
      {
        title: [
          "Se désinscrire avant l’envoi",
          "Anular a subscrição antes do envio",
        ],
        instruction: [
          "Dans Le journal, retirez la préférence de réception avant de revenir à l’équipe.",
          "No jornal, retire a preferência de receção antes de voltar à equipa.",
        ],
        role: "member",
        view: "newsletter",
        done: (s) => !s.profile.consent,
      },
      {
        title: ["Simuler la distribution", "Simular distribuição"],
        instruction: [
          "Lancez la distribution simulée : le compte désinscrit doit être exclu. Aucun e-mail ne part.",
          "Inicie a distribuição simulada: a conta sem subscrição deve ser excluída. Nenhum e-mail é enviado.",
        ],
        role: "team",
        view: "newsletter",
        done: (s) =>
          s.campaign.status === "sent" && !s.campaign.delivered.length,
      },
    ],
  },
];
export function scenarioState(id: ScenarioId): State {
  let s = initialState();
  const apply = (role: Role, a: Action) => {
    const r = transition(s, role, a);
    if (!r.ok) throw new Error(`Invalid demo setup: ${id}/${a.type}`);
    s = r.state;
  };
  if (id === "settlement") {
    apply("partner", {
      type: "task-update",
      id: "task-1",
      status: "done",
      note: "Compte rendu fictif terminé / Relatório fictício concluído",
    });
    apply("partner", {
      type: "stage",
      id: "DEMO-001",
      stage: "delivered",
      summary:
        "Visite fictive terminée ; aucun incident signalé dans cet exemple.",
    });
    apply("member", { type: "delivery-accept", id: "DEMO-001", version: 1 });
    apply("team", { type: "stage", id: "DEMO-001", stage: "completed" });
  }
  if (id === "mission")
    apply("team", { type: "share", id: "doc-1", shared: false });
  if (id === "family") {
    apply("member", { type: "subscription", plan: "Family", period: "annual" });
    apply("member", { type: "subscription-payment", result: "paid" });
    apply("member", { type: "invite", email: "beneficiaire@example.test" });
  }
  if (id === "journal")
    apply("team", {
      type: "edition",
      edition: {
        title: "Portugal — édition de démonstration / edição de demonstração",
        excerpt:
          "Extrait fictif pour tester le parcours / Excerto fictício para testar o percurso.",
        sections: [
          "Exemple de rubrique 1 / Exemplo de rubrica 1.",
          "Exemple de rubrique 2 / Exemplo de rubrica 2.",
          "Exemple de rubrique 3 / Exemplo de rubrica 3.",
          "Exemple de rubrique 4 / Exemplo de rubrica 4.",
        ],
        status: "draft",
      },
    });
  return s;
}
// Record a step only when its result is observed while that step is current.
// Later revocation does not erase the fact that an earlier sharing step was tested.
export function advanceScenario(
  scenario: DemoScenario,
  s: State,
  completed: number,
) {
  return completed < scenario.steps.length && scenario.steps[completed].done(s)
    ? completed + 1
    : completed;
}
