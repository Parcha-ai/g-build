# Create GitHub Release

Create a GitHub release for the latest Grep Build version and attach the build artifact for download.

## Arguments: $ARGUMENTS

If arguments are provided, they are treated as additional release notes to include.

## Steps

1. **Read version** from `package.json` to determine the current version (e.g., `0.0.68`)

2. **Verify tag exists**: Check that `v{version}` tag exists locally and has been pushed to origin
   - If the tag doesn't exist: create it with `git tag v{version}` and push with `git push origin v{version}`
   - If the tag exists locally but not on remote: push it

3. **Verify build artifact exists**: Look for the zip at `out/make/zip/darwin/arm64/Grep Build-darwin-arm64-{version}.zip`
   - If it doesn't exist, check if an older versioned zip exists and warn the user
   - If no zip exists at all, tell the user to run `/build` or `/build force` first and STOP

4. **Generate release notes**: Get commits since the previous tag using:
   ```bash
   git log $(git tag --sort=-version:refname | sed -n '2p')..v{version} --oneline --no-decorate
   ```
   Format these as a markdown bullet list under a "## Changes" heading.

5. **Create the GitHub release** using `gh release create`:
   ```bash
   gh release create v{version} \
     "out/make/zip/darwin/arm64/Grep Build-darwin-arm64-{version}.zip" \
     --title "Grep Build v{version}" \
     --notes "$(cat <<'EOF'
   ## Changes
   {bullet list of commits}

   {any additional notes from $ARGUMENTS}

   ---
   **Download:** Grep Build for macOS (Apple Silicon)
   EOF
   )"
   ```
   - Use `--latest` flag to mark as the latest release
   - The zip file is attached as a release asset automatically by passing it as a positional argument

6. **Report the result**: Print the release URL returned by `gh release create`

## Important Notes

- This skill does NOT build the application. Run `/build` or `/build force` first.
- This skill does NOT bump versions. The version in `package.json` is used as-is.
- The artifact is macOS ARM64 only (Apple Silicon). The zip filename follows Electron Forge's naming convention.
- If a release for this version already exists, `gh release create` will fail. In that case, ask the user if they want to delete the existing release first with `gh release delete v{version} --yes` and retry.
- Always confirm the release URL with the user after creation.
