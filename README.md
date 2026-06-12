# duskbox

A calm theme family with **tiered attention** for **Neovim**, **VS Code** (and forks: Cursor, VSCodium, Windsurf…), **Ghostty/cmux**, and **lazygit**. Sixteen variants — eight core moods (light → dark plus high-contrast and a neon "cyber" option), with `dusk` and `cyber` each also in four signature flavors — all generated from one OKLCH source of truth, so editors and terminals never drift. Richly detailed (graded Markdown headings, per-language tokens, calm punctuation, deep LSP semantics), and each core mood carries its own atmosphere, while signature variants stand on their base's slate stage with a whisper of their signature in the room — plus designed diagnostics, diffs, and an accent cursor. (Neovim bonus: TODO/FIXME comment badges via the treesitter `comment` parser — `:TSInstall comment` if your distro doesn't bundle it.)

> Warm declarations, cool literals, **bold keywords & types** for legibility. Calm by default; punchy where you want it (hello, `cyber`).

## Palette

![duskbox OKLCH palette](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/palette.svg)

Designed in **OKLCH** around **tiered attention**: deep ember keywords command (electric-blue modifiers at their side), the warm + cool work spine carries meaning, and structure recedes into each variant's own background material. In the **signature** variants, the chrome — cursor, borders, selection, markdown headings, statusline — takes the signature color while the syntax stays consistent across the family.

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

### Signature variants

`dusk` and `cyber` also come in four **signature** flavors — the chrome (cursor, borders,
selection, headings, statusline) takes the signature color — and the stage carries a 2% signature whisper while
syntax stays consistent across the family:

| signature | dark | neon |
| --- | --- | --- |
| Azure | `duskbox-dusk-azure` | `duskbox-cyber-azure` |
| Neon Purple | `duskbox-dusk-neon-purple` | `duskbox-cyber-neon-purple` |
| Magenta | `duskbox-dusk-magenta` | `duskbox-cyber-magenta` |
| Salmon | `duskbox-dusk-salmon` | `duskbox-cyber-salmon` |

## Screenshots

Real VS Code renders (React/TSX) of every variant are collected in the [full screenshot gallery](./docs/screenshots.md).

The gallery is produced by the [lab](#lab-agentic-screenshot-validation), which runs code-server locally and captures the actual VS Code workbench with Playwright.

## Gallery

The eight core variants:

![dusk](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk.svg)
![cyber](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber.svg)
![night-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/night-hc.svg)
![midnight](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/midnight.svg)
![storm](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/storm.svg)
![day](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day.svg)
![day-hc](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/day-hc.svg)
![dawn](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dawn.svg)

<details>
<summary><b>Signature variants</b> — eight more (azure · neon-purple · magenta · salmon, each on dusk and cyber)</summary>

<br>

![dusk-azure](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk-azure.svg)
![cyber-azure](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber-azure.svg)
![dusk-neon-purple](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk-neon-purple.svg)
![cyber-neon-purple](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber-neon-purple.svg)
![dusk-magenta](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk-magenta.svg)
![cyber-magenta](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber-magenta.svg)
![dusk-salmon](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/dusk-salmon.svg)
![cyber-salmon](https://raw.githubusercontent.com/ih-hugh/duskbox/main/docs/img/cyber-salmon.svg)

</details>

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

## Lazygit

duskbox ships a matching [lazygit](https://github.com/jesseduffield/lazygit) theme for every variant under [`extras/lazygit/`](./extras/lazygit).

- **From inside Neovim (recommended, zero setup):** LazyVim/[Snacks](https://github.com/folke/snacks.nvim) auto-generate a lazygit theme from your *active* colorscheme, so `<leader>gg` already matches whichever duskbox variant is loaded.
- **Standalone `lazygit`:** append a variant's `gui.theme` block to your lazygit config (`~/Library/Application Support/lazygit/config.yml` on macOS, else `~/.config/lazygit/config.yml`):

  ```sh
  curl -fsSL https://raw.githubusercontent.com/ih-hugh/duskbox/main/extras/lazygit/duskbox-dusk.yml \
    >> "$(lazygit --print-config-dir)/config.yml"
  ```

## Ghostty / cmux

duskbox ships Ghostty-compatible terminal themes for every variant under [`extras/ghostty/`](./extras/ghostty). cmux uses Ghostty's theme system, so the same files work there too.

### Install

**Option 1 — cmux theme picker (recommended):**

```sh
brew tap ih-hugh/tap
brew install cmux-theme-picker
# Then run:
cmux-theme-picker            # pick a theme
cmux-theme-picker --update   # refresh duskbox themes after a release
```

The picker shows live previews and lets you toggle between light/dark slots with Tab. Duskbox themes are marked with ★. See [cmux-theme-picker](https://github.com/ih-hugh/cmux-theme-picker) for details.

**Option 2 — Manual install:**

```sh
# Ghostty
mkdir -p ~/.config/ghostty/themes
cp extras/ghostty/duskbox-* ~/.config/ghostty/themes/

# cmux (current cmux does not list symlinked user themes, so copy real files)
mkdir -p "$HOME/Library/Application Support/com.cmuxterm.app/themes"
cp extras/ghostty/duskbox-* "$HOME/Library/Application Support/com.cmuxterm.app/themes/"
```

**Set a variant directly:**

```sh
cmux themes set --light duskbox-day --dark duskbox-dusk
cmux reload-config
```

Or edit your Ghostty config and reload:

```conf
theme = duskbox-dusk
```

## Build from source

```sh
pnpm install
pnpm build      # regenerate colors/*.lua, lua/duskbox/themes/*.lua, themes/*.json, extras/*
pnpm test       # vitest: OKLCH math, contrast gates, emitters, determinism
pnpm gallery    # regenerate docs/img/*.svg
```

Everything is generated from `src/`: palettes are authored in **OKLCH** (`src/palette/variants.ts`) and a shared semantic token map (`src/tokens.ts`) defines the identity. Edit those, run `pnpm build`, and both editors update from the single source.

## Lab (agentic screenshot validation)

A real VS Code (code-server) on localhost for rendering-true theme validation:

```sh
lab/up.sh                 # build + package + install the local VSIX, serve on :8089
cd lab && npm i           # once
npm run shoot             # screenshot all 16 variants x fixtures -> lab/shots/
npm run shoot -- Dusk     # or specific variants
```

Real workbench, real TextMate + semantic tokens — what the marketplace ships is what gets
screenshotted. Agents read the PNGs to validate changes before release.

## Design

duskbox is designed in **OKLCH** (a perceptually-uniform color space) around **tiered attention**: hierarchy comes from lightness × chroma, identity from hue. Deep ember keywords command; the work sits in a warm (gold/orange) + cool (green/teal/blue) spine with bright-lavender variables; punctuation is carved from each variant's own background material and recedes. High-contrast variants get their hierarchy from chroma alone (≥7:1 floors). Every accent is gated on WCAG contrast in the test suite — and a pink-regression gate keeps washed-pink and fuchsia out of syntax permanently. Keywords are stratified: command keywords (`if`, `return`, `function`, `class`) stay ember bold while modifiers (`async`, `const`, `static`, `extends`) recede to electric-blue italics — `async function main` reads as three colors, not one. On the salmon variants, `import`/`export` ride a vivid true salmon.

## License

MIT © Hugo (ih-hugh)
