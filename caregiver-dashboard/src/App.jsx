import React, { useState, useEffect } from 'react';
import './App.css';

const MOCK_PATIENTS = [
  { id: 1, name: 'Robert Wilson', age: 78, status: 'Healthy', lastUpdate: '2 mins ago' },
  { id: 2, name: 'Alice Smith', age: 82, status: 'Medicine Missed', lastUpdate: '10 mins ago' },
  { id: 3, name: 'John Doe', age: 85, status: 'Healthy', lastUpdate: '1 min ago' },
];

function App() {
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 style={{ color: 'var(--accent)', marginBottom: '40px' }}>CareLink AI</h2>
        <nav>
          <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
            Patients
          </div>
          {MOCK_PATIENTS.map(p => (
            <div 
              key={p.id} 
              className={`patient-item ${selectedPatient?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(p)}
            >
              <div className="patient-name">{p.name}</div>
              <div className={`patient-status-dot ${p.status === 'Healthy' ? 'status-green' : 'status-red'}`}></div>
            </div>
          ))}
        </nav>
      </div>

      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1>{selectedPatient?.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Age: {selectedPatient?.age} • Patient ID: #PAT-00{selectedPatient?.id}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary">Send Message</button>
            <button className="btn btn-danger">Alert Services</button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="card stat-card">
            <h3>Medicine Adherence</h3>
            <div className="stat-value">85%</div>
            <div className="stat-label">Last 7 days</div>
          </div>
          <div className="card stat-card">
            <h3>Game Performance</h3>
            <div className="stat-value">+12%</div>
            <div className="stat-label">Cognitive Score</div>
          </div>
          <div className="card stat-card">
            <h3>Mood Stability</h3>
            <div className="stat-value">Stable</div>
            <div className="stat-label">Based on AI Analysis</div>
          </div>
        </div>

        <div className="card section-card">
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <span className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</span>
            <span className={`tab ${activeTab === 'medicine' ? 'active' : ''}`} onClick={() => setActiveTab('medicine')}>Medicine</span>
            <span className={`tab ${activeTab === 'sos' ? 'active' : ''}`} onClick={() => setActiveTab('sos')}>SOS Logs</span>
            <span className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>AI Chatbot Summary</span>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div>
                <p>Real-time monitoring active. No major incidents in the last 24 hours.</p>
                <div className="chart-placeholder">
                  [Interactive Chart Integration - Recharts]
                </div>
              </div>
            )}
            {activeTab === 'medicine' && (
              <div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Scheduled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Lisinopril</td>
                      <td>09:00 AM</td>
                      <td><span className="tag success">Taken</span></td>
                    </tr>
                    <tr>
                      <td>Metformin</td>
                      <td>01:00 PM</td>
                      <td><span className="tag warning">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'sos' && (
              <div className="sos-list">
                <div className="sos-item danger">
                  <strong>Fall Detected</strong> - Oct 08, 2023 10:45 AM (Canceled by user)
                </div>
                <div className="sos-item">
                  <strong>Manual SOS</strong> - Sep 30, 2023 02:20 PM (Emergency alerted)
                </div>
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="chat-summary">
                <p><strong>Recent Topics:</strong> Joint pain, medication side effects, request for exercise tips.</p>
                <p><strong>AI Assessment:</strong> Highly engaged. Showing slight anxiety regarding new dosage.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .patient-item {
          padding: 12px 15px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          transition: background 0.2s;
        }
        .patient-item:hover { background-color: var(--bg-tertiary); }
        .patient-item.active { background-color: var(--bg-tertiary); border: 1px solid var(--border); }
        .patient-status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-green { background-color: var(--success); box-shadow: 0 0 8px var(--success); }
        .status-red { background-color: var(--danger); box-shadow: 0 0 8px var(--danger); }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-value { font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--accent); }
        .stat-label { color: var(--text-secondary); font-size: 14px; }
        
        .tab { cursor: pointer; color: var(--text-secondary); font-weight: 600; padding: 5px 0; position: relative; }
        .tab.active { color: var(--accent); }
        .tab.active::after { content: ''; position: absolute; bottom: -11px; left: 0; width: 100%; height: 2px; background-color: var(--accent); }
        
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 12px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
        .data-table td { padding: 12px; border-bottom: 1px solid var(--border); }
        
        .tag { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        .tag.success { background-color: rgba(63, 185, 80, 0.1); color: var(--success); }
        .tag.warning { background-color: rgba(210, 153, 34, 0.1); color: var(--warning); }
        
        .sos-item { padding: 15px; border-radius: 8px; background: var(--bg-tertiary); margin-bottom: 10px; border-left: 4px solid var(--border); }
        .sos-item.danger { border-left-color: var(--danger); }
        
        .chart-placeholder { height: 200px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 1px dashed var(--border); border-radius: 8px; margin-top: 20px; }
      `}</style>
    </div>
  );
}

export default App;
