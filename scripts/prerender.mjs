import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  pageNames,
  files,
  titles,
  pageDescription,
  href,
  render,
} from "../.ssr/entry-server.js";
const template = await readFile("dist/index.html", "utf8");
const manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const workspaceStyles = manifest["src/workspace/Workspace.tsx"].css || [];
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const lang of ["fr", "pt", "en", "de"]) {
  await mkdir(`dist/${lang}`, { recursive: true });
  for (const page of pageNames) {
    const canonical = "https://lusooffice.com" + href(page, lang);
    const meta = `<meta name="description" content="${esc(pageDescription(page, lang))}"/><link rel="canonical" href="${canonical}"/><link rel="alternate" hreflang="fr" href="https://lusooffice.com${href(page, "fr")}"/><link rel="alternate" hreflang="pt" href="https://lusooffice.com${href(page, "pt")}"/><link rel="alternate" hreflang="en" href="https://lusooffice.com${href(page, "en")}"/><link rel="alternate" hreflang="de" href="https://lusooffice.com${href(page, "de")}"/><link rel="alternate" hreflang="x-default" href="https://lusooffice.com${"/" + files[page]}"/><meta property="og:site_name" content="LusoOffice"/><meta property="og:title" content="${esc(titles[page][lang])}"/><meta property="og:description" content="${esc(pageDescription(page, lang))}"/><meta property="og:type" content="website"/><meta property="og:locale" content="${{ fr: "fr_FR", pt: "pt_PT", en: "en_GB", de: "de_DE" }[lang]}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary"/>`;
    const content = template
      .replace('<html lang="fr">', `<html lang="${lang}">`)
      .replace(
        /<title>.*?<\/title>/,
        `<title>${esc(titles[page][lang])}</title>`,
      )
      .replace(
        "<!--page-meta-->",
        meta +
          (page === "workspace"
            ? workspaceStyles
                .map((file) => `<link rel="stylesheet" href="/${file}">`)
                .join("")
            : ""),
      )
      .replace("<!--page-content-->", render(page, lang));
    await writeFile("dist" + href(page, lang), content);
    if (lang === "pt" && page !== "workspace")
      await writeFile("dist/" + files[page], content);
  }
}
for (const lang of [null, "fr", "pt", "en", "de"]) {
  const prefix = lang ? `/${lang}/` : "/";
  await writeFile(
    `dist${prefix}tarifs.html`,
    `<!doctype html><html lang="${lang || "pt"}"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=adhesion.html"><title>LusoOffice</title></head><body><a href="adhesion.html">${{ fr: "Découvrir l’adhésion", pt: "Conhecer a adesão", en: "Explore membership", de: "Mitgliedschaft entdecken" }[lang || "pt"]}</a><script>location.replace('adhesion.html'+location.search+location.hash);</script></body></html>`,
  );
}
console.log("Prerendered 28 localized pages, 6 neutral Portuguese entry pages and 5 legacy redirects.");
