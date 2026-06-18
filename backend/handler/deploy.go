package handler

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"ndelok-backend/db"

	"github.com/gorilla/websocket"
)

// ───────── Models ─────────

type Project struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	PortDomain string `json:"portDomain"`
	Method     string `json:"method"`
	GithubLink string `json:"githubLink"`
	FolderPath string `json:"folderPath"`
	BuildCmd   string `json:"buildCmd"`
	StartCmd   string `json:"startCmd"`
	Status     string `json:"status"`
	PID        int    `json:"pid"`
	Workspace  string `json:"workspace"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type createProjectRequest struct {
	Name       string `json:"name"`
	PortDomain string `json:"portDomain"`
	Method     string `json:"method"`
	GithubLink string `json:"githubLink"`
	FolderPath string `json:"folderPath"`
	BuildCmd   string `json:"buildCmd"`
	StartCmd   string `json:"startCmd"`
}

type projectActionResponse struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Project *Project `json:"project,omitempty"`
}

// ───────── Helpers ─────────

func workspacesRoot() string {
	cwd, err := os.Getwd()
	if err != nil {
		return "workspaces"
	}
	return filepath.Join(cwd, "workspaces")
}

func scanProjectByID(id int) (*Project, error) {
	row := db.DB.QueryRow(
		`SELECT id, name, port_domain, method, github_link, folder_path, build_cmd, start_cmd, status, pid, workspace, created_at, updated_at
		 FROM projects WHERE id = ?`, id)
	return scanProject(row)
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanProject(row rowScanner) (*Project, error) {
	p := &Project{}
	err := row.Scan(&p.ID, &p.Name, &p.PortDomain, &p.Method, &p.GithubLink, &p.FolderPath,
		&p.BuildCmd, &p.StartCmd, &p.Status, &p.PID, &p.Workspace, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func updateProjectStatus(id int, status string, pid int) {
	db.DB.Exec(
		`UPDATE projects SET status = ?, pid = ?, updated_at = datetime('now') WHERE id = ?`,
		status, pid, id)
}

// ───────── Route Dispatcher ─────────

// DeployProjects handles /api/deploy/projects (list + create)
func DeployProjects(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listProjects(w, r)
	case http.MethodPost:
		createProject(w, r)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, projectActionResponse{Success: false, Message: "method not allowed"})
	}
}

// DeployProjectByID handles /api/deploy/projects/{id}[/action]
func DeployProjectByID(w http.ResponseWriter, r *http.Request) {
	// Path: /api/deploy/projects/{id}[/stream|/logs|/toggle]
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/deploy/projects/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}

	id, err := strconv.Atoi(parts[0])
	if err != nil {
		writeJSON(w, http.StatusBadRequest, projectActionResponse{Success: false, Message: "invalid id"})
		return
	}

	action := ""
	if len(parts) > 1 {
		action = parts[1]
	}

	switch action {
	case "stream":
		deployStream(w, r, id)
	case "logs":
		logsStream(w, r, id)
	case "toggle":
		toggleProject(w, r, id)
	default:
		switch r.Method {
		case http.MethodPut:
			updateProject(w, r, id)
		case http.MethodDelete:
			deleteProject(w, r, id)
		default:
			http.NotFound(w, r)
		}
	}
}

// ───────── List ─────────

func listProjects(w http.ResponseWriter, _ *http.Request) {
	rows, err := db.DB.Query(
		`SELECT id, name, port_domain, method, github_link, folder_path, build_cmd, start_cmd, status, pid, workspace, created_at, updated_at
		 FROM projects ORDER BY created_at DESC`)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, projectActionResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	projects := []Project{}
	for rows.Next() {
		p, err := scanProject(rows)
		if err != nil {
			continue
		}
		projects = append(projects, *p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

// ───────── Create ─────────

func createProject(w http.ResponseWriter, r *http.Request) {
	var req createProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, projectActionResponse{Success: false, Message: "invalid body"})
		return
	}
	if req.Name == "" || req.StartCmd == "" {
		writeJSON(w, http.StatusBadRequest, projectActionResponse{Success: false, Message: "name and startCmd required"})
		return
	}

	safeName := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "_"))
	workspace := filepath.Join(workspacesRoot(), safeName)

	res, err := db.DB.Exec(
		`INSERT INTO projects (name, port_domain, method, github_link, folder_path, build_cmd, start_cmd, status, pid, workspace)
		 VALUES (?, ?, ?, ?, ?, ?, ?, 'STOPPED', 0, ?)`,
		safeName, req.PortDomain, req.Method, req.GithubLink, req.FolderPath, req.BuildCmd, req.StartCmd, workspace)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, projectActionResponse{Success: false, Message: err.Error()})
		return
	}

	insertID, _ := res.LastInsertId()
	p, _ := scanProjectByID(int(insertID))
	writeJSON(w, http.StatusCreated, projectActionResponse{Success: true, Message: "created", Project: p})
}

// ───────── Update ─────────

func updateProject(w http.ResponseWriter, r *http.Request, id int) {
	var req createProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, projectActionResponse{Success: false, Message: "invalid body"})
		return
	}

	safeName := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "_"))
	workspace := filepath.Join(workspacesRoot(), safeName)

	_, err := db.DB.Exec(
		`UPDATE projects SET name=?, port_domain=?, method=?, github_link=?, folder_path=?, build_cmd=?, start_cmd=?, workspace=?, updated_at=datetime('now')
		 WHERE id=?`,
		safeName, req.PortDomain, req.Method, req.GithubLink, req.FolderPath, req.BuildCmd, req.StartCmd, workspace, id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, projectActionResponse{Success: false, Message: err.Error()})
		return
	}

	p, _ := scanProjectByID(id)
	writeJSON(w, http.StatusOK, projectActionResponse{Success: true, Message: "updated", Project: p})
}

// ───────── Delete ─────────

func deleteProject(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodDelete {
		writeJSON(w, http.StatusMethodNotAllowed, projectActionResponse{Success: false, Message: "method not allowed"})
		return
	}

	// Stop process if running
		p, err := scanProjectByID(id)
		if err == nil {
			if p.PID > 0 {
				killProcess(p.PID)
			}
			// Remove workspace folder from disk
			if p.Workspace != "" {
				if err := os.RemoveAll(p.Workspace); err != nil {
					log.Printf("delete: remove workspace %q: %v", p.Workspace, err)
				}
			}
		}

		db.DB.Exec(`DELETE FROM projects WHERE id = ?`, id)
		writeJSON(w, http.StatusOK, projectActionResponse{Success: true, Message: "deleted"})
}

// ───────── Toggle Start/Stop ─────────

func toggleProject(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, projectActionResponse{Success: false, Message: "method not allowed"})
		return
	}

	p, err := scanProjectByID(id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, projectActionResponse{Success: false, Message: "project not found"})
		return
	}

	if p.Status == "RUNNING" || p.PID > 0 {
		// Stop
		if p.PID > 0 {
			killProcess(p.PID)
		}
		updateProjectStatus(id, "STOPPED", 0)
		p, _ = scanProjectByID(id)
		writeJSON(w, http.StatusOK, projectActionResponse{Success: true, Message: "stopped", Project: p})
		return
	}

	// Start — re-run startCmd in workspace dir
		if err := startProject(p); err != nil {
			writeJSON(w, http.StatusInternalServerError, projectActionResponse{Success: false, Message: err.Error()})
			return
		}

	p, _ = scanProjectByID(id)
	writeJSON(w, http.StatusOK, projectActionResponse{Success: true, Message: "started", Project: p})
}

// ───────── Reusable Start (used by toggle + startup restore) ─────────

// startProject runs the project's startCmd in its workspace as a daemon.
func startProject(p *Project) error {
	if p.StartCmd == "" {
		return fmt.Errorf("no start command configured")
	}

	logPath := filepath.Join(p.Workspace, "ndelok.log")
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		// workspace may not exist yet — create it
		os.MkdirAll(p.Workspace, 0755)
		logFile, err = os.OpenFile(logPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			return fmt.Errorf("cannot open log: %w", err)
		}
	}

	cmd := shellCommand(p.StartCmd)
	cmd.Dir = p.Workspace
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	setDaemonAttrs(cmd)

	if err := cmd.Start(); err != nil {
		logFile.Close()
		return fmt.Errorf("start failed: %w", err)
	}

	pid := cmd.Process.Pid
	updateProjectStatus(p.ID, "RUNNING", pid)

	// Reap orphan in background to avoid zombie
	go func() {
		cmd.Wait()
		logFile.Close()
	}()

	return nil
}

// RestoreRunningProjects is called on server startup. It queries all
// projects whose status was RUNNING (before the previous shutdown) and
// re-starts them so they survive reboots.
func RestoreRunningProjects() {
	log.Println("[RESTORE] checking for projects to auto-restart...")
	rows, err := db.DB.Query(
		`SELECT id, name, port_domain, method, github_link, folder_path, build_cmd, start_cmd, status, pid, workspace, created_at, updated_at
		 FROM projects WHERE status = 'RUNNING'`)
	if err != nil {
		log.Printf("[RESTORE] query failed: %v", err)
		return
	}
	defer rows.Close()

	var restored int
	for rows.Next() {
		p, err := scanProject(rows)
		if err != nil {
			continue
		}
		log.Printf("[RESTORE] restarting %q (id=%d, port=%s)", p.Name, p.ID, p.PortDomain)
		// Reset stale PID first
		updateProjectStatus(p.ID, "RESTORING", 0)
		if err := startProject(p); err != nil {
			log.Printf("[RESTORE] failed to start %q: %v", p.Name, err)
			updateProjectStatus(p.ID, "STOPPED", 0)
			continue
		}
		restored++
	}
	log.Printf("[RESTORE] done — %d project(s) restored", restored)
}

type safeConn struct {
	mu   sync.Mutex
	conn *websocket.Conn
}

func (c *safeConn) Write(p []byte) (int, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	err := c.conn.WriteMessage(websocket.TextMessage, p)
	if err != nil {
		return 0, err
	}
	return len(p), nil
}

func (c *safeConn) WriteString(s string) (int, error) {
	return c.Write([]byte(s))
}

// ───────── Deploy Stream (WebSocket) ─────────

func deployStream(w http.ResponseWriter, r *http.Request, id int) {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("deploy ws upgrade: %v", err)
		return
	}
	defer conn.Close()

	sConn := &safeConn{conn: conn}
	send := func(msg string) {
		sConn.WriteString(msg + "\n")
	}

	p, err := scanProjectByID(id)
	if err != nil {
		send("[ERROR] Project not found")
		return
	}

	ts := func() string { return time.Now().Format("15:04:05") }

	// 1. Update status to DEPLOYING
	updateProjectStatus(id, "DEPLOYING", 0)
	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Initializing deployment sequence for %q...", ts(), p.Name))
	time.Sleep(200 * time.Millisecond)

	// 2. Create workspace folder
	workspace := p.Workspace
	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Creating workspace directory: %s", ts(), workspace))
	if err := os.MkdirAll(workspace, 0755); err != nil {
		send(fmt.Sprintf("[ERROR] %s - Failed to create workspace: %v", ts(), err))
		updateProjectStatus(id, "ERROR", 0)
		return
	}
	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Workspace ready.", ts()))

	// 3. Git clone (only for github method)
	if p.Method == "github" && p.GithubLink != "" {
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Import method: GITHUB REPOSITORY (%s)", ts(), p.GithubLink))
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Running: git clone %s .", ts(), p.GithubLink))

		if err := streamCommand(sConn, workspace, "git clone "+p.GithubLink+" ."); err != nil {
			send(fmt.Sprintf("[ERROR] %s - git clone failed: %v", ts(), err))
			updateProjectStatus(id, "ERROR", 0)
			return
		}
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Source code cloned successfully.", ts()))
	} else if p.Method == "folder" && p.FolderPath != "" {
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Import method: LOCAL FOLDER (%s)", ts(), p.FolderPath))
		// For folder method, workspace IS the folder path
		workspace = p.FolderPath
		db.DB.Exec(`UPDATE projects SET workspace=? WHERE id=?`, workspace, id)
	}

	// 4. Build command
	if p.BuildCmd != "" {
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Executing build command: %q", ts(), p.BuildCmd))
		if err := streamCommand(sConn, workspace, p.BuildCmd); err != nil {
			send(fmt.Sprintf("[ERROR] %s - Build command failed: %v", ts(), err))
			updateProjectStatus(id, "ERROR", 0)
			return
		}
		send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Build completed successfully.", ts()))
	}

	// 5. Start daemon
	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Spawning daemon: %q", ts(), p.StartCmd))

	logPath := filepath.Join(workspace, "ndelok.log")
	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0644)
	if err != nil {
		send(fmt.Sprintf("[ERROR] %s - Cannot create log file: %v", ts(), err))
		updateProjectStatus(id, "ERROR", 0)
		return
	}

	daemonCmd := shellCommand(p.StartCmd)
	daemonCmd.Dir = workspace
	daemonCmd.Stdout = logFile
	daemonCmd.Stderr = logFile
	setDaemonAttrs(daemonCmd)

	if err := daemonCmd.Start(); err != nil {
		logFile.Close()
		send(fmt.Sprintf("[ERROR] %s - Daemon start failed: %v", ts(), err))
		updateProjectStatus(id, "ERROR", 0)
		return
	}

	pid := daemonCmd.Process.Pid
	updateProjectStatus(id, "RUNNING", pid)

	// Reap in background
	go func() {
		daemonCmd.Wait()
		logFile.Close()
		// Mark stopped if process exits on its own
		updateProjectStatus(id, "STOPPED", 0)
	}()

	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Daemon started. PID=%d", ts(), pid))
	send(fmt.Sprintf("[NDELOK-DEPLOY] %s - Service bound to port/domain: %s", ts(), p.PortDomain))
	send(fmt.Sprintf("[SUCCESS] %s - Deployment completed. Service is fully operational.", ts()))
}

// streamCommand runs a command string (via platform shell) and sends output raw bytes to WS.
func streamCommand(sConn *safeConn, dir string, cmdStr string) error {
	cmd := shellCommand(cmdStr)
	cmd.Dir = dir
	cmd.Stdout = sConn
	cmd.Stderr = sConn

	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Wait()
}

// ───────── Logs Stream (WebSocket) ─────────

func logsStream(w http.ResponseWriter, r *http.Request, id int) {
	upgrader := websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("logs ws upgrade: %v", err)
		return
	}
	defer conn.Close()

	p, err := scanProjectByID(id)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("[ERROR] Project not found"))
		return
	}

	logPath := filepath.Join(p.Workspace, "ndelok.log")
	f, err := os.Open(logPath)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("[INFO] No log file found at %s", logPath)))
		// Keep WS open briefly then close
		time.Sleep(3 * time.Second)
		return
	}
	defer f.Close()

	// Seek to end, then tail new lines
	f.Seek(0, io.SeekStart) // send existing logs first

	done := make(chan struct{})
	go func() {
		// If client disconnects, close done
		conn.ReadMessage()
		close(done)
	}()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		conn.WriteMessage(websocket.TextMessage, []byte(scanner.Text()))
	}

	// Now tail: poll for new content
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			for scanner.Scan() {
				conn.WriteMessage(websocket.TextMessage, []byte(scanner.Text()))
			}
		}
	}
}


