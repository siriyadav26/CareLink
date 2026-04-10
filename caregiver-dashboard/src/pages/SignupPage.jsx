import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Heart, Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'caretaker' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      const { user, token } = response.data;
      
      login(user, token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Heart className="auth-logo" />
          <h1>Create Account</h1>
          <p>Join CareLink AI as a caregiver</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User className="form-icon" /> Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Mail className="form-icon" /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock className="form-icon" /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : <>Create Account <ArrowRight /></>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-logo {
          width: 48px;
          height: 48px;
          color: #f85149;
          margin-bottom: 15px;
        }

        .auth-header h1 { font-size: 24px; margin-bottom: 8px; }
        .auth-header p { color: var(--text-secondary); }

        .form-group { margin-bottom: 20px; }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-icon { width: 16px; height: 16px; }

        input {
          width: 100%;
          padding: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 16px;
        }

        input:focus {
          border-color: var(--accent);
          outline: none;
          box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2);
        }

        .btn-block {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }

        .auth-error {
          background: rgba(248, 81, 73, 0.1);
          color: #f85149;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid rgba(248, 81, 73, 0.2);
        }

        .auth-footer {
          margin-top: 25px;
          text-align: center;
          color: var(--text-secondary);
        }

        .auth-footer span {
          color: var(--accent);
          cursor: pointer;
          font-weight: bold;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
