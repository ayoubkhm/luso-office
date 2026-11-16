import { publicCopy } from "./publicCopy";
import type { Currency } from "./MarketChoice";
import { aboutCopy } from "./aboutCopy";
import { countryLabel } from "./countries";
import { translate, languages, languageNames } from "./locales";
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
      languages.find(
        (l) => l !== "fr" && (path === `/${l}` || path.startsWith(`/${l}/`)),
      ) ||
      languages.find((l) => l === new URLSearchParams(search).get("lang")) ||
      "fr",
  };
}
export const href = (page: Page, lang: Lang, search = "") =>
  `${lang === "fr" ? "/" : `/${lang}/`}${files[page]}${search}`;
const baseTitles = {
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
export const titles = Object.fromEntries(
  Object.entries(baseTitles).map(([page, text]) => [
    page,
    Object.fromEntries(
      languages.map((lang) => [lang, translate(text.fr, text.pt, lang)]),
    ),
  ]),
) as Record<Page, Record<Lang, string>>;
const baseDescriptions = {
  fr: "Un relais au Portugal pour la diaspora : maison, documents, famille, retour et projets professionnels. Découvrez les services et le principe de l’adhésion.",
  pt: "Um apoio em Portugal para a diáspora: casa, documentos, família, regresso e projetos profissionais. Conheça os serviços e o princípio da adesão.",
};
export const descriptions = Object.fromEntries(
  languages.map((lang) => [
    lang,
    translate(baseDescriptions.fr, baseDescriptions.pt, lang),
  ]),
) as Record<Lang, string>;
export const pageDescription = (page: Page, lang: Lang) => {
  const copy = publicCopy[lang];
  return {
    home: copy.metaHome,
    services: copy.metaServices,
    membership: copy.metaMembership,
    business: copy.metaBusiness,
    journal: copy.metaJournal,
    about: aboutCopy[lang].metaDescription,
    workspace: descriptions[lang],
  }[page];
};
export function languageHref(
  page: Page,
  lang: Lang,
  search: string,
  hash = "",
) {
  const params = new URLSearchParams(search);
  params.delete("lang");
  return href(page, lang, (params.size ? "?" + params.toString() : "") + hash);
}

export interface RequestDraft {
  name: string;
  email: string;
  country: string;
  subject: string;
  message: string;
  currency?: Currency;
  period?: "monthly" | "annual";
}
export function requestText(d: RequestDraft, lang: Lang) {
  const fr = lang === "fr";
  return [
    "LusoOffice",
    translate(
      "Préparation de mon échange",
      "Preparação da minha conversa",
      lang,
    ),
    "",
    `${translate("Nom", "Nome", lang)} : ${d.name}`,
    `E-mail : ${d.email || "—"}`,
    `${translate("Pays de résidence", "País de residência", lang)} : ${countryLabel(d.country, lang) || "—"}`,
    `${translate("Sujet", "Assunto", lang)} : ${d.subject}`,
    ...(d.period
      ? [
          `${publicCopy[lang].periodLabel} : ${d.period === "annual" ? translate("Annuelle", "Anual", lang) : translate("Mensuelle", "Mensal", lang)}`,
        ]
      : []),
    ...(d.currency
      ? [`${publicCopy[lang].currencyLabel} : ${d.currency}`]
      : []),
    "",
    d.message,
    "",
    translate(
      "Aucune demande n’a été envoyée. Conservez ce document pour votre premier échange. Coordonnées de contact : TBD.",
      "Nenhum pedido foi enviado. Guarde este documento para a primeira conversa. Contactos: TBD.",
      lang,
    ),
  ].join("\n");
}
