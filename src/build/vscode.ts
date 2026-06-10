import { buildPalette, type VariantConfig } from "../palette/types";
import { TOKENS, slot, type Role, type TokenStyle } from "../tokens";
import { ROLE_SCOPES, SEMANTIC_ROLE } from "./groups-vscode";
import { blend, muteHex } from "./blend";

export interface VsTheme {
  name: string; type: "dark" | "light"; semanticHighlighting: true;
  colors: Record<string, string>;
  tokenColors: { scope: string[]; settings: { foreground?: string; fontStyle?: string } }[];
  semanticTokenColors: Record<string, { foreground?: string; bold?: boolean; italic?: boolean }>;
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
  const sig = p.signature;            // undefined for base variants
  const ui = sig ?? a.blue;           // decorative accents already blue
  const uiYellow = sig ?? a.yellow;   // active line number
  const uiOrange = sig ?? a.orange;   // fuzzy-match highlight
  const isHC = v.uiContrast === "high";
  const ann = blend(p.bg0, p.fg0, 0.34);                 // calm-but-visible ambient border (HC contrastBorder)
  const sel = p.bg3;                                     // tinted selection / active surface
  const A = (hex: string, alpha: string) => hex + alpha; // hex + 2-digit alpha
  const colors: Record<string, string> = {
    "editor.background": p.bg0, "editor.foreground": p.fg0,
    "editorLineNumber.foreground": p.fg2, "editorLineNumber.activeForeground": uiYellow,
    "editorCursor.foreground": p.fg0, "editor.selectionBackground": p.bg3,
    "editor.lineHighlightBackground": p.bg2, "editorWhitespace.foreground": p.bg3,
    "editorIndentGuide.background1": p.bg2, "editorIndentGuide.activeBackground1": ui,
    "editor.findMatchBackground": p.bg3, "editor.findMatchHighlightBackground": p.bg2,
    "sideBar.background": p.bg1, "sideBar.foreground": p.fg1, "sideBarTitle.foreground": p.fg0,
    "activityBar.background": p.bg1, "activityBar.foreground": p.fg0, "activityBarBadge.background": ui, "activityBarBadge.foreground": p.bg0,
    "statusBar.background": p.bg1, "statusBar.foreground": p.fg1,
    "statusBar.noFolderBackground": p.bg1, "statusBar.debuggingBackground": a.orange,
    "titleBar.activeBackground": p.bg1, "titleBar.activeForeground": p.fg0,
    "tab.activeBackground": p.bg0, "tab.inactiveBackground": p.bg1, "tab.activeForeground": p.fg0, "tab.inactiveForeground": p.fg2,
    "tab.activeBorderTop": ui, "editorGroupHeader.tabsBackground": p.bg1,
    "panel.background": p.bg1, "panel.border": p.bg3, "terminal.background": p.bg0, "terminal.foreground": p.fg0,
    "list.activeSelectionBackground": p.bg3, "list.activeSelectionForeground": p.fg0,
    "list.inactiveSelectionBackground": p.bg2, "list.hoverBackground": p.bg2, "list.highlightForeground": uiOrange,
    "input.background": p.bg1, "input.foreground": p.fg0, "input.border": p.bg3,
    "focusBorder": ui, "foreground": p.fg1, "widget.shadow": "#00000066",
    "button.background": ui, "button.foreground": p.bg0,
    "badge.background": ui, "badge.foreground": p.bg0,
    "gitDecoration.addedResourceForeground": a.green, "gitDecoration.modifiedResourceForeground": a.blue, "gitDecoration.deletedResourceForeground": a.red,
    "gitDecoration.ignoredResourceForeground": p.fg2, "list.deemphasizedForeground": p.fg2,
    "editorInlayHint.foreground": p.fg2, "editorInlayHint.background": p.bg1,
    "editorInlayHint.typeForeground": p.fg2, "editorInlayHint.parameterForeground": p.fg2,
    "editorError.foreground": a.red, "editorWarning.foreground": a.yellow, "editorInfo.foreground": a.blue,
    "terminal.ansiBlack": p.bg2, "terminal.ansiRed": a.red, "terminal.ansiGreen": a.green, "terminal.ansiYellow": a.yellow,
    "terminal.ansiBlue": a.blue, "terminal.ansiMagenta": a.magenta, "terminal.ansiCyan": a.cyan, "terminal.ansiWhite": p.fg1,
    "terminal.ansiBrightBlack": p.bg3, "terminal.ansiBrightRed": a.red, "terminal.ansiBrightGreen": a.green, "terminal.ansiBrightYellow": a.yellow,
    "terminal.ansiBrightBlue": a.blue, "terminal.ansiBrightMagenta": a.magenta, "terminal.ansiBrightCyan": a.cyan, "terminal.ansiBrightWhite": p.fg0,
  };
  if (sig) colors["editorBracketMatch.border"] = sig;
  // (1) Accent — foreground/border/thin surfaces follow the variant (signature ?? blue)
  Object.assign(colors, {
    "selection.background": sel,
    "progressBar.background": ui,
    "pickerGroup.foreground": ui,
    "textLink.foreground": ui,
    "textLink.activeForeground": blend(ui, p.fg0, 0.25),
    "editorLink.activeForeground": ui,
    "notificationLink.foreground": ui,
    "breadcrumb.activeSelectionForeground": ui,
    "panelTitle.activeBorder": ui,
    "tab.activeBorder": ui,
    "sash.hoverBorder": ui,
    "button.hoverBackground": blend(ui, p.fg0, 0.18),
    "list.focusOutline": ui,
    "list.focusAndSelectionOutline": ui,
    "inputOption.activeBorder": ui,
    "inputOption.activeForeground": p.fg0,
    "keybindingLabel.foreground": ui,
    "peekView.border": ui,
    "editorSuggestWidget.highlightForeground": ui,
    "editorSuggestWidget.focusHighlightForeground": ui,
    "statusBarItem.remoteBackground": ui,
    "statusBarItem.remoteForeground": p.bg0,
    "notebook.focusedCellBorder": ui,
    "editorBracketHighlight.foreground1": a.yellow,
    "editorBracketHighlight.foreground2": a.purple,
    "editorBracketHighlight.foreground3": a.blue,
    "editorBracketHighlight.foreground4": a.green,
    "editorBracketHighlight.foreground5": a.orange,
    "editorBracketHighlight.foreground6": a.teal,
    "editorBracketHighlight.unexpectedBracket.foreground": a.red,
  });
  // (HC fix) only high-contrast variants get element borders; active = signature, ambient = calm
  if (isHC) {
    colors["contrastActiveBorder"] = ui;
    colors["contrastBorder"] = ann;
  }
  // (2) Semantic — fixed meaning, never the variant accent
  Object.assign(colors, {
    "editorGutter.addedBackground": a.green, "editorGutter.modifiedBackground": a.blue, "editorGutter.deletedBackground": a.red,
    "editorGutter.foldingControlForeground": p.fg2,
    "editorOverviewRuler.errorForeground": a.red, "editorOverviewRuler.warningForeground": a.yellow, "editorOverviewRuler.infoForeground": a.blue,
    "editorOverviewRuler.addedForeground": a.green, "editorOverviewRuler.modifiedForeground": a.blue, "editorOverviewRuler.deletedForeground": a.red,
    "editorOverviewRuler.findMatchForeground": A(a.yellow, "99"), "editorOverviewRuler.bracketMatchForeground": p.fg2,
    "editorHint.foreground": a.teal,
    "diffEditor.insertedTextBackground": A(a.green, "22"), "diffEditor.removedTextBackground": A(a.red, "22"),
    "diffEditor.insertedLineBackground": A(a.green, "14"), "diffEditor.removedLineBackground": A(a.red, "14"),
    "merge.currentHeaderBackground": A(a.blue, "66"), "merge.currentContentBackground": A(a.blue, "22"),
    "merge.incomingHeaderBackground": A(a.purple, "66"), "merge.incomingContentBackground": A(a.purple, "22"),
    "minimap.findMatchHighlight": a.yellow, "minimap.errorHighlight": a.red, "minimap.warningHighlight": a.yellow,
    "minimapGutter.addedBackground": a.green, "minimapGutter.modifiedBackground": a.blue, "minimapGutter.deletedBackground": a.red,
    "gitDecoration.untrackedResourceForeground": a.green, "gitDecoration.conflictingResourceForeground": a.orange,
    "gitDecoration.stageModifiedResourceForeground": a.blue, "gitDecoration.submoduleResourceForeground": a.purple,
    "problemsErrorIcon.foreground": a.red, "problemsWarningIcon.foreground": a.yellow, "problemsInfoIcon.foreground": a.blue,
    "notificationsErrorIcon.foreground": a.red, "notificationsWarningIcon.foreground": a.yellow, "notificationsInfoIcon.foreground": a.blue,
    "testing.iconPassed": a.green, "testing.iconFailed": a.red, "testing.iconQueued": a.yellow,
    "debugIcon.breakpointForeground": a.red,
    "debugConsole.errorForeground": a.red, "debugConsole.infoForeground": a.blue, "debugConsole.warningForeground": a.yellow,
    "inputValidation.errorBackground": A(a.red, "33"), "inputValidation.errorBorder": a.red,
    "inputValidation.warningBackground": A(a.yellow, "33"), "inputValidation.warningBorder": a.yellow,
    "inputValidation.infoBackground": A(a.blue, "33"), "inputValidation.infoBorder": a.blue,
    "list.errorForeground": a.red, "list.warningForeground": a.yellow,
  });
  // (3) Neutral — surfaces from the bg/fg ramp
  Object.assign(colors, {
    "editorWidget.background": p.bg1, "editorWidget.border": p.bg3, "editorWidget.foreground": p.fg0,
    "editorSuggestWidget.background": p.bg1, "editorSuggestWidget.border": p.bg3, "editorSuggestWidget.foreground": p.fg0, "editorSuggestWidget.selectedBackground": p.bg2,
    "editorHoverWidget.background": p.bg1, "editorHoverWidget.border": p.bg3, "editorHoverWidget.foreground": p.fg0,
    "dropdown.background": p.bg1, "dropdown.listBackground": p.bg1, "dropdown.border": p.bg3, "dropdown.foreground": p.fg0,
    "quickInput.background": p.bg1, "quickInput.foreground": p.fg0, "quickInputList.focusBackground": p.bg2, "quickInputList.focusForeground": p.fg0,
    "menu.background": p.bg1, "menu.foreground": p.fg0, "menu.border": p.bg3, "menu.selectionBackground": p.bg2, "menu.selectionForeground": p.fg0, "menu.separatorBackground": p.bg3,
    "menubar.selectionBackground": p.bg2,
    "scrollbarSlider.background": A(p.bg3, "80"), "scrollbarSlider.hoverBackground": A(p.bg3, "aa"), "scrollbarSlider.activeBackground": A(p.bg3, "cc"),
    "breadcrumb.foreground": p.fg2, "breadcrumb.focusForeground": p.fg0, "breadcrumb.background": p.bg0, "breadcrumbPicker.background": p.bg1,
    "peekViewEditor.background": p.bg1, "peekViewResult.background": p.bg1, "peekViewTitle.background": p.bg1,
    "peekViewResult.selectionBackground": p.bg2,
    "peekViewResult.matchHighlightBackground": A(a.yellow, "33"), "peekViewEditor.matchHighlightBackground": A(a.yellow, "33"),
    "peekViewTitleLabel.foreground": p.fg0, "peekViewTitleDescription.foreground": p.fg2,
    "peekViewResult.fileForeground": p.fg1, "peekViewResult.lineForeground": p.fg2,
    "notifications.background": p.bg1, "notifications.border": p.bg3, "notifications.foreground": p.fg0,
    "notificationCenterHeader.background": p.bg2,
    "editorGutter.background": p.bg0, "editorRuler.foreground": p.bg2,
    "sideBar.border": p.bg3, "sideBarSectionHeader.background": p.bg1, "sideBarSectionHeader.foreground": p.fg1, "sideBarSectionHeader.border": p.bg3,
    "panelSectionHeader.background": p.bg1,
    "editorGroup.border": p.bg3, "editorGroupHeader.tabsBorder": p.bg3, "tab.border": p.bg1,
    "titleBar.inactiveBackground": p.bg1, "titleBar.inactiveForeground": p.fg2, "titleBar.border": p.bg3,
    "statusBar.border": p.bg3, "statusBarItem.hoverBackground": p.bg2,
    "terminal.selectionBackground": p.bg3, "terminalCursor.foreground": p.fg0, "terminalCursor.background": p.bg0,
    "tree.indentGuidesStroke": p.bg3, "checkbox.background": p.bg2, "checkbox.border": p.bg3,
    "input.placeholderForeground": p.fg2, "widget.border": p.bg3,
  });

