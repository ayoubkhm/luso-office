import { countryCode } from "../countries";
import { canAccessView, canPerformAction } from "./permissions";
import { nextRenewal, validDay } from "./calendar";
import { failureReason } from "./failureReason";
// In-memory design prototype. These checks demonstrate rules, not server authorization.
import { services, plans } from "../catalogue";
import { createActivity, type ActivityEvent } from "./activity";
export type Role = "member" | "team" | "partner";
export type Stage =
  | "submitted"
  | "review"
  | "quote"
  | "approved"
  | "inprogress"
  | "delivered"
  | "completed"
  | "cancelled";
export type PaymentState = "unpaid" | "pending" | "failed" | "paid";
export interface Proposal {
  version: number;
  quote: number;
  fees: number;
  thirdParty: number;
  scope: string;
  exclusions: string;
  status: "proposed" | "revision-requested" | "superseded" | "accepted";
  revisionReason?: string;
  revisionBy?: "member" | "team";
}
export interface Settlement {
  version: number;
  coordination: number;
  official: number;
  thirdParty: number;
  explanation: string;
  status:
    | "proposed"
    | "disputed"
    | "approved"
    | "pending"
    | "failed"
    | "settled"
    | "superseded";
  dispute?: string;
  attempts: ("pending" | "failed" | "paid")[];
}
export interface Delivery {
  version: number;
  summary: string;
  by: Role;
  documents: { id: string; name: string; version: number }[];
  status: "submitted" | "accepted" | "correction";
  correction?: string;
}
export interface Case {
  deliveries?: Delivery[];
  id: string;
  owner: string;
  service: string;
  property: string;
  description: string;
  stage: Stage;
  partner: boolean;
  partnerId?: string;
  operatorId?: string;
  quote: number;
  fees: number;
  thirdParty: number;
  payment: PaymentState;
  history: string[];
  notes: string[];
  proposals: Proposal[];
  settlements: Settlement[];
  cancellation?: { reason: string; by: "member" | "team" };
  sourceCase?: string;
  decisions: {
    kind:
      | "cancel-request"
      | "cancel-withdraw"
      | "cancel-confirm"
      | "cancel-decline"
      | "correction"
      | "reopen"
      | "restart";
    role: Role;
    reason: string;
  }[];
}
export interface Document {
  id: string;
  name: string;
  caseId: string;
  shared: boolean;
  custody: "digital" | "received" | "returned";
  version: number;
  review: "pending" | "accepted" | "rejected";
  reason: string;
  requirement?: string;
  revisions: {
    version: number;
    name: string;
    review: Document["review"];
    reason: string;
  }[];
}
export type TaskStatus = "todo" | "doing" | "blocked" | "done";
export interface Task {
  id: string;
  caseId: string;
  title: string;
  assignee: "team" | "partner";
  due: string;
  status: TaskStatus;
  note: string;
}
export interface Requirement {
  id: string;
  caseId: string;
  label: string;
}
export interface Edition {
  title: string;
  sections: string[];
  excerpt: string;
  status: "draft" | "review" | "published";
}
export type EditionContent = Pick<Edition, "title" | "excerpt" | "sections">;
const emptyEdition = (): EditionContent => ({
  title: "Portugal — Tão longe e tão perto",
  sections: ["", "", "", ""],
  excerpt: "",
});
const copyEdition = (e: EditionContent): EditionContent => ({
  title: e.title,
  excerpt: e.excerpt,
  sections: [...e.sections],
});
const validEditionSize = (e: EditionContent) =>
  e.title.length <= 150 &&
  e.excerpt.length <= 600 &&
  e.sections.length === 4 &&
  e.sections.every((s) => s.length <= 5000);
export const editionDirty = (s: State) =>
  s.edition.title !== s.editionDraft.title ||
  s.edition.excerpt !== s.editionDraft.excerpt ||
  s.edition.sections.some((text, i) => text !== s.editionDraft.sections[i]);
