package db

import (
	"database/sql"
	"fmt"
	"time"

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

	if _, err = DB.Exec(`CREATE TABLE IF NOT EXISTS system_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp TEXT NOT NULL,
		level TEXT NOT NULL,
		message TEXT NOT NULL
	)`); err != nil {
		return fmt.Errorf("create system_logs table: %w", err)
	}

	// Seed initial check log if empty
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM system_logs").Scan(&count)
	if count == 0 {
		t := time.Now().Format("15:04:05")
		DB.Exec("INSERT INTO system_logs (timestamp, level, message) VALUES (?, ?, ?)", t, "INFO", "System initialized.")
	}

	return nil
}

func LogEvent(level, message string) {
	if DB == nil {
		return
	}
	t := time.Now().Format("15:04:05")
	_, err := DB.Exec("INSERT INTO system_logs (timestamp, level, message) VALUES (?, ?, ?)", t, level, message)
	if err != nil {
		fmt.Printf("Error writing system log: %v\n", err)
	}
}

func Close() error {
	if DB == nil {
		return nil
	}
	return DB.Close()
}
