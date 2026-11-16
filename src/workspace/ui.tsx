import { hasFormBaseline, rememberForm } from "./navigation";
import { translate, languages, languageNames } from "../locales";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  type FormEvent,
  type ReactNode,
} from "react";
import { services, type Lang } from "../catalogue";
import type { CaseDestination, CaseIntent } from "./caseRouting";
import {
  canWork,
  visibleCases,
  type State,
  type Role,
  type Action,
} from "./model";
import type { View } from "./permissions";
export { viewsForRole, type View } from "./permissions";
export type Context = {
  state: State;
  role: Role;
  lang: Lang;
  act: (a: Action) => boolean;
  go: (v: View, id?: string, destination?: CaseDestination) => boolean | void;
  caseIntent?: CaseIntent;
  error?: string;
  selected: string;
  select: (id: string) => void;
  t: (fr: string, pt: string) => string;
};
export const WorkspaceContext = createContext<Context>(null!);
export const useWorkspace = () => useContext(WorkspaceContext);
export const labels: Record<View, [string, string]> = {
  settlements: ["Bilans des dossiers", "Balanços dos pedidos"],
  guide: ["Parcours guidés", "Percursos guiados"],
  tasks: ["Tâches et échéances", "Tarefas e prazos"],
  overview: ["Vue d’ensemble", "Visão geral"],
  requests: ["Demandes", "Pedidos"],
  properties: ["Mes biens", "Os meus imóveis"],
  documents: ["Documents", "Documentos"],
  messages: ["Messages", "Mensagens"],
  billing: ["Adhésion et paiements", "Adesão e pagamentos"],
  profile: ["Mon compte", "A minha conta"],
  newsletter: ["Le journal", "O jornal"],
  admin: ["Administration", "Administração"],
};
export const roleNames: Record<Role, [string, string]> = {
  member: ["Adhérent / client", "Aderente / cliente"],
  team: ["Équipe", "Equipa"],
  partner: ["Partenaire", "Parceiro"],
};
export function Button({
  children,
  onClick,
  type = "button",
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      className={`ws-button ${secondary ? "ws-secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="ws-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ws-panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Badge({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <span className={`ws-badge ${good ? "ws-good" : ""}`}>{children}</span>
  );
}
export function useMoney() {
  const { lang } = useWorkspace();
  return (n: number) =>
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: "EUR",
    }).format(n);
}
export function serviceName(id: string, lang: Lang) {
  return services.find((s) => s.id === id)?.name[lang] || id;
}
export function Form({
  children,
  onSave,
  className = "",
  preservesDraft = false,
}: {
  children: ReactNode;
  onSave: (d: FormData) => boolean | void;
  className?: string;
  preservesDraft?: boolean;
}) {
  const { t, error } = useWorkspace();
  const [result, setResult] = useState<boolean | null>(null);
  const ref = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  useLayoutEffect(() => {
    if (
      ref.current &&
      (!hasFormBaseline(ref.current) || submitted.current || preservesDraft)
    ) {
      rememberForm(ref.current);
      submitted.current = false;
    }
  });
  return (
    <form
      ref={ref}
      className={`ws-form ${className}`}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const saved = onSave(new FormData(form));
        if (saved !== undefined) setResult(saved);
        if (saved === true) {
          form.reset();
          rememberForm(form);
          submitted.current = true;
        }
      }}
    >
      {children}
      {result !== null && (
        <p
          className={result ? "ws-local-success" : "ws-local-error"}
          role="status"
        >
          {!result && error
            ? error
            : result
              ? t("Enregistré dans la démo.", "Guardado na demo.")
              : t(
                  "Action non enregistrée. Vérifiez les champs et l’étape du dossier.",
                  "Ação não guardada. Verifique os campos e a etapa do pedido.",
                )}
        </p>
      )}
    </form>
  );
}
export const value = (d: FormData, k: string) => String(d.get(k) || "").trim();
export function CaseSelect({
  name = "case",
  current,
  activeOnly = false,
}: {
  name?: string;
  current?: string;
  activeOnly?: boolean;
}) {
  const { state, role, lang } = useWorkspace();
  return (
    <select name={name} defaultValue={current} required>
      {visibleCases(state, role)
        .filter((c) => !activeOnly || canWork(c))
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.id} — {serviceName(c.service, lang)}
          </option>
        ))}
    </select>
  );
}

export function navigationGroups(views: View[]) {
  const groups: { title: [string, string]; views: View[] }[] = [
    {
      title: ["Dossiers", "Pedidos"],
      views: [
        "overview",
        "requests",
        "tasks",
        "documents",
        "messages",
        "properties",
      ],
    },
    {
      title: ["Compte et adhésion", "Conta e adesão"],
      views: ["billing", "settlements", "profile"],
    },
    { title: ["Le journal", "O jornal"], views: ["newsletter"] },
    { title: ["Administration", "Administração"], views: ["admin"] },
  ];
  return groups
    .map((g) => ({ ...g, views: g.views.filter((v) => views.includes(v)) }))
    .filter((g) => g.views.length);
}
