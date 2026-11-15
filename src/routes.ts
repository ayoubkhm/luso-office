import type { Lang } from "./catalogue";
export const pageNames = [
  "home",
  "services",
  "membership",
  "business",
  "about",
  "journal",
  "workspace",
] as const;
export type Page = (typeof pageNames)[number];
export const files: Record<Page, string> = {
  home: "index.html",
  services: "services.html",
  membership: "adhesion.html",
  business: "business.html",
  about: "a-propos.html",
  journal: "journal.html",
  workspace: "espace.html",
};
export function route(path: string, search = ""): { page: Page; lang: Lang } {
  const file = path.split("/").filter(Boolean).at(-1) || "index.html";
  const page =
    file === "tarifs.html"
      ? "membership"
      : pageNames.find((p) => files[p] === file) || "home";
  return {
    page,
    lang:
      path.startsWith("/pt") || new URLSearchParams(search).get("lang") === "pt"
        ? "pt"
        : "fr",
  };
}
export const href = (page: Page, lang: Lang, search = "") =>
  `${lang === "pt" ? "/pt/" : "/"}${files[page]}${search}`;
export const titles: Record<Page, Record<Lang, string>> = {
  workspace: {
    fr: "O meu Portugal — Maquette LusoOffice",
    pt: "O meu Portugal — Protótipo LusoOffice",
  },
  home: {
    fr: "LusoOffice — Vos liens au Portugal",
    pt: "LusoOffice — Os seus laços com Portugal",
  },
  services: { fr: "Les services — LusoOffice", pt: "Os serviços — LusoOffice" },
  membership: { fr: "L’adhésion — LusoOffice", pt: "A adesão — LusoOffice" },
  business: {
    fr: "Business Portugal — LusoOffice",
    pt: "Business Portugal — LusoOffice",
  },
  about: {
    fr: "Notre histoire et contact — LusoOffice",
    pt: "A nossa história e contactos — LusoOffice",
  },
  journal: {
    fr: "Portugal — Tão longe e tão perto | LusoOffice",
    pt: "Portugal — Tão longe e tão perto | LusoOffice",
  },
};
export const descriptions = {
  fr: "Un relais au Portugal pour la diaspora : maison, documents, famille, retour et projets professionnels. Découvrez les services et le principe de l’adhésion.",
  pt: "Um apoio em Portugal para a diáspora: casa, documentos, família, regresso e projetos profissionais. Conheça os serviços e o princípio da adesão.",
};
export interface RequestDraft {
  name: string;
  email: string;
  country: string;
  subject: string;
  message: string;
}
export function requestText(d: RequestDraft, lang: Lang) {
  const fr = lang === "fr";
  return [
    "LusoOffice",
    fr ? "Préparation de mon échange" : "Preparação da minha conversa",
    "",
    `${fr ? "Nom" : "Nome"} : ${d.name}`,
    `E-mail : ${d.email || "—"}`,
    `${fr ? "Pays de résidence" : "País de residência"} : ${d.country || "—"}`,
    `${fr ? "Sujet" : "Assunto"} : ${d.subject}`,
    "",
    d.message,
    "",
    fr
      ? "Aucune demande n’a été envoyée. Conservez ce document pour votre premier échange. Coordonnées de contact : TBD."
      : "Nenhum pedido foi enviado. Guarde este documento para a primeira conversa. Contactos: TBD.",
  ].join("\n");
}
