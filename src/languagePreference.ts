import { localPath } from "./sitePath";
import { languages, type Lang } from "./locales";
import { files, languageHref, route } from "./routes";

export const languageStorageKey = "lusooffice.language";
const supported = (value: unknown): value is Lang =>
  languages.includes(value as Lang);

export function readLanguagePreference(): Lang | null {
  try {
    const value = window.localStorage.getItem(languageStorageKey);
    return supported(value) ? value : null;
  } catch {
    return null;
  }
}

export function rememberLanguage(lang: Lang): void {
  try {
    window.localStorage.setItem(languageStorageKey, lang);
  } catch {
    // Explicit language URLs still preserve the choice without storage.
  }
}

export function preferredLanguage(
  saved: unknown,
  browserLanguages: readonly string[],
): Lang {
  if (supported(saved)) return saved;
  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split("-")[0];
    if (supported(base)) return base;
  }
  return "pt";
}

export function entryLanguageRedirect(
  path: string,
  search: string,
  hash: string,
  saved: unknown,
  browserLanguages: readonly string[],
): string | null {
  path = localPath(path);
  // A language-specific link always wins over local/browser preferences.
  if (languages.some((lang) => path === `/${lang}` || path.startsWith(`/${lang}/`)))
    return null;
  // Only neutral public entry points negotiate language. The internal workshop
  // and unknown paths keep their own routing behavior.
  const publicPaths = Object.entries(files)
    .filter(([page]) => page !== "workspace")
    .map(([, file]) => `/${file}`);
  if (!["/", "/tarifs.html", ...publicPaths].includes(path)) return null;
  const queryLanguage = new URLSearchParams(search).get("lang");
  const lang = supported(queryLanguage)
    ? queryLanguage
    : preferredLanguage(saved, browserLanguages);
  return languageHref(route(path).page, lang, search, hash);
}
