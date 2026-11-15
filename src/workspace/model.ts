// In-memory design prototype. These checks demonstrate rules, not server authorization.
import { services } from "../catalogue";
export type Role = "member" | "team" | "partner";
export type Stage =
  | "submitted"
  | "review"
  | "quote"
  | "approved"
  | "inprogress"
  | "delivered"
  | "completed";
export type PaymentState = "unpaid" | "pending" | "failed" | "paid";
export interface Case {
  id: string;
  owner: string;
  service: string;
  property: string;
  description: string;
  stage: Stage;
  partner: boolean;
  quote: number;
  fees: number;
  thirdParty: number;
  payment: PaymentState;
  history: string[];
  notes: string[];
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
export interface State {
  tasks: Task[];
  requirements: Requirement[];
  partnerEnabled: boolean;
  archives: { edition: Edition; delivered: number }[];
  cases: Case[];
  properties: { id: string; name: string; town: string }[];
  documents: Document[];
  messages: { id: string; caseId: string; role: Role; body: string }[];
  subscription: {
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
    language: "fr" | "pt";
    consent: boolean;
  };
  edition: Edition;
  campaign: {
    status: "idle" | "queued" | "sent";
    recipients: string[];
    delivered: string[];
  };
  invitations: string[];
  audit: string[];
}
export const stages: Stage[] = [
  "submitted",
  "review",
  "quote",
  "approved",
  "inprogress",
  "delivered",
  "completed",
];
export const stageLabels: Record<Stage, [string, string]> = {
  submitted: ["Reçue", "Recebido"],
  review: ["À cadrer", "Em análise"],
  quote: ["Votre accord attendu", "A aguardar aprovação"],
  approved: ["Provision attendue", "A aguardar provisão"],
  inprogress: ["En cours", "Em curso"],
  delivered: ["Livrable à vérifier", "Entrega a verificar"],
  completed: ["Terminée", "Concluído"],
};
export const initialState = (): State => ({
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
      caseId: "DEMO-001",
      role: "team",
      body: "Exemple / Exemplo : nous préparons la visite ; merci de préciser les accès / estamos a preparar a visita; indique os acessos.",
    },
  ],
  subscription: {
    plan: "Member",
    period: "annual",
    cancelAtEnd: false,
    payment: "paid",
    active: true,
  },
  profile: {
    name: "Compte démo / Conta demo",
    country: "France",
    language: "fr",
    consent: true,
  },
  edition: {
    title: "Portugal — Tão longe e tão perto",
    sections: ["", "", "", ""],
    excerpt: "",
    status: "draft",
  },
  campaign: { status: "idle", recipients: [], delivered: [] },
  invitations: [],
  audit: [],
});
export function visibleCases(s: State, role: Role) {
  return s.cases.filter(
    (c) =>
      role === "team" ||
      (role === "partner" ? c.partner && s.partnerEnabled : c.owner === "demo"),
  );
}
export function visibleDocuments(s: State, role: Role) {
  const ids = new Set(visibleCases(s, role).map((c) => c.id));
  return s.documents.filter(
    (d) => ids.has(d.caseId) && (role !== "partner" || d.shared),
  );
}
export const eligibleRecipients = (s: State) =>
  s.profile.consent && s.subscription.active ? ["demo"] : [];
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
  lang: "fr" | "pt",
) {
  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return visibleCases(s, role).filter(
    (c) =>
      (stage === "all" || c.stage === stage) &&
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
  | { type: "request"; service: string; property: string; description: string }
  | { type: "stage"; id: string; stage: Stage }
  | {
      type: "quote";
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
  | { type: "publish" }
  | { type: "queue" }
  | { type: "dispatch" };
export function transition(
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
  switch (a.type) {
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
        !s.properties.some((p) => p.id === a.id) ||
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
        edition: {
          title: "Portugal — Tão longe e tão perto",
          sections: ["", "", "", ""],
          excerpt: "",
          status: "draft",
        },
        campaign: { status: "idle", recipients: [], delivered: [] },
      };
      break;
    case "request":
      if (
        role !== "member" ||
        !a.description.trim() ||
        !services.some((s) => s.id === a.service) ||
        (a.property && !s.properties.some((p) => p.id === a.property))
      )
        return reject;
      next = {
        ...s,
        cases: [
          ...s.cases,
          {
            id: `DEMO-${String(s.cases.length + 1).padStart(3, "0")}`,
            owner: "demo",
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
          },
        ],
      };
      break;
    case "stage": {
      if (!c) return reject;
      const allowed =
        role === "member"
          ? c.stage === "quote" && a.stage === "approved"
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
      next = update({ stage: a.stage, history: [...c.history, a.stage] });
      break;
    }
    case "quote":
      if (
        role !== "team" ||
        !c ||
        c.stage !== "review" ||
        ![a.quote, a.fees, a.thirdParty].every(money) ||
        a.quote <= 0
      )
        return reject;
      next = update({
        quote: a.quote,
        fees: a.fees,
        thirdParty: a.thirdParty,
        stage: "quote",
        history: [...c.history, "quote"],
      });
      break;
    case "assign":
      if (
        role !== "team" ||
        !c ||
        c.stage === "completed" ||
        (a.assigned && !s.partnerEnabled)
      )
        return reject;
      next = update({ partner: a.assigned });
      break;
    case "pay":
      if (
        role !== "member" ||
        !c ||
        c.stage !== "approved" ||
        c.payment === "paid" ||
        !(["pending", "failed", "paid"] as string[]).includes(a.result)
      )
        return reject;
      if (a.result !== "pending" && c.payment !== "pending") return reject;
      next = update({ payment: a.result });
      break;
    case "message":
    case "note":
      if (!c || !a.body.trim() || (a.type === "note" && role !== "team"))
        return reject;
      next =
        a.type === "note"
          ? update({ notes: [...c.notes, a.body.trim()] })
          : {
              ...s,
              messages: [
                ...s.messages,
                {
                  id: `message-${s.messages.length + 1}`,
                  caseId: c.id,
                  role,
                  body: a.body.trim(),
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
    case "subscription":
      if (
        role !== "member" ||
        a.plan === "Premium" ||
        s.subscription.payment === "pending"
      )
        return reject;
      // Existing entitlement stays active until the simulated payment succeeds.
      next = {
        ...s,
        subscription: {
          ...s.subscription,
          pending: { plan: a.plan, period: a.period },
          payment: "pending",
        },
      };
      break;
    case "subscription-payment":
      if (
        role !== "member" ||
        s.subscription.payment !== "pending" ||
        !["paid", "failed"].includes(a.result)
      )
        return reject;
      next = {
        ...s,
        subscription: {
          ...s.subscription,
          ...(a.result === "paid" ? s.subscription.pending : {}),
          pending: undefined,
          payment: a.result,
          active: s.subscription.active || a.result === "paid",
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
      next = { ...s, profile: { ...a.profile, name: a.profile.name.trim() } };
      break;
    case "invite":
      if (
        role !== "member" ||
        s.subscription.plan !== "Family" ||
        s.subscription.payment !== "paid" ||
        s.invitations.length >= 3 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) ||
        s.invitations.includes(a.email.toLowerCase())
      )
        return reject;
      next = { ...s, invitations: [...s.invitations, a.email.toLowerCase()] };
      break;
    case "edition":
      if (
        role !== "team" ||
        s.edition.status === "published" ||
        a.edition.status === "published" ||
        (a.edition.status === "review" && !validEdition(a.edition))
      )
        return reject;
      next = { ...s, edition: a.edition };
      break;
    case "publish":
      if (
        role !== "team" ||
        s.edition.status !== "review" ||
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
      audit: [
        ...s.audit,
        `${s.audit.length + 1}. ${role} / ${a.type}${"id" in a ? " / " + a.id : ""}`,
      ],
    },
  };
}
