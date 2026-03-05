# Contributing to Grep Build

Thanks for your interest in contributing. Here's how to get started.

## Development Setup

```bash
git clone https://github.com/Parcha-ai/grep-build.git
cd grep-build
npm install
./scripts/dev.sh
```

The dev server uses an isolated data directory (`/tmp/grep-build-dev`) so it won't interfere with your production install.

## Making Changes

1. Fork the repo and create a branch from `master`
2. Make your changes
3. Test in dev mode with `./scripts/dev.sh`
4. Run `npm run lint` to check for issues
5. Open a pull request

## Project Structure

```
src/
├── main/              # Electron main process
│   ├── services/      # Business logic (claude, terminal, git, browser, etc.)
│   └── ipc/           # IPC handlers (one file per domain)
├── renderer/          # React frontend
│   ├── stores/        # Zustand state management
│   └── components/    # UI components by feature
└── shared/            # Types and IPC channel constants
```

## Conventions

- IPC handlers go in `src/main/ipc/{domain}.ipc.ts`
- Services go in `src/main/services/{name}.service.ts`
- Components go in `src/renderer/components/{feature}/{Name}.tsx`
- IPC channel names are defined in `src/shared/constants/channels.ts`

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your OS and app version (shown in the status bar)

## Pull Requests

- Keep PRs focused on a single change
- Include a description of what changed and why
- Test your changes in the dev build before submitting
