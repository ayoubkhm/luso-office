import type { SelectHTMLAttributes } from "react";
import { countries, countryCode, countryLabel } from "./countries";
import { translate, type Lang } from "./locales";
export function CountrySelect({
  lang,
  defaultValue = "",
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "defaultValue" | "value"> & {
  lang: Lang;
  defaultValue?: string;
}) {
  const value = countryCode(defaultValue);
  return (
    <select {...props} defaultValue={value}>
      <option value="">
        {translate("Choisir un pays", "Escolher um país", lang)}
      </option>
      {value && !countries.some((c) => c.code === value) && (
        <option value={value}>{value}</option>
      )}
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {countryLabel(c.code, lang)}
        </option>
      ))}
    </select>
  );
}
