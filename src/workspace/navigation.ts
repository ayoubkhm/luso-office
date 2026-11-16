// Every workspace entry carries a cursor so a cancelled Back/Forward can return
// to the original entry without adding a duplicate entry or changing the form.
export const navigationEvent = "luso-navigation";
export function historyCursor() {
  return { url: location.href, index: Number(history.state?.lusoIndex ?? 0) };
}
export function initializeHistory() {
  history.replaceState(
    { ...history.state, lusoIndex: historyCursor().index },
    "",
  );
}
export function pushWorkspaceHistory(url: string) {
  history.pushState({ lusoIndex: historyCursor().index + 1 }, "", url);
  window.dispatchEvent(new Event(navigationEvent));
}
export function replaceWorkspaceHistory(url: string) {
  history.replaceState(
    { ...history.state, lusoIndex: historyCursor().index },
    "",
    url,
  );
  window.dispatchEvent(new Event(navigationEvent));
}

const baselines = new WeakMap<HTMLFormElement, string>();
function snapshot(form: HTMLFormElement) {
  return JSON.stringify(
    Array.from(form.querySelectorAll("input, textarea, select")).map((node) => {
      const field = node as
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (field instanceof HTMLSelectElement)
        return Array.from(field.selectedOptions).map((option) => option.value);
      if (
        field instanceof HTMLInputElement &&
        ["checkbox", "radio"].includes(field.type)
      )
        return field.checked;
      return field.value;
    }),
  );
}
export function rememberForm(form: HTMLFormElement) {
  baselines.set(form, snapshot(form));
}
export function hasFormBaseline(form: HTMLFormElement) {
  return baselines.has(form);
}
export function hasUnsavedFields(
  scope: ParentNode = document,
  ignore?: Element,
) {
  const forms =
    (scope as HTMLElement).tagName === "FORM"
      ? [scope as HTMLFormElement]
      : Array.from(scope.querySelectorAll<HTMLFormElement>("form"));
  return forms.some((form) => {
    const baseline = baselines.get(form);
    if (baseline === undefined) return false;
    const current = snapshot(form);
    if (!ignore || !form.contains(ignore)) return baseline !== current;
    // A destination selector has already changed when its event runs. It is
    // not itself a draft; compare the other fields before deciding to warn.
    const index = Array.from(
      form.querySelectorAll("input, textarea, select"),
    ).indexOf(ignore);
    const values = JSON.parse(current);
    if (index >= 0) values[index] = JSON.parse(baseline)[index];
    return baseline !== JSON.stringify(values);
  });
}
export function confirmDiscardChanges(
  t: (fr: string, pt: string) => string,
  scope?: ParentNode,
  ignore?: Element,
) {
  return (
    !hasUnsavedFields(scope, ignore) ||
    window.confirm(
      t(
        "Une saisie n’a pas été enregistrée. Quitter cet écran et abandonner cette saisie ?",
        "Há dados por guardar. Sair deste ecrã e descartar esses dados?",
      ),
    )
  );
}
