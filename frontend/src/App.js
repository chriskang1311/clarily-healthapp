import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import theme from './theme';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Homepage from './pages/Homepage';
import HealthJourneys from './pages/HealthJourneys';
import Appointments from './pages/Appointments';
import Insurance from './pages/Insurance';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Chatbot from './pages/Chatbot';
import Onboarding from './pages/Onboarding';
import JourneyDetail from './pages/JourneyDetail';

// Redirect to /welcome if no name is stored; exempt the welcome route itself
const NameGuard = ({ children }) => {
  const location = useLocation();
  const hasName = Boolean(localStorage.getItem('clarily-user-name'));
  if (!hasName && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/welcome" element={<Onboarding />} />
            <Route
              path="*"
              element={
                <NameGuard>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Homepage />} />
                      <Route path="/health-journeys" element={<HealthJourneys />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/insurance" element={<Insurance />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/chatbot" element={<Chatbot />} />
                      <Route path="/journey/:id" element={<JourneyDetail />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </NameGuard>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
