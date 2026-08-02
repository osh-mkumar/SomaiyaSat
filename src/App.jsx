import React, { useState, useEffect, useMemo } from "react";
import "./App.css";


// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================


const INITIAL_SATELLITES = [
  {
    id: 1,
    name: "SomaiyaSat-1",
    battery: 82,
    signal: 91,
    altitude: 505,
    communication: "Online",
    status: "Nominal",
  },
  {
    id: 2,
    name: "SomaiyaSat-2",
    battery: 48,
    signal: 63,
    altitude: 496,
    communication: "Online",
    status: "Nominal",
  },
  {
    id: 3,
    name: "SomaiyaSat-3",
    battery: 18,
    signal: 34,
    altitude: 462,
    communication: "Offline",
    status: "Critical",
  },
];


const TELEMETRY_METRICS = {
  missionId: "KJS-SRS-01",
  orbit: "Low Earth Orbit (LEO)",
  formFactor: "PocketQube (5cm Unit)",
  powerBudget: "< 1.0W Average",
  aiSubsystem: "Decision Tree / Policy Agent",
  primaryFrequencies: "Amateur HAM Bands",
};


const INITIAL_MISSION_FORM = {
  missionName: "",
  orbit: "LEO",
  priority: "Telemetry",
  powerMode: "Balanced",
  aiPolicy: "Decision Tree",
  payloads: [],
  emergencyMode: false,
  notes: "",
};


const PAYLOAD_OPTIONS = ["TT&C", "SSTV", "Codec2", "M17"];


// ==========================================
// HELPER FUNCTIONS
// ==========================================


const calculateStatus = (battery, signal, altitude, communication) => {
  if (battery < 20 || signal < 40 || communication === "Offline") {
    return "Critical";
  }
  if (battery < 50 || signal < 70 || altitude < 490) {
    return "Warning";
  }
  return "Nominal";
};


const getStatusEmoji = (status) => {
  switch (status) {
    case "Nominal":
      return "🟢";
    case "Warning":
      return "🟡";
    case "Critical":
      return "🔴";
    default:
      return "";
  }
};


// ==========================================
// SUB-COMPONENTS
// ==========================================


const Header = () => (
  <header className="sci-header">
    <div className="sys-status">
      <span className="indicator active"></span>
      <span className="sys-title">SYSTEM STATUS: ONLINE / MISSION READY</span>
    </div>
    <div className="meta-info">
      <span>DOC ID: KJS-SRS-01</span>
      <span>COLLAB: REORBIT (FINLAND)</span>
    </div>
  </header>
);


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
          <span className="telemetry-key">
            {key.replace(/([A-Z])/g, " $1").toUpperCase()}
          </span>
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
      <div className="table-row">
        <span className="col-title">TT&C</span>
        <span>Telemetry, Tracking & Command</span>
      </div>
      <div className="table-row">
        <span className="col-title">SSTV</span>
        <span>Slow Scan Television Image Transmission</span>
      </div>
      <div className="table-row">
        <span className="col-title">Codec2</span>
        <span>Low Bitrate Voice Compression</span>
      </div>
      <div className="table-row">
        <span className="col-title">M17</span>
        <span>Digital Voice & Data Protocol</span>
      </div>
    </div>
  </section>
);


const MissionConfigTab = ({
  missionData,
  onChange,
  onPayloadChange,
  onSubmit,
  submittedData,
}) => (
  <section className="sci-section">
    <h3>04. Mission Configuration Console</h3>
    <form className="mission-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label>Mission Name</label>
        <input
          type="text"
          name="missionName"
          value={missionData.missionName}
          onChange={onChange}
          placeholder="SomaiyaSat Demonstration Mission"
          required
        />
      </div>


      <div className="form-group">
        <label>Target Orbit</label>
        <select name="orbit" value={missionData.orbit} onChange={onChange}>
          <option value="LEO">LEO</option>
          <option value="SSO">SSO</option>
          <option value="MEO">MEO</option>
          <option value="GEO">GEO</option>
        </select>
      </div>


      <div className="form-group">
        <label>Communication Priority</label>
        <select name="priority" value={missionData.priority} onChange={onChange}>
          <option value="Telemetry">Telemetry</option>
          <option value="SSTV">SSTV</option>
          <option value="Codec2">Codec2</option>
          <option value="M17">M17</option>
        </select>
      </div>


      <div className="form-group">
        <label>Power Strategy</label>
        <select
          name="powerMode"
          value={missionData.powerMode}
          onChange={onChange}
        >
          <option value="Balanced">Balanced</option>
          <option value="Performance">Performance</option>
          <option value="Power Saving">Power Saving</option>
        </select>
      </div>


      <div className="form-group">
        <label>AI Policy</label>
        <select
          name="aiPolicy"
          value={missionData.aiPolicy}
          onChange={onChange}
        >
          <option value="Decision Tree">Decision Tree</option>
          <option value="Policy Agent">Policy Agent</option>
          <option value="Reinforcement Learning">Reinforcement Learning</option>
        </select>
      </div>


      <div className="form-group">
        <label>Enable Payloads</label>
        <div className="checkbox-grid">
          {PAYLOAD_OPTIONS.map((payload) => (
            <label key={payload}>
              <input
                type="checkbox"
                checked={missionData.payloads.includes(payload)}
                onChange={() => onPayloadChange(payload)}
              />
              {payload}
            </label>
          ))}
        </div>
      </div>


      <div className="form-group switch">
        <label>
          <input
            type="checkbox"
            name="emergencyMode"
            checked={missionData.emergencyMode}
            onChange={onChange}
          />
          Enable Emergency Safe Mode
        </label>
      </div>


      <div className="form-group">
        <label>Mission Notes</label>
        <textarea
          rows="5"
          name="notes"
          value={missionData.notes}
          onChange={onChange}
          placeholder="Enter mission objectives or deployment instructions..."
        ></textarea>
      </div>


      <button className="submit-btn" type="submit">
        UPLOAD CONFIGURATION
      </button>
    </form>


    {submittedData && (
      <div className="summary-card">
        <h3>Mission Summary</h3>
        <p><strong>Mission:</strong> {submittedData.missionName}</p>
        <p><strong>Orbit:</strong> {submittedData.orbit}</p>
        <p><strong>Priority:</strong> {submittedData.priority}</p>
        <p><strong>Power Mode:</strong> {submittedData.powerMode}</p>
        <p><strong>AI Policy:</strong> {submittedData.aiPolicy}</p>
        <p>
          <strong>Payloads:</strong>{" "}
          {submittedData.payloads.length
            ? submittedData.payloads.join(", ")
            : "None"}
        </p>
        <p>
          <strong>Emergency Mode:</strong>{" "}
          {submittedData.emergencyMode ? "Enabled" : "Disabled"}
        </p>
        <p><strong>Notes:</strong> {submittedData.notes || "None"}</p>
      </div>
    )}
  </section>
);


