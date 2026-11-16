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
const { Workspace, restoreSession } = await import("../.ssr/entry-server.js");
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
  await ui.click("Documents", document.querySelector(".ws-navigation"));
  assert.equal(confirmations, 1);
  assert.equal(location.href, original);
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Unsaved internal note",
  );
  window.confirm = () => true;
  await ui.click("Documents", document.querySelector(".ws-navigation"));
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

test("All four languages retain the current route and expose direct workspace destinations", async () => {
  const ui = await mount({ hash: "#view=requests&role=member&case=DEMO-002" });
  assert.equal(document.querySelector(".ws-sidebar select"), null);
  for (const destination of [
    "Demandes",
    "Documents",
    "Messages",
    "Mes biens",
    "Mon compte",
  ]) {
    assert.ok(
      [...document.querySelectorAll(".ws-navigation button")].some((button) =>
        button.textContent.startsWith(destination),
      ),
      destination,
    );
  }
  assert.equal(document.querySelector(".ws-subnavigation"), null);
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
  await ui.click("Demandes", document.querySelector(".ws-navigation"));
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
  const role = document.querySelector(".ws-demo-selectors select");
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
  await ui.click("Documents", document.querySelector(".ws-navigation"));
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

test("Direct navigation exposes unread messages and the disclosure respects cancelled navigation and Escape", async () => {
  let ui = await mount();
  const nav = document.querySelector(".ws-navigation");
  const message = [...nav.querySelectorAll("button")].find((b) =>
    b.textContent.startsWith("Messages"),
  );
  assert.equal(message.querySelector(".ws-nav-count").textContent, "1");
  assert.equal(document.querySelector(".ws-demo-tools").open, false);
  await act(async () => {
    message.click();
    await settle();
  });
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("view"),
    "messages",
  );
  assert.equal(
    document.querySelectorAll('.ws-navigation [aria-current="page"]').length,
    1,
  );
  await ui.click("Marquer cette conversation comme lue");
  assert.equal(document.querySelector(".ws-navigation .ws-nav-count"), null);
  await ui.close();

  ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-001&section=team",
  });
  const toggle = document.querySelector(".ws-navigation-toggle");
  assert.equal(toggle.getAttribute("aria-controls"), "workspace-navigation");
  const clickToggle = () =>
    act(async () => {
      toggle.click();
      await settle();
    });
  await clickToggle();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  document.querySelector('textarea[name="note"]').value = "Keep this note";
  window.confirm = () => false;
  await ui.click("Documents", document.querySelector(".ws-navigation"));
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Keep this note",
  );
  await act(async () => {
    document
      .querySelector(".ws-navigation button")
      .dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    await settle();
  });
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);
  await clickToggle();
  window.confirm = () => true;
  await ui.click("Documents", document.querySelector(".ws-navigation"));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, document.querySelector("h1"));
  await ui.close();
});

const selectValue = async (select, value) => {
  assert.ok(select);
  await act(async () => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
  });
};
const labelledSelect = (text) =>
  [...document.querySelectorAll("label")]
    .find((label) => label.textContent.includes(text))
    ?.querySelector("select");
const navigation = () => document.querySelector(".ws-navigation");

test("Saving and saving again preserves profile choices, including when returning to the screen", async () => {
  const ui = await mount({ hash: "#view=profile&role=member" });
  let warnings = 0;
  window.confirm = () => {
    warnings++;
    return false;
  };
  await ui.click("Sauvegarder mes exemples sur cet appareil");
  await selectValue(document.querySelector('select[name="country"]'), "PT");
  await selectValue(document.querySelector('select[name="language"]'), "de");
  await selectValue(document.querySelector('select[name="currency"]'), "USD");
  const values = () =>
    ["country", "language", "currency"].map(
      (name) => document.querySelector(`select[name="${name}"]`).value,
    );
  const save = () =>
    ui.submit(document.querySelector('select[name="country"]').form);
  await save();
  assert.deepEqual(values(), ["PT", "de", "USD"]);
  await save();
  assert.deepEqual(values(), ["PT", "de", "USD"]);
  const profiles = JSON.parse(localStorage.getItem(key)).events.filter(
    (e) => e.action.type === "profile",
  );
  assert.equal(profiles.length, 2);
  for (const { action } of profiles)
    assert.deepEqual(
      [
        action.profile.country,
        action.profile.language,
        action.profile.currency,
      ],
      ["PT", "de", "USD"],
    );
  await ui.click("Documents", navigation());
  await ui.click("Mon compte", navigation());
  assert.deepEqual(values(), ["PT", "de", "USD"]);
  assert.equal(warnings, 0);
  await ui.close();
});

