import actionSchema from "./actionSchema.json";
type Schema = {
  const?: unknown;
  anyOf?: Schema[];
  type?: string;
  items?: Schema;
  properties?: Record<string, Schema>;
  required?: string[];
};
function matches(schema: Schema, value: unknown): boolean {
  if ("const" in schema) return value === schema.const;
  if (schema.anyOf) return schema.anyOf.some((s) => matches(s, value));
  if (schema.type === "array")
    return (
      Array.isArray(value) && value.every((v) => matches(schema.items!, v))
    );
  if (schema.type === "object")
    return (
      Boolean(value) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      schema.required!.every((key) => Object.hasOwn(value!, key)) &&
      Object.entries(value!).every(
        ([key, v]) =>
          Object.hasOwn(schema.properties!, key) &&
          matches(schema.properties![key], v),
      )
    );
  return (
    typeof value === schema.type &&
    (schema.type !== "number" || Number.isFinite(value))
  );
}
export const validAction = (value: unknown) =>
  matches(actionSchema as unknown as Schema, value);
