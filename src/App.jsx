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

const AiRoutingTab = () => {
    const [activeAIRoutingView, setActiveAIRoutingView] = useState('DECISION QUEUE');

    const renderView = () => {
        if (activeAIRoutingView === 'DECISION QUEUE') {
            return (
                <div className="spec-table">
                    <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c' }}>
                        <span className="col-title" style={{ flex: 1 }}>Payload</span>
                        <span className="col-title" style={{ width: '100px' }}>Priority</span>
                        <span className="col-title" style={{ width: '80px' }}>Size</span>
                        <span className="col-title" style={{ width: '100px' }}>Status</span>
                        <span className="col-title" style={{ width: '120px' }}>Est. Time</span>
                    </div>
                    <div className="table-row">
                        <span style={{ flex: 1 }}>TT&C (Housekeeping)</span>
                        <span style={{ width: '100px', color: '#ff5555' }}>Critical</span>
                        <span style={{ width: '80px' }}>12 KB</span>
                        <span style={{ width: '100px', color: '#0df' }}>Queued</span>
                        <span style={{ width: '120px' }}>T-0:15</span>
                    </div>
                    <div className="table-row">
                        <span style={{ flex: 1 }}>SSTV Image Downlink</span>
                        <span style={{ width: '100px', color: '#ffb86c' }}>High</span>
                        <span style={{ width: '80px' }}>420 KB</span>
                        <span style={{ width: '100px', color: '#0df' }}>Queued</span>
                        <span style={{ width: '120px' }}>T-1:30</span>
                    </div>
                    <div className="table-row">
                        <span style={{ flex: 1 }}>M17 Digital</span>
                        <span style={{ width: '100px', color: '#8892b0' }}>Medium</span>
                        <span style={{ width: '80px' }}>85 KB</span>
                        <span style={{ width: '100px', color: '#0df' }}>Queued</span>
                        <span style={{ width: '120px' }}>T-3:45</span>
                    </div>
                    <div className="table-row">
                        <span style={{ flex: 1 }}>Codec2 Voice</span>
                        <span style={{ width: '100px', color: '#8892b0' }}>Medium</span>
                        <span style={{ width: '80px' }}>40 KB</span>
                        <span style={{ width: '100px', color: '#0df' }}>Queued</span>
                        <span style={{ width: '120px' }}>T-5:00</span>
                    </div>
                </div>
            );
        }
        
        if (activeAIRoutingView === 'CURRENT DECISION') {
            return (
                <div className="summary-card" style={{ background: '#111827', padding: '20px', border: '1px solid #334', borderLeft: '4px solid #0df', marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#0df' }}>AI ROUTING DECISION</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#8892b0', fontSize: '0.9em', marginBottom: '5px' }}>Selected Payload</div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>TT&C (Housekeeping)</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Battery</div>
                            <div style={{ color: '#ffb86c' }}>24% (Low)</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Signal</div>
                            <div style={{ color: '#50fa7b' }}>94% (Strong)</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Pass Remaining</div>
                            <div>12m 15s</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Payload Priority</div>
                            <div style={{ color: '#ff5555' }}>Critical</div>
                        </div>
                    </div>
                    
                    <div style={{ background: '#0a0f18', padding: '15px', borderLeft: '2px solid #ffb86c' }}>
                        <div style={{ color: '#8892b0', fontSize: '0.9em', marginBottom: '5px' }}>Decision Explanation</div>
                        <p style={{ margin: 0 }}>Battery level is low and the communication window is limited. Critical telemetry has been prioritized. SSTV imaging suspended until battery &gt; 30%.</p>
                        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                            <strong style={{ color: '#8892b0' }}>Confidence:</strong> <span style={{ color: '#50fa7b' }}>94.2%</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeAIRoutingView === 'HISTORY') {
            return (
                <div className="spec-table">
                    <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c' }}>
                        <span className="col-title" style={{ width: '100px' }}>Time</span>
                        <span className="col-title" style={{ flex: 1 }}>Selected</span>
                        <span className="col-title" style={{ width: '60px' }}>Batt</span>
                        <span className="col-title" style={{ width: '60px' }}>Sig</span>
                        <span className="col-title" style={{ flex: 2 }}>Reason</span>
                    </div>
                    <div className="table-row">
                        <span style={{ width: '100px' }}>14:20:10</span>
                        <span style={{ flex: 1 }}>SSTV Image</span>
                        <span style={{ width: '60px', color: '#50fa7b' }}>89%</span>
                        <span style={{ width: '60px', color: '#50fa7b' }}>92%</span>
                        <span style={{ flex: 2, fontSize: '0.9em', color: '#8892b0' }}>Optimal conditions for high bandwidth data.</span>
                    </div>
                    <div className="table-row">
                        <span style={{ width: '100px' }}>12:45:05</span>
                        <span style={{ flex: 1 }}>TT&C</span>
                        <span style={{ width: '60px', color: '#ffb86c' }}>45%</span>
                        <span style={{ width: '60px', color: '#ffb86c' }}>65%</span>
                        <span style={{ flex: 2, fontSize: '0.9em', color: '#8892b0' }}>Routine sync cycle priority.</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <section className="sci-section">
            <h3>02. Autonomous Routing Engine</h3>
            <p>
                The onboard scheduler determines which subsystem should receive
                communication bandwidth based on battery percentage, signal quality, queue
                urgency, and mission objectives.
            </p>
            <div className="virtual-tabs" style={{ marginTop: '20px' }}>
                <button className={`virtual-tab-btn ${activeAIRoutingView === 'DECISION QUEUE' ? 'active' : ''}`} onClick={() => setActiveAIRoutingView('DECISION QUEUE')}>DECISION QUEUE</button>
                <button className={`virtual-tab-btn ${activeAIRoutingView === 'CURRENT DECISION' ? 'active' : ''}`} onClick={() => setActiveAIRoutingView('CURRENT DECISION')}>CURRENT DECISION</button>
                <button className={`virtual-tab-btn ${activeAIRoutingView === 'HISTORY' ? 'active' : ''}`} onClick={() => setActiveAIRoutingView('HISTORY')}>HISTORY</button>
            </div>
            {renderView()}
        </section>
    );
};

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
