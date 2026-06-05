-- duskbox: standalone theme family runtime.
local M = {}

M.config = { variant = "dusk", bold = true, transparent = false, on_highlights = nil }

function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", M.config, opts or {})
end

--- Apply a variant. `name` defaults to the configured variant.
function M.load(name)
  name = name or M.config.variant
  local ok, theme = pcall(require, "duskbox.themes." .. name)
  if not ok then error("duskbox: unknown variant '" .. tostring(name) .. "'") end

  if vim.g.colors_name then vim.cmd("hi clear") end
  if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
  vim.o.termguicolors = true
  vim.g.colors_name = "duskbox-" .. name

  local transparent = M.config.transparent
  local bold = M.config.bold
  for group, attrs in pairs(theme) do
    local hl = vim.deepcopy(attrs)
    if transparent and (group == "Normal" or group == "NormalNC" or group == "SignColumn"
        or group == "WinBar" or group == "WinBarNC" or group == "FoldColumn") then
      hl.bg = nil
    end
    if bold == false then hl.bold = nil end
    vim.api.nvim_set_hl(0, group, hl)
  end

  if type(M.config.on_highlights) == "function" then M.config.on_highlights(name) end
end

return M
