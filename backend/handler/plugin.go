package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
	"strings"

	"ndelok-backend/db"
)

type zerotierStatusResponse struct {
	Installed bool   `json:"installed"`
	Running   bool   `json:"running"`
	Status    string `json:"status"`
	NetworkID string `json:"networkId"`
	IPAddress string `json:"ipAddress"`
	Interface string `json:"interface"`
}

type zerotierJoinRequest struct {
	NetworkID string `json:"networkId"`
}

type zerotierActionResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type zerotierServiceRequest struct {
	Action string `json:"action"`
}

func ZeroTierStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, zerotierActionResponse{Success: false, Message: "Method not allowed"})
		return
	}

	cmd := exec.Command("systemctl", "status", "zerotier-one")
	out, err := cmd.CombinedOutput()
	output := string(out)

	resp := zerotierStatusResponse{
		Installed: false,
		Running:   false,
		Status:    "NOT_INSTALLED",
	}

	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			switch exitErr.ExitCode() {
			case 3:
				resp.Installed = true
				resp.Running = false
				resp.Status = "STOPPED"
			case 4:
				resp.Installed = false
				resp.Running = false
				resp.Status = "NOT_INSTALLED"
			default:
				resp.Installed = false
				resp.Status = "NOT_INSTALLED"
			}
		} else {
			resp.Status = "ERROR"
		}
	} else {
		resp.Installed = true
		resp.Running = true
		resp.Status = "RUNNING"
	}

	if strings.Contains(output, "Active: active (running)") || strings.Contains(output, "active (running)") {
		resp.Running = true
		resp.Status = "RUNNING"
		resp.Installed = true
	}

	if resp.Running {
		listOut, listErr := exec.Command("zerotier-cli", "listnetworks").Output()
		if listErr == nil {
			lines := strings.Split(strings.TrimSpace(string(listOut)), "\n")
			for _, line := range lines {
				fields := strings.Fields(line)
				if len(fields) < 3 || strings.HasPrefix(fields[2], "<") {
					continue
				}
				resp.NetworkID = fields[2]
				if len(fields) >= 9 {
					resp.IPAddress = strings.Split(fields[8], "/")[0]
				}
				if len(fields) >= 8 {
					resp.Interface = fields[7]
				}
				if resp.NetworkID != "" {
					break
				}
			}
		}
		if resp.NetworkID != "" {
			_ = saveZerotierConfig(resp.NetworkID, resp.IPAddress, resp.Interface)
		}
	}

	var savedNetID, savedIP, savedIface string
	row := db.DB.QueryRow("SELECT network_id, ip_address, iface FROM zerotier_config WHERE id = 1")
	row.Scan(&savedNetID, &savedIP, &savedIface)

	if resp.NetworkID == "" {
		resp.NetworkID = savedNetID
		resp.IPAddress = savedIP
		resp.Interface = savedIface
	}

	writeJSON(w, http.StatusOK, resp)
}

func ZeroTierInstall(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, zerotierActionResponse{Success: false, Message: "Method not allowed"})
		return
	}

	go func() {
		cmd := exec.Command("sh", "-c", "curl -s https://install.zerotier.com | sudo bash")
		cmd.Start()
	}()

	writeJSON(w, http.StatusOK, zerotierActionResponse{Success: true, Message: "Installation started in background"})
}

func ZeroTierJoin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, zerotierActionResponse{Success: false, Message: "Method not allowed"})
		return
	}

	var req zerotierJoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Invalid request body"})
		return
	}

	if req.NetworkID == "" {
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Network ID required"})
		return
	}

	exec.Command("sh", "-c", "sudo systemctl start zerotier-one").Run()

	exec.Command("zerotier-cli", "join", req.NetworkID).Run()

	_ = saveZerotierConfig(req.NetworkID, "JOINING...", "PENDING...")

	log.Printf("zerotier join ok: %s", req.NetworkID)
	writeJSON(w, http.StatusOK, zerotierActionResponse{Success: true, Message: "Joined network " + req.NetworkID})
}

func ZeroTierService(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, zerotierActionResponse{Success: false, Message: "Method not allowed"})
		return
	}

	var req zerotierServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Invalid request body"})
		return
	}

	var cmdStr string
	switch req.Action {
	case "start":
		cmdStr = "sudo systemctl start zerotier-one"
	case "stop":
		cmdStr = "sudo systemctl stop zerotier-one"
	default:
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Invalid action. Use 'start' or 'stop'"})
		return
	}

	cmd := exec.Command("sh", "-c", cmdStr)
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("zerotier service %s error: %s", req.Action, string(out))
		writeJSON(w, http.StatusInternalServerError, zerotierActionResponse{Success: false, Message: string(out)})
		return
	}

	log.Printf("zerotier service %s ok", req.Action)
	writeJSON(w, http.StatusOK, zerotierActionResponse{Success: true, Message: "Service " + req.Action + "ed"})
}

func ZeroTierLeave(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, zerotierActionResponse{Success: false, Message: "Method not allowed"})
		return
	}

	var req zerotierJoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Invalid request body"})
		return
	}

	if req.NetworkID == "" {
		writeJSON(w, http.StatusBadRequest, zerotierActionResponse{Success: false, Message: "Network ID required"})
		return
	}

	exec.Command("zerotier-cli", "leave", req.NetworkID).Run()

	_ = saveZerotierConfig("", "", "")

	log.Printf("zerotier leave ok: %s", req.NetworkID)
	writeJSON(w, http.StatusOK, zerotierActionResponse{Success: true, Message: "Left network " + req.NetworkID})
}

func saveZerotierConfig(networkID, ipAddress, iface string) error {
	_, err := db.DB.Exec(
		"UPDATE zerotier_config SET network_id = ?, ip_address = ?, iface = ?, updated_at = datetime('now') WHERE id = 1",
		networkID, ipAddress, iface,
	)
	if err != nil {
		log.Printf("save zerotier config error: %v", err)
	}
	return err
}
