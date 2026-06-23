package handler

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
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
	Token   string      `json:"token,omitempty"`
}

type Session struct {
	Username  string
	ExpiresAt time.Time
}

var (
	sessions   = make(map[string]Session)
	sessionsMu sync.RWMutex
	hmacSecret = []byte("ndelok-session-secret-change-in-production")
)

func generateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func signToken(token string) string {
	mac := hmac.New(sha256.New, hmacSecret)
	mac.Write([]byte(token))
	return hex.EncodeToString(mac.Sum(nil))
}

func validateSessionToken(token, signature string) bool {
	// Constant-time comparison via hmac.Equal
	expected := signToken(token)
	return hmac.Equal([]byte(signature), []byte(expected))
}

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var rawToken, signature string

		// Check Authorization header first (standard API calls)
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				creds := strings.SplitN(parts[1], ":", 2)
				if len(creds) == 2 {
					rawToken, signature = creds[0], creds[1]
				}
			}
		}

		// Fallback: check token query param (WebSocket connections)
		if rawToken == "" {
			qToken := r.URL.Query().Get("token")
			if qToken != "" {
				creds := strings.SplitN(qToken, ":", 2)
				if len(creds) == 2 {
					rawToken, signature = creds[0], creds[1]
				}
			}
		}

		if rawToken == "" || signature == "" {
			writeJSON(w, http.StatusUnauthorized, authResponse{Success: false, Message: "Authorization required"})
			return
		}

		// HMAC verification (B6: timing-safe)
		if !validateSessionToken(rawToken, signature) {
			writeJSON(w, http.StatusUnauthorized, authResponse{Success: false, Message: "Invalid session"})
			return
		}

		// Check server-side session (B2: session replay protection)
		sessionsMu.RLock()
		session, ok := sessions[rawToken]
		sessionsMu.RUnlock()

		if !ok || time.Now().After(session.ExpiresAt) {
			if ok {
				sessionsMu.Lock()
				delete(sessions, rawToken)
				sessionsMu.Unlock()
			}
			writeJSON(w, http.StatusUnauthorized, authResponse{Success: false, Message: "Session expired"})
			return
		}

		r.Header.Set("X-Username", session.Username)
		next(w, r)
	}
}

func CheckWSOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true // Allow non-browser clients or if Origin header is missing
	}
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	host, port, err := net.SplitHostPort(u.Host)
	if err != nil {
		host = u.Host
		port = ""
	}
	if port != "1234" {
		return false
	}
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	if ip != nil {
		return ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified()
	}
	return false
}

// ───────── Rate Limiting (B8) ─────────

type rateLimitEntry struct {
	hits []time.Time
	mu   sync.Mutex
}

var (
	rateLimiters   = make(map[string]*rateLimitEntry)
	rateLimitersMu sync.Mutex
)

const rateLimitWindow = time.Minute
const rateLimitMax = 10

func checkRateLimit(key string) bool {
	rateLimitersMu.Lock()
	entry, ok := rateLimiters[key]
	if !ok {
		entry = &rateLimitEntry{}
		rateLimiters[key] = entry
	}
	rateLimitersMu.Unlock()

	entry.mu.Lock()
	defer entry.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rateLimitWindow)

	var valid []time.Time
	for _, t := range entry.hits {
		if t.After(windowStart) {
			valid = append(valid, t)
		}
	}

	if len(valid) >= rateLimitMax {
		entry.hits = valid
		return false
	}

	entry.hits = append(valid, now)
	return true
}

// ───────── Login ─────────

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, authResponse{Success: false, Message: "Method not allowed"})
		return
	}

	// Rate limit by IP
	if !checkRateLimit(r.RemoteAddr) {
		db.LogEvent("WARN", fmt.Sprintf("Rate limit exceeded for login from %s", r.RemoteAddr))
		writeJSON(w, http.StatusTooManyRequests, authResponse{Success: false, Message: "Too many login attempts. Try again later."})
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
		db.LogEvent("WARN", fmt.Sprintf("Failed login attempt (user not found): %s", req.Username))
		writeJSON(w, http.StatusUnauthorized, authResponse{
			Success: false, Message: "Invalid username or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)); err != nil {
		db.LogEvent("WARN", fmt.Sprintf("Failed login attempt (incorrect password): %s", req.Username))
		writeJSON(w, http.StatusUnauthorized, authResponse{
			Success: false, Message: "Invalid username or password",
		})
		return
	}

	// Generate session token (B1: proper auth token)
	token, err := generateSessionToken()
	if err != nil {
		log.Printf("token gen error: %v", err)
		writeJSON(w, http.StatusInternalServerError, authResponse{Success: false, Message: "Internal server error"})
		return
	}

	signature := signToken(token)

	sessionsMu.Lock()
	sessions[token] = Session{
		Username:  u.Username,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	sessionsMu.Unlock()

	fullToken := token + ":" + signature

	log.Printf("login ok: %s", u.Username)
	db.LogEvent("INFO", fmt.Sprintf("User logged in: %s", u.Username))
	writeJSON(w, http.StatusOK, authResponse{
		Success: true,
		Message: "Login successful",
		User:    &u,
		Token:   fullToken,
	})
}

// ───────── Register ─────────

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

	// Generate session token on register too
	token, err := generateSessionToken()
	if err != nil {
		log.Printf("token gen error: %v", err)
		writeJSON(w, http.StatusInternalServerError, authResponse{Success: false, Message: "Internal server error"})
		return
	}

	signature := signToken(token)

	sessionsMu.Lock()
	sessions[token] = Session{
		Username:  u.Username,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	sessionsMu.Unlock()

	fullToken := token + ":" + signature

	log.Printf("register ok: %s <%s>", u.Username, u.Email)
	db.LogEvent("INFO", fmt.Sprintf("User registered: %s", u.Username))
	writeJSON(w, http.StatusCreated, authResponse{
		Success: true,
		Message: "Account created",
		User:    &u,
		Token:   fullToken,
	})
}

// ───────── Logout ─────────

func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, authResponse{Success: false, Message: "Method not allowed"})
		return
	}

	username := r.Header.Get("X-Username")
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" {
			creds := strings.SplitN(parts[1], ":", 2)
			if len(creds) == 2 {
				rawToken := creds[0]
				sessionsMu.Lock()
				delete(sessions, rawToken)
				sessionsMu.Unlock()
			}
		}
	}

	if username != "" {
		db.LogEvent("INFO", fmt.Sprintf("User logged out: %s", username))
	} else {
		db.LogEvent("INFO", "User logged out")
	}

	writeJSON(w, http.StatusOK, authResponse{Success: true, Message: "Logout successful"})
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