test("Document and request drafts survive refused internal changes and are discarded only after acceptance", async () => {
  let ui = await mount({ hash: "#view=documents&role=member&case=DEMO-001" });
  let warnings = 0;
  window.confirm = () => {
    warnings++;
    return false;
  };
  document.querySelector('input[name="name"]').value = "Document in progress";
  await selectValue(labelledSelect("Filtrer par dossier"), "DEMO-002");
  assert.equal(warnings, 1);
  assert.equal(labelledSelect("Filtrer par dossier").value, "DEMO-001");
  assert.equal(
    document.querySelector('input[name="name"]').value,
    "Document in progress",
  );
  window.confirm = () => true;
  await selectValue(labelledSelect("Filtrer par dossier"), "DEMO-002");
  assert.equal(document.querySelector('input[name="name"]').value, "");
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("case"),
    "DEMO-002",
  );
  await ui.close();

  ui = await mount({ hash: "#view=requests&role=member" });
  window.confirm = () => false;
  await ui.click("Nouvelle demande démo");
  document.querySelector('textarea[name="description"]').value =
    "Request in progress";
  await ui.click("Fermer le formulaire");
  assert.equal(
    document.querySelector('textarea[name="description"]').value,
    "Request in progress",
  );
  window.confirm = () => true;
  await ui.click("Fermer le formulaire");
  assert.equal(document.querySelector('textarea[name="description"]'), null);
  await ui.click("Nouvelle demande démo");
  assert.equal(
    document.querySelector('textarea[name="description"]').value,
    "",
  );
  // Successful creation must not ask the user to discard the very form saved.
  window.confirm = () => {
    throw new Error("Unexpected discard prompt after saving");
  };
  document.querySelector('textarea[name="description"]').value =
    "Submitted example";
  await ui.submit(document.querySelector('textarea[name="description"]').form);
  assert.match(
    document.querySelector(".ws-case-detail").textContent,
    /Submitted example/,
  );
  await ui.close();
});

test("Case and task selectors protect notes and task drafts before replacing their forms", async () => {
  let ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-001&section=team",
  });
  window.confirm = () => false;
  document.querySelector('textarea[name="note"]').value = "Keep case note";
  await selectValue(labelledSelect("État du dossier"), "quote");
  assert.equal(labelledSelect("État du dossier").value, "all");
  assert.equal(
    document.querySelector('textarea[name="note"]').value,
    "Keep case note",
  );
  await ui.close();
  ui = await mount({ hash: "#view=tasks&role=team&case=DEMO-001" });
  let warnings = 0;
  window.confirm = () => {
    warnings++;
    return false;
  };
  document.querySelector('.ws-add-task input[name="title"]').value =
    "Task draft";
  await selectValue(document.querySelector(".ws-add-task select"), "DEMO-002");
  assert.equal(warnings, 1);
  assert.equal(
    document.querySelector('.ws-add-task input[name="title"]').value,
    "Task draft",
  );
  assert.equal(document.querySelector(".ws-add-task select").value, "DEMO-001");
  window.confirm = () => true;
  await selectValue(document.querySelector(".ws-add-task select"), "DEMO-002");
  assert.equal(
    document.querySelector('.ws-add-task input[name="title"]').value,
    "",
  );
  window.confirm = () => {
    throw new Error("An unchanged form is not a draft");
  };
  await selectValue(document.querySelector(".ws-add-task select"), "DEMO-001");
  await ui.close();
});

test("Direct navigation, Back and Forward keep the selected case, including changes from Documents", async () => {
  const ui = await mount({ hash: "#view=requests&role=member&case=DEMO-002" });
  await ui.click("Documents", navigation());
  assert.equal(labelledSelect("Filtrer par dossier").value, "DEMO-002");
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("case"),
    "DEMO-002",
  );
  await ui.click("Mon compte", navigation());
  await act(async () => {
    history.back();
    await settle();
  });
  assert.equal(labelledSelect("Filtrer par dossier").value, "DEMO-002");
  await act(async () => {
    history.forward();
    await settle();
  });
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("case"),
    "DEMO-002",
  );
  await ui.click("Documents", navigation());
  await selectValue(labelledSelect("Filtrer par dossier"), "DEMO-001");
  await ui.click("Mon compte", navigation());
  await act(async () => {
    history.back();
    await settle();
  });
  assert.equal(labelledSelect("Filtrer par dossier").value, "DEMO-001");
  await ui.close();
});

