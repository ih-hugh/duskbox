# Releasing duskbox

Pushing a `v*` tag publishes to the **VS Code Marketplace** and **Open VSX**
automatically (see `.github/workflows/release.yml`). Neovim users install straight
from this Git repo, so every push to `main` reaches them via `:Lazy update`.

## One-time setup — publisher accounts + secrets

### VS Code Marketplace
1. Create a publisher with ID **`ihhugh`** at <https://marketplace.visualstudio.com/manage>
   (must match `publisher` in `package.json`).
2. Create an Azure DevOps Personal Access Token at <https://dev.azure.com> →
   *Organization* = **All accessible organizations**, *Scopes* = **Marketplace › Manage**.
3. `gh secret set VSCE_PAT --repo ih-hugh/duskbox`

### Open VSX
4. Sign in at <https://open-vsx.org> with GitHub, create an **Access Token**, claim the
   **`ihhugh`** namespace, and sign the one-time Eclipse Publisher Agreement.
5. `gh secret set OVSX_PAT --repo ih-hugh/duskbox`

If a secret is absent, that marketplace's publish step is skipped — the `.vsix` is still built.

## Cut a release
1. Update `CHANGELOG.md`; bump `version` in `package.json`.
2. `pnpm test && pnpm build` — green, and generated outputs regenerated/committed.
3. Tag and push:
   ```sh
   git commit -am "Release vX.Y.Z"
   git tag vX.Y.Z
   git push origin main --follow-tags
   ```
4. `release` packages `duskbox.vsix` and publishes to both marketplaces.
5. Cut the GitHub Release with the `.vsix` attached:
   ```sh
   pnpm package
   gh release create vX.Y.Z duskbox.vsix --title "vX.Y.Z" --notes-file <(sed -n '/## \[X.Y.Z\]/,/## \[/p' CHANGELOG.md)
   ```

## Verify
- VS Marketplace: <https://marketplace.visualstudio.com/items?itemName=ihhugh.duskbox>
- Open VSX: <https://open-vsx.org/extension/ihhugh/duskbox>
