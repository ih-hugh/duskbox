import type { Role } from "../tokens";

// Each syntax role -> the Neovim highlight groups it paints (base + treesitter captures).
export const ROLE_GROUPS: Partial<Record<Role, string[]>> = {
  keyword: ["Keyword", "@keyword", "@keyword.function", "Statement", "@keyword.directive"],
  conditional: ["Conditional", "@keyword.conditional"],
  repeat: ["Repeat", "@keyword.repeat"],
  exception: ["Exception", "@keyword.exception"],
  keywordReturn: ["@keyword.return"],
  operator: ["Operator", "@operator"],
  function: ["Function", "@function"],
  functionCall: ["@function.call"],
  method: ["@function.method"],
  methodCall: ["@function.method.call"],
  ctor: ["@constructor"],
  type: ["Type", "@type", "Structure"],
  typeBuiltin: ["@type.builtin"],
  builtin: ["@variable.builtin", "@module.builtin", "@constant.builtin"],
  decorator: ["@attribute", "@attribute.builtin"],
  parameter: ["@variable.parameter"],
  string: ["String", "@string", "Character", "@character"],
  escape: ["@string.escape", "@string.special"],
  number: ["Number", "Float", "@number", "@number.float"],
  boolean: ["Boolean", "@boolean"],
  constant: ["Constant", "@constant"],
  property: ["@property", "@variable.member", "@field"],
  variable: ["Identifier", "@variable"],
  preproc: ["PreProc", "Include", "Define", "Macro"], // legacy regex surface only — calm plain red (sh $var etc.)
  comment: ["Comment", "@comment"],
  punctuation: ["Delimiter", "@punctuation.bracket", "@punctuation.delimiter"],
  tagNative: ["@tag.builtin"],
  tagComponent: ["@tag"],
  tagAttr: ["@tag.attribute"],
  tagDelim: ["@tag.delimiter"],
  // --- detail pass: markdown (heading ladder; 5/6 reuse the h4 color) ---
  mdH1: ["@markup.heading", "@markup.heading.1"],
  mdH2: ["@markup.heading.2"],
  mdH3: ["@markup.heading.3"],
  mdH4: ["@markup.heading.4", "@markup.heading.5", "@markup.heading.6"],
  mdBold: ["@markup.strong"],
  mdItalic: ["@markup.italic"],
  mdLink: ["@markup.link", "@markup.link.url", "@markup.link.label"],
  mdQuote: ["@markup.quote"],
  mdListMarker: ["@markup.list"],
  mdStrike: ["@markup.strikethrough"],
  // --- detail pass: guards & docs ---
  // (no docTag binding here: nvim's @comment.documentation is the WHOLE doc comment body,
  // not just the @param-style tag like VS Code's jsdoc scopes — the default link is sensible)
  wordOperator: ["@keyword.operator"],
  diffMeta: ["@diff.delta", "@attribute.diff", "diffLine", "diffSubname"],
  typeKeyword: ["@keyword.type"],
  moduleKw: ["@keyword.import"],
  // v2.1 modifier class. Stock captures can't fully express the split (const/let/var/static are
  // plain @keyword upstream) — the shipped after/queries re-capture them; @keyword.coroutine
  // bundles async+await, so nvim renders `await` purple where VS Code cannot (accepted divergence).
  keywordModifier: ["@keyword.modifier", "@keyword.coroutine"],
};
