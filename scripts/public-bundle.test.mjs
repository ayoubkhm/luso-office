import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Public pages do not eagerly load the workspace script or stylesheet, and workspace HTML remains prerendered", async () => {
  const manifest = JSON.parse(
    await readFile("dist/.vite/manifest.json", "utf8"),
  );
  const entry = Object.keys(manifest).find((key) => manifest[key].isEntry);
  const eager = new Set();
  function visit(key) {
    if (eager.has(key)) return;
    eager.add(key);
    for (const dependency of manifest[key].imports || []) visit(dependency);
  }
  visit(entry);
  const workspace = Object.keys(manifest).find((key) =>
    key.endsWith("/Workspace.tsx"),
  );
  assert.ok(workspace, "Workspace has its own output chunk");
  assert.equal(eager.has(workspace), false);
  assert.ok(manifest[entry].dynamicImports.includes(workspace));
  const eagerCss = [...eager].flatMap((key) => manifest[key].css || []);
  for (const css of manifest[workspace].css || [])
    assert.equal(eagerCss.includes(css), false);
  assert.ok(
    manifest[workspace].css?.length,
    "Workspace styles are loaded with its script",
  );
  for (const prefix of ["", "pt/", "en/", "de/"]) {
    const html = await readFile(`dist/${prefix}espace.html`, "utf8");
    for (const css of manifest[workspace].css) {
      assert.ok(
        html.includes(`href="/${css}"`),
        "Workspace prerendering includes its own styles",
      );
      const publicHtml = await readFile(`dist/${prefix}index.html`, "utf8");
      assert.equal(publicHtml.includes(`href="/${css}"`), false);
    }
    assert.ok(
      html.includes("ws-sidebar"),
      "The workspace remains available to prerendering",
    );
  }
});
