
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import MLDashboardPage from "./pages/MLDashboard";
import SystemSettings from "./pages/SystemSettings";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ml-dashboard" element={<MLDashboardPage />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Router>
  );
};

export default App;
