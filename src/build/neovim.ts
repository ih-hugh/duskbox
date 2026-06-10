import { buildPalette, type VariantConfig } from "../palette/types";
import { TOKENS, slot, type Role, type TokenStyle } from "../tokens";
import { ROLE_GROUPS } from "./groups-nvim";
import { blend, muteHex } from "./blend";
import { buildPluginGroups } from "./plugins-nvim";

export interface Attrs { fg?: string; bg?: string; sp?: string; bold?: boolean; italic?: boolean; underline?: boolean; undercurl?: boolean; strikethrough?: boolean; }
export interface NvimOpts { bold: boolean; transparent?: boolean; }

export function buildNeovim(v: VariantConfig, opts: NvimOpts): Record<string, Attrs> {
  const p = buildPalette(v);
  const hl: Record<string, Attrs> = {};
  const bgEditor = opts.transparent ? undefined : p.bg0;

  // Signature variants recolor the decorative UI accent. Fall back to the ORIGINAL accent
  // per group so base variants stay byte-identical (p.signature is undefined for them).
  const uiBlue = p.signature ?? p.accents.blue;     // groups already blue
  const uiOrange = p.signature ?? p.accents.orange; // MatchParen + fuzzy-match groups
  const uiYellow = p.signature ?? p.accents.yellow; // CursorLineNr

  Object.assign(hl, {
    Normal: { fg: p.fg0, bg: bgEditor },
    NormalNC: { fg: p.fg0, bg: bgEditor },
    NormalFloat: { fg: p.fg0, bg: p.bg1 },
    FloatBorder: { fg: uiBlue, bg: p.bg1 },
    FloatTitle: { fg: uiBlue, bg: p.bg1, bold: true },
    Cursor: { fg: p.bg0, bg: p.fg0 },
    CursorLine: { bg: p.bg2 }, CursorColumn: { bg: p.bg2 },
    CursorLineNr: { fg: uiYellow, bold: true },
    LineNr: { fg: p.fg2 }, SignColumn: { bg: bgEditor },
    Visual: { bg: p.bg3 }, VisualNOS: { bg: p.bg3 },
    Search: { fg: p.bg0, bg: p.accents.yellow }, IncSearch: { fg: p.bg0, bg: p.accents.orange }, CurSearch: { fg: p.bg0, bg: p.accents.orange },
    Pmenu: { fg: p.fg0, bg: p.bg1 }, PmenuSel: { fg: p.bg0, bg: uiBlue, bold: true },
    PmenuSbar: { bg: p.bg1 }, PmenuThumb: { bg: p.bg3 },
    StatusLine: { fg: p.fg1, bg: p.bg1 }, StatusLineNC: { fg: p.fg2, bg: p.bg1 },
    TabLine: { fg: p.fg2, bg: p.bg1 }, TabLineSel: { fg: p.bg0, bg: uiBlue }, TabLineFill: { bg: p.bg1 },
    WinSeparator: { fg: p.bg3, bold: true }, VertSplit: { fg: p.bg3 },
    Folded: { fg: uiBlue, bg: p.bg1 }, FoldColumn: { fg: p.fg2, bg: bgEditor },
    MatchParen: { fg: uiOrange, bold: true },
    Title: { fg: uiBlue, bold: true }, Directory: { fg: uiBlue },
    NonText: { fg: p.bg3 }, Whitespace: { fg: p.bg3 }, SpecialKey: { fg: p.bg3 },
    ColorColumn: { bg: p.bg1 }, QuickFixLine: { bg: p.bg3, bold: true },
    ErrorMsg: { fg: p.accents.red }, WarningMsg: { fg: p.accents.yellow }, ModeMsg: { fg: p.fg1, bold: true },
    WinBar: { fg: p.fg1, bg: bgEditor }, WinBarNC: { fg: p.fg2, bg: bgEditor },
  } satisfies Record<string, Attrs>);

  (Object.keys(ROLE_GROUPS) as Role[]).forEach((role) => {
    const style: TokenStyle = TOKENS[role]; const groups = ROLE_GROUPS[role];
    if (!groups || !groups.length) return;
    const base = slot(p, style.color);
    const fg = style.mute ? muteHex(base, p.fg0) : base;
    const attrs: Attrs = { fg };
    if (style.bold && opts.bold) attrs.bold = true;
    if (style.italic) attrs.italic = true;
    if (style.underline) attrs.underline = true;
    if (style.strikethrough) attrs.strikethrough = true;
    for (const g of groups) hl[g] = { ...attrs };
  });

  const diag: [string, Role][] = [["Error","error"],["Warn","warning"],["Info","info"],["Hint","hint"],["Ok","ok"]];
  for (const [name, role] of diag) {
    const fg = slot(p, TOKENS[role].color);
    hl[`Diagnostic${name}`] = { fg };
    hl[`DiagnosticVirtualText${name}`] = { fg, bg: p.bg1 };
    hl[`DiagnosticUnderline${name}`] = { undercurl: true, sp: fg };
  }
  hl.SpellBad = { undercurl: true, sp: slot(p, TOKENS.error.color) };
  hl.SpellCap = { undercurl: true, sp: slot(p, TOKENS.warning.color) };

  const gAdd = slot(p, TOKENS.gitAdd.color), gChg = slot(p, TOKENS.gitChange.color), gDel = slot(p, TOKENS.gitDelete.color);
  hl.DiffAdd = { bg: blend(p.bg0, gAdd, 0.18) }; hl.DiffChange = { bg: blend(p.bg0, gChg, 0.18) };
  hl.DiffDelete = { bg: blend(p.bg0, gDel, 0.18) }; hl.DiffText = { bg: blend(p.bg2, gChg, 0.18) };
  hl.GitSignsAdd = { fg: gAdd }; hl.GitSignsChange = { fg: gChg }; hl.GitSignsDelete = { fg: gDel };
  hl.Added = { fg: gAdd }; hl.Changed = { fg: gChg }; hl.Removed = { fg: gDel };

  hl.TelescopeBorder = { fg: p.bg3, bg: p.bg1 }; hl.TelescopeNormal = { fg: p.fg0, bg: p.bg1 };
  hl.TelescopeSelection = { bg: p.bg2, bold: true }; hl.TelescopeMatching = { fg: uiOrange, bold: true };
  hl.SnacksPickerBorder = { fg: p.bg3, bg: p.bg1 }; hl.SnacksPickerMatch = { fg: uiOrange, bold: true };
  // file explorer: ignored/hidden/dimmed entries default to NonText (near-bg) — keep them readable
  hl.SnacksPickerPathIgnored = { fg: p.fg2 }; hl.SnacksPickerPathHidden = { fg: p.fg2 };
  hl.SnacksPickerDimmed = { fg: p.fg2 };
  hl.NeoTreeDimText = { fg: p.fg2 }; hl.NeoTreeGitIgnored = { fg: p.fg2 }; hl.NeoTreeDotfile = { fg: p.fg2 };
  // LSP inlay hints (inferred types / param names) default near-bg — readable text in a subtle pill
  hl.LspInlayHint = { fg: p.fg2, bg: p.bg1 };
  hl["@lsp.type.comment"] = { fg: p.fg2 };
  hl.CmpItemAbbrMatch = { fg: uiBlue, bold: true }; hl.CmpItemKind = { fg: p.accents.yellow };
  hl.IndentBlanklineChar = { fg: p.bg2 }; hl.IblIndent = { fg: p.bg2 }; hl.IblScope = { fg: p.accents.blue };

  // Detail-pass extras that need more than a TokenStyle: chips (bg), yaml anchors, @lsp mirrors
  // of the semantic depth (parameter/decorator/readonly/interface/defaultLibrary).
  hl["@markup.raw"] = { fg: p.accents.teal, bg: p.bg2 };
  hl["@markup.raw.block"] = { fg: p.fg0 };
  hl["@punctuation.special"] = { fg: p.accents.cyan };        // ${} interpolation, special marks
  hl["@punctuation.special.markdown"] = { fg: p.fgPunct };    // table pipes, ---, > stay calm like VS Code
  hl["@label.yaml"] = { fg: p.accents.purple };               // anchors & aliases
  hl["@lsp.type.parameter"] = { fg: p.fg0, italic: true };
  hl["@lsp.type.decorator"] = { fg: p.accents.magenta };      // builtin slot — matches VS Code decorator→builtin (magenta; = signature hue on signature variants)
  hl["@lsp.type.selfParameter"] = { fg: p.accents.magenta };
  hl["@lsp.type.clsParameter"] = { fg: p.accents.magenta };
  hl["@lsp.type.interface"] = { fg: p.accents.orange, italic: true };
  hl["@lsp.type.typeParameter"] = { fg: p.accents.orange, italic: true };
  hl["@lsp.typemod.variable.readonly"] = { fg: p.accents.purple };
  hl["@lsp.typemod.property.readonly"] = { fg: p.accents.purple };
  hl["@lsp.typemod.function.defaultLibrary"] = { fg: p.accents.magenta };
  hl["@lsp.typemod.variable.defaultLibrary"] = { fg: p.accents.magenta };
  hl["@lsp.typemod.method.defaultLibrary"] = { fg: p.accents.magenta };
  hl["@lsp.typemod.class.defaultLibrary"] = { fg: p.accents.magenta };

  Object.assign(hl, buildPluginGroups(p, uiBlue));

  return hl;
}

export function toLua(hl: Record<string, Attrs>): string {
  const esc = (k: string) => `["${k}"]`;
  const body = Object.entries(hl).map(([g, a]) => {
    const parts: string[] = [];
    if (a.fg) parts.push(`fg = "${a.fg}"`);
    if (a.bg) parts.push(`bg = "${a.bg}"`);
    if (a.sp) parts.push(`sp = "${a.sp}"`);
    if (a.bold) parts.push("bold = true");
    if (a.italic) parts.push("italic = true");
    if (a.underline) parts.push("underline = true");
    if (a.undercurl) parts.push("undercurl = true");
    if (a.strikethrough) parts.push("strikethrough = true");
    return `  ${esc(g)} = { ${parts.join(", ")} },`;
  }).join("\n");
  return `-- generated by duskbox; do not edit by hand\nreturn {\n${body}\n}\n`;
}
