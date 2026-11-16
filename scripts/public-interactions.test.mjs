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
const { App, readHandoff, languageHref, requestText, filterServices } =
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

test("Resuming a plan keeps the edited period, including undecided, while a new preparation follows the selected card", async () => {
  for (const lang of ["fr", "pt", "en", "de"]) {
    const ui = await mount("membership", lang);
    await ui.click(".plan button");
    fill("name", "Audit");
    fill("message", "My draft");
    await choose('[name="period"]', "monthly");
    await ui.click(".modal-close");
    await ui.click(".plan button");
    assert.equal(document.querySelector('[name="period"]').value, "monthly");
    assert.ok(document.querySelector(".draft-resumed"));
    await choose('[name="period"]', "");
    await ui.click(".modal-close");
    await ui.click(".plan button");
    assert.equal(document.querySelector('[name="period"]').value, "");
    assert.equal(document.querySelector('[name="message"]').value, "My draft");
    await ui.click('[data-request-action="new"]');
    assert.equal(document.querySelector('[name="period"]').value, "annual");
    assert.equal(document.querySelector('[name="message"]').value, "");
    assert.equal(
      document.querySelector('[name="subject"]').value,
      "plan-Member",
    );
    await ui.close();
  }
});

test("An explicit Member CTA requires a choice before restoring a Family draft and preserves that draft when the choice is dismissed", async () => {
  for (const action of ["resume", "new"]) {
    const ui = await mount("membership");
    await ui.click(".plan button");
    fill("name", "Audit");
    fill("message", "Family needs");
    await choose('[name="subject"]', "plan-Family");
    await choose('[name="period"]', "monthly");
    await ui.click(".modal-close");
    await ui.click(".plan button");
    assert.equal(document.querySelector(".modal form"), null);
    assert.match(
      document.querySelector('[data-request-action="new"]').textContent,
      /Member/,
    );
    await ui.click(".modal-close");
    await ui.click(".plan button");
    await ui.click(`[data-request-action="${action}"]`);
    assert.equal(
      document.querySelector('[name="subject"]').value,
      action === "resume" ? "plan-Family" : "plan-Member",
    );
    assert.equal(
      document.querySelector('[name="message"]').value,
      action === "resume" ? "Family needs" : "",
    );
    assert.equal(
      document.querySelector('[name="period"]').value,
      action === "resume" ? "monthly" : "annual",
    );
    await ui.close();
  }
});

test("Search returns the same services after switching language, including accented and mixed-language searches", async () => {
  for (const query of [
    "maison",
    "casa",
    "house",
    "Haus",
    "hérité",
    "casa house",
  ]) {
    const expected = filterServices("all", query, "fr").map((s) => s.id);
    assert.ok(expected.length > 0, query);
    for (const lang of ["fr", "pt", "en", "de"]) {
      assert.deepEqual(
        filterServices("all", query, lang).map((s) => s.id),
        expected,
      );
      const ui = await mount(
        "services",
        lang,
        `?q=${encodeURIComponent(query)}`,
      );
      assert.deepEqual(
        [...document.querySelectorAll(".service-row")].map((e) => e.id),
        expected,
      );
      assert.equal(
        new URL(
          document.querySelector('.language-switch a[lang="de"]').href,
        ).searchParams.get("q"),
        query,
      );
      await ui.close();
    }
  }
  assert.ok(
    filterServices("maison", "house", "de").every((s) => s.area === "maison"),
  );
  assert.equal(filterServices("all", "no-such-service-xyz", "en").length, 0);
});

test("Business includes incentives and internationalisation in all four languages, linked to an existing scoping service", async () => {
  for (const lang of ["fr", "pt", "en", "de"]) {
    const prefix = lang === "fr" ? "" : lang + "/";
    const d = new JSDOM(await readFile(`dist/${prefix}business.html`, "utf8"))
      .window.document;
    const topics = [...d.querySelectorAll(".business-paths article")];
    assert.equal(topics.length, 9);
    for (const topic of topics.slice(-2)) {
      assert.ok(topic.querySelector("p").textContent.length > 100);
      assert.equal(
        topic.querySelector("a").getAttribute("href"),
        "#business-entretien",
      );
      assert.ok(d.querySelector("#business-entretien"));
    }
  }
});

