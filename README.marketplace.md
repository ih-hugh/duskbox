# duskbox

A calm, **equiluminant** theme family for **Neovim** and **VS Code** (and forks: Cursor, VSCodium, Windsurf…). Sixteen variants — eight core moods (light → dark plus high-contrast and a neon "cyber" option), with `dusk` and `cyber` each also in four signature flavors — all generated from one OKLCH source of truth, so the two editors never drift. Richly detailed where it counts: graded Markdown headings that follow your variant, per-language token treatment (JSON · YAML · CSS · regex · doc-tags), calm punctuation, and deep LSP semantic styling.

> Warm declarations, cool literals, **bold keywords & types** for legibility. Calm by default; punchy where you want it (hello, `cyber`).

## Palette

![duskbox OKLCH palette](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/palette.png)

Designed in **OKLCH**: the nine accents share one lightness band (**equiluminant**) and get their variety from *hue, not brightness*, so nothing vibrates. In the **signature** variants, `this`/`import`/`constructor` and the UI accent take a single signature color.

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

**Signature variants:** `dusk` and `cyber` also come in four signature flavors — the standout tokens (`this`/`import`/`constructor`) and the UI accent take a signature color: `duskbox-{dusk,cyber}-{azure,neon-purple,magenta,salmon}`.

## Gallery

The eight core variants:

![dusk](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk.png)
![cyber](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber.png)
![night-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/night-hc.png)
![midnight](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/midnight.png)
![storm](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/storm.png)
![day](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day.png)
![day-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day-hc.png)
![dawn](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dawn.png)

**Signature variant previews** (azure · neon-purple · magenta · salmon, each on `dusk` and `cyber`): see the [full gallery on GitHub](https://github.com/ih-hugh/duskbox#gallery).

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
| `lualine` | `true` | apply the matching lualine theme on load (set `false` to keep your own) |
| `on_highlights` | `nil` | `function(variant) ... end` hook after load |

## VS Code / Cursor / VSCodium / Windsurf

- **VS Code:** install **Duskbox** from the Marketplace, then *Preferences: Color Theme* and pick a Duskbox variant.
- **Forks (Cursor, VSCodium, Windsurf…):** install **Duskbox** from [Open VSX](https://open-vsx.org/), or download the `.vsix` from [Releases](https://github.com/ih-hugh/duskbox/releases) and run `code --install-extension duskbox.vsix` (or your fork's equivalent CLI).

## Design

duskbox is designed in **OKLCH** (a perceptually-uniform color space): accents share a narrow lightness band (equiluminant) at moderate chroma, so nothing "vibrates," and variety comes from hue rather than brightness. High-contrast variants widen the foreground/background gap and raise chroma; `cyber` reuses a neon palette. Every accent is gated on WCAG contrast in the test suite.

## License

MIT © Hugo (ih-hugh)
