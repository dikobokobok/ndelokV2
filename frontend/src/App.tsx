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
        {currentView === "Deploy" && <DeployView />}
        {currentView !== "Dashboard" && currentView !== "Plugins" && currentView !== "Deploy" && (
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

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !projectPort) return;

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
      folderPath: deployMethod === "folder" ? folderPath : "",
      buildCommand,
      startCommand
    };

    setProjects(prev => [...prev, newProj]);

    const logSequence = [
      `[NDELOK-DEPLOY] 01:32:45 - Initializing deployment sequence for "${projectName.toUpperCase()}"...`,
      `[NDELOK-DEPLOY] 01:32:46 - Import method: ${deployMethod === "github" ? `GITHUB REPOSITORY (${githubLink})` : `LOCAL FILE FOLDER (${folderPath})`}`,
      `[NDELOK-DEPLOY] 01:32:47 - Pulling codebase source files...`,
      `[NDELOK-DEPLOY] 01:32:48 - Executing build command: "${buildCommand || "N/A"}"`,
      `[NDELOK-DEPLOY] 01:32:49 - Build command completed successfully. 0 errors, 2 warnings.`,
      `[NDELOK-DEPLOY] 01:32:50 - Spawning daemon start sequence command: "${startCommand}"`,
      `[NDELOK-DEPLOY] 01:32:51 - Service is online and successfully bound to port/domain ${projectPort}!`,
      `[SUCCESS] 01:32:51 - Deployment completed. Service is fully operational.`
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
      {isDeployOpen && (
        <>
          <div onClick={() => { if (deployStep === "form") setIsDeployOpen(false); }} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ ...titleBarStyle, backgroundColor: "var(--system-yellow)" }}>
              <span className="font-heading" style={{ fontSize: "0.85rem", color: "black", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", backgroundColor: "white", border: "1.5px solid black", borderRadius: "50%" }}></span>
                {deployStep === "form" ? "DEPLOY NEW SERVICE" : "DEPLOYMENT LOGS"}
              </span>
              {deployStep === "form" && (
                <button onClick={() => setIsDeployOpen(false)} style={closeBtnStyle}>✕</button>
              )}
            </div>

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
                  <div style={inputContainerStyle}>
                    <label className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>LOCAL FILE FOLDER PATH:</label>
                    <input 
                      type="text" 
                      value={folderPath} 
                      onChange={(e) => setFolderPath(e.target.value)} 
                      placeholder="e.g. C:\projects\my-app or /var/www/my-app" 
                      required={deployMethod === "folder"}
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
          </div>
        </>
      )}

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
