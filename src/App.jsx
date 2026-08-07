import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import RFPanel from "./components/RFPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import OrbitPanel from "./components/OrbitPanel";

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const INITIAL_SATELLITES = [
  { id: 1, name: "SomaiyaSat-1", battery: 82, signal: 91, altitude: 505, communication: "Online", status: "Nominal" },
  { id: 2, name: "SomaiyaSat-2", battery: 48, signal: 63, altitude: 496, communication: "Online", status: "Nominal" },
  { id: 3, name: "SomaiyaSat-3", battery: 18, signal: 34, altitude: 462, communication: "Offline", status: "Critical" },
];

const TELEMETRY_METRICS = {
  missionId: "KJS-SRS-01",
  orbit: "Low Earth Orbit (LEO)",
  formFactor: "PocketQube (5cm Unit)",
  powerBudget: "< 1.0W Average",
  aiSubsystem: "Decision Tree / Policy Agent",
  primaryFrequencies: "Amateur HAM Bands",
};

const PAYLOAD_OPTIONS = ["TT&C", "SSTV", "Codec2", "M17"];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const calculateStatus = (battery, signal, altitude, communication) => {
  if (battery < 20 || signal < 40 || communication === "Offline") return "Critical";
  if (battery < 50 || signal < 70 || altitude < 490) return "Warning";
  return "Nominal";
};

const getStatusEmoji = (status) => {
  switch (status) {
    case "Nominal": return "🟢";
    case "Warning": return "🟡";
    case "Critical": return "🔴";
    default: return "";
  }
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const Hero = () => (
  <section className="sci-hero">
    <div className="hero-badge">SOMAIYASAT & SOMAIYAPOD MISSION PROFILE</div>
    <h1>Autonomous Inter-Satellite Data Routing & Payload System</h1>
    <p className="hero-desc">
      An onboard AI manager executing link-quality estimation, power budgeting,
      and dynamic mode switching for PocketQube satellite operations.
    </p>
  </section>
);

const TechnicalParameters = () => (
  <section className="sci-telemetry">
    <h2>TECHNICAL PARAMETERS</h2>
    <div className="telemetry-grid">
      {Object.entries(TELEMETRY_METRICS).map(([key, value]) => (
        <div className="telemetry-card" key={key}>
          <span className="telemetry-key">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</span>
          <span className="telemetry-val">{value}</span>
        </div>
      ))}
    </div>
  </section>
);

const OverviewTab = () => (
  <section className="sci-section">
    <h3>01. System Architecture Overview</h3>
    <p>
      SomaiyaSat is a PocketQube satellite designed to demonstrate autonomous
      communication scheduling and intelligent payload management. Operating
      alongside SomaiyaPod, the spacecraft validates deployment, initializes
      flight software, and begins telemetry transmission automatically.
    </p>
    <p>
      The onboard AI continuously evaluates communication quality, available
      battery power, and payload priorities to maximize data return during
      limited ground station visibility windows.
    </p>
  </section>
);

const AiRoutingTab = () => (
  <section className="sci-section">
    <h3>02. Autonomous Routing Engine</h3>
    <p>
      The onboard scheduler determines which subsystem should receive
      communication bandwidth based on battery percentage, signal quality, queue
      urgency, and mission objectives.
    </p>
    <div className="code-block">
      <div className="code-header">AI_PRIORITY_SCHEDULER.LOG</div>
      <pre>{`[Priority 1] TT&C / Housekeeping
[Priority 2] SSTV Image Downlink
[Priority 3] Codec2 Voice
[Priority 4] M17 Digital Communication

IF Battery < 25%
    -> Enable Power Saving
    -> Suspend Imaging
ELSE
    -> Continue Normal Operations`}</pre>
    </div>
  </section>
);

const PayloadsTab = () => (
  <section className="sci-section">
    <h3>03. RF Payload Manager</h3>
    <p>
      The communication subsystem dynamically allocates bandwidth between
      multiple amateur radio payloads based on mission requirements and
      available power.
    </p>
    <div className="spec-table">
      <div className="table-row"><span className="col-title">TT&C</span><span>Telemetry, Tracking & Command</span></div>
      <div className="table-row"><span className="col-title">SSTV</span><span>Slow Scan Television Image Transmission</span></div>
      <div className="table-row"><span className="col-title">Codec2</span><span>Low Bitrate Voice Compression</span></div>
      <div className="table-row"><span className="col-title">M17</span><span>Digital Voice & Data Protocol</span></div>
    </div>
  </section>
);

const TelemetryTab = ({ satellites, lastUpdated }) => {
  const criticalCount = useMemo(() => {
    return satellites.filter((sat) => sat.status === "Critical").length;
  }, [satellites]);

  return (
    <section className="sci-section">
      <h3>05. Satellite Telemetry Dashboard</h3>
      <p className="update-time">Last Updated: {lastUpdated.toLocaleTimeString()}</p>
      <div className="summary-card">
        <h3>Mission Status Summary</h3>
        <p><strong>Total Satellites:</strong> {satellites.length}</p>
        <p><strong>Critical Satellites:</strong> {criticalCount}</p>
      </div>
      <div className="satellite-grid">
        {satellites.map((sat) => (
          <div key={sat.id} className={`sat-card ${sat.status.toLowerCase()}`}>
            <h3>{sat.name}</h3>
            <p><strong>Battery:</strong> {sat.battery}%</p>
            <p><strong>Signal:</strong> {sat.signal}%</p>
            <p><strong>Orbit:</strong> {sat.altitude} km</p>
            <p><strong>Communication:</strong> {sat.communication}</p>
            <h4>{getStatusEmoji(sat.status)} {sat.status}</h4>
            {sat.status === "Critical" && <div className="critical-alert">Immediate Mission Attention Required</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

function App() {
  const [activeTab, setActiveTab] = useState("mission"); // Default to the new dashboard as per reqs
  const [satellites, setSatellites] = useState(INITIAL_SATELLITES);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites((prev) =>
        prev.map((sat) => {
          const battery = Math.max(0, Math.min(100, sat.battery + Math.floor(Math.random() * 11) - 5));
          const signal = Math.max(0, Math.min(100, sat.signal + Math.floor(Math.random() * 11) - 5));
          const altitude = sat.altitude + Math.floor(Math.random() * 5) - 2;
          const status = calculateStatus(battery, signal, altitude, sat.communication);
          return { ...sat, battery, signal, altitude, status };
        })
      );
      setLastUpdated(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <TopBar />
      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content-area">
          {activeTab !== 'mission' && (
            <div className="legacy-content-wrapper">
              <Hero />
              <TechnicalParameters />
              <div className="sci-content">
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "ai" && <AiRoutingTab />}
                {activeTab === "payloads" && <PayloadsTab />}
                {activeTab === "telemetry" && <TelemetryTab satellites={satellites} lastUpdated={lastUpdated} />}
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="mission-dashboard-grid">
              <RFPanel />
              <TelemetryPanel />
              <OrbitPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
