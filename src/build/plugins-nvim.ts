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

  return g;
}
