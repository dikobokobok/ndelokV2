package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"

	"ndelok-backend/db"
	"ndelok-backend/handler"
)

type healthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	resp := healthResponse{Status: "ok", Database: "connected"}

	if err := db.DB.Ping(); err != nil {
		resp.Status = "degraded"
		resp.Database = "disconnected"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func listIPs(port string) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return
	}
	for _, iface := range ifaces {
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			ipnet, ok := addr.(*net.IPNet)
			if !ok || ipnet.IP.IsLoopback() || ipnet.IP.To4() == nil {
				continue
			}
			log.Printf("  ➜  Network: http://%s/", net.JoinHostPort(ipnet.IP.String(), port))
		}
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "http://localhost:1234"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	if err := db.Init("ndelok.db"); err != nil {
		log.Fatalf("init: %v", err)
	}
	defer db.Close()

	// Restart projects that were RUNNING before the previous shutdown
	handler.RestoreRunningProjects()

	port := os.Getenv("PORT")
	if port == "" {
		port = "1235"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/api/auth/login", handler.Login)
	mux.HandleFunc("/api/auth/register", handler.Register)
	mux.HandleFunc("/api/metrics", handler.Metrics)
	mux.HandleFunc("/api/plugins/zerotier/status", handler.ZeroTierStatus)
	mux.HandleFunc("/api/plugins/zerotier/install", handler.ZeroTierInstall)
	mux.HandleFunc("/api/plugins/zerotier/join", handler.ZeroTierJoin)
	mux.HandleFunc("/api/plugins/zerotier/service", handler.ZeroTierService)
	mux.HandleFunc("/api/plugins/zerotier/leave", handler.ZeroTierLeave)
	mux.HandleFunc("/api/plugins/tmux/status", handler.TmuxStatus)
	mux.HandleFunc("/api/plugins/tmux/install", handler.TmuxInstall)
	mux.HandleFunc("/api/plugins/tmux/new", handler.TmuxNewSession)
	mux.HandleFunc("/api/plugins/tmux/session", handler.TmuxDeleteSession)
	mux.HandleFunc("/api/plugins/tmux/terminal", handler.TmuxTerminalWS)
	mux.HandleFunc("/api/terminal", handler.ShellTerminalWS)
	mux.HandleFunc("/api/deploy/projects", handler.DeployProjects)
	mux.HandleFunc("/api/deploy/projects/", handler.DeployProjectByID)

	srv := http.Server{
		Addr:    ":" + port,
		Handler: cors(mux),
	}

	log.Printf("listen :%s", port)
	listIPs(port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