const TelemetryTab = ({ satellites, lastUpdated }) => {
  const criticalCount = useMemo(() => {
    return satellites.filter((sat) => sat.status === "Critical").length;
  }, [satellites]);


  return (
    <section className="sci-section">
      <h3>05. Satellite Telemetry Dashboard</h3>
      <p className="update-time">
        Last Updated: {lastUpdated.toLocaleTimeString()}
      </p>


      <div className="summary-card">
        <h3>Mission Status Summary</h3>
        <p>
          <strong>Total Satellites:</strong> {satellites.length}
        </p>
        <p>
          <strong>Critical Satellites:</strong> {criticalCount}
        </p>
      </div>


      <div className="satellite-grid">
        {satellites.map((sat) => (
          <div
            key={sat.id}
            className={`sat-card ${sat.status.toLowerCase()}`}
          >
            <h3>{sat.name}</h3>
            <p><strong>Battery:</strong> {sat.battery}%</p>
            <p><strong>Signal:</strong> {sat.signal}%</p>
            <p><strong>Orbit:</strong> {sat.altitude} km</p>
            <p><strong>Communication:</strong> {sat.communication}</p>
            <h4>
              {getStatusEmoji(sat.status)} {sat.status}
            </h4>


            {sat.status === "Critical" && (
              <div className="critical-alert">
                Immediate Mission Attention Required
              </div>
            )}
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
  const [activeTab, setActiveTab] = useState("overview");
  const [satellites, setSatellites] = useState(INITIAL_SATELLITES);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [missionData, setMissionData] = useState(INITIAL_MISSION_FORM);
  const [submittedData, setSubmittedData] = useState(null);


  // Periodically update satellite telemetry data
  useEffect(() => {
    const interval = setInterval(() => {
      setSatellites((prev) =>
        prev.map((sat) => {
          const battery = Math.max(
            0,
            Math.min(100, sat.battery + Math.floor(Math.random() * 11) - 5)
          );
          const signal = Math.max(
            0,
            Math.min(100, sat.signal + Math.floor(Math.random() * 11) - 5)
          );
          const altitude = sat.altitude + Math.floor(Math.random() * 5) - 2;
          const status = calculateStatus(battery, signal, altitude, sat.communication);


          return { ...sat, battery, signal, altitude, status };
        })
      );
      setLastUpdated(new Date());
    }, 3000);


    return () => clearInterval(interval);
  }, []);


  // Form input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMissionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  // Checkbox grid change handler
  const handlePayloadChange = (payload) => {
    setMissionData((prev) => {
      const exists = prev.payloads.includes(payload);
      return {
        ...prev,
        payloads: exists
          ? prev.payloads.filter((item) => item !== payload)
          : [...prev.payloads, payload],
      };
    });
  };


  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(missionData);
    alert("Mission Configuration Uploaded Successfully!");
    setMissionData(INITIAL_MISSION_FORM);
  };


  return (
    <div className="sci-wrapper">
      <Header />
      <Hero />
      <TechnicalParameters />


      {/* Navigation Tabs */}
      <nav className="sci-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          01 // OVERVIEW
        </button>
        <button
          className={`tab-btn ${activeTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          02 // AI ROUTING
        </button>
        <button
          className={`tab-btn ${activeTab === "payloads" ? "active" : ""}`}
          onClick={() => setActiveTab("payloads")}
        >
          03 // PAYLOADS
        </button>
        <button
          className={`tab-btn ${activeTab === "mission" ? "active" : ""}`}
          onClick={() => setActiveTab("mission")}
        >
          04 // MISSION CONFIG
        </button>
        <button
          className={`tab-btn ${activeTab === "telemetry" ? "active" : ""}`}
          onClick={() => setActiveTab("telemetry")}
        >
          05 // TELEMETRY
        </button>
      </nav>


      {/* Content Area */}
      <main className="sci-content">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "ai" && <AiRoutingTab />}
        {activeTab === "payloads" && <PayloadsTab />}
        {activeTab === "mission" && (
          <MissionConfigTab
            missionData={missionData}
            onChange={handleChange}
            onPayloadChange={handlePayloadChange}
            onSubmit={handleSubmit}
            submittedData={submittedData}
          />
        )}
        {activeTab === "telemetry" && (
          <TelemetryTab satellites={satellites} lastUpdated={lastUpdated} />
        )}
      </main>


      {/* Footer */}
      <footer className="sci-footer">
        <div>FACULTY LEADS</div>
        <div>SOMAIYA VIDYAVIHAR UNIVERSITY — KJSSE</div>
      </footer>
    </div>
  );
}


export default App;

