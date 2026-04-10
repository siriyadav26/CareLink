import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity, Users } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <nav className="welcome-nav">
        <div className="logo">
          <Heart className="icon-heart" />
          <span>CareLink AI</span>
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')} className="btn btn-secondary">Login</button>
          <button onClick={() => navigate('/signup')} className="btn btn-primary">Sign Up</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Modern Care for Your <span className="text-gradient">Loved Ones</span></h1>
          <p>
            The world's most advanced AI-powered dashboard for caregivers. 
            Monitor health, track activity, and receive instant emergency alerts 
            to ensure peace of mind.
          </p>
          <div className="cta-group">
            <button onClick={() => navigate('/signup')} className="btn btn-lg btn-primary">Get Started</button>
            <button className="btn btn-lg btn-outline">Watch Demo</button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">99.9%</span>
              <span className="stat-label">Alert Accuracy</span>
            </div>
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">AI Monitoring</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="glass-card main-preview">
            <div className="preview-header">
              <Activity className="icon-pulse" />
              <span>Real-time Health Feed</span>
            </div>
            <div className="preview-content">
              {/* Mock visualization */}
              <div className="pulse-line"></div>
              <div className="stats-row">
                <div className="stat-dot green"></div>
                <div className="stat-dot blue"></div>
                <div className="stat-dot orange"></div>
              </div>
            </div>
          </div>
          <div className="glass-card floating-card-1">
            <Shield className="icon-shield" />
            <span>SOS Detected</span>
          </div>
          <div className="glass-card floating-card-2">
            <Users className="icon-users" />
            <span>3 Active Patients</span>
          </div>
        </div>
      </main>

      <section className="features-grid">
        <div className="feature-card">
          <Activity className="feature-icon" />
          <h3>Fall Detection</h3>
          <p>Instant alerts powered by edge-AI vision when a fall is detected.</p>
        </div>
        <div className="feature-card">
          <Shield className="feature-icon" />
          <h3>SOS Protocol</h3>
          <p>One-tap emergency broadcast to local services and family members.</p>
        </div>
        <div className="feature-card">
          <Heart className="feature-icon" />
          <h3>Health Insights</h3>
          <p>AI analysis of mood, medication adherence, and cognitive performance.</p>
        </div>
      </section>

      <style>{`
        .welcome-container {
          min-height: 100vh;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          padding: 20px 80px;
          overflow-x: hidden;
        }
        
        .welcome-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          margin-bottom: 60px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: bold;
          color: var(--accent);
        }
        
        .icon-heart { color: #f85149; }
        
        .nav-buttons {
          display: flex;
          gap: 15px;
        }
        
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 100px;
        }
        
        .hero-content h1 {
          font-size: 64px;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        
        .text-gradient {
          background: linear-gradient(90deg, #1f6feb, #e3b341);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .hero-content p {
          font-size: 20px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 500px;
        }
        
        .cta-group {
          display: flex;
          gap: 20px;
          margin-bottom: 60px;
        }
        
        .btn-lg {
          padding: 16px 32px;
          font-size: 18px;
        }
        
        .btn-outline {
          border: 1px solid var(--border);
          background: transparent;
        }
        
        .hero-stats {
          display: flex;
          gap: 40px;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
        }
        
        .stat-num {
          font-size: 32px;
          font-weight: bold;
          color: var(--accent);
        }
        
        .stat-label {
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .hero-image {
          position: relative;
          height: 500px;
        }
        
        .glass-card {
          background: rgba(22, 27, 34, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(48, 54, 61, 0.8);
          border-radius: 16px;
          padding: 20px;
        }
        
        .main-preview {
          width: 400px;
          height: 300px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        
        .preview-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .icon-pulse { color: #3fb950; animation: pulse-anim 2s infinite; }
        
        @keyframes pulse-anim {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .floating-card-1 {
          position: absolute;
          top: 10%;
          right: 10%;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f85149;
          font-weight: bold;
          animation: float-anim 4s infinite ease-in-out;
        }
        
        .floating-card-2 {
          position: absolute;
          bottom: 15%;
          left: 5%;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1f6feb;
          font-weight: bold;
          animation: float-anim 5s infinite ease-in-out reverse;
        }
        
        @keyframes float-anim {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          padding-bottom: 100px;
        }
        
        .feature-card {
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid var(--border);
          transition: transform 0.3s;
        }
        
        .feature-card:hover { transform: translateY(-10px); }
        
        .feature-icon {
          width: 40px;
          height: 40px;
          color: var(--accent);
          margin-bottom: 20px;
        }
        
        @media (max-width: 1024px) {
          .welcome-container { padding: 20px 40px; }
          .hero-section { grid-template-columns: 1fr; }
          .hero-image { display: none; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
