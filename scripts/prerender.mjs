import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  pageNames,
  files,
  titles,
  descriptions,
  href,
  render,
} from "../.ssr/entry-server.js";
const template = await readFile("dist/index.html", "utf8");
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const lang of ["fr", "pt"]) {
  if (lang === "pt") await mkdir("dist/pt", { recursive: true });
  for (const page of pageNames) {
    const canonical = "https://lusooffice.com" + href(page, lang);
    const meta = `<meta name="description" content="${esc(descriptions[lang])}"/><link rel="canonical" href="${canonical}"/><link rel="alternate" hreflang="fr" href="https://lusooffice.com${href(page, "fr")}"/><link rel="alternate" hreflang="pt" href="https://lusooffice.com${href(page, "pt")}"/><link rel="alternate" hreflang="x-default" href="https://lusooffice.com${href(page, "fr")}"/><meta property="og:site_name" content="LusoOffice"/><meta property="og:title" content="${esc(titles[page][lang])}"/><meta property="og:description" content="${esc(descriptions[lang])}"/><meta property="og:type" content="website"/><meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "pt_PT"}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary"/>`;
    const content = template
      .replace('<html lang="fr">', `<html lang="${lang}">`)
      .replace(
        /<title>.*?<\/title>/,
        `<title>${esc(titles[page][lang])}</title>`,
      )
      .replace("<!--page-meta-->", meta)
      .replace("<!--page-content-->", render(page, lang));
    await writeFile("dist" + href(page, lang), content);
  }
  const prefix = lang === "pt" ? "/pt/" : "/";
  await writeFile(
    `dist${prefix}tarifs.html`,
    `<!doctype html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=adhesion.html"><title>LusoOffice</title></head><body><a href="adhesion.html">${lang === "fr" ? "Découvrir l’adhésion" : "Conhecer a adesão"}</a><script>const p=new URLSearchParams(location.search);const lang=location.pathname.startsWith('/pt/')||p.get('lang')==='pt';p.delete('lang');location.replace((lang?'/pt/':'/')+'adhesion.html'+(p.size?'?'+p:'')+location.hash);</script></body></html>`,
  );
}
console.log("Prerendered 14 FR/PT pages and 2 legacy redirects.");
