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
export function hasUnsavedFields() {
  return Array.from(
    document.querySelectorAll<HTMLFormElement>(".workspace form"),
  ).some(
    (form) => baselines.has(form) && baselines.get(form) !== snapshot(form),
  );
}
