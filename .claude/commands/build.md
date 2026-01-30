# Build Production Application

Build the Grep Build production application for distribution.

## Usage Modes

### Standard Mode: `/build`
Requires QA approval before building. This is the safe, recommended approach.

**Workflow:**
1. Start the dev server (`npm run start`)
2. Wait for user to test and confirm everything works
3. Ask explicitly: "Dev build is running. Please test and confirm when ready to build production."
4. Only proceed with production build after explicit user approval

### Force Mode: `/build force`
Builds immediately without QA check. Use when you're confident the build is ready.

**Workflow:**
1. Bump version in `package.json`
2. Run `npm run make` immediately
3. Create git tag
4. Open built application

## Build Steps (after QA approval or in force mode)

1. **BUMP THE VERSION** in `package.json` (increment patch version, e.g., 0.0.22 → 0.0.23)
2. Run `npm run make` to create the distributable application
3. **CREATE A RELEASE TAG** with `git tag v{version}` (e.g., `git tag v0.0.23`)
4. Open the built application from `out/Grep Build-darwin-arm64/Grep Build.app`
5. Report the build status and location of the artifact

## Pre-flight Check (Standard Mode)

Before building, confirm:
- The dev version has been tested and works correctly
- All TypeScript errors have been resolved
- The user has explicitly approved the production build

## CRITICAL: NEVER pkill

**NEVER pkill or kill processes before building!** The user may have other Electron instances running in different worktrees. The build process works fine without killing anything.

## Build Command

```bash
npm run make
```

## Post-build

After successful build:
- Create a git tag: `git tag v{version}` (e.g., `git tag v0.0.23`)
- Open the application: `open "out/Grep Build-darwin-arm64/Grep Build.app"`
- Report the build artifacts location: `out/make/`

## Version Bumping

The version is displayed in the bottom right of the app's status bar. Users need to see the new version to confirm they're running the updated build.

To bump the version:
1. Read `package.json`
2. Increment the patch version (last number)
3. Update `package.json` with the new version
4. The new version will be displayed in the built app's status bar
