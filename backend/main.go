package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"net/url"
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
			if !ok || ipnet.IP.IsLoopback() {
				continue
			}
			log.Printf("  ➜  Network: http://%s/", net.JoinHostPort(ipnet.IP.String(), port))
		}
	}
}

func originAllowed(origin string) bool {
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	host, port, err := net.SplitHostPort(u.Host)
	if err != nil {
		host = u.Host
		port = ""
	}
	if host == "" {
		return false
	}
	if port != "" && port != "1234" {
		return false
	}
	if host == "localhost" || host == "127.0.0.1" || host == "::1" {
		return true
	}
	ip := net.ParseIP(host)
	if ip != nil {
		return ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified()
	}
	if addrs, err := net.LookupHost(host); err == nil {
		for _, a := range addrs {
			ip := net.ParseIP(a)
			if ip != nil && (ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified()) {
				return true
			}
		}
	}
	return false
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" || !originAllowed(origin) {
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

		// Public routes (no auth required)
		mux.HandleFunc("/health", healthHandler)
		mux.HandleFunc("/api/auth/login", handler.Login)
		mux.HandleFunc("/api/auth/register", handler.Register)
		mux.HandleFunc("/api/metrics", handler.Metrics)

		// Protected routes (auth required)
		mux.HandleFunc("/api/auth/logout", handler.RequireAuth(handler.Logout))
	mux.HandleFunc("/api/plugins/zerotier/status", handler.RequireAuth(handler.ZeroTierStatus))
	mux.HandleFunc("/api/plugins/zerotier/install", handler.RequireAuth(handler.ZeroTierInstall))
	mux.HandleFunc("/api/plugins/zerotier/join", handler.RequireAuth(handler.ZeroTierJoin))
	mux.HandleFunc("/api/plugins/zerotier/service", handler.RequireAuth(handler.ZeroTierService))
	mux.HandleFunc("/api/plugins/zerotier/leave", handler.RequireAuth(handler.ZeroTierLeave))
	mux.HandleFunc("/api/plugins/tmux/status", handler.RequireAuth(handler.TmuxStatus))
	mux.HandleFunc("/api/plugins/tmux/install", handler.RequireAuth(handler.TmuxInstall))
	mux.HandleFunc("/api/plugins/tmux/new", handler.RequireAuth(handler.TmuxNewSession))
	mux.HandleFunc("/api/plugins/tmux/session", handler.RequireAuth(handler.TmuxDeleteSession))
	mux.HandleFunc("/api/plugins/tmux/terminal", handler.RequireAuth(handler.TmuxTerminalWS))
	mux.HandleFunc("/api/terminal", handler.RequireAuth(handler.ShellTerminalWS))
	mux.HandleFunc("/api/deploy/projects", handler.RequireAuth(handler.DeployProjects))
	mux.HandleFunc("/api/deploy/projects/", handler.RequireAuth(handler.DeployProjectByID))

	// File Explorer Endpoints
	mux.HandleFunc("/api/explorer/root", handler.RequireAuth(handler.ExplorerRootPath))
	mux.HandleFunc("/api/explorer/list", handler.RequireAuth(handler.ExplorerList))
	mux.HandleFunc("/api/explorer/content", handler.RequireAuth(handler.ExplorerGetContent))
	mux.HandleFunc("/api/explorer/save", handler.RequireAuth(handler.ExplorerSaveContent))
	mux.HandleFunc("/api/explorer/create", handler.RequireAuth(handler.ExplorerCreate))
	mux.HandleFunc("/api/explorer/rename", handler.RequireAuth(handler.ExplorerRename))
	mux.HandleFunc("/api/explorer/delete", handler.RequireAuth(handler.ExplorerDelete))
	mux.HandleFunc("/api/explorer/copy", handler.RequireAuth(handler.ExplorerCopy))
	mux.HandleFunc("/api/explorer/move", handler.RequireAuth(handler.ExplorerMove))
	mux.HandleFunc("/api/explorer/upload", handler.RequireAuth(handler.ExplorerUpload))

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
