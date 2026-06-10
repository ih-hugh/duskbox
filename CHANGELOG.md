# Changelog

All notable changes to **duskbox** are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/); versioning is [SemVer](https://semver.org/).

## [1.3.0] — 2026-06-10

### Added
- **Markdown & docs styling**: hue-graded heading ladder anchored at each variant's signature
  (`signature ?? blue`, −25° OKLCH walk), real bold/italic, inline-code (chips in Neovim),
  styled links, quotes, list markers, separators, strikethrough.
- **Per-language detail**: JSON/YAML keys, CSS properties/units/hex-colors/`!important`/selectors,
  regex internals, JSDoc tags, diff/patch styling.
- **Semantic-token depth**: parameters italic, decorators/`self` on the builtin slot (follows the
  signature on signature variants), readonly + enum members purple, interfaces & type parameters
  distinct from classes.

### Changed
- **Punctuation calm-down**: separators, delimiters and symbolic operators recede to a dedicated
  punctuation tone (WCAG-floored: ≥3:1, ≥4.5:1 on high-contrast variants). Wordy operators
  (`typeof`, `instanceof`, `new`) stay keywords; string quotes stay string-colored.
- Parameters: muted yellow → plain foreground with italic (the italic is the new identity).

[1.3.0]: https://github.com/ih-hugh/duskbox/releases/tag/v1.3.0

## [1.2.2] — 2026-06-06

### Fixed
- Neovim: `duskbox.load()` no longer force-loads `lualine` while applying the colorscheme. Under
  lazy.nvim, `require("lualine")` *triggers* the plugin to load, and because the colorscheme is
  applied very early in startup — before `Snacks` is initialized — running LazyVim's lualine config
  then crashed with "attempt to index global 'Snacks' (a nil value)". The statusline theme now
  applies only to an already-loaded lualine, so startup is clean and live `:colorscheme` switches
  still make the statusline follow the variant.

[1.2.2]: https://github.com/ih-hugh/duskbox/releases/tag/v1.2.2

## [1.2.1] — 2026-06-06

### Changed
- The VS Marketplace / Open VSX listing now shows the **OKLCH palette diagram and the eight core
  variant previews** inline (rendered to PNG, since the stores reject SVG in the README). New
  `pnpm gallery:png` rasterizes `docs/img/*.svg` → PNG from the same source; GitHub keeps the SVGs.
- Documented the `lualine` setup option in the README.

[1.2.1]: https://github.com/ih-hugh/duskbox/releases/tag/v1.2.1

## [1.2.0] — 2026-06-06

### Fixed
- High-contrast variants now color the focused-element border with the variant's accent
  (the signature, for signature variants) instead of VS Code's default teal; ambient HC
  borders are a calm neutral.

### Changed
- Comprehensive VS Code color coverage (~230 keys): accent UI follows the variant, semantic
  markers (gutter/ruler/diff/merge/minimap) stay fixed, and widget/menu/peek surfaces come from
  the palette — no key falls back to a VS Code default.
- Neovim: comprehensive plugin coverage (blink.cmp, bufferline, noice, snacks, which-key, flash,
  trouble, render-markdown, gitsigns, mini.icons, lazy, mason, LSP references) — accent groups
  follow the variant; plus a per-variant lualine theme whose mode segment follows the variant
  (`duskbox.load` applies it; opt out with `setup({ lualine = false })`).

[1.2.0]: https://github.com/ih-hugh/duskbox/releases/tag/v1.2.0

## [1.1.1] — 2026-06-06

### Added
- A store **icon** — a dusk-horizon mark in the theme palette — plus an on-brand
  Marketplace gallery banner (`#23242e`, dark).

[1.1.1]: https://github.com/ih-hugh/duskbox/releases/tag/v1.1.1

## [1.1.0] — 2026-06-06

### Added
- **8 signature variants** — `duskbox-{dusk,cyber}-{azure,neon-purple,magenta,salmon}` —
  each recoloring `this`/`import`/`constructor`/builtins AND the decorative UI accent
  (borders, selection, matched-paren, cursor-line number, picker match) to the signature
  color. Semantic colors (diagnostics, git, literals) are unchanged. Bundle is now 16 variants.

[1.1.0]: https://github.com/ih-hugh/duskbox/releases/tag/v1.1.0

## [1.0.0] — 2026-06-05

First stable release. One OKLCH source of truth → Neovim, VS Code (+ forks), and lazygit,
so the editors and git TUI never drift.

### Added
- **8 variants** spanning light → dark plus high-contrast and a neon "cyber" option:
  `dawn`, `day`, `day-hc`, `storm`, `dusk` (default), `midnight`, `night-hc`, `cyber`.
- **Neovim** plugin: `require("duskbox").setup({ variant, bold, transparent, on_highlights })`
  and `:colorscheme duskbox-<variant>`.
- **VS Code / Cursor / VSCodium / Windsurf**: 8 themes published to the VS Marketplace and Open VSX.
- **lazygit** themes for every variant under `extras/lazygit/` (the git TUI matches the editor).
- Equiluminant OKLCH palette: accents in a narrow lightness band, variety from hue not brightness.
- High-contrast variants floored at ≥7:1 (fg + accents), backgrounds lifted off pure black.
- Distinct JSX/TSX treesitter colors for native tags vs custom components.
- Readable dimmed UI (ignored/hidden files, LSP inlay hints) on every variant.

[1.0.0]: https://github.com/ih-hugh/duskbox/releases/tag/v1.0.0
