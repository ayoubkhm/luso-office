import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

// DOM interaction regressions; these do not replace real-browser visual QA.
function globals(win) {
  for (const key of [
    "window",
    "document",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLTextAreaElement",
    "HTMLSelectElement",
    "HTMLDialogElement",
    "FormData",
    "Event",
    "MouseEvent",
    "location",
    "history",
    "sessionStorage",
    "localStorage",
  ])
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "window" ? win : win[key],
    });
  globalThis.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
  globalThis.requestAnimationFrame = win.requestAnimationFrame.bind(win);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  win.HTMLElement.prototype.scrollTo = function () {};
  win.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  win.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
}
const boot = new JSDOM("<div/>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
globals(boot.window);
const { createElement, act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { App, readHandoff, languageHref, requestText } =
  await import("../.ssr/entry-server.js");
const settle = () => new Promise((r) => setTimeout(r, 20));
async function mount(page = "home", lang = "fr", suffix = "") {
  const filename = {
    home: "index",
    services: "services",
    membership: "adhesion",
    business: "business",
    journal: "journal",
  }[page];
  const dom = new JSDOM('<div id="root"></div>', {
    url: `http://localhost/${lang === "fr" ? "" : lang + "/"}${filename}.html${suffix}`,
    pretendToBeVisual: true,
  });
  globals(dom.window);
  const root = createRoot(document.getElementById("root"));
  await act(async () => {
    root.render(createElement(App, { page, lang, search: location.search }));
    await settle();
  });
  const click = async (selector) => {
    const node =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
    assert.ok(node, selector);
    await act(async () => {
      node.click();
      await settle();
    });
  };
  const submit = async () =>
    act(async () => {
      document
        .querySelector(".modal form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      await settle();
    });
  return {
    dom,
    click,
    submit,
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}
async function choose(selector, value) {
  const node = document.querySelector(selector);
  assert.ok(node, selector);
  await act(async () => {
    node.value = value;
    node.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
  });
}
const fill = (name, value) => {
  document.querySelector(`[name="${name}"]`).value = value;
};

test("Closing the public form by button, Escape or backdrop retains the draft and keeps unrelated preparations separate", async () => {
  const ui = await mount();
  await ui.click(".contact-link");
  fill("name", "Exemple conservé");
  fill("email", "test@example.com");
  fill("message", "Texte en cours");
  await choose('[name="country"]', "PT");
  await choose('[name="subject"]', "ouverture-maison");
  await ui.click(".modal-close");
  await ui.click(".contact-link");
  for (const [name, value] of Object.entries({
    name: "Exemple conservé",
    email: "test@example.com",
    message: "Texte en cours",
    country: "PT",
    subject: "ouverture-maison",
  }))
    assert.equal(document.querySelector(`[name="${name}"]`).value, value);
  await act(async () => {
    document
      .querySelector("dialog")
      .dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
    await settle();
  });
  assert.equal(document.querySelector("dialog"), null);
  await ui.click(".contact-link");
  assert.equal(
    document.querySelector('[name="message"]').value,
    "Texte en cours",
  );
  await act(async () => {
    document
      .querySelector("dialog")
      .dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: -5, clientY: -5 }),
      );
    await settle();
  });
  await ui.click(".contact-link");
  assert.equal(
    document.querySelector('[name="message"]').value,
    "Texte en cours",
  );
  assert.equal(
    localStorage.length,
    0,
    "No persistent storage of personal draft data",
  );
  await ui.close();
});

test("Monthly intent, edited period and currency survive summary, download and reopening", async () => {
  const ui = await mount("membership");
  await ui.click(".plan-period button");
  await ui.click(".plan button");
  assert.equal(document.querySelector('[name="period"]').value, "monthly");
  fill("name", "Test");
  fill("message", "Les avantages du plan");
  await ui.submit();
  assert.match(
    document.querySelector(".request-summary").textContent,
    /Mensuelle/,
  );
  await choose(".market-choice select", "GBP");
  let downloaded;
  const originalCreate = URL.createObjectURL,
    originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = (blob) => {
    downloaded = blob;
    return "blob:example";
  };
  URL.revokeObjectURL = () => {};
  ui.dom.window.HTMLAnchorElement.prototype.click = function () {};
  try {
    const download = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Télécharger le récapitulatif"),
    );
    await ui.click(download);
    const text = await downloaded.text();
    assert.match(text, /Mensuelle/);
    assert.match(text, /GBP/);
    assert.match(text, /sans conversion/);
    await ui.click(".modal-close");
    await ui.click(".plan button");
    assert.equal(
      document.querySelector('[name="message"]').value,
      "Les avantages du plan",
    );
    await choose('[name="period"]', "annual");
    await ui.submit();
    assert.match(
      document.querySelector(".request-summary").textContent,
      /Annuelle/,
    );
    assert.equal(document.querySelector(".market-choice select").value, "GBP");
    await ui.click(".modal-close");
    // A new plan keeps its own draft rather than silently reusing another plan's situation.
    await ui.click(document.querySelectorAll(".plan button")[1]);
    assert.equal(
      document.querySelector('[name="subject"]').value,
      "plan-Family",
    );
    assert.equal(document.querySelector('[name="message"]').value, "");
  } finally {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    await ui.close();
  }
});

