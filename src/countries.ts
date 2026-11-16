import type { Lang } from "./locales";

// Stable values shared by the public preparation, handoff and client profile.
export const countries = [
  { code: "FR", labels: ["France", "França", "France", "Frankreich"] },
  { code: "PT", labels: ["Portugal", "Portugal", "Portugal", "Portugal"] },
  { code: "DE", labels: ["Allemagne", "Alemanha", "Germany", "Deutschland"] },
  { code: "CH", labels: ["Suisse", "Suíça", "Switzerland", "Schweiz"] },
  {
    code: "GB",
    labels: [
      "Royaume-Uni",
      "Reino Unido",
      "United Kingdom",
      "Vereinigtes Königreich",
    ],
  },
  {
    code: "US",
    labels: [
      "États-Unis",
      "Estados Unidos",
      "United States",
      "Vereinigte Staaten",
    ],
  },
  { code: "BE", labels: ["Belgique", "Bélgica", "Belgium", "Belgien"] },
  {
    code: "LU",
    labels: ["Luxembourg", "Luxemburgo", "Luxembourg", "Luxemburg"],
  },
  { code: "CA", labels: ["Canada", "Canadá", "Canada", "Kanada"] },
  {
    code: "OTHER",
    labels: ["Autre pays", "Outro país", "Other country", "Anderes Land"],
  },
] as const;
const normalize = (value: string) =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const aliases: Record<string, string> = {
  uk: "GB",
  usa: "US",
  "belgique / belgie": "BE",
  "schweiz / suisse": "CH",
  "autre / outro": "OTHER",
};
export function countryCode(value: string): string {
  const key = normalize(value);
  return (
    aliases[key] ||
    countries.find(
      (c) =>
        normalize(c.code) === key ||
        c.labels.some((label) => normalize(label) === key),
    )?.code ||
    value.trim()
  );
}
export function countryLabel(value: string, lang: Lang): string {
  const country = countries.find((c) => c.code === countryCode(value));
  return country
    ? country.labels[({ fr: 0, pt: 1, en: 2, de: 3 } as const)[lang]]
    : value;
}
