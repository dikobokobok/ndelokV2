package handler

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"runtime"

	"ndelok-backend/db"
)

// SystemShutdown handles POST /api/system/shutdown
func SystemShutdown(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	db.LogEvent("WARN", "System shutdown initiated via Settings")

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("shutdown", "/s", "/f", "/t", "0")
	} else {
		cmd = exec.Command("shutdown", "-h", "now")
	}

	err := cmd.Start()
	if err != nil {
		db.LogEvent("ERROR", "Failed to start shutdown command: "+err.Error())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Shutdown sequence started"})
}

// SystemReboot handles POST /api/system/reboot
func SystemReboot(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	db.LogEvent("WARN", "System reboot initiated via Settings")

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("shutdown", "/r", "/f", "/t", "0")
	} else {
		cmd = exec.Command("reboot")
	}

	err := cmd.Start()
	if err != nil {
		db.LogEvent("ERROR", "Failed to start reboot command: "+err.Error())
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Reboot sequence started"})
}