export interface FamilyInvitation {
  id: string;
  email: string;
  status: "pending" | "active" | "expired" | "revoked";
  generation: number;
  cases: string[];
  documents: string[];
  history: (
    "prepared" | "accepted" | "expired" | "revoked" | "renewed" | "plan-change"
  )[];
}
export interface SubscriptionAttempt {
  id: number;
  plan: "Member" | "Family";
  period: "annual" | "monthly";
  previousPlan: "Member" | "Family" | "Premium";
  previousPeriod: "annual" | "monthly";
  amount: number;
  status: "pending" | "failed" | "paid";
}
export interface Account {
  id: string;
  profile: State["profile"];
  subscription: State["subscription"];
  invitations: FamilyInvitation[];
}
export interface Person {
  id: string;
  name: string;
  kind: "operator" | "editor" | "admin" | "partner";
  enabled: boolean;
}
export interface State {
  demoToday: string;
  activeClient: string;
  accounts: Account[];
  people: Person[];
  operatorId: string;
  partnerId: string;
  tasks: Task[];
  requirements: Requirement[];
  partnerEnabled: boolean;
  archives: { edition: Edition; delivered: number }[];
  cases: Case[];
  properties: { id: string; name: string; town: string; owner?: string }[];
  documents: Document[];
  messages: {
    id: string;
    caseId: string;
    role: Role;
    body: string;
    author: string;
    readBy: string[];
  }[];
  drafts: Record<string, Record<string, string>>;
  subscription: {
    startedOn?: string;
    renewsOn?: string;
    timeline?: {
      day: string;
      event: "started" | "renewed" | "expired" | "overdue";
    }[];
    attempts: SubscriptionAttempt[];
    plan: "Member" | "Family" | "Premium";
    period: "annual" | "monthly";
    cancelAtEnd: boolean;
    payment: PaymentState;
    active: boolean;
    pending?: { plan: "Member" | "Family"; period: "annual" | "monthly" };
  };
  profile: {
    name: string;
    country: string;
    language: "fr" | "pt" | "en" | "de";
    currency?: "EUR" | "GBP" | "CHF" | "USD";
    consent: boolean;
  };
  edition: Edition;
  editionDraft: EditionContent;
  editionRevision: number;
  reviewedEditionRevision?: number;
  campaign: {
    status: "idle" | "queued" | "sent";
    recipients: string[];
    delivered: string[];
  };
  invitations: FamilyInvitation[];
  audit: ActivityEvent[];
}
export const stages: Stage[] = [
  "submitted",
  "review",
  "quote",
  "approved",
  "inprogress",
  "delivered",
  "completed",
  "cancelled",
];
export const stageLabels: Record<Stage, [string, string]> = {
  submitted: ["Reçue", "Recebido"],
  review: ["À cadrer", "Em análise"],
  quote: ["Votre accord attendu", "A aguardar aprovação"],
  approved: ["Provision attendue", "A aguardar provisão"],
  inprogress: ["En cours", "Em curso"],
  delivered: ["Livrable à vérifier", "Entrega a verificar"],
  completed: ["Terminée", "Concluído"],
  cancelled: ["Annulée", "Cancelado"],
};
export const initialState = (): State => ({
  demoToday: "2026-11-16",
  activeClient: "demo",
  accounts: [],
  operatorId: "operator-1",
  partnerId: "partner-1",
  people: [
    { id: "operator-1", name: "Camille · démo", kind: "admin", enabled: true },
    { id: "operator-2", name: "Rui · demo", kind: "operator", enabled: true },
    { id: "editor-1", name: "Inês · demo", kind: "editor", enabled: true },
    { id: "partner-1", name: "João · demo", kind: "partner", enabled: true },
    { id: "partner-2", name: "Sofia · demo", kind: "partner", enabled: true },
  ],
  drafts: {},
  partnerEnabled: true,
  archives: [],
  requirements: [
    {
      id: "need-1",
      caseId: "DEMO-002",
      label: "Liste des pièces disponibles / Lista de documentos disponíveis",
    },
  ],
  tasks: [
    {
      id: "task-1",
      caseId: "DEMO-001",
      title:
        "Préparer le compte rendu de visite / Preparar o relatório da visita",
      assignee: "partner",
      due: "",
      status: "doing",
      note: "",
    },
  ],
  cases: [
    {
      id: "DEMO-001",
      owner: "demo",
      service: "maison-inoccupee",
      property: "home-1",
      description:
        "Exemple / Exemplo : visite de la maison avant une arrivée / visita antes da chegada.",
      stage: "inprogress",
      partner: true,
      quote: 39,
      fees: 0,
      thirdParty: 0,
      payment: "paid",
      history: ["submitted", "review", "quote", "approved", "inprogress"],
      notes: [],
      settlements: [],
      proposals: [
        {
          version: 1,
          quote: 39,
          fees: 0,
          thirdParty: 0,
          scope:
            "Scénario : visite et compte rendu / Cenário: visita e relatório.",
          exclusions:
            "TVA, déplacements et conditions : TBD / IVA, deslocações e condições: TBD.",
          status: "accepted",
        },
      ],
      decisions: [],
    },
    {
      id: "DEMO-002",
      owner: "demo",
      service: "dossier-succession",
      property: "home-1",
      description:
        "Exemple / Exemplo : organiser un dossier familial / organizar um processo familiar.",
      stage: "quote",
      partner: false,
      quote: 125,
      fees: 0,
      thirdParty: 0,
      payment: "unpaid",
      history: ["submitted", "review", "quote"],
      notes: [],
      settlements: [],
      proposals: [
        {
          version: 1,
          quote: 125,
          fees: 0,
          thirdParty: 0,
          scope:
            "Scénario : organiser les pièces disponibles / Cenário: organizar os documentos disponíveis.",
          exclusions:
            "Frais externes, TVA et conditions : TBD / Custos externos, IVA e condições: TBD.",
          status: "proposed",
        },
      ],
      decisions: [],
    },
  ],
  properties: [
    {
      id: "home-1",
      name: "Casa da família · démo",
      town: "Commune à préciser / Localidade a indicar",
    },
  ],
  documents: [
    {
      id: "doc-1",
      name: "Liste de visite / Lista de visita · DEMO",
      caseId: "DEMO-001",
      shared: true,
      custody: "digital",
      version: 1,
      review: "accepted",
      reason: "",
      revisions: [],
    },
    {
      id: "doc-2",
      name: "Autorisation / Autorização · DEMO",
      caseId: "DEMO-001",
      shared: false,
      custody: "received",
      version: 1,
      review: "accepted",
      reason: "",
      revisions: [],
    },
  ],
  messages: [
    {
      id: "message-1",
      author: "team:operator-1",
      readBy: ["team:operator-1"],
      caseId: "DEMO-001",
      role: "team",
      body: "Exemple / Exemplo : nous préparons la visite ; merci de préciser les accès / estamos a preparar a visita; indique os acessos.",
    },
  ],
  subscription: {
    startedOn: "2026-11-01",
    renewsOn: "2027-11-01",
    timeline: [{ day: "2026-11-01", event: "started" }],
    attempts: [],
    plan: "Member",
    period: "annual",
    cancelAtEnd: false,
    payment: "paid",
    active: true,
  },
  profile: {
    name: "Compte démo / Conta demo",
    country: "FR",
    language: "fr",
    consent: true,
  },
  edition: { ...emptyEdition(), status: "draft" },
  editionDraft: emptyEdition(),
  editionRevision: 0,
  campaign: { status: "idle", recipients: [], delivered: [] },
  invitations: [],
  audit: [],
});
export const isClosed = (c: Case) =>
  ["completed", "cancelled"].includes(c.stage);
export const canWork = (c: Case) => !isClosed(c) && !c.cancellation;
export function visibleCases(s: State, role: Role) {
  const actor = s.people.find((p) => p.id === s.operatorId);
  if (role === "team" && (!actor?.enabled || actor.kind === "editor"))
    return [];

  return s.cases.filter(
    (c) =>
      (role === "team" &&
        (actor?.kind === "admin" ||
          (c.operatorId || "operator-1") === s.operatorId)) ||
      (role === "partner"
        ? c.partner &&
          s.partnerEnabled &&
          (c.partnerId || "partner-1") === s.partnerId &&
          s.people.some((p) => p.id === s.partnerId && p.enabled)
        : role === "member" && c.owner === s.activeClient),
  );
}
export function visibleDocuments(s: State, role: Role) {
  const ids = new Set(visibleCases(s, role).map((c) => c.id));
  return s.documents.filter(
    (d) => ids.has(d.caseId) && (role !== "partner" || d.shared),
  );
}
export const eligibleRecipients = (s: State) =>
  [
    ...s.accounts,
    { id: s.activeClient, profile: s.profile, subscription: s.subscription },
  ]
    .filter((a) => a.profile.consent && a.subscription.active)
    .map((a) => a.id);
export const total = (c: Case) =>
  Math.round((c.quote + c.fees + c.thirdParty) * 100) / 100;
export function visibleTasks(s: State, role: Role) {
  const ids = new Set(visibleCases(s, role).map((c) => c.id));
  return s.tasks.filter(
    (t) =>
      ids.has(t.caseId) && (role !== "partner" || t.assignee === "partner"),
  );
}
export function missingRequirements(s: State, id: string) {
  return s.requirements.filter(
    (r) =>
      r.caseId === id &&
      !s.documents.some(
        (d) =>
          d.caseId === id && d.requirement === r.id && d.review === "accepted",
      ),
  );
}
export function openTasks(s: State, id: string) {
  return s.tasks.filter((t) => t.caseId === id && t.status !== "done");
}
export function matchingCases(
  s: State,
  role: Role,
  query: string,
  stage: string,
  lang: import("../locales").Lang,
) {
  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return visibleCases(s, role).filter(
    (c) =>
      (stage === "all" ||
        (stage === "cancellation"
          ? Boolean(c.cancellation)
          : c.stage === stage)) &&
      norm(
        [
          c.id,
          c.description,
          services.find((x) => x.id === c.service)?.name[lang],
          s.properties.find((p) => p.id === c.property)?.name,
        ].join(" "),
      ).includes(norm(query.trim())),
  );
}
export const validEdition = (e: Edition) =>
  Boolean(
    e.title.trim() &&
    e.excerpt.trim() &&
    e.sections.length === 4 &&
    e.sections.every((x) => x.trim()),
  );
