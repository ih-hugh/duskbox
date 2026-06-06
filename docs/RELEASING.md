# Releasing duskbox

Pushing a `v*` tag publishes to the **VS Code Marketplace** + **Open VSX** and cuts a
GitHub Release with the `.vsix` attached — all from `.github/workflows/release.yml`.
Neovim users install straight from this Git repo, so every push to `main` reaches them
via `:Lazy update`.

## Who can publish (the threat model)

This repo is public and forkable, but **only the owner can publish to the `ihhugh`
marketplace identity**:

- **The publisher is yours.** `ihhugh` (VS Marketplace) / `ihhugh` (Open VSX) are bound to
  your Microsoft/GitHub accounts and tokens. A forker can only publish to *their own*
  publisher with *their own* token — never to `ihhugh`.
- **Forks/PRs can't reach the secrets.** GitHub never exposes repo/Environment secrets to
  `pull_request` runs from forks. A fork has its own copy of `release.yml` but none of the
  secrets, and CI (`ci.yml`) references no secrets and runs with a read-only token.
- **Releases require write access.** `release.yml` triggers only on a `v*` **tag push**, and
  only collaborators with write access (you) can push tags here.
- **Defense in depth via an Environment.** The tokens live in a `marketplace` Environment
  scoped to `v*` tags (optionally gated on your approval), so they're only ever available to
  a genuine tagged release — not a branch, a PR, or a re-pointed workflow.

The one residual risk is a **malicious PR you merge** that edits the build/workflow/manifest
and then runs on your next release. Mitigate with branch protection + reviewing diffs to
`*.yml`, `package.json`, and `src/build/**` before merging.

## One-time repo settings (you must do these in the GitHub UI)

1. **Create the Environment + put secrets there (not at repo level).**
   Settings → *Environments* → **New environment** → `marketplace`. Add secrets:
   - `VSCE_PAT` — VS Marketplace (see below)
   - `OVSX_PAT` — Open VSX (see below)

   Under *Deployment branches and tags* choose **Selected** → add rule **`v*`** (tags only).
   *Recommended:* enable **Required reviewers** = yourself → each release then waits for one
   "Approve" click in the Actions tab before the tokens unlock. Leave it off for fully
   hands-off tag→publish.

2. **Harden Actions defaults.** Settings → *Actions* → *General*:
   - *Fork pull request workflows from outside collaborators* → **Require approval for all
     external contributors.**
   - *Workflow permissions* → **Read repository contents** + uncheck *Allow GitHub Actions to
     create and approve pull requests.*

3. **Protect refs.** Settings → *Rules* → *Rulesets*: protect `main` (require a PR before
   merge) and tags `v*` (restrict creation to you). This is what guarantees only you can
   trigger a publish.

## Tokens

### VS Code Marketplace (`VSCE_PAT`)
Your account is a personal Microsoft account, so PAT creation isn't tenant-blocked — but
`dev.azure.com` may bounce to `portal.azure.com`. Go to **<https://aex.dev.azure.com/>**,
create a free org if asked, then **User settings → Personal access tokens → New**:
*Organization* = **All accessible organizations**, click **Show all scopes** →
**Marketplace → Manage**. Copy it into the `marketplace` Environment as `VSCE_PAT`.
Also create the publisher once at <https://marketplace.visualstudio.com/manage> → ID `ihhugh`.

### Open VSX (`OVSX_PAT`)
<https://open-vsx.org> → log in with GitHub → **Access Tokens** → generate; sign the
one-time Eclipse Publisher Agreement. Copy into the Environment as `OVSX_PAT`.
(CI runs `ovsx create-namespace ihhugh` for you.)

### Prefer no long-lived token? (optional, advanced)
Microsoft recommends **Entra workload identity federation** over PATs: a service connection +
user-assigned managed identity added to the publisher with the *Contributor* role, then
`vsce publish --azure-credential` — no stored secret. Heavier setup (needs an Azure
subscription); the PAT-in-Environment path above is fine for a solo project.

## Cut a release
1. Update `CHANGELOG.md`; bump `version` in `package.json`.
2. `pnpm test && pnpm build` locally (CI re-checks both).
3. Tag and push:
   ```sh
   git commit -am "Release vX.Y.Z"
   git tag vX.Y.Z
   git push origin main --follow-tags
   ```
4. `release.yml` packages the `.vsix`, publishes to both marketplaces (each step skips if its
   secret is absent), and creates the GitHub Release. If the Environment requires reviewers,
   approve the run in the **Actions** tab.

## Verify
- VS Marketplace: <https://marketplace.visualstudio.com/items?itemName=ihhugh.duskbox>
- Open VSX: <https://open-vsx.org/extension/ihhugh/duskbox>
