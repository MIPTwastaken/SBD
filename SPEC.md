# Training Log v2.0 — Full Specification

## 1. Assumptions & Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Unit system** | Internal storage in **kg**; UI supports kg/lb toggle with conversion factor 2.20462 | Standardizes calculations; user sees preferred unit |
| **Weight precision** | Stored as `number` (float); displayed to 1 decimal in kg, 0 in lb | Matches real plates |
| **RPE scale** | 5.0–10.0 in 0.5 increments | Standard RPE range for strength training |
| **RTS chart bounds** | Reps 1–10, RPE 6.0–10.0 | Beyond this range, fall back to Brzycki/Epley average |
| **Brzycki validity** | Reps 1–10 (warn at 11+, hard-cap at 36 to avoid division by zero) | Formula becomes unreliable above 10 reps |
| **e1RM aggregation** | Max e1RM across all sets for an exercise in a session | Represents peak capacity |
| **Main lift detection** | Case-insensitive substring match for "squat", "bench", "deadlift", "overhead press" / "ohp" + manual toggle | Simple, user-overridable |
| **PR scope** | Per normalized exercise name (case-insensitive trim) | Variations tracked separately only if name differs |
| **Fatigue baseline** | Rolling 28-day best e1RM for that lift | More stable than session-to-session comparison |
| **INOL anchor** | Latest T1 top-set e1RM for the lift; fallback to all-time best e1RM | Practical default |
| **ID generation** | `crypto.randomUUID()` | Native, collision-resistant |
| **Date storage** | ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Portable, sortable |
| **Schema versioning** | Integer `schemaVersion` starting at 1 | Simple migration chain |
| **Storage** | IndexedDB via Dexie.js | Better capacity and query capabilities vs localStorage |
| **Merge strategy** | Import defaults to "replace"; merge by session ID (upsert) is optional | Replace is safest for MVP |
| **Bodyweight for Wilks/DOTS** | Uses the BW from the session; if absent, uses most recent prior BW | Avoids requiring BW every session |
| **Sex for Wilks/DOTS** | Stored in settings; defaults to "male" | Required by formulas |

---

## 2. User Stories & Core Workflows

### User Stories

1. **As a lifter**, I want to log a training session with exercises, sets, RPE, and notes so I can track my training.
2. **As a lifter**, I want to see my estimated 1RM trends over time so I can gauge progress.
3. **As a lifter**, I want automatic PR detection so I know when I've hit a personal record.
4. **As a lifter**, I want fatigue warnings so I can adjust training when I'm overreaching.
5. **As a lifter**, I want to duplicate a past session as a template to speed up logging.
6. **As a lifter**, I want to export/import my data as JSON so I never lose my training history.
7. **As a lifter**, I want to track bodyweight, sleep, stress, and readiness alongside training.
8. **As a lifter**, I want my Wilks and DOTS scores computed automatically.
9. **As a lifter**, I want the app to work fully offline and persist data locally.

### Core Workflows

**Log a Session:**
1. Tap "New Session" → date auto-fills to now
2. Optionally enter BW, sleep, stress, mood, readiness, pain, restrictions
3. Optionally set block/week/phase
4. Add exercise → enter name, tier, variation
5. Add sets → enter weight, reps, optional RPE
6. Repeat exercises/sets
7. Add session notes
8. Save → calculations run, PRs detected, anchors updated

**Edit a Session:**
1. Open session from History
2. Modify any field (metadata, exercises, sets)
3. Save → recalculate all derived values

**Duplicate a Session:**
1. From History, select a session → "Duplicate as Template"
2. New session created with today's date, same exercises/sets (weights/reps copied), metadata cleared
3. User adjusts as needed, saves

**Review Dashboard:**
1. Open Dashboard → see e1RM trend charts for main lifts
2. View current anchors (loading references)
3. Check volume summaries, readiness trends
4. View PR board, fatigue flags

**Export/Import:**
1. Settings → Export → downloads JSON file
2. Settings → Import → select JSON file → validate → replace or merge

---

## 3. Data Model & Schema

### TypeScript Types (with Zod validation)

