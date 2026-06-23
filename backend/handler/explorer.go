package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// FileSystemItem matches the frontend structure
type FileSystemItem struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	ParentID  *string  `json:"parentId"`
	Size      *float64 `json:"size,omitempty"` // In KB
	Content   *string  `json:"content,omitempty"`
	CreatedAt string   `json:"createdAt"`
}

// Helper to get project root (parent directory of backend)
func getProjectRoot() (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	return filepath.Dir(cwd), nil
}

// Helper to get system explorer root (C:\ on Windows, user home on Linux)
func getExplorerRoot() string {
	if runtime.GOOS == "windows" {
		return "C:\\"
	}
	home, err := os.UserHomeDir()
	if err == nil {
		return home
	}
	return "/"
}

// inAllowedRoot checks if path resolves within one of the allowed roots
func inAllowedRoot(path string, roots ...string) bool {
	for _, root := range roots {
		rel, err := filepath.Rel(root, path)
		if err == nil && !strings.HasPrefix(rel, "..") {
			return true
		}
	}
	return false
}

// resolveSymlinkPrefix walks up from p to find the longest existing ancestor,
// resolves its symlinks, and rejoins any remaining path components.
// This handles non-existent paths (create/save) while still resolving symlinks
// on the existing parent chain to prevent traversal attacks.
func resolveSymlinkPrefix(p string) (string, error) {
	// Walk up until we find an existing path (or hit the root)
	remaining := ""
	for {
		_, err := os.Lstat(p)
		if err == nil {
			resolved, err := filepath.EvalSymlinks(p)
			if err != nil {
				return "", err
			}
			if remaining == "" {
				return resolved, nil
			}
			return filepath.Join(resolved, remaining), nil
		}
		if !os.IsNotExist(err) {
			return "", err
		}
		parent := filepath.Dir(p)
		if parent == p {
			// Hit the root and nothing exists — give up on symlink resolution
			return p, nil
		}
		remaining = filepath.Join(filepath.Base(p), remaining)
		p = parent
	}
}

// safeJoin safely joins project root and the requested path, preventing traversal
func safeJoin(explorerRoot, projectRoot, reqPath string) (string, error) {
	// Map shortcuts
	if reqPath == "" || reqPath == "/" || reqPath == "root" {
		return explorerRoot, nil
	}
	if reqPath == "dir-src" {
		return filepath.Join(projectRoot, "frontend", "src"), nil
	}
	if reqPath == "dir-components" {
		return filepath.Join(projectRoot, "frontend", "src", "components"), nil
	}
	if reqPath == "dir-public" {
		return filepath.Join(projectRoot, "frontend", "public"), nil
	}

	cleaned := filepath.Clean(reqPath)
	if strings.HasPrefix(cleaned, "/") {
		cleaned = cleaned[1:]
	} else if strings.HasPrefix(cleaned, "\\") {
		cleaned = cleaned[1:]
	} else if filepath.IsAbs(cleaned) {
		if inAllowedRoot(cleaned, explorerRoot, projectRoot) {
			// Resolve symlinks on existing prefix to prevent traversal
			resolved, err := resolveSymlinkPrefix(cleaned)
			if err != nil {
				return "", fmt.Errorf("access denied")
			}
			if inAllowedRoot(resolved, explorerRoot, projectRoot) {
				return resolved, nil
			}
		}
		return "", fmt.Errorf("access denied")
	}

	// Try in explorer root first
	targetExp := filepath.Join(explorerRoot, cleaned)
	resolvedExp, err1 := resolveSymlinkPrefix(targetExp)
	if err1 == nil && inAllowedRoot(resolvedExp, explorerRoot) {
		return resolvedExp, nil
	}

	// Try in project root next
	targetProj := filepath.Join(projectRoot, cleaned)
	resolvedProj, err2 := resolveSymlinkPrefix(targetProj)
	if err2 == nil && inAllowedRoot(resolvedProj, projectRoot) {
		return resolvedProj, nil
	}

	return "", fmt.Errorf("access denied")
}

// helper to map absolute disk path back to virtual ID
func getVirtualID(explorerRoot, projectRoot, absPath string) string {
	relExp, err1 := filepath.Rel(explorerRoot, absPath)
	if err1 == nil && !strings.HasPrefix(relExp, "..") {
		if relExp == "." {
			return "/"
		}
		return "/" + filepath.ToSlash(relExp)
	}

	relProj, err2 := filepath.Rel(projectRoot, absPath)
	if err2 == nil && !strings.HasPrefix(relProj, "..") {
		if relProj == "." {
			return "/"
		}
		return filepath.ToSlash(absPath)
	}

	return filepath.ToSlash(absPath)
}

