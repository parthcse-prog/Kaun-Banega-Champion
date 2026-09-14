import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import MainLayout from './MainLayout';
import Dashboard from './Dashboard';
import WordConnect from './WordConnect/WordConnect';
import MathNinja from './MathNinja/MathNinja';
import AlgoBingo from './AlgoBingo/AlgoBingo';
import KnifeHit from './KnifeHit/KnifeHit';
import WhosThat from './WhosThat/WhosThat';
import AnalyticsPortal from './Analytics/AnalyticsPortal';
import './index.css';

function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('pi360_token') || null;
  });

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('pi360_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('pi360_token');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout token={token} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile token={token} onLogout={handleLogout} />} />
          <Route path="word-connect" element={<WordConnect />} />
          <Route path="math-ninja" element={<MathNinja />} />
          <Route path="algo-bingo" element={<AlgoBingo token={token} />} />
          <Route path="knife-hit" element={<KnifeHit />} />
          <Route path="whos-that" element={<WhosThat />} />
          <Route path="analytics" element={<AnalyticsPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