  const tokenColors: VsTheme["tokenColors"] = [];
  (Object.keys(ROLE_SCOPES) as Role[]).forEach((role) => {
    const scopes = ROLE_SCOPES[role]; if (!scopes) return;
    const st: TokenStyle = TOKENS[role];
    const base = slot(p, st.color);
    const foreground = st.mute ? muteHex(base, p.fg0) : base;
    const fontStyle = [
      st.italic ? "italic" : "", st.bold && opts.bold ? "bold" : "",
      st.underline ? "underline" : "", st.strikethrough ? "strikethrough" : "",
    ].filter(Boolean).join(" ");
    tokenColors.push({ scope: scopes, settings: { foreground, ...(fontStyle ? { fontStyle } : {}) } });
  });

  const semanticTokenColors: VsTheme["semanticTokenColors"] = {};
  for (const [sem, role] of Object.entries(SEMANTIC_ROLE)) {
    const st: TokenStyle = TOKENS[role];
    const base = slot(p, st.color);
    const foreground = st.mute ? muteHex(base, p.fg0) : base;
    semanticTokenColors[sem] = { foreground, ...(st.bold && opts.bold ? { bold: true } : {}), ...(st.italic ? { italic: true } : {}) };
  }

  return { name: titleCase(v.name), type: v.kind, semanticHighlighting: true, colors, tokenColors, semanticTokenColors };
}
