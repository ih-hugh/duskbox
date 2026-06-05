import type { Palette, AccentName } from "../palette/types";
import { buildPalette, type VariantConfig } from "../palette/types";
import { TOKENS, type ColorSlot, type Role, type TokenStyle } from "../tokens";
import { ROLE_GROUPS } from "./groups-nvim";

export interface Attrs { fg?: string; bg?: string; sp?: string; bold?: boolean; italic?: boolean; underline?: boolean; undercurl?: boolean; }
export interface NvimOpts { bold: boolean; transparent?: boolean; }

function slot(p: Palette, c: ColorSlot): string {
  if (c === "fg0") return p.fg0; if (c === "fg1") return p.fg1; if (c === "fg2") return p.fg2;
  return p.accents[c as AccentName];
}

// blend an accent fg ~18% into bg for subtle diff backgrounds
function mix(fg: string, bg: string): string {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [r1, g1, b1] = h(fg), [r2, g2, b2] = h(bg); const a = 0.18;
  const c = (x: number, y: number) => Math.round(x * a + y * (1 - a)).toString(16).padStart(2, "0");
  return `#${c(r1!, r2!)}${c(g1!, g2!)}${c(b1!, b2!)}`;
}

export function buildNeovim(v: VariantConfig, opts: NvimOpts): Record<string, Attrs> {
  const p = buildPalette(v);
  const hl: Record<string, Attrs> = {};
  const bgEditor = opts.transparent ? undefined : p.bg0;

  Object.assign(hl, {
    Normal: { fg: p.fg0, bg: bgEditor },
    NormalNC: { fg: p.fg0, bg: bgEditor },
    NormalFloat: { fg: p.fg0, bg: p.bg1 },
    FloatBorder: { fg: p.accents.blue, bg: p.bg1 },
    FloatTitle: { fg: p.accents.blue, bg: p.bg1, bold: true },
    Cursor: { fg: p.bg0, bg: p.fg0 },
    CursorLine: { bg: p.bg2 }, CursorColumn: { bg: p.bg2 },
    CursorLineNr: { fg: p.accents.yellow, bold: true },
    LineNr: { fg: p.fg2 }, SignColumn: { bg: bgEditor },
    Visual: { bg: p.bg3 }, VisualNOS: { bg: p.bg3 },
    Search: { fg: p.bg0, bg: p.accents.yellow }, IncSearch: { fg: p.bg0, bg: p.accents.orange }, CurSearch: { fg: p.bg0, bg: p.accents.orange },
    Pmenu: { fg: p.fg0, bg: p.bg1 }, PmenuSel: { fg: p.bg0, bg: p.accents.blue, bold: true },
    PmenuSbar: { bg: p.bg1 }, PmenuThumb: { bg: p.bg3 },
    StatusLine: { fg: p.fg1, bg: p.bg1 }, StatusLineNC: { fg: p.fg2, bg: p.bg1 },
    TabLine: { fg: p.fg2, bg: p.bg1 }, TabLineSel: { fg: p.bg0, bg: p.accents.blue }, TabLineFill: { bg: p.bg1 },
    WinSeparator: { fg: p.bg3, bold: true }, VertSplit: { fg: p.bg3 },
    Folded: { fg: p.accents.blue, bg: p.bg1 }, FoldColumn: { fg: p.fg2, bg: bgEditor },
    MatchParen: { fg: p.accents.orange, bold: true },
    Title: { fg: p.accents.blue, bold: true }, Directory: { fg: p.accents.blue },
    NonText: { fg: p.bg3 }, Whitespace: { fg: p.bg3 }, SpecialKey: { fg: p.bg3 },
    ColorColumn: { bg: p.bg1 }, QuickFixLine: { bg: p.bg3, bold: true },
    ErrorMsg: { fg: p.accents.red }, WarningMsg: { fg: p.accents.yellow }, ModeMsg: { fg: p.fg1, bold: true },
    WinBar: { fg: p.fg1, bg: bgEditor }, WinBarNC: { fg: p.fg2, bg: bgEditor },
  } satisfies Record<string, Attrs>);

  (Object.keys(ROLE_GROUPS) as Role[]).forEach((role) => {
    const style: TokenStyle = TOKENS[role]; const groups = ROLE_GROUPS[role];
    if (!groups || !groups.length) return;
    const attrs: Attrs = { fg: slot(p, style.color) };
    if (style.bold && opts.bold) attrs.bold = true;
    if (style.italic) attrs.italic = true;
    for (const g of groups) hl[g] = { ...attrs };
  });

  const diag: [string, AccentName][] = [["Error", "red"], ["Warn", "yellow"], ["Info", "blue"], ["Hint", "teal"], ["Ok", "green"]];
  for (const [name, acc] of diag) {
    hl[`Diagnostic${name}`] = { fg: p.accents[acc] };
    hl[`DiagnosticVirtualText${name}`] = { fg: p.accents[acc], bg: p.bg1 };
    hl[`DiagnosticUnderline${name}`] = { undercurl: true, sp: p.accents[acc] };
  }
  hl.SpellBad = { undercurl: true, sp: p.accents.red };
  hl.SpellCap = { undercurl: true, sp: p.accents.yellow };

  hl.DiffAdd = { bg: mix(p.accents.green, p.bg0) }; hl.DiffChange = { bg: mix(p.accents.blue, p.bg0) };
  hl.DiffDelete = { bg: mix(p.accents.red, p.bg0) }; hl.DiffText = { bg: mix(p.accents.blue, p.bg2) };
  hl.GitSignsAdd = { fg: p.accents.green }; hl.GitSignsChange = { fg: p.accents.blue }; hl.GitSignsDelete = { fg: p.accents.red };
  hl.Added = { fg: p.accents.green }; hl.Changed = { fg: p.accents.blue }; hl.Removed = { fg: p.accents.red };

  hl.TelescopeBorder = { fg: p.bg3, bg: p.bg1 }; hl.TelescopeNormal = { fg: p.fg0, bg: p.bg1 };
  hl.TelescopeSelection = { bg: p.bg2, bold: true }; hl.TelescopeMatching = { fg: p.accents.orange, bold: true };
  hl.SnacksPickerBorder = { fg: p.bg3, bg: p.bg1 }; hl.SnacksPickerMatch = { fg: p.accents.orange, bold: true };
  hl.CmpItemAbbrMatch = { fg: p.accents.blue, bold: true }; hl.CmpItemKind = { fg: p.accents.yellow };
  hl.IndentBlanklineChar = { fg: p.bg2 }; hl.IblIndent = { fg: p.bg2 }; hl.IblScope = { fg: p.accents.blue };

  hl["@markup.heading"] = { fg: p.accents.blue, bold: true }; hl["@markup.link"] = { fg: p.accents.teal, underline: true };
  hl["@markup.list"] = { fg: p.accents.orange }; hl["@markup.strong"] = { bold: true }; hl["@markup.italic"] = { italic: true };

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
    return `  ${esc(g)} = { ${parts.join(", ")} },`;
  }).join("\n");
  return `-- generated by duskbox; do not edit by hand\nreturn {\n${body}\n}\n`;
}
