# Training Log v2.0

An offline-first strength training log web app. Log sessions with exercises and sets, compute e1RM automatically (RTS chart + Brzycki/Epley), track tonnage, INOL, PRs, and fatigue — all persisted locally via IndexedDB.

## Quick Start

```bash
npm install
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm test` | Run unit tests |
| `npm run lint` | Lint with ESLint |

## Tech Stack

- **Build:** Vite
- **UI:** React + TypeScript
- **State:** Zustand
- **Storage:** Dexie (IndexedDB)
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Tests:** Vitest

See [SPEC.md](./SPEC.md) for the full product specification.
