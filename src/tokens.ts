import type { AccentName, Palette } from "./palette/types";

export type ColorSlot = AccentName | "fg0" | "fg1" | "fg2" | "h1" | "h2" | "h3" | "h4" | "punct" | "builtin" | "param" | "var" | "moduleKw";
export interface TokenStyle {
  color: ColorSlot; bold?: boolean; italic?: boolean; mute?: boolean;
  underline?: boolean; strikethrough?: boolean;
  /** Emit an explicit empty fontStyle — resets inherited styling in vscode's theme trie
   *  (a parent-scoped rule with UNSET fontStyle inherits the main rule's at insert time).
   *  Use ONLY where a deeper default would otherwise bleed in; no-op for nvim (attrs are absolute). */
  plain?: boolean;
}

// Literal lookup (not arithmetic on the slot name) so adding an h5 slot without a 5th
// ladder entry is a compile/test error instead of a silent undefined index.
const HEADING_SLOT = { h1: 0, h2: 1, h3: 2, h4: 3 } as const;

/** Resolve a ColorSlot to a hex for a palette (single source; both emitters import this). */
export function slot(p: Palette, c: ColorSlot): string {
  if (c === "fg0") return p.fg0;
  if (c === "fg1") return p.fg1;
  if (c === "fg2") return p.fg2;
  if (c === "punct") return p.fgPunct;
  if (c === "builtin") return p.builtin;
  if (c === "param") return p.fgParam;
  if (c === "var") return p.fgVar;
  if (c === "moduleKw") return p.moduleKw;
  if (c in HEADING_SLOT) return p.headings[HEADING_SLOT[c as keyof typeof HEADING_SLOT]];
  return p.accents[c as AccentName];
}

// The duskbox identity (shared by all variants). Targeted de-collapse within an 8-hue budget.
// Strings are green (near-neon on HC variants); green is otherwise only diagnostics/git.
// `mute` desaturates the accent toward fg0 (sand/soft). Color is spent on meaningful,
// less-frequent tokens; variables/operators/punctuation stay neutral.
export const TOKENS = {
  keyword:      { color: "red" as ColorSlot, bold: true },
  conditional:  { color: "red" as ColorSlot, bold: true },
  repeat:       { color: "red" as ColorSlot, bold: true },
  exception:    { color: "red" as ColorSlot, bold: true },
  keywordReturn:{ color: "red" as ColorSlot, bold: true },
  function:     { color: "yellow" as ColorSlot, bold: true },
  functionCall: { color: "yellow" as ColorSlot, plain: true },
  method:       { color: "yellow" as ColorSlot, bold: true },
  methodCall:   { color: "yellow" as ColorSlot, plain: true },
  // ctor: modern TS TextMate emits ctor calls as function-calls; semantic `class` covers trusted-path ctors.
  ctor:         { color: "builtin" as ColorSlot, bold: true },
  type:         { color: "orange" as ColorSlot, bold: true },
  typeBuiltin:  { color: "orange" as ColorSlot, bold: true },
  parameter:    { color: "param" as ColorSlot, italic: true },
  builtin:      { color: "builtin" as ColorSlot, italic: true },
  decorator:    { color: "builtin" as ColorSlot },              // explicit syntax, not implicit context — no italic
  preproc:      { color: "red" as ColorSlot },                  // legacy-only surface (PreProc/Macro); modern import/export ride keyword (bold red)
  string:       { color: "green" as ColorSlot },
  escape:       { color: "cyan" as ColorSlot },
  number:       { color: "blue" as ColorSlot },
  constant:     { color: "purple" as ColorSlot },
  boolean:      { color: "purple" as ColorSlot },
  property:     { color: "teal" as ColorSlot },
  variable:     { color: "var" as ColorSlot },
  operator:     { color: "cyan" as ColorSlot },
  punctuation:  { color: "punct" as ColorSlot },
  comment:      { color: "fg2" as ColorSlot, italic: true },
  tagNative:    { color: "red" as ColorSlot },
  tagComponent: { color: "orange" as ColorSlot },
  tagAttr:      { color: "teal" as ColorSlot, mute: true },
  tagDelim:     { color: "fg1" as ColorSlot },
  error:        { color: "red" as ColorSlot },
  warning:      { color: "yellow" as ColorSlot },
  info:         { color: "blue" as ColorSlot },
  hint:         { color: "teal" as ColorSlot },
  ok:           { color: "green" as ColorSlot },
  gitAdd:       { color: "green" as ColorSlot },
  gitChange:    { color: "blue" as ColorSlot },
  gitDelete:    { color: "red" as ColorSlot },
  // --- detail pass: markdown / docs ---
  mdH1:         { color: "h1" as ColorSlot, bold: true },
  mdH2:         { color: "h2" as ColorSlot, bold: true },
  mdH3:         { color: "h3" as ColorSlot, bold: true },
  mdH4:         { color: "h4" as ColorSlot, bold: true },
  mdBold:       { color: "fg0" as ColorSlot, bold: true },
  mdItalic:     { color: "fg0" as ColorSlot, italic: true },
  mdCodeInline: { color: "teal" as ColorSlot },
  mdLink:       { color: "cyan" as ColorSlot, underline: true },
  mdQuote:      { color: "fg2" as ColorSlot, italic: true },
  mdListMarker: { color: "orange" as ColorSlot },
  mdSeparator:  { color: "punct" as ColorSlot },
  mdStrike:     { color: "fg2" as ColorSlot, strikethrough: true },
  // --- detail pass: per-language ---
  propertyKey:  { color: "teal" as ColorSlot },                 // JSON/YAML/CSS property-name scopes
  yamlAnchor:   { color: "purple" as ColorSlot },
  cssUnit:      { color: "orange" as ColorSlot },
  cssColorHex:  { color: "purple" as ColorSlot },
  cssImportant: { color: "red" as ColorSlot, bold: true },
  cssClassSel:  { color: "yellow" as ColorSlot },
  cssPseudo:    { color: "cyan" as ColorSlot },
  regexClass:   { color: "orange" as ColorSlot },
  regexQuant:   { color: "red" as ColorSlot },
  regexAnchor:  { color: "red" as ColorSlot },
  docTag:       { color: "purple" as ColorSlot },
  docParam:     { color: "fg0" as ColorSlot, italic: true },
  diffMeta:     { color: "blue" as ColorSlot },
  // --- detail pass: guards & semantic depth ---
  stringQuote:  { color: "green" as ColorSlot },                // keep quotes string-colored despite punct dim
  wordOperator: { color: "red" as ColorSlot, bold: true },      // typeof/instanceof/new stay keywords
  typeInterface:{ color: "orange" as ColorSlot, italic: true }, // interface/typeParameter vs class(bold)
  typeKeyword:  { color: "orange" as ColorSlot, italic: true }, // `type` in import type / type X = (deeper than storage.type)
  moduleKw:     { color: "moduleKw" as ColorSlot, bold: true }, // import/export/from/as — walk from red toward the variant anchor
} satisfies Record<string, TokenStyle>;

export type Role = keyof typeof TOKENS;
