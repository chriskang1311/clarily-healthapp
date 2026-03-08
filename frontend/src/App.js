import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import theme from './theme';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Homepage from './pages/Homepage';
import HealthJourneys from './pages/HealthJourneys';
import Appointments from './pages/Appointments';
import Insurance from './pages/Insurance';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Chatbot from './pages/Chatbot';
import JourneyDetail from './pages/JourneyDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Redirect to /login if not authenticated; show nothing while session loads
const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public auth routes — no Layout, no AuthGuard */}
              <Route path="/login"           element={<Login />} />
              <Route path="/signup"          element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected routes — behind AuthGuard, inside Layout */}
              <Route
                path="*"
                element={
                  <AuthGuard>
                    <Layout>
                      <Routes>
                        <Route path="/"                element={<Homepage />} />
                        <Route path="/health-journeys" element={<HealthJourneys />} />
                        <Route path="/appointments"    element={<Appointments />} />
                        <Route path="/insurance"       element={<Insurance />} />
                        <Route path="/support"         element={<Support />} />
                        <Route path="/notifications"   element={<Notifications />} />
                        <Route path="/chatbot"         element={<Chatbot />} />
                        <Route path="/journey/:id"     element={<JourneyDetail />} />
                        <Route path="/profile"         element={<Profile />} />
                        <Route path="*"                element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </AuthGuard>
                }
              />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
