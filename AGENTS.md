# AGENTS.md — ndelok

## Repo Shape

Single-package frontend app (`frontend/`) with root `package.json` as **proxy** — all commands from repo root, never `frontend/` directly. Root `postinstall` auto-installs `frontend/` deps.

`backend/` is a Go HTTP server (not placeholder). DB: SQLite via `modernc.org/sqlite` (pure Go, no CGO). DB file: `backend/ndelok.db`.

`.codegraph/` initialized at root. Use `codegraph explore` first instead of grep/read loops.

## Dev Environment

```bash
npm run dev       # concurrently runs Vite (port 1234) + Go backend (port 1235)
npm run build     # tsc --noEmit && vite build — typeerrors fail before bundle; also the only typecheck
npm run lint      # FAILS — frontend has no lint script
```

Backend kills: `lsof -ti:1235 | xargs kill -9` — old binary persists after restarts.

Backend port override: `PORT=9000 npm run dev:backend`.

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | DB connectivity check |
| `/api/auth/login` | POST | Session auth, demo: `admin`/`admin123` |
| `/api/auth/register` | POST | New user |
| `/api/metrics` | GET | CPU, RAM, disk, network |
| `/api/plugins/zerotier/{status,install,join,service,leave}` | POST/GET | ZeroTier plugin lifecycle |

CORS hardcoded to `http://localhost:1234` in `backend/main.go:32`.

## Architecture

- **No router** — single-page SPA via view-state enum (`currentView` in `App.tsx`)
- Entry: `main.tsx` → `App.tsx` → `Dashboard` or `AuthGate`
- Session: `sessionStorage("ndelok-session")` with `lastActivity` timestamp, 1h inactivity auto-logout
- 3 source files in `frontend/src/` + `index.css`
- Backend: `backend/main.go`, `backend/db/db.go`, `backend/handler/` (auth, metrics, plugins)

## UI Constraints (Neobrutalist)

- **No `border-radius`** (use `0px`); **no blur on shadows**; solid `#000000` borders
- CSS tokens in `frontend/src/index.css`: `var(--system-green)`, `var(--shadow)`, `var(--border-width)` etc — use these, not DESIGN.md aliases
- Color system: `oklch()` only (`--system-green`, `--system-blue`, `--system-yellow`, `--system-red`)
- Fonts declared in `index.css` `@import` (line 1) — `Space Grotesk` (headings), `Inter` (body), `Space Mono` (mono), `Bebas Neue` (display), `Syne` (accent)
- Utility classes: `.font-heading`, `.font-body`, `.font-mono`, `.font-display`, `.font-syne`
- WCAG 2.2 AA contrast required (≥4.5:1 operational text)

## Build Constraints

- `frontend/tsconfig.json`: strict mode, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noEmit`, bundler resolution
- Build order: `tsc --noEmit` then `vite build` — typeerrors block bundling
- `ndelok-root` is `file:..` dep in `frontend/package.json` — version bumps without reinstall break resolution
- Port 1234 hardcoded in `frontend/vite.config.ts:7` — don't change
- `concurrently` devDependency at root orchestrates both frontend+backend dev servers

## What Not To Do

- No test/lint tooling — don't add without instruction
- Don't create/edit `backend/` files — separate Go project
- Don't move Vite port from 1234
- Don't replace CSS variables with hardcoded pixel/border values
- Don't replace `oklch()` colors with hex/HSL
