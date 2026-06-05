import type { AccentName } from "./palette/types";

export type ColorSlot = AccentName | "fg0" | "fg1" | "fg2";
export interface TokenStyle { color: ColorSlot; bold?: boolean; italic?: boolean; }

// The duskbox identity, shared by ALL variants. Warm declarations / cool literals.
// Bold = keyword + type (user choice). References accent NAMES, not hex.
export const TOKENS: Record<string, TokenStyle> = {
  keyword:      { color: "red", bold: true },
  conditional:  { color: "red", bold: true },
  repeat:       { color: "red", bold: true },
  exception:    { color: "red", bold: true },
  keywordReturn:{ color: "red", bold: true },
  operator:     { color: "blue" },
  function:     { color: "yellow" },
  method:       { color: "yellow" },
  constructor:  { color: "orange" },
  type:         { color: "orange", bold: true },
  typeBuiltin:  { color: "orange", bold: true },
  builtin:      { color: "orange" },
  parameter:    { color: "yellow" },
  string:       { color: "cyan" },
  escape:       { color: "teal" },
  number:       { color: "blue" },
  boolean:      { color: "orange" },
  constant:     { color: "blue" },
  property:     { color: "blue" },
  variable:     { color: "fg0" },
  preproc:      { color: "orange" },
  comment:      { color: "fg2", italic: true },
  punctuation:  { color: "fg1" },
  error:        { color: "red" },
  warning:      { color: "yellow" },
  info:         { color: "blue" },
  hint:         { color: "teal" },
  ok:           { color: "green" },
  gitAdd:       { color: "green" },
  gitChange:    { color: "blue" },
  gitDelete:    { color: "red" },
};

export type Role = keyof typeof TOKENS;
