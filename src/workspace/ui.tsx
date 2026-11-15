import {
  createContext,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { services, type Lang } from "../catalogue";
import { visibleCases, type State, type Role, type Action } from "./model";
export type View =
  | "overview"
  | "requests"
  | "properties"
  | "documents"
  | "messages"
  | "billing"
  | "profile"
  | "newsletter"
  | "admin"
  | "tasks";
export type Context = {
  state: State;
  role: Role;
  lang: Lang;
  act: (a: Action) => boolean;
  go: (v: View, id?: string) => void;
  selected: string;
  select: (id: string) => void;
  t: (fr: string, pt: string) => string;
};
export const WorkspaceContext = createContext<Context>(null!);
export const useWorkspace = () => useContext(WorkspaceContext);
export const labels: Record<View, [string, string]> = {
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
  member: ["Adhérent", "Aderente"],
  team: ["Équipe", "Equipa"],
  partner: ["Partenaire", "Parceiro"],
};
export const icons: Record<View, string> = {
  tasks: "✓",
  overview: "◈",
  requests: "↗",
  properties: "⌂",
  documents: "▤",
  messages: "◌",
  billing: "€",
  profile: "◎",
  newsletter: "▥",
  admin: "⚙",
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
    new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "pt-PT", {
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
}: {
  children: ReactNode;
  onSave: (d: FormData) => boolean | void;
  className?: string;
}) {
  const { t } = useWorkspace();
  const [result, setResult] = useState<boolean | null>(null);
  return (
    <form
      className={`ws-form ${className}`}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const saved = onSave(new FormData(form));
        if (saved !== undefined) setResult(saved);
        if (saved === true) form.reset();
      }}
    >
      {children}
      {result !== null && (
        <p
          className={result ? "ws-local-success" : "ws-local-error"}
          role="status"
        >
          {result
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
}: {
  name?: string;
  current?: string;
}) {
  const { state, role, lang } = useWorkspace();
  return (
    <select name={name} defaultValue={current} required>
      {visibleCases(state, role).map((c) => (
        <option key={c.id} value={c.id}>
          {c.id} — {serviceName(c.service, lang)}
        </option>
      ))}
    </select>
  );
}
