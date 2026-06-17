# ndelok — Server Console

Neobrutalist server monitoring & management console. Flat, high-contrast UI with thick black borders and hard shadows — rejects gradient-soft SaaS conventions.

## Architecture

```
ndelok/
├── frontend/          # React 19 + Vite 6 + TypeScript 5
│   └── src/
│       ├── App.tsx        # Dashboard, ZeroTier, session, polling
│       ├── AuthPages.tsx  # Login / Register / AuthGate
│       ├── main.tsx       # React entry
│       └── index.css      # Neobrutalist tokens, Google Fonts
├── backend/           # Go HTTP server
│   ├── main.go           # Routes, CORS, server init
│   ├── db/db.go          # SQLite init (users, zerotier_config)
│   └── handler/          # auth.go, metrics.go, plugin.go
├── package.json       # Root proxy — all commands from here
├── DESIGN.md          # Design reference (use tokens from index.css)
└── PRODUCT.md         # WCAG 2.2 AA spec
```

## Quick Start

```bash
npm install           # auto-installs frontend/ deps
npm run dev           # Vite :1234 + Go backend :1235 concurrently
npm run build         # tsc --noEmit && vite build
```

## Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | DB connectivity |
| `/api/auth/login` | POST | Session auth (demo: `admin`/`admin123`) |
| `/api/auth/register` | POST | Create account |
| `/api/metrics` | GET | CPU, RAM, disk, network |
| `/api/plugins/zerotier/status` | GET | ZeroTier installed/running/network |
| `/api/plugins/zerotier/install` | POST | Install zerotier-one |
| `/api/plugins/zerotier/join` | POST | Join network + save config |
| `/api/plugins/zerotier/service` | POST | Start/stop zerotier-one |
| `/api/plugins/zerotier/leave` | POST | Leave network + clear config |

CORS: `http://localhost:1234` only (hardcoded backend/main.go:32).

## Features

- **Real-time metrics**: CPU line chart (SVG), RAM, disk, network throughput — polled every 2s
- **Session auth**: `sessionStorage`, 1h inactivity auto-logout
- **ZeroTier plugin**: install, join/leave networks, start/stop service, status with live IP
- **No router**: single-page SPA via `currentView` state enum
- **WCAG 2.2 AA**: ≥4.5:1 contrast on operational text

## Design System

- **Color**: `oklch()` only (`--system-green`, `--system-blue`, `--system-yellow`, `--system-red`)
- **Borders**: solid `#000`, `3px`, no `border-radius`, no blur on shadows
- **Fonts**: `Space Grotesk` (headings), `Inter` (body), `Space Mono` (mono), `Bebas Neue` (display), `Syne` (accent)
- **Tokens** in `frontend/src/index.css` — use `var(--system-*)`, not DESIGN.md aliases

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, TypeScript 5, vanilla CSS |
| Backend | Go, standard `net/http`, `modernc.org/sqlite` (no CGO) |
| DB | SQLite (`backend/ndelok.db`) |
| Icons | lucide-react |
| Dev tools | concurrently (orchestrates frontend + backend) |
