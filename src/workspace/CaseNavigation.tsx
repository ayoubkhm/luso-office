import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Case, Role } from "./model";
import { useWorkspace } from "./ui";

export type CaseSectionName = "progress" | "proposal" | "decisions" | "team";
const sectionLabels: Record<CaseSectionName, [string, string]> = {
  progress: ["Suivi de la mission", "Acompanhamento"],
  proposal: ["Proposition et provision", "Proposta e provisão"],
  decisions: ["Décisions et suites", "Decisões e próximos passos"],
  team: ["Travail de l’équipe", "Trabalho da equipa"],
};
export function availableCaseSections(role: Role): CaseSectionName[] {
  if (role === "partner") return ["progress"];
  return role === "team"
    ? ["progress", "proposal", "decisions", "team"]
    : ["progress", "proposal", "decisions"];
}
export function initialCaseSection(c: Case, role: Role): CaseSectionName {
  if (role === "partner") return "progress";
  // Resolve an already pending payment before an annulment can be confirmed.
  if (role === "member" && c.stage === "approved" && c.payment === "pending")
    return "proposal";
  if (c.cancellation || ["cancelled", "completed"].includes(c.stage))
    return "decisions";
  if (
    ["review", "quote"].includes(c.stage) ||
    (role === "member" && c.stage === "approved")
  )
    return "proposal";
  if (role === "member" && c.stage === "delivered") return "decisions";
  return "progress";
}

export function useCaseNavigation(c: Case, role: Role) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const context = `${c.id}:${role}:${c.stage}:${Boolean(c.cancellation)}:${Boolean(c.cancellation && c.payment === "pending")}`;
  const [selection, setSelection] = useState<{
    context: string;
    section: CaseSectionName;
  }>();
  const sections = availableCaseSections(role);
  const active =
    selection?.context === context && sections.includes(selection.section)
      ? selection.section
      : initialCaseSection(c, role);
  const tabId = (section: CaseSectionName) => `${id}-${section}-tab`;
  const panelId = (section: CaseSectionName) => `${id}-${section}-panel`;
  const focus = (section: CaseSectionName) =>
    document.getElementById(tabId(section))?.focus();
  const open = (section: CaseSectionName) => {
    if (!sections.includes(section)) return;
    setSelection({ context, section });
    requestAnimationFrame(() => focus(section));
  };
  // A stage change may hide the submitted form: keep keyboard focus in the file.
  useEffect(() => {
    if (root.current?.contains(document.activeElement)) focus(active);
  }, [context]);
  return { root, sections, active, open, tabId, panelId };
}
type Navigation = ReturnType<typeof useCaseNavigation>;

export function CaseNavigation({ navigation: n }: { navigation: Navigation }) {
  const { t } = useWorkspace();
  return (
    <div
      className="ws-case-tabs"
      role="tablist"
      aria-label={t("Rubriques du dossier", "Áreas do pedido")}
    >
      {n.sections.map((section, index) => (
        <button
          key={section}
          type="button"
          role="tab"
          id={n.tabId(section)}
          aria-controls={n.panelId(section)}
          aria-selected={n.active === section}
          tabIndex={n.active === section ? 0 : -1}
          onClick={() => n.open(section)}
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % n.sections.length
                : event.key === "ArrowLeft"
                  ? (index + n.sections.length - 1) % n.sections.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? n.sections.length - 1
                      : undefined;
            if (next !== undefined) {
              event.preventDefault();
              n.open(n.sections[next]);
            }
          }}
        >
          {t(...sectionLabels[section])}
        </button>
      ))}
    </div>
  );
}

export function CaseSection({
  navigation: n,
  name,
  children,
}: {
  navigation: Navigation;
  name: CaseSectionName;
  children: ReactNode;
}) {
  if (!n.sections.includes(name)) return null;
  // Keep inactive forms mounted so switching tabs cannot erase unsaved input.
  return (
    <section
      className="ws-case-section"
      role="tabpanel"
      id={n.panelId(name)}
      aria-labelledby={n.tabId(name)}
      hidden={n.active !== name}
      tabIndex={0}
    >
      {children}
    </section>
  );
}
