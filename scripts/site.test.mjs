import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access, stat } from "node:fs/promises";
import {
  areas,
  services,
  plans,
  filterServices,
  price,
  pageNames,
  href,
  route,
  requestText,
} from "../.ssr/entry-server.js";

test("Catalogue matches the five areas and 28-service source, without duplicate records", () => {
  assert.deepEqual(
    areas.map((a) => services.filter((s) => s.area === a.id).length),
    [8, 6, 5, 5, 4],
  );
  assert.equal(services.length, 28);
  assert.equal(new Set(services.map((s) => s.id)).size, 28);
  for (const s of services) {
    for (const key of ["name", "description", "result", "limits", "unit"])
      for (const lang of ["fr", "pt"])
        assert.ok(s[key][lang]?.trim(), `${s.id}: ${key}.${lang}`);
    assert.ok(s.prices.every((p) => p === null || p > 0));
  }
  assert.deepEqual(
    services.find((s) => s.id === "maison-inoccupee").prices,
    [59, 39],
  );
  assert.deepEqual(
    services.find((s) => s.id === "accompagnement-presentiel").prices,
    [45, 32],
  );
  assert.deepEqual(
    plans.map((p) => [p.id, p.monthly, p.annual]),
    [
      ["Member", 29.9, 299],
      ["Family", 49.9, 499],
      ["Premium", 99.9, 999],
    ],
  );
});
test("Search handles accents, category combinations and zero results", () => {
  assert.ok(
    filterServices("all", "herite", "fr").some(
      (s) => s.id === "visite-bien-herite",
    ),
  );
  assert.ok(
    filterServices("all", "sucessoria", "pt").some(
      (s) => s.id === "dossier-succession",
    ),
  );
  assert.equal(filterServices("maison", "", "fr").length, 8);
  assert.equal(filterServices("retour", "inventaire", "fr").length, 0);
  assert.equal(filterServices("all", "aucun-resultat-xyz", "fr").length, 0);
  assert.equal(filterServices("business", "Portugal", "pt").length, 4);
});
test("Prices preserve hourly, from-price and quotation semantics", () => {
  const byId = (id) => services.find((s) => s.id === id);
  assert.match(price(byId("suivi-travaux"), true, "fr"), /^Dès 110/);
  assert.match(price(byId("aide-administrative"), false, "pt"), /45.*\/ h$/);
  assert.equal(price(byId("suivi-projet"), false, "fr"), "Sur devis");
});
test("Both languages and historical routes resolve consistently", () => {
  for (const lang of ["fr", "pt"])
    for (const page of pageNames)
      assert.deepEqual(route(href(page, lang)), { page, lang });
  assert.deepEqual(route("/tarifs.html", "?lang=pt"), {
    page: "membership",
    lang: "pt",
  });
  assert.deepEqual(route("/pt/"), { page: "home", lang: "pt" });
});
test("Local summary explicitly describes no transmission and preserves user content", () => {
  const draft = {
    name: "Teste",
    email: "",
    country: "",
    subject: "Family",
    message: "Ação & famille\nDeuxième ligne",
  };
  for (const lang of ["fr", "pt"]) {
    const output = requestText(draft, lang);
    assert.ok(output.includes(draft.message));
    assert.ok(output.includes("Family"));
    assert.ok(!output.includes("TBD"));
    assert.ok(output.includes("E-mail : —"));
    assert.match(
      output,
      lang === "fr"
        ? /Aucune demande n’a été envoyée/
        : /Nenhum pedido foi enviado/,
    );
  }
});
test("14 pre-rendered pages have localized content, valid links, unique IDs and no indexing", async () => {
  let inspected = 0;
  for (const lang of ["fr", "pt"])
    for (const page of pageNames) {
      const url = href(page, lang),
        html = await readFile("dist" + url, "utf8");
      inspected++;
      assert.ok(html.includes(`<html lang="${lang}">`));
      assert.equal((html.match(/<h1\b/g) || []).length, 1, url);
      assert.ok(html.includes("noindex, nofollow"));
      assert.ok(!html.includes("<!--page-content-->"));
      assert.ok(
        html.includes(lang === "fr" ? "Confidentialité" : "Privacidade"),
      );
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, url);
      for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        const ref = match[1].replaceAll("&amp;", "&"),
          parsed = new URL(ref, "https://preview.local" + url);
        if (parsed.origin !== "https://preview.local") continue;
        await access("dist" + parsed.pathname);
        if (parsed.hash) {
          const target = await readFile("dist" + parsed.pathname, "utf8");
          assert.ok(target.includes(`id="${parsed.hash.slice(1)}"`), ref);
        }
      }
      if (page === "services")
        assert.equal((html.match(/class="service-row"/g) || []).length, 28);
    }
  assert.equal(inspected, 14);
});
test("Optimized images stay below the agreed payload budget", async () => {
  for (const size of [640, 960, 1536])
    assert.ok((await stat(`dist/assets/azulejos-${size}.webp`)).size < 200000);
});
