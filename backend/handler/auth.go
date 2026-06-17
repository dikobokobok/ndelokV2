package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"ndelok-backend/db"
	"ndelok-backend/model"

	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type registerRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	User    *model.User `json:"user,omitempty"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, authResponse{Success: false, Message: "Method not allowed"})
		return
	}
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, authResponse{
			Success: false, Message: "Invalid request body",
		})
		return
	}

	if req.Username == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, authResponse{
			Success: false, Message: "Username and password required",
		})
		return
	}

	row := db.DB.QueryRow(
		"SELECT id, username, email, password, created_at FROM users WHERE username = ?",
		req.Username,
	)

	var u model.User
	if err := row.Scan(&u.ID, &u.Username, &u.Email, &u.Password, &u.CreatedAt); err != nil {
		writeJSON(w, http.StatusUnauthorized, authResponse{
			Success: false, Message: "Invalid username or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, authResponse{
			Success: false, Message: "Invalid username or password",
		})
		return
	}

	log.Printf("login ok: %s", u.Username)
	writeJSON(w, http.StatusOK, authResponse{
		Success: true,
		Message: "Login successful",
		User:    &u,
	})
}

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, authResponse{Success: false, Message: "Method not allowed"})
		return
	}
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, authResponse{
			Success: false, Message: "Invalid request body",
		})
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, authResponse{
			Success: false, Message: "All fields are required",
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("hash error: %v", err)
		writeJSON(w, http.StatusInternalServerError, authResponse{
			Success: false, Message: "Internal server error",
		})
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.DB.Exec(
		"INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)",
		req.Username, req.Email, string(hash), now,
	)
	if err != nil {
		errStr := err.Error()
		if len(errStr) > 100 {
			errStr = errStr[:100]
		}
		log.Printf("insert error: %s", errStr)

		if contains(errStr, "UNIQUE") {
			writeJSON(w, http.StatusConflict, authResponse{
				Success: false, Message: "Username or email already exists",
			})
			return
		}
		writeJSON(w, http.StatusInternalServerError, authResponse{
			Success: false, Message: "Internal server error",
		})
		return
	}

	id, _ := result.LastInsertId()
	u := model.User{
		ID:        id,
		Username:  req.Username,
		Email:     req.Email,
		CreatedAt: now,
	}

	log.Printf("register ok: %s <%s>", u.Username, u.Email)
	writeJSON(w, http.StatusCreated, authResponse{
		Success: true,
		Message: "Account created",
		User:    &u,
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
