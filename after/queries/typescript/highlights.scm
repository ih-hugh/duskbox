;; extends
; declarators back to the command class (stock marks them @keyword.type)
[
  "namespace"
  "interface"
  "enum"
] @keyword

; modifiers the stock query leaves in plain @keyword
[
  "declare"
  "override"
  "implements"
] @keyword.modifier

; the `type` keyword rides the type hue (orange italic) — parity with storage.type.type
(type_alias_declaration
  "type" @keyword.type)

(import_statement
  "type" @keyword.type)

(export_statement
  "type" @keyword.type)

; inline type-only specifiers — `import { type F }` / `export { type C }` — parity with
; the TM grammar, which scopes these keyword.control.type (import-export-clause captures)
(import_specifier
  "type" @keyword.type)

(export_specifier
  "type" @keyword.type)
