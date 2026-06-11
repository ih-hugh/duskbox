;; extends
; duskbox v2.1 keyword stratification — re-partition stock captures to match the
; VS Code grammar partition (storage.modifier / storage.type.ts), per the v2.1 spec.
[
  "const"
  "let"
  "var"
  "static"
  "extends"
] @keyword.modifier

; class is a declarator (command class) — parity with VS Code's storage.type.class
"class" @keyword
