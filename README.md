# Employee Records App

A modular employee-records management app: searchable/filterable table, paginated
results, validated add/edit form, delete confirmation, and CSV/JSON export.

Built with **React 19 + TypeScript + Vite**, styled with **Tailwind CSS v4** and
**shadcn/ui** (Base UI primitives), with **TanStack Query** for server state and
**TanStack Virtual** for windowed rendering.

## Tech stack

| Concern          | Choice                                                             |
| ---------------- | ------------------------------------------------------------------ |
| UI runtime       | React 19, TypeScript 6                                             |
| Build tool       | Vite 8                                                             |
| Styling          | Tailwind CSS v4 (`@tailwindcss/vite`)                              |
| Component system | shadcn/ui (style `base-nova`) on `@base-ui/react`                  |
| Icons            | lucide-react                                                       |
| Server state     | TanStack Query                                                     |
| List rendering   | TanStack Virtual (`useVirtualizer`)                                |
| Forms            | react-hook-form                                                    |
| Class merging    | `cn` (shadcn's clsx + tailwind-merge) + `class-variance-authority` |
| Testing          | Vitest + React Testing Library (`jsdom`)                           |
| Lint / format    | ESLint (flat config) + Prettier                                    |

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8)
- npm 10+

## Install & run

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (default `http://localhost:5173`).

Other scripts:

```bash
npm run build        # type-check (tsc -b) + production build
npm run preview      # serve the production build locally
npm run lint         # ESLint (React Hooks + Fast Refresh rules)
npm test             # Vitest, single run
npm run test:watch   # Vitest, watch mode
npm run format       # Prettier (skips generated src/components/ui)
npm run format:check # verify formatting without writing
```

> Correctness is checked via `tsc`, ESLint, Prettier and the Vitest suite below.

## Features

- Employee table (ID, Name, Email, Department, Role, Status, Actions)
- Debounced search across name, email and role
- Multi-select department filter combined with search
- Client-side pagination with page jump, rows-per-page and total counts
- Add / edit employee via a validated modal form
- Delete with confirmation (handles deleting the last row of a page)
- Export the current result set (respecting active search/filters) to CSV and JSON
- Explicit loading, empty, no-results and error states (with retry)
- Responsive layout; the table scrolls horizontally on narrow screens

## Project structure

```
src/
├── App.tsx                    Composition + view state only
├── main.tsx                   Providers (TanStack Query) + mount
├── index.css                  Tailwind entry + design tokens (shadcn theme)
├── test/setup.ts              Vitest setup (jest-dom matchers, jsdom polyfills)
├── components/
│   ├── EmployeeTable.tsx      Virtualized table (TanStack Virtual)
│   ├── EmployeeForm.tsx       Validated add/edit form (lazy, react-hook-form)
│   ├── FilterPanel.tsx        Department multi-select chips (shadcn Checkbox)
│   ├── SearchBar.tsx          Debounced search input (shadcn Input)
│   ├── Pagination.tsx         Page controls (shadcn Button/Input/Select)
│   ├── Modal.tsx              Thin wrapper over shadcn Dialog
│   ├── ErrorBoundary.tsx      Top-level render-error safety net
│   ├── Loading.tsx
│   ├── *.test.tsx             Colocated component tests
│   └── ui/                    shadcn-generated primitives (do not hand-edit)
│       ├── badge.tsx  button.tsx  checkbox.tsx  dialog.tsx
│       └── input.tsx  label.tsx   select.tsx
├── hooks/
│   ├── useEmployees.ts        Query data + derived filtering/sorting/pagination
│   ├── useEmployees.test.tsx
│   └── useDebouncedValue.ts
├── lib/utils.ts               `cn` re-export
├── services/
│   ├── employeeApi.ts         Typed API layer (the only place that calls fetch)
│   └── employeeApi.test.ts
├── types/employee.ts          Domain types + constants
└── utils/
    ├── exportUtils.ts         CSV/JSON export (CSV formula-injection neutralized)
    ├── exportUtils.test.ts
    ├── sanitize.ts            Input sanitization + email validation
    ├── sanitize.test.ts
    ├── helpers.ts             Pagination math, range text, class names
    └── helpers.test.ts
```

## Data source

