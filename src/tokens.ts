import type { AccentName } from "./palette/types";

export type ColorSlot = AccentName | "fg0" | "fg1" | "fg2";
export interface TokenStyle { color: ColorSlot; bold?: boolean; italic?: boolean; mute?: boolean; }

// The duskbox identity (shared by all variants). Targeted de-collapse within an 8-hue budget;
// green is reserved for diagnostics/git. `mute` desaturates the accent toward fg0 (sand/soft).
// Color is spent on meaningful, less-frequent tokens; variables/operators/punctuation stay neutral.
export const TOKENS = {
  keyword:      { color: "red" as ColorSlot, bold: true },
  conditional:  { color: "red" as ColorSlot, bold: true },
  repeat:       { color: "red" as ColorSlot, bold: true },
  exception:    { color: "red" as ColorSlot, bold: true },
  keywordReturn:{ color: "red" as ColorSlot, bold: true },
  function:     { color: "yellow" as ColorSlot, bold: true },
  method:       { color: "yellow" as ColorSlot, bold: true },
  ctor:         { color: "orange" as ColorSlot, bold: true },
  type:         { color: "orange" as ColorSlot, bold: true },
  typeBuiltin:  { color: "orange" as ColorSlot, bold: true },
  parameter:    { color: "yellow" as ColorSlot, mute: true },
  builtin:      { color: "orange" as ColorSlot, mute: true },
  preproc:      { color: "orange" as ColorSlot, mute: true },
  string:       { color: "cyan" as ColorSlot },
  escape:       { color: "magenta" as ColorSlot },
  number:       { color: "blue" as ColorSlot },
  constant:     { color: "purple" as ColorSlot },
  boolean:      { color: "purple" as ColorSlot },
  property:     { color: "teal" as ColorSlot },
  variable:     { color: "fg0" as ColorSlot },
  operator:     { color: "fg1" as ColorSlot },
  punctuation:  { color: "fg1" as ColorSlot },
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
} satisfies Record<string, TokenStyle>;

export type Role = keyof typeof TOKENS;