```typescript
// === Core Enums ===
type Tier = 'T1' | 'T2' | 'T3';
type PainType = 'sharp' | 'dull' | 'nerve' | 'other';
type Phase = 'hypertrophy' | 'strength' | 'peaking' | 'deload' | string;
type Sex = 'male' | 'female';
type WeightUnit = 'kg' | 'lb';

// === Pain Entry ===
interface PainEntry {
  location: string;
  score: number;        // 0–10
  type: PainType;
  notes?: string;
}

// === Set ===
interface TrainingSet {
  id: string;
  weight: number;       // always stored in kg
  reps: number;         // integer >= 1
  rpe?: number;         // 5.0–10.0 in 0.5 increments
  // Computed (not stored, derived on read):
  // e1rm, tonnage, inol
}

// === Exercise ===
interface Exercise {
  id: string;
  name: string;             // free text, e.g. "Squat"
  tier: Tier;
  variation?: string;       // e.g. "paused", "close-grip"
  sets: TrainingSet[];
  techNotes?: string;
  isMainLift?: boolean;     // manual override for main lift detection
}

// === Session ===
interface Session {
  id: string;
  date: string;             // ISO 8601
  duration?: number;        // minutes
  bodyweight?: number;      // kg
  sleep?: number;           // hours
  sleepQuality?: number;    // 1–5
  stress?: number;          // 1–5
  mood?: number;            // 1–5
  readiness?: number;       // 1–5
  pain?: PainEntry[];
  restrictions?: string;
  block?: string;
  week?: string;
  phase?: Phase;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

// === PR Record ===
interface PRRecord {
  id: string;
  exerciseName: string;     // normalized
  type: 'e1rm' | 'weight_at_reps' | 'reps_at_weight';
  value: number;
  reps?: number;            // for weight_at_reps
  weight?: number;          // for reps_at_weight
  sessionId: string;
  sessionDate: string;
  previousValue?: number;
}

// === Settings ===
interface AppSettings {
  weightUnit: WeightUnit;
  sex: Sex;
  fatigueDropThreshold: number;   // default 0.05 (5%)
  rpeStreakThreshold: number;      // default 2
  schemaVersion: number;
}

// === Export Format ===
interface ExportData {
  schemaVersion: number;
  exportedAt: string;
  settings: AppSettings;
  sessions: Session[];
  prRecords: PRRecord[];
}
```

### JSON Export Format

```json
{
  "schemaVersion": 1,
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "settings": { ... },
  "sessions": [ ... ],
  "prRecords": [ ... ]
}
```

### Migration Strategy

- Each export includes `schemaVersion` (integer).
- On import, if `schemaVersion < CURRENT_VERSION`, run sequential migration functions:
  - `migrate_v1_to_v2(data)`, `migrate_v2_to_v3(data)`, etc.
- Migrations are pure functions: `(oldData) => newData`.
- Unknown future fields are preserved (forward-compatible via `...rest`).

---

## 4. Calculation Specification

### A) e1RM

#### RTS Percentage Chart (lookup table)

```
Reps →  1      2      3      4      5      6      7      8      9      10
RPE
10    100.0  95.5   92.2   89.2   86.3   83.7   81.1   78.6   76.2   73.9
9.5    97.8  93.9   90.7   87.8   85.0   82.4   79.9   77.4   75.1   72.3
9      95.5  92.2   89.2   86.3   83.7   81.1   78.6   76.2   73.9   71.5
8.5    93.9  90.7   87.8   85.0   82.4   79.9   77.4   75.1   72.3   69.4
8      92.2  89.2   86.3   83.7   81.1   78.6   76.2   73.9   71.5   68.0
7.5    90.7  87.8   85.0   82.4   79.9   77.4   75.1   72.3   69.4   66.7
7      89.2  86.3   83.7   81.1   78.6   76.2   73.9   71.5   68.0   65.3
6.5    87.8  85.0   82.4   79.9   77.4   75.1   72.3   69.4   66.7   63.2
6      86.3  83.7   81.1   78.6   76.2   73.9   71.5   68.0   65.3   61.3
```

#### Formula (RPE-based)