export type Action =
  | { type: "demo-date"; day: string }
  | { type: "client-create"; name: string; country: string }
  | { type: "client-select"; id: string }
  | { type: "actor-select"; id: string }
  | { type: "staff-assign"; id: string; operatorId: string; partnerId: string }
  | { type: "person-access"; id: string; enabled: boolean }
  | {
      type: "settlement-propose";
      id: string;
      coordination: number;
      official: number;
      thirdParty: number;
      explanation: string;
    }
  | {
      type: "settlement-respond";
      id: string;
      version: number;
      approve: boolean;
      reason: string;
    }
  | {
      type: "settlement-payment";
      id: string;
      version: number;
      result: "pending" | "failed" | "paid";
    }
  | {
      type: "invite-state";
      id: string;
      status: "active" | "expired" | "revoked";
      generation: number;
    }
  | { type: "invite-renew"; id: string }
  | { type: "family-case"; id: string; caseId: string; granted: boolean }
  | {
      type: "family-document";
      id: string;
      documentId: string;
      granted: boolean;
    }
  | { type: "accept-quote"; id: string; version: number }
  | { type: "revise-quote"; id: string; version: number; reason: string }
  | { type: "message-read"; id: string; through: string }
  | { type: "message-draft"; id: string; body: string }
  | { type: "cancel-request"; id: string; reason: string }
  | { type: "cancel-withdraw"; id: string }
  | { type: "cancel-decision"; id: string; confirm: boolean; reason: string }
  | { type: "correction" | "reopen"; id: string; reason: string }
  | { type: "restart"; id: string }
  | {
      type: "task-create";
      id: string;
      title: string;
      assignee: Task["assignee"];
      due: string;
    }
  | { type: "task-update"; id: string; status: TaskStatus; note: string }
  | { type: "task-assign"; id: string; assignee: Task["assignee"]; due: string }
  | { type: "requirement"; id: string; label: string }
  | {
      type: "document-review";
      id: string;
      review: "accepted" | "rejected";
      reason: string;
    }
  | { type: "document-replace"; id: string; name: string }
  | { type: "property-edit"; id: string; name: string; town: string }
  | { type: "partner-access"; enabled: boolean }
  | { type: "next-edition" }
  | { type: "cancel-campaign" }
  | {
      type: "request";
      service: string;
      property: string;
      description: string;
      customer?: {
        name: string;
        country: string;
        currency: "EUR" | "GBP" | "CHF" | "USD";
      };
    }
  | { type: "delivery-accept"; id: string; version: number }
  | {
      type: "stage";
      id: string;
      stage: Stage;
      summary?: string;
      documents?: string[];
    }
  | {
      type: "quote";
      scope: string;
      exclusions: string;
      id: string;
      quote: number;
      fees: number;
      thirdParty: number;
    }
  | { type: "assign"; id: string; assigned: boolean }
  | { type: "pay"; id: string; result: PaymentState }
  | { type: "message"; id: string; body: string }
  | { type: "note"; id: string; body: string }
  | { type: "property"; name: string; town: string }
  | { type: "document"; id: string; name: string; requirement?: string }
  | { type: "share"; id: string; shared: boolean }
  | { type: "custody"; id: string; custody: Document["custody"] }
  | {
      type: "subscription";
      plan: State["subscription"]["plan"];
      period: State["subscription"]["period"];
    }
  | { type: "subscription-payment"; result: PaymentState }
  | { type: "cancel"; cancel: boolean }
  | { type: "profile"; profile: State["profile"] }
  | { type: "invite"; email: string }
  | { type: "edition"; edition: Edition }
  | { type: "edition-draft"; content: EditionContent }
  | { type: "edition-review"; revision: number; confirmed: boolean }
  | { type: "publish" }
  | { type: "queue" }
  | { type: "dispatch" };
