import type { Lang } from "./index";
const examples: Record<string, Record<Lang, string>> = {};
function add(source: string, fr: string, pt: string, en: string, de: string) {
  examples[source] = { fr, pt, en, de };
}
add(
  "Exemple / Exemplo : visite de la maison avant une arrivée / visita antes da chegada.",
  "Exemple : visite de la maison avant une arrivée.",
  "Exemplo: visita antes da chegada.",
  "Example: house visit before an arrival.",
  "Beispiel: Hausbesuch vor einer Anreise.",
);
add(
  "Exemple / Exemplo : organiser un dossier familial / organizar um processo familiar.",
  "Exemple : organiser un dossier familial.",
  "Exemplo: organizar um processo familiar.",
  "Example: organise a family case.",
  "Beispiel: einen Familienvorgang organisieren.",
);
add(
  "Scénario : visite et compte rendu / Cenário: visita e relatório.",
  "Scénario : visite et compte rendu.",
  "Cenário: visita e relatório.",
  "Scenario: visit and report.",
  "Szenario: Besuch und Bericht.",
);
add(
  "Scénario : organiser les pièces disponibles / Cenário: organizar os documentos disponíveis.",
  "Scénario : organiser les pièces disponibles.",
  "Cenário: organizar os documentos disponíveis.",
  "Scenario: organise the available documents.",
  "Szenario: die verfügbaren Unterlagen ordnen.",
);
add(
  "TVA, déplacements et conditions : TBD / IVA, deslocações e condições: TBD.",
  "TVA, déplacements et conditions : à confirmer.",
  "IVA, deslocações e condições: por confirmar.",
  "VAT, travel and terms: to be confirmed.",
  "Mehrwertsteuer, Anfahrt und Bedingungen: noch zu bestätigen.",
);
add(
  "Frais externes, TVA et conditions : TBD / Custos externos, IVA e condições: TBD.",
  "Frais externes, TVA et conditions : à confirmer.",
  "Custos externos, IVA e condições: por confirmar.",
  "External costs, VAT and terms: to be confirmed.",
  "Externe Kosten, Mehrwertsteuer und Bedingungen: noch zu bestätigen.",
);
add(
  "Préparer le compte rendu de visite / Preparar o relatório da visita",
  "Préparer le compte rendu de visite",
  "Preparar o relatório da visita",
  "Prepare the visit report",
  "Besuchsbericht vorbereiten",
);
add(
  "Liste des pièces disponibles / Lista de documentos disponíveis",
  "Liste des pièces disponibles",
  "Lista de documentos disponíveis",
  "List of available documents",
  "Liste der verfügbaren Unterlagen",
);
add(
  "Liste de visite / Lista de visita · DEMO",
  "Liste de visite · DÉMO",
  "Lista de visita · DEMO",
  "Visit checklist · DEMO",
  "Besuchscheckliste · DEMO",
);
add(
  "Autorisation / Autorização · DEMO",
  "Autorisation · DÉMO",
  "Autorização · DEMO",
  "Authorisation · DEMO",
  "Vollmacht · DEMO",
);
add(
  "Casa da família · démo",
  "Maison familiale · démo",
  "Casa da família · demo",
  "Family home · demo",
  "Familienhaus · Demo",
);
add(
  "Commune à préciser / Localidade a indicar",
  "Commune à préciser",
  "Localidade a indicar",
  "Town to be confirmed",
  "Ort noch zu bestätigen",
);
add(
  "Compte démo / Conta demo",
  "Compte démo",
  "Conta demo",
  "Demo account",
  "Demokonto",
);
add(
  "Exemple / Exemplo : nous préparons la visite ; merci de préciser les accès / estamos a preparar a visita; indique os acessos.",
  "Exemple : nous préparons la visite ; merci de préciser les accès.",
  "Exemplo: estamos a preparar a visita; indique os acessos.",
  "Example: we are preparing the visit; please provide access details.",
  "Beispiel: Wir bereiten den Besuch vor. Bitte geben Sie Hinweise zum Zugang.",
);
export function exampleText(text: string, lang: Lang): string {
  if (examples[text]) return examples[text][lang];
  if (text.endsWith(" · DEMO") && examples[text.slice(0, -7)])
    return examples[text.slice(0, -7)][lang] + " · DEMO";
  return text;
}
