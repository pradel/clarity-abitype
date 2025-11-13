# clarity-abitype

Monorepo for clarity-abitype packages.

## Setup

This monorepo uses:

- **pnpm workspaces** for package management
- **Turborepo** for build orchestration
- **Prettier** for code formatting
- **Lefthook** for git hooks
- **Changesets** for versioning and publishing

## Getting Started

Install dependencies:

```bash
pnpm install
```

## Available Scripts

- `pnpm build` - Build all packages
- `pnpm dev` - Run all packages in development mode
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without modifying files
- `pnpm changeset` - Create a changeset for versioning
- `pnpm version-packages` - Version packages based on changesets
- `pnpm release` - Build and publish packages

## Packages

- `@clarity-abitype/example` - Example package
