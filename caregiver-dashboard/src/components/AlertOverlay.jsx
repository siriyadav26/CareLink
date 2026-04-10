import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield, Phone, MapPin } from 'lucide-react';

const AlertOverlay = ({ alert, onClear }) => {
  if (!alert) return null;

  const isFall = alert.type === 'FALL';
  const severityColor = isFall ? '#ff9b00' : '#f85149';

  return (
    <AnimatePresence>
      <motion.div 
        className="alert-overlay"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
      >
        <div className="alert-card" style={{ borderLeft: `8px solid ${severityColor}` }}>
          <div className="alert-icon-container" style={{ backgroundColor: `${severityColor}20` }}>
            <AlertTriangle className="alert-main-icon" style={{ color: severityColor }} />
          </div>

          <div className="alert-content">
            <div className="alert-header">
              <span className="alert-type">{isFall ? 'FALL DETECTED' : 'EMERGENCY SOS'}</span>
              <span className="alert-time">Just Now</span>
            </div>
            <h2 className="alert-patient">{alert.patientName}</h2>
            <p className="alert-message">{alert.message}</p>
            
            <div className="alert-meta">
              <div className="meta-item"><MapPin size={14} /> Room 302, North Wing</div>
              <div className="meta-item"><Phone size={14} /> +1 (555) 012-3456</div>
            </div>

            <div className="alert-actions">
              <button className="btn btn-danger btn-pulse" onClick={() => window.open('tel:911')}>
                Call Emergency Services
              </button>
              <button className="btn btn-secondary" onClick={onClear}>
                Mark as Resolved
              </button>
            </div>
          </div>

          <button className="alert-close" onClick={onClear}>
            <X size={20} />
          </button>
        </div>

        <style>{`
          .alert-overlay {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10000;
            width: 450px;
            pointer-events: auto;
          }

          .alert-card {
            background: var(--bg-secondary);
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(248, 81, 73, 0.2);
            display: flex;
            padding: 24px;
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border);
          }

          .alert-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(45deg, transparent, rgba(248, 81, 73, 0.05));
            pointer-events: none;
          }

          .alert-icon-container {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
          }

          .alert-main-icon { width: 32px; height: 32px; }

          .alert-content { flex: 1; }

          .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .alert-type {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1px;
            color: var(--text-secondary);
          }

          .alert-time { font-size: 12px; color: var(--text-secondary); }

          .alert-patient { font-size: 24px; font-weight: bold; margin-bottom: 8px; }

          .alert-message { color: var(--text-secondary); line-height: 1.4; margin-bottom: 15px; }

          .alert-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .meta-item { display: flex; align-items: center; gap: 5px; }

          .alert-actions { display: flex; gap: 10px; }

          .btn-pulse {
            animation: btn-pulse-anim 1.5s infinite;
          }

          @keyframes btn-pulse-anim {
            0% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(248, 81, 73, 0); }
            100% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0); }
          }

          .alert-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.2s;
          }

          .alert-close:hover { background: var(--bg-tertiary); }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertOverlay;