function applyTransition(
  s: State,
  role: Role,
  a: Action,
): { state: State; ok: boolean } {
  const reject = { state: s, ok: false };
  const c =
    "id" in a ? visibleCases(s, role).find((c) => c.id === a.id) : undefined;
  let next: State = s;
  const update = (patch: Partial<Case>) => ({
    ...s,
    cases: s.cases.map((x) => (x.id === c?.id ? { ...x, ...patch } : x)),
  });
  const money = (n: number) =>
    Number.isFinite(n) &&
    n >= 0 &&
    n <= 100000 &&
    Math.abs(Math.round(n * 100) - n * 100) < 0.000001;
  const validDate = (d: string) =>
    !d ||
    (/^\d{4}-\d{2}-\d{2}$/.test(d) &&
      !Number.isNaN(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d);
  // A pending cancellation pauses execution, but allows messages, access withdrawal,
  // original returns and the settlement of an already pending payment.
  const linkedCase =
    c ||
    ("id" in a
      ? s.cases.find(
          (x) =>
            x.id ===
            (s.tasks.find((t) => t.id === a.id)?.caseId ||
              s.documents.find((d) => d.id === a.id)?.caseId),
        )
      : undefined);
  if (linkedCase && !canWork(linkedCase)) {
    if (
      [
        "task-create",
        "task-update",
        "task-assign",
        "requirement",
        "document-review",
        "document-replace",
        "document",
        "stage",
        "quote",
      ].includes(a.type)
    )
      return reject;
    if (a.type === "assign" && a.assigned) return reject;
    if (a.type === "share" && a.shared) return reject;
    if (a.type === "custody" && a.custody !== "returned") return reject;
    if (
      a.type === "pay" &&
      (linkedCase.payment !== "pending" || a.result === "pending")
    )
      return reject;
  }
  const decision = (
    kind: Case["decisions"][number]["kind"],
    reason: string,
  ) => [...c!.decisions, { kind, role, reason: reason.trim() }];
  switch (a.type) {
    case "demo-date": {
      if (
        role !== "member" ||
        !validDay(a.day) ||
        a.day < s.demoToday ||
        s.subscription.payment === "pending" ||
        s.accounts.some((account) => account.subscription.payment === "pending")
      )
        return reject;
      const expired = Boolean(
        s.subscription.active &&
        s.subscription.renewsOn &&
        a.day >= s.subscription.renewsOn,
      );
      next = {
        ...s,
        demoToday: a.day,
        accounts: s.accounts.map((account) => ({
          ...account,
          subscription:
            account.subscription.active &&
            account.subscription.renewsOn &&
            a.day >= account.subscription.renewsOn
              ? {
                  ...account.subscription,
                  active: false,
                  timeline: [
                    ...(account.subscription.timeline || []),
                    {
                      day: account.subscription.renewsOn,
                      event: account.subscription.cancelAtEnd
                        ? ("expired" as const)
                        : ("overdue" as const),
                    },
                  ],
                }
              : account.subscription,
        })),
        subscription: {
          ...s.subscription,
          ...(expired
            ? {
                active: false,
                timeline: [
                  ...(s.subscription.timeline || []),
                  {
                    day: s.subscription.renewsOn!,
                    event: s.subscription.cancelAtEnd
                      ? ("expired" as const)
                      : ("overdue" as const),
                  },
                ],
              }
            : {}),
        },
      };
      break;
    }
    case "client-create": {
      if (
        role === "partner" ||
        !a.name.trim() ||
        a.name.length > 80 ||
        !a.country.trim()
      )
        return reject;
      const id = `client-${s.accounts.length + 1}`;
      const previous = {
        id: s.activeClient,
        profile: s.profile,
        subscription: s.subscription,
        invitations: s.invitations,
      };
      next = {
        ...s,
        activeClient: id,
        profile: {
          name: a.name.trim(),
          country: countryCode(a.country),
          language: s.profile.language,
          consent: false,
        },
        subscription: {
          attempts: [],
          plan: "Member",
          period: "annual",
          cancelAtEnd: false,
          payment: "unpaid",
          active: false,
        },
        invitations: [],
        accounts: [
          ...s.accounts.filter((x) => x.id !== s.activeClient),
          previous,
        ],
      };
      break;
    }
    case "client-select": {
      if (role === "partner" || a.id === s.activeClient) return reject;
      const account = s.accounts.find((x) => x.id === a.id);
      if (!account) return reject;
      next = {
        ...s,
        activeClient: account.id,
        profile: account.profile,
        subscription: account.subscription,
        invitations: account.invitations,
        accounts: [
          ...s.accounts.filter((x) => x.id !== a.id),
          {
            id: s.activeClient,
            profile: s.profile,
            subscription: s.subscription,
            invitations: s.invitations,
          },
        ],
      };
      break;
    }
    case "actor-select": {
      const person = s.people.find(
        (p) =>
          p.id === a.id &&
          p.enabled &&
          (role === "partner" ? p.kind === "partner" : p.kind !== "partner"),
      );
      if (role === "member" || !person) return reject;
      next = {
        ...s,
        ...(role === "partner" ? { partnerId: a.id } : { operatorId: a.id }),
      };
      break;
    }
    case "person-access": {
      if (
        role !== "team" ||
        s.people.find((p) => p.id === s.operatorId)?.kind !== "admin" ||
        a.id === s.operatorId ||
        !s.people.some((p) => p.id === a.id)
      )
        return reject;
      next = {
        ...s,
        people: s.people.map((p) =>
          p.id === a.id ? { ...p, enabled: a.enabled } : p,
        ),
      };
      break;
    }
    case "staff-assign": {
      if (
        role !== "team" ||
        !c ||
        !canWork(c) ||
        !s.people.some(
          (p) =>
            p.id === a.operatorId &&
            p.enabled &&
            ["admin", "operator"].includes(p.kind),
        ) ||
        (a.partnerId &&
          !s.people.some(
            (p) => p.id === a.partnerId && p.enabled && p.kind === "partner",
          ))
      )
        return reject;
      // A new partner never inherits document sharing from the previous partner.
      next = {
        ...update({
          operatorId: a.operatorId,
          partnerId: a.partnerId || undefined,
          partner: Boolean(a.partnerId),
        }),
        documents: s.documents.map((d) =>
          d.caseId === c.id && a.partnerId !== (c.partnerId || "partner-1")
            ? { ...d, shared: false }
            : d,
        ),
      };
      break;
    }

    case "settlement-propose": {
      const latest = c?.settlements.at(-1);
      if (
        !c ||
        role !== "team" ||
        !isClosed(c) ||
        c.payment !== "paid" ||
        (latest && !["disputed", "superseded"].includes(latest.status)) ||
        ![a.coordination, a.official, a.thirdParty].every(money) ||
        !a.explanation.trim() ||
        a.explanation.length > 2000
      )
        return reject;
      next = update({
        settlements: [
          ...c.settlements.map((b) => ({
            ...b,
            status: "superseded" as const,
          })),
          {
            version: c.settlements.length + 1,
            coordination: a.coordination,
            official: a.official,
            thirdParty: a.thirdParty,
            explanation: a.explanation.trim(),
            status: "proposed",
            attempts: [],
          },
        ],
      });
      break;
    }
    case "settlement-respond": {
      const b = c?.settlements.at(-1);
      if (
        !c ||
        role !== "member" ||
        !isClosed(c) ||
        c.payment !== "paid" ||
        !b ||
        b.status !== "proposed" ||
        a.version !== b.version ||
        (!a.approve && !a.reason.trim()) ||
        a.reason.length > 1000
      )
        return reject;
      next = update({
        settlements: c.settlements.map((x) =>
          x.version === b.version
            ? {
                ...x,
                status: a.approve
                  ? settlementBalance(c, b) === 0
                    ? "settled"
                    : "approved"
                  : "disputed",
                dispute: a.approve ? undefined : a.reason.trim(),
              }
            : x,
        ),
      });
      break;
    }
    case "settlement-payment": {
      const b = c?.settlements.at(-1);
      if (
        !c ||
        !isClosed(c) ||
        c.payment !== "paid" ||
        !b ||
        a.version !== b.version ||
        !["pending", "failed", "paid"].includes(a.result)
      )
        return reject;
      const balance = settlementBalance(c, b);
      if (!balance || role !== (balance < 0 ? "team" : "member")) return reject;
      if (
        a.result === "pending"
          ? !["approved", "failed"].includes(b.status)
          : b.status !== "pending"
      )
        return reject;
      next = update({
        settlements: c.settlements.map((x) =>
          x.version === b.version
            ? {
                ...x,
                status: a.result === "paid" ? "settled" : a.result,
                attempts: [...x.attempts, a.result],
              }
            : x,
        ),
      });
      break;
    }

    case "cancel-request":
      if (!c || role === "partner" || !canWork(c) || !a.reason.trim())
        return reject;
      next = update({
        cancellation: { reason: a.reason.trim(), by: role },
        decisions: decision("cancel-request", a.reason),
      });
      break;
    case "cancel-withdraw":
      if (!c?.cancellation || c.cancellation.by !== role) return reject;
      next = update({
        cancellation: undefined,
        decisions: decision("cancel-withdraw", ""),
      });
      break;
    case "cancel-decision":
      if (
        !c?.cancellation ||
        role !== "team" ||
        (!a.confirm && !a.reason.trim()) ||
        (a.confirm && c.payment === "pending")
      )
        return reject;
      next = update({
        cancellation: undefined,
        ...(a.confirm
          ? {
              stage: "cancelled",
              partner: false,
              history: [...c.history, "cancelled"],
            }
          : {}),
        decisions: decision(
          a.confirm ? "cancel-confirm" : "cancel-decline",
          a.reason || c.cancellation.reason,
        ),
      });
      break;
    case "correction":
    case "reopen":
      if (
        !c ||
        role === "partner" ||
        c.cancellation ||
        settlementLocked(c) ||
        !a.reason.trim() ||
        (a.type === "correction"
          ? c.stage !== "delivered"
          : role !== "team" || c.stage !== "completed")
      )
        return reject;
      next = {
        ...update({
          stage: "inprogress",
          deliveries: c.deliveries?.map((d, i) =>
            i === c.deliveries!.length - 1
              ? {
                  ...d,
                  status: "correction" as const,
                  correction: a.reason.trim(),
                }
              : d,
          ),
          history: [...c.history, "inprogress"],
          decisions: decision(a.type, a.reason),
          settlements: c.settlements.map((b) => ({
            ...b,
            status: "superseded" as const,
          })),
        }),
        tasks: [
          ...s.tasks,
          {
            id: `task-${s.tasks.length + 1}`,
            caseId: c.id,
            title: a.reason.trim(),
            assignee: "team",
            due: "",
            status: "todo",
            note: "",
          },
        ],
      };
      break;
    case "restart": {
      if (!c || c.stage !== "cancelled" || role !== "member") return reject;
      // A new scope gets a new proposal. Neither payment nor private documents are copied.
      const id = `DEMO-${String(s.cases.length + 1).padStart(3, "0")}`;
      next = {
        ...s,
        cases: [
          ...s.cases,
          {
            id,
            owner: c.owner,
            service: c.service,
            property: c.property,
            description: c.description,
            stage: "submitted",
            partner: false,
            quote: 0,
            fees: 0,
            thirdParty: 0,
            payment: "unpaid",
            history: ["submitted"],
            notes: [],
            settlements: [],
            proposals: [],
            sourceCase: c.id,
            decisions: [{ kind: "restart", role, reason: c.id }],
          },
        ],
      };
      break;
    }

    case "task-create":
      if (
        role !== "team" ||
        !c ||
        c.stage === "completed" ||
        !a.title.trim() ||
        !validDate(a.due) ||
        (a.assignee === "partner" && (!c.partner || !s.partnerEnabled))
      )
        return reject;
      next = {
        ...s,
        tasks: [
          ...s.tasks,
          {
            id: `task-${s.tasks.length + 1}`,
            caseId: c.id,
            title: a.title.trim(),
            assignee: a.assignee,
            due: a.due,
            status: "todo",
            note: "",
          },
        ],
      };
      break;
    case "task-update":
    case "task-assign": {
      const task = visibleTasks(s, role).find((t) => t.id === a.id);
      if (
        role === "member" ||
        !task ||
        s.cases.find((c) => c.id === task.caseId)?.stage === "completed"
      )
        return reject;
      if (a.type === "task-assign") {
        if (
          role !== "team" ||
          !validDate(a.due) ||
          (a.assignee === "partner" &&
            (!s.partnerEnabled ||
              !s.cases.find((c) => c.id === task.caseId)?.partner))
        )
          return reject;
        next = {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === a.id ? { ...t, assignee: a.assignee, due: a.due } : t,
          ),
        };
      } else {
        if (
          !(["todo", "doing", "blocked", "done"] as string[]).includes(
            a.status,
          ) ||
          (a.status === "blocked" && !a.note.trim())
        )
          return reject;
        next = {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === a.id ? { ...t, status: a.status, note: a.note.trim() } : t,
          ),
        };
      }
      break;
    }
    case "requirement":
      if (
        role !== "team" ||
        !c ||
        c.stage === "completed" ||
        !a.label.trim() ||
        s.requirements.some(
          (r) =>
            r.caseId === c.id &&
            r.label.toLowerCase() === a.label.trim().toLowerCase(),
        )
      )
        return reject;
      next = {
        ...s,
        requirements: [
          ...s.requirements,
          {
            id: `need-${s.requirements.length + 1}`,
            caseId: c.id,
            label: a.label.trim(),
          },
        ],
      };
      break;
    case "document-review":
    case "document-replace": {
      const d = visibleDocuments(s, role).find((d) => d.id === a.id);
      if (!d || s.cases.find((c) => c.id === d.caseId)?.stage === "completed")
        return reject;
      if (a.type === "document-review") {
        if (
          role !== "team" ||
          d.review !== "pending" ||
          (a.review === "rejected" && !a.reason.trim())
        )
          return reject;
        next = {
          ...s,
          documents: s.documents.map((x) =>
            x.id === d.id
              ? { ...x, review: a.review, reason: a.reason.trim() }
              : x,
          ),
        };
      } else {
        if (!a.name.trim() || d.review !== "rejected") return reject;
        next = {
          ...s,
          invitations: s.invitations.map((i) => ({
            ...i,
            documents: i.documents.filter((id) => id !== d.id),
          })),
          documents: s.documents.map((x) =>
            x.id === d.id
              ? {
                  ...x,
                  name: a.name.trim(),
                  review: "pending",
                  reason: "",
                  version: x.version + 1,
                  revisions: [
                    ...x.revisions,
                    {
                      version: x.version,
                      name: x.name,
                      review: x.review,
                      reason: x.reason,
                    },
                  ],
                }
              : x,
          ),
        };
      }
      break;
    }
    case "property-edit":
      if (
        role !== "member" ||
        !s.properties.some(
          (p) => p.id === a.id && (p.owner || "demo") === s.activeClient,
        ) ||
        !a.name.trim() ||
        !a.town.trim()
      )
        return reject;
      next = {
        ...s,
        properties: s.properties.map((p) =>
          p.id === a.id
            ? { ...p, name: a.name.trim(), town: a.town.trim() }
            : p,
        ),
      };
      break;
    case "partner-access":
      if (role !== "team" || s.partnerEnabled === a.enabled) return reject;
      next = { ...s, partnerEnabled: a.enabled };
      break;
    case "cancel-campaign":
      if (role !== "team" || s.campaign.status !== "queued") return reject;
      next = {
        ...s,
        campaign: { status: "idle", recipients: [], delivered: [] },
      };
      break;
    case "next-edition":
      if (
        role !== "team" ||
        s.edition.status !== "published" ||
        s.campaign.status === "queued"
      )
        return reject;
      next = {
        ...s,
        archives: [
          ...s.archives,
          {
            edition: { ...s.edition, sections: [...s.edition.sections] },
            delivered: s.campaign.delivered.length,
          },
        ],
        edition: { ...emptyEdition(), status: "draft" },
        editionDraft: emptyEdition(),
        editionRevision: s.editionRevision + 1,
        reviewedEditionRevision: undefined,
        campaign: { status: "idle", recipients: [], delivered: [] },
      };
      break;
    case "request":
      if (
        role !== "member" ||
        !a.description.trim() ||
        !services.some((s) => s.id === a.service) ||
        (a.property &&
          !s.properties.some(
            (p) =>
              p.id === a.property && (p.owner || "demo") === s.activeClient,
          ))
      )
        return reject;
      next = {
        ...s,
        cases: [
          ...s.cases,
          {
            id: `DEMO-${String(s.cases.length + 1).padStart(3, "0")}`,
            owner: s.activeClient,
            service: a.service,
            property: a.property,
            description: a.description.trim(),
            stage: "submitted",
            partner: false,
            quote: 0,
            fees: 0,
            thirdParty: 0,
            payment: "unpaid",
            history: ["submitted"],
            notes: [],
            settlements: [],
            proposals: [],
            decisions: [],
          },
        ],
      };
      break;
    case "delivery-accept": {
      const d = c?.deliveries?.at(-1);
      if (
        !c ||
        role !== "member" ||
        !canWork(c) ||
        c.stage !== "delivered" ||
        !d ||
        d.version !== a.version ||
        d.status !== "submitted"
      )
        return reject;
      next = update({
        deliveries: c.deliveries!.map((x) =>
          x.version === d.version ? { ...x, status: "accepted" as const } : x,
        ),
      });
      break;
    }
    case "stage": {
      if (!c) return reject;
      const allowed =
        role === "member"
          ? false // Agreement requires the exact proposal version via accept-quote.
          : role === "partner"
            ? c.stage === "inprogress" && a.stage === "delivered"
            : (c.stage === "submitted" && a.stage === "review") ||
              (c.stage === "approved" &&
                c.payment === "paid" &&
                a.stage === "inprogress") ||
              (c.stage === "inprogress" && a.stage === "delivered") ||
              (c.stage === "delivered" && a.stage === "completed");
      if (!allowed) return reject;
      if (
        ["inprogress", "delivered", "completed"].includes(a.stage) &&
        missingRequirements(s, c.id).length
      )
        return reject;
      if (
        ["delivered", "completed"].includes(a.stage) &&
        openTasks(s, c.id).length
      )
        return reject;
      let deliveries = c.deliveries || [];
      if (a.stage === "delivered") {
        if (!a.summary?.trim() || a.summary.length > 3000) return reject;
        const ids = a.documents || [];
        if (
          new Set(ids).size !== ids.length ||
          ids.some(
            (id) =>
              !visibleDocuments(s, role).some(
                (d) =>
                  d.id === id && d.caseId === c.id && d.review === "accepted",
              ),
          )
        )
          return reject;
        deliveries = [
          ...deliveries,
          {
            version: deliveries.length + 1,
            summary: a.summary.trim(),
            by: role,
            status: "submitted",
            documents: ids.map((id) => {
              const d = s.documents.find((d) => d.id === id)!;
              return { id: d.id, name: d.name, version: d.version };
            }),
          },
        ];
      }
      if (a.stage === "completed" && deliveries.at(-1)?.status !== "accepted")
        return reject;
      next = update({
        stage: a.stage,
        history: [...c.history, a.stage],
        deliveries,
      });
      break;
    }
    case "accept-quote": {
      const proposal = c?.proposals.at(-1);
      if (
        !c ||
        !canWork(c) ||
        role !== "member" ||
        c.stage !== "quote" ||
        c.payment !== "unpaid" ||
        !proposal ||
        proposal.status !== "proposed" ||
        a.version !== proposal.version
      )
        return reject;
      next = update({
        stage: "approved",
        history: [...c.history, "approved"],
        proposals: c.proposals.map((p) =>
          p.version === a.version ? { ...p, status: "accepted" } : p,
        ),
      });
      break;
    }
    case "revise-quote": {
      const proposal = c?.proposals.at(-1);
      if (
        !c ||
        !canWork(c) ||
        role === "partner" ||
        c.stage !== "quote" ||
        !proposal ||
        proposal.status !== "proposed" ||
        a.version !== proposal.version ||
        !a.reason.trim() ||
        a.reason.length > 1000
      )
        return reject;
      next = update({
        stage: "review",
        history: [...c.history, "review"],
        proposals: c.proposals.map((p) =>
          p.version === a.version
            ? {
                ...p,
                status: "revision-requested",
                revisionReason: a.reason.trim(),
                revisionBy: role,
              }
            : p,
        ),
      });
      break;
    }
    case "quote":
      if (
        role !== "team" ||
        !c ||
        c.stage !== "review" ||
        c.payment !== "unpaid" ||
        c.proposals.some((p) => p.status === "accepted") ||
        ![a.quote, a.fees, a.thirdParty].every(money) ||
        a.quote <= 0 ||
        !a.scope.trim() ||
        a.scope.length > 4000 ||
        a.exclusions.length > 2000
      )
        return reject;
      next = update({
        proposals: [
          ...c.proposals.map((p) => ({ ...p, status: "superseded" as const })),
          {
            version: c.proposals.length + 1,
            quote: a.quote,
            fees: a.fees,
            thirdParty: a.thirdParty,
            scope: a.scope.trim(),
            exclusions: a.exclusions.trim(),
            status: "proposed",
          },
        ],
        quote: a.quote,
        fees: a.fees,
        thirdParty: a.thirdParty,
        stage: "quote",
        history: [...c.history, "quote"],
      });
      break;
    case "assign":
      if (role !== "team" || !c || (a.assigned && !s.partnerEnabled))
        return reject;
      next = update({ partner: a.assigned });
      break;
    case "pay":
      if (
        role !== "member" ||
        !c ||
        c.stage !== "approved" ||
        c.proposals.at(-1)?.status !== "accepted" ||
        c.payment === "paid" ||
        !(["pending", "failed", "paid"] as string[]).includes(a.result)
      )
        return reject;
      if (a.result !== "pending" && c.payment !== "pending") return reject;
      next = update({ payment: a.result });
      break;
    case "message-draft":
      if (!c || a.body.length > 2000) return reject;
      return {
        ok: true,
        state: {
          ...s,
          drafts: {
            ...s.drafts,
            [actorKey(s, role)]: {
              ...s.drafts[actorKey(s, role)],
              [c.id]: a.body,
            },
          },
        },
      };
    case "message-read": {
      if (!c) return reject;
      const end = s.messages.findIndex(
        (m) => m.id === a.through && m.caseId === c.id,
      );
      if (end < 0) return reject;
      return {
        ok: true,
        state: {
          ...s,
          messages: s.messages.map((m, i) =>
            i <= end &&
            m.caseId === c.id &&
            !m.readBy.includes(actorKey(s, role))
              ? { ...m, readBy: [...m.readBy, actorKey(s, role)] }
              : m,
          ),
        },
      };
    }
    case "message":
    case "note":
      if (
        !c ||
        !a.body.trim() ||
        a.body.length > (a.type === "note" ? 1000 : 2000) ||
        (a.type === "note" && role !== "team")
      )
        return reject;
      next =
        a.type === "note"
          ? update({ notes: [...c.notes, a.body.trim()] })
          : {
              ...s,
              drafts: {
                ...s.drafts,
                [actorKey(s, role)]: {
                  ...s.drafts[actorKey(s, role)],
                  [c.id]: "",
                },
              },
              messages: [
                ...s.messages,
                {
                  id: `message-${s.messages.length + 1}`,
                  caseId: c.id,
                  role,
                  body: a.body.trim(),
                  author: actorKey(s, role),
                  readBy: [actorKey(s, role)],
                },
              ],
            };
      break;
    case "property":
      if (role !== "member" || !a.name.trim() || !a.town.trim()) return reject;
      next = {
        ...s,
        properties: [
          ...s.properties,
          {
            id: `home-${s.properties.length + 1}`,
            name: a.name.trim(),
            town: a.town.trim(),
            owner: s.activeClient,
          },
        ],
      };
      break;
    case "document":
      if (!c || !a.name.trim() || c.stage === "completed") return reject;
      if (
        a.requirement &&
        (role === "partner" ||
          !s.requirements.some(
            (r) => r.id === a.requirement && r.caseId === c.id,
          ) ||
          s.documents.some((d) => d.requirement === a.requirement))
      )
        return reject;
      next = {
        ...s,
        documents: [
          ...s.documents,
          {
            id: `doc-${s.documents.length + 1}`,
            name: a.name.trim(),
            caseId: c.id,
            shared: role === "partner",
            custody: "digital",
            version: 1,
            review: "pending",
            reason: "",
            revisions: [],
            requirement: a.requirement,
          },
        ],
      };
      break;
    case "share":
    case "custody": {
      const d = visibleDocuments(s, role).find((d) => d.id === a.id);
      if (!d || role === "partner" || (a.type === "custody" && role !== "team"))
        return reject;
      if (
        a.type === "custody" &&
        !(
          (d.custody === "digital" && a.custody === "received") ||
          (d.custody === "received" && a.custody === "returned")
        )
      )
        return reject;
      next = {
        ...s,
        documents: s.documents.map((x) =>
          x.id === d.id
            ? {
                ...x,
                ...(a.type === "share"
                  ? { shared: a.shared }
                  : { custody: a.custody }),
              }
            : x,
        ),
      };
      break;
    }
    case "subscription": {
      if (
        role !== "member" ||
        (a.plan !== "Member" && a.plan !== "Family") ||
        !["monthly", "annual"].includes(a.period) ||
        s.subscription.payment === "pending" ||
        (s.subscription.active &&
          s.subscription.plan === a.plan &&
          s.subscription.period === a.period)
      )
        return reject;
      const plan = plans.find((p) => p.id === a.plan)!;
      // Existing entitlement stays active until the simulated payment succeeds.
      next = {
        ...s,
        subscription: {
          ...s.subscription,
          pending: { plan: a.plan, period: a.period },
          payment: "pending",
          attempts: [
            ...s.subscription.attempts,
            {
              id: s.subscription.attempts.length + 1,
              plan: a.plan,
              period: a.period,
              previousPlan: s.subscription.plan,
              previousPeriod: s.subscription.period,
              amount: a.period === "annual" ? plan.annual : plan.monthly,
              status: "pending",
            },
          ],
        },
      };
      break;
    }
    case "subscription-payment":
      if (
        role !== "member" ||
        s.subscription.payment !== "pending" ||
        !s.subscription.pending ||
        s.subscription.attempts.at(-1)?.status !== "pending" ||
        !["paid", "failed"].includes(a.result)
      )
        return reject;
      next = {
        ...s,
        invitations:
          a.result === "paid" && s.subscription.pending?.plan === "Member"
            ? s.invitations.map((i) =>
                ["pending", "active"].includes(i.status)
                  ? {
                      ...i,
                      status: "revoked",
                      cases: [],
                      documents: [],
                      history: [...i.history, "plan-change"],
                    }
                  : i,
              )
            : s.invitations,
        subscription: {
          ...s.subscription,
          ...(a.result === "paid" ? s.subscription.pending : {}),
          pending: undefined,
          payment: a.result,
          active: s.subscription.active || a.result === "paid",
          ...(a.result === "paid"
            ? {
                startedOn: s.demoToday,
                renewsOn: nextRenewal(
                  s.demoToday,
                  s.subscription.pending!.period,
                ),
                cancelAtEnd: false,
                timeline: [
                  ...(s.subscription.timeline || []),
                  {
                    day: s.demoToday,
                    event: s.subscription.startedOn
                      ? ("renewed" as const)
                      : ("started" as const),
                  },
                ],
              }
            : {}),
          attempts: s.subscription.attempts.map((attempt, i) =>
            i === s.subscription.attempts.length - 1
              ? { ...attempt, status: a.result as "paid" | "failed" }
              : attempt,
          ),
        },
      };
      break;
    case "cancel":
      if (role !== "member" || s.subscription.cancelAtEnd === a.cancel)
        return reject;
      next = {
        ...s,
        subscription: { ...s.subscription, cancelAtEnd: a.cancel },
      };
      break;
    case "profile":
      if (role !== "member" || !a.profile.name.trim()) return reject;
      next = {
        ...s,
        profile: {
          ...a.profile,
          country: countryCode(a.profile.country),
          name: a.profile.name.trim(),
        },
      };
      break;
    case "invite": {
      const email = a.email.trim().toLowerCase();
      if (
        role !== "member" ||
        !familyActive(s) ||
        familySlots(s) >= 3 ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        s.invitations.some((i) => i.email === email)
      )
        return reject;
      next = {
        ...s,
        invitations: [
          ...s.invitations,
          {
            id: `family-${s.invitations.length + 1}`,
            email,
            status: "pending",
            generation: 1,
            cases: [],
            documents: [],
            history: ["prepared"],
          },
        ],
      };
      break;
    }
    case "invite-state":
    case "invite-renew":
    case "family-case":
    case "family-document": {
      const i = s.invitations.find((i) => i.id === a.id);
      if (role !== "member" || !i) return reject;
      let patch: Partial<FamilyInvitation>;
      if (a.type === "invite-state") {
        if (
          a.generation !== i.generation ||
          !["active", "expired", "revoked"].includes(a.status)
        )
          return reject;
        if (
          a.status === "revoked"
            ? !["pending", "active"].includes(i.status)
            : i.status !== "pending"
        )
          return reject;
        if (a.status === "active" && !familyActive(s)) return reject;
        patch = {
          status: a.status,
          cases: [],
          documents: [],
          history: [
            ...i.history,
            a.status === "active" ? "accepted" : a.status,
          ],
        };
      } else if (a.type === "invite-renew") {
        if (
          !familyActive(s) ||
          familySlots(s) >= 3 ||
          !["expired", "revoked"].includes(i.status)
        )
          return reject;
        patch = {
          status: "pending",
          generation: i.generation + 1,
          cases: [],
          documents: [],
          history: [...i.history, "renewed"],
        };
      } else {
        if (!familyActive(s) || i.status !== "active") return reject;
        if (a.type === "family-case") {
          if (
            !visibleCases(s, "member").some((c) => c.id === a.caseId) ||
            i.cases.includes(a.caseId) === a.granted
          )
            return reject;
          patch = {
            cases: a.granted
              ? [...i.cases, a.caseId]
              : i.cases.filter((id) => id !== a.caseId),
            documents: a.granted
              ? i.documents
              : i.documents.filter(
                  (id) =>
                    s.documents.find((d) => d.id === id)?.caseId !== a.caseId,
                ),
          };
        } else {
          const d = visibleDocuments(s, "member").find(
            (d) => d.id === a.documentId,
          );
          if (
            !d ||
            !i.cases.includes(d.caseId) ||
            i.documents.includes(d.id) === a.granted
          )
            return reject;
          patch = {
            documents: a.granted
              ? [...i.documents, d.id]
              : i.documents.filter((id) => id !== d.id),
          };
        }
      }
      next = {
        ...s,
        invitations: s.invitations.map((x) =>
          x.id === i.id ? { ...x, ...patch } : x,
        ),
      };
      break;
    }
    case "edition-draft":
      if (
        role !== "team" ||
        s.edition.status === "published" ||
        !validEditionSize(a.content)
      )
        return reject;
      return {
        ok: true,
        state: {
          ...s,
          editionDraft: copyEdition(a.content),
          reviewedEditionRevision: undefined,
        },
      };
    case "edition-review":
      if (
        role !== "team" ||
        s.edition.status !== "review" ||
        a.revision !== s.editionRevision ||
        editionDirty(s)
      )
        return reject;
      next = {
        ...s,
        reviewedEditionRevision: a.confirmed ? a.revision : undefined,
      };
      break;
    case "edition":
      if (
        role !== "team" ||
        s.edition.status === "published" ||
        !["draft", "review"].includes(a.edition.status) ||
        !validEditionSize(a.edition) ||
        (a.edition.status === "review" && !validEdition(a.edition))
      )
        return reject;
      next = {
        ...s,
        edition: { ...copyEdition(a.edition), status: a.edition.status },
        editionDraft: copyEdition(a.edition),
        editionRevision: s.editionRevision + 1,
        reviewedEditionRevision: undefined,
      };
      break;
    case "publish":
      if (
        role !== "team" ||
        s.edition.status !== "review" ||
        s.reviewedEditionRevision !== s.editionRevision ||
        editionDirty(s) ||
        !validEdition(s.edition)
      )
        return reject;
      next = { ...s, edition: { ...s.edition, status: "published" } };
      break;
    case "queue":
      if (
        role !== "team" ||
        s.edition.status !== "published" ||
        s.campaign.status !== "idle" ||
        !eligibleRecipients(s).length
      )
        return reject;
      next = {
        ...s,
        campaign: {
          status: "queued",
          recipients: eligibleRecipients(s),
          delivered: [],
        },
      };
      break;
    case "dispatch":
      if (role !== "team" || s.campaign.status !== "queued") return reject;
      next = {
        ...s,
        campaign: {
          ...s.campaign,
          status: "sent",
          delivered: s.campaign.recipients.filter((id) =>
            eligibleRecipients(s).includes(id),
          ),
        },
      };
      break;
  }
  return {
    ok: true,
    state: {
      ...next,
      audit: [...s.audit, createActivity(s, next, role, a)],
    },
  };
}