test("Legacy translated countries from public preparations remain correct when displayed and saved", async () => {
  for (const [country, expected] of [
    ["Allemagne", "DE"],
    ["Reino Unido", "GB"],
    ["Canada", "CA"],
    ["Custom country", "Custom country"],
  ]) {
    const ui = await mount({
      hash: "#view=requests&role=member",
      prepared: {
        version: 1,
        service: "maison-inoccupee",
        description: "Visit",
        name: "Client example",
        country,
        currency: "EUR",
      },
    });
    await ui.submit(
      document.querySelector('textarea[name="description"]').form,
    );
    await ui.click("Mon compte", navigation());
    assert.equal(
      document.querySelector('select[name="country"]').value,
      expected,
      country,
    );
    await ui.submit(document.querySelector('select[name="country"]').form);
    assert.equal(
      document.querySelector('select[name="country"]').value,
      expected,
    );
    await ui.close();
  }
});

test("Team billing shows only the selected client’s quoted cases and identifies that client", async () => {
  const saved = JSON.stringify({
    version: 2,
    base: null,
    events: [
      {
        role: "team",
        action: { type: "client-create", name: "Client B", country: "PT" },
      },
    ],
  });
  const ui = await mount({ hash: "#view=billing&role=team", saved });
  await ui.click("Reprendre la session sauvegardée");
  assert.match(
    document.querySelector(".ws-main").textContent,
    /Client concerné : Client B/,
  );
  assert.equal(document.querySelectorAll(".ws-invoice").length, 0);
  assert.match(
    document.querySelector(".ws-main").textContent,
    /Aucune prestation chiffrée pour ce client/,
  );
  await selectValue(labelledSelect("Client fictif exploré"), "demo");
  assert.equal(document.querySelectorAll(".ws-invoice").length, 2);
  assert.match(
    document.querySelector(".ws-main").textContent,
    /Client concerné : Compte démo/,
  );
  await ui.close();
});

const selectedCase = () =>
  document.querySelector(".ws-case-list button.selected small")?.textContent;
const routeCase = () => new URLSearchParams(location.hash.slice(1)).get("case");
async function traverse(direction) {
  await act(async () => {
    history[direction]();
    await settle();
    await settle();
  });
}

test("Settlement filters protect the explanation when the selected detail would disappear", async () => {
  const ui = await mount({
    hash: "#view=settlements&role=team&case=DEMO-001",
    saved: JSON.stringify({ version: 2, base: "settlement", events: [] }),
  });
  await ui.click("Reprendre la session sauvegardée");
  let warnings = 0;
  window.confirm = () => {
    warnings++;
    return false;
  };
  document.querySelector('textarea[name="explanation"]').value =
    "Keep this settlement explanation";
  await selectValue(labelledSelect("Afficher les bilans"), "open");
  assert.equal(warnings, 0, "The same detail stays mounted");
  await selectValue(labelledSelect("Afficher les bilans"), "done");
  assert.equal(warnings, 1);
  assert.equal(labelledSelect("Afficher les bilans").value, "open");
  assert.equal(
    document.querySelector('textarea[name="explanation"]').value,
    "Keep this settlement explanation",
  );
  window.confirm = () => true;
  await selectValue(labelledSelect("Afficher les bilans"), "done");
  assert.equal(document.querySelector('textarea[name="explanation"]'), null);
  window.confirm = () => {
    throw new Error("No draft remains");
  };
  await selectValue(labelledSelect("Afficher les bilans"), "all");
  assert.equal(
    document.querySelector('textarea[name="explanation"]').value,
    "",
  );
  await ui.close();
});

