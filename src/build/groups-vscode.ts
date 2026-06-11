import type { Role } from "../tokens";

export const ROLE_SCOPES: Partial<Record<Role, string[]>> = {
  keyword: ["keyword", "keyword.control", "storage.type", "storage.modifier"], // bare keyword.control prefix already covers .import/.export
  operator: ["keyword.operator"],
  function: ["entity.name.function"],
  // descendant selector wins at call sites: the identifier is entity.name.function NESTED INSIDE
  // meta.function-call, so the deeper (bold) function rule would otherwise take the bold property.
  functionCall: ["meta.function-call", "support.function", "meta.function-call entity.name.function"],
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
  preproc: ["meta.preprocessor"], // legacy-only; import/export moved to keyword (bold red, approved hybrid render)
  comment: ["comment", "punctuation.definition.comment"],
  punctuation: ["punctuation", "meta.brace"],
  tagNative: ["entity.name.tag"],
  tagComponent: ["support.class.component", "entity.name.tag.namespace"],
  tagAttr: ["entity.other.attribute-name"],
  tagDelim: ["punctuation.definition.tag"],
  // --- detail pass: git diff line bodies (TextMate scopes emitted by diff/git grammars) ---
  gitAdd: ["markup.inserted", "markup.inserted punctuation.definition.inserted"],
  gitChange: ["markup.changed", "markup.changed punctuation.definition.changed"],
  gitDelete: ["markup.deleted", "markup.deleted punctuation.definition.deleted"],
  // --- detail pass: markdown / docs (descendant selectors keep #-marks & bullets in their
  // ladder/marker colors despite the generic punctuation dim — deeper match wins) ---
  mdH1: ["heading.1.markdown", "heading.1.markdown punctuation.definition.heading", "markup.heading.setext.1.markdown"],
  mdH2: ["heading.2.markdown", "heading.2.markdown punctuation.definition.heading", "markup.heading.setext.2.markdown"],
  mdH3: ["heading.3.markdown", "heading.3.markdown punctuation.definition.heading"],
  mdH4: [
    "heading.4.markdown", "heading.4.markdown punctuation.definition.heading",
    "heading.5.markdown", "heading.5.markdown punctuation.definition.heading",
    "heading.6.markdown", "heading.6.markdown punctuation.definition.heading",
  ],
  mdBold: ["markup.bold"],
  mdItalic: ["markup.italic"],
  mdCodeInline: ["markup.inline.raw", "markup.raw.inline", "fenced_code.block.language", "entity.name.language.markdown"],
  mdLink: [
    "markup.underline.link", "string.other.link.title.markdown",
    "string.other.link.description.markdown", "constant.other.reference.link.markdown",
  ],
  mdQuote: ["markup.quote"],
  mdListMarker: ["punctuation.definition.list.begin.markdown", "markup.list.numbered.bullet"],
  mdSeparator: ["meta.separator.markdown", "entity.other.document.begin.yaml"],
  mdStrike: ["markup.strikethrough"],
  // --- detail pass: per-language ---
  propertyKey: [
    "support.type.property-name", "support.type.property-name punctuation",
    "entity.name.tag.yaml",
  ],
  yamlAnchor: [
    "variable.other.anchor.yaml", // current VS Code YAML grammar (&name); entity.name.type form is legacy
    "entity.name.type.anchor.yaml", "variable.other.alias.yaml",
    "punctuation.definition.anchor.yaml", "punctuation.definition.alias.yaml",
  ],
  cssUnit: ["keyword.other.unit"],
  cssColorHex: ["constant.other.color"],
  cssImportant: ["keyword.other.important"],
  cssClassSel: ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css"],
  cssPseudo: ["entity.other.attribute-name.pseudo-class", "entity.other.attribute-name.pseudo-element"],
  regexClass: ["constant.other.character-class.regexp", "constant.other.character-class.set.regexp"],
  regexQuant: ["keyword.operator.quantifier.regexp"],
  regexAnchor: ["keyword.control.anchor.regexp"],
  docTag: ["storage.type.class.jsdoc", "punctuation.definition.block.tag.jsdoc", "entity.name.type.instance.jsdoc"],
  docParam: ["variable.other.jsdoc"],
  diffMeta: [
    "meta.diff.header", "meta.diff.range", "punctuation.definition.range.diff",
    "punctuation.definition.from-file.diff", "punctuation.definition.to-file.diff",
  ],
  // --- detail pass: guards (protect from the generic punctuation dim / keep wordy ops as keywords) ---
  stringQuote: ["punctuation.definition.string"],
  wordOperator: [
    "keyword.operator.expression", "keyword.operator.new",
    "keyword.operator.delete", "keyword.operator.logical.python",
  ],
};

// VS Code semantic token type -> role
export const SEMANTIC_ROLE: Record<string, Role> = {
  keyword: "keyword", function: "functionCall", method: "functionCall", type: "type", class: "type",
  struct: "type", interface: "typeInterface", enum: "type", typeParameter: "typeInterface", parameter: "parameter",
  variable: "variable", property: "property", string: "string", number: "number",
  enumMember: "constant", macro: "preproc", comment: "comment", operator: "operator", namespace: "type",
  // declaration modifiers: bold yellow for named declarations (function.declaration / method.declaration)
  "function.declaration": "function", "method.declaration": "function",
  // decorator: TS's LSP never emits decorator tokens (TextMate paints them yellow there); Python's
  // Pylance does -> decorator role (plain builtin warm — explicit syntax, no italic).
  decorator: "decorator", annotation: "decorator",
  selfParameter: "builtin", clsParameter: "builtin",
  "variable.readonly": "constant", "property.readonly": "constant",
  "function.defaultLibrary": "builtin", "method.defaultLibrary": "builtin",
  "class.defaultLibrary": "builtin", "variable.defaultLibrary": "builtin",
  regexp: "string", event: "property",
};
