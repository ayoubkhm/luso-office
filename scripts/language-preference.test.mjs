import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import {
  preferredLanguage, entryLanguageRedirect, readLanguagePreference,
  rememberLanguage, languageStorageKey, route, href, files,
} from "../.ssr/entry-server.js";

test("Language negotiation respects manual choice, ordered browser languages, regional tags and Portuguese fallback", () => {
  assert.equal(preferredLanguage("de", ["fr-FR", "pt-PT"]), "de");
  assert.equal(preferredLanguage(null, ["es-ES", "fr-CA", "en-US"]), "fr");
  assert.equal(preferredLanguage(null, ["pt-BR", "en-US"]), "pt");
  assert.equal(preferredLanguage(null, ["EN-gb", "de-DE"]), "en");
  assert.equal(preferredLanguage(null, ["de-CH"]), "de");
  assert.equal(preferredLanguage("invalid", ["ja-JP"]), "pt");
  assert.equal(preferredLanguage(null, []), "pt");
});

test("Neutral entry redirects preserve destination, query and fragment without redirect loops", () => {
  for (const [page, file] of Object.entries(files)) {
    if (page === "workspace") continue;
    const result = entryLanguageRedirect(`/${file}`, "?area=maison&q=ação", "#details", "fr", ["en"]);
    const url = new URL(result, "https://lusooffice.com");
    assert.equal(url.pathname, href(page, "fr"));
    assert.equal(url.searchParams.get("q"), "ação");
    assert.equal(url.searchParams.get("area"), "maison");
    assert.equal(url.hash, "#details");
    assert.equal(entryLanguageRedirect(url.pathname, url.search, url.hash, "fr", ["en"]), null);
  }
  assert.equal(entryLanguageRedirect("/", "", "", null, []), "/pt/index.html");
  assert.equal(entryLanguageRedirect("/tarifs.html", "?lang=en&currency=EUR", "#plans", "fr", ["pt"]), "/en/adhesion.html?currency=EUR#plans");
  assert.equal(entryLanguageRedirect("/services.html", "?lang=invalid", "", "de", ["en"]), "/de/services.html");
});

test("Explicit links take priority without rewriting the stored preference; internal and unknown routes are excluded", () => {
  for (const lang of ["fr", "pt", "en", "de"]) {
    for (const path of [`/${lang}`, `/${lang}/`, `/${lang}/services.html`]) {
      assert.equal(entryLanguageRedirect(path, "?lang=en", "", "de", ["pt"]), null);
      assert.equal(route(path, "?lang=en").lang, lang);
    }
  }
  for (const path of ["/espace.html", "/missing.html", "/other/services.html"])
    assert.equal(entryLanguageRedirect(path, "", "", "en", ["pt"]), null);
});

test("Language preference persists independently and blocked storage does not prevent navigation", () => {
  const dom = new JSDOM("", { url: "https://lusooffice.com" });
  globalThis.window = dom.window;
  try {
    assert.equal(readLanguagePreference(), null);
    rememberLanguage("en");
    assert.equal(readLanguagePreference(), "en");
    entryLanguageRedirect("/pt/index.html", "", "", readLanguagePreference(), ["pt"]);
    assert.equal(readLanguagePreference(), "en");
    window.localStorage.setItem(languageStorageKey, "unknown");
    assert.equal(readLanguagePreference(), null);
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } });
    assert.equal(readLanguagePreference(), null);
    assert.doesNotThrow(() => rememberLanguage("fr"));
    assert.equal(entryLanguageRedirect("/", "", "", readLanguagePreference(), ["en-US"]), "/en/index.html");
  } finally {
    dom.window.close();
    delete globalThis.window;
  }
});

test("Neutral public HTML defaults to Portuguese; explicit pages and metadata use their own locale", async () => {
  for (const [page, file] of Object.entries(files)) {
    if (page === "workspace") continue;
    const neutral = new JSDOM(await readFile(`dist/${file}`, "utf8")).window.document;
    assert.equal(neutral.documentElement.lang, "pt");
    assert.equal(neutral.querySelector('link[rel="canonical"]').href, `https://lusooffice.com/pt/${file}`);
    for (const lang of ["fr", "pt", "en", "de"]) {
      const d = new JSDOM(await readFile(`dist/${lang}/${file}`, "utf8")).window.document;
      assert.equal(d.documentElement.lang, lang);
      assert.equal(d.querySelector('link[rel="canonical"]').href, `https://lusooffice.com/${lang}/${file}`);
      assert.equal(d.querySelector('link[hreflang="x-default"]').href, `https://lusooffice.com/${file}`);
      assert.equal(new URL(d.querySelector('.language-switch a[aria-current="true"]').href, "https://lusooffice.com").pathname, href(page, lang));
    }
  }
});
