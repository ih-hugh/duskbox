# duskbox

A calm, **equiluminant** theme family for **Neovim** and **VS Code** (and forks: Cursor, VSCodium, Windsurf…). Eight variants spanning light → dark plus high-contrast and a neon "cyber" option — all generated from one OKLCH source of truth, so the two editors never drift.

> Warm declarations, cool literals, **bold keywords & types** for legibility. Calm by default; punchy where you want it (hello, `cyber`).

## Variants

| Variant | Mood |
| --- | --- |
| `duskbox-dawn` | soft light (early morning) |
| `duskbox-day` | bright light |
| `duskbox-day-hc` | high-contrast light |
| `duskbox-storm` | soft mid-dark |
| `duskbox-dusk` | balanced dark (default) |
| `duskbox-midnight` | deep, dim dark |
| `duskbox-night-hc` | high-contrast dark |
| `duskbox-cyber` | neon-on-black (high contrast) |

## Gallery

![dusk](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk.svg)
![cyber](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber.svg)
![night-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/night-hc.svg)
![midnight](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/midnight.svg)
![storm](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/storm.svg)
![day](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day.svg)
![day-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day-hc.svg)
![dawn](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dawn.svg)

## Neovim

With [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "ih-hugh/duskbox",
  lazy = false,
  priority = 1000,
  config = function()
    require("duskbox").setup({ variant = "dusk", bold = true, transparent = false })
    vim.cmd.colorscheme("duskbox-dusk")
  end,
}
```

Switch variants anytime with `:colorscheme duskbox-<variant>` (e.g. `:colorscheme duskbox-cyber`).

`setup` options:

| option | default | meaning |
| --- | --- | --- |
| `variant` | `"dusk"` | default variant for `require("duskbox").load()` |
| `bold` | `true` | bold keywords & types (set `false` to disable) |
| `transparent` | `false` | clear the editor background |
| `on_highlights` | `nil` | `function(variant) ... end` hook after load |

## VS Code / Cursor / VSCodium / Windsurf

- **VS Code:** install **Duskbox** from the Marketplace, then *Preferences: Color Theme* and pick a Duskbox variant.
- **Forks (Cursor, VSCodium, Windsurf…):** install **Duskbox** from [Open VSX](https://open-vsx.org/), or download the `.vsix` from [Releases](https://github.com/ih-hugh/duskbox/releases) and run `code --install-extension duskbox.vsix` (or your fork's equivalent CLI).

## Lazygit

duskbox ships a matching [lazygit](https://github.com/jesseduffield/lazygit) theme for every variant under [`extras/lazygit/`](./extras/lazygit).

- **From inside Neovim (recommended, zero setup):** LazyVim/[Snacks](https://github.com/folke/snacks.nvim) auto-generate a lazygit theme from your *active* colorscheme, so `<leader>gg` already matches whichever duskbox variant is loaded.
- **Standalone `lazygit`:** append a variant's `gui.theme` block to your lazygit config (`~/Library/Application Support/lazygit/config.yml` on macOS, else `~/.config/lazygit/config.yml`):

  ```sh
  curl -fsSL https://raw.githubusercontent.com/ih-hugh/duskbox/main/extras/lazygit/duskbox-dusk.yml \
    >> "$(lazygit --print-config-dir)/config.yml"
  ```

## Build from source

```sh
pnpm install
pnpm build      # regenerate colors/*.lua, lua/duskbox/themes/*.lua, themes/*.json
pnpm test       # vitest: OKLCH math, contrast gates, emitters, determinism
pnpm gallery    # regenerate docs/img/*.svg
```

Everything is generated from `src/`: palettes are authored in **OKLCH** (`src/palette/variants.ts`) and a shared semantic token map (`src/tokens.ts`) defines the identity. Edit those, run `pnpm build`, and both editors update from the single source.

## Design

duskbox is designed in **OKLCH** (a perceptually-uniform color space): accents share a narrow lightness band (equiluminant) at moderate chroma, so nothing "vibrates," and variety comes from hue rather than brightness. High-contrast variants widen the foreground/background gap and raise chroma; `cyber` reuses a neon palette. Every accent is gated on WCAG contrast in the test suite.

## License

MIT © Hugo (ih-hugh)
