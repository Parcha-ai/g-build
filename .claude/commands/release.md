# Create GitHub Release

Create a GitHub release on the **grep-build** public repo and attach the build artifacts for download.

## Arguments: $ARGUMENTS

If arguments are provided, they are treated as additional release notes to include.

## Steps

1. **Read version** from `package.json` to determine the current version (e.g., `0.0.69`)

2. **Push to grep-build repo**: Ensure master and the version tag are pushed to the `public` remote (Parcha-ai/grep-build):
   ```bash
   git push public master
   git push public v{version}
   ```
   - If the tag doesn't exist locally: create it with `git tag v{version}` first
   - Also push to `origin` (Parcha-ai/claudette) if not already pushed

3. **Verify build artifact exists**: Look for artifacts at:
   - `out/v{version}/make/zip/darwin/arm64/Grep Build-darwin-arm64-{version}.zip`
   - `out/v{version}/make/Grep Build-{version}-arm64.dmg`
   - If neither exists, check `out/make/` as fallback
   - If no artifacts exist at all, tell the user to run `/build` or `/build force` first and STOP

4. **Generate release notes**: Get commits since the previous tag using:
   ```bash
   git log $(git tag --sort=-version:refname | sed -n '2p')..v{version} --oneline --no-decorate
   ```
   Format these as a markdown bullet list under a "## Changes" heading.

5. **Create the GitHub release** on grep-build using `gh release create`:
   ```bash
   gh release create v{version} \
     "out/v{version}/make/zip/darwin/arm64/Grep Build-darwin-arm64-{version}.zip" \
     "out/v{version}/make/Grep Build-{version}-arm64.dmg" \
     --repo Parcha-ai/grep-build \
     --title "Grep Build v{version}" \
     --latest \
     --notes "$(cat <<'EOF'
   ## Changes
   {bullet list of commits}

   {any additional notes from $ARGUMENTS}

   ---
   **Download:** Grep Build for macOS (Apple Silicon) — `.zip` or `.dmg`
   EOF
   )"
   ```
   - Use `--repo Parcha-ai/grep-build` to target the public repo
   - Use `--latest` flag to mark as the latest release
   - Attach both zip and dmg if available

6. **Report the result**: Print the release URL returned by `gh release create`

## Important Notes

- Releases go to **Parcha-ai/grep-build** (public), NOT Parcha-ai/claudette (private)
- The `public` git remote points to grep-build, `origin` points to claudette
- This skill does NOT build the application. Run `/build` or `/build force` first.
- This skill does NOT bump versions. The version in `package.json` is used as-is.
- The artifacts are macOS ARM64 only (Apple Silicon).
- Build output is in `out/v{version}/` (versioned directory from electron-forge).
- If a release for this version already exists, `gh release create` will fail. In that case, ask the user if they want to delete the existing release first with `gh release delete v{version} --repo Parcha-ai/grep-build --yes` and retry.
- Always confirm the release URL with the user after creation.