Data is fetched from the public [DummyJSON](https://dummyjson.com/docs/users)
REST API (`/users`). No hardcoded data is used as a primary source.

Server state is managed with **TanStack Query**: the request is cached, retried
on failure, deduplicated, and cancelled on unmount via the `AbortSignal` passed
to the service. Add/edit/delete are applied to the query cache
(`queryClient.setQueryData`) since there is no write API — the cache remains the
single source of truth and no duplicate list lives in component state.

To demonstrate virtualization at scale, the fetched seed users are expanded into
a larger deterministic dataset. Copy `.env.example` to `.env` and configure it:

```bash
VITE_EMPLOYEE_API_URL=https://dummyjson.com/users?limit=0&select=id,firstName,lastName,email
VITE_RECORD_COUNT=1500
```

`VITE_RECORD_COUNT` is clamped to a safe range (50–20000) and falls back to the
seed count when invalid.

No secrets or API keys are used; only public, non-sensitive configuration belongs
in `VITE_*` variables (they are embedded in the client bundle).

## UI components (shadcn)

shadcn is configured in `components.json` (style `base-nova`, base color
`neutral`, CSS variables on). The primitives under `src/components/ui/` are
generated by the shadcn CLI and are excluded from ESLint (they intentionally
export non-component symbols).

Add or refresh a component with:

```bash
npx shadcn@latest add <component>
```

Design tokens (brand palette mapped onto `--primary`/`--ring`, fonts, radii) live
in `src/index.css` under `@theme` / `@theme inline` and `:root` / `.dark`.

## Performance decisions

- **Virtualized table** — only visible rows (plus overscan) are rendered
  regardless of page size, using **TanStack Virtual**.
- **Debounced search** (300 ms) — filtering does not run on every keystroke.
- **Derived, not duplicated state** — filtering, sorting and pagination are
  `useMemo` derivations of the cached query data.
- **Memoized components & callbacks** — `React.memo` + `useCallback` keep stable
  references so unaffected rows/components skip re-renders.
- **Stable keys** — rows are keyed by employee `id`.
- **Code splitting** — the employee form is `React.lazy` loaded, so
  `react-hook-form` and the form markup ship in a separate chunk, not the initial
  bundle.
- **Uncontrolled inputs** — react-hook-form keeps field state in refs, avoiding a
  re-render on every keystroke.
- **Fonts** — Geist variable subsets are declared with `unicode-range`, so only
  the subset actually used is downloaded at runtime.

## Security decisions

- **No `dangerouslySetInnerHTML`** — all API/user data is rendered as text
  through React's escaping.
- **Untrusted API payloads are normalized** — the remote response is validated
  and coerced (`normalizeRemoteUsers`) before use; malformed entries are dropped
  rather than trusted via a type cast.
- **Input sanitization & validation** — form values are trimmed, control
  characters stripped and length-capped; names and emails are validated with
  clear messages before use.
- **CSV injection protection** — export cells beginning with `=`, `+`, `-`, `@`,
  tab, carriage return or newline (including after leading whitespace) are
  prefixed with `'` and quoted.
- **Content Security Policy** — a restrictive CSP is injected into
  `dist/index.html` at build time by a Vite plugin (`vite.config.ts`); it is not
  applied in dev so HMR keeps working. Add any custom API origin to
  `connect-src`.
- **Referrer policy** — `no-referrer` is set on the document.
- **No secrets in the client** — only public configuration is used; user-facing
  errors are generic and no sensitive detail is logged or placed in URLs.
- **Dependency hygiene** — `npm audit` is clean; build-only tooling (`shadcn`,
  `tw-animate-css`, `tailwindcss`, `vite`, ESLint) is in `devDependencies`, and
  runtime dependencies are limited to what the UI needs.

## Testing

Unit and component tests run with **Vitest** in a `jsdom` environment using
**React Testing Library**. Tests are colocated with the code as
`*.test.ts(x)` and share setup in `src/test/setup.ts`.

```bash
npm test
```

| Area       | File                                                           | What it covers                                                                                    |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Utils      | `utils/sanitize.test.ts`                                       | trimming, control-char stripping, length caps, email validation                                   |
| Utils      | `utils/exportUtils.test.ts`                                    | CSV formula neutralization (incl. leading whitespace), quoting/escaping, BOM/CRLF, no-op on empty |
| Utils      | `utils/helpers.test.ts`                                        | range text and pagination window math                                                             |
| Service    | `services/employeeApi.test.ts`                                 | payload normalization, malformed-entry dropping, HTTP/empty errors                                |
| Hook       | `hooks/useEmployees.test.tsx`                                  | load/sort, department + debounced search filtering, pagination, add/update/delete, error state    |
| Components | `SearchBar`, `FilterPanel`, `Pagination`, `EmployeeForm` tests | event wiring, selected/disabled state, required + format validation, sanitized submit             |

## Accessibility

- Modals use Base UI's Dialog (focus trap, focus restore, Escape to close, ARIA
  wiring).
- Inputs and selects are associated with `<label>`s; invalid fields set
  `aria-invalid` and reference their error message via `aria-describedby`.
- The table exposes `role="table"`/`row`/`cell`/`columnheader` with row/column
  counts; live regions announce the result count.
