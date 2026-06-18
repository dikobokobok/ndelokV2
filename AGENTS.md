# AGENTS.md — ndelok

## Repo Shape

Single-package frontend app (`frontend/`) with root `package.json` as **proxy** — all commands from repo root, never `frontend/` directly. Root `postinstall` auto-installs `frontend/` deps.

`backend/` is a Go HTTP server (`module ndelok-backend` in `go.mod`) — separate language, don't edit backend files unless explicitly asked. DB: SQLite via `modernc.org/sqlite` (pure Go, no CGO). DB file: `backend/ndelok.db`.

`.codegraph/` initialized at root — use `codegraph explore` first instead of grep/read loops.

## Dev Commands

```bash
npm run dev          # concurrently runs Vite (port 1234) + Go backend (port 1235)
npm run build        # tsc (noEmit from tsconfig) && vite build — typeerrors block bundle
npm run lint         # FAILS — frontend has no lint script; verify with npm run build instead
```

Backend port override: use `PORT=9000` env var (default: 1235).

Backend kill (Windows): `Stop-Process -Id (Get-NetTCPConnection -LocalPort 1235).OwningProcess -Force`.

## Architecture

- **No router** — single-page SPA via view-state enum (`currentView` in `App.tsx`)
- Entry: `main.tsx` → `App.tsx` → `Dashboard` or `AuthGate`
- Session: `sessionStorage("ndelok-session")` with `lastActivity` timestamp, 1h inactivity auto-logout
- 4 files in `frontend/src/`: `main.tsx`, `App.tsx`, `AuthPages.tsx`, `index.css`
- Xterm.js terminal: `xterm` + `xterm-addon-fit` deps, WS to backend
- Backend auto-restores projects that were RUNNING before shutdown (`handler.RestoreRunningProjects()` in `main.go`)
- API base: `http://127.0.0.1:1235` (IPv4 loopback — Windows DNS `localhost` may resolve to `[::1]`)

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | DB connectivity check |
| `/api/auth/login` | POST | Session auth, demo: `admin`/`admin123` |
| `/api/auth/register` | POST | New user |
| `/api/metrics` | GET | CPU, RAM, disk, network |
| `/api/plugins/zerotier/{status,install,join,service,leave}` | POST/GET | ZeroTier lifecycle |
| `/api/plugins/tmux/{status,install,new,session,terminal}` | POST/GET/WS | Tmux lifecycle |
| `/api/terminal` | WS | Direct platform shell terminal |
| `/api/deploy/projects` | GET/POST | List/create projects |
| `/api/deploy/projects/{id}` | PUT/DELETE | Edit/delete project |
| `/api/deploy/projects/{id}/toggle` | POST | Start/stop daemon |
| `/api/deploy/projects/{id}/stream` | WS | Live build log stream |
| `/api/deploy/projects/{id}/logs` | WS | Live daemon log tail |
| `/api/explorer/{list,content,save,create,rename,delete,copy,move,upload}` | POST | File explorer |

CORS: dynamic — echoes request `Origin` header, falls back to `http://localhost:1234` if empty.

## UI Constraints (Neobrutalist)

- **No `border-radius`** (use `0px`); **no blur on shadows**; solid `#000000` borders
- CSS tokens in `index.css`: `var(--system-green)`, `var(--shadow)`, `var(--border-width)` etc — use these, not `DESIGN.md` aliases
- Color system: `oklch()` only (`--system-green`, `--system-blue`, `--system-yellow`, `--system-red`)
- Fonts from Google Fonts import: `Space Grotesk` (headings), `Inter` (body), `Space Mono` (mono), `Bebas Neue` (display), `Syne` (accent)
- Utility classes: `.font-heading`, `.font-body`, `.font-mono`, `.font-display`, `.font-syne`
- WCAG 2.2 AA contrast required (≥4.5:1 operational text)

## Build Constraints

- `frontend/tsconfig.json`: strict mode, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noEmit`, bundler resolution
- Build order: `tsc` (typechecks with `noEmit`) then `vite build` — typeerrors block bundling
- `ndelok-root` is `file:..` dep in `frontend/package.json` — version bumps without reinstall break resolution
- Port 1234 hardcoded in `frontend/vite.config.ts:7` — don't change
- `concurrently` devDependency at root orchestrates both servers

## What Not To Do

- No test/lint tooling — don't add without instruction
- Don't create/edit `backend/` files — separate Go module
- Don't replace CSS variables with hardcoded pixel/border values
- Don't replace `oklch()` colors with hex/HSL