test("Public and handoff text limits agree, and oversized pasted input is rejected before producing a summary", async () => {
  const ui = await mount("services");
  await ui.click(".service-row .button");
  const message = document.querySelector('[name="message"]');
  assert.equal(message.maxLength, 2000);
  fill("name", "Test");
  fill("message", "x".repeat(2001));
  await ui.submit();
  assert.ok(document.querySelector(".modal form"));
  assert.match(message.validationMessage, /2 000/);
  fill("message", "x".repeat(2000));
  message.dispatchEvent(new Event("input", { bubbles: true }));
  await ui.submit();
  assert.equal(document.querySelector(".modal form"), null);
  const payload = {
    version: 1,
    service: "visite-rapport",
    name: "Test",
    country: "PT",
    description: "x".repeat(2000),
    currency: "EUR",
  };
  assert.equal(readHandoff(JSON.stringify(payload)).description.length, 2000);
  assert.equal(
    readHandoff(JSON.stringify({ ...payload, description: "x".repeat(2001) })),
    null,
  );
  await ui.close();
});

test("Each public locale uses its own result count and language links preserve live filters and section anchors", async () => {
  for (const [lang, word] of [
    ["fr", "services trouvés"],
    ["pt", "serviços encontrados"],
    ["en", "services found"],
    ["de", "Leistungen gefunden"],
  ]) {
    const ui = await mount("services", lang, "?area=maison#visite-rapport");
    assert.equal(
      document.querySelector(".result-count").textContent.trim(),
      `8 ${word}`,
    );
    assert.equal(
      document.getElementById("visite-rapport").open,
      true,
      "A direct service link opens its detail",
    );
    const en = document.querySelector('.language-switch a[lang="en"]');
    assert.equal(new URL(en.href).hash, "#visite-rapport");
    assert.equal(new URL(en.href).searchParams.get("area"), "maison");
    await act(async () => {
      location.hash = "#ouverture-maison";
      await settle();
    });
    assert.equal(document.getElementById("ouverture-maison").open, true);
    assert.equal(new URL(en.href).hash, "#ouverture-maison");
    await ui.click(document.querySelector(".filters button"));
    assert.equal(new URL(en.href).searchParams.has("area"), false);
    assert.equal(new URL(en.href).hash, "#ouverture-maison");
    assert.equal(
      languageHref(
        "services",
        "de",
        "?lang=fr&area=maison&q=visite",
        "#visite-rapport",
      ),
      "/de/services.html?area=maison&q=visite#visite-rapport",
    );
    await ui.close();
  }
});

test("Page metadata is distinct in all languages and partnership preparation is attached to the cultural invitation", async () => {
  for (const lang of ["fr", "pt", "en", "de"]) {
    const prefix = lang === "fr" ? "" : lang + "/";
    const descriptions = [];
    for (const file of [
      "index",
      "services",
      "adhesion",
      "business",
      "journal",
    ]) {
      const d = new JSDOM(await readFile(`dist/${prefix}${file}.html`, "utf8"))
        .window.document;
      descriptions.push(d.querySelector('meta[name="description"]').content);
      assert.equal(
        d.querySelector('meta[property="og:description"]').content,
        descriptions.at(-1),
      );
    }
    assert.equal(new Set(descriptions).size, 5);
    const summary = requestText(
      {
        name: "Test",
        email: "",
        country: "PT",
        subject: "Family",
        message: "Example",
        period: "annual",
        currency: "CHF",
      },
      lang,
    );
    assert.match(summary, /CHF/);
  }
  const ui = await mount("journal");
  assert.match(
    document.querySelector(".sample-label").textContent,
    /non publié/,
  );
  assert.equal(
    document.querySelector(".journal-sample article > div").lang,
    "pt",
  );
  await ui.click(".cultural-layout .button");
  assert.equal(document.querySelector('[name="subject"]').value, "partnership");
  await ui.close();
});
