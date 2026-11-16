import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
// This is a DOM unit test, not a real-browser layout or keyboard validation.
const boot = new JSDOM("<div/>", {
  url: "http://localhost/espace.html",
  pretendToBeVisual: true,
});
function globals(win) {
  for (const key of [
    "window",
    "document",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLTextAreaElement",
    "HTMLSelectElement",
    "FormData",
    "Event",
    "MouseEvent",
    "PopStateEvent",
    "location",
    "history",
    "localStorage",
    "sessionStorage",
  ])
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "window" ? win : win[key],
    });
  globalThis.requestAnimationFrame = win.requestAnimationFrame.bind(win);
  globalThis.cancelAnimationFrame = win.cancelAnimationFrame.bind(win);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}
globals(boot.window);
const { createElement, act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { Workspace } = await import("../.ssr/entry-server.js");
const key = "lusooffice-demo-session-v2";
const settle = () => new Promise((r) => setTimeout(r, 25));
async function mount({ hash = "", saved, prepared, lang = "fr" } = {}) {
  const dom = new JSDOM('<div id="root"></div>', {
    url: `http://localhost/${lang === "fr" ? "" : lang + "/"}espace.html${hash}`,
    pretendToBeVisual: true,
  });
  globals(dom.window);
  if (saved) localStorage.setItem(key, saved);
  if (prepared)
    sessionStorage.setItem("lusooffice-demo-request", JSON.stringify(prepared));
  const root = createRoot(document.getElementById("root"));
  await act(async () => {
    root.render(createElement(Workspace, { lang }));
    await settle();
  });
  const click = async (text, scope = document) => {
    const button = [...scope.querySelectorAll("button")].find(
      (b) => b.textContent.replace(/\s+/g, " ").trim() === text,
    );
    assert.ok(button, `Button: ${text}`);
    await act(async () => {
      button.click();
      await settle();
    });
  };
  const submit = async (form) => {
    assert.ok(form);
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await settle();
    });
  };
  return {
    dom,
    root,
    click,
    submit,
    close: async () => {
      await act(async () => root.unmount());
      dom.window.close();
    },
  };
}

test("A catalogue preparation opens a prefilled form, creates the customer and case, saves and restores them only after explicit choice", async () => {
  let ui = await mount({
    hash: "#view=requests&role=member",
    prepared: {
      version: 1,
      service: "maison-inoccupee",
      description: "Visit before arrival",
      name: "Demo traveller",
      country: "UK",
      currency: "GBP",
    },
  });
  assert.equal(
    document.querySelector('textarea[name="description"]').value,
    "Visit before arrival",
  );
  assert.equal(
    document.querySelector('select[name="service"]').value,
    "maison-inoccupee",
  );
  assert.equal(localStorage.getItem(key), null);
  await ui.submit(document.querySelector('textarea[name="description"]').form);
  assert.match(
    document.querySelector(".ws-case-detail").textContent,
    /Visit before arrival/,
  );
  assert.equal(sessionStorage.getItem("lusooffice-demo-request"), null);
  await ui.click("Sauvegarder mes exemples sur cet appareil");
  const saved = localStorage.getItem(key);
  assert.ok(saved);
  assert.match(saved, /Demo traveller/);
  await ui.close();
  ui = await mount({ hash: "#view=requests&role=member&case=DEMO-003", saved });
  assert.doesNotMatch(
    document.querySelector(".ws-case-detail").textContent,
    /Visit before arrival/,
  );
  await ui.click("Reprendre la session sauvegardée");
  assert.match(
    document.querySelector(".ws-case-detail").textContent,
    /Visit before arrival/,
  );
  assert.equal(
    document.querySelector(".ws-case-list button.selected small").textContent,
    "DEMO-003",
  );
  await ui.click("Désactiver et effacer la sauvegarde");
  assert.equal(localStorage.getItem(key), null);
  await ui.close();
});

test("Case shortcuts preserve a typed internal note, and browser Back restores the preceding view", async () => {
  const ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-001&section=team",
  });
  let confirmations = 0;
  window.confirm = () => {
    confirmations++;
    return false;
  };
  const form = [...document.querySelectorAll("textarea")].find(
    (x) => x.name === "note",
  );
  assert.ok(form);
  form.value = "Unsaved internal note";
  await ui.click("Suivi de la mission");
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("section"),
    "progress",
  );
  await ui.click("Travail de l’équipe");
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Unsaved internal note",
  );
  assert.equal(
    confirmations,
    0,
    "Tabs keep the mounted form without prompting",
  );
  const original = location.href;
  await ui.click("Documents", document.querySelector(".ws-subnavigation"));
  assert.equal(confirmations, 1);
  assert.equal(location.href, original);
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Unsaved internal note",
  );
  window.confirm = () => true;
  await ui.click("Documents", document.querySelector(".ws-subnavigation"));
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "documents",
  );
  await act(async () => {
    history.back();
    await settle();
  });
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "requests",
  );
  assert.match(
    document.querySelector('button[role="tab"][aria-selected="true"]')
      .textContent,
    /Travail de l’équipe/,
  );
  await ui.close();
});

