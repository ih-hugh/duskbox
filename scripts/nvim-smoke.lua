-- usage: nvim -u NONE --headless -c "lua vim.g.duskbox_test_variant='dusk'" -c "luafile scripts/nvim-smoke.lua" -c "qa!"
local variant = vim.g.duskbox_test_variant or "dusk"
vim.opt.runtimepath:prepend(vim.fn.getcwd()) -- so colors/ + lua/ are found

-- Regression guard: duskbox.load() must NOT force-require("lualine"). Under lazy.nvim a require
-- TRIGGERS the plugin to load, and the colorscheme is applied very early in startup (before Snacks
-- is initialized) — running LazyVim's lualine config then crashes ("index global 'Snacks' (nil)").
-- load() must only re-theme an ALREADY-loaded lualine (package.loaded), never require it. This
-- sentinel fires if load() requires lualine, so a reintroduced require() fails the smoke test.
local lualine_forced = false
package.preload["lualine"] = function()
  lualine_forced = true
  return { get_config = function() return { options = {} } end, setup = function() end }
end

local ok, err = pcall(vim.cmd, "colorscheme duskbox-" .. variant)
assert(ok, "load failed: " .. tostring(err))
assert(not lualine_forced, "duskbox.load() force-required lualine; it must only touch package.loaded['lualine']")
package.preload["lualine"] = nil
local function fg(n) local h = vim.api.nvim_get_hl(0, { name = n, link = false }); return h.fg and string.format("#%06x", h.fg) or "none" end
assert(vim.g.colors_name == "duskbox-" .. variant, "colors_name=" .. tostring(vim.g.colors_name))
assert(fg("Keyword") ~= "none", "Keyword unset")
assert(vim.api.nvim_get_hl(0, { name = "Keyword", link = false }).bold == true, "Keyword not bold")
assert(vim.api.nvim_get_hl(0, { name = "Comment", link = false }).italic == true, "Comment not italic")
local normal = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
assert(normal.bg ~= nil and normal.fg ~= nil, "Normal incomplete")
io.stdout:write("SMOKE OK " .. variant .. " Keyword=" .. fg("Keyword") .. "\n")