export const actorKey = (s: State, role: Role) =>
  `${role}:${role === "member" ? s.activeClient : role === "team" ? s.operatorId : s.partnerId}`;
export function messageDraft(s: State, role: Role, caseId: string) {
  return visibleCases(s, role).some((c) => c.id === caseId)
    ? s.drafts[actorKey(s, role)]?.[caseId] || ""
    : "";
}
export function messageAuthor(s: State, message: State["messages"][number]) {
  const id = message.author.slice(message.author.indexOf(":") + 1);
  return message.role === "member"
    ? (id === s.activeClient
        ? s.profile.name
        : s.accounts.find((a) => a.id === id)?.profile.name) || id
    : s.people.find((p) => p.id === id)?.name || id;
}
export function visibleDeliveryDocuments(
  s: State,
  role: Role,
  caseId: string,
  delivery: Delivery,
) {
  const allowed = visibleDocuments(s, role).filter((d) => d.caseId === caseId);
  return delivery.documents.filter((snapshot) =>
    allowed.some(
      (d) =>
        d.id === snapshot.id &&
        (role !== "partner" || d.version === snapshot.version),
    ),
  );
}

export function unreadMessages(s: State, role: Role, caseId?: string) {
  const ids = new Set(visibleCases(s, role).map((c) => c.id));
  return s.messages.filter(
    (m) =>
      ids.has(m.caseId) &&
      (!caseId || m.caseId === caseId) &&
      m.author !== actorKey(s, role) &&
      !m.readBy.includes(actorKey(s, role)),
  );
}
export type AttentionKind =
  | "messages"
  | "cancellation"
  | "approve"
  | "pay"
  | "payment-result"
  | "scope"
  | "start"
  | "deliver"
  | "review-delivery"
  | "close"
  | "provide"
  | "review-documents"
  | "correct-documents"
  | "tasks"
  | "return-originals"
  | "settlement-prepare"
  | "settlement-review"
  | "settlement-pay"
  | "settlement-refund";