```
percentOfMax = RTS_TABLE[rpe][reps]
e1RM = weight / (percentOfMax / 100)
```

If lookup misses (reps > 10 or RPE < 6): fall back to non-RPE method.

#### Formula (Non-RPE)

```
brzycki = weight * 36 / (37 - reps)       // valid reps 1–10; warn at 11+; cap reps at 36
epley   = weight * (1 + reps / 30)
e1RM    = (brzycki + epley) / 2
```

**Special case:** If reps == 1 and no RPE, e1RM = weight (both formulas reduce to this).

#### Session Aggregation

- Per exercise: `maxE1RM = max(e1RM across all sets)`
- For dashboard trending: use only T1 sets for anchor computation.

### B) Tonnage

```
set_tonnage    = weight * reps
exercise_total = sum(set_tonnage for all sets)
session_total  = sum(exercise_total for all exercises)
```

Breakdowns by tier, lift name, week/block/phase are aggregations over filtered sets.

### C) INOL

```
intensityPercent = (weight / current1RM) * 100
INOL_set = reps / (100 - intensityPercent)
```

**Anchor resolution order:**
1. Latest T1 top-set e1RM for that lift in this or previous sessions
2. All-time best e1RM for that lift
3. If neither exists: skip INOL, flag "insufficient anchor"

**Edge cases:**
- `intensityPercent >= 100`: cap denominator to minimum of 1 → `INOL_set = reps / 1`
- `current1RM <= 0` or missing: skip INOL for that set

### D) PR Detection

**Tracked PR types per exercise (normalized name):**

| PR Type | Definition |
|---------|-----------|
| `e1rm` | Highest estimated 1RM ever achieved |
| `weight_at_reps` | Heaviest weight lifted for exactly N reps (tracked for N = 1–10) |
| `reps_at_weight` | Most reps at a given weight bracket (rounded to nearest 5kg) |

**Algorithm (run on session save):**
1. For each exercise in the session, compute e1RM for each set.
2. Compare max e1RM to stored best for that exercise.
3. If new > stored: create PRRecord, update stored best.
4. Similarly for weight_at_reps and reps_at_weight.

### E) Fatigue Flags

**e1RM Drop Flag:**
```
rolling28DayBest = max(T1 e1RM for this lift in sessions within last 28 days, excluding current)
currentE1RM = max(T1 e1RM for this lift in current session)
if currentE1RM < rolling28DayBest * (1 - threshold):
    flag("e1RM drop", { lift, current, baseline, dropPercent })
```
Default threshold: 5% (configurable).

**RPE Streak Flag:**
```
For each main lift:
  Look at last N sessions containing T1 sets for this lift
  If top-set RPE >= 9.5 in all N consecutive sessions:
    flag("RPE streak", { lift, streakCount: N })
```
Default N: 2 (configurable).

---

## 5. UI/UX Spec (Screen by Screen)

### Navigation

Top-level tabs (bottom nav on mobile, sidebar on desktop):
- **Dashboard** (home)
- **Log Session** (+)
- **History** (list)
- **Settings** (gear)

### 5.1 Dashboard

**Layout (top to bottom):**

1. **Anchors Card** — shows current T1 e1RM anchor for each main lift (Squat, Bench, Deadlift, OHP) with date of anchor session. Empty state: "No anchors yet — log a T1 session to establish anchors."

2. **e1RM Trend Chart** — line chart, one series per main lift. X-axis: date. Y-axis: e1RM (kg/lb). Tooltip shows exact value + date. Toggle individual lifts on/off. Empty state: "Log sessions with RPE or enough reps to see e1RM trends."

3. **Fatigue Alerts** — cards showing active e1RM drop warnings and RPE streak warnings. Empty state: hidden when no alerts.

4. **Volume Summary** — bar chart showing weekly tonnage by tier (stacked). Table below with last session breakdown. Toggle between weekly/block view.

5. **Readiness Panel** — sparkline charts for BW, sleep, readiness over last 30 days. Empty state: "Track bodyweight and readiness to see trends."

6. **PR Board** — filterable list of recent PRs. Columns: exercise, type, value, date, improvement. Filter by exercise, date range.

