import { useEffect, useState, useRef, Fragment } from "react";
import { Activity, Cpu, HardDrive, Network, Package, Terminal, Settings, LayoutDashboard, FileText, Folder, ChevronRight, ArrowUp, Bot, Send, Zap, Server, Shield, RefreshCw, Trash2 } from "lucide-react";
import { AuthGate } from "./AuthPages";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("ADMIN");

  return isLoggedIn ? (
    <Dashboard loggedInUser={loggedInUser} />
  ) : (
    <AuthGate
      onLogin={(username) => {
        setLoggedInUser(username.toUpperCase());
        setIsLoggedIn(true);
      }}
    />
  );
}

function Dashboard({ loggedInUser }: { loggedInUser: string }) {
  const [currentView, setCurrentView] = useState<"Dashboard" | "Plugins" | "Deploy" | "Explorer" | "Logs & Term" | "AI Agent" | "Settings">("Dashboard");
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    storage: 42,
    network: { up: 0, down: 0 }
  });

  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0));

  // Floating AI Agent States & Handlers
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [btnY, setBtnY] = useState(() => {
    if (typeof window !== "undefined") {
      return Math.max(400, Math.floor(window.innerHeight * 0.7));
    }
    return 600;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startBtnY = btnY;
    let hasDragged = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }
      setDragOffset({ x: dx, y: dy });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setIsDragging(false);
      
      const finalY = startBtnY + (upEvent.clientY - startY);
      const constrainedY = Math.max(50, Math.min(window.innerHeight - 100, finalY));
      setBtnY(constrainedY);
      setDragOffset({ x: 0, y: 0 });

      if (!hasDragged) {
        setIsAIAgentOpen(prev => !prev);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const startX = e.touches[0].clientX;
    const startY = e.touches[0].clientY;
    const startBtnY = btnY;
    let hasDragged = false;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const dx = moveEvent.touches[0].clientX - startX;
      const dy = moveEvent.touches[0].clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }
      setDragOffset({ x: dx, y: dy });
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      setIsDragging(false);
      
      const clientY = endEvent.changedTouches[0].clientY;
      const finalY = startBtnY + (clientY - startY);
      const constrainedY = Math.max(50, Math.min(window.innerHeight - 100, finalY));
      setBtnY(constrainedY);
      setDragOffset({ x: 0, y: 0 });

      if (!hasDragged) {
        setIsAIAgentOpen(prev => !prev);
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextCpu = Math.floor(Math.random() * 100);
      const nextRam = Math.floor(Math.random() * 100);
      const nextUp = parseFloat((Math.random() * 10).toFixed(1));
      const nextDown = parseFloat((Math.random() * 50).toFixed(1));

      setMetrics({
        cpu: nextCpu,
        ram: nextRam,
        storage: 42,
        network: { up: nextUp, down: nextDown }
      });

      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const generatePath = (data: number[], fill = false) => {
    const width = 500;
    const height = 120;
    const padding = 10;
    const graphWidth = width;
    const graphHeight = height - padding * 2;

    const points = data.map((val, i) => {
      const x = (i * graphWidth) / (data.length - 1);
      const y = height - padding - (val / 100) * graphHeight;
      return `${x},${y}`;
    });

    if (points.length === 0) return "";

    if (fill) {
      return `M 0,${height - padding} L ${points.join(" L ")} L ${width},${height - padding} Z`;
    }
    return `M ${points.join(" L ")}`;
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "280px", 
        flexShrink: 0,
        height: "100%",
        borderRight: "var(--border-width) solid var(--ink)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        backgroundColor: "var(--secondary-bg)",
        overflowY: "auto"
      }}>
        <div style={{ padding: "var(--space-md) 0" }}>
          <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.5px", lineHeight: "1" }}>NDELOK</h1>
          <p className="badge" style={{ backgroundColor: "var(--system-yellow)" }}>v0.18.0</p>
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === "Dashboard"}
            onClick={() => setCurrentView("Dashboard")}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Plugins" 
            active={currentView === "Plugins"}
            onClick={() => setCurrentView("Plugins")}
          />
          <NavItem 
            icon={<Activity size={20} />} 
            label="Deploy" 
            active={currentView === "Deploy"}
            onClick={() => setCurrentView("Deploy")}
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Explorer" 
            active={currentView === "Explorer"}
            onClick={() => setCurrentView("Explorer")}
          />
          <NavItem 
            icon={<Terminal size={20} />} 
            label="Logs & Term" 
            active={currentView === "Logs & Term"}
            onClick={() => setCurrentView("Logs & Term")}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={currentView === "Settings"}
            onClick={() => setCurrentView("Settings")}
          />
        </nav>

        <div 
          style={{ marginTop: "auto" }} 
          className="card"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              backgroundColor: "var(--system-blue)", 
              border: "2px solid black", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "2px 2px 0px black",
              fontWeight: "bold",
              fontSize: "1.1rem"
            }} className="font-heading">
              A
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
              <p className="font-heading" style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loggedInUser}</p>
              <p className="font-mono" style={{ fontSize: "0.68rem", color: "#475569" }}>admin@ndelok.me</p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", borderTop: "1.5px solid rgba(0,0,0,0.15)", paddingTop: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--system-green)", border: "1px solid black", animation: "pulse 2s infinite" }} />
            <span className="font-mono" style={{ fontSize: "0.62rem", color: "#475569" }}>Session Active · local-auth</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "var(--space-lg)", overflowY: "auto" }}>
        {currentView === "Dashboard" && (
          <>
            <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>DASHBOARD</h2>
              <div className="card" style={{ padding: "var(--space-sm) var(--space-md)", backgroundColor: "white" }}>
                <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>SERVER: PRODUCTION-01</span>
              </div>
            </header>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
              gap: "var(--space-lg)" 
            }}>
              {/* CPU Card */}
              <MetricCard 
                title="CPU USAGE" 
                value={`${metrics.cpu}%`} 
                icon={<Cpu size={32} />} 
                color="var(--system-yellow)"
                spec="Intel Xeon 8-Core @ 3.2GHz"
              />
              
              {/* RAM Card */}
              <MetricCard 
                title="RAM USAGE" 
                value={`${metrics.ram}%`} 
                icon={<Activity size={32} />} 
                color="var(--system-blue)"
                spec={`${(metrics.ram * 0.64).toFixed(1)}GB / 64GB DDR5`}
              />

              {/* Storage Card */}
              <MetricCard 
                title="STORAGE" 
                value={`${metrics.storage}%`} 
                icon={<HardDrive size={32} />} 
                color="var(--system-red)"
                spec="840GB / 2TB NVMe SSD"
              />

              {/* Network Card */}
              <div className="card" style={{ backgroundColor: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                  <h3 className="font-heading" style={{ fontSize: "1.1rem" }}>NETWORK SPEED</h3>
                  <Network size={24} />
                </div>
                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <div style={{ flex: 1, padding: "var(--space-sm)", border: "2px solid black", backgroundColor: "var(--system-green)" }}>
                    <p className="font-heading" style={{ fontSize: "0.7rem", fontWeight: 700 }}>DOWN</p>
                    <p className="font-display" style={{ fontSize: "1.8rem" }}>{metrics.network.down} MB/s</p>
                  </div>
                  <div style={{ flex: 1, padding: "var(--space-sm)", border: "2px solid black", backgroundColor: "white" }}>
                    <p className="font-heading" style={{ fontSize: "0.7rem", fontWeight: 700 }}>UP</p>
                    <p className="font-display" style={{ fontSize: "1.8rem" }}>{metrics.network.up} MB/s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CPU Load History Line Chart */}
            <div className="card" style={{ backgroundColor: "white", marginTop: "var(--space-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
                <div>
                  <h3 className="font-heading" style={{ fontSize: "1.1rem" }}>CPU LOAD HISTORY</h3>
                  <p style={{ fontSize: "0.75rem", color: "#475569" }}>Real-time 20-second CPU core load history</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "var(--system-yellow)", border: "1.5px solid black" }}></span>
                    <span className="font-heading" style={{ fontSize: "0.75rem" }}>CPU USAGE (CURRENT: {metrics.cpu}%)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <span className="font-heading" style={{ fontSize: "0.75rem", color: "#475569" }}>MAX: {Math.max(...cpuHistory)}%</span>
                  </div>
                </div>
              </div>

              <div style={{ border: "2px solid black", padding: 0, backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
                <svg viewBox="0 0 500 120" preserveAspectRatio="none" style={{ width: "100%", height: "140px", display: "block" }}>
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="10" x2="500" y2="10" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="35" x2="500" y2="35" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="85" x2="500" y2="85" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Vertical Grid lines */}
                  {Array.from({ length: 9 }).map((_, i) => {
                    const x = (i + 1) * 50;
                    return (
                      <line key={i} x1={x} y1="0" x2={x} y2="120" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                    );
                  })}

                  {/* CPU Fill Area */}
                  <path
                    d={generatePath(cpuHistory, true)}
                    fill="var(--system-yellow)"
                    fillOpacity="0.4"
                  />

                  {/* CPU Yellow Background Outline Line */}
                  <path
                    d={generatePath(cpuHistory, false)}
                    fill="none"
                    stroke="var(--system-yellow)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* CPU Thin Black Outline on top for contrast */}
                  <path
                    d={generatePath(cpuHistory, false)}
                    fill="none"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Exposed Y-Axis Labels */}
                <div style={{ position: "absolute", top: "12px", left: "16px", pointerEvents: "none" }} className="font-mono">
                  <span style={{ fontSize: "0.65rem", padding: "2px 4px", border: "1px solid black", backgroundColor: "white", boxShadow: "1px 1px 0px black" }}>
                    100%
                  </span>
                </div>
                <div style={{ position: "absolute", bottom: "12px", left: "16px", pointerEvents: "none" }} className="font-mono">
                  <span style={{ fontSize: "0.65rem", padding: "2px 4px", border: "1px solid black", backgroundColor: "white", boxShadow: "1px 1px 0px black" }}>
                    0%
                  </span>
                </div>
              </div>
            </div>

            {/* System Status Table Mock */}
            <section style={{ marginTop: "var(--space-xl)" }}>
              <h3 className="font-heading" style={{ marginBottom: "var(--space-md)", fontSize: "1.6rem" }}>RECENT LOGS</h3>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "var(--secondary-bg)", borderBottom: "var(--border-width) solid var(--ink)" }} className="font-heading">
                    <tr>
                      <th style={{ ...tableHeaderStyle, fontSize: "0.85rem" }}>TIMESTAMP</th>
                      <th style={{ ...tableHeaderStyle, fontSize: "0.85rem" }}>LEVEL</th>
                      <th style={{ ...tableHeaderStyle, fontSize: "0.85rem" }}>MESSAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <LogRow time="22:30:01" level="INFO" msg="System check completed." />
                    <LogRow time="22:30:05" level="WARN" msg="CPU usage spike detected." />
                    <LogRow time="22:30:12" level="INFO" msg="Network connection stable." />
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
        {currentView === "Plugins" && <PluginsView />}
        {currentView === "Deploy" && <DeployView />}
        {currentView === "Explorer" && <ExplorerView />}
        {currentView === "Logs & Term" && <LogsTermView />}
        {currentView !== "Dashboard" && currentView !== "Plugins" && currentView !== "Deploy" && currentView !== "Explorer" && currentView !== "Logs & Term" && currentView !== "AI Agent" && (
          <div>
            <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>{currentView.toUpperCase()}</h2>
            <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-md)" }}>
              Under construction. Coming soon.
            </p>
          </div>
        )}
      </main>

      {/* Floating AI Agent Toggle Button */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="floating-agent-btn"
        style={{
          position: "fixed",
          right: "16px",
          top: `${btnY}px`,
          width: "56px",
          height: "56px",
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.1s",
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 9999,
          backgroundColor: "white",
          border: "3px solid black",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "-4px 4px 0px black",
          userSelect: "none"
        }}
      >
        <Bot size={24} />
      </div>

      {/* Floating AI Agent Popup Console */}
      <AIAgentPopup isOpen={isAIAgentOpen} onClose={() => setIsAIAgentOpen(false)} btnY={btnY} />
    </div>
  );
}

