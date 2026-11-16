import one from "./translations-1.json";
import two from "./translations-2.json";
import three from "./translations-3.json";
import extra from "./translations-extra.json";
export type Lang = "fr" | "pt" | "en" | "de";
export const languages: Lang[] = ["fr", "pt", "en", "de"];
export const languageNames: Record<Lang, string> = {
  fr: "Français",
  pt: "Português",
  en: "English",
  de: "Deutsch",
};
export const translations: Record<string, string[]> = {
  ...one,
  ...two,
  ...three,
  ...extra,
};
export function translate(fr: string, pt: string, lang: Lang): string {
  if (lang === "fr") return fr;
  if (lang === "pt") return pt;
  return translations[fr]?.[lang === "en" ? 0 : 1] ?? fr;
}
