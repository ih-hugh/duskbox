import type { Role } from "../tokens";

export const ROLE_SCOPES: Partial<Record<Role, string[]>> = {
  keyword: ["keyword", "keyword.control", "storage.type", "storage.modifier"],
  operator: ["keyword.operator"],
  function: ["entity.name.function", "support.function", "meta.function-call"],
  ctor: ["entity.name.function.constructor", "entity.name.type.constructor"],
  type: ["entity.name.type", "support.type", "entity.name.class", "support.class"],
  builtin: ["variable.language", "support.type.builtin", "constant.language"],
  parameter: ["variable.parameter"],
  string: ["string", "string.quoted", "string.template"],
  escape: ["constant.character.escape"],
  number: ["constant.numeric"],
  boolean: ["constant.language.boolean"],
  constant: ["variable.other.constant", "constant.other"],
  property: ["variable.other.property", "support.variable.property", "meta.object-literal.key"],
  variable: ["variable", "variable.other.readwrite"],
  preproc: ["meta.preprocessor", "keyword.control.import", "keyword.control.export"],
  comment: ["comment", "punctuation.definition.comment"],
  punctuation: ["punctuation", "meta.brace"],
};

// VS Code semantic token type -> role
export const SEMANTIC_ROLE: Record<string, Role> = {
  keyword: "keyword", function: "function", method: "function", type: "type", class: "type",
  struct: "type", interface: "type", enum: "type", typeParameter: "type", parameter: "parameter",
  variable: "variable", property: "property", string: "string", number: "number",
  enumMember: "constant", macro: "preproc", comment: "comment", operator: "operator", namespace: "type",
};
