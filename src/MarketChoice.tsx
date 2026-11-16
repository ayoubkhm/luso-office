import type { Lang } from "./locales";
export type Currency = "EUR" | "GBP" | "CHF" | "USD";
const copy = {
  fr: {
    label: "Devise souhaitée pour un futur devis",
    note: "Les montants de travail restent en euros. Les tarifs en GBP, CHF et USD sont à confirmer : aucune conversion n’est appliquée.",
  },
  pt: {
    label: "Moeda pretendida para um futuro orçamento",
    note: "Os valores de trabalho mantêm-se em euros. Os preços em GBP, CHF e USD estão por confirmar: não é aplicada qualquer conversão.",
  },
  en: {
    label: "Preferred currency for a future quote",
    note: "Working prices remain in euros. GBP, CHF and USD prices need confirmation; no conversion is applied.",
  },
  de: {
    label: "Gewünschte Währung für ein künftiges Angebot",
    note: "Die vorläufigen Preise bleiben in Euro. Preise in GBP, CHF und USD müssen bestätigt werden; es erfolgt keine Umrechnung.",
  },
};
export function MarketChoice({
  lang,
  value,
  onChange,
  name,
}: {
  lang: Lang;
  value?: Currency;
  onChange?: (c: Currency) => void;
  name?: string;
}) {
  const text = copy[lang];
  return (
    <div className="market-choice">
      <label>
        <span>{text.label}</span>
        <select
          name={name}
          value={onChange ? value : undefined}
          defaultValue={onChange ? undefined : value || "EUR"}
          onChange={
            onChange ? (e) => onChange(e.target.value as Currency) : undefined
          }
        >
          {(["EUR", "GBP", "CHF", "USD"] as const).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <p>{text.note}</p>
    </div>
  );
}
