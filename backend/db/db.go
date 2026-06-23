package db

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Init(path string) error {
	var err error
	DB, err = sql.Open("sqlite", path)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("ping: %w", err)
	}

	for _, pragma := range []string{
		"PRAGMA journal_mode=WAL",
		"PRAGMA foreign_keys=ON",
	} {
		if _, err = DB.Exec(pragma); err != nil {
			return fmt.Errorf("pragma %s: %w", pragma, err)
		}
	}

	if _, err = DB.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		created_at TEXT NOT NULL
	)`); err != nil {
		return fmt.Errorf("create users table: %w", err)
	}

	if _, err = DB.Exec(`CREATE TABLE IF NOT EXISTS zerotier_config (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		network_id TEXT NOT NULL DEFAULT '',
		ip_address TEXT NOT NULL DEFAULT '',
		iface TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`); err != nil {
		return fmt.Errorf("create zerotier_config table: %w", err)
	}

	if _, err = DB.Exec(`INSERT OR IGNORE INTO zerotier_config (id, network_id, ip_address, iface) VALUES (1, '', '', '')`); err != nil {
		return fmt.Errorf("seed zerotier_config: %w", err)
	}

	if _, err = DB.Exec(`CREATE TABLE IF NOT EXISTS projects (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		name        TEXT NOT NULL UNIQUE,
		port_domain TEXT NOT NULL DEFAULT '',
		method      TEXT NOT NULL DEFAULT 'github',
		github_link TEXT NOT NULL DEFAULT '',
		folder_path TEXT NOT NULL DEFAULT '',
		build_cmd   TEXT NOT NULL DEFAULT '',
		start_cmd   TEXT NOT NULL DEFAULT '',
		status      TEXT NOT NULL DEFAULT 'STOPPED',
		pid         INTEGER NOT NULL DEFAULT 0,
		workspace   TEXT NOT NULL DEFAULT '',
		created_at  TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
	)`); err != nil {
		return fmt.Errorf("create projects table: %w", err)
	}

	return nil
}

func Close() error {
	if DB == nil {
		return nil
	}
	return DB.Close()
}
