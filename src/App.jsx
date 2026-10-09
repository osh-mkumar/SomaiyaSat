import React, { useState, useEffect, useMemo } from "react";
// Load global styles first so they apply to all components immediately.
import "./App.css";

import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import RFPanel from "./components/RFPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import OrbitPanel from "./components/OrbitPanel";
import PayloadsPanel from "./components/PayloadsPanel";
import ExternalDataPanel from "./components/ExternalDataPanel";
import PassSchedulingConsole from "./components/PassSchedulingConsole";
import OverviewDashboard from "./components/OverviewDashboard";

import { fetchLocalSatellites, fetchLocalPayloads, getMissionRouting, getRoutingHistory } from "./services/satelliteApi";

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const MAX_HISTORY = 30;

const INITIAL_LIMITS = {
  upperBattery: 100,
  lowerBattery: 20,
  criticalBattery: 15,
  tempAlarm: 45,
  refreshInterval: 2000,
  highTempAlert: true,
  lowBatteryAlert: true
};

const INITIAL_SCHEDULED_PASSES = [
  {
    id: "PASS-1001",
    satellite: "SomaiyaSat-1",
    location: "19.0760° N, 72.8777° E",
    latitude: 19.0760,
    longitude: 72.8777,
    time: "16:00 UTC",
    date: new Date().toISOString().split('T')[0],
    status: "Scheduled",
    createdAt: new Date().toISOString()
  },
  {
    id: "PASS-1002",
    satellite: "SomaiyaSat-2",
    location: "28.6139° N, 77.2090° E",
    latitude: 28.6139,
    longitude: 77.2090,
    time: "18:30 UTC",
    date: new Date().toISOString().split('T')[0],
    status: "Scheduled",
    createdAt: new Date().toISOString()
  }
];

const TELEMETRY_METRICS = {
  missionId: "KJS-SRS-01",
  orbit: "Low Earth Orbit (LEO)",
  formFactor: "PocketQube (5cm Unit)",
  powerBudget: "< 1.0W Average",
  aiSubsystem: "Decision Tree / Policy Agent",
  primaryFrequencies: "Amateur HAM Bands",
};

