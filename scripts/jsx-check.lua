-- usage: nvim -u NONE --headless -c "lua vim.g.duskbox_test_variant=(vim.g.duskbox_test_variant or 'dusk')" -c "luafile scripts/jsx-check.lua" -c "qa!"
-- Verifies native JSX tags, custom components, and attributes resolve to DISTINCT colors.
vim.opt.runtimepath:prepend(vim.fn.getcwd())
local variant = vim.g.duskbox_test_variant or "dusk"
vim.cmd("colorscheme duskbox-" .. variant)
local function fg(group)
  local h = vim.api.nvim_get_hl(0, { name = group, link = false })
  return h.fg and string.format("#%06x", h.fg) or "none"
end
local nativeTag, component, attr = fg("@tag.builtin"), fg("@tag"), fg("@tag.attribute")
assert(nativeTag ~= "none", "@tag.builtin (native tag) unset")
assert(component ~= "none", "@tag (component) unset")
assert(nativeTag ~= component, "native tag == component (" .. nativeTag .. ")")
assert(attr ~= "none" and attr ~= nativeTag, "attribute not distinct from native tag")
io.stdout:write(("JSX OK %s: native=%s component=%s attr=%s\n"):format(variant, nativeTag, component, attr))
