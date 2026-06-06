import { blend } from "./blend";
import type { Palette } from "../palette/types";
import type { Attrs } from "./neovim";

// Highlight groups for the installed plugins. `ui` = signature ?? blue (accent follows the
// variant; base variants pass blue so they stay byte-identical). Semantic groups use fixed
// accents; neutral groups use the bg/fg ramp.
export function buildPluginGroups(p: Palette, ui: string): Record<string, Attrs> {
  const a = p.accents;
  const g: Record<string, Attrs> = {};

  // blink.cmp (the completion menu)
  Object.assign(g, {
    BlinkCmpMenu: { bg: p.bg1 }, BlinkCmpDoc: { bg: p.bg1 }, BlinkCmpScrollBarGutter: { bg: p.bg1 },
    BlinkCmpMenuBorder: { fg: ui }, BlinkCmpDocBorder: { fg: ui }, BlinkCmpSignatureHelpBorder: { fg: ui },
    BlinkCmpLabelMatch: { fg: ui, bold: true }, BlinkCmpSignatureHelpActiveParameter: { fg: ui, bold: true },
    BlinkCmpMenuSelection: { bg: p.bg2, bold: true }, BlinkCmpScrollBarThumb: { bg: p.bg3 }, BlinkCmpDocCursorLine: { bg: p.bg2 },
    BlinkCmpLabel: { fg: p.fg0 }, BlinkCmpLabelDescription: { fg: p.fg2 }, BlinkCmpLabelDetail: { fg: p.fg2 },
    BlinkCmpSource: { fg: p.fg2 }, BlinkCmpGhostText: { fg: p.fg2, italic: true }, BlinkCmpLabelDeprecated: { fg: p.fg2 },
    BlinkCmpKind: { fg: a.yellow },
  });

  // bufferline (buffer tabs)
  Object.assign(g, {
    BufferLineFill: { bg: p.bg1 }, BufferLineBackground: { fg: p.fg2, bg: p.bg1 },
    BufferLineBuffer: { fg: p.fg2, bg: p.bg1 }, BufferLineBufferVisible: { fg: p.fg2, bg: p.bg1 },
    BufferLineBufferSelected: { fg: p.fg0, bg: p.bg0, bold: true }, BufferLineNumbersSelected: { fg: p.fg0, bg: p.bg0 },
    BufferLineIndicatorSelected: { fg: ui }, BufferLineIndicatorVisible: { fg: p.bg1 },
    BufferLineSeparator: { fg: p.bg0, bg: p.bg1 }, BufferLineSeparatorVisible: { fg: p.bg0, bg: p.bg1 }, BufferLineSeparatorSelected: { fg: p.bg0, bg: p.bg0 },
    BufferLineCloseButton: { fg: p.fg2, bg: p.bg1 }, BufferLineCloseButtonVisible: { fg: p.fg2, bg: p.bg1 }, BufferLineCloseButtonSelected: { fg: p.fg1, bg: p.bg0 },
    BufferLineModified: { fg: a.green, bg: p.bg1 }, BufferLineModifiedVisible: { fg: a.green, bg: p.bg1 }, BufferLineModifiedSelected: { fg: a.green, bg: p.bg0 },
    BufferLineError: { fg: a.red, bg: p.bg1 }, BufferLineErrorSelected: { fg: a.red, bg: p.bg0 },
    BufferLineWarning: { fg: a.yellow, bg: p.bg1 }, BufferLineWarningSelected: { fg: a.yellow, bg: p.bg0 },
    BufferLineInfo: { fg: a.blue, bg: p.bg1 }, BufferLineInfoSelected: { fg: a.blue, bg: p.bg0 },
    BufferLineDuplicate: { fg: p.fg2, bg: p.bg1, italic: true }, BufferLineDuplicateSelected: { fg: p.fg2, bg: p.bg0, italic: true },
  });

  // noice
  Object.assign(g, {
    NoiceCmdline: { bg: p.bg1 }, NoiceCmdlinePopup: { bg: p.bg1 }, NoicePopup: { bg: p.bg1 }, NoiceConfirm: { bg: p.bg1 }, NoiceMini: { bg: p.bg1 }, NoicePopupmenu: { bg: p.bg1 },
    NoiceCmdlineIcon: { fg: ui }, NoiceCmdlinePopupBorder: { fg: ui }, NoiceCmdlinePopupTitle: { fg: ui, bold: true }, NoiceCmdlinePrompt: { fg: ui },
    NoicePopupBorder: { fg: ui }, NoiceConfirmBorder: { fg: ui }, NoicePopupmenuBorder: { fg: ui }, NoicePopupmenuMatch: { fg: ui, bold: true },
    NoiceCmdlineIconSearch: { fg: a.yellow }, NoiceCmdlinePopupBorderSearch: { fg: a.yellow },
    NoicePopupmenuSelected: { bg: p.bg2, bold: true }, NoiceVirtualText: { fg: p.fg2 }, NoiceScrollbarThumb: { bg: p.bg3 }, NoiceScrollbar: { bg: p.bg1 },
    NoiceLspProgressTitle: { fg: p.fg1 }, NoiceLspProgressClient: { fg: a.blue }, NoiceLspProgressSpinner: { fg: a.teal },
    NoiceFormatProgressDone: { fg: a.green }, NoiceFormatProgressTodo: { fg: p.fg2 },
  });

  // snacks (notifier / dashboard / indent / picker extras / input)
  Object.assign(g, {
    SnacksPickerTitle: { fg: ui, bold: true }, SnacksPickerPrompt: { fg: ui }, SnacksPickerInputBorder: { fg: ui },
    SnacksPickerListCursorLine: { bg: p.bg2 }, SnacksPickerDir: { fg: p.fg2 }, SnacksPickerTotals: { fg: p.fg2 }, SnacksPickerSelected: { fg: ui },
    SnacksNotifierInfo: { fg: a.blue }, SnacksNotifierIconInfo: { fg: a.blue }, SnacksNotifierTitleInfo: { fg: a.blue }, SnacksNotifierBorderInfo: { fg: a.blue },
    SnacksNotifierWarn: { fg: a.yellow }, SnacksNotifierIconWarn: { fg: a.yellow }, SnacksNotifierTitleWarn: { fg: a.yellow }, SnacksNotifierBorderWarn: { fg: a.yellow },
    SnacksNotifierError: { fg: a.red }, SnacksNotifierIconError: { fg: a.red }, SnacksNotifierTitleError: { fg: a.red }, SnacksNotifierBorderError: { fg: a.red },
    SnacksNotifierDebug: { fg: p.fg2 }, SnacksNotifierTrace: { fg: a.purple }, SnacksNotifierHistory: { bg: p.bg1 },
    SnacksDashboardKey: { fg: ui, bold: true }, SnacksDashboardHeader: { fg: ui }, SnacksDashboardIcon: { fg: a.yellow }, SnacksDashboardSpecial: { fg: a.purple },
    SnacksDashboardDesc: { fg: p.fg1 }, SnacksDashboardFile: { fg: p.fg1 }, SnacksDashboardFooter: { fg: p.fg2 }, SnacksDashboardDir: { fg: p.fg2 }, SnacksDashboardTitle: { fg: p.fg0, bold: true },
    SnacksIndent: { fg: p.bg2 }, SnacksIndentChunk: { fg: p.bg3 }, SnacksIndentScope: { fg: ui },
    SnacksInputBorder: { fg: ui }, SnacksInputTitle: { fg: ui, bold: true }, SnacksInputIcon: { fg: ui },
  });

  // which-key
  Object.assign(g, {
    WhichKey: { fg: ui }, WhichKeyBorder: { fg: ui }, WhichKeyTitle: { fg: ui, bold: true },
    WhichKeyGroup: { fg: a.teal }, WhichKeyDesc: { fg: p.fg0 }, WhichKeySeparator: { fg: p.fg2 }, WhichKeyValue: { fg: p.fg2 },
    WhichKeyFloat: { bg: p.bg1 }, WhichKeyNormal: { bg: p.bg1 },
  });
  // flash
  Object.assign(g, {
    FlashLabel: { fg: p.bg0, bg: ui, bold: true }, FlashMatch: { fg: p.fg2, bg: p.bg2 }, FlashCurrent: { fg: p.bg0, bg: a.yellow },
    FlashBackdrop: { fg: p.fg2 }, FlashPrompt: { fg: p.fg0, bg: p.bg1 }, FlashPromptIcon: { fg: ui },
  });
  // trouble
  Object.assign(g, {
    TroubleNormal: { bg: p.bg1 }, TroubleText: { fg: p.fg1 },
    TroubleSource: { fg: p.fg2 }, TroublePos: { fg: p.fg2 }, TroubleIndent: { fg: p.bg3 },
    TroubleCount: { fg: ui, bold: true }, TroubleFoldIcon: { fg: ui },
  });
  // render-markdown
  const hbg = (acc: string) => blend(p.bg0, acc, 0.1);
  Object.assign(g, {
    RenderMarkdownH1: { fg: a.blue, bold: true }, RenderMarkdownH2: { fg: a.teal, bold: true }, RenderMarkdownH3: { fg: a.green, bold: true },
    RenderMarkdownH4: { fg: a.yellow, bold: true }, RenderMarkdownH5: { fg: a.orange, bold: true }, RenderMarkdownH6: { fg: a.red, bold: true },
    RenderMarkdownH1Bg: { bg: hbg(a.blue) }, RenderMarkdownH2Bg: { bg: hbg(a.teal) }, RenderMarkdownH3Bg: { bg: hbg(a.green) },
    RenderMarkdownH4Bg: { bg: hbg(a.yellow) }, RenderMarkdownH5Bg: { bg: hbg(a.orange) }, RenderMarkdownH6Bg: { bg: hbg(a.red) },
    RenderMarkdownChecked: { fg: a.green }, RenderMarkdownUnchecked: { fg: p.fg2 },
    RenderMarkdownInfo: { fg: a.blue }, RenderMarkdownWarn: { fg: a.yellow }, RenderMarkdownError: { fg: a.red }, RenderMarkdownHint: { fg: a.teal },
    RenderMarkdownCode: { bg: p.bg1 }, RenderMarkdownCodeInline: { bg: p.bg2 }, RenderMarkdownBullet: { fg: a.orange },
    RenderMarkdownDash: { fg: p.fg2 }, RenderMarkdownQuote: { fg: p.fg2 }, RenderMarkdownTableHead: { fg: p.fg1 }, RenderMarkdownTableRow: { fg: p.fg2 },
    RenderMarkdownLink: { fg: a.teal, underline: true }, RenderMarkdownSign: { fg: p.fg2 },
  });
  // gitsigns extras (Add/Change/Delete already set in neovim.ts)
  Object.assign(g, {
    GitSignsStagedAdd: { fg: blend(a.green, p.fg0, 0.4) }, GitSignsStagedChange: { fg: blend(a.blue, p.fg0, 0.4) }, GitSignsStagedDelete: { fg: blend(a.red, p.fg0, 0.4) },
    GitSignsAddInline: { bg: blend(p.bg0, a.green, 0.25) }, GitSignsChangeInline: { bg: blend(p.bg0, a.blue, 0.25) }, GitSignsDeleteInline: { bg: blend(p.bg0, a.red, 0.25) },
    GitSignsAddPreview: { bg: blend(p.bg0, a.green, 0.18) }, GitSignsDeletePreview: { bg: blend(p.bg0, a.red, 0.18) },
    GitSignsCurrentLineBlame: { fg: p.fg2, italic: true },
  });
  // mini.icons
  Object.assign(g, {
    MiniIconsRed: { fg: a.red }, MiniIconsOrange: { fg: a.orange }, MiniIconsYellow: { fg: a.yellow }, MiniIconsGreen: { fg: a.green },
    MiniIconsCyan: { fg: a.cyan }, MiniIconsAzure: { fg: a.teal }, MiniIconsBlue: { fg: a.blue }, MiniIconsPurple: { fg: a.purple }, MiniIconsGrey: { fg: p.fg2 },
  });
  // lazy.nvim
  Object.assign(g, {
    LazyNormal: { bg: p.bg1 }, LazyButton: { fg: p.fg1, bg: p.bg2 }, LazyComment: { fg: p.fg2 }, LazyDimmed: { fg: p.fg2 }, LazyProp: { fg: p.fg2 },
    LazyValue: { fg: p.fg1 }, LazyDir: { fg: a.teal }, LazyUrl: { fg: a.teal }, LazyCommit: { fg: a.green },
    LazyButtonActive: { fg: p.bg0, bg: ui, bold: true }, LazyH1: { fg: p.bg0, bg: ui, bold: true }, LazySpecial: { fg: ui },
    LazyProgressDone: { fg: a.green }, LazyProgressTodo: { fg: p.bg3 },
    LazyReasonPlugin: { fg: a.purple }, LazyReasonEvent: { fg: a.yellow }, LazyReasonKeys: { fg: a.teal }, LazyReasonCmd: { fg: a.orange }, LazyReasonFt: { fg: a.blue },
  });
  // mason
  Object.assign(g, {
    MasonNormal: { bg: p.bg1 }, MasonMuted: { fg: p.fg2 }, MasonMutedBlock: { fg: p.fg2 },
    MasonHeader: { fg: p.bg0, bg: ui, bold: true }, MasonHeaderSecondary: { fg: p.bg0, bg: ui, bold: true }, MasonHighlight: { fg: ui },
    MasonHighlightBlock: { fg: p.bg0, bg: ui }, MasonHighlightBlockBold: { fg: p.bg0, bg: ui, bold: true },
    MasonError: { fg: a.red }, MasonWarning: { fg: a.yellow },
  });
  // LSP refs/codelens + treesitter-context
  Object.assign(g, {
    LspReferenceText: { bg: p.bg2 }, LspReferenceRead: { bg: p.bg2 }, LspReferenceWrite: { bg: p.bg2 },
    LspSignatureActiveParameter: { fg: ui, bold: true }, LspCodeLens: { fg: p.fg2, italic: true }, LspCodeLensSeparator: { fg: p.fg2, italic: true }, LspInfoBorder: { fg: ui },
    TreesitterContext: { bg: p.bg1 }, TreesitterContextLineNumber: { fg: p.fg2 }, TreesitterContextSeparator: { fg: p.bg3 },
  });

  return g;
}