export interface AttentionItem {
  caseId: string;
  kind: AttentionKind;
  count: number;
  target: "requests" | "documents" | "messages" | "settlements";
}
export function attentionItems(s: State, role: Role): AttentionItem[] {
  const result: AttentionItem[] = [];
  for (const c of visibleCases(s, role)) {
    const add = (
      kind: AttentionKind,
      count = 1,
      target: AttentionItem["target"] = "requests",
    ) => {
      if (count > 0) result.push({ caseId: c.id, kind, count, target });
    };
    add("messages", unreadMessages(s, role, c.id).length, "messages");
    if (role === "team" && isClosed(c))
      add(
        "return-originals",
        s.documents.filter((d) => d.caseId === c.id && d.custody === "received")
          .length,
        "documents",
      );
    if (
      isClosed(c) &&
      c.payment === "paid" &&
      canAccessView(s, role, "settlements")
    ) {
      const b = c.settlements.at(-1);
      if (
        role === "team" &&
        (!b || ["disputed", "superseded"].includes(b.status))
      )
        add("settlement-prepare", 1, "settlements");
      if (b?.status === "proposed" && role === "member")
        add("settlement-review", 1, "settlements");
      if (b && ["approved", "pending", "failed"].includes(b.status)) {
        const balance = settlementBalance(c, b);
        if (balance < 0 && role === "team")
          add("settlement-refund", 1, "settlements");
        if (balance > 0 && role === "member")
          add("settlement-pay", 1, "settlements");
      }
    }
    if (c.cancellation) {
      if (role === "team") add("cancellation");
      if (role === "member" && c.payment === "pending") add("payment-result");
      continue;
    }
    if (!canWork(c)) continue;
    const docs = visibleDocuments(s, role).filter((d) => d.caseId === c.id);
    if (role === "member") {
      if (c.stage === "quote") add("approve");
      if (c.stage === "approved" && c.payment !== "paid")
        add(c.payment === "pending" ? "payment-result" : "pay");
      if (c.stage === "delivered") add("review-delivery");
      add(
        "provide",
        s.requirements.filter(
          (r) =>
            r.caseId === c.id &&
            !s.documents.some((d) => d.requirement === r.id),
        ).length,
        "documents",
      );
    }
    if (role === "team") {
      if (["submitted", "review"].includes(c.stage)) add("scope");
      if (
        c.stage === "approved" &&
        c.payment === "paid" &&
        !missingRequirements(s, c.id).length
      )
        add("start");
      add(
        "review-documents",
        docs.filter((d) => d.review === "pending").length,
        "documents",
      );
    } else
      add(
        "correct-documents",
        docs.filter((d) => d.review === "rejected").length,
        "documents",
      );
    if (role !== "member") {
      const tasks = visibleTasks(s, role).filter(
        (task) =>
          task.caseId === c.id &&
          task.status !== "done" &&
          (role === "partner" ||
            task.assignee === "team" ||
            task.status === "blocked" ||
            !c.partner ||
            !s.partnerEnabled),
      );
      add("tasks", tasks.length);
      if (!openTasks(s, c.id).length && !missingRequirements(s, c.id).length) {
        if (c.stage === "inprogress") add("deliver");
        if (c.stage === "delivered" && role === "team") add("close");
      }
    }
  }
  return result;
}

