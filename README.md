# ndelok — Server Console

Neobrutalist server monitoring & management console. Flat, high-contrast UI with thick black borders and hard shadows — rejects gradient-soft SaaS conventions.

**Version:** 0.23.1

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, TypeScript 5, Vanilla CSS (Neobrutalist), Lucide Icons, Xterm.js 5 |
| **Backend** | Go 1.25 (`net/http`), `gorilla/websocket`, `shirou/gopsutil` (system metrics) |
| **Database** | SQLite via `modernc.org/sqlite` — pure Go, no CGO, no platform C toolchain needed |
| **Dev Orchestration** | `concurrently` (runs Vite + Go side-by-side) |

---

## Features

- **Real-time Dashboard** — SVG line charts for CPU load, RAM usage (GB), disk storage, network I/O speed. 1s polling.
- **Deploy Manager** — Deploy apps from Git or local folder. Build log streaming over WebSocket. Daemon start/stop with platform-native process tree kill.
- **File Explorer** — Full server filesystem browser. Read, create, edit, rename, delete, copy, move, and upload files/directories.
- **Plugins** — ZeroTier (virtual network join/leave/status) and Tmux (session create/attach/delete/terminal) management.
- **Terminal** — Direct shell WebSocket terminal via Xterm.js (`/api/terminal`). Tmux WebSocket terminal (`/api/plugins/tmux/terminal`).
- **AI DevOps Agent** — Floating assistant overlay. Draggable, minimizable, always-on-top.
- **Auth** — Session-based login/register. 1-hour inactivity auto-logout. Demo: `admin` / `admin123`.
- **Neobrutalist UI** — 3px solid black borders, zero-blur hard shadows, OKLCH color system, WCAG 2.2 AA contrast compliance.

---

## Prerequisites

### Windows

| Dependency | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 20 | Includes `npm` |
| **Go** | ≥ 1.21 | Download from [go.dev](https://go.dev/dl/) |
| **Git** | Any | For cloning repos via deploy feature |

### Linux (Ubuntu/Debian)

```bash
# Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Go
sudo snap install go --classic

# Git
sudo apt-get install -y git

# Tmux (optional — for Tmux plugin)
sudo apt-get install -y tmux

# ZeroTier (optional — for ZeroTier plugin)
curl -s https://install.zerotier.com | sudo bash
```

### Linux (Arch)

```bash
sudo pacman -S nodejs npm go git tmux zerotier-one
```

### Linux (Fedora/RHEL)

```bash
sudo dnf install -y nodejs npm golang git tmux
curl -s https://install.zerotier.com | sudo bash
```

### macOS

```bash
# Homebrew
brew install node go git tmux

# ZeroTier
curl -s https://install.zerotier.com | sudo bash
```

---

## Installation

### 1. Clone

```bash
git clone https://github.com/dikobokobok/ndelokV2.git
cd ndelokV2
```

### 2. Install dependencies

```bash
npm install
```

This runs `postinstall` which automatically installs `frontend/` dependencies.

### 3. Verify setup

```bash
# Check Node.js
node --version   # ≥ 20

# Check Go
go version       # ≥ 1.21

# Check npm
npm --version
```

---

## Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

This starts:
- **Vite dev server** on `http://127.0.0.1:1234`
- **Go backend** on `http://127.0.0.1:1235`

### Run individually

```bash
# Frontend only
npm run dev:frontend

# Backend only (custom port)
PORT=9000 npm run dev:backend
```

### Kill backend (Windows)

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 1235).OwningProcess -Force
```

### Kill backend (Linux/macOS)

```bash
lsof -ti:1235 | xargs kill -9
```

---

## Production Build

```bash
npm run build
```

This runs:
1. `tsc` — TypeScript type-checking (strict mode, `noEmit`)
2. `vite build` — Bundles frontend to `frontend/dist/`

Type errors block the bundle — no output if type-checking fails.

---

## Project Structure

```
ndelok/
├── frontend/                  # React 19 + Vite 6 SPA
│   └── src/
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # SPA view router + Dashboard + Plugins +
│       │                      # Deploy + Explorer + LogsTerm + AI Agent
│       ├── AuthPages.tsx      # Login / Register / Terminal ticker
│       └── index.css          # Neobrutalist design system (OKLCH tokens)
├── backend/                   # Go HTTP server
│   ├── main.go                # Mux, CORS, port binding, route registration
│   ├── db/
│   │   └── db.go              # SQLite init (users, projects tables)
│   ├── handler/
│   │   ├── auth.go            # POST /api/auth/login, /register
│   │   ├── metrics.go         # GET /api/metrics (CPU, RAM, disk, net)
│   │   ├── plugin.go          # ZeroTier + Tmux lifecycle handlers
│   │   ├── deploy.go          # Projects CRUD + WS build logs + daemon logs
│   │   ├── explorer.go        # File system browser API
│   │   ├── terminal.go        # Shell + Tmux WS terminal handlers
│   │   ├── daemon_unix.go     # Process group management (Linux/macOS)
│   │   ├── daemon_windows.go  # taskkill /F /T tree killing (Windows)
│   │   ├── shell_unix.go      # Unix sh runner
│   │   └── shell_windows.go   # Windows cmd runner
│   ├── model/                 # Go data models
│   └── ndelok.db              # SQLite database (auto-created)
├── package.json               # Root dev scripts (proxy to frontend/)
├── DESIGN.md                  # Neobrutalist design system documentation
├── PRODUCT.md                 # Product specification & WCAG 2.2 compliance
└── AGENTS.md                  # AI assistant instructions for this repo
```

---

## Backend API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | DB connectivity check |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login — demo: `admin` / `admin123` |
| `POST` | `/api/auth/register` | Create account |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/metrics` | CPU load, RAM usage, disk capacity, network speeds |