function MetricCard({ title, value, icon, color, spec }: any) {
  return (
    <div className="card" style={{ backgroundColor: color, position: "relative", minHeight: "170px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
        <h3 className="font-heading" style={{ fontSize: "1.1rem", maxWidth: "150px" }}>{title}</h3>
        {icon}
      </div>
      <p className="font-display" style={{ fontSize: "4.5rem", lineHeight: 0.95 }}>{value}</p>
      {spec && (
        <div 
          className="font-mono"
          style={{ 
            position: "absolute",
            bottom: "12px",
            right: "12px",
            backgroundColor: "white", 
            border: "2px solid #000000", 
            borderRadius: "6px",
            padding: "2px 8px", 
            fontSize: "0.72rem", 
            fontWeight: 700,
            color: "#000000",
            boxShadow: "2px 2px 0px #000000"
          }}
        >
          {spec}
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      className="font-heading"
      onClick={onClick}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "var(--space-md)", 
        padding: "var(--space-sm) var(--space-md)",
        border: active ? "var(--border-width) solid var(--ink)" : "none",
        backgroundColor: active ? "white" : "transparent",
        boxShadow: active ? "var(--shadow-active)" : "none",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.95rem",
        transition: "all 0.1s"
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function LogRow({ time, level, msg }: any) {
  return (
    <tr style={{ borderBottom: "1px solid black" }} className="font-mono">
      <td style={tableCellStyle}>{time}</td>
      <td style={tableCellStyle}>
        <span className="badge" style={{ 
          backgroundColor: level === "WARN" ? "var(--system-yellow)" : "var(--system-green)" 
        }}>{level}</span>
      </td>
      <td style={tableCellStyle}>{msg}</td>
    </tr>
  );
}

const tableHeaderStyle = {
  textAlign: "left" as const,
  padding: "var(--space-md)",
  fontSize: "0.85rem"
};

const tableCellStyle = {
  padding: "var(--space-md)",
  fontSize: "0.9rem"
};

function PluginsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "INSTALLED">("ALL");

  // Installed & Status states for interactive behavior
  const [installedPlugins, setInstalledPlugins] = useState<Record<string, boolean>>({
    zerotier: true,
    tmux: true,
    cloudflare: true,
    docker: false,
    nginx: false
  });

  const [pluginStatuses, setPluginStatuses] = useState<Record<string, string>>({
    zerotier: "ONLINE",
    tmux: "RUNNING",
    cloudflare: "CONNECTED",
    docker: "AVAILABLE",
    nginx: "AVAILABLE"
  });

  // Modal & Configuration States
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [zerotierIdInput, setZerotierIdInput] = useState("8056c85e45c71a39");
  const [currentZerotierId, setCurrentZerotierId] = useState("8056c85e45c71a39");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const pluginsData = [
    {
      id: "zerotier",
      name: "ZEROTIER ONE",
      tagline: "Secure Virtual Network & Overlay P2P",
      description: "Creates virtual networks, bridging server workloads peer-to-peer over an encrypted overlay network. Ideal for secure multi-cloud or remote management.",
      color: "var(--system-blue)",
      status: pluginStatuses.zerotier,
      badgeText: "v1.12.2",
      installed: installedPlugins.zerotier,
      details: [
        { label: "NETWORK ID", value: currentZerotierId },
        { label: "IP ADDRESS", value: pluginStatuses.zerotier === "ONLINE" ? "10.147.20.12" : "N/A" },
        { label: "INTERFACE", value: pluginStatuses.zerotier === "ONLINE" ? "ztly2t4" : "N/A" }
      ],
      actions: installedPlugins.zerotier 
        ? [pluginStatuses.zerotier === "ONLINE" ? "DISABLE" : "ENABLE", "CONFIGURE"]
        : ["INSTALL", "DOCS"]
    },
    {
      id: "tmux",
      name: "TMUX MULTIPLEXER",
      tagline: "Workspace Manager & Session Persistence",
      description: "Terminal session persistence and shell multiplexing. Keeps long-running CLI builds and scripts active in the background when ssh detaches.",
      color: "var(--system-yellow)",
      status: pluginStatuses.tmux,
      badgeText: "v3.3a",
      installed: installedPlugins.tmux,
      details: [
        { label: "ACTIVE SESSIONS", value: pluginStatuses.tmux === "RUNNING" ? "3 Sessions" : "0 Sessions" },
        { label: "DEFAULT SHELL", value: "/bin/zsh" },
        { label: "CPU IMPACT", value: pluginStatuses.tmux === "RUNNING" ? "0.2% Load" : "0.0% Load" }
      ],
      actions: installedPlugins.tmux
        ? [pluginStatuses.tmux === "RUNNING" ? "RESTART" : "START", "ATTACH"]
        : ["INSTALL", "DOCS"]
    },
    {
      id: "cloudflare",
      name: "CLOUDFLARE TUNNEL",
      tagline: "Secure Public Tunneling Without Open Ports",
      description: "Exposes local web services to the public internet securely. Proxies requests through Cloudflare's edge network without opening hardware firewall ports.",
      color: "var(--system-red)",
      status: pluginStatuses.cloudflare,
      badgeText: "v2024.1.0",
      installed: installedPlugins.cloudflare,
      details: [
        { label: "TUNNEL NAME", value: "ndelok-prod-01" },
        { label: "CONNECTED HOST", value: pluginStatuses.cloudflare === "CONNECTED" ? "ndelok.me" : "N/A" },
        { label: "EDGE POPS", value: pluginStatuses.cloudflare === "CONNECTED" ? "CGK / SIN (2 PoPs)" : "N/A" }
      ],
      actions: installedPlugins.cloudflare
        ? [pluginStatuses.cloudflare === "CONNECTED" ? "DISCONNECT" : "CONNECT", "VIEW LOGS"]
        : ["INSTALL", "DOCS"]
    },
    {
      id: "docker",
      name: "DOCKER ENGINE",
      tagline: "Container Orchestration & Isolation",
      description: "Manage containerized applications, network bridges, and volumes directly from your dashboard. Easily deploy web servers, databases, and microservices.",
      color: "var(--system-green)",
      status: pluginStatuses.docker,
      badgeText: "v24.0.7",
      installed: installedPlugins.docker,
      details: [
        { label: "CONTAINERS", value: pluginStatuses.docker === "RUNNING" ? "1 Active" : "0 Active" },
        { label: "ENGINE STATUS", value: pluginStatuses.docker === "RUNNING" ? "ACTIVE" : "NOT INSTALLED" },
        { label: "DOCKER COMPOSE", value: "Supported" }
      ],
      actions: installedPlugins.docker 
        ? [pluginStatuses.docker === "RUNNING" ? "STOP" : "START", "CONFIGURE"] 
        : ["INSTALL", "DOCS"]
    },
    {
      id: "nginx",
      name: "NGINX REVERSE PROXY",
      tagline: "High-performance HTTP Server & Proxy",
      description: "Configure reverse proxies, load balancing, and SSL termination. Secure your local services and route public web traffic with custom configurations.",
      color: "oklch(0.8 0.15 200)",
      status: pluginStatuses.nginx,
      badgeText: "v1.25.3",
      installed: installedPlugins.nginx,
      details: [
        { label: "ACTIVE SITES", value: pluginStatuses.nginx === "RUNNING" ? "2 Sites" : "0 Sites" },
        { label: "PORT BINDING", value: "80, 443" },
        { label: "SSL ENGINE", value: "Let's Encrypt" }
      ],
      actions: installedPlugins.nginx 
        ? [pluginStatuses.nginx === "RUNNING" ? "STOP" : "START", "RELOAD"] 
        : ["INSTALL", "DOCS"]
    }
  ];

  const filteredPlugins = pluginsData.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plugin.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "ALL" || (activeFilter === "INSTALLED" && plugin.installed);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-md)" }}>
        <div>
          <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>PLUGINS</h2>
          <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-xs)" }}>
            Extend server capabilities with Neobrutalist modules.
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
          {/* Search Input */}
          <input 
            type="text" 
            placeholder="SEARCH PLUGINS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-mono"
            style={{
              border: "3px solid black",
              padding: "6px 12px",
              outline: "none",
              boxShadow: "3px 3px 0px black",
              fontSize: "0.85rem",
              fontWeight: 700,
              width: "200px"
            }}
          />
          {/* Filter Buttons */}
          <button 
            className="btn" 
            onClick={() => setActiveFilter("ALL")}
            style={{ 
              backgroundColor: activeFilter === "ALL" ? "var(--system-yellow)" : "white",
              fontSize: "0.8rem",
              padding: "6px 12px",
              boxShadow: "3px 3px 0px black"
            }}
          >
            ALL
          </button>
          <button 
            className="btn" 
            onClick={() => setActiveFilter("INSTALLED")}
            style={{ 
              backgroundColor: activeFilter === "INSTALLED" ? "var(--system-yellow)" : "white",
              fontSize: "0.8rem",
              padding: "6px 12px",
              boxShadow: "3px 3px 0px black"
            }}
          >
            INSTALLED
          </button>
        </div>
      </header>

      {/* Plugins Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "var(--space-md)",
        marginTop: "var(--space-lg)"
      }}>
        {filteredPlugins.map(plugin => (
          <div key={plugin.id} className="card" style={{ 
            backgroundColor: "white", 
            padding: 0, 
            display: "flex", 
            flexDirection: "column",
            minHeight: "230px",
            overflow: "hidden"
          }}>
            {/* Header colored banner */}
            <div style={{ 
              backgroundColor: plugin.color, 
              borderBottom: "3px solid black", 
              padding: "6px var(--space-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 className="font-heading" style={{ fontSize: "0.95rem", color: "black" }}>{plugin.name}</h3>
                <span className="badge" style={{ backgroundColor: "white", marginTop: "1px", fontSize: "0.55rem", padding: "0px 3px" }}>
                  {plugin.badgeText}
                </span>
              </div>
              <span className="badge" style={{ 
                backgroundColor: "black", 
                color: plugin.color, 
                borderColor: "black",
                fontSize: "0.6rem",
                padding: "0px 3px"
              }}>
                {plugin.status}
              </span>
            </div>

            {/* Description Body */}
            <div style={{ padding: "var(--space-sm)", flex: 1, display: "flex", flexDirection: "column" }}>
              <p className="font-heading" style={{ fontSize: "0.75rem", marginBottom: "2px" }}>{plugin.tagline}</p>
              <p style={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.2, marginBottom: "var(--space-xs)" }}>{plugin.description}</p>
              
              {/* Exposed Info Grid */}
              <div style={{ 
                border: "2px solid black", 
                backgroundColor: "var(--secondary-bg)", 
                padding: "4px 6px", 
                display: "flex", 
                flexDirection: "column",
                gap: "1px",
                marginTop: "auto"
              }} className="font-mono">
                {plugin.details.map((detail, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}>
                    <span style={{ fontWeight: 700 }}>{detail.label}:</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ 
              borderTop: "3px solid black", 
              padding: "4px 8px", 
              backgroundColor: "var(--secondary-bg)",
              display: "flex",
              gap: "var(--space-sm)",
              justifyContent: "flex-end"
            }}>
              {plugin.actions.map((action, idx) => (
                <button 
                  key={idx} 
                  className="btn" 
                  onClick={() => {
                    if (action === "CONFIGURE" && plugin.id === "zerotier") {
                      setSelectedPlugin(plugin);
                      setZerotierIdInput(currentZerotierId);
                      setIsConfigOpen(true);
                      setIsMinimized(false);
                      setIsMaximized(false);
                    } else if (action === "DISABLE" && plugin.id === "zerotier") {
                      setPluginStatuses(prev => ({ ...prev, zerotier: "DISABLED" }));
                    } else if (action === "ENABLE" && plugin.id === "zerotier") {
                      setPluginStatuses(prev => ({ ...prev, zerotier: "ONLINE" }));
                    } else if (action === "RESTART" && plugin.id === "tmux") {
                      const oldStatus = pluginStatuses.tmux;
                      setPluginStatuses(prev => ({ ...prev, tmux: "RESTARTING" }));
                      setTimeout(() => {
                        setPluginStatuses(prev => ({ ...prev, tmux: oldStatus }));
                      }, 1000);
                    } else if (action === "START" && plugin.id === "tmux") {
                      setPluginStatuses(prev => ({ ...prev, tmux: "RUNNING" }));
                    } else if (action === "DISCONNECT" && plugin.id === "cloudflare") {
                      setPluginStatuses(prev => ({ ...prev, cloudflare: "DISCONNECTED" }));
                    } else if (action === "CONNECT" && plugin.id === "cloudflare") {
                      setPluginStatuses(prev => ({ ...prev, cloudflare: "CONNECTED" }));
                    } else if (action === "INSTALL") {
                      setInstalledPlugins(prev => ({ ...prev, [plugin.id]: true }));
                      setPluginStatuses(prev => ({ ...prev, [plugin.id]: "RUNNING" }));
                    } else if (action === "STOP") {
                      setPluginStatuses(prev => ({ ...prev, [plugin.id]: "STOPPED" }));
                    } else if (action === "START") {
                      setPluginStatuses(prev => ({ ...prev, [plugin.id]: "RUNNING" }));
                    } else {
                      alert(`Action "${action}" triggered for ${plugin.name}`);
                    }
                  }}
                  style={{ 
                    padding: "2px 6px", 
                    fontSize: "0.65rem", 
                    boxShadow: "1.5px 1.5px 0px black",
                    backgroundColor: idx === 0 ? "white" : "black",
                    color: idx === 0 ? "black" : "white"
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Modal Popup */}
      {isConfigOpen && selectedPlugin && (
        <>
          {/* Overlay background blur */}
          {!isMinimized && !isMaximized && (
            <div 
              onClick={() => setIsConfigOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(2px)",
                zIndex: 999
              }}
            />
          )}

          {/* Modal Container */}
          <div 
            style={
              isMaximized 
                ? {
                    position: "fixed",
                    top: "var(--space-md)",
                    left: "var(--space-md)",
                    right: "var(--space-md)",
                    bottom: "var(--space-md)",
                    backgroundColor: "white",
                    border: "3px solid black",
                    boxShadow: "8px 8px 0px black",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.15s ease-out"
                  }
                : isMinimized 
                  ? {
                      position: "fixed",
                      bottom: "20px",
                      right: "20px",
                      width: "320px",
                      backgroundColor: "white",
                      border: "3px solid black",
                      boxShadow: "4px 4px 0px black",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.15s ease-out"
                    }
                  : {
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "420px",
                      maxWidth: "90%",
                      backgroundColor: "white",
                      border: "3px solid black",
                      boxShadow: "8px 8px 0px black",
                      zIndex: 1000,
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.15s ease-out"
                    }
            }
          >
            {/* Title Bar */}
            <div style={{
              backgroundColor: selectedPlugin.color,
              borderBottom: "3px solid black",
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "default"
            }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                CONFIGURE: {selectedPlugin.name}
              </span>
              
              {/* Window Controls */}
              <div style={{ display: "flex", gap: "6px" }}>
                {/* Minimize Button */}
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  title="Minimize"
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "1.5px solid black",
                    backgroundColor: "#fef08a",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    boxShadow: "1px 1px 0px black"
                  }}
                >
                  –
                </button>
                {/* Maximize Button */}
                <button 
                  onClick={() => {
                    setIsMaximized(!isMaximized);
                    setIsMinimized(false);
                  }}
                  title={isMaximized ? "Restore Down" : "Maximize"}
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "1.5px solid black",
                    backgroundColor: "#bbf7d0",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    boxShadow: "1px 1px 0px black"
                  }}
                >
                  {isMaximized ? "❐" : "⬜"}
                </button>
                {/* Close Button */}
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  title="Close"
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "1.5px solid black",
                    backgroundColor: "#fecaca",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    boxShadow: "1px 1px 0px black"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Window Content */}
            {!isMinimized && (
              <div style={{ padding: "var(--space-md)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div>
                  <h4 className="font-heading" style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                    ZEROTIER NETWORK CONFIGURATION
                  </h4>
                  <p style={{ fontSize: "0.72rem", color: "#475569", lineHeight: 1.3 }}>
                    Please enter the 16-character hexadecimal Network ID for Zerotier One to establish connection bridges.
                  </p>
                </div>

                {/* Input Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                    NETWORK ID:
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 8056c85e45c71a39" 
                    value={zerotierIdInput}
                    onChange={(e) => setZerotierIdInput(e.target.value.substring(0, 16))}
                    className="font-mono"
                    style={{
                      border: "3px solid black",
                      padding: "8px 12px",
                      outline: "none",
                      boxShadow: "4px 4px 0px black",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      backgroundColor: "#f8fafc"
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                    <span className="font-mono" style={{ fontSize: "0.6rem", color: "#64748b" }}>
                      Length: {zerotierIdInput.length}/16
                    </span>
                    {zerotierIdInput.length !== 16 && (
                      <span className="font-mono" style={{ fontSize: "0.6rem", color: "red", fontWeight: 700 }}>
                        Must be exactly 16 chars
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", marginTop: "auto", paddingTop: "var(--space-sm)" }}>
                  <button 
                    className="btn" 
                    onClick={() => setIsConfigOpen(false)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      backgroundColor: "white",
                      boxShadow: "3px 3px 0px black"
                    }}
                  >
                    CANCEL
                  </button>
                  <button 
                    className="btn" 
                    disabled={zerotierIdInput.length !== 16}
                    onClick={() => {
                      if (zerotierIdInput.length === 16) {
                        setCurrentZerotierId(zerotierIdInput);
                        setIsConfigOpen(false);
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      backgroundColor: zerotierIdInput.length === 16 ? "var(--system-green)" : "#e2e8f0",
                      cursor: zerotierIdInput.length === 16 ? "pointer" : "not-allowed",
                      boxShadow: "3px 3px 0px black",
                      opacity: zerotierIdInput.length === 16 ? 1 : 0.6
                    }}
                  >
                    SAVE ID
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DeployView() {
  const [projects, setProjects] = useState<any[]>([
    { id: "p1", name: "NDELOK DASHBOARD", port: "1234", status: "RUNNING", cpu: 2.5, ram: 128, storage: 420, deployMethod: "github", githubLink: "https://github.com/dikobokobok/ndelokV2.git", folderPath: "", buildCommand: "npm install && npm run build", startCommand: "npm run dev" },
    { id: "p2", name: "API GATEWAY", port: "8080", status: "RUNNING", cpu: 1.1, ram: 96, storage: 210, deployMethod: "github", githubLink: "https://github.com/dikobokobok/gateway.git", folderPath: "", buildCommand: "npm install", startCommand: "node index.js" },
    { id: "p3", name: "AUTH SERVICE", port: "8081", status: "STOPPED", cpu: 0, ram: 0, storage: 180, deployMethod: "folder", githubLink: "", folderPath: "/var/www/auth", buildCommand: "npm install && npm run build", startCommand: "node dist/auth.js" },
    { id: "p4", name: "DATABASE POSTGRES", port: "5432", status: "RUNNING", cpu: 0.8, ram: 512, storage: 14200, deployMethod: "folder", githubLink: "", folderPath: "C:\\postgres\\data", buildCommand: "", startCommand: "pg_ctl start" },
    { id: "p5", name: "PAYMENT SYSTEM", port: "3002", status: "STOPPED", cpu: 0, ram: 0, storage: 350, deployMethod: "github", githubLink: "https://github.com/payments/processor.git", folderPath: "", buildCommand: "pip install -r requirements.txt", startCommand: "python app.py" }
  ]);

  // States for Deploy Modal
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectPort, setProjectPort] = useState("");
  const [deployMethod, setDeployMethod] = useState<"github" | "folder">("github");
  const [githubLink, setGithubLink] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [buildCommand, setBuildCommand] = useState("npm install && npm run build");
  const [startCommand, setStartCommand] = useState("npm run start");
  const [deployStep, setDeployStep] = useState<"form" | "logs">("form");
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [isDeployLogsFinished, setIsDeployLogsFinished] = useState(false);
  const [uploadType, setUploadType] = useState<"path" | "upload">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isDeployMinimized, setIsDeployMinimized] = useState(false);
  const [isDeployMaximized, setIsDeployMaximized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  // States for Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPort, setEditPort] = useState("");
  const [editMethod, setEditMethod] = useState<"github" | "folder">("github");
  const [editGithubLink, setEditGithubLink] = useState("");
  const [editFolderPath, setEditFolderPath] = useState("");
  const [editBuildCommand, setEditBuildCommand] = useState("");
  const [editStartCommand, setEditStartCommand] = useState("");

  // States for Logs Modal
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [loggingProject, setLoggingProject] = useState<any>(null);

  // Stats
  const totalProjects = projects.length;
  const runningProjects = projects.filter(p => p.status === "RUNNING").length;
  const stoppedProjects = projects.filter(p => p.status === "STOPPED").length;

  // Real-time CPU/RAM simulation for running services
  useEffect(() => {
    const timer = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.status === "RUNNING") {
          const deltaCpu = (Math.random() * 2 - 1);
          const nextCpu = Math.max(0.1, parseFloat((p.cpu + deltaCpu).toFixed(1)));
          const deltaRam = Math.floor(Math.random() * 11 - 5);
          const nextRam = Math.max(16, p.ram + deltaRam);
          return { ...p, cpu: nextCpu, ram: nextRam };
        }
        return p;
      }));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleToggleStatus = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === "RUNNING" ? "STOPPED" : "RUNNING";
        return {
          ...p,
          status: nextStatus,
          cpu: nextStatus === "RUNNING" ? parseFloat((Math.random() * 5 + 1).toFixed(1)) : 0,
          ram: nextStatus === "RUNNING" ? Math.floor(Math.random() * 200 + 64) : 0
        };
      }
      return p;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        path: f.webkitRelativePath || f.name
      }));
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (!items) return;

    const filesArray: any[] = [];

    const traverseFileTree = async (entry: any, path = "") => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          entry.file(resolve, reject);
        });
        filesArray.push({
          name: file.name,
          size: file.size,
          path: path + file.name
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readEntries = async () => {
          return new Promise<any[]>((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });
        };

        let entries = await readEntries();
        let allEntries = [...entries];
        while (entries.length > 0) {
          entries = await readEntries();
          if (entries.length > 0) {
            allEntries = [...allEntries, ...entries];
          }
        }

        for (const childEntry of allEntries) {
          await traverseFileTree(childEntry, path + entry.name + "/");
        }
      }
    };

    const promises: Promise<void>[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
        if (entry) {
          promises.push(traverseFileTree(entry));
        }
      }
    }

    try {
      await Promise.all(promises);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    } catch (err) {
      console.error("Error reading dropped files/folders", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectPort) return;

    if (deployMethod === "folder" && uploadType === "upload" && uploadedFiles.length === 0) {
      alert("Please select at least one file or folder to upload!");
      return;
    }

    setDeployStep("logs");
    setDeployLogs([]);
    setIsDeployLogsFinished(false);

    const newProj = {
      id: `p-${Date.now()}`,
      name: projectName.toUpperCase(),
      port: projectPort,
      status: "RUNNING",
      cpu: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      ram: Math.floor(Math.random() * 150 + 64),
      storage: Math.floor(Math.random() * 500 + 100),
      deployMethod,
      githubLink: deployMethod === "github" ? githubLink : "",
      folderPath: deployMethod === "folder" ? (uploadType === "path" ? folderPath : `[UPLOADED: ${uploadedFiles.length} items]`) : "",
      buildCommand,
      startCommand
    };

    setProjects(prev => [...prev, newProj]);

    const logSequence = [
      `[NDELOK-DEPLOY] 01:32:45 - Initializing deployment sequence for "${projectName.toUpperCase()}"...`,
      deployMethod === "github" 
        ? `[NDELOK-DEPLOY] 01:32:46 - Import method: GITHUB REPOSITORY (${githubLink})`
        : uploadType === "upload"
          ? `[NDELOK-DEPLOY] 01:32:46 - Import method: LOCAL FILES UPLOAD (${uploadedFiles.length} files selected)`
          : `[NDELOK-DEPLOY] 01:32:46 - Import method: LOCAL FILE FOLDER PATH (${folderPath})`,
      
      deployMethod === "github"
        ? `[NDELOK-DEPLOY] 01:32:47 - Pulling codebase source files from GitHub...`
        : uploadType === "upload"
          ? `[NDELOK-DEPLOY] 01:32:47 - Uploading files to server path: /var/ndelok/uploads/${projectName.toUpperCase()}...`
          : `[NDELOK-DEPLOY] 01:32:47 - Verifying local directory path exists...`,

      uploadType === "upload" && deployMethod === "folder"
        ? `[NDELOK-DEPLOY] 01:32:48 - Upload completed. Stored ${uploadedFiles.length} items (${(uploadedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB) on server.`
        : `[NDELOK-DEPLOY] 01:32:48 - Source codebase validation completed successfully.`,

      `[NDELOK-DEPLOY] 01:32:49 - Executing build install command: "${buildCommand || "N/A"}"`,
      `[NDELOK-DEPLOY] 01:32:50 - Build command completed successfully. 0 errors, 2 warnings.`,
      `[NDELOK-DEPLOY] 01:32:51 - Spawning daemon start sequence command: "${startCommand}"`,
      `[NDELOK-DEPLOY] 01:32:52 - Service is online and successfully bound to port/domain ${projectPort}!`,
      `[SUCCESS] 01:32:52 - Deployment completed. Service is fully operational.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logSequence.length) {
        const nextLine = logSequence[currentLogIndex];
        setDeployLogs(prev => [...prev, nextLine]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsDeployLogsFinished(true);
      }
    }, 600);
  };

  const handleOpenEdit = (proj: any) => {
    setEditingId(proj.id);
    setEditName(proj.name);
    setEditPort(proj.port);
    setEditMethod(proj.deployMethod || "github");
    setEditGithubLink(proj.githubLink || "");
    setEditFolderPath(proj.folderPath || "");
    setEditBuildCommand(proj.buildCommand || "");
    setEditStartCommand(proj.startCommand || "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName || !editPort) return;
    setProjects(prev => prev.map(p => {
      if (p.id === editingId) {
        return {
          ...p,
          name: editName.toUpperCase(),
          port: editPort,
          deployMethod: editMethod,
          githubLink: editMethod === "github" ? editGithubLink : "",
          folderPath: editMethod === "folder" ? editFolderPath : "",
          buildCommand: editBuildCommand,
          startCommand: editStartCommand
        };
      }
      return p;
    }));
    setIsEditOpen(false);
    setEditingId(null);
  };

  const handleOpenLogs = (proj: any) => {
    setLoggingProject(proj);
    setIsLogsOpen(true);
  };

  // Styles
  const overlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(2px)",
    zIndex: 999
  };

  const modalStyle = {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "460px",
    maxWidth: "95%",
    maxHeight: "85vh",
    overflowY: "auto" as const,
    backgroundColor: "white",
    border: "3px solid black",
    boxShadow: "8px 8px 0px black",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column" as const
  };

  const titleBarStyle = {
    borderBottom: "3px solid black",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const closeBtnStyle = {
    width: "20px",
    height: "20px",
    border: "1.5px solid black",
    backgroundColor: "#fecaca",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "1px 1px 0px black"
  };

  const inputContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px"
  };

  const inputStyle = {
    border: "3px solid black",
    padding: "8px 12px",
    outline: "none",
    boxShadow: "3px 3px 0px black",
    fontSize: "0.85rem",
    fontWeight: 700,
    backgroundColor: "#f8fafc"
  };

  const modalCancelStyle = {
    padding: "6px 12px",
    fontSize: "0.75rem",
    backgroundColor: "white",
    boxShadow: "3px 3px 0px black"
  };

  const modalSaveStyle = {
    padding: "6px 12px",
    fontSize: "0.75rem",
    backgroundColor: "var(--system-green)",
    boxShadow: "3px 3px 0px black"
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>DEPLOY SERVICES</h2>
        <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-xs)" }}>
          Manage production servers, containers, port binding, and virtualized workloads.
        </p>
      </header>

      {/* Deploy Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "var(--space-md)",
        marginBottom: "var(--space-lg)"
      }}>
        {/* Total Project Card */}
        <div className="card" style={{ backgroundColor: "var(--system-blue)", display: "flex", flexDirection: "column", padding: "var(--space-sm) var(--space-md)" }}>
          <span className="font-heading" style={{ fontSize: "0.75rem", color: "black", fontWeight: 700 }}>TOTAL PROJECTS</span>
          <span className="font-display" style={{ fontSize: "2.8rem", lineHeight: "1" }}>{totalProjects}</span>
        </div>
        
        {/* Running Card */}
        <div className="card" style={{ backgroundColor: "var(--system-green)", display: "flex", flexDirection: "column", padding: "var(--space-sm) var(--space-md)" }}>
          <span className="font-heading" style={{ fontSize: "0.75rem", color: "black", fontWeight: 700 }}>RUNNING</span>
          <span className="font-display" style={{ fontSize: "2.8rem", lineHeight: "1" }}>{runningProjects}</span>
        </div>

        {/* Stopped Card */}
        <div className="card" style={{ backgroundColor: "var(--system-red)", display: "flex", flexDirection: "column", padding: "var(--space-sm) var(--space-md)" }}>
          <span className="font-heading" style={{ fontSize: "0.75rem", color: "black", fontWeight: 700 }}>STOPPED</span>
          <span className="font-display" style={{ fontSize: "2.8rem", lineHeight: "1" }}>{stoppedProjects}</span>
        </div>
      </div>

      {/* Deployed Projects List Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
        <h3 className="font-heading" style={{ fontSize: "1.4rem" }}>DEPLOYED APPLICATIONS</h3>
        <button 
          className="btn" 
          onClick={() => setIsDeployOpen(true)}
          style={{ 
            backgroundColor: "var(--system-yellow)", 
            padding: "6px 12px", 
            fontSize: "0.75rem",
            boxShadow: "3px 3px 0px black" 
          }}
        >
          + NEW DEPLOYMENT
        </button>
      </div>

      {/* Projects Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "var(--space-md)" 
      }}>
        {projects.map(proj => (
          <div key={proj.id} className="card" style={{ 
            backgroundColor: "white", 
            padding: 0, 
            display: "flex", 
            flexDirection: "column",
            minHeight: "230px",
            overflow: "hidden"
          }}>
            {/* Top Indicator bar */}
            <div style={{ 
              backgroundColor: proj.status === "RUNNING" ? "var(--system-green)" : "var(--system-red)", 
              borderBottom: "3px solid black", 
              padding: "6px var(--space-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span className="font-mono" style={{ fontSize: "0.6rem", fontWeight: 700, backgroundColor: "white", padding: "1px 4px", border: "1.5px solid black" }}>
                BIND: {proj.port}
              </span>
              <span className="badge" style={{ 
                backgroundColor: "black", 
                color: proj.status === "RUNNING" ? "var(--system-green)" : "var(--system-red)",
                borderColor: "black",
                fontSize: "0.6rem",
                padding: "0px 3px"
              }}>
                {proj.status}
              </span>
            </div>

            {/* Content Body */}
            <div style={{ padding: "var(--space-sm)", flex: 1, display: "flex", flexDirection: "column" }}>
              <h4 className="font-heading" style={{ fontSize: "0.95rem", marginBottom: "var(--space-xs)", color: "black", display: "flex", alignItems: "center", gap: "6px" }}>
                {proj.name}
                {proj.deployMethod === "github" ? (
                  <span className="badge" style={{ fontSize: "0.5rem", padding: "0px 3px", backgroundColor: "var(--system-blue)", color: "black", borderColor: "black" }} title={proj.githubLink}>GH</span>
                ) : (
                  <span className="badge" style={{ fontSize: "0.5rem", padding: "0px 3px", backgroundColor: "#cbd5e1", color: "black", borderColor: "black" }} title={proj.folderPath}>DIR</span>
                )}
              </h4>
              
              {/* Specs info grid */}
              <div style={{ 
                border: "2px solid black", 
                backgroundColor: "var(--secondary-bg)", 
                padding: "4px 6px", 
                display: "flex", 
                flexDirection: "column",
                gap: "2px",
                marginTop: "auto"
              }} className="font-mono">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}>
                  <span>CPU USED:</span>
                  <span style={{ fontWeight: 700 }}>{proj.cpu}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}>
                  <span>RAM USED:</span>
                  <span style={{ fontWeight: 700 }}>{proj.ram} MB</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}>
                  <span>DISK USED:</span>
                  <span style={{ fontWeight: 700 }}>
                    {proj.storage >= 1000 ? `${(proj.storage / 1000).toFixed(1)} GB` : `${proj.storage} MB`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div style={{ 
              borderTop: "3px solid black", 
              padding: "4px 8px", 
              backgroundColor: "var(--secondary-bg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              {/* Stop/Start toggle button */}
              <button 
                className="btn"
                onClick={() => handleToggleStatus(proj.id)}
                style={{ 
                  padding: "2px 6px", 
                  fontSize: "0.65rem", 
                  boxShadow: "1.5px 1.5px 0px black",
                  backgroundColor: proj.status === "RUNNING" ? "var(--system-red)" : "var(--system-green)",
                  color: "black",
                  fontWeight: 700
                }}
              >
                {proj.status === "RUNNING" ? "STOP" : "START"}
              </button>

              {/* Edit, logs, delete action buttons */}
              <div style={{ display: "flex", gap: "4px" }}>
                <button 
                  className="btn"
                  onClick={() => handleOpenEdit(proj)}
                  style={{ 
                    padding: "2px 5px", 
                    fontSize: "0.6rem", 
                    boxShadow: "1px 1px 0px black",
                    backgroundColor: "white",
                    color: "black"
                  }}
                >
                  EDIT
                </button>
                <button 
                  className="btn"
                  onClick={() => handleOpenLogs(proj)}
                  style={{ 
                    padding: "2px 5px", 
                    fontSize: "0.6rem", 
                    boxShadow: "1px 1px 0px black",
                    backgroundColor: "black",
                    color: "white"
                  }}
                >
                  LOGS
                </button>
                <button 
                  className="btn"
                  onClick={() => handleDelete(proj.id)}
                  style={{ 
                    padding: "2px 5px", 
                    fontSize: "0.6rem", 
                    boxShadow: "1px 1px 0px black",
                    backgroundColor: "var(--system-red)",
                    color: "black"
                  }}
                >
                  DEL
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy Modal */}
      {isDeployOpen && (() => {
        const deployModalStyle = isDeployMaximized
          ? {
              position: "fixed" as const,
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "white",
              border: "3px solid black",
              boxShadow: "none",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column" as const,
              transition: "all 0.15s ease-out"
            }
          : isDeployMinimized
            ? {
                position: "fixed" as const,
                bottom: "20px",
                right: "20px",
                width: "320px",
                backgroundColor: "white",
                border: "3px solid black",
                boxShadow: "4px 4px 0px black",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column" as const,
                transition: "all 0.15s ease-out"
              }
            : {
                ...modalStyle,
                transition: "all 0.15s ease-out"
              };
        return (
          <>
            {!isDeployMinimized && !isDeployMaximized && (
              <div onClick={() => { if (deployStep === "form") setIsDeployOpen(false); }} style={overlayStyle} />
            )}
            <div style={deployModalStyle}>
              <div style={{ ...titleBarStyle, backgroundColor: "var(--system-yellow)", cursor: "default" }}>
                <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                  {deployStep === "form" ? "DEPLOY NEW SERVICE" : "DEPLOYMENT LOGS"}
                </span>
                
                {/* Window Controls */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {/* Minimize Button */}
                  <button 
                    type="button"
                    onClick={() => setIsDeployMinimized(!isDeployMinimized)}
                    title="Minimize"
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "1.5px solid black",
                      backgroundColor: "#fef08a",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      boxShadow: "1px 1px 0px black"
                    }}
                  >
                    –
                  </button>
                  {/* Maximize Button */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsDeployMaximized(!isDeployMaximized);
                      setIsDeployMinimized(false);
                    }}
                    title={isDeployMaximized ? "Restore Down" : "Maximize"}
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "1.5px solid black",
                      backgroundColor: "#bbf7d0",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      boxShadow: "1px 1px 0px black"
                    }}
                  >
                    {isDeployMaximized ? "❐" : "⬜"}
                  </button>
                  {/* Close Button */}
                  <button 
                    type="button"
                    disabled={deployStep === "logs" && !isDeployLogsFinished}
                    onClick={() => {
                      // Reset and close
                      setProjectName("");
                      setProjectPort("");
                      setGithubLink("");
                      setFolderPath("");
                      setBuildCommand("npm install && npm run build");
                      setStartCommand("npm run start");
                      setDeployStep("form");
                      setUploadedFiles([]);
                      setUploadType("upload");
                      setIsDeployOpen(false);
                      setIsDeployMinimized(false);
                      setIsDeployMaximized(false);
                    }}
                    title="Close"
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "1.5px solid black",
                      backgroundColor: (deployStep === "logs" && !isDeployLogsFinished) ? "#cbd5e1" : "#fecaca",
                      cursor: (deployStep === "logs" && !isDeployLogsFinished) ? "not-allowed" : "pointer",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      boxShadow: "1px 1px 0px black",
                      opacity: (deployStep === "logs" && !isDeployLogsFinished) ? 0.5 : 1
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!isDeployMinimized && (
                <>

            {deployStep === "form" ? (
              <form onSubmit={handleDeploy} style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {/* Project Name */}
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>PROJECT NAME:</label>
                  <input 
                    type="text" 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    placeholder="e.g. BACKEND APIS" 
                    required
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>

                {/* Port / Domain Form */}
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>PORT / DOMAIN:</label>
                  <input 
                    type="text" 
                    value={projectPort} 
                    onChange={(e) => setProjectPort(e.target.value)} 
                    placeholder="e.g. 5000 or my-app.ndelok.me" 
                    required
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>

                {/* Toggle Source Method */}
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>IMPORT METHOD:</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      type="button"
                      className="btn" 
                      onClick={() => setDeployMethod("github")}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: "0.7rem",
                        backgroundColor: deployMethod === "github" ? "var(--system-blue)" : "white",
                        boxShadow: deployMethod === "github" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                        transform: deployMethod === "github" ? "translate(1px, 1px)" : "none"
                      }}
                    >
                      GITHUB REPO
                    </button>
                    <button 
                      type="button"
                      className="btn" 
                      onClick={() => setDeployMethod("folder")}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: "0.7rem",
                        backgroundColor: deployMethod === "folder" ? "var(--system-blue)" : "white",
                        boxShadow: deployMethod === "folder" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                        transform: deployMethod === "folder" ? "translate(1px, 1px)" : "none"
                      }}
                    >
                      LOCAL FOLDER
                    </button>
                  </div>
                </div>

                {/* Github Link / Folder path conditionally */}
                {deployMethod === "github" ? (
                  <div style={inputContainerStyle}>
                    <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>GITHUB SOURCE LINK:</label>
                    <input 
                      type="text" 
                      value={githubLink} 
                      onChange={(e) => setGithubLink(e.target.value)} 
                      placeholder="e.g. https://github.com/username/project.git" 
                      required={deployMethod === "github"}
                      className="font-mono"
                      style={inputStyle}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={inputContainerStyle}>
                      <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>IMPORT TYPE:</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          type="button"
                          className="btn" 
                          onClick={() => setUploadType("upload")}
                          style={{
                            flex: 1,
                            padding: "6px",
                            fontSize: "0.7rem",
                            backgroundColor: uploadType === "upload" ? "var(--system-blue)" : "white",
                            boxShadow: uploadType === "upload" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                            transform: uploadType === "upload" ? "translate(1px, 1px)" : "none"
                          }}
                        >
                          UPLOAD FILES/FOLDER
                        </button>
                        <button 
                          type="button"
                          className="btn" 
                          onClick={() => setUploadType("path")}
                          style={{
                            flex: 1,
                            padding: "6px",
                            fontSize: "0.7rem",
                            backgroundColor: uploadType === "path" ? "var(--system-blue)" : "white",
                            boxShadow: uploadType === "path" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                            transform: uploadType === "path" ? "translate(1px, 1px)" : "none"
                          }}
                        >
                          MANUAL PATH ON SERVER
                        </button>
                      </div>
                    </div>

                    {uploadType === "path" ? (
                      <div style={inputContainerStyle}>
                        <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>LOCAL FILE FOLDER PATH:</label>
                        <input 
                          type="text" 
                          value={folderPath} 
                          onChange={(e) => setFolderPath(e.target.value)} 
                          placeholder="e.g. C:\projects\my-app or /var/www/my-app" 
                          required={deployMethod === "folder" && uploadType === "path"}
                          className="font-mono"
                          style={inputStyle}
                        />
                      </div>
                    ) : (
                      <div style={inputContainerStyle}>
                        <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>UPLOAD FILES / FOLDER:</label>
                        <div 
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          style={{
                            border: "3px dashed black",
                            padding: "16px",
                            backgroundColor: "#f8fafc",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            boxShadow: "3px 3px 0px black",
                          }}
                        >
                          <span className="font-mono" style={{ fontSize: "0.75rem", color: "#475569" }}>
                            Drag & Drop your files/folder here, or
                          </span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.65rem",
                                backgroundColor: "var(--system-yellow)",
                                boxShadow: "2px 2px 0px black"
                              }}
                            >
                              SELECT FILES
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => folderInputRef.current?.click()}
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.65rem",
                                backgroundColor: "var(--system-yellow)",
                                boxShadow: "2px 2px 0px black"
                              }}
                            >
                              SELECT FOLDER
                            </button>
                          </div>
                          
                          <input 
                            type="file" 
                            multiple 
                            style={{ display: "none" }} 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                          />
                          <input 
                            type="file" 
                            multiple 
                            {...{ webkitdirectory: "", directory: "" } as any}
                            style={{ display: "none" }} 
                            ref={folderInputRef} 
                            onChange={handleFileChange} 
                          />
                        </div>

                        {/* Selected Files Preview List */}
                        <div style={{ marginTop: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                              SELECTED ITEMS ({uploadedFiles.length}):
                            </span>
                            {uploadedFiles.length > 0 && (
                              <button
                                type="button"
                                className="btn"
                                onClick={() => setUploadedFiles([])}
                                style={{
                                  padding: "2px 6px",
                                  fontSize: "0.6rem",
                                  backgroundColor: "#fecaca",
                                  boxShadow: "1.5px 1.5px 0px black"
                                }}
                              >
                                CLEAR ALL
                              </button>
                            )}
                          </div>
                          
                          <div className="font-mono" style={{
                            maxHeight: "100px",
                            overflowY: "auto",
                            border: "2.5px solid black",
                            backgroundColor: "#1e293b",
                            color: "#f8fafc",
                            padding: "6px",
                            fontSize: "0.65rem",
                            lineHeight: 1.3
                          }}>
                            {uploadedFiles.length === 0 ? (
                              <div style={{ color: "#94a3b8", textAlign: "center", padding: "8px" }}>
                                No files or folders selected.
                              </div>
                            ) : (
                              uploadedFiles.map((file, idx) => (
                                <div key={idx} style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  borderBottom: idx < uploadedFiles.length - 1 ? "1px solid #334155" : "none",
                                  padding: "2px 0",
                                  gap: "10px"
                                }}>
                                  <span style={{ 
                                    textOverflow: "ellipsis", 
                                    overflow: "hidden", 
                                    whiteSpace: "nowrap",
                                    flex: 1 
                                  }} title={file.path}>
                                    {file.path}
                                  </span>
                                  <span style={{ color: "#38bdf8", flexShrink: 0 }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Build install execution form */}
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>BUILD INSTALL EXECUTION COMMAND:</label>
                  <input 
                    type="text" 
                    value={buildCommand} 
                    onChange={(e) => setBuildCommand(e.target.value)} 
                    placeholder="e.g. npm install && npm run build" 
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>

                {/* Daemon start sequence form */}
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>DAEMON START SEQUENCE COMMAND:</label>
                  <input 
                    type="text" 
                    value={startCommand} 
                    onChange={(e) => setStartCommand(e.target.value)} 
                    placeholder="e.g. npm run start or pm2 start app.js" 
                    required
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>

                {/* Modal Buttons */}
                <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", marginTop: "var(--space-xs)" }}>
                  <button type="button" className="btn" onClick={() => setIsDeployOpen(false)} style={modalCancelStyle}>CANCEL</button>
                  <button type="submit" className="btn" style={modalSaveStyle}>DEPLOY SERVICE</button>
                </div>
              </form>
            ) : (
              <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div>
                  <h4 className="font-heading" style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                    DEPLOYING: {projectName.toUpperCase()}
                  </h4>
                  <p style={{ fontSize: "0.72rem", color: "#475569" }}>
                    Please wait while the server runs the install execution commands and binds the ports.
                  </p>
                </div>

                {/* Monospace terminal logs */}
                <div className="font-mono" style={{ 
                  backgroundColor: "#000000", 
                  color: "#22c55e", 
                  padding: "12px", 
                  fontSize: "0.7rem", 
                  height: "220px", 
                  overflowY: "auto",
                  border: "2px solid black",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap"
                }}>
                  {deployLogs.join("\n")}
                  {!isDeployLogsFinished && (
                    <span style={{ 
                      display: "inline-block", 
                      width: "8px", 
                      height: "12px", 
                      backgroundColor: "#22c55e", 
                      marginLeft: "4px",
                      animation: "blink 1s infinite" 
                    }}></span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    className="btn" 
                    disabled={!isDeployLogsFinished}
                    onClick={() => {
                      // Reset and close
                      setProjectName("");
                      setProjectPort("");
                      setGithubLink("");
                      setFolderPath("");
                      setBuildCommand("npm install && npm run build");
                      setStartCommand("npm run start");
                      setDeployStep("form");
                      setUploadedFiles([]);
                      setUploadType("upload");
                      setIsDeployOpen(false);
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      backgroundColor: isDeployLogsFinished ? "var(--system-green)" : "#e2e8f0",
                      cursor: isDeployLogsFinished ? "pointer" : "not-allowed",
                      boxShadow: "3px 3px 0px black",
                      opacity: isDeployLogsFinished ? 1 : 0.6
                    }}
                  >
                    {isDeployLogsFinished ? "FINISH & DONE" : "DEPLOYING SERVICE..."}
                  </button>
                </div>
              </div>
            )}
                </>
              )}
            </div>
          </>
        );
      })()}

      {/* Edit Modal */}
      {isEditOpen && (
        <>
          <div onClick={() => setIsEditOpen(false)} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ ...titleBarStyle, backgroundColor: "var(--system-blue)" }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                EDIT SERVICE DETAILS
              </span>
              <button onClick={() => setIsEditOpen(false)} style={closeBtnStyle}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {/* Project Name */}
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>PROJECT NAME:</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required
                  className="font-mono"
                  style={inputStyle}
                />
              </div>

              {/* Port / Domain */}
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>PORT / DOMAIN:</label>
                <input 
                  type="text" 
                  value={editPort} 
                  onChange={(e) => setEditPort(e.target.value)} 
                  required
                  className="font-mono"
                  style={inputStyle}
                />
              </div>

              {/* Toggle Source Method */}
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>IMPORT METHOD:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => setEditMethod("github")}
                    style={{
                      flex: 1,
                      padding: "6px",
                      fontSize: "0.7rem",
                      backgroundColor: editMethod === "github" ? "var(--system-blue)" : "white",
                      boxShadow: editMethod === "github" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                      transform: editMethod === "github" ? "translate(1px, 1px)" : "none"
                    }}
                  >
                    GITHUB REPO
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => setEditMethod("folder")}
                    style={{
                      flex: 1,
                      padding: "6px",
                      fontSize: "0.7rem",
                      backgroundColor: editMethod === "folder" ? "var(--system-blue)" : "white",
                      boxShadow: editMethod === "folder" ? "var(--shadow-active)" : "2.5px 2.5px 0px black",
                      transform: editMethod === "folder" ? "translate(1px, 1px)" : "none"
                    }}
                  >
                    LOCAL FOLDER
                  </button>
                </div>
              </div>

              {/* Github Link / Folder path conditionally */}
              {editMethod === "github" ? (
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>GITHUB SOURCE LINK:</label>
                  <input 
                    type="text" 
                    value={editGithubLink} 
                    onChange={(e) => setEditGithubLink(e.target.value)} 
                    placeholder="e.g. https://github.com/username/project.git" 
                    required={editMethod === "github"}
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div style={inputContainerStyle}>
                  <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>LOCAL FILE FOLDER PATH:</label>
                  <input 
                    type="text" 
                    value={editFolderPath} 
                    onChange={(e) => setEditFolderPath(e.target.value)} 
                    placeholder="e.g. C:\projects\my-app" 
                    required={editMethod === "folder"}
                    className="font-mono"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Build install execution form */}
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>BUILD INSTALL EXECUTION COMMAND:</label>
                <input 
                  type="text" 
                  value={editBuildCommand} 
                  onChange={(e) => setEditBuildCommand(e.target.value)} 
                  className="font-mono"
                  style={inputStyle}
                />
              </div>

              {/* Daemon start sequence form */}
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>DAEMON START SEQUENCE COMMAND:</label>
                <input 
                  type="text" 
                  value={editStartCommand} 
                  onChange={(e) => setEditStartCommand(e.target.value)} 
                  required
                  className="font-mono"
                  style={inputStyle}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", marginTop: "var(--space-xs)" }}>
                <button type="button" className="btn" onClick={() => setIsEditOpen(false)} style={modalCancelStyle}>CANCEL</button>
                <button type="submit" className="btn" style={modalSaveStyle}>SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Logs Modal */}
      {isLogsOpen && loggingProject && (
        <>
          <div onClick={() => setIsLogsOpen(false)} style={overlayStyle} />
          <div style={{ ...modalStyle, width: "550px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ ...titleBarStyle, backgroundColor: "black", color: "white" }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                LOGS: {loggingProject.name} (PORT {loggingProject.port})
              </span>
              <button onClick={() => setIsLogsOpen(false)} style={{ ...closeBtnStyle, color: "white", backgroundColor: "#334155" }}>✕</button>
            </div>
            <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {/* Build & Daemon configurations description */}
              <div style={{ border: "2px solid black", padding: "6px 10px", backgroundColor: "var(--secondary-bg)", fontSize: "0.65rem" }} className="font-mono">
                <div><strong>DEPLOY METHOD:</strong> {loggingProject.deployMethod?.toUpperCase() || "N/A"}</div>
                {loggingProject.deployMethod === "github" ? (
                  <div style={{ wordBreak: "break-all" }}><strong>GITHUB LINK:</strong> {loggingProject.githubLink}</div>
                ) : (
                  <div><strong>FOLDER PATH:</strong> {loggingProject.folderPath || "N/A"}</div>
                )}
                <div><strong>BUILD CMD:</strong> {loggingProject.buildCommand || "N/A"}</div>
                <div><strong>START CMD:</strong> {loggingProject.startCommand || "N/A"}</div>
              </div>

              <div className="font-mono" style={{ 
                backgroundColor: "#000000", 
                color: "#22c55e", 
                padding: "12px", 
                fontSize: "0.7rem", 
                height: "180px", 
                overflowY: "auto",
                border: "2px solid black",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap"
              }}>
                {`[SYSTEM] 2026-06-16 22:30:00 - Initializing deployment core from ${loggingProject.deployMethod}...
[SYSTEM] 2026-06-16 22:30:01 - Pulling codebase source...
[SYSTEM] 2026-06-16 22:30:02 - Executing build installer: "${loggingProject.buildCommand || "N/A"}"
[SYSTEM] 2026-06-16 22:30:03 - Starting daemon sequence: "${loggingProject.startCommand || "N/A"}"
[SYSTEM] 2026-06-16 22:30:04 - Binding service ${loggingProject.name} to port/domain ${loggingProject.port}.
${loggingProject.status === "RUNNING" ? `[INFO] 2026-06-16 22:30:05 - Connection established. Service listening on HTTP.
[METRICS] 2026-06-16 22:31:15 - CPU Load: ${loggingProject.cpu}% | RAM: ${loggingProject.ram}MB
[SYSTEM] 2026-06-16 22:35:00 - Healthcheck OK.` : `[WARN] 2026-06-16 22:31:00 - SIGTERM signal received. Stopping gracefully...
[SYSTEM] 2026-06-16 22:31:02 - Service stopped.`}`}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setIsLogsOpen(false)} style={{ ...modalCancelStyle, backgroundColor: "black", color: "white" }}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "directory";
  parentId: string | null;
  size?: number; // KB
  content?: string;
  createdAt: string;
}

function ExplorerView() {
  const [fs, setFs] = useState<FileSystemItem[]>([
    { id: "root", name: "root", type: "directory", parentId: null, createdAt: "2026-06-16 12:00:00" },
    { id: "dir-src", name: "src", type: "directory", parentId: "root", createdAt: "2026-06-16 12:05:00" },
    { id: "dir-public", name: "public", type: "directory", parentId: "root", createdAt: "2026-06-16 12:10:00" },
    { id: "file-readme", name: "README.md", type: "file", parentId: "root", size: 4, content: `# ndelok\nSistem monitoring server modern dengan antarmuka Neobrutalist.\n\n## Fitur\n- Dashboard Metrik Real-time\n- Manajer Deploy Layanan\n- File Explorer Server`, createdAt: "2026-06-16 12:00:00" },
    { id: "file-pkg", name: "package.json", type: "file", parentId: "root", size: 1, content: `{\n  "name": "ndelok",\n  "version": "0.18.0",\n  "type": "module",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}`, createdAt: "2026-06-16 12:02:00" },
    { id: "file-vite", name: "vite.config.ts", type: "file", parentId: "root", size: 2, content: `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 1234\n  }\n});`, createdAt: "2026-06-16 12:03:00" },
    
    // Inside src/
    { id: "dir-components", name: "components", type: "directory", parentId: "dir-src", createdAt: "2026-06-16 12:06:00" },
    { id: "file-app-tsx", name: "App.tsx", type: "file", parentId: "dir-src", size: 5, content: `import React, { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <h1>Ndelok Server Dashboard</h1>\n      <button onClick={() => setCount(c => c + 1)}>Counter: {count}</button>\n    </div>\n  );\n}`, createdAt: "2026-06-16 12:07:00" },
    { id: "file-main-tsx", name: "main.tsx", type: "file", parentId: "dir-src", size: 1, content: `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`, createdAt: "2026-06-16 12:08:00" },
    { id: "file-index-css", name: "index.css", type: "file", parentId: "dir-src", size: 4, content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');\nbody {\n  margin: 0;\n  font-family: 'Inter', sans-serif;\n  background-color: #f8fafc;\n}`, createdAt: "2026-06-16 12:09:00" },

    // Inside src/components
    { id: "file-header-tsx", name: "Header.tsx", type: "file", parentId: "dir-components", size: 3, content: `import React from "react";\n\nexport function Header() {\n  return (\n    <header style={{ borderBottom: "3px solid black", padding: "10px" }}>\n      <h2 style={{ margin: 0 }}>NDELOK MANAGER</h2>\n    </header>\n  );\n}`, createdAt: "2026-06-16 12:06:30" },
    { id: "file-button-tsx", name: "Button.tsx", type: "file", parentId: "dir-components", size: 2, content: `import React from "react";\n\nexport function Button({ children, onClick }: any) {\n  return (\n    <button className="btn" onClick={onClick}>\n      {children}\n    </button>\n  );\n}`, createdAt: "2026-06-16 12:06:45" },

    // Inside public/
    { id: "file-manifest", name: "manifest.json", type: "file", parentId: "dir-public", size: 1, content: `{\n  "short_name": "Ndelok",\n  "name": "Ndelok Server Dashboard Overlay",\n  "icons": [],\n  "start_url": ".",\n  "display": "standalone",\n  "theme_color": "#000000",\n  "background_color": "#ffffff"\n}`, createdAt: "2026-06-16 12:11:00" }
  ]);

  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipboard, setClipboard] = useState<{ itemId: string; action: "copy" | "cut" } | null>(null);

  // Modals for CRUD
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<"file" | "directory">("file");
  const [createName, setCreateName] = useState("");

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");

  // Editor Modal Window
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileContent, setEditingFileContent] = useState("");
  const [isEditorMinimized, setIsEditorMinimized] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  // Drag and drop highlights
  const [isDragOverPane, setIsDragOverPane] = useState(false);

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    const crumbs: FileSystemItem[] = [];
    let tempId: string | null = currentFolderId;
    while (tempId) {
      const folder = fs.find(x => x.id === tempId);
      if (folder) {
        crumbs.unshift(folder);
        tempId = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  const getRelativePath = (item: FileSystemItem): string => {
    const segments: string[] = [];
    let curr: FileSystemItem | undefined = item;
    while (curr && curr.parentId) {
      curr = fs.find(x => x.id === curr!.parentId);
      if (curr && curr.id !== "root") {
        segments.unshift(curr.name);
      }
    }
    return "/" + (segments.length > 0 ? segments.join("/") + "/" : "") + item.name;
  };

  // Navigations
  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (item.type === "directory") {
      setCurrentFolderId(item.id);
      setSelectedId(null);
      setSearchQuery("");
    } else {
      setEditingFileId(item.id);
      setEditingFileContent(item.content || "");
      setIsEditorOpen(true);
      setIsEditorMinimized(false);
      setIsEditorMaximized(false);
    }
  };

  const navigateUp = () => {
    const currentFolder = fs.find(x => x.id === currentFolderId);
    if (currentFolder && currentFolder.parentId) {
      setCurrentFolderId(currentFolder.parentId);
      setSelectedId(null);
    }
  };

  // CRUD Actions
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    // Check collision in target folder
    const collision = fs.some(x => x.parentId === currentFolderId && x.name.toLowerCase() === createName.trim().toLowerCase());
    if (collision) {
      alert(`An item named "${createName.trim()}" already exists in this folder.`);
      return;
    }

    const newId = `${createType === "directory" ? "dir" : "file"}-${Date.now()}`;
    const newItem: FileSystemItem = {
      id: newId,
      name: createName.trim(),
      type: createType,
      parentId: currentFolderId,
      size: createType === "file" ? 0 : undefined,
      content: createType === "file" ? "" : undefined,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " ")
    };

    setFs(prev => [...prev, newItem]);
    setIsCreateOpen(false);
    setCreateName("");
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameName.trim() || !selectedId) return;

    const target = fs.find(x => x.id === selectedId);
    if (!target) return;

    const collision = fs.some(x => x.parentId === target.parentId && x.name.toLowerCase() === renameName.trim().toLowerCase() && x.id !== selectedId);
    if (collision) {
      alert(`An item named "${renameName.trim()}" already exists in this folder.`);
      return;
    }

    setFs(prev => prev.map(x => x.id === selectedId ? { ...x, name: renameName.trim() } : x));
    setIsRenameOpen(false);
    setRenameName("");
  };

  const handleDelete = () => {
    if (!selectedId || selectedId === "root") return;
    const targetItem = fs.find(x => x.id === selectedId);
    if (!targetItem) return;

    if (window.confirm(`Are you sure you want to delete "${targetItem.name}"?`)) {
      const getDescendantIds = (id: string): string[] => {
        const children = fs.filter(x => x.parentId === id);
        let result = [id];
        for (const child of children) {
          result = [...result, ...getDescendantIds(child.id)];
        }
        return result;
      };

      const idsToRemove = targetItem.type === "directory" ? getDescendantIds(selectedId) : [selectedId];
      setFs(prev => prev.filter(x => !idsToRemove.includes(x.id)));
      setSelectedId(null);
    }
  };

  const handleOpenRename = () => {
    if (!selectedId || selectedId === "root") return;
    const target = fs.find(x => x.id === selectedId);
    if (target) {
      setRenameName(target.name);
      setIsRenameOpen(true);
    }
  };

  // Clipboard operations
  const handleCopy = () => {
    if (selectedId && selectedId !== "root") {
      setClipboard({ itemId: selectedId, action: "copy" });
    }
  };

  const handleCut = () => {
    if (selectedId && selectedId !== "root") {
      setClipboard({ itemId: selectedId, action: "cut" });
    }
  };

  const handlePaste = () => {
    if (!clipboard) return;
    const targetItem = fs.find(item => item.id === clipboard.itemId);
    if (!targetItem) return;

    if (clipboard.action === "cut") {
      // Prevent nesting cycle
      let temp: string | null = currentFolderId;
      let cycle = false;
      while (temp) {
        if (temp === clipboard.itemId) {
          cycle = true;
          break;
        }
        const parent = fs.find(x => x.id === temp);
        temp = parent ? parent.parentId : null;
      }
      if (cycle) {
        alert("Cannot paste a folder inside itself or its children!");
        return;
      }

      // Check collision
      const collision = fs.some(x => x.parentId === currentFolderId && x.name.toLowerCase() === targetItem.name.toLowerCase() && x.id !== targetItem.id);
      if (collision) {
        alert(`An item named "${targetItem.name}" already exists in the destination folder.`);
        return;
      }

      setFs(prev => prev.map(x => x.id === clipboard.itemId ? { ...x, parentId: currentFolderId } : x));
      setClipboard(null);
    } else {
      // Recursive copy
      const duplicateItemRecursive = (itemId: string, newParentId: string | null, newName?: string): FileSystemItem[] => {
        const itemToCopy = fs.find(x => x.id === itemId);
        if (!itemToCopy) return [];

        const nextId = `${itemToCopy.type === "directory" ? "dir" : "file"}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const finalName = newName || itemToCopy.name;

        const currentCopy: FileSystemItem = {
          ...itemToCopy,
          id: nextId,
          parentId: newParentId,
          name: finalName,
          createdAt: new Date().toISOString().slice(0, 19).replace("T", " ")
        };

        let result = [currentCopy];
        if (itemToCopy.type === "directory") {
          const children = fs.filter(x => x.parentId === itemId);
          for (const child of children) {
            const childCopies = duplicateItemRecursive(child.id, nextId);
            result = [...result, ...childCopies];
          }
        }
        return result;
      };

      // Collision handling
      let finalName = targetItem.name;
      let counter = 1;
      while (fs.some(x => x.parentId === currentFolderId && x.name.toLowerCase() === finalName.toLowerCase())) {
        const extIndex = targetItem.name.lastIndexOf(".");
        if (targetItem.type === "file" && extIndex !== -1) {
          const base = targetItem.name.substring(0, extIndex);
          const ext = targetItem.name.substring(extIndex);
          finalName = `${base} - Copy (${counter})${ext}`;
        } else {
          finalName = `${targetItem.name} - Copy (${counter})`;
        }
        counter++;
      }

      const copies = duplicateItemRecursive(clipboard.itemId, currentFolderId, finalName);
      setFs(prev => [...prev, ...copies]);
    }
  };

  const handleSaveFileContent = () => {
    if (!editingFileId) return;
    setFs(prev => prev.map(x => x.id === editingFileId ? { ...x, content: editingFileContent, size: parseFloat((editingFileContent.length / 1024).toFixed(2)) } : x));
    setIsEditorOpen(false);
    setEditingFileId(null);
  };

  // Drag and drop files upload simulation
  const handlePaneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPane(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const newItems: FileSystemItem[] = filesArray.map((f, i) => ({
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        type: "file",
        parentId: currentFolderId,
        size: parseFloat((f.size / 1024).toFixed(2)),
        content: `// Uploaded mock file: ${f.name}\n// Size: ${f.size} bytes`,
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " ")
      }));
      setFs(prev => [...prev, ...newItems]);
    }
  };

  // Selection list calculation
  const currentItems = fs.filter(item => item.parentId === currentFolderId);
  const filteredItems = searchQuery.trim() !== ""
    ? fs.filter(item => item.id !== "root" && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentItems;

  const selectedItem = fs.find(x => x.id === selectedId);

  // Styles
  const layoutStyle = {
    display: "flex",
    gap: "var(--space-md)",
    marginTop: "var(--space-md)"
  };

  const leftPaneStyle = {
    flex: "0 0 200px",
    backgroundColor: "white",
    border: "3px solid black",
    boxShadow: "4px 4px 0px black",
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px"
  };

  const rightPaneStyle = {
    flex: 1,
    backgroundColor: "white",
    border: "3px solid black",
    boxShadow: "8px 8px 0px black",
    padding: "var(--space-md)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "var(--space-md)",
    minHeight: "480px"
  };

  const toolbarStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const
  };

  const breadcrumbsContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "3px solid black",
    padding: "6px 12px",
    backgroundColor: "#f8fafc",
    fontSize: "0.75rem",
    boxShadow: "3px 3px 0px black",
    flexWrap: "wrap" as const
  };

  const searchInputStyle = {
    border: "3px solid black",
    padding: "6px 10px",
    fontSize: "0.75rem",
    outline: "none",
    boxShadow: "3px 3px 0px black",
    width: "100%",
    backgroundColor: "#f8fafc"
  };

  const pathShortcutStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    border: "2px solid black",
    boxShadow: active ? "1px 1px 0px black" : "3px 3px 0px black",
    backgroundColor: active ? "var(--system-blue)" : "white",
    transform: active ? "translate(1px, 1px)" : "none",
    fontSize: "0.7rem",
    fontWeight: 700,
    cursor: "pointer"
  });

  // Modal styles reuse
  const overlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(2px)",
    zIndex: 999
  };

  const modalStyle = {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "380px",
    maxWidth: "95%",
    backgroundColor: "white",
    border: "3px solid black",
    boxShadow: "8px 8px 0px black",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column" as const
  };

  const titleBarStyle = {
    borderBottom: "3px solid black",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  const closeBtnStyle = {
    width: "20px",
    height: "20px",
    border: "1.5px solid black",
    backgroundColor: "#fecaca",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "1px 1px 0px black"
  };

  const inputContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px"
  };

  const inputStyle = {
    border: "3px solid black",
    padding: "8px 12px",
    outline: "none",
    boxShadow: "3px 3px 0px black",
    fontSize: "0.85rem",
    fontWeight: 700,
    backgroundColor: "#f8fafc"
  };

  const modalCancelStyle = {
    padding: "6px 12px",
    fontSize: "0.75rem",
    backgroundColor: "white",
    boxShadow: "3px 3px 0px black"
  };

  const modalSaveStyle = {
    padding: "6px 12px",
    fontSize: "0.75rem",
    backgroundColor: "var(--system-green)",
    boxShadow: "3px 3px 0px black"
  };

  // Editor Window Styles
  const editorWindowStyle = isEditorMaximized
    ? {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
        border: "3px solid black",
        boxShadow: "none",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column" as const,
        transition: "all 0.15s ease-out"
      }
    : isEditorMinimized
      ? {
          position: "fixed" as const,
          bottom: "20px",
          right: "20px",
          width: "320px",
          backgroundColor: "white",
          border: "3px solid black",
          boxShadow: "4px 4px 0px black",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column" as const,
          transition: "all 0.15s ease-out"
        }
      : {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "550px",
          maxWidth: "95%",
          maxHeight: "85vh",
          overflowY: "auto" as const,
          backgroundColor: "white",
          border: "3px solid black",
          boxShadow: "8px 8px 0px black",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column" as const,
          transition: "all 0.15s ease-out"
        };

  const windowControlStyleMinimize = {
    width: "20px",
    height: "20px",
    border: "1.5px solid black",
    backgroundColor: "#fef08a",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "1px 1px 0px black"
  };

  const windowControlStyleMaximize = {
    width: "20px",
    height: "20px",
    border: "1.5px solid black",
    backgroundColor: "#bbf7d0",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "1px 1px 0px black"
  };

  const windowControlStyleClose = {
    width: "20px",
    height: "20px",
    border: "1.5px solid black",
    backgroundColor: "#fecaca",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    boxShadow: "1px 1px 0px black"
  };

  const tableHeaderStyle = {
    textAlign: "left" as const,
    padding: "10px",
    borderBottom: "3px solid black",
    fontSize: "0.75rem",
    fontWeight: "bold"
  };

  const tableRowStyle = (selected: boolean) => ({
    backgroundColor: selected ? "#bae6fd" : "transparent",
    borderBottom: "1.5px solid black",
    cursor: "pointer",
    transition: "background-color 0.1s"
  });

  const tableCellStyle = {
    padding: "8px 10px",
    fontSize: "0.75rem"
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>FILE EXPLORER</h2>
        <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-xs)" }}>
          Browse server directories, view logs, edit configuration scripts, and execute file system operations.
        </p>
      </header>

      {/* Explorer Layout */}
      <div style={layoutStyle}>
        
        {/* Left pane: Quick Navigation bookmarks */}
        <div style={leftPaneStyle}>
          <span className="font-heading" style={{ fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase" }}>Quick Access</span>
          <div style={pathShortcutStyle(currentFolderId === "root")} onClick={() => { setCurrentFolderId("root"); setSelectedId(null); setSearchQuery(""); }}>
            <Folder size={14} style={{ fill: "var(--system-yellow)", color: "black" }} /> ROOT (/)
          </div>
          <div style={pathShortcutStyle(currentFolderId === "dir-src")} onClick={() => { setCurrentFolderId("dir-src"); setSelectedId(null); setSearchQuery(""); }}>
            <Folder size={14} style={{ fill: "var(--system-yellow)", color: "black" }} /> src/
          </div>
          <div style={pathShortcutStyle(currentFolderId === "dir-components")} onClick={() => { setCurrentFolderId("dir-components"); setSelectedId(null); setSearchQuery(""); }}>
            <Folder size={14} style={{ fill: "var(--system-yellow)", color: "black" }} /> components/
          </div>
          <div style={pathShortcutStyle(currentFolderId === "dir-public")} onClick={() => { setCurrentFolderId("dir-public"); setSelectedId(null); setSearchQuery(""); }}>
            <Folder size={14} style={{ fill: "var(--system-yellow)", color: "black" }} /> public/
          </div>

          <div style={{ marginTop: "auto", borderTop: "2px solid black", paddingTop: "8px" }}>
            <div className="font-mono" style={{ fontSize: "0.6rem", color: "#64748b", lineHeight: 1.4 }}>
              <div><strong>Clipboard:</strong> {clipboard ? `${clipboard.action.toUpperCase()} of ${fs.find(x => x.id === clipboard.itemId)?.name}` : "Empty"}</div>
              <div style={{ marginTop: "4px" }}><strong>Selected:</strong> {selectedItem ? selectedItem.name : "None"}</div>
            </div>
          </div>
        </div>

        {/* Right pane: Core File Manager */}
        <div 
          style={{
            ...rightPaneStyle,
            backgroundColor: isDragOverPane ? "#f0fdf4" : "white",
            border: isDragOverPane ? "3px dashed var(--system-green)" : "3px solid black"
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOverPane(true); }}
          onDragLeave={() => setIsDragOverPane(false)}
          onDrop={handlePaneDrop}
        >
          {/* Top section: navigation bar and search */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            
            {/* Navigation and Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
              <button 
                className="btn" 
                onClick={navigateUp}
                disabled={currentFolderId === "root" || searchQuery !== ""}
                style={{
                  padding: "4px 8px",
                  boxShadow: "2px 2px 0px black",
                  opacity: currentFolderId === "root" || searchQuery !== "" ? 0.5 : 1,
                  cursor: currentFolderId === "root" || searchQuery !== "" ? "not-allowed" : "pointer",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Up one level"
              >
                <ArrowUp size={14} />
              </button>

              <div style={breadcrumbsContainerStyle}>
                <span style={{ fontWeight: 700, color: "#64748b" }}>SERVER:</span>
                {searchQuery !== "" ? (
                  <span className="font-mono" style={{ color: "var(--system-red)", fontWeight: 700 }}>SEARCH RESULTS</span>
                ) : (
                  getBreadcrumbs().map((crumb, idx) => (
                    <Fragment key={crumb.id}>
                      {idx > 0 && <ChevronRight size={10} />}
                      <span 
                        onClick={() => { setCurrentFolderId(crumb.id); setSelectedId(null); }}
                        style={{ 
                          cursor: "pointer", 
                          fontWeight: crumb.id === currentFolderId ? 700 : 400,
                          textDecoration: crumb.id === currentFolderId ? "none" : "underline"
                        }}
                      >
                        {crumb.name === "root" ? "/" : crumb.name}
                      </span>
                    </Fragment>
                  ))
                )}
              </div>
            </div>

            {/* Search Box */}
            <div style={{ width: "200px" }}>
              <input 
                type="text" 
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedId(null); }}
                style={searchInputStyle}
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={toolbarStyle}>
            <button 
              className="btn" 
              onClick={() => { setCreateType("file"); setIsCreateOpen(true); }}
              style={{ padding: "4px 10px", fontSize: "0.7rem", backgroundColor: "var(--system-yellow)", boxShadow: "3px 3px 0px black" }}
            >
              + NEW FILE
            </button>
            <button 
              className="btn" 
              onClick={() => { setCreateType("directory"); setIsCreateOpen(true); }}
              style={{ padding: "4px 10px", fontSize: "0.7rem", backgroundColor: "var(--system-yellow)", boxShadow: "3px 3px 0px black" }}
            >
              + NEW FOLDER
            </button>
            <button 
              className="btn" 
              onClick={handleOpenRename}
              disabled={!selectedId}
              style={{ 
                padding: "4px 10px", 
                fontSize: "0.7rem", 
                backgroundColor: "white", 
                boxShadow: "3px 3px 0px black",
                opacity: selectedId ? 1 : 0.5,
                cursor: selectedId ? "pointer" : "not-allowed"
              }}
            >
              RENAME
            </button>
            <button 
              className="btn" 
              onClick={handleDelete}
              disabled={!selectedId}
              style={{ 
                padding: "4px 10px", 
                fontSize: "0.7rem", 
                backgroundColor: "var(--system-red)", 
                color: "black",
                boxShadow: "3px 3px 0px black",
                opacity: selectedId ? 1 : 0.5,
                cursor: selectedId ? "pointer" : "not-allowed"
              }}
            >
              DELETE
            </button>
            
            <div style={{ width: "2px", backgroundColor: "black", margin: "0 4px" }} />
            
            <button 
              className="btn" 
              onClick={handleCopy}
              disabled={!selectedId}
              style={{ 
                padding: "4px 10px", 
                fontSize: "0.7rem", 
                backgroundColor: "white", 
                boxShadow: "3px 3px 0px black",
                opacity: selectedId ? 1 : 0.5,
                cursor: selectedId ? "pointer" : "not-allowed"
              }}
            >
              COPY
            </button>
            <button 
              className="btn" 
              onClick={handleCut}
              disabled={!selectedId}
              style={{ 
                padding: "4px 10px", 
                fontSize: "0.7rem", 
                backgroundColor: "white", 
                boxShadow: "3px 3px 0px black",
                opacity: selectedId ? 1 : 0.5,
                cursor: selectedId ? "pointer" : "not-allowed"
              }}
            >
              CUT
            </button>
            <button 
              className="btn" 
              onClick={handlePaste}
              disabled={!clipboard}
              style={{ 
                padding: "4px 10px", 
                fontSize: "0.7rem", 
                backgroundColor: "var(--system-green)", 
                boxShadow: "3px 3px 0px black",
                opacity: clipboard ? 1 : 0.5,
                cursor: clipboard ? "pointer" : "not-allowed"
              }}
            >
              PASTE
            </button>
          </div>

          {/* Files List Table */}
          <div style={{ flex: 1, border: "3px solid black", overflowY: "auto", maxHeight: "350px", boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }} className="font-mono">
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={tableHeaderStyle}>NAME</th>
                  <th style={tableHeaderStyle}>TYPE</th>
                  <th style={tableHeaderStyle}>SIZE</th>
                  <th style={tableHeaderStyle}>CREATED AT</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "0.75rem" }}>
                      Folder is empty. Drag & drop files here to upload.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedId(item.id)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      style={tableRowStyle(selectedId === item.id)}
                    >
                      <td style={{ ...tableCellStyle, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.type === "directory" ? (
                          <Folder size={14} style={{ fill: "var(--system-yellow)", color: "black" }} />
                        ) : (
                          <FileText size={14} style={{ color: "#334155" }} />
                        )}
                        <span>
                          {searchQuery !== "" ? getRelativePath(item) : item.name}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {item.type === "directory" ? "Directory" : "File"}
                      </td>
                      <td style={tableCellStyle}>
                        {item.type === "file" ? `${item.size} KB` : "—"}
                      </td>
                      <td style={tableCellStyle}>
                        {item.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE FILE / FOLDER DIALOG POPUP */}
      {isCreateOpen && (
        <>
          <div onClick={() => setIsCreateOpen(false)} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ ...titleBarStyle, backgroundColor: "var(--system-yellow)" }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black" }}>
                CREATE NEW {createType.toUpperCase()}
              </span>
              <button onClick={() => setIsCreateOpen(false)} style={closeBtnStyle}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                  {createType.toUpperCase()} NAME:
                </label>
                <input 
                  type="text" 
                  value={createName} 
                  onChange={(e) => setCreateName(e.target.value)} 
                  placeholder={createType === "file" ? "e.g. index.html" : "e.g. assets"} 
                  required
                  className="font-mono"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setIsCreateOpen(false)} style={modalCancelStyle}>CANCEL</button>
                <button type="submit" className="btn" style={modalSaveStyle}>CREATE</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* RENAME DIALOG POPUP */}
      {isRenameOpen && (
        <>
          <div onClick={() => setIsRenameOpen(false)} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ ...titleBarStyle, backgroundColor: "var(--system-yellow)" }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black" }}>
                RENAME ITEM
              </span>
              <button onClick={() => setIsRenameOpen(false)} style={closeBtnStyle}>✕</button>
            </div>
            <form onSubmit={handleRenameSubmit} style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div style={inputContainerStyle}>
                <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>NEW NAME:</label>
                <input 
                  type="text" 
                  value={renameName} 
                  onChange={(e) => setRenameName(e.target.value)} 
                  placeholder="e.g. new-name.ext" 
                  required
                  className="font-mono"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setIsRenameOpen(false)} style={modalCancelStyle}>CANCEL</button>
                <button type="submit" className="btn" style={modalSaveStyle}>RENAME</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* FILE CODE EDITOR WINDOW MODAL */}
      {isEditorOpen && (() => {
        const currentFile = fs.find(x => x.id === editingFileId);
        return (
          <>
            {!isEditorMinimized && !isEditorMaximized && (
              <div onClick={() => { setIsEditorOpen(false); setEditingFileId(null); }} style={overlayStyle} />
            )}
            <div style={editorWindowStyle}>
              {/* Title Bar */}
              <div style={{ ...titleBarStyle, backgroundColor: "var(--system-blue)", color: "black", cursor: "default" }}>
                <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                  EDITING: {currentFile?.name}
                </span>
                
                {/* Window Controls */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {/* Minimize */}
                  <button 
                    type="button"
                    onClick={() => setIsEditorMinimized(!isEditorMinimized)}
                    title="Minimize"
                    style={windowControlStyleMinimize}
                  >
                    –
                  </button>
                  {/* Maximize */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditorMaximized(!isEditorMaximized);
                      setIsEditorMinimized(false);
                    }}
                    title={isEditorMaximized ? "Restore Down" : "Maximize"}
                    style={windowControlStyleMaximize}
                  >
                    {isEditorMaximized ? "❐" : "⬜"}
                  </button>
                  {/* Close */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditorOpen(false);
                      setEditingFileId(null);
                    }}
                    title="Close"
                    style={windowControlStyleClose}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!isEditorMinimized && (
                <div style={{ padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)", flex: 1 }}>
                  <div>
                    <h4 className="font-heading" style={{ fontSize: "0.85rem", marginBottom: "4px" }}>
                      FILE CONTENT EDITOR
                    </h4>
                    <p style={{ fontSize: "0.72rem", color: "#475569" }}>
                      You are editing a server codebase file. Saved modifications are applied in memory.
                    </p>
                  </div>

                  <textarea
                    className="font-mono"
                    value={editingFileContent}
                    onChange={(e) => setEditingFileContent(e.target.value)}
                    style={{
                      width: "100%",
                      height: isEditorMaximized ? "calc(100vh - 180px)" : "260px",
                      border: "3px solid black",
                      padding: "12px",
                      fontSize: "0.75rem",
                      outline: "none",
                      boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.15)",
                      lineHeight: 1.4,
                      resize: "none",
                      backgroundColor: "#0f172a",
                      color: "#e2e8f0"
                    }}
                  />

                  <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => { setIsEditorOpen(false); setEditingFileId(null); }} 
                      style={modalCancelStyle}
                    >
                      CANCEL
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={handleSaveFileContent} 
                      style={modalSaveStyle}
                    >
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

interface LogItem {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
}

function LogsTermView() {
  const [logs, setLogs] = useState<LogItem[]>([
    { timestamp: "01:52:10", level: "INFO", source: "SYSTEM", message: "Ndelok daemon listener initialized successfully." },
    { timestamp: "01:52:12", level: "INFO", source: "ZEROTIER", message: "Joined virtual overlay network 8056c85e45c71a39." },
    { timestamp: "01:52:15", level: "INFO", source: "DOCKER", message: "Container database-postgres started on port 5432." },
    { timestamp: "01:52:18", level: "WARN", source: "MONITOR", message: "CPU Core #2 temperature spiked above 78C." },
    { timestamp: "01:52:20", level: "INFO", source: "CLOUDFLARE", message: "Tunnel connection established to PoP CGK." },
    { timestamp: "01:52:25", level: "ERROR", source: "SYSTEM", message: "Failed healthcheck response on payment-system:3002." },
    { timestamp: "01:52:26", level: "WARN", source: "PM2", message: "Process payment-system restarted automatically (exit code 1)." }
  ]);

  const [isStreaming, setIsStreaming] = useState(true);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");

  // Panel maximize/minimize states
  const [isLogMinimized, setIsLogMinimized] = useState(false);
  const [isLogMaximized, setIsLogMaximized] = useState(false);
  const [isTermMinimized, setIsTermMinimized] = useState(false);
  const [isTermMaximized, setIsTermMaximized] = useState(false);

  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Ndelok Server Shell Terminal (Mock SSH Session)",
    "System: ndelokOS v0.18.0 (kernel 6.1-amd64)",
    "Authorized admin session active. Type 'help' for available commands.",
    ""
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logs and terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  // Real-time system log generator
  useEffect(() => {
    if (!isStreaming) return;

    const logTemplates = [
      { level: "INFO" as const, source: "MONITOR", message: "CPU load stabilized at 24%. Memory: 312MB / 2048MB." },
      { level: "INFO" as const, source: "CLOUDFLARE", message: "Tunnel latency check PoP CGK: 12ms | PoP SIN: 24ms." },
      { level: "INFO" as const, source: "ZEROTIER", message: "Peer transmission check: 12 active connections." },
      { level: "WARN" as const, source: "SYSTEM", message: "Disk storage space usage reached 82% on root partition." },
      { level: "INFO" as const, source: "DOCKER", message: "Garbage collection completed. Pruned 0 unused layers." },
      { level: "ERROR" as const, source: "AUTHENTICATION", message: "Invalid API secret signature from IP 182.253.12.8." },
      { level: "WARN" as const, source: "DATABASE", message: "Connection pool exhausted (100/100 connections in use) - scaling queue." }
    ];

    const interval = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      setLogs(prev => [...prev, {
        timestamp: timeStr,
        level: template.level,
        source: template.source,
        message: template.message
      }]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Command History Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex > 0 ? historyIndex - 1 : 0;
      setHistoryIndex(nextIndex);
      setCommandInput(commandHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length;
      setHistoryIndex(nextIndex);
      if (nextIndex === commandHistory.length) {
        setCommandInput("");
      } else {
        setCommandInput(commandHistory[nextIndex]);
      }
    }
  };

  // Command Executor
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const promptStr = `admin@ndelok-server:~$ ${cmd}`;
    const newHistory = [...commandHistory, cmd];
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);

    let responseLines: string[] = [];
    const parts = cmd.split(" ");
    const mainCommand = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (mainCommand) {
      case "help":
        responseLines = [
          "Available commands:",
          "  help              - List available commands",
          "  clear             - Clear the screen",
          "  neofetch          - Print system specifications and logo",
          "  pm2 list / status - Show running daemon processes and specs",
          "  uptime            - Show system execution uptime",
          "  whoami            - Print active session user",
          "  date              - Show current system date & time",
          "  ls                - List mock directory workspace items",
          "  cat [filename]    - Print contents of a text file"
        ];
        break;
      case "clear":
        setTerminalLines([]);
        setCommandInput("");
        return;
      case "neofetch":
        responseLines = [
          "    .ndelok.     admin@ndelok-server",
          "  `::++++++::`   -------------------",
          "  ++:      :++   OS: ndelokOS v0.18.0 x86_64",
          "  ++        ++   Host: Server-Prod-01",
          "  ++:      :++   Kernel: Linux 6.1.0-9-amd64",
          "  `::++++++::`   Uptime: 4 days, 5 hours, 32 mins",
          "    .ndelok.     Shell: bash 5.1.16",
          "                 CPU: Intel Xeon E5-2673 v4 (4) @ 2.3GHz",
          "                 Memory: 312MB / 2048MB (15.2%)",
          "                 Storage: 42GB / 100GB (42%)"
        ];
        break;
      case "pm2":
        if (arg === "list" || arg === "status" || arg === "") {
          responseLines = [
            "┌────┬────────────────────┬──────────┬────────┬──────────┬──────────┬──────────┐",
            "│ id │ name               │ mode     │ status │ cpu      │ memory   │ uptime   │",
            "├────┼────────────────────┼──────────┼────────┼──────────┼──────────┼──────────┤",
            "│ 0  │ ndelok-dashboard   │ fork     │ online │ 2.5%     │ 128 MB   │ 4d 5h    │",
            "│ 1  │ api-gateway        │ fork     │ online │ 1.1%     │ 96 MB    │ 4d 5h    │",
            "│ 2  │ auth-service       │ fork     │ stopped│ 0%       │ 0 MB     │ 0        │",
            "│ 3  │ postgres-db        │ fork     │ online │ 0.8%     │ 512 MB   │ 4d 5h    │",
            "└────┴────────────────────┴──────────┴────────┴──────────┴──────────┴──────────┘"
          ];
        } else {
          responseLines = [`pm2: command not recognized: "${arg}". Try "pm2 list".`];
        }
        break;
      case "uptime":
        responseLines = [" 01:53:10 up 4 days, 5 hours, 32 minutes, 1 user, load average: 0.12, 0.08, 0.05"];
        break;
      case "whoami":
        responseLines = ["admin"];
        break;
      case "date":
        responseLines = [new Date().toString()];
        break;
      case "ls":
        responseLines = ["public/    src/    package.json    README.md    vite.config.ts"];
        break;
      case "cat":
        if (!arg) {
          responseLines = ["cat: missing file argument. Usage: cat [filename]"];
        } else {
          const fileMap: { [key: string]: string } = {
            "readme.md": `# ndelok\nSistem monitoring server dengan antarmuka Neobrutalist.`,
            "package.json": `{\n  "name": "ndelok",\n  "version": "0.18.0",\n  "type": "module"\n}`,
            "vite.config.ts": `import { defineConfig } from "vite";\nexport default defineConfig({});`
          };
          const normalizedArg = arg.toLowerCase();
          if (fileMap[normalizedArg]) {
            responseLines = fileMap[normalizedArg].split("\n");
          } else {
            responseLines = [`cat: ${arg}: No such file in root directory`];
          }
        }
        break;
      default:
        responseLines = [
          `bash: ${mainCommand}: command not found.`,
          "Type 'help' to see list of valid commands."
        ];
    }

    setTerminalLines(prev => [...prev, promptStr, ...responseLines, ""]);
    setCommandInput("");
  };

  // Log Filtering
  const filteredLogs = logs.filter(log => {
    if (logFilter === "ALL") return true;
    return log.level === logFilter;
  });

  // Styles
  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-md)",
    height: "calc(100vh - 190px)",
    marginTop: "var(--space-md)"
  };

  const consoleBoxStyle = {
    backgroundColor: "white",
    border: "3px solid black",
    boxShadow: "8px 8px 0px black",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden" as const
  };

  const consoleHeaderStyle = (color: string) => ({
    backgroundColor: color,
    borderBottom: "3px solid black",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  });

  const streamBodyStyle = {
    flex: 1,
    backgroundColor: "#090d16",
    padding: "12px",
    overflowY: "auto" as const,
    lineHeight: 1.4
  };

  const toolbarStyle = {
    display: "flex",
    gap: "6px",
    alignItems: "center"
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>LOGS & TERMINAL</h2>
        <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-xs)" }}>
          Monitor live system logs stream and execute server operations inside the interactive SSH shell console.
        </p>
      </header>

      {/* Main split grid */}
      <div style={containerStyle}>
        
        {/* Left Pane: Log Stream */}
        <div style={consoleBoxStyle}>
          <div style={consoleHeaderStyle("var(--system-green)")}>
            <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
              SYSTEM LOG STREAM
            </span>
            <div style={toolbarStyle}>
              {/* Filter Select Buttons */}
              <div style={{ display: "flex", border: "2px solid black", boxShadow: "1px 1px 0px black", backgroundColor: "white" }}>
                {(["ALL", "INFO", "WARN", "ERROR"] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setLogFilter(f)}
                    style={{
                      padding: "2px 6px",
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      border: "none",
                      borderRight: f !== "ERROR" ? "1.5px solid black" : "none",
                      backgroundColor: logFilter === f ? "var(--system-blue)" : "white",
                      cursor: "pointer"
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Pause/Resume button */}
              <button 
                className="btn"
                onClick={() => setIsStreaming(!isStreaming)}
                style={{
                  padding: "2px 6px",
                  fontSize: "0.6rem",
                  backgroundColor: isStreaming ? "#fef08a" : "var(--system-green)",
                  boxShadow: "1.5px 1.5px 0px black"
                }}
              >
                {isStreaming ? "PAUSE" : "RESUME"}
              </button>

              {/* Clear button */}
              <button 
                className="btn"
                onClick={() => setLogs([])}
                style={{
                  padding: "2px 6px",
                  fontSize: "0.6rem",
                  backgroundColor: "#fecaca",
                  boxShadow: "1.5px 1.5px 0px black"
                }}
              >
                CLEAR
              </button>

              {/* Minimize button */}
              <button
                onClick={() => { setIsLogMinimized(v => !v); setIsLogMaximized(false); }}
                title={isLogMinimized ? "Restore" : "Minimize"}
                style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#fef08a", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}
              >–</button>

              {/* Maximize button */}
              <button
                onClick={() => { setIsLogMaximized(v => !v); setIsLogMinimized(false); }}
                title={isLogMaximized ? "Restore Down" : "Maximize"}
                style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#bbf7d0", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}
              >{isLogMaximized ? "❐" : "⬜"}</button>
            </div>
          </div>

          {!isLogMinimized && (
            <div style={streamBodyStyle} className="font-mono">
              {filteredLogs.length === 0 ? (
                <div style={{ color: "#475569", textAlign: "center", padding: "20px", fontSize: "0.75rem" }}>
                  No logs generated yet or logs cleared.
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", borderBottom: "1px solid #141b2d", padding: "4px 0", fontSize: "0.7rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#64748b", flexShrink: 0 }}>[{log.timestamp}]</span>
                    <span style={{ 
                      color: log.level === "ERROR" ? "var(--system-red)" : log.level === "WARN" ? "var(--system-yellow)" : "var(--system-green)",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}>[{log.level}]</span>
                    <span style={{ color: "#38bdf8", fontWeight: 700, flexShrink: 0 }}>[{log.source}]</span>
                    <span style={{ color: "#e2e8f0" }}>{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Right Pane: SSH Terminal Console */}
        <div style={consoleBoxStyle} onClick={() => terminalInputRef.current?.focus()}>
          <div style={consoleHeaderStyle("var(--system-blue)")}>
            <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
              SSH TERMINAL CONSOLE
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="badge font-mono" style={{ fontSize: "0.6rem", backgroundColor: "black", color: "white" }}>
                admin@ndelok-server
              </div>
              {/* Minimize button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsTermMinimized(v => !v); setIsTermMaximized(false); }}
                title={isTermMinimized ? "Restore" : "Minimize"}
                style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#fef08a", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}
              >–</button>
              {/* Maximize button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsTermMaximized(v => !v); setIsTermMinimized(false); }}
                title={isTermMaximized ? "Restore Down" : "Maximize"}
                style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#bbf7d0", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}
              >{isTermMaximized ? "❐" : "⬜"}</button>
            </div>
          </div>

          {!isTermMinimized && (
            <>
              <div style={{ ...streamBodyStyle, backgroundColor: "#000000", padding: "16px" }} className="font-mono">
                <div style={{ fontSize: "0.7rem", color: "#a7f3d0", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                  {terminalLines.map((line, idx) => (
                    <div key={idx} style={{ minHeight: "1.2em" }}>{line}</div>
                  ))}

                  <form onSubmit={handleCommandSubmit} style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ color: "#38bdf8", marginRight: "6px", flexShrink: 0 }}>admin@ndelok-server:~$</span>
                    <input 
                      type="text" 
                      value={commandInput} 
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={terminalInputRef}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#22c55e",
                        fontFamily: "var(--font-space-mono), monospace",
                        fontSize: "0.7rem",
                        flex: 1,
                        caretColor: "#22c55e",
                        padding: 0
                      }}
                      autoFocus
                    />
                  </form>
                </div>
                <div ref={terminalEndRef} />
              </div>
            </>
          )}
        </div>

      </div>

      {/* Log Stream Maximized Overlay */}
      {isLogMaximized && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }} onClick={() => setIsLogMaximized(false)} />
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", backgroundColor: "#090d16", border: "3px solid black", boxShadow: "0 0 0 4px black" }}>
            <div style={{ ...consoleHeaderStyle("var(--system-green)"), flexShrink: 0 }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                SYSTEM LOG STREAM
              </span>
              <div style={toolbarStyle}>
                <div style={{ display: "flex", border: "2px solid black", boxShadow: "1px 1px 0px black", backgroundColor: "white" }}>
                  {(["ALL", "INFO", "WARN", "ERROR"] as const).map(f => (
                    <button key={f} onClick={() => setLogFilter(f)} style={{ padding: "2px 6px", fontSize: "0.6rem", fontWeight: "bold", border: "none", borderRight: f !== "ERROR" ? "1.5px solid black" : "none", backgroundColor: logFilter === f ? "var(--system-blue)" : "white", cursor: "pointer" }}>{f}</button>
                  ))}
                </div>
                <button className="btn" onClick={() => setIsStreaming(!isStreaming)} style={{ padding: "2px 6px", fontSize: "0.6rem", backgroundColor: isStreaming ? "#fef08a" : "var(--system-green)", boxShadow: "1.5px 1.5px 0px black" }}>{isStreaming ? "PAUSE" : "RESUME"}</button>
                <button className="btn" onClick={() => setLogs([])} style={{ padding: "2px 6px", fontSize: "0.6rem", backgroundColor: "#fecaca", boxShadow: "1.5px 1.5px 0px black" }}>CLEAR</button>
                <button onClick={() => setIsLogMaximized(false)} title="Restore Down" style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#bbf7d0", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}>❐</button>
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px", overflowY: "auto", lineHeight: 1.4 }} className="font-mono">
              {filteredLogs.length === 0 ? (
                <div style={{ color: "#475569", textAlign: "center", padding: "20px", fontSize: "0.75rem" }}>No logs generated yet or logs cleared.</div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", borderBottom: "1px solid #141b2d", padding: "4px 0", fontSize: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#64748b", flexShrink: 0 }}>[{log.timestamp}]</span>
                    <span style={{ color: log.level === "ERROR" ? "var(--system-red)" : log.level === "WARN" ? "var(--system-yellow)" : "var(--system-green)", fontWeight: "bold", flexShrink: 0 }}>[{log.level}]</span>
                    <span style={{ color: "#38bdf8", fontWeight: 700, flexShrink: 0 }}>[{log.source}]</span>
                    <span style={{ color: "#e2e8f0" }}>{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </>
      )}

      {/* SSH Terminal Maximized Overlay */}
      {isTermMaximized && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }} onClick={() => setIsTermMaximized(false)} />
          <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", backgroundColor: "#000000", border: "3px solid black", boxShadow: "0 0 0 4px black" }} onClick={() => terminalInputRef.current?.focus()}>
            <div style={{ ...consoleHeaderStyle("var(--system-blue)"), flexShrink: 0 }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                SSH TERMINAL CONSOLE
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div className="badge font-mono" style={{ fontSize: "0.6rem", backgroundColor: "black", color: "white" }}>admin@ndelok-server</div>
                <button onClick={(e) => { e.stopPropagation(); setIsTermMaximized(false); }} title="Restore Down" style={{ width: "20px", height: "20px", border: "1.5px solid black", backgroundColor: "#bbf7d0", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, boxShadow: "1px 1px 0px black" }}>❐</button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "#000000", padding: "16px", overflowY: "auto", lineHeight: 1.4 }} className="font-mono">
              <div style={{ fontSize: "0.8rem", color: "#a7f3d0", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                {terminalLines.map((line, idx) => (
                  <div key={idx} style={{ minHeight: "1.2em" }}>{line}</div>
                ))}
                <form onSubmit={handleCommandSubmit} style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ color: "#38bdf8", marginRight: "6px", flexShrink: 0 }}>admin@ndelok-server:~$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={terminalInputRef}
                    style={{ background: "transparent", border: "none", outline: "none", color: "#22c55e", fontFamily: "var(--font-space-mono), monospace", fontSize: "0.8rem", flex: 1, caretColor: "#22c55e", padding: 0 }}
                    autoFocus
                  />
                </form>
              </div>
              <div ref={terminalEndRef} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  actions?: string[];
}

function AIAgentPopup({ isOpen, onClose, btnY }: { isOpen: boolean; onClose: () => void; btnY: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Halo! Saya **NDELOK AI Agent** — asisten pintar untuk manajemen server Anda.\n\nSaya bisa membantu:\n• **Deploy** layanan baru dan monitoring\n• **Diagnosa** masalah sistem & log analisis\n• **Manage** plugin, network, dan konfigurasi\n• **Monitor** performa server secara real-time\n\nApa yang ingin kamu lakukan hari ini?",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      actions: ["Lihat Status Server", "Deploy Layanan Baru", "Analisa Log Sistem", "Cek Performa CPU/RAM"]
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const getAgentResponse = (userMsg: string): { content: string; actions?: string[] } => {
    const msg = userMsg.toLowerCase();

    if (msg.includes("status") || msg.includes("health") || msg.includes("lihat status server")) {
      return {
        content: "✅ **Status Server: HEALTHY**\n\n```\nSERVER: production-01\nUPTIME: 4 days, 5h 32m\nOS: ndelokOS v0.18.0 (kernel 6.1-amd64)\n```\n\n**Metrik Real-time:**\n• CPU: 24% — Normal ✓\n• RAM: 312MB / 2048MB (15%) — Optimal ✓\n• Storage: 42% — Aman ✓\n• Network: ↓ 12.4 MB/s ↑ 2.1 MB/s\n\n**Layanan:**\n• ndelok-dashboard → ONLINE (port 1234)\n• api-gateway → ONLINE (port 3000)\n• postgres-db → ONLINE (port 5432)\n• auth-service → STOPPED ⚠️\n\n⚠️ `auth-service` tidak berjalan. Ingin saya restart?",
        actions: ["Restart auth-service", "Lihat Log auth-service", "Cek Semua Layanan"]
      };
    }
    if (msg.includes("deploy") || msg.includes("layanan baru") || msg.includes("launch")) {
      return {
        content: "🚀 **Mode Deploy Aktif**\n\nSilakan berikan informasi berikut:\n\n1. **Nama Layanan** (contoh: `payment-api`)\n2. **Port** yang digunakan (contoh: `3001`)\n3. **Sumber kode** — GitHub URL atau upload ZIP\n4. **Build command** (contoh: `npm install && npm run build`)\n5. **Start command** (contoh: `npm run start`)\n\nAtau gunakan wizard visual di halaman **Deploy**.",
        actions: ["Buka Halaman Deploy", "Deploy via GitHub", "Upload ZIP File"]
      };
    }
    if (msg.includes("log") || msg.includes("error") || msg.includes("masalah") || msg.includes("diagnosa") || msg.includes("analisa log")) {
      return {
        content: "🔍 **Analisa Log Sistem — 5 Menit Terakhir**\n\n```\n[01:52:25] [ERROR] [SYSTEM]  Failed healthcheck on payment-system:3002\n[01:52:26] [WARN]  [PM2]     Process payment-system restarted (exit code 1)\n[01:54:33] [WARN]  [SYSTEM]  Disk storage 82% on root partition\n[01:54:49] [ERROR] [AUTH]    Invalid API secret from IP 182.253.12.8\n```\n\n**Temuan:**\n1. ❌ `payment-system` crash berulang — kemungkinan memory leak\n2. ⚠️ Disk hampir penuh — perlu cleanup\n3. 🚨 Akses tidak sah dari IP `182.253.12.8`\n\nIngin saya jalankan tindakan otomatis?",
        actions: ["Restart payment-system", "Bersihkan Disk Cache", "Block IP 182.253.12.8", "Export Full Report"]
      };
    }
    if (msg.includes("cpu") || msg.includes("ram") || msg.includes("performa") || msg.includes("memory") || msg.includes("cek performa")) {
      return {
        content: "📊 **Laporan Performa Sistem**\n\n**CPU — Intel Xeon E5-2673 v4 @ 2.3GHz**\n• Current Load: 24% — Ringan\n• Peak 1h: 78% pukul 01:52\n• Avg 24h: 31%\n\n**RAM — 2048MB DDR4**\n• Digunakan: 312MB (15.2%)\n• Cached: 842MB\n• Free: 894MB\n\n**Top Proses:**\n```\nndelok-dashboard   128MB   2.5%\npostgres           512MB   0.8%\napi-gateway         96MB   1.1%\n```\n\n✅ Performa dalam kondisi baik.",
        actions: ["Set CPU Alert", "Lihat Semua Proses", "Optimize Memory"]
      };
    }
    if (msg.includes("plugin") || msg.includes("zerotier") || msg.includes("cloudflare") || msg.includes("docker") || msg.includes("manage plugin")) {
      return {
        content: "🔌 **Status Plugin Manager**\n\n| Plugin | Versi | Status |\n|--------|-------|--------|\n| ZeroTier ONE | v1.12.2 | 🟢 ONLINE |\n| Tmux | v3.3a | 🟢 RUNNING |\n| Cloudflare | v2024.1.0 | 🟢 CONNECTED |\n| Docker | v24.0.7 | ⚫ NOT INSTALLED |\n| Nginx | v1.25.3 | ⚫ NOT INSTALLED |\n\n**ZeroTier:** Network `8056c85e45c71a39`, IP: `10.147.20.12`\n**Cloudflare:** Tunnel aktif ke `ndelok.me` via PoP CGK",
        actions: ["Install Docker", "Install Nginx", "Konfigurasi ZeroTier", "Buka Plugin Manager"]
      };
    }
    if (msg.includes("restart") || msg.includes("stop") || msg.includes("start")) {
      const svc = msg.includes("auth") ? "auth-service" : msg.includes("payment") ? "payment-system" : "ndelok-dashboard";
      return {
        content: `⚙️ **Menjalankan Perintah Server**\n\n\`\`\`bash\nadmin@ndelok-server:~$ pm2 restart ${svc}\n\`\`\`\n\n📤 Mengirim perintah...\n✅ **${svc} berhasil direstart!**\n\n**Output:**\n\`\`\`\n[PM2] Applying action restartProcessId on [${svc}]\n[PM2] [${svc}](2847) ✓\n\`\`\`\n\n✅ Layanan kembali online.`,
        actions: ["Monitor Layanan", "Lihat Log Real-time", "Set Auto-restart"]
      };
    }
    if (msg.includes("network") || msg.includes("jaringan") || msg.includes("koneksi") || msg.includes("keamanan") || msg.includes("security audit")) {
      return {
        content: "🌐 **Status Jaringan Server**\n\n**Interface Aktif:**\n```\neth0     172.16.0.1/24   ↑ 2.1MB/s  ↓ 12.4MB/s\nzt0      10.147.20.12/8  ZeroTier VPN\nlo       127.0.0.1       Loopback\n```\n\n**Port Terbuka:**\n```\n22    SSH      LISTEN\n80    HTTP     LISTEN\n443   HTTPS    LISTEN\n1234  Ndelok   LISTEN\n3000  API GW   LISTEN\n5432  Postgres LISTEN\n```\n\n**Cloudflare:** ✅ Connected — ndelok.me — Latency: 12ms",
        actions: ["Lihat Semua Koneksi", "Check Firewall", "Konfigurasi Port"]
      };
    }
    return {
      content: `🤖 Saya menerima: *"${userMsg}"*\n\nCoba tanyakan tentang:\n• **Status** server & layanan\n• **Deploy** layanan baru\n• **Log** & diagnosa masalah\n• **Performa** CPU/RAM/Storage\n• **Plugin** management\n• **Jaringan** & keamanan`,
      actions: ["Cek Status Server", "Analisa Log", "Lihat Performa", "Manage Plugin"]
    };
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    const response = getAgentResponse(trimmed);
    const agentMsg: ChatMessage = {
      id: `msg-${Date.now()}-agent`,
      role: "agent",
      content: response.content,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      actions: response.actions
    };
    setIsTyping(false);
    setMessages(prev => [...prev, agentMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    let inCode = false;
    const codeLines: string[] = [];
    const result: React.ReactNode[] = [];
    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (!inCode) { inCode = true; codeLines.length = 0; }
        else {
          inCode = false;
          result.push(
            <pre key={`c${i}`} style={{ backgroundColor: "#0f172a", color: "#a7f3d0", padding: "8px 12px", border: "1.5px solid #334155", fontSize: "0.7rem", overflowX: "auto", margin: "4px 0", fontFamily: "monospace", lineHeight: 1.5, whiteSpace: "pre" }}>
              {codeLines.join("\n")}
            </pre>
          );
        }
        return;
      }
      if (inCode) { codeLines.push(line); return; }
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      result.push(
        <div key={i} style={{ minHeight: line === "" ? "0.5em" : undefined }}>
          {parts.map((p, j) => {
            if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
            if (p.startsWith("`") && p.endsWith("`")) return <code key={j} style={{ backgroundColor: "#1e293b", color: "#38bdf8", padding: "1px 5px", borderRadius: "3px", fontSize: "0.78em", fontFamily: "monospace", border: "1px solid #334155" }}>{p.slice(1, -1)}</code>;
            return <span key={j}>{p}</span>;
          })}
        </div>
      );
    });
    return result;
  };

  const quickSuggestions = [
    { icon: <Server size={13} />, text: "Status Server" },
    { icon: <Zap size={13} />, text: "Performa Sistem" },
    { icon: <FileText size={13} />, text: "Analisa Log" },
    { icon: <Shield size={13} />, text: "Keamanan" },
    { icon: <RefreshCw size={13} />, text: "Restart Layanan" },
  ];

  const popupHeight = 580;
  let topPos = 300;
  if (typeof window !== "undefined") {
    const idealTop = btnY + 28 - (popupHeight / 2);
    const maxTop = window.innerHeight - popupHeight - 20;
    topPos = Math.max(20, Math.min(maxTop, idealTop));
  }

  return (
    <div style={{
      display: isOpen ? "flex" : "none",
      position: "fixed",
      top: `${topPos}px`,
      right: "88px",
      width: "420px",
      height: `${popupHeight}px`,
      maxWidth: "calc(100vw - 48px)",
      maxHeight: "calc(100vh - 120px)",
      zIndex: 9998,
      flexDirection: "column",
      border: "3px solid black",
      boxShadow: "8px 8px 0px black",
      overflow: "hidden",
      backgroundColor: "white",
      transition: "top 0.1s ease-out"
    }}>
      {/* Title Bar / Header */}
      <div style={{ backgroundColor: "var(--system-yellow)", borderBottom: "3px solid black", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span className="font-heading" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Bot size={16} /> NDELOK AI AGENT CONSOLE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            className="btn" 
            onClick={() => setMessages(prev => [prev[0]])} 
            style={{ 
              padding: "2px 6px", 
              fontSize: "0.6rem", 
              backgroundColor: "white", 
              boxShadow: "1px 1px 0px black", 
              display: "flex", 
              alignItems: "center", 
              gap: "4px",
              border: "1.5px solid black"
            }}
          >
            <Trash2 size={10} /> CLEAR
          </button>
          <button 
            onClick={onClose}
            className="btn" 
            style={{ 
              padding: "2px 6px", 
              fontSize: "0.65rem", 
              boxShadow: "1px 1px 0px black",
              backgroundColor: "black",
              color: "white",
              border: "1.5px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-md)", display: "flex", flexDirection: "column", gap: "var(--space-md)", backgroundColor: "#f8fafc" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: "28px", height: "28px", border: "2px solid black", backgroundColor: msg.role === "agent" ? "var(--system-yellow)" : "black", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "2px 2px 0px " + (msg.role === "agent" ? "black" : "#555") }}>
                {msg.role === "agent" ? <Bot size={14} /> : <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>YOU</span>}
              </div>
              <span className="font-mono" style={{ fontSize: "0.6rem", color: "#64748b" }}>{msg.role === "agent" ? "NDELOK AI" : "ADMIN"} · {msg.timestamp}</span>
            </div>
            <div style={{ maxWidth: "85%", padding: "10px 14px", border: "2px solid black", backgroundColor: msg.role === "agent" ? "white" : "black", color: msg.role === "agent" ? "black" : "white", boxShadow: msg.role === "agent" ? "3px 3px 0px black" : "3px 3px 0px #555", lineHeight: 1.6, fontSize: "0.82rem" }} className="font-mono">
              {msg.role === "agent" ? renderContent(msg.content) : <span>{msg.content}</span>}
            </div>
            {msg.actions && msg.role === "agent" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "85%" }}>
                {msg.actions.map((action, idx) => (
                  <button key={idx} className="btn" onClick={() => sendMessage(action)} style={{ padding: "3px 10px", fontSize: "0.65rem", backgroundColor: idx === 0 ? "var(--system-blue)" : "white", color: "black", boxShadow: "2px 2px 0px black", border: "1.5px solid black", cursor: "pointer", fontWeight: 700 }}>{action}</button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "28px", height: "28px", border: "2px solid black", backgroundColor: "var(--system-yellow)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "2px 2px 0px black" }}><Bot size={14} /></div>
              <span className="font-mono" style={{ fontSize: "0.6rem", color: "#64748b" }}>NDELOK AI · sedang mengetik...</span>
            </div>
            <div style={{ padding: "10px 18px", border: "2px solid black", backgroundColor: "white", boxShadow: "3px 3px 0px black", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "black", animation: `agentBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      <div style={{ borderTop: "2px solid black", padding: "8px 12px", display: "flex", gap: "6px", flexWrap: "wrap", backgroundColor: "var(--secondary-bg)", flexShrink: 0 }}>
        <span className="font-heading" style={{ fontSize: "0.6rem", color: "#64748b", alignSelf: "center", marginRight: "2px" }}>CEPAT:</span>
        {quickSuggestions.map((s, i) => (
          <button key={i} className="btn" onClick={() => sendMessage(s.text)} style={{ padding: "2px 8px", fontSize: "0.6rem", backgroundColor: "white", border: "1.5px solid black", boxShadow: "1.5px 1.5px 0px black", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            {s.icon}{s.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ borderTop: "3px solid black", padding: "var(--space-sm)", backgroundColor: "white", flexShrink: 0 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-end" }}>
          <textarea ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Tanya AI Agent... (Enter kirim, Shift+Enter baris baru)" rows={2} className="font-mono" style={{ flex: 1, border: "3px solid black", padding: "8px 12px", fontSize: "0.82rem", outline: "none", resize: "none", boxShadow: "inset 2px 2px 0px rgba(0,0,0,0.08)", lineHeight: 1.5 }} />
          <button type="submit" disabled={!inputValue.trim() || isTyping} style={{ padding: "10px 18px", backgroundColor: inputValue.trim() && !isTyping ? "black" : "#94a3b8", color: "white", border: "3px solid black", boxShadow: inputValue.trim() && !isTyping ? "4px 4px 0px #555" : "none", cursor: inputValue.trim() && !isTyping ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, height: "62px", transition: "all 0.1s" }}>
            <Send size={16} />KIRIM
          </button>
        </form>
        <p className="font-mono" style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "4px" }}>Enter ↵ kirim · Shift+Enter baris baru · Responds dalam Bahasa Indonesia</p>
      </div>
      <style>{`
        @keyframes agentBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .floating-agent-btn {
          transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .floating-agent-btn:hover {
          background-color: var(--system-yellow) !important;
        }
        .floating-agent-btn:active {
          background-color: var(--system-green) !important;
        }
      `}</style>
    </div>
  );
}
