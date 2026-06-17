# backend

Go HTTP server — SQLite, auth, health.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check + DB status |
| GET | /api/metrics | Real-time system metrics (CPU, RAM, storage, network) |
| POST | /api/auth/register | Create user `{username, email, password}` |
| POST | /api/auth/login | Login `{username, password}` |

## Run

```sh
PORT=1235 go run .
```