export const familyActive = (s: State) =>
  s.subscription.active && s.subscription.plan === "Family";
export const familySlots = (s: State) =>
  s.invitations.filter((i) => ["pending", "active"].includes(i.status)).length;
// Deliberately project a small read-only view: no prices, internal notes, threads or other household data.
export function familyPreview(s: State, id: string) {
  const i = s.invitations.find((i) => i.id === id);
  const cases =
    familyActive(s) && i?.status === "active"
      ? visibleCases(s, "member").filter((c) => i.cases.includes(c.id))
      : [];
  return {
    cases: cases.map((c) => {
      const p = s.properties.find((p) => p.id === c.property);
      return {
        id: c.id,
        service: c.service,
        stage: c.stage,
        property: p ? { name: p.name, town: p.town } : undefined,
      };
    }),
    documents: s.documents
      .filter(
        (d) =>
          cases.some((c) => c.id === d.caseId) && i!.documents.includes(d.id),
      )
      .map((d) => ({
        id: d.id,
        caseId: d.caseId,
        name: d.name,
        version: d.version,
        review: d.review,
      })),
  };
}

export const settlementTotal = (b: Settlement) =>
  Math.round((b.coordination + b.official + b.thirdParty) * 100) / 100;
export const settlementBalance = (c: Case, b: Settlement) =>
  Math.round(
    (settlementTotal(b) - (c.payment === "paid" ? total(c) : 0)) * 100,
  ) / 100;
