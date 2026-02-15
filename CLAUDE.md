# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**Training Log v2.0** — an offline-first strength training log web app built with React + TypeScript. Logs sessions with exercises/sets, computes e1RM (RTS + Brzycki/Epley), tonnage, INOL, detects PRs, and tracks fatigue. Data persists locally via IndexedDB (Dexie).

See `SPEC.md` for the full product specification.

## Repository Structure

```
SBD/
├── CLAUDE.md              # AI assistant guidance (this file)
├── SPEC.md                # Full product specification
├── src/
│   ├── calculations/      # Pure calculation functions (e1RM, tonnage, INOL, PRs, fatigue, Wilks/DOTS)
│   ├── schemas/           # Zod schemas and TypeScript types
│   ├── db/                # Dexie database setup and migrations
│   ├── stores/            # Zustand state management
│   ├── hooks/             # React hooks (anchors, dashboard metrics, fatigue flags)
│   ├── components/        # React components (layout, session, dashboard, history)
│   ├── pages/             # Page-level components
│   ├── utils/             # Utilities (units, normalization, dates, export/import)
│   └── test/              # Test setup
```

## Development Setup

- **Runtime:** Node.js
- **Package manager:** npm
- **Build tool:** Vite
- **Language:** TypeScript (strict mode)

Install dependencies: `npm install`

## Common Commands

- `npm run dev` — start dev server
- `npm run build` — type-check + production build
- `npm test` — run all tests (Vitest)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — lint with ESLint

## Code Conventions

- TypeScript strict mode; all calculations are **pure functions** in `src/calculations/`
- Weights stored internally in **kg**; converted on display
- Zod schemas in `src/schemas/index.ts` define all data types
- State management via Zustand (stores in `src/stores/`)
- Styling via Tailwind CSS

## Git Workflow

- **Primary branch:** `main`
- **Remote:** `origin`
- Write clear, descriptive commit messages.
- Keep commits focused on a single logical change.