test("Task attribution and progress save independently without erasing sibling drafts or leaving saved fields dirty", async () => {
  const ui = await mount({ hash: "#view=tasks&role=team&case=DEMO-001" });
  window.confirm = () => {
    throw new Error("Both forms remain mounted");
  };
  const card = document.querySelector(".ws-task-card");
  const note = card.querySelector('textarea[name="note"]');
  const assignee = card.querySelector('select[name="assignee"]');
  note.value = "Comment still being written";
  await selectValue(assignee, "team");
  await ui.submit(assignee.form);
  assert.equal(card.querySelector('textarea[name="note"]'), note);
  assert.equal(note.value, "Comment still being written");
  assert.equal(assignee.value, "team");
  const due = card.querySelector('input[name="due"]');
  due.value = "2030-02-03";
  await ui.submit(note.form);
  assert.equal(
    due.value,
    "2030-02-03",
    "Saving progress keeps the pending attribution",
  );
  assert.match(
    card.querySelector(".ws-task-note").textContent,
    /Comment still being written/,
  );
  await ui.submit(due.form);
  await ui.click("Documents", navigation());
  await ui.click("Tâches et échéances", navigation());
  const savedCard = [...document.querySelectorAll(".ws-task-card")].find(
    (c) =>
      c.querySelector(".ws-task-note")?.textContent ===
      "Comment still being written",
  );
  assert.equal(
    savedCard.querySelector('select[name="assignee"]').value,
    "team",
  );
  assert.equal(
    savedCard.querySelector('input[name="due"]').value,
    "2030-02-03",
  );
  await ui.close();
});

test("An edit that removes a task from its filters protects the other form, in both directions", async () => {
  for (const operation of ["assignment", "progress"]) {
    const ui = await mount({ hash: "#view=tasks&role=team&case=DEMO-001" });
    if (operation === "assignment")
      await selectValue(labelledSelect("Responsable"), "partner");
    const card = document.querySelector(".ws-task-card");
    const note = card.querySelector('textarea[name="note"]');
    const assignee = card.querySelector('select[name="assignee"]');
    const due = card.querySelector('input[name="due"]');
    let warnings = 0;
    window.confirm = () => {
      warnings++;
      return false;
    };
    let form;
    if (operation === "assignment") {
      note.value = "Pending comment";
      await selectValue(assignee, "team");
      form = assignee.form;
    } else {
      due.value = "2030-02-03";
      await selectValue(note.form.querySelector("select"), "done");
      form = note.form;
    }
    await ui.submit(form);
    assert.equal(warnings, 1);
    assert.equal(card.isConnected, true);
    assert.equal(
      operation === "assignment" ? note.value : due.value,
      operation === "assignment" ? "Pending comment" : "2030-02-03",
    );
    window.confirm = () => true;
    await ui.submit(form);
    assert.equal(
      card.isConnected,
      false,
      "Accepted discard allows the saved task to leave the filter",
    );
    await ui.close();
  }
});

test("Filtering cases synchronizes Documents and history, including a case opened through a section link", async () => {
  for (const section of ["", "&section=team"]) {
    const ui = await mount({
      hash: `#view=requests&role=team&case=DEMO-001${section}`,
    });
    await selectValue(labelledSelect("État du dossier"), "quote");
    assert.equal(labelledSelect("État du dossier").value, "quote");
    assert.equal(selectedCase(), "DEMO-002");
    assert.equal(routeCase(), "DEMO-002");
    await ui.click("Documents", navigation());
    assert.equal(labelledSelect("Filtrer par dossier").value, "DEMO-002");
    await traverse("back");
    assert.equal(selectedCase(), "DEMO-002");
    await traverse("back");
    assert.equal(selectedCase(), "DEMO-001");
    assert.equal(labelledSelect("État du dossier").value, "all");
    await traverse("forward");
    assert.equal(selectedCase(), "DEMO-002");
    await ui.close();
  }
});

const twoClients = JSON.stringify({
  version: 2,
  base: null,
  events: [
    {
      role: "member",
      action: { type: "client-create", name: "Client B", country: "PT" },
    },
    {
      role: "member",
      action: {
        type: "request",
        service: "maison-inoccupee",
        property: "",
        description: "Client B request",
      },
    },
    { role: "member", action: { type: "client-select", id: "demo" } },
  ],
});

test("Back/Forward restore the explored client and case, preserve subsequent edits and replay the same client context", async () => {
  const ui = await mount({
    hash: "#view=requests&role=member&case=DEMO-001",
    saved: twoClients,
  });
  await ui.click("Reprendre la session sauvegardée");
  await selectValue(labelledSelect("Client fictif exploré"), "client-1");
  assert.equal(selectedCase(), "DEMO-003");
  await traverse("back");
  assert.equal(labelledSelect("Client fictif exploré").value, "demo");
  assert.equal(selectedCase(), "DEMO-001");
  assert.equal(routeCase(), "DEMO-001");
  await traverse("forward");
  assert.equal(labelledSelect("Client fictif exploré").value, "client-1");
  assert.equal(selectedCase(), "DEMO-003");
  await ui.click("Mon compte", navigation());
  const name = document.querySelector('input[name="name"]');
  name.value = "Client B revised";
  await ui.submit(name.form);
  await traverse("back");
  await traverse("back");
  assert.equal(labelledSelect("Client fictif exploré").value, "demo");
  let restored = restoreSession(localStorage.getItem(key)).state;
  assert.equal(restored.activeClient, "demo");
  assert.equal(
    restored.accounts.find((a) => a.id === "client-1").profile.name,
    "Client B revised",
  );
  await ui.click("Mon compte", navigation());
  const country = document.querySelector('select[name="country"]');
  await selectValue(country, "DE");
  await ui.submit(country.form);
  restored = restoreSession(localStorage.getItem(key)).state;
  assert.equal(restored.profile.country, "DE");
  assert.equal(
    restored.accounts.find((a) => a.id === "client-1").profile.country,
    "PT",
  );
  await ui.close();
});

