import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, User, Lock, Mail, Server, Terminal, Cpu } from "lucide-react";

const API = "http://127.0.0.1:1235";

// ──────────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────────
type AuthView = "login" | "register";

interface AuthPageProps {
  onLogin: (username: string, email: string) => void;
}

// ──────────────────────────────────────────────────────────────
//  Root Auth Gate – decides which auth page to show
// ──────────────────────────────────────────────────────────────
export function AuthGate({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("login");

  return view === "login" ? (
    <LoginPage onLogin={onLogin} onSwitchToRegister={() => setView("register")} />
  ) : (
    <RegisterPage onLogin={onLogin} onSwitchToLogin={() => setView("login")} />
  );
}

// ──────────────────────────────────────────────────────────────
//  Shared decorative background ticker
// ──────────────────────────────────────────────────────────────
function TerminalTicker() {
  const [stats, setStats] = useState({ cpu: 0, ram: 0, netDown: 0, uptimeNum: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/metrics`);
        if (!res.ok) throw new Error("not ok");
        const d = await res.json();
        if (!mounted) return;
        setStats(s => ({ ...s, cpu: d.cpu ?? s.cpu, ram: d.ram ?? s.ram, netDown: d.network?.down ?? s.netDown, uptimeNum: d.uptime_num ?? s.uptimeNum }));
      } catch {}
      if (mounted) timer = setTimeout(fetchStats, 1000);
    };
    fetchStats();
    return () => { mounted = false; clearTimeout(timer); };
  }, [isVisible]);

  useEffect(() => {
    if (stats.uptimeNum <= 0 || !isVisible) return;
    const id = setInterval(() => setStats(s => ({ ...s, uptimeNum: s.uptimeNum + 1 })), 1000);
    return () => clearInterval(id);
  }, [stats.uptimeNum, isVisible]);

  const formatSpeed = (b: number) =>
    b >= 1024 * 1024 ? `${(b / (1024 * 1024)).toFixed(1)} MB/s` :
    b >= 1024 ? `${(b / 1024).toFixed(1)} KB/s` :
    `${b.toFixed(0)} B/s`;

  const fmtUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
  };

  const lines = [
    "$ ndelok --version 0.18.0",
    "$ ssh root@production-01",
    `CPU: ${stats.cpu.toFixed(1)}% · RAM: ${stats.ram.toFixed(1)}% · NET: ↓ ${formatSpeed(stats.netDown)}`,
    "$ systemctl status zerotier",
    "● zerotier-one.service — ACTIVE (running)",
    "$ tail -f /var/log/ndelok/access.log",
    `[INFO] ${new Date().toISOString().replace("T", " ").slice(0, 19)} — server OK`,
    `[INFO] CPU ${stats.cpu.toFixed(1)}% · UPTIME ${fmtUptime(stats.uptimeNum)}`,
    `$ uptime -p   →   up ${fmtUptime(stats.uptimeNum)}`,
    `$ df -h / | awk 'NR==2{print $5}'    →   ${stats.ram.toFixed(0)}% used`,
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "0.72rem",
        color: "rgba(0,0,0,0.18)",
        lineHeight: 1.9,
        userSelect: "none",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {[...lines, ...lines].map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
//  Reusable input field
// ──────────────────────────────────────────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  error?: string;
  autoComplete?: string;
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  rightAddon,
  error,
  autoComplete,
}: InputFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        htmlFor={id}
        className="font-heading"
        style={{ fontSize: "0.78rem", letterSpacing: "0.5px" }}
      >
        {label}
      </label>

      <div style={{ position: "relative", display: "flex" }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#475569",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="font-body"
          style={{
            width: "100%",
            border: error ? "3px solid #ef4444" : "3px solid black",
            padding: icon ? "9px 9px 9px 36px" : "9px 9px",
            paddingRight: rightAddon ? "40px" : "9px",
            fontSize: "0.88rem",
            outline: "none",
            boxShadow: error ? "3px 3px 0px #ef4444" : "3px 3px 0px black",
            backgroundColor: "white",
            transition: "box-shadow 0.1s, transform 0.1s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "3px solid #74B9FF";
            e.currentTarget.style.outlineOffset = "3px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        />
        {rightAddon && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightAddon}
          </span>
        )}
      </div>

      {error && (
        <span
          className="font-mono"
          style={{
            fontSize: "0.72rem",
            color: "#ef4444",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
//  Status mini-metrics (decorative, right panel)
// ──────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: "3px solid black",
        backgroundColor: color,
        boxShadow: "4px 4px 0px black",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        minWidth: "120px",
      }}
    >
      <span
        className="font-heading"
        style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
      >
        {label}
      </span>
      <span
        className="font-display"
        style={{ fontSize: "2rem", lineHeight: 1 }}
      >
        {value}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
//  LOGIN PAGE
// ──────────────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: (username: string, email: string) => void;
  onSwitchToRegister: () => void;
}

function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [liveStats, setLiveStats] = useState({ cpu: 0, ram: 0, uptimeNum: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/metrics`);
        if (!res.ok) throw new Error("not ok");
        const d = await res.json();
        if (!mounted) return;
        setLiveStats(s => ({ ...s, cpu: d.cpu ?? s.cpu, ram: d.ram ?? s.ram, uptimeNum: d.uptime_num ?? s.uptimeNum }));
      } catch {}
      if (mounted) timer = setTimeout(fetchStats, 1000);
    };
    fetchStats();
    return () => { mounted = false; clearTimeout(timer); };
  }, [isVisible]);

  useEffect(() => {
    if (liveStats.uptimeNum <= 0 || !isVisible) return;
    const id = setInterval(() => setLiveStats(s => ({ ...s, uptimeNum: s.uptimeNum + 1 })), 1000);
    return () => clearInterval(id);
  }, [liveStats.uptimeNum, isVisible]);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${sec}s`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = "Username tidak boleh kosong";
    if (!password) newErrors.password = "Password tidak boleh kosong";
    else if (password.length < 6)
      newErrors.password = "Password minimal 6 karakter";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLogin(username, data.user?.email || "");
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch {
      setLoginError("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg, #FFFDF5)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── Left decorative panel ── */}
      <div
        aria-hidden="true"
        style={{
          width: "42%",
          flexShrink: 0,
          backgroundColor: "#88D498",
          borderRight: "3px solid black",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background ticker */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "48px 40px",
            overflow: "hidden",
          }}
        >
          <TerminalTicker />
        </div>

        {/* Foreground content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "black",
                border: "3px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "4px 4px 0px rgba(0,0,0,0.3)",
              }}
            >
              <Server size={26} color="#88D498" />
            </div>
            <div>
              <h1
                className="font-heading"
                style={{ fontSize: "2.4rem", lineHeight: 1, color: "black" }}
              >
                NDELOK
              </h1>
              <span
                className="badge"
                style={{ backgroundColor: "black", color: "#88D498", fontSize: "0.6rem" }}
              >
                v0.18.0
              </span>
            </div>
          </div>

          <p
            className="font-body"
            style={{
              marginTop: "24px",
              fontSize: "1rem",
              color: "black",
              maxWidth: "280px",
              lineHeight: 1.6,
              borderLeft: "4px solid black",
              paddingLeft: "12px",
            }}
          >
            Sistem monitoring server yang jujur, mekanis, dan instan. Tanpa
            basa-basi.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <StatChip label="CPU" value={`${liveStats.cpu.toFixed(1)}%`} color="var(--system-yellow, #FFD23F)" />
          <StatChip label="RAM" value={`${liveStats.ram.toFixed(1)}%`} color="var(--system-blue, #74B9FF)" />
          <StatChip label="UPTIME" value={liveStats.uptimeNum ? formatUptime(liveStats.uptimeNum) : "..."} color="white" />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Title */}
          <div style={{ marginBottom: "var(--space-lg, 32px)" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "3px solid black",
                padding: "4px 10px",
                backgroundColor: "var(--system-yellow, #FFD23F)",
                boxShadow: "3px 3px 0px black",
                marginBottom: "16px",
              }}
            >
              <Shield size={14} />
              <span className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                SECURE AUTH
              </span>
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: "2.6rem", letterSpacing: "-1px", lineHeight: 1.05 }}
            >
              LOGIN
            </h2>
            <p className="font-body" style={{ color: "#475569", marginTop: "6px", fontSize: "0.9rem" }}>
              Masuk ke panel kontrol server kamu.
            </p>
          </div>

          {/* Form */}
          <form
            id="login-form"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            noValidate
          >
            <InputField
              id="login-username"
              label="USERNAME"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="admin"
              icon={<User size={16} />}
              error={errors.username}
              autoComplete="username"
            />

            <InputField
              id="login-password"
              label="PASSWORD"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password}
              autoComplete="current-password"
              rightAddon={
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Global error */}
            {loginError && (
              <div
                style={{
                  border: "3px solid black",
                  backgroundColor: "var(--system-red, #FF6B6B)",
                  boxShadow: "3px 3px 0px black",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: "0.78rem", fontWeight: 700 }}
                >
                  ⚠ {loginError}
                </span>
              </div>
            )}

            {/* Hint */}
            <div
              style={{
                border: "2px solid black",
                backgroundColor: "#f1f5f9",
                padding: "8px 12px",
                boxShadow: "2px 2px 0px black",
              }}
            >
              <p className="font-mono" style={{ fontSize: "0.68rem", color: "#475569" }}>
                Belum punya akun? Daftar dulu, lalu login.
              </p>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                letterSpacing: "1px",
                backgroundColor: isLoading ? "#e2e8f0" : "#88D498",
                boxShadow: isLoading ? "2px 2px 0px black" : "5px 5px 0px black",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translate(-2px, -2px)";
                  e.currentTarget.style.boxShadow = "7px 7px 0px black";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = isLoading
                  ? "2px 2px 0px black"
                  : "5px 5px 0px black";
              }}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid black",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Terminal size={18} />
                  LOGIN →
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "3px solid black",
              textAlign: "center",
            }}
          >
            <p className="font-body" style={{ fontSize: "0.88rem", color: "#475569" }}>
              Belum punya akun?{" "}
              <button
                id="switch-to-register-btn"
                onClick={onSwitchToRegister}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 700,
                  textDecoration: "underline",
                  color: "black",
                  padding: 0,
                }}
              >
                DAFTAR SEKARANG
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
//  REGISTER PAGE
// ──────────────────────────────────────────────────────────────
interface RegisterPageProps {
  onLogin: (username: string, email: string) => void;
  onSwitchToLogin: () => void;
}

function RegisterPage({ onLogin, onSwitchToLogin }: RegisterPageProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.username.trim()) e.username = "Username tidak boleh kosong";
    else if (form.username.length < 3) e.username = "Username minimal 3 karakter";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Hanya huruf, angka, dan underscore";

    if (!form.email.trim()) e.email = "Email tidak boleh kosong";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid";

    if (!form.password) e.password = "Password tidak boleh kosong";
    else if (form.password.length < 8)
      e.password = "Password minimal 8 karakter";

    if (!form.confirmPassword) e.confirmPassword = "Konfirmasi password wajib diisi";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Password tidak cocok";

    return e;
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    const map = [
      { level: 1, label: "LEMAH", color: "var(--system-red, #FF6B6B)" },
      { level: 2, label: "CUKUP", color: "var(--system-yellow, #FFD23F)" },
      { level: 3, label: "KUAT", color: "var(--system-blue, #74B9FF)" },
      { level: 4, label: "SANGAT KUAT", color: "var(--system-green, #88D498)" },
    ];
    return map[score - 1] ?? { level: 0, label: "", color: "transparent" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("success");
      } else {
        setErrors({ username: data.message || "Registration failed" });
      }
    } catch {
      setErrors({ username: "Cannot connect to server" });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg, #FFFDF5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#88D498",
              border: "3px solid black",
              boxShadow: "6px 6px 0px black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Shield size={40} />
          </div>
          <h2
            className="font-heading"
            style={{ fontSize: "2.4rem", letterSpacing: "-1px", marginBottom: "12px" }}
          >
            AKUN DIBUAT!
          </h2>
          <p className="font-body" style={{ color: "#475569", marginBottom: "32px" }}>
            Selamat datang, <strong>{form.username}</strong>! Akun server monitoring kamu
            telah berhasil dibuat.
          </p>
          <div
            style={{
              border: "3px solid black",
              backgroundColor: "#f1f5f9",
              boxShadow: "4px 4px 0px black",
              padding: "16px",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.78rem",
              textAlign: "left",
              marginBottom: "28px",
            }}
          >
            <div style={{ color: "#475569", marginBottom: "4px" }}>$ ndelok auth register</div>
            <div style={{ color: "#22c55e" }}>✔ User "{form.username}" created</div>
            <div style={{ color: "#22c55e" }}>✔ Session initialized</div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ color: "#475569" }}>→ </span>
              Redirecting to dashboard...
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "14px",
                  backgroundColor: "black",
                  marginLeft: "2px",
                  animation: "blink 1s steps(1) infinite",
                  verticalAlign: "middle",
                }}
              />
            </div>
          </div>
          <button
            id="register-go-dashboard-btn"
            className="btn"
            onClick={() => onLogin(form.username, form.email)}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "1rem",
              letterSpacing: "1px",
              backgroundColor: "#88D498",
              boxShadow: "5px 5px 0px black",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-2px,-2px)";
              e.currentTarget.style.boxShadow = "7px 7px 0px black";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "5px 5px 0px black";
            }}
          >
            <Cpu size={18} style={{ marginRight: "8px", display: "inline" }} />
            BUKA DASHBOARD →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "var(--bg, #FFFDF5)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── Left decorative panel (blue accent for register) ── */}
      <div
        aria-hidden="true"
        style={{
          width: "42%",
          flexShrink: 0,
          backgroundColor: "#74B9FF",
          borderRight: "3px solid black",
          padding: "32px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "48px 40px",
            overflow: "hidden",
          }}
        >
          <TerminalTicker />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "black",
                border: "3px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "4px 4px 0px rgba(0,0,0,0.3)",
              }}
            >
              <Server size={26} color="#74B9FF" />
            </div>
            <div>
              <h1
                className="font-heading"
                style={{ fontSize: "2.4rem", lineHeight: 1, color: "black" }}
              >
                NDELOK
              </h1>
              <span
                className="badge"
                style={{
                  backgroundColor: "black",
                  color: "#74B9FF",
                  fontSize: "0.6rem",
                }}
              >
                v0.18.0
              </span>
            </div>
          </div>

          <p
            className="font-body"
            style={{
              marginTop: "24px",
              fontSize: "1rem",
              color: "black",
              maxWidth: "280px",
              lineHeight: 1.6,
              borderLeft: "4px solid black",
              paddingLeft: "12px",
            }}
          >
            Daftarkan akun operator servermu. Akses penuh ke dashboard monitoring, plugin, dan terminal.
          </p>

          {/* Feature list */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[
              "Real-time CPU & RAM monitoring",
              "Plugin manager (ZeroTier, Docker, Nginx)",
              "AI DevOps Agent built-in",
              "Multi-server deployment pipeline",
            ].map((feat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "black",
                    color: "#74B9FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span
                  className="font-body"
                  style={{ fontSize: "0.85rem", color: "black" }}
                >
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ position: "relative", zIndex: 1 }}
          className="font-mono"
        >
          <div
            style={{
              border: "3px solid black",
              backgroundColor: "black",
              color: "#74B9FF",
              padding: "12px 16px",
              fontSize: "0.72rem",
              boxShadow: "4px 4px 0px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ opacity: 0.6, marginBottom: "4px" }}>$ ndelok user create</div>
            <div>Registering new operator account...</div>
            <div style={{ marginTop: "4px", opacity: 0.8 }}>
              ██████████░░░░ 72%
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 28px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Title */}
          <div style={{ marginBottom: "14px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "3px solid black",
                padding: "3px 8px",
                backgroundColor: "#74B9FF",
                boxShadow: "3px 3px 0px black",
                marginBottom: "8px",
              }}
            >
              <User size={12} />
              <span
                className="font-mono"
                style={{ fontSize: "0.65rem", fontWeight: 700 }}
              >
                NEW OPERATOR
              </span>
            </div>
            <h2
              className="font-heading"
              style={{
                fontSize: "2rem",
                letterSpacing: "-1px",
                lineHeight: 1.05,
              }}
            >
              DAFTAR
            </h2>
            <p
              className="font-body"
              style={{ color: "#475569", marginTop: "4px", fontSize: "0.82rem" }}
            >
              Buat akun operator server baru.
            </p>
          </div>

          {/* Form */}
          <form
            id="register-form"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            noValidate
          >
            <InputField
              id="register-username"
              label="USERNAME"
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="operator_01"
              icon={<User size={16} />}
              error={errors.username}
              autoComplete="username"
            />

            <InputField
              id="register-email"
              label="EMAIL"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="operator@ndelok.me"
              icon={<Mail size={16} />}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <InputField
                id="register-password"
                label="PASSWORD"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 karakter"
                icon={<Lock size={16} />}
                error={errors.password}
                autoComplete="new-password"
                rightAddon={
                  <button
                    type="button"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {/* Password strength meter */}
              {form.password && (
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          flex: 1,
                          height: "6px",
                          border: "2px solid black",
                          backgroundColor:
                            lvl <= strength.level ? strength.color : "white",
                          transition: "background-color 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "black",
                      }}
                    >
                      KEKUATAN PASSWORD: {strength.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            <InputField
              id="register-confirm-password"
              label="KONFIRMASI PASSWORD"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Ulangi password"
              icon={<Shield size={16} />}
              error={errors.confirmPassword}
              autoComplete="new-password"
              rightAddon={
                <button
                  type="button"
                  aria-label={showConfirm ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                  onClick={() => setShowConfirm((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <button
              id="register-submit-btn"
              type="submit"
              className="btn"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: "0.95rem",
                letterSpacing: "1px",
                backgroundColor: isLoading ? "#e2e8f0" : "#74B9FF",
                boxShadow: isLoading ? "2px 2px 0px black" : "5px 5px 0px black",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "2px",
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translate(-2px, -2px)";
                  e.currentTarget.style.boxShadow = "7px 7px 0px black";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = isLoading
                  ? "2px 2px 0px black"
                  : "5px 5px 0px black";
              }}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid black",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  MEMBUAT AKUN...
                </>
              ) : (
                <>
                  <User size={18} />
                  DAFTAR →
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "3px solid black",
              textAlign: "center",
            }}
          >
            <p className="font-body" style={{ fontSize: "0.88rem", color: "#475569" }}>
              Sudah punya akun?{" "}
              <button
                id="switch-to-login-btn"
                onClick={onSwitchToLogin}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 700,
                  textDecoration: "underline",
                  color: "black",
                  padding: 0,
                }}
              >
                LOGIN SEKARANG
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
