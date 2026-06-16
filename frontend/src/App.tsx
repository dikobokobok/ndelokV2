import { useEffect, useState } from "react";
import { Activity, Cpu, HardDrive, Network, Package, Terminal, Settings, LayoutDashboard, FileText } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"Dashboard" | "Plugins" | "Deploy" | "Explorer" | "Logs & Term" | "Settings">("Dashboard");
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    storage: 42,
    network: { up: 0, down: 0 }
  });

  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0));

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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "280px", 
        borderRight: "var(--border-width) solid var(--ink)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        backgroundColor: "var(--secondary-bg)"
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

        <div style={{ marginTop: "auto" }} className="card">
          <p className="font-heading" style={{ fontSize: "0.85rem", marginBottom: "var(--space-xs)" }}>AI AGENT</p>
          <p style={{ fontSize: "0.75rem", color: "#475569" }}>Ready to help you deploy.</p>
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
        {currentView !== "Dashboard" && currentView !== "Plugins" && (
          <div>
            <h2 style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>{currentView.toUpperCase()}</h2>
            <p className="font-mono" style={{ fontSize: "0.85rem", color: "#475569", marginTop: "var(--space-md)" }}>
              Under construction. Coming soon.
            </p>
          </div>
        )}
      </main>
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

  const pluginsData = [
    {
      id: "zerotier",
      name: "ZEROTIER ONE",
      tagline: "Secure Virtual Network & Overlay P2P",
      description: "Creates virtual networks, bridging server workloads peer-to-peer over an encrypted overlay network. Ideal for secure multi-cloud or remote management.",
      color: "var(--system-blue)",
      status: "ONLINE",
      badgeText: "v1.12.2",
      details: [
        { label: "NETWORK ID", value: "8056c85e45c71a39" },
        { label: "IP ADDRESS", value: "10.147.20.12" },
        { label: "INTERFACE", value: "ztly2t4" }
      ],
      actions: ["DISABLE", "CONFIGURE"]
    },
    {
      id: "tmux",
      name: "TMUX MULTIPLEXER",
      tagline: "Workspace Manager & Session Persistence",
      description: "Terminal session persistence and shell multiplexing. Keeps long-running CLI builds and scripts active in the background when ssh detaches.",
      color: "var(--system-yellow)",
      status: "RUNNING",
      badgeText: "v3.3a",
      details: [
        { label: "ACTIVE SESSIONS", value: "3 Sessions" },
        { label: "DEFAULT SHELL", value: "/bin/zsh" },
        { label: "CPU IMPACT", value: "0.2% Load" }
      ],
      actions: ["RESTART", "ATTACH"]
    },
    {
      id: "cloudflare",
      name: "CLOUDFLARE TUNNEL",
      tagline: "Secure Public Tunneling Without Open Ports",
      description: "Exposes local web services to the public internet securely. Proxies requests through Cloudflare's edge network without opening hardware firewall ports.",
      color: "var(--system-red)",
      status: "CONNECTED",
      badgeText: "v2024.1.0",
      details: [
        { label: "TUNNEL NAME", value: "ndelok-prod-01" },
        { label: "CONNECTED HOST", value: "ndelok.me" },
        { label: "EDGE POPS", value: "CGK / SIN (2 PoPs)" }
      ],
      actions: ["DISCONNECT", "VIEW LOGS"]
    }
  ];

  const filteredPlugins = pluginsData.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plugin.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
              padding: "8px 12px",
              outline: "none",
              boxShadow: "3px 3px 0px black",
              fontSize: "0.85rem",
              fontWeight: 700,
              width: "220px"
            }}
          />
          {/* Filter Buttons */}
          <button 
            className="btn" 
            onClick={() => setActiveFilter("ALL")}
            style={{ 
              backgroundColor: activeFilter === "ALL" ? "var(--system-yellow)" : "white",
              fontSize: "0.8rem",
              padding: "8px 12px",
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
              padding: "8px 12px",
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
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
        gap: "var(--space-lg)",
        marginTop: "var(--space-lg)"
      }}>
        {filteredPlugins.map(plugin => (
          <div key={plugin.id} className="card" style={{ 
            backgroundColor: "white", 
            padding: 0, 
            display: "flex", 
            flexDirection: "column",
            minHeight: "360px",
            overflow: "hidden"
          }}>
            {/* Header colored banner */}
            <div style={{ 
              backgroundColor: plugin.color, 
              borderBottom: "3px solid black", 
              padding: "var(--space-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 className="font-heading" style={{ fontSize: "1.2rem", color: "black" }}>{plugin.name}</h3>
                <span className="badge" style={{ backgroundColor: "white", marginTop: "4px", fontSize: "0.65rem", padding: "1px 6px" }}>
                  {plugin.badgeText}
                </span>
              </div>
              <span className="badge" style={{ 
                backgroundColor: "black", 
                color: plugin.color, 
                borderColor: "black" 
              }}>
                {plugin.status}
              </span>
            </div>

            {/* Description Body */}
            <div style={{ padding: "var(--space-md)", flex: 1, display: "flex", flexDirection: "column" }}>
              <p className="font-heading" style={{ fontSize: "0.85rem", marginBottom: "var(--space-sm)" }}>{plugin.tagline}</p>
              <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.4, marginBottom: "var(--space-md)" }}>{plugin.description}</p>
              
              {/* Exposed Info Grid */}
              <div style={{ 
                border: "2px solid black", 
                backgroundColor: "var(--secondary-bg)", 
                padding: "var(--space-sm)", 
                display: "flex", 
                flexDirection: "column",
                gap: "4px",
                marginTop: "auto"
              }} className="font-mono">
                {plugin.details.map((detail, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ fontWeight: 700 }}>{detail.label}:</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ 
              borderTop: "3px solid black", 
              padding: "8px 16px", 
              backgroundColor: "var(--secondary-bg)",
              display: "flex",
              gap: "var(--space-sm)",
              justifyContent: "flex-end"
            }}>
              {plugin.actions.map((action, idx) => (
                <button 
                  key={idx} 
                  className="btn" 
                  style={{ 
                    padding: "4px 10px", 
                    fontSize: "0.75rem", 
                    boxShadow: "2px 2px 0px black",
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
    </div>
  );
}