test("Cancelling Back across clients keeps the client, route and draft; accepting restores the client", async () => {
  const ui = await mount({
    hash: "#view=profile&role=member&case=DEMO-001",
    saved: twoClients,
  });
  await ui.click("Reprendre la session sauvegardée");
  await selectValue(labelledSelect("Client fictif exploré"), "client-1");
  const url = location.href;
  document.querySelector('input[name="name"]').value = "Unsaved client B";
  let warnings = 0;
  window.confirm = () => {
    warnings++;
    return false;
  };
  await traverse("back");
  assert.equal(warnings, 1);
  assert.equal(location.href, url);
  assert.equal(labelledSelect("Client fictif exploré").value, "client-1");
  assert.equal(
    document.querySelector('input[name="name"]').value,
    "Unsaved client B",
  );
  assert.equal(
    restoreSession(localStorage.getItem(key)).state.activeClient,
    "client-1",
  );
  window.confirm = () => true;
  await traverse("back");
  assert.equal(labelledSelect("Client fictif exploré").value, "demo");
  await traverse("forward");
  assert.equal(labelledSelect("Client fictif exploré").value, "client-1");
  assert.equal(document.querySelector('input[name="name"]').value, "Client B");
  await ui.close();
});

test("History restores named team and partner actors; disabled historical actors remain unavailable", async () => {
  for (const [role, first, second] of [
    ["team", "operator-1", "operator-2"],
    ["partner", "partner-1", "partner-2"],
  ]) {
    const ui = await mount({
      hash: `#view=requests&role=${role}&case=DEMO-001`,
    });
    await selectValue(labelledSelect("Intervenant de démonstration"), second);
    await traverse("back");
    assert.equal(labelledSelect("Intervenant de démonstration").value, first);
    assert.equal(selectedCase(), "DEMO-001");
    await traverse("forward");
    assert.equal(labelledSelect("Intervenant de démonstration").value, second);
    assert.equal(selectedCase(), undefined);
    await ui.close();
  }
  const ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-001",
    saved: JSON.stringify({
      version: 2,
      base: null,
      events: [
        {
          role: "team",
          action: { type: "person-access", id: "operator-2", enabled: false },
        },
      ],
    }),
  });
  await ui.click("Reprendre la session sauvegardée");
  await act(async () => {
    history.pushState(
      {
        lusoIndex: 1,
        lusoIdentity: { operator: "operator-2", client: "demo" },
      },
      "",
      "#view=requests&role=team&case=DEMO-001",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
    await settle();
  });
  assert.equal(
    labelledSelect("Intervenant de démonstration").value,
    "operator-1",
  );
  assert.equal(history.state.lusoIdentity.operator, "operator-1");
  assert.equal(
    restoreSession(localStorage.getItem(key)).state.people.find(
      (p) => p.id === "operator-2",
    ).enabled,
    false,
  );
  await ui.close();
});

test("A deep link to a saved case remains intact until the saved session is resumed", async () => {
  const ui = await mount({
    hash: "#view=requests&role=team&case=DEMO-003&section=team",
    saved: twoClients,
  });
  assert.equal(routeCase(), "DEMO-003");
  assert.equal(
    selectedCase(),
    "DEMO-001",
    "Initial examples do not contain the saved case",
  );
  await ui.click("Reprendre la session sauvegardée");
  assert.equal(routeCase(), "DEMO-003");
  assert.equal(selectedCase(), "DEMO-003");
  assert.match(
    document.querySelector(".ws-case-detail").textContent,
    /Client B request/,
  );
  assert.equal(
    new URLSearchParams(location.hash.slice(1)).get("section"),
    "team",
  );
  await ui.close();
});
