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
