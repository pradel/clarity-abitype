# AGENTS.md

This file contains guidelines for agentic coding agents operating in this repository.

## Project Overview

clarity-abitype is a monorepo providing strict TypeScript types for Clarity smart contract ABIs on the Stacks blockchain. The main package is in `packages/clarity-abitype/`.

## Build, Lint, and Test Commands

Run from repository root or `packages/clarity-abitype/`:

```bash
# Build
pnpm build

# Type-check
pnpm check-types

# Watch mode for development
pnpm dev

# Lint with oxlint
pnpm lint

# Run all tests
pnpm test
```

### Running a Single Test

```bash
cd packages/clarity-abitype && vp test src/utils.test-d.ts
```