7. **Competition Scores** — Wilks and DOTS computed from latest BW + best e1RM for SBD. Shows total and individual. Empty state: "Log Squat, Bench, and Deadlift to see competition scores."

### 5.2 Log Session

**Layout:**

1. **Session Header**
   - Date picker (defaults to now)
   - Duration input (optional, minutes)
   - Expandable "Wellness" section: BW, sleep (hrs + quality), stress, mood, readiness (all with appropriate inputs)
   - Expandable "Pain" section: add/remove pain entries
   - Expandable "Periodization" section: block, week, phase (dropdown + custom)
   - Restrictions (text area)

2. **Exercise List**
   - "Add Exercise" button
   - Each exercise card:
     - Name (text input with autocomplete from history)
     - Tier selector (T1/T2/T3 buttons)
     - Variation (text input)
     - "Main lift" toggle (auto-detected, manually overridable)
     - Sets table:
       | # | Weight | Reps | RPE | e1RM | Actions |
       |---|--------|------|-----|------|---------|
       - Inline editing
       - "Add Set" button (pre-fills from last set)
       - "Remove Set" button (confirm if only set)
       - Real-time e1RM computation shown
     - Tech notes (expandable text area)
     - Remove exercise button (with confirmation)

3. **Session Notes** — text area at bottom

4. **Actions**
   - "Save Session" (primary)
   - "Discard" (secondary, with confirmation)

**Validation:**
- Weight must be > 0
- Reps must be integer >= 1
- RPE must be in [5.0, 10.0] in 0.5 steps, or empty
- At least one exercise with one set to save
- Date required

**After save:**
- Toast notification showing any new PRs
- Navigate to Dashboard

### 5.3 History

**Layout:**

1. **Search/Filter Bar** — date range picker, exercise name filter, phase filter

2. **Session List** — reverse chronological
   - Each row: date, duration, exercise count, total tonnage, main lift e1RMs
   - Tap to expand/view full session
   - Actions: Edit, Duplicate, Delete (with confirmation)

3. **Session Detail View**
   - Full session data rendered read-only
   - Edit button → opens in Log Session form pre-filled
   - All computed metrics shown (e1RM, tonnage, INOL per exercise)

### 5.4 Settings

1. **Units** — kg/lb toggle
2. **Sex** — male/female (for Wilks/DOTS)
3. **Thresholds** — e1RM drop %, RPE streak count
4. **Data Management**
   - Export to JSON (button)
   - Import from JSON (file picker + validation summary + confirm)
   - Clear all data (danger zone, double confirmation)
5. **About** — version, schema version

### Loading / Empty States

- **Loading**: skeleton placeholders for cards/charts
- **Empty dashboard**: welcome message with CTA to log first session
- **Empty history**: "No sessions logged yet"
- **Chart with < 2 points**: show data points but no trend line; message "Need more data for trends"

---

## 6. Architecture & Tech Stack

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Build** | Vite | Fast dev server, optimized builds, first-class TS support |
| **UI** | React 18 + TypeScript | Industry standard, large ecosystem |
| **Routing** | React Router v6 | De facto standard for React SPAs |
| **State** | Zustand | Minimal boilerplate, good TS support, simpler than Redux for this scale |
| **Forms** | React Hook Form + Zod | Performant (uncontrolled), schema validation, good DX |
| **Storage** | Dexie.js (IndexedDB) | Structured queries, transactions, 50MB+ capacity, offline-native |
| **Charts** | Recharts | React-native charting, good for line/bar charts, reasonable bundle |
| **Styling** | Tailwind CSS | Utility-first, fast iteration, good responsive primitives |
| **Testing** | Vitest + React Testing Library | Fast, Vite-native, compatible with Jest API |
| **Linting** | ESLint + Prettier | Standard code quality tooling |

### Storage Approach

**IndexedDB via Dexie** chosen over localStorage because:
- localStorage has a ~5MB limit; IndexedDB supports 50MB+ (browser-dependent, typically hundreds of MB)
- IndexedDB supports indexed queries (by date, exercise name)
- Dexie provides a clean Promise-based API with versioning and migrations

