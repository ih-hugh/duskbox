import type { AccentName } from "./palette/types";

export type ColorSlot = AccentName | "fg0" | "fg1" | "fg2";
export interface TokenStyle { color: ColorSlot; bold?: boolean; italic?: boolean; }

// The duskbox identity, shared by ALL variants. Warm declarations / cool literals.
// Bold = keyword + type (user choice). References accent NAMES, not hex.
export const TOKENS = {
  keyword:      { color: "red" as ColorSlot, bold: true },
  conditional:  { color: "red" as ColorSlot, bold: true },
  repeat:       { color: "red" as ColorSlot, bold: true },
  exception:    { color: "red" as ColorSlot, bold: true },
  keywordReturn:{ color: "red" as ColorSlot, bold: true },
  operator:     { color: "blue" as ColorSlot },
  function:     { color: "yellow" as ColorSlot },
  method:       { color: "yellow" as ColorSlot },
  ctor:         { color: "orange" as ColorSlot },
  type:         { color: "orange" as ColorSlot, bold: true },
  typeBuiltin:  { color: "orange" as ColorSlot, bold: true },
  builtin:      { color: "orange" as ColorSlot },
  parameter:    { color: "yellow" as ColorSlot },
  string:       { color: "cyan" as ColorSlot },
  escape:       { color: "teal" as ColorSlot },
  number:       { color: "blue" as ColorSlot },
  boolean:      { color: "orange" as ColorSlot },
  constant:     { color: "blue" as ColorSlot },
  property:     { color: "blue" as ColorSlot },
  variable:     { color: "fg0" as ColorSlot },
  preproc:      { color: "orange" as ColorSlot },
  comment:      { color: "fg2" as ColorSlot, italic: true },
  punctuation:  { color: "fg1" as ColorSlot },
  error:        { color: "red" as ColorSlot },
  warning:      { color: "yellow" as ColorSlot },
  info:         { color: "blue" as ColorSlot },
  hint:         { color: "teal" as ColorSlot },
  ok:           { color: "green" as ColorSlot },
  gitAdd:       { color: "green" as ColorSlot },
  gitChange:    { color: "blue" as ColorSlot },
  gitDelete:    { color: "red" as ColorSlot },
} satisfies Record<string, TokenStyle>;

export type Role = keyof typeof TOKENS;
