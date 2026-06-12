#!/usr/bin/env bash
# duskbox lab — real VS Code (code-server) on localhost with the locally built VSIX installed.
# Usage: lab/up.sh        (builds + packages + installs + serves on :8089)
set -euo pipefail
cd "$(dirname "$0")/.."
LAB="$PWD/lab"
PORT="${DUSKBOX_LAB_PORT:-8089}"

pnpm build >/dev/null
npx @vscode/vsce package --no-dependencies -o "$LAB/duskbox-lab.vsix" --readme-path README.marketplace.md >/dev/null

code-server --install-extension "$LAB/duskbox-lab.vsix" \
  --user-data-dir "$LAB/.data" --extensions-dir "$LAB/.ext" >/dev/null

mkdir -p "$LAB/.data/User"
cat > "$LAB/.data/User/settings.json" << JSON
{
  "workbench.colorTheme": "Duskbox Dusk",
  "workbench.startupEditor": "none",
  "security.workspace.trust.enabled": false,
  "editor.minimap.enabled": false,
  "editor.fontSize": 13,
  "window.menuBarVisibility": "hidden",
  "git.openRepositoryInParentFolders": "never",
  "update.mode": "none",
  "workbench.tips.enabled": false,
  "chat.commandCenter.enabled": false,
  "typescript.validate.enable": false,
  "javascript.validate.enable": false,
  "css.validate": false
}
JSON

echo "lab: http://127.0.0.1:$PORT/?folder=$LAB/fixtures"
exec code-server --auth none --bind-addr "127.0.0.1:$PORT" \
  --user-data-dir "$LAB/.data" --extensions-dir "$LAB/.ext" --disable-telemetry