test("The preview and actual download retain contact details, currency and every membership period, while a service has no membership period", async () => {
  const expected = {
    fr: {
      country: "Suisse",
      values: ["À définir ensemble", "Mensuelle", "Annuelle"],
    },
    pt: {
      country: "Suíça",
      values: ["A definir em conjunto", "Mensal", "Anual"],
    },
    en: {
      country: "Switzerland",
      values: ["To discuss together", "Monthly", "Annual"],
    },
    de: {
      country: "Schweiz",
      values: ["Gemeinsam zu klären", "Monatlich", "Jährlich"],
    },
  };
  for (const lang of ["fr", "pt", "en", "de"]) {
    const ui = await mount("membership", lang);
    const originalCreate = URL.createObjectURL,
      originalRevoke = URL.revokeObjectURL;
    let downloaded;
    URL.createObjectURL = (blob) => {
      downloaded = blob;
      return "blob:summary-audit";
    };
    URL.revokeObjectURL = () => {};
    ui.dom.window.HTMLAnchorElement.prototype.click = function () {};
    try {
      await ui.click(".plan button");
      fill("name", "Audit Example");
      fill("email", "audit@example.com");
      fill("message", "First line\nSecond line");
      await choose('[name="country"]', "CH");
      for (const [index, period] of ["", "monthly", "annual"].entries()) {
        await choose('[name="period"]', period);
        await ui.submit();
        await choose(".market-choice select", "CHF");
        const preview = document.querySelector(".request-summary");
        const values = [...preview.querySelectorAll("dd")].map(
          (e) => e.textContent,
        );
        for (const value of [
          "Audit Example",
          "audit@example.com",
          expected[lang].country,
          "CHF",
          "First line\nSecond line",
          expected[lang].values[index],
        ])
          assert.ok(
            values.includes(value),
            `${lang}: preview contains ${value}`,
          );
        // Download through the real UI, independently of its translated label.
        const downloadButton = document.querySelector(
          ".market-choice + button",
        );
        await ui.click(downloadButton);
        const text = await downloaded.text();
        for (const value of values)
          assert.ok(text.includes(value), `${lang}: export contains ${value}`);
        await ui.click(".modal button.text-link.full");
      }
      await choose('[name="subject"]', "visite-rapport");
      await choose('[name="country"]', "");
      fill("email", "");
      await ui.submit();
      const preview = document.querySelector(".request-summary");
      // Switching to a service must remove the membership period from both outputs.
      const textBeforeDownload = preview.textContent;
      assert.ok(
        !expected[lang].values.some((v) => textBeforeDownload.includes(v)),
      );
      assert.equal(
        [...preview.querySelectorAll("dd")].filter((e) => e.textContent === "—")
          .length,
        2,
      );
      await ui.click(".market-choice + button");
      const serviceText = await downloaded.text();
      assert.ok(serviceText.includes("E-mail : —"));
      assert.ok(!expected[lang].values.some((v) => serviceText.includes(v)));
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      await ui.close();
    }
  }
});

test("Insurance is presented as a future topic through an authorised partner in all public languages, without adding a priced service", async () => {
  const terms = {
    fr: ["assurances", "partenaire habilité", "aucune offre"],
    pt: ["seguros", "parceiro habilitado", "não está disponível"],
    en: ["Insurance", "authorised partner", "no insurance offer"],
    de: ["Versicherungen", "zugelassenen Partner", "kein Versicherungsangebot"],
  };
  for (const lang of ["fr", "pt", "en", "de"]) {
    const prefix = lang === "fr" ? "" : lang + "/";
    const d = new JSDOM(await readFile(`dist/${prefix}services.html`, "utf8"))
      .window.document;
    const future = d.querySelector(".future-topics").textContent;
    for (const term of terms[lang])
      assert.ok(future.includes(term), `${lang}: ${term}`);
    assert.equal(d.querySelectorAll(".service-row").length, 28);
  }
});
