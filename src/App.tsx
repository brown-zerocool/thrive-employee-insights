
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import MLDashboardPage from "./pages/MLDashboard";
import SystemSettings from "./pages/SystemSettings";
import { AuthProvider } from "./hooks/useAuth";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Employees from "./pages/Employees";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          } />
          <Route path="/ml-dashboard" element={
            <ProtectedRoute>
              <MLDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SystemSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
