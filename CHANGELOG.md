# Changelog

## [0.23.1] — 2026-06-23

### Changed

- **npm workspaces:** Migrated from `postinstall` + `--prefix` to native npm workspaces. Single `npm install` at root installs everything. Lower RAM on Linux. (`package.json`, `frontend/package.json`)
- **CORS hardening:** Allow IPv6 loopback (`::1`), DNS-resolved origins, and drop port-1234-only restriction. Properly reject empty `Origin` headers. (`backend/main.go`)

### Removed

- **`ndelok-root` file dep:** Removed `file:..` dependency from `frontend/package.json`. Workspace resolution handles the root package. (`frontend/package.json`)

## [0.23.0] — 2026-06-21

Initial release of ndelokV2 — neobrutalist server monitoring & management console.
