import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './GlobalStyle';
import theme from './theme';
import Layout from './components/Layout';
import Homepage from './pages/Homepage';
import HealthJourneys from './pages/HealthJourneys';
import Appointments from './pages/Appointments';
import Insurance from './pages/Insurance';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/health-journeys" element={<HealthJourneys />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/support" element={<Support />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
