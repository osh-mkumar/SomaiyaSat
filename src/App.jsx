import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import RFPanel from "./components/RFPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import OrbitPanel from "./components/OrbitPanel";
import PayloadsPanel from "./components/PayloadsPanel";
import ExternalDataPanel from "./components/ExternalDataPanel";

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================



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

// PayloadsTab removed as it is now in its own component


// ==========================================
// MAIN COMPONENT
// ==========================================

function App() {
  const [activeTab, setActiveTab] = useState("mission"); // Default to the new dashboard as per reqs
  const [role, setRole] = useState("Admin");

  return (
    <div className="app-container">
      <TopBar role={role} setRole={setRole} />
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
                {activeTab === "payloads" && <PayloadsPanel role={role} />}
                {activeTab === "telemetry" && <TelemetryPanel role={role} />}
                {activeTab === "external" && <ExternalDataPanel />}
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="mission-dashboard-grid">
              <RFPanel role={role} />
              <TelemetryPanel role={role} />
              <OrbitPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
