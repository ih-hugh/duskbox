import type { AccentName, Palette } from "./palette/types";

export type ColorSlot = AccentName | "fg0" | "fg1" | "fg2" | "h1" | "h2" | "h3" | "h4" | "punct";
export interface TokenStyle {
  color: ColorSlot; bold?: boolean; italic?: boolean; mute?: boolean;
  underline?: boolean; strikethrough?: boolean;
}

/** Resolve a ColorSlot to a hex for a palette (single source; both emitters import this). */
export function slot(p: Palette, c: ColorSlot): string {
  if (c === "fg0") return p.fg0;
  if (c === "fg1") return p.fg1;
  if (c === "fg2") return p.fg2;
  if (c === "punct") return p.fgPunct;
  if (c === "h1" || c === "h2" || c === "h3" || c === "h4")
    return p.headings[Number(c[1]) - 1]!;
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
  method:       { color: "yellow" as ColorSlot, bold: true },
  ctor:         { color: "magenta" as ColorSlot, bold: true },
  type:         { color: "orange" as ColorSlot, bold: true },
  typeBuiltin:  { color: "orange" as ColorSlot, bold: true },
  parameter:    { color: "fg0" as ColorSlot, italic: true },
  builtin:      { color: "magenta" as ColorSlot },
  preproc:      { color: "magenta" as ColorSlot },
  string:       { color: "green" as ColorSlot },
  escape:       { color: "cyan" as ColorSlot },
  number:       { color: "blue" as ColorSlot },
  constant:     { color: "purple" as ColorSlot },
  boolean:      { color: "purple" as ColorSlot },
  property:     { color: "teal" as ColorSlot },
  variable:     { color: "fg0" as ColorSlot },
  operator:     { color: "punct" as ColorSlot },
  punctuation:  { color: "punct" as ColorSlot },
  comment:      { color: "fg2" as ColorSlot, italic: true },
  tagNative:    { color: "red" as ColorSlot, bold: true },
  tagComponent: { color: "orange" as ColorSlot, bold: true },
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
} satisfies Record<string, TokenStyle>;

export type Role = keyof typeof TOKENS;
