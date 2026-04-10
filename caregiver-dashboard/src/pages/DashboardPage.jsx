import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Activity, Shield, Bell, LogOut, 
  Search, CheckCircle, Clock, Map as MapIcon, 
  MessageSquare, Calendar, TrendingUp
} from 'lucide-react';
import AlertOverlay from '../components/AlertOverlay';

const MOCK_PATIENTS = [
  { id: 1, name: 'Robert Wilson', age: 78, status: 'Healthy', lastUpdate: '2 mins ago', room: '302', contact: '+1 (555) 012-3456' },
  { id: 2, name: 'Alice Smith', age: 82, status: 'Medicine Missed', lastUpdate: '10 mins ago', room: '105', contact: '+1 (555) 987-6543' },
  { id: 3, name: 'John Doe', age: 85, status: 'Healthy', lastUpdate: '1 min ago', room: '211', contact: '+1 (555) 456-7890' },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeAlert, setActiveAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulated Polling for SOS/Fall Events
  useEffect(() => {
    const checkAlerts = () => {
      // 5% chance of triggering an alert for demo purposes
      if (Math.random() < 0.05 && !activeAlert) {
        const isFall = Math.random() > 0.5;
        setActiveAlert({
          type: isFall ? 'FALL' : 'SOS',
          patientName: MOCK_PATIENTS[Math.floor(Math.random() * MOCK_PATIENTS.length)].name,
          message: isFall 
            ? 'Abrupt movement detected in Room 302. System suggests a possible fall.'
            : 'Emergency SOS button pressed. Immediate attention required.',
        });
      }
    };

    const interval = setInterval(checkAlerts, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [activeAlert]);

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Shield className="logo-icon" />
          <h2>CareLink AI</h2>
        </div>

        <div className="sidebar-search">
          <Search size={18} />
          <input 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">MY PATIENTS</div>
          {filteredPatients.map(p => (
            <div 
              key={p.id} 
              className={`patient-item ${selectedPatient?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(p)}
            >
              <div className="patient-avatar">{p.name[0]}</div>
              <div className="patient-info">
                <span className="name">{p.name}</span>
                <span className="meta">Room {p.room}</span>
              </div>
              <div className={`status-dot ${p.status === 'Healthy' ? 'green' : 'orange'}`}></div>
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name[0]}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Caretaker</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>{selectedPatient?.name}</h1>
            <div className="header-meta">
              <span><Clock size={16} /> Last checked: {selectedPatient?.lastUpdate}</span>
              <span><MapIcon size={16} /> Room {selectedPatient?.room}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary"><MessageSquare size={18} /> Chat</button>
            <button className="btn btn-primary btn-sos" onClick={() => setActiveAlert({
              type: 'SOS',
              patientName: selectedPatient.name,
              message: 'Manual SOS triggered from dashboard for testing.'
            })}>Simulate SOS</button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><Activity /></div>
            <div className="stat-data">
              <span className="label">Heart Rate</span>
              <span className="value">72 BPM</span>
              <span className="trend positive">+2% Normal</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle /></div>
            <div className="stat-data">
              <span className="label">Medication Adherence</span>
              <span className="value">94%</span>
              <span className="trend positive">Excellent</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><TrendingUp /></div>
            <div className="stat-data">
              <span className="label">Cognitive Score</span>
              <span className="value">88/100</span>
              <span className="trend positive">+5 pts</span>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <div className="content-grid">
          <div className="main-panel">
            <div className="tabs">
              <button 
                className={activeTab === 'overview' ? 'active' : ''} 
                onClick={() => setActiveTab('overview')}
              >Overview</button>
              <button 
                className={activeTab === 'meds' ? 'active' : ''} 
                onClick={() => setActiveTab('meds')}
              >Medication</button>
              <button 
                className={activeTab === 'activity' ? 'active' : ''} 
                onClick={() => setActiveTab('activity')}
              >Activity Log</button>
            </div>

            <div className="tab-pane">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="map-placeholder">
                    <MapIcon size={48} />
                    <p>Live Location Tracking</p>
                    <span className="coord">40.7128° N, 74.0060° W (Living Room)</span>
                  </div>
                  <div className="daily-summary">
                    <h3>Today's Summary</h3>
                    <p>Patient has been active for 4 hours. No significant mood fluctuations detected. Medicine taken at 09:00 AM.</p>
                  </div>
                </div>
              )}
              {activeTab === 'meds' && (
                <table className="med-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Lisinopril (10mg)</td>
                      <td>09:00 AM</td>
                      <td><span className="badge success">Taken</span></td>
                    </tr>
                    <tr>
                      <td>Metformin (500mg)</td>
                      <td>01:00 PM</td>
                      <td><span className="badge warning">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              )}
              {activeTab === 'activity' && (
                <div className="activity-list">
                  <div className="activity-item">
                    <Clock size={14} />
                    <span className="time">14:10</span>
                    <span className="text">Went to the garden</span>
                  </div>
                  <div className="activity-item">
                    <Clock size={14} />
                    <span className="time">12:30</span>
                    <span className="text">Finished lunch</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="side-panel">
            <div className="panel-card">
              <h3>To-Do List</h3>
              <div className="todo-item">
                <input type="checkbox" />
                <span>Check blood pressure</span>
              </div>
              <div className="todo-item">
                <input type="checkbox" />
                <span>Refill pill organizer</span>
              </div>
            </div>

            <div className="panel-card">
              <h3>Emergency Contacts</h3>
              <div className="contact-item">
                <span className="name">Sarah Wilson</span>
                <span className="rel">Daughter</span>
              </div>
              <div className="contact-item">
                <span className="name">Dr. Michael Chen</span>
                <span className="rel">Cardiologist</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Alert Component */}
      <AlertOverlay alert={activeAlert} onClear={() => setActiveAlert(null)} />

      <style>{`
        .dashboard-layout {
          display: flex;
          height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* Sidebar Styling */
        .sidebar {
          width: 280px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .logo-icon { color: var(--accent); }

        .sidebar-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-primary);
          padding: 10px 15px;
          border-radius: 10px;
          margin-bottom: 25px;
          border: 1px solid var(--border);
        }

        .sidebar-search input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          width: 100%;
        }

        .nav-label {
          font-size: 11px;
          font-weight: bold;
          color: var(--text-secondary);
          margin-bottom: 15px;
          letter-spacing: 1px;
        }

        .patient-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 5px;
          transition: background 0.2s;
        }

        .patient-item:hover { background: var(--bg-tertiary); }
        .patient-item.active { background: var(--bg-tertiary); border: 1px solid var(--border); }

        .patient-avatar {
          width: 36px;
          height: 36px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .patient-info { flex: 1; display: flex; flex-direction: column; }
        .patient-info .name { font-weight: 600; font-size: 14px; }
        .patient-info .meta { font-size: 12px; color: var(--text-secondary); }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.green { background: var(--success); box-shadow: 0 0 8px var(--success); }
        .status-dot.orange { background: var(--warning); box-shadow: 0 0 8px var(--warning); }

        .sidebar-user {
          margin-top: auto;
          display: flex;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .user-avatar { width: 40px; height: 40px; background: #30363d; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .user-details { flex: 1; margin-left: 12px; display: flex; flex-direction: column; }
        .user-name { font-weight: bold; font-size: 14px; }
        .user-role { font-size: 12px; color: var(--text-secondary); }

        .logout-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
        .logout-btn:hover { color: var(--danger); }

        /* Main Content Styling */
        .main-content { flex: 1; overflow-y: auto; padding: 40px; }

        .content-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .header-title h1 { font-size: 32px; margin-bottom: 10px; }
        .header-meta { display: flex; gap: 20px; color: var(--text-secondary); font-size: 14px; }
        .header-meta span { display: flex; align-items: center; gap: 6px; }

        .header-actions { display: flex; gap: 12px; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px; }
        .stat-card { background: var(--bg-secondary); border: 1px solid var(--border); padding: 25px; border-radius: 16px; display: flex; gap: 20px; }
        
        .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.blue { background: rgba(31, 111, 235, 0.1); color: #1f6feb; }
        .stat-icon.green { background: rgba(63, 185, 80, 0.1); color: #3fb950; }
        .stat-icon.yellow { background: rgba(210, 153, 34, 0.1); color: #d29922; }

        .stat-data { display: flex; flex-direction: column; }
        .stat-data .label { font-size: 12px; color: var(--text-secondary); font-weight: bold; text-transform: uppercase; }
        .stat-data .value { font-size: 24px; font-weight: bold; margin: 4px 0; }
        .stat-data .trend { font-size: 12px; font-weight: 600; }
        .stat-data .trend.positive { color: var(--success); }

        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }

        .tabs { display: flex; gap: 30px; border-bottom: 1px solid var(--border); margin-bottom: 25px; }
        .tabs button { background: transparent; border: none; padding-bottom: 12px; color: var(--text-secondary); font-weight: 600; cursor: pointer; position: relative; }
        .tabs button.active { color: var(--accent); }
        .tabs button.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--accent); }

        .map-placeholder { 
          height: 250px; 
          background: var(--bg-tertiary); 
          border-radius: 16px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          border: 1px dashed var(--border);
          margin-bottom: 25px;
          color: var(--text-secondary);
        }

        .map-placeholder .coord { font-family: monospace; font-size: 12px; margin-top: 10px; }

        .daily-summary h3 { margin-bottom: 12px; font-size: 18px; }
        .daily-summary p { color: var(--text-secondary); line-height: 1.6; }

        .panel-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 25px; }
        .panel-card h3 { font-size: 16px; margin-bottom: 15px; color: var(--text-secondary); }

        .todo-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .todo-item:last-child { border-bottom: none; }
        .todo-item span { font-size: 14px; }

        .contact-item { display: flex; flex-direction: column; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .contact-item:last-child { border-bottom: none; }
        .contact-item .name { font-weight: 600; font-size: 14px; }
        .contact-item .rel { font-size: 12px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
};

export default DashboardPage;
