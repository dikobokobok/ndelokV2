# AGENTS.md — ndelok

## Repo Shape

Single-package frontend app (`frontend/`) with root `package.json` as **proxy** — all commands from repo root, never `frontend/` directly. Root `postinstall` auto-installs `frontend/` deps.

`backend/` is a Go HTTP server (`module ndelok-backend`) — separate language, don't edit backend files unless explicitly asked. DB: SQLite via `modernc.org/sqlite` (pure Go, no CGO). DB file: `backend/ndelok.db` (auto-created, not committed).

`.codegraph/` initialized at root — use `codegraph explore` first instead of grep/read loops.

## Dev Commands

```bash
npm run dev          # Vite HMR (port 1234) + Go compiled binary (port 1235) via concurrently
npm run build        # tsc (noEmit) && vite build — typeerrors block bundle
npm run lint         # FAILS — no lint script; verify with npm run build instead

Go backend is **precompiled** (`go build -o server.exe`), no HMR. After backend edits, kill server, re-run `npm run dev`.
```

Backend port override: `PORT=9000` env var (default: 1235).

Backend kill (Windows):
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 1235).OwningProcess -Force
```

## Architecture

- **No router** — single-page SPA via view-state enum (`currentView` in `App.tsx`)
- Entry: `main.tsx` → `App.tsx` → `Dashboard` or `AuthGate`
- Session: `sessionStorage("ndelok-session")` with `lastActivity` timestamp, 1h inactivity auto-logout
- 4 files in `frontend/src/`: `main.tsx`, `App.tsx`, `AuthPages.tsx`, `index.css`
- Xterm.js terminal: `xterm` + `xterm-addon-fit` deps, WS to backend
- Backend auto-restores projects that were RUNNING before shutdown (`handler.RestoreRunningProjects()` in `main.go`)
- API base: `http://127.0.0.1:1235` (IPv4 loopback — Windows DNS `localhost` may resolve to `[::1]`)
- CORS: allowlist-based (not origin reflection) — configured in `main.go`

## UI Constraints (Neobrutalist)

- **No `border-radius`** (use `0px`); **no blur on shadows**; solid `#000000` borders
- CSS tokens in `index.css`: `var(--system-green)`, `var(--shadow)`, `var(--border-width)` etc — use these, not hardcoded values
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

## Resilience Gaps

- Metrics polling: 1s interval with **no backoff or circuit breaker** — when backend is down it floods network with failed requests until manual reload
- 401 response handling: `apiFetch` clears session + reloads, but catch blocks in polling loops (`App.tsx:263`) swallow the error before reload triggers — silent infinite polling loop
- No retry budget or exponential backoff on any API call

## What Not To Do

- No test/lint tooling — don't add without instruction
- Don't create/edit `backend/` files — separate Go module
- Don't replace CSS variables with hardcoded pixel/border values
- Don't replace `oklch()` colors with hex/HSL