const calculateStatus = (battery, signal, communication, limits) => {
  if (battery <= (limits?.criticalBattery || 15) || signal < 30 || communication === "Offline") return "CRITICAL";
  if ((battery > (limits?.criticalBattery || 15) && battery <= limits?.lowerBattery) || (signal >= 30 && signal < 60)) return "WARNING";
  if (battery > limits?.lowerBattery && signal >= 60 && communication === "Online") return "NOMINAL";
  return "UNKNOWN";
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// ==========================================
// SUB-COMPONENTS
// ==========================================

const AiRoutingTab = () => {
    const [activeAIRoutingView, setActiveAIRoutingView] = useState('DECISION QUEUE');
    const [routingData, setRoutingData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMissionRouting()
            .then(data => {
                setRoutingData(data);
                setLoading(false);
            })
            .catch(err => {
                console.warn('Failed to load mission routing recommendation:', err);
                setLoading(false);
            });

        getRoutingHistory()
            .then(data => {
                setHistoryData(data);
            })
            .catch(err => {
                console.warn('Failed to load routing history:', err);
            });
    }, []);

    const decisionQueue = routingData?.decisionQueue || [
        { payloadId: 'PAY-001', name: 'TT&C (Housekeeping)', priority: 'Critical', size: '12 KB', status: 'Queued', estTime: 'T-0:15' },
        { payloadId: 'PAY-002', name: 'SSTV Image Downlink', priority: 'High', size: '420 KB', status: 'Queued', estTime: 'T-1:30' },
        { payloadId: 'PAY-003', name: 'M17 Digital', priority: 'Normal', size: '85 KB', status: 'Queued', estTime: 'T-3:45' },
        { payloadId: 'PAY-004', name: 'Codec2 Voice', priority: 'Low', size: '40 KB', status: 'Queued', estTime: 'T-5:00' }
    ];

    const currentDecision = routingData || {
        selectedPayload: 'TT&C (Housekeeping)',
        priority: 'Critical',
        confidence: 94.2,
        constraints: { battery: 89, signal: 94, passRemainingMinutes: 12 },
        reason: 'Optimal battery level and high signal quality. Critical telemetry prioritized.'
    };

    const renderView = () => {
        if (loading) {
            return <div style={{ color: '#0df', marginTop: '20px' }}>Loading autonomous routing telemetry...</div>;
        }

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
                    {decisionQueue.map((item, i) => (
                        <div key={item.payloadId || i} className="table-row">
                            <span style={{ flex: 1 }}>{item.name}</span>
                            <span style={{ width: '100px', color: item.priority === 'Critical' ? '#ff5555' : item.priority === 'High' ? '#ffb86c' : '#50fa7b' }}>
                                {item.priority}
                            </span>
                            <span style={{ width: '80px' }}>{item.size}</span>
                            <span style={{ width: '100px', color: '#0df' }}>{item.status}</span>
                            <span style={{ width: '120px' }}>{item.estTime || `T-0:${(i + 1) * 15}`}</span>
                        </div>
                    ))}
                </div>
            );
        }
        
        if (activeAIRoutingView === 'CURRENT DECISION') {
            return (
                <div className="summary-card" style={{ background: '#111827', padding: '20px', border: '1px solid #334', borderLeft: '4px solid #0df', marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#0df' }}>AI ROUTING DECISION</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#8892b0', fontSize: '0.9em', marginBottom: '5px' }}>Selected Payload</div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{currentDecision.selectedPayload}</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Battery</div>
                            <div style={{ color: (currentDecision.constraints?.battery || 89) < 30 ? '#ff5555' : '#50fa7b' }}>
                                {currentDecision.constraints?.battery || 89}%
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Signal</div>
                            <div style={{ color: '#50fa7b' }}>{currentDecision.constraints?.signal || 94}%</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Pass Remaining</div>
                            <div>{currentDecision.constraints?.passRemainingMinutes || 12}m</div>
                        </div>
                        <div>
                            <div style={{ color: '#8892b0', fontSize: '0.9em' }}>Payload Priority</div>
                            <div style={{ color: '#ff5555' }}>{currentDecision.priority || 'Critical'}</div>
                        </div>
                    </div>
                    
                    <div style={{ background: '#0a0f18', padding: '15px', borderLeft: '2px solid #ffb86c' }}>
                        <div style={{ color: '#8892b0', fontSize: '0.9em', marginBottom: '5px' }}>Decision Explanation</div>
                        <p style={{ margin: 0 }}>{currentDecision.reason}</p>
                        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                            <strong style={{ color: '#8892b0' }}>Confidence:</strong> <span style={{ color: '#50fa7b' }}>{currentDecision.confidence || 94.2}%</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeAIRoutingView === 'HISTORY') {
            const list = historyData && historyData.length > 0 ? historyData : [
                { timestamp: new Date(), selectedPayload: currentDecision.selectedPayload, constraints: currentDecision.constraints, reason: currentDecision.reason }
            ];

            return (
                <div className="spec-table">
                    <div className="table-row" style={{ borderBottom: '2px solid #1a2b4c' }}>
                        <span className="col-title" style={{ width: '100px' }}>Time</span>
                        <span className="col-title" style={{ flex: 1 }}>Selected</span>
                        <span className="col-title" style={{ width: '60px' }}>Batt</span>
                        <span className="col-title" style={{ width: '60px' }}>Sig</span>
                        <span className="col-title" style={{ flex: 2 }}>Reason</span>
                    </div>
                    {list.map((h, idx) => (
                        <div key={h._id || idx} className="table-row">
                            <span style={{ width: '100px' }}>
                                {h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : '14:20:10'}
                            </span>
                            <span style={{ flex: 1 }}>{h.selectedPayload}</span>
                            <span style={{ width: '60px', color: '#50fa7b' }}>{h.constraints?.battery || 89}%</span>
                            <span style={{ width: '60px', color: '#50fa7b' }}>{h.constraints?.signal || 94}%</span>
                            <span style={{ flex: 2, fontSize: '0.9em', color: '#8892b0' }}>{h.reason}</span>
                        </div>
                    ))}
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


// ==========================================
// MAIN COMPONENT
// ==========================================

function App() {
  // REQUIREMENT 4: Initial activeTab defaults to "overview"
  const [activeTab, setActiveTab] = useState("overview");
  const [role, setRole] = useState("Admin");
  
  // Shared pass state
  const [scheduledPasses, setScheduledPasses] = useState(INITIAL_SCHEDULED_PASSES);
  const [selectedPass, setSelectedPass] = useState(INITIAL_SCHEDULED_PASSES[0]);

  // Shared single-source-of-truth telemetry & limits state
  const [satellites, setSatellites] = useState([]);
  const [telemetryHistory, setTelemetryHistory] = useState({});
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [payloads, setPayloads] = useState([]);

  // Fetch initial telemetry and payloads data
  useEffect(() => {
    fetchLocalSatellites()
      .then(resData => {
        const data = Array.isArray(resData) ? resData : (resData?.data || []);
        const formattedSats = data.map(sat => ({
          ...sat,
          altitude: sat.altitude !== undefined ? sat.altitude : (sat.orbit || 500)
        }));
        setSatellites(formattedSats);
        const initialHist = {};
        formattedSats.forEach(sat => {
          initialHist[sat.id] = {
            battery: Array(MAX_HISTORY).fill(sat.battery),
            signal: Array(MAX_HISTORY).fill(sat.signal),
            temp: Array(MAX_HISTORY).fill(sat.temp),
          };
        });
        setTelemetryHistory(initialHist);
      })
      .catch(err => {
        console.warn("Failed to load satellite data, using fallback:", err.message);
        const fallbackSats = [
          { id: "SS-001", name: "SomaiyaSat-1", status: "Nominal", battery: 89, signal: 94, temp: 24.8, altitude: 504, communication: "Online" },
          { id: "SS-002", name: "SomaiyaSat-2", status: "Warning", battery: 46, signal: 64, temp: 31.2, altitude: 500, communication: "Online" },
          { id: "SS-003", name: "SomaiyaSat-3", status: "Critical", battery: 25, signal: 38, temp: 42.1, altitude: 461, communication: "Offline" }
        ];
        setSatellites(fallbackSats);
      });

    fetchLocalPayloads()
      .then(resData => {
        const data = Array.isArray(resData) ? resData : (resData?.data || []);
        setPayloads(data);
      })
      .catch(err => {
        console.warn("Failed to load payload data, using fallback:", err.message);
        setPayloads([
          { id: "P001", name: "Housekeeping Telemetry", type: "TT&C", priority: "Critical", size: "12 KB", status: "Queued" },
          { id: "P002", name: "Wide-Angle Earth Image", type: "SSTV", priority: "Normal", size: "45 KB", status: "Transmitting" },
          { id: "P003", name: "Ham Radio Broadcast", type: "Codec2", priority: "Low", size: "8 KB", status: "Suspended" },
          { id: "P004", name: "Experimental Data", type: "M17", priority: "Normal", size: "25 KB", status: "Queued" }
        ]);
      });
  }, []);

  // Single live telemetry update loop (shared by Overview, Telemetry, Command & Config)
  useEffect(() => {
    if (!Array.isArray(satellites) || satellites.length === 0) return;

    const interval = setInterval(() => {
      setSatellites(prevSats => {
        if (!Array.isArray(prevSats)) return [];
        const nextSats = prevSats.map(sat => {
          const batteryDelta = (Math.random() * 0.2 - 0.1);
          const signalDelta = (Math.random() * 2 - 1);
          const tempDelta = (Math.random() * 0.4 - 0.2);

          const newBattery = Math.max(0, Math.min(100, sat.battery + batteryDelta));
          const newSignal = Math.max(0, Math.min(100, sat.signal + signalDelta));
          const newTemp = Math.max(-20, Math.min(80, sat.temp + tempDelta));
          const currentAlt = sat.altitude !== undefined ? sat.altitude : (sat.orbit || 500);
          const newOrbit = currentAlt + (Math.random() * 0.2 - 0.1);

          return {
            ...sat,
            battery: newBattery,
            signal: newSignal,
            temp: newTemp,
            altitude: newOrbit
          };
        });

        setTelemetryHistory(prevHist => {
          const nextHist = { ...prevHist };
          nextSats.forEach(sat => {
            const h = nextHist[sat.id];
            if (h && h.battery) {
              nextHist[sat.id] = {
                battery: [...h.battery.slice(1), sat.battery],
                signal: [...h.signal.slice(1), sat.signal],
                temp: [...h.temp.slice(1), sat.temp],
              };
            }
          });
          return nextHist;
        });

        return nextSats;
      });
    }, limits.refreshInterval);

    return () => clearInterval(interval);
  }, [satellites.length, limits.refreshInterval]);

  const satellitesWithStatus = useMemo(() => {
    if (!Array.isArray(satellites)) return [];
    return satellites.map(sat => ({
      ...sat,
      status: calculateStatus(sat.battery, sat.signal, sat.communication, limits)
    }));
  }, [satellites, limits]);

  return (
    <div className="app-container">
      <TopBar role={role} setRole={setRole} />
      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content-area">
          {activeTab !== 'mission' && (
            <div className="legacy-content-wrapper">
              <div className="sci-content" style={{ padding: activeTab === 'overview' ? '25px' : '30px' }}>
                {activeTab === "overview" && (
                  <OverviewDashboard
                    satellites={satellitesWithStatus}
                    selectedPass={selectedPass}
                    scheduledPasses={scheduledPasses}
                    payloads={payloads}
                    setActiveTab={setActiveTab}
                    telemetryMetrics={TELEMETRY_METRICS}
                  />
                )}
                {activeTab === "ai" && <AiRoutingTab />}
                {activeTab === "payloads" && <PayloadsPanel role={role} payloads={payloads} setPayloads={setPayloads} />}
                {activeTab === "telemetry" && (
                  <TelemetryPanel
                    role={role}
                    selectedPass={selectedPass}
                    satellites={satellitesWithStatus}
                    history={telemetryHistory}
                    limits={limits}
                    setLimits={setLimits}
                  />
                )}
                {activeTab === "passes" && (
                  <PassSchedulingConsole
                    role={role}
                    scheduledPasses={scheduledPasses}
                    setScheduledPasses={setScheduledPasses}
                    selectedPass={selectedPass}
                    setSelectedPass={setSelectedPass}
                  />
                )}
                {activeTab === "external" && <ExternalDataPanel />}
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="mission-dashboard-grid">
              <RFPanel role={role} selectedPass={selectedPass} />
              <TelemetryPanel
                role={role}
                compact={true}
                selectedPass={selectedPass}
                satellites={satellitesWithStatus}
                history={telemetryHistory}
                limits={limits}
                setLimits={setLimits}
              />
              <OrbitPanel selectedPass={selectedPass} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
