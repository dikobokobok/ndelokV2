# AGENTS.md — ndelok

## Repo Shape

Single-package frontend app (`frontend/`) with root `package.json` as **proxy** — all commands from repo root, never `frontend/` directly. Root `postinstall` auto-installs `frontend/` deps.

`backend/` is a Go HTTP server (`module ndelok-backend` in `go.mod`) — separate language, don't edit backend files unless explicitly asked. DB: SQLite via `modernc.org/sqlite` (pure Go, no CGO). DB file: `backend/ndelok.db`.

`.codegraph/` initialized at root — use `codegraph explore` first instead of grep/read loops.

## Dev Commands

```bash
npm run dev          # Vite HMR (port 1234) + Go compiled binary (port 1235) via concurrently
npm run build        # tsc (noEmit from tsconfig) && vite build — typeerrors block bundle
npm run lint         # FAILS — frontend has no lint script; verify with npm run build instead

Go backend is **precompiled** (`go build -o server.exe`), no HMR. After backend edits, kill server, re-run `npm run dev`.
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

## Known Issues (Bug Hunt - Jun 2026)

| # | Severity | Location | Issue | Notes |
|---|----------|----------|-------|-------|
| B1 | CRITICAL | `server/auth.go:25` | **Auth bypass** — `RequireAuth` returns 200 without any header check. Any request with any `Authorization` header (or none on wildcard routes) passes. | FIXED: proper middleware checks Bearer token |
| B2 | HIGH | `server/auth.go:45` | **Session replay** — `ValidateSession` skips HMAC verification on server-side sessions. Attacker with one valid sessionID reuses it indefinitely. | FIXED: HMAC-signed tokens, server-side expiry, rotation on use |
| B3 | HIGH | `server/cors.go:15` | **CORS origin reflection** — echoes request `Origin` verbatim into `Access-Control-Allow-Origin`. Any website can read authenticated responses. | FIXED: allowlist in main.go |
| B4 | MEDIUM | `server/auth.go:70` | **XSS in register** — username reflected unescaped into error JSON; `json:"error"` doesn't HTML-escape. | FALSE POSITIVE: JSON encoding + React escapes |
| B5 | MEDIUM | `server/handler.go` | **SQL injection in project queries** — user-controlled `name`/`repo` values interpolated into SQL without parameterization. | FALSE POSITIVE: all queries parameterized |
| B6 | MEDIUM | `server/auth.go:88` | **Timing-safe comparison** — uses `==` on HMAC strings, not `hmac.Equal`. Side-channel leak of session tokens. | FIXED: uses `hmac.Equal` |
| B7 | LOW | `server/explorer.go` | **Path traversal** — `scanner.go`'s `CleanPath` strips `..` but allows absolute paths on Windows (`C:\`). Symlink/junction risk. | FIXED: `resolveSymlinkPrefix` walks up to resolve existing ancestor chain |
| B8 | LOW | `server/auth.go` | **No rate limiting** — login endpoint unthrottled. Offline brute-force on demo creds. | FIXED: token-bucket rate limiter on `/api/auth/login` |

> **Status**: B1-B3, B6-B8 **FIXED** (see PR #current). B4 false positive (JSON encoding + React escapes). B5 false positive (all queries parameterized).

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
