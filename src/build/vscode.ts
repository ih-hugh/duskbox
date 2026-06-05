import type { Palette, AccentName } from "../palette/types";
import { buildPalette, type VariantConfig } from "../palette/types";
import { TOKENS, type ColorSlot, type Role, type TokenStyle } from "../tokens";
import { ROLE_SCOPES, SEMANTIC_ROLE } from "./groups-vscode";

export interface VsTheme {
  name: string; type: "dark" | "light"; semanticHighlighting: true;
  colors: Record<string, string>;
  tokenColors: { scope: string[]; settings: { foreground?: string; fontStyle?: string } }[];
  semanticTokenColors: Record<string, { foreground?: string; bold?: boolean; italic?: boolean }>;
}
function slot(p: Palette, c: ColorSlot): string {
  if (c === "fg0") return p.fg0; if (c === "fg1") return p.fg1; if (c === "fg2") return p.fg2;
  return p.accents[c as AccentName];
}
function titleCase(name: string) {
  return "Duskbox " + name.split("-").map((s) => s[0]!.toUpperCase() + s.slice(1)).join(" ").replaceAll("Hc", "HC");
}

export function uiThemeFor(v: VariantConfig): "vs" | "vs-dark" | "hc-black" | "hc-light" {
  if (v.kind === "light") return v.uiContrast === "high" ? "hc-light" : "vs";
  return v.uiContrast === "high" ? "hc-black" : "vs-dark";
}

export function buildVscode(v: VariantConfig, opts: { bold: boolean }): VsTheme {
  const p = buildPalette(v);
  const a = p.accents;
  const colors: Record<string, string> = {
    "editor.background": p.bg0, "editor.foreground": p.fg0,
    "editorLineNumber.foreground": p.fg2, "editorLineNumber.activeForeground": a.yellow,
    "editorCursor.foreground": p.fg0, "editor.selectionBackground": p.bg3,
    "editor.lineHighlightBackground": p.bg2, "editorWhitespace.foreground": p.bg3,
    "editorIndentGuide.background1": p.bg2, "editorIndentGuide.activeBackground1": a.blue,
    "editor.findMatchBackground": p.bg3, "editor.findMatchHighlightBackground": p.bg2,
    "sideBar.background": p.bg1, "sideBar.foreground": p.fg1, "sideBarTitle.foreground": p.fg0,
    "activityBar.background": p.bg1, "activityBar.foreground": p.fg0, "activityBarBadge.background": a.blue, "activityBarBadge.foreground": p.bg0,
    "statusBar.background": p.bg1, "statusBar.foreground": p.fg1,
    "statusBar.noFolderBackground": p.bg1, "statusBar.debuggingBackground": a.orange,
    "titleBar.activeBackground": p.bg1, "titleBar.activeForeground": p.fg0,
    "tab.activeBackground": p.bg0, "tab.inactiveBackground": p.bg1, "tab.activeForeground": p.fg0, "tab.inactiveForeground": p.fg2,
    "tab.activeBorderTop": a.blue, "editorGroupHeader.tabsBackground": p.bg1,
    "panel.background": p.bg1, "panel.border": p.bg3, "terminal.background": p.bg0, "terminal.foreground": p.fg0,
    "list.activeSelectionBackground": p.bg3, "list.activeSelectionForeground": p.fg0,
    "list.inactiveSelectionBackground": p.bg2, "list.hoverBackground": p.bg2, "list.highlightForeground": a.orange,
    "input.background": p.bg1, "input.foreground": p.fg0, "input.border": p.bg3,
    "focusBorder": a.blue, "foreground": p.fg1, "widget.shadow": "#00000066",
    "button.background": a.blue, "button.foreground": p.bg0,
    "badge.background": a.blue, "badge.foreground": p.bg0,
    "gitDecoration.addedResourceForeground": a.green, "gitDecoration.modifiedResourceForeground": a.blue, "gitDecoration.deletedResourceForeground": a.red,
    "editorError.foreground": a.red, "editorWarning.foreground": a.yellow, "editorInfo.foreground": a.blue,
    "terminal.ansiBlack": p.bg2, "terminal.ansiRed": a.red, "terminal.ansiGreen": a.green, "terminal.ansiYellow": a.yellow,
    "terminal.ansiBlue": a.blue, "terminal.ansiMagenta": a.magenta, "terminal.ansiCyan": a.cyan, "terminal.ansiWhite": p.fg1,
    "terminal.ansiBrightBlack": p.bg3, "terminal.ansiBrightRed": a.red, "terminal.ansiBrightGreen": a.green, "terminal.ansiBrightYellow": a.yellow,
    "terminal.ansiBrightBlue": a.blue, "terminal.ansiBrightMagenta": a.magenta, "terminal.ansiBrightCyan": a.cyan, "terminal.ansiBrightWhite": p.fg0,
  };

  const tokenColors: VsTheme["tokenColors"] = [];
  (Object.keys(ROLE_SCOPES) as Role[]).forEach((role) => {
    const scopes = ROLE_SCOPES[role]; if (!scopes) return;
    const st: TokenStyle = TOKENS[role];
    const fontStyle = [st.italic ? "italic" : "", st.bold && opts.bold ? "bold" : ""].filter(Boolean).join(" ");
    tokenColors.push({ scope: scopes, settings: { foreground: slot(p, st.color), ...(fontStyle ? { fontStyle } : {}) } });
  });

  const semanticTokenColors: VsTheme["semanticTokenColors"] = {};
  for (const [sem, role] of Object.entries(SEMANTIC_ROLE)) {
    const st: TokenStyle = TOKENS[role];
    semanticTokenColors[sem] = { foreground: slot(p, st.color), ...(st.bold && opts.bold ? { bold: true } : {}), ...(st.italic ? { italic: true } : {}) };
  }

  return { name: titleCase(v.name), type: v.kind, semanticHighlighting: true, colors, tokenColors, semanticTokenColors };
}