### Deploy — Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/deploy/projects` | List all projects |
| `POST` | `/api/deploy/projects` | Create project |
| `PUT` | `/api/deploy/projects/{id}` | Edit project |
| `DELETE` | `/api/deploy/projects/{id}` | Delete project |
| `POST` | `/api/deploy/projects/{id}/toggle` | Start/stop daemon |
| `WS` | `/api/deploy/projects/{id}/stream` | Live build log stream |
| `WS` | `/api/deploy/projects/{id}/logs` | Live daemon log tail (`ndelok.log`) |

### Plugins — ZeroTier

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plugins/zerotier/status` | Check installation / running state |
| `POST` | `/api/plugins/zerotier/install` | Install ZeroTier daemon |
| `POST` | `/api/plugins/zerotier/join` | Join ZeroTier network |
| `POST` | `/api/plugins/zerotier/service` | Enable/disable ZeroTier service |
| `POST` | `/api/plugins/zerotier/leave` | Leave network + clear config |

### Plugins — Tmux

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plugins/tmux/status` | List running tmux sessions |
| `POST` | `/api/plugins/tmux/install` | Install tmux |
| `POST` | `/api/plugins/tmux/new` | Create new session |
| `POST` | `/api/plugins/tmux/session` | Delete session |
| `WS` | `/api/plugins/tmux/terminal` | WebSocket terminal into a session |

### Terminal

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/api/terminal` | Direct platform shell (cmd/sh) via WebSocket |

### File Explorer

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/explorer/list` | List directory contents |
| `GET` | `/api/explorer/content` | Read file content |
| `POST` | `/api/explorer/save` | Write file content |
| `POST` | `/api/explorer/create` | Create file or directory |
| `POST` | `/api/explorer/rename` | Rename file or directory |
| `POST` | `/api/explorer/delete` | Delete file or directory |
| `POST` | `/api/explorer/copy` | Copy file or directory |
| `POST` | `/api/explorer/move` | Move file or directory |
| `POST` | `/api/explorer/upload` | Upload files (multipart) |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `1235` | Backend HTTP server port |

---

## Troubleshooting

### Windows DNS — `localhost` resolves to IPv6

If deploy/log windows are blank or WebSocket connections hang:

1. **Cause**: Windows resolves `localhost` to `[::1]` (IPv6) by default. Go binds to `0.0.0.0` (IPv4). Another process may grab `[::1]:1235`, hijacking requests.
2. **Fix**: The app hardcodes `http://127.0.0.1:1235` (IPv4 loopback) for all API and WebSocket connections — no action needed. If you see issues, confirm no process listens on `[::1]:1235`.

### Port conflict (1234 or 1235)

```bash
# Windows — find what's using port 1234
netstat -ano | findstr :1234

# Linux/macOS
lsof -i :1234
```

### Backend fails to start

```bash
# Check if ndelok.db is locked (Windows)
# Delete WAL files if present (safe — recreated on next start)
rm backend/ndelok.db-wal backend/ndelok.db-shm
```

---

## Build Configuration

- `frontend/tsconfig.json` — strict mode, `noUnusedLocals`, `noUnusedParameters`, `noEmit`, bundler module resolution
- `frontend/vite.config.ts` — port 1234 hardcoded, `0.0.0.0` host, React plugin
- `go.mod` — Go 1.25, pure Go SQLite (no CGO required)
- CORS — dynamic origin echo, falls back to `http://localhost:1234`

---

## Semantic Versioning

This project follows **SemVer 2.0.0**:

- **MAJOR** — Breaking UI/API changes or design system overhauls
- **MINOR** — New features, plugins, endpoints, or views
- **PATCH** — Bug fixes, performance, accessibility, or documentation

---

## License

MIT — see LICENSE file (if present) or contact maintainer.
