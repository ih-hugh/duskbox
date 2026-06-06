# Changelog

All notable changes to **duskbox** are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/); versioning is [SemVer](https://semver.org/).

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