test("All four languages retain the current route on language switch and expose a compact primary menu", async () => {
  const ui = await mount({ hash: "#view=requests&role=member&case=DEMO-002" });
  assert.ok(document.querySelectorAll(".ws-sidebar nav button").length <= 5);
  await ui.click("EN", document.querySelector(".ws-language"));
  assert.equal(document.documentElement.lang, "en");
  assert.equal(location.pathname, "/en/espace.html");
  assert.match(document.querySelector("h1").textContent, /Requests|Cases/);
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("case"),
    "DEMO-002",
  );
  await ui.click("DE", document.querySelector(".ws-language"));
  assert.equal(document.documentElement.lang, "de");
  assert.equal(location.pathname, "/de/espace.html");
  assert.match(
    document.querySelector("h1").textContent,
    /Anfragen|Vorgänge|Anträge/,
  );
  await ui.close();
});

test("Cancelled Back preserves both the original history entry and unsaved form; accepted Back and Forward restore language", async () => {
  const ui = await mount({ hash: "#view=overview&role=team" });
  await ui.click("↗Dossiers", document.querySelector(".ws-sidebar"));
  await ui.click("Travail de l’équipe");
  const note = document.querySelector('textarea[name="note"]');
  note.value = "Keep this internal note";
  let confirmations = 0;
  window.confirm = () => {
    confirmations++;
    return false;
  };
  await act(async () => {
    history.back();
    await settle();
  });
  assert.equal(confirmations, 0, "Same-case tabs do not discard the form");
  const original = location.href;
  await act(async () => {
    history.back();
    await settle();
    await settle();
  });
  assert.equal(confirmations, 1);
  assert.equal(location.href, original);
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Keep this internal note",
  );
  await ui.click("EN", document.querySelector(".ws-language"));
  assert.equal(document.documentElement.lang, "en");
  await act(async () => {
    history.back();
    await settle();
    await settle();
  });
  assert.equal(location.pathname, "/en/espace.html");
  assert.equal(document.documentElement.lang, "en");
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Keep this internal note",
  );
  window.confirm = () => true;
  await act(async () => {
    history.back();
    await settle();
  });
  assert.equal(location.pathname, "/espace.html");
  assert.equal(document.documentElement.lang, "fr");
  assert.match(
    document.querySelector("h1").textContent,
    /À chaque dossier, sa prochaine étape/,
  );
  assert.match(document.title, /Maquette/);
  await act(async () => {
    history.forward();
    await settle();
  });
  assert.equal(location.pathname, "/en/espace.html");
  assert.equal(document.documentElement.lang, "en");
  assert.match(document.querySelector("h1").textContent, /Requests|Cases/);
  assert.equal(document.querySelector('textarea[name="note"]').value, "");
  await ui.close();
});

test("Dirty forms also protect role, actor and case switches, while successful submission clears the guard", async () => {
  const ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-001&section=team",
  });
  const note = document.querySelector('textarea[name="note"]');
  note.value = "Save before switching";
  let confirmations = 0;
  window.confirm = () => {
    confirmations++;
    return false;
  };
  const change = async (select, value) => {
    assert.ok(select);
    await act(async () => {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await settle();
    });
  };
  const role = document.querySelector(".ws-sidebar select");
  await change(role, "partner");
  assert.equal(role.value, "team");
  const actor = [...document.querySelectorAll("label")]
    .find((x) => x.textContent.includes("Intervenant de démonstration"))
    .querySelector("select");
  await change(actor, "operator-2");
  assert.equal(actor.value, "operator-1");
  const second = [...document.querySelectorAll(".ws-case-list button")].find(
    (x) => x.textContent.includes("DEMO-002"),
  );
  await act(async () => {
    second.click();
    await settle();
  });
  assert.equal(confirmations, 3);
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Save before switching",
  );
  await ui.submit(note.form);
  await ui.click("Documents", document.querySelector(".ws-subnavigation"));
  assert.equal(confirmations, 3, "Saved values do not trigger another prompt");
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "documents",
  );
  await ui.close();
});

test("Restoring an operator session or opening a financial URL cannot open the restricted screen", async () => {
  const saved = JSON.stringify({
    version: 2,
    base: null,
    events: [
      {
        role: "team",
        action: {
          type: "staff-assign",
          id: "DEMO-001",
          operatorId: "operator-2",
          partnerId: "partner-1",
        },
      },
      { role: "team", action: { type: "actor-select", id: "operator-2" } },
    ],
  });
  const ui = await mount({ hash: "#view=settlements&role=team", saved });
  await ui.click("Reprendre la session sauvegardée");
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "overview",
  );
  assert.equal(document.querySelector(".ws-settlement-layout"), null);
  await act(async () => {
    history.pushState({}, "", "#view=settlements&role=team");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await settle();
  });
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "overview",
  );
  assert.equal(document.querySelector(".ws-settlement-layout"), null);
  await ui.close();
});
