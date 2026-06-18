# ndelok — Server Console

Neobrutalist server monitoring & management console. Flat, high-contrast UI with thick black borders and hard shadows — rejects gradient-soft SaaS conventions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, TypeScript 5, Vanilla CSS, Lucide Icons, Xterm.js |
| **Backend** | Go (standard `net/http`), `github.com/gorilla/websocket` |
| **Database** | SQLite (`backend/ndelok.db`) via `modernc.org/sqlite` (pure Go, no CGO) |
| **Dev tool** | `concurrently` (orchestrates Vite + Go concurrently) |

---

## Architecture

```
ndelok/
├── frontend/             # React 19 + Vite 6 + TypeScript 5
│   └── src/
│       ├── App.tsx           # Main SPA view router, Deploy page, custom modals
│       ├── AuthPages.tsx     # Login / Register / Decorative ticker
│       ├── main.tsx          # React client entry
│       └── index.css         # OKLCH colors, Neobrutalist design system tokens
├── backend/              # Go HTTP Backend
│   ├── main.go              # Mux router, CORS policies, port binding
│   ├── db/
│   │   └── db.go            # SQLite initialization (users, projects tables)
│   ├── handler/
│   │   ├── auth.go          # Session auth handler (demo: admin/admin123)
│   │   ├── metrics.go       # System metrics (CPU, RAM, Disk, Net bandwidth)
│   │   ├── plugin.go        # ZeroTier & Tmux lifecycle handlers
│   │   ├── deploy.go        # Projects REST API + real-time WS build logging
│   │   ├── daemon_unix.go   # SysProcAttr Setpgid config (Linux/macOS)
│   │   ├── daemon_windows.go# Windows no-op attrs + taskkill tree-killing logic
│   │   ├── shell_unix.go    # Unix sh runner
│   │   ├── shell_windows.go # Windows cmd runner
│   │   └── terminal.go      # Shell / Tmux terminal WS upgrade handlers
│   └── ndelok.db         # Persistent SQLite database file
├── package.json          # Root dev commands
├── DESIGN.md             # Styling guide
└── PRODUCT.md            # WCAG 2.2 contrast compliance specifications
```

---

## Features

- **Real-time Server Metrics**: SVG line charts for CPU loads, RAM memory usage conversion to GB, disk storage indicators, and live network I/O speeds.
- **Deploy Manager**:
  - Deploy apps directly via Git clone or Local folder reference.
  - Interactive deployment logs streamed over WebSockets using raw byte channels.
  - Multi-platform Daemon management: Service start/stop controls.
  - Robust process tree termination using `taskkill /F /T` on Windows and group signal `syscall.Kill(-pid, SIGKILL)` on Unix.
- **Plugin Multiplexing (ZeroTier & Tmux)**:
  - **ZeroTier**: Remote installation, network joining/leaving, and virtual IP tracking.
  - **Tmux**: Attach existing sessions, spawn new ones, or delete sessions directly from an integrated browser-based shell console (`xterm.js` via WebSockets).
- **Session Security**: Storage activity tracking with a 1-hour automatic inactivity logout timer.
- **Neobrutalist Design System**: Borderless panels, `#000000` solid borders (`3px`), sharp hard shadows (`var(--shadow)`), and pure OKLCH color palettes.

---

## Quick Start

```bash
# 1. Install dependencies (automatically installs frontend/ dependencies)
npm install

# 2. Launch Dev Environment (Vite on :1234, Go Backend on :1235)
npm run dev

# 3. Compile for production (type-checks and bundles frontend)
npm run build
```

---

## Backend API Endpoints

### Auth
- `POST /api/auth/login` - Session authentication (demo: `admin` / `admin123`)
- `POST /api/auth/register` - Create a new user account

### Metrics
- `GET /api/metrics` - CPU load, RAM specs, Disk capacity, Network speeds

### Deployments
- `GET /api/deploy/projects` - List all projects
- `POST /api/deploy/projects` - Create a new deployment project
- `PUT /api/deploy/projects/{id}` - Edit project details
- `DELETE /api/deploy/projects/{id}` - Stop daemon + delete project details
- `POST /api/deploy/projects/{id}/toggle` - Toggle daemon process (START/STOP)
- `WS /api/deploy/projects/{id}/stream` - Stream live build logs
- `WS /api/deploy/projects/{id}/logs` - Tail live daemon log files (`ndelok.log`)

### Plugins & Terminal
- `GET /api/plugins/zerotier/status` - Check installation / running state
- `POST /api/plugins/zerotier/install` - Install ZeroTier daemon
- `POST /api/plugins/zerotier/join` - Join Zerotier network ID
- `POST /api/plugins/zerotier/service` - Enable/Disable ZeroTier service
- `POST /api/plugins/zerotier/leave` - Leave Network + clear configuration
- `GET /api/plugins/tmux/status` - List running tmux sessions
- `POST /api/plugins/tmux/install` - Install Tmux on server
- `POST /api/plugins/tmux/new` - Spawn new Tmux session
- `POST /api/plugins/tmux/session` - Terminate/delete Tmux session
- `WS /api/plugins/tmux/terminal` - Stream interactable tmux session to frontend
- `WS /api/terminal` - Direct platform shell WebSocket terminal

---

## Troubleshooting (Windows DNS Conflicts)

If you encounter issues where deploy/log windows are completely blank or network calls hang:
1. **Cause**: Windows resolves `localhost` to IPv6 (`[::1]`) by default. Go binds to IPv4 (`0.0.0.0`), and another node/Vite process might grab `[::1]:1235` causing request hijacking.
2. **Fix**: Connect strictly using IPv4 loopback `127.0.0.1:1235` for all API calls and WS connections (already configured by default in `App.tsx` and `AuthPages.tsx`).
