import { requestMessageLimit } from "./requestLimits";
export const handoffKey = "lusooffice-demo-request";
export type RequestHandoff = {
  version: 1;
  service: string;
  description: string;
  name: string;
  country: string;
  plan?: string;
  currency?: "EUR" | "GBP" | "CHF" | "USD";
};
export function readHandoff(raw: string): RequestHandoff | null {
  try {
    const d = JSON.parse(raw);
    return d.version === 1 &&
      typeof d.service === "string" &&
      typeof d.description === "string" &&
      d.description.length <= requestMessageLimit &&
      typeof d.name === "string" &&
      d.name.length <= 100 &&
      typeof d.country === "string"
      ? d
      : null;
  } catch {
    return null;
  }
}
