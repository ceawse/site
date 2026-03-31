import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import ContactsPage from './pages/ContactsPage';
import LegalPage from './pages/LegalPage';
import CryptoPage from './pages/CryptoPage';
import DigitalBankingPage from './pages/DigitalBankingPage';
import CurrencyExchangePage from './pages/CurrencyExchangePage';
import AboutUsPage from './pages/AboutUsPage';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const { loading } = useAuth();
  const hideLayout = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideLayout && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/crypto" element={<CryptoPage />} />
          <Route path="/digital-banking" element={<DigitalBankingPage />} />
          <Route path="/currency-exchange" element={<CurrencyExchangePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/legal/:type" element={<LegalPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Box>
      {!hideLayout && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
