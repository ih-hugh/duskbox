-- usage: nvim --headless -c "lua vim.g.duskbox_test_variant='dusk'" -c "luafile scripts/nvim-smoke.lua" -c "qa!"
local variant = vim.g.duskbox_test_variant or "dusk"
local cwd = vim.fn.getcwd()
vim.opt.runtimepath:prepend(cwd) -- so colors/ + lua/ are found
-- Evict any cached duskbox modules so the project's lua/ takes precedence over
-- whatever the ambient nvim config may have loaded already.
for k in pairs(package.loaded) do
  if k == "duskbox" or k:sub(1, 8) == "duskbox." then package.loaded[k] = nil end
end
-- Prepend a direct-path loader so the project's lua/ wins over nvim's rtp loader
-- (which may resolve to the ambient nvim config's lua/duskbox/ before our prepend).
table.insert(package.loaders, 1, function(modname)
  if modname ~= "duskbox" and modname:sub(1, 8) ~= "duskbox." then return nil end
  local path = cwd .. "/lua/" .. modname:gsub("%.", "/") .. ".lua"
  local f = loadfile(path)
  if f then return f end
  local path2 = cwd .. "/lua/" .. modname:gsub("%.", "/") .. "/init.lua"
  return loadfile(path2)
end)
local ok, err = pcall(vim.cmd, "colorscheme duskbox-" .. variant)
assert(ok, "load failed: " .. tostring(err))
local function fg(n) local h = vim.api.nvim_get_hl(0, { name = n, link = false }); return h.fg and string.format("#%06x", h.fg) or "none" end
assert(vim.g.colors_name == "duskbox-" .. variant, "colors_name=" .. tostring(vim.g.colors_name))
assert(fg("Keyword") ~= "none", "Keyword unset")
assert(vim.api.nvim_get_hl(0, { name = "Keyword", link = false }).bold == true, "Keyword not bold")
assert(vim.api.nvim_get_hl(0, { name = "Comment", link = false }).italic == true, "Comment not italic")
local normal = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
assert(normal.bg ~= nil and normal.fg ~= nil, "Normal incomplete")
io.stdout:write("SMOKE OK " .. variant .. " Keyword=" .. fg("Keyword") .. "\n")