// ExplorerList handles GET /api/explorer/list
func ExplorerList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	pathParam := r.URL.Query().Get("path")
	targetPath, err := safeJoin(explorerRoot, projectRoot, pathParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	searchParam := r.URL.Query().Get("search")
	if searchParam != "" {
		items := []FileSystemItem{}
		err = filepath.WalkDir(targetPath, func(path string, d os.DirEntry, err error) error {
			if err != nil {
				return nil // skip errors
			}
			if path == targetPath {
				return nil
			}

			if strings.Contains(strings.ToLower(d.Name()), strings.ToLower(searchParam)) {
				info, err := d.Info()
				if err != nil {
					return nil
				}

				itemType := "file"
				if d.IsDir() {
					itemType = "directory"
				}

				var sizeVal *float64
				if !d.IsDir() {
					sz := float64(info.Size()) / 1024.0
					sz = float64(int(sz*100)) / 100.0
					sizeVal = &sz
				}

				createdAt := info.ModTime().Format("2006-01-02 15:04:05")
				virtualID := getVirtualID(explorerRoot, projectRoot, path)
				virtualParent := getVirtualID(explorerRoot, projectRoot, filepath.Dir(path))
				var parentID *string
				if virtualParent != "/" {
					parentID = &virtualParent
				}

				items = append(items, FileSystemItem{
					ID:        virtualID,
					Name:      d.Name(),
					Type:      itemType,
					ParentID:  parentID,
					Size:      sizeVal,
					CreatedAt: createdAt,
				})
			}
			return nil
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
		return
	}

	files, err := os.ReadDir(targetPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	items := []FileSystemItem{}
	virtualParent := getVirtualID(explorerRoot, projectRoot, targetPath)
	var parentID *string
	if virtualParent != "/" {
		parentID = &virtualParent
	}

	for _, f := range files {
		absFilePath := filepath.Join(targetPath, f.Name())
		info, err := f.Info()
		if err != nil {
			continue
		}

		itemType := "file"
		if f.IsDir() {
			itemType = "directory"
		}

		var sizeVal *float64
		if !f.IsDir() {
			sz := float64(info.Size()) / 1024.0
			sz = float64(int(sz*100)) / 100.0
			sizeVal = &sz
		}

		createdAt := info.ModTime().Format("2006-01-02 15:04:05")
		virtualID := getVirtualID(explorerRoot, projectRoot, absFilePath)

		items = append(items, FileSystemItem{
			ID:        virtualID,
			Name:      f.Name(),
			Type:      itemType,
			ParentID:  parentID,
			Size:      sizeVal,
			CreatedAt: createdAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// ExplorerGetContent handles GET /api/explorer/content
func ExplorerGetContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	pathParam := r.URL.Query().Get("path")
	targetPath, err := safeJoin(explorerRoot, projectRoot, pathParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	contentBytes, err := os.ReadFile(targetPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write(contentBytes)
}

// ExplorerSaveContent handles POST /api/explorer/save
func ExplorerSaveContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		Path    string `json:"path"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	targetPath, err := safeJoin(explorerRoot, projectRoot, req.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if err := os.WriteFile(targetPath, []byte(req.Content), 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ExplorerCreate handles POST /api/explorer/create
func ExplorerCreate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		ParentPath string `json:"parentPath"`
		Name       string `json:"name"`
		Type       string `json:"type"` // "file" or "directory"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	parentPath, err := safeJoin(explorerRoot, projectRoot, req.ParentPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	targetPath := filepath.Join(parentPath, req.Name)
	if _, err := safeJoin(explorerRoot, projectRoot, targetPath); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if req.Type == "directory" {
		if err := os.MkdirAll(targetPath, 0755); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if err := os.MkdirAll(parentPath, 0755); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		f, err := os.OpenFile(targetPath, os.O_CREATE|os.O_WRONLY|os.O_EXCL, 0644)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		f.Close()
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ExplorerRename handles POST /api/explorer/rename
func ExplorerRename(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		Path    string `json:"path"`
		NewName string `json:"newName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	targetPath, err := safeJoin(explorerRoot, projectRoot, req.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	parentPath := filepath.Dir(targetPath)
	newPath := filepath.Join(parentPath, req.NewName)
	if _, err := safeJoin(explorerRoot, projectRoot, newPath); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if err := os.Rename(targetPath, newPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ExplorerDelete handles POST /api/explorer/delete
func ExplorerDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	targetPath, err := safeJoin(explorerRoot, projectRoot, req.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if targetPath == explorerRoot {
		http.Error(w, "cannot delete root", http.StatusForbidden)
		return
	}

	if err := os.RemoveAll(targetPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}

func copyDir(src, dst string) error {
	srcInfo, err := os.Stat(src)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(dst, srcInfo.Mode()); err != nil {
		return err
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}
	return nil
}

// ExplorerCopy handles POST /api/explorer/copy
func ExplorerCopy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		SrcPath        string `json:"srcPath"`
		DestParentPath string `json:"destParentPath"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	srcPath, err := safeJoin(explorerRoot, projectRoot, req.SrcPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	destParent, err := safeJoin(explorerRoot, projectRoot, req.DestParentPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	srcName := filepath.Base(srcPath)
	destPath := filepath.Join(destParent, srcName)

	if _, err := safeJoin(explorerRoot, projectRoot, destPath); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	srcInfo, err := os.Stat(srcPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if srcInfo.IsDir() {
		if err := copyDir(srcPath, destPath); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if err := copyFile(srcPath, destPath); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ExplorerMove handles POST /api/explorer/move
func ExplorerMove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	var req struct {
		SrcPath        string `json:"srcPath"`
		DestParentPath string `json:"destParentPath"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	srcPath, err := safeJoin(explorerRoot, projectRoot, req.SrcPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	destParent, err := safeJoin(explorerRoot, projectRoot, req.DestParentPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	srcName := filepath.Base(srcPath)
	destPath := filepath.Join(destParent, srcName)

	if _, err := safeJoin(explorerRoot, projectRoot, destPath); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if err := os.Rename(srcPath, destPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ExplorerUpload handles POST /api/explorer/upload
func ExplorerUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	projectRoot, err := getProjectRoot()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	explorerRoot := getExplorerRoot()

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	parentPathParam := r.FormValue("parentPath")
	destDir, err := safeJoin(explorerRoot, projectRoot, parentPathParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	files := r.MultipartForm.File["files"]
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer file.Close()

		destFilePath := filepath.Join(destDir, fileHeader.Filename)
		if _, err := safeJoin(explorerRoot, projectRoot, destFilePath); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}

		out, err := os.OpenFile(destFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer out.Close()

		if _, err := io.Copy(out, file); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"success": true})
}
