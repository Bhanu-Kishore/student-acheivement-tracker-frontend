import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { useSessionManager } from './useSessionManager';
import { SessionWarning } from './SessionWarning';

export default function App() {
  const [user, setUser] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(10);

  const handleSessionWarning = () => {
    setShowSessionWarning(true);
    let timeLeft = 10;
    const interval = setInterval(() => {
      timeLeft--;
      setSessionTimeRemaining(timeLeft);
      if (timeLeft <= 0) clearInterval(interval);
    }, 1000);
  };

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    setSessionTimeRemaining(10);
  };

  const handleSessionLogout = () => {
    setUser(null);
    setShowSessionWarning(false);
  };

  useSessionManager(user, handleSessionLogout, handleSessionWarning);

  return (
    <>
      <SessionWarning 
        isVisible={showSessionWarning}
        onExtend={handleExtendSession}
        onLogout={handleSessionLogout}
        timeRemaining={sessionTimeRemaining}
      />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} setUser={setUser} /> : <Navigate to="/auth" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}