export const settlementLocked = (c: Case) =>
  ["approved", "pending", "failed", "settled"].includes(
    c.settlements.at(-1)?.status || "",
  );

export function transition(
  s: State,
  role: Role,
  a: Action,
): { state: State; ok: boolean; error?: [string, string] } {
  if (a.type === "request" && a.customer) {
    if (
      role !== "member" ||
      a.property ||
      !["EUR", "GBP", "CHF", "USD"].includes(a.customer.currency)
    )
      return {
        state: s,
        ok: false,
        error: [
          "Une nouvelle préparation doit être créée sans bien existant.",
          "Uma nova preparação deve ser criada sem imóvel existente.",
        ],
      };
    const created = applyTransition(s, role, {
      type: "client-create",
      name: a.customer.name,
      country: a.customer.country,
    });
    if (!created.ok)
      return {
        ...created,
        error: [
          "Renseignez le nom fictif et le pays.",
          "Preencha o nome fictício e o país.",
        ],
      };
    const next = applyTransition(
      {
        ...created.state,
        profile: { ...created.state.profile, currency: a.customer.currency },
      },
      role,
      { ...a, customer: undefined },
    );
    return next.ok
      ? next
      : { state: s, ok: false, error: failureReason(s, role, a) };
  }
  const person = s.people.find(
    (p) => p.id === (role === "team" ? s.operatorId : s.partnerId),
  );
  if (!canPerformAction(s, role, a))
    return {
      state: s,
      ok: false,
      error: [
        "Cette fonction est réservée à un autre rôle. Choisissez un profil autorisé dans le sélecteur de démonstration.",
        "Esta função está reservada a outra função. Escolha um perfil autorizado no seletor de demonstração.",
      ],
    };
  if (
    role === "team" &&
    a.type === "client-select" &&
    person?.kind === "operator" &&
    !visibleCases(s, role).some((c) => c.owner === a.id)
  )
    return {
      state: s,
      ok: false,
      error: [
        "Ce client n’a aucun dossier attribué à cet opérateur.",
        "Este cliente não tem pedidos atribuídos a este operador.",
      ],
    };
  const result = applyTransition(s, role, a);
  if (result.ok && a.type === "document-replace")
    result.state = {
      ...result.state,
      accounts: result.state.accounts.map((account) => ({
        ...account,
        invitations: account.invitations.map((i) => ({
          ...i,
          documents: i.documents.filter((id) => id !== a.id),
        })),
      })),
    };
  return result.ok ? result : { ...result, error: failureReason(s, role, a) };
}
