import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { siteBase, localPath, href, route, entryLanguageRedirect } from "../.ssr/entry-server.js";

assert.equal(siteBase, "/luso-office/");
const origin = "https://ayoubkhm.github.io";
const names = await readdir("dist", { recursive: true });
let checked = 0;
async function checkReference(ref, from) {
  const url = new URL(ref, from);
  if (url.origin !== origin) return;
  assert.ok(url.pathname.startsWith(siteBase), `URL outside Luso Office: ${url}`);
  const file = "dist" + localPath(url.pathname);
  await access(file.endsWith("/") ? file + "index.html" : file);
  if (url.hash && url.pathname.endsWith(".html")) {
    const target = new JSDOM(await readFile(file, "utf8")).window.document;
    assert.ok(target.getElementById(decodeURIComponent(url.hash.slice(1))), `Missing anchor ${url}`);
  }
  checked++;
}
for (const name of names.filter((name) => name.endsWith(".html"))) {
  const from = `${origin}${siteBase}${name}`;
  const doc = new JSDOM(await readFile(`dist/${name}`, "utf8")).window.document;
  assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
  for (const element of doc.querySelectorAll("[href], [src]"))
    await checkReference(element.getAttribute("href") || element.getAttribute("src"), from);
  for (const image of doc.querySelectorAll("[srcset]"))
    for (const candidate of image.getAttribute("srcset").split(","))
      await checkReference(candidate.trim().split(/\s+/)[0], from);
}
for (const name of names.filter((name) => name.endsWith(".css"))) {
  const css = await readFile(`dist/${name}`, "utf8");
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g))
    await checkReference(match[1], `${origin}${siteBase}${name}`);
}
for (const lang of ["fr", "pt", "en", "de"]) {
  const path = href("services", lang);
  assert.equal(path, `${siteBase}${lang}/services.html`);
  assert.deepEqual(route(path), { page: "services", lang });
  assert.equal(entryLanguageRedirect(path, "", "", "fr", ["en-US"]), null);
  const redirected = entryLanguageRedirect(`${siteBase}services.html`, "?area=maison", "#visite-rapport", lang, ["en-US"]);
  assert.equal(redirected, `${path}?area=maison#visite-rapport`);
}
assert.equal(entryLanguageRedirect(siteBase, "", "", null, ["en-US"]), `${siteBase}en/index.html`);
assert.equal(entryLanguageRedirect(siteBase, "", "", null, ["es-ES"]), `${siteBase}pt/index.html`);
assert.equal(route(`${siteBase}pt/espace.html`).lang, "pt");
console.log(`GitHub Pages verified: ${checked} internal references, four languages and automatic language redirects.`);
