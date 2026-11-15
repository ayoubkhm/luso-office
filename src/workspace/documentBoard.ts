import { services, type Lang } from "../catalogue";
import {
  visibleDocuments,
  type State,
  type Role,
  type Document,
} from "./model";

export const documentReviewLabels: Record<
  Document["review"],
  [string, string]
> = {
  accepted: ["Version vérifiée", "Versão verificada"],
  pending: ["Vérification attendue", "A aguardar verificação"],
  rejected: ["Correction demandée", "Correção solicitada"],
};
export type DocumentFilters = {
  query?: string;
  caseId?: string;
  review?: string;
  custody?: string;
  sharing?: string;
};
export function matchingDocuments(
  state: State,
  role: Role,
  filters: DocumentFilters,
  lang: Lang,
) {
  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  return visibleDocuments(state, role).filter((doc) => {
    const c = state.cases.find((c) => c.id === doc.caseId)!;
    return (
      (!filters.caseId ||
        filters.caseId === "all" ||
        doc.caseId === filters.caseId) &&
      (!filters.review ||
        filters.review === "all" ||
        doc.review === filters.review) &&
      (!filters.custody ||
        filters.custody === "all" ||
        doc.custody === filters.custody) &&
      (!filters.sharing ||
        filters.sharing === "all" ||
        (filters.sharing === "shared" ? doc.shared : !doc.shared)) &&
      norm(
        [
          doc.name,
          doc.caseId,
          services.find((s) => s.id === c.service)?.name[lang],
          state.properties.find((p) => p.id === c.property)?.name,
          state.requirements.find((r) => r.id === doc.requirement)?.label,
        ].join(" "),
      ).includes(norm(filters.query ?? ""))
    );
  });
}