**Tables:**
- `sessions` — primary key: `id`, indexes: `date`, `[block+week]`
- `prRecords` — primary key: `id`, indexes: `exerciseName`, `sessionDate`
- `settings` — single row, key: `'app'`

### State Management

Zustand store slices:
- `sessionStore` — CRUD for sessions, current draft session
- `dashboardStore` — computed metrics (derived from sessions, memoized)
- `settingsStore` — app settings with persistence

Calculations are **pure functions** in a separate module — the store calls them, they don't import store state.

### Performance Considerations

- e1RM trend data: computed on-demand, memoized with `useMemo` keyed on session count + last update timestamp
- Charts: limit visible data window (default 6 months, expandable); use `ResponsiveContainer` for resize handling
- Large session lists: virtualized with CSS `overflow-y: auto` + pagination (50 sessions per page)

---

## 7. Implementation Blueprint

### Folder Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + layout shell
├── db/
│   ├── database.ts             # Dexie database definition
│   ├── migrations.ts           # Schema migration functions
│   └── seed.ts                 # Optional dev seed data
├── schemas/
│   └── index.ts                # Zod schemas + TS types
├── calculations/
│   ├── e1rm.ts                 # e1RM calculations (RTS + Brzycki/Epley)
│   ├── tonnage.ts              # Volume/tonnage calculations
│   ├── inol.ts                 # INOL calculations
│   ├── pr.ts                   # PR detection logic
│   ├── fatigue.ts              # Fatigue flag logic
│   ├── competition.ts          # Wilks + DOTS
│   ├── rts-table.ts            # RTS percentage chart data
│   └── index.ts                # Re-exports
├── stores/
│   ├── sessionStore.ts         # Zustand session store
│   ├── settingsStore.ts        # Zustand settings store
│   └── index.ts
├── hooks/
│   ├── useExerciseAutocomplete.ts
│   ├── useDashboardMetrics.ts
│   ├── useAnchors.ts
│   ├── usePRBoard.ts
│   └── useFatigueFlags.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Nav + content area
│   │   └── BottomNav.tsx
│   ├── session/
│   │   ├── SessionForm.tsx     # Main session form
│   │   ├── ExerciseCard.tsx    # Exercise entry card
│   │   ├── SetRow.tsx          # Individual set row
│   │   ├── WellnessPanel.tsx   # BW/sleep/stress inputs
│   │   └── PainEntry.tsx       # Pain input component
│   ├── dashboard/
│   │   ├── AnchorsCard.tsx
│   │   ├── E1rmChart.tsx
│   │   ├── VolumeChart.tsx
│   │   ├── ReadinessPanel.tsx
│   │   ├── FatigueAlerts.tsx
│   │   ├── PRBoard.tsx
│   │   └── CompetitionScores.tsx
│   ├── history/
│   │   ├── SessionList.tsx
│   │   └── SessionDetail.tsx
│   └── ui/
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Toast.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── LogSessionPage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── utils/
│   ├── units.ts                # kg/lb conversion
│   ├── normalization.ts        # Exercise name normalization
│   ├── dates.ts                # Date helpers
│   └── export-import.ts        # JSON export/import logic
└── styles/
    └── index.css               # Tailwind directives + custom styles
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| `SessionForm` | Orchestrates exercise/set entry; manages form state via React Hook Form; calls save |
| `ExerciseCard` | Single exercise with sets table; real-time e1RM display |
| `SetRow` | Inline-editable row for weight/reps/RPE |
| `E1rmChart` | Recharts LineChart for e1RM trends |
| `AnchorsCard` | Displays current loading anchors |
| `PRBoard` | Filtered list of PR records |

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useDashboardMetrics` | Computes and memoizes all dashboard data from sessions |
| `useAnchors` | Derives current T1 e1RM anchors per main lift |
| `usePRBoard` | Queries and filters PR records |
| `useFatigueFlags` | Computes active fatigue warnings |
| `useExerciseAutocomplete` | Returns unique exercise names from history |

### Key Utility Modules

| Module | Purpose |
|--------|---------|
| `e1rm.ts` | Pure functions: `computeE1RM(weight, reps, rpe?)`, RTS lookup |
| `tonnage.ts` | `setTonnage()`, `exerciseTonnage()`, `sessionTonnage()` |
| `inol.ts` | `computeINOL(weight, reps, current1RM)` |
| `pr.ts` | `detectPRs(exercise, existingPRs)` |
| `fatigue.ts` | `checkE1RMDrop(...)`, `checkRPEStreak(...)` |
| `competition.ts` | `wilks(total, bw, sex)`, `dots(total, bw, sex)` |
| `export-import.ts` | `exportData()`, `importData(json)`, `validateImport(json)` |

---

## 8. Starter Code

> See the `src/` directory in this repository for the full starter code.
> The starter code includes:
> - App shell with routing
> - Dexie database setup
> - Zod schemas and TypeScript types
> - Complete calculations module (e1RM, tonnage, INOL, PRs, fatigue, Wilks/DOTS)
> - Zustand stores with persistence
> - Log Session form with exercise/set entry
> - Dashboard with anchors card and e1RM trend chart

---

## 9. Test Plan

### Unit Tests — Calculations

| Test Suite | Cases |
|-----------|-------|
| **e1RM (RPE-based)** | Known RTS lookups (e.g., 100kg x 5 @ RPE 8 → expected e1RM); boundary RPE values; reps outside table range triggers fallback |
| **e1RM (non-RPE)** | Reps 1 (should equal weight); reps 5 with known weight; reps > 10 produces warning; reps == 37 for Brzycki edge case |
| **Tonnage** | Single set; multiple sets; zero weight; exercise total; session total |
| **INOL** | Normal case; intensity >= 100% (capped); missing anchor returns null |
| **PR detection** | New e1RM PR; no PR (below existing); weight-at-reps PR; first-ever entry (always PR) |
| **Fatigue: e1RM drop** | Drop > 5% flagged; drop exactly 5% not flagged; no prior data returns no flag |
| **Fatigue: RPE streak** | 2 consecutive RPE >= 9.5 flagged; streak broken by RPE < 9.5; fewer than N sessions returns no flag |
| **Wilks** | Known competition totals against published Wilks values (male + female) |
| **DOTS** | Known competition totals against published DOTS values |
| **Unit conversion** | kg→lb→kg round-trip accuracy |

### Integration Tests — Import/Export

| Test | Description |
|------|-------------|
| **Valid export/import round-trip** | Export data, import it, verify identical |
| **Schema validation on import** | Invalid JSON rejected; missing required fields rejected; extra fields preserved |
| **Schema migration** | v1 data migrated to v2 correctly (when v2 exists) |
| **Malformed data** | Negative weights, reps < 1, RPE out of range — all rejected with specific error messages |

### Component Tests (future)

- SessionForm: add exercise, add set, validate, save
- SetRow: edit weight/reps/RPE, see e1RM update
- E1rmChart: renders with data, empty state

---

## 10. Future Enhancements (Nice-to-Have)

1. **Cloud sync** — optional account + sync via Supabase or Firebase
2. **Programming / planning mode** — create future session templates with prescribed sets/reps/RPE, then "execute" them
3. **Plate calculator** — given a target weight, show plate loading on the bar
4. **Rest timer** — built-in between-set timer with configurable defaults per tier
5. **Video attachments** — link to form check videos (URL or local file reference)
6. **Social / sharing** — share PR achievements, session summaries
7. **Advanced analytics** — volume landmarks (MRV/MEV/MAV per muscle group), SFR tracking, fatigue-to-fitness model (Banister)
8. **Barbell / equipment profiles** — different bar weights (e.g., SSB = 25kg vs standard 20kg)
9. **Body measurements** — track circumferences, skinfolds alongside BW
10. **PWA / installable** — service worker for true offline + home screen install
11. **Dark mode** — theme toggle
12. **CSV import** — import from spreadsheet-based logs
13. **RPE-to-RIR conversion** — display RIR alongside RPE for users who prefer that scale
14. **Muscle group tagging** — auto-tag exercises with primary/secondary muscle groups for volume-per-muscle tracking
