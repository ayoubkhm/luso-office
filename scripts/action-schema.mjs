import ts from "typescript";
import { writeFileSync } from "node:fs";
const configPath = ts.findConfigFile(".", ts.sys.fileExists, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ".");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile("src/workspace/model.ts");
const node = source.statements.find(
  (n) => ts.isTypeAliasDeclaration(n) && n.name.text === "Action",
);
function schema(type) {
  if (type.isUnion())
    return {
      anyOf: type.types
        .filter((t) => !(t.flags & ts.TypeFlags.Undefined))
        .map(schema),
    };
  if (type.flags & ts.TypeFlags.StringLiteral) return { const: type.value };
  if (type.flags & ts.TypeFlags.NumberLiteral) return { const: type.value };
  if (type.flags & ts.TypeFlags.BooleanLiteral)
    return { const: type.intrinsicName === "true" };
  if (type.flags & ts.TypeFlags.String) return { type: "string" };
  if (type.flags & ts.TypeFlags.Number) return { type: "number" };
  if (type.flags & ts.TypeFlags.Boolean) return { type: "boolean" };
  if (checker.isArrayType(type))
    return { type: "array", items: schema(checker.getTypeArguments(type)[0]) };
  if (type.flags & ts.TypeFlags.Object) {
    const properties = {};
    const required = [];
    for (const prop of type.getProperties()) {
      properties[prop.name] = schema(
        checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration || node),
      );
      if (!(prop.flags & ts.SymbolFlags.Optional)) required.push(prop.name);
    }
    return { type: "object", properties, required };
  }
  throw new Error(
    "Unsupported action schema type: " + checker.typeToString(type),
  );
}
writeFileSync(
  "src/workspace/actionSchema.json",
  JSON.stringify(schema(checker.getTypeAtLocation(node)), null, 2) + "\n",
);
