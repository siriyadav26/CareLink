import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing CareLink AI...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Route: Conditional Rendering */}
      <Route 
        path="/" 
        element={user ? <DashboardPage /> : <WelcomePage />} 
      />

      {/* Auth Routes: Prevent access if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/" replace /> : <SignupPage />} 
      />

      {/* Catch-all: Redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
