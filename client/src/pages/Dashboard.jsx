import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, IconButton, Badge,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Button, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Menu, MenuItem
} from '@mui/material';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { api } from '../api';
import { useNotification } from '../context/NotificationContext';
import MenuIcon from '@mui/icons-material/Menu';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DescriptionIcon from '@mui/icons-material/Description';
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Footer from '../components/Footer';

import MainPage from './dashboard/MainPage';
import AccountOverview from './dashboard/AccountOverview';
import AccountStatement from './dashboard/AccountStatement';
import WithdrawAccounts from './dashboard/WithdrawAccounts';
import AccountTopUp from './dashboard/AccountTopUp';
import BankTransfer from './dashboard/BankTransfer';
import ListTransfers from './dashboard/ListTransfers';
import CryptoWallets from './dashboard/CryptoWallets';
import CryptoTransfer from './dashboard/CryptoTransfer';
import CryptoTransactions from './dashboard/CryptoTransactions';
import CurrencyExchange from './dashboard/CurrencyExchange';
import Invoices from './dashboard/Invoices';
import GetLoan from './dashboard/GetLoan';
import ProfileSettings from './dashboard/ProfileSettings';
import Verification from './dashboard/Verification';
import SecuritySettings from './dashboard/SecuritySettings';
import Messages from './dashboard/Messages';
import DashboardContacts from './dashboard/DashboardContacts';

import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const DashboardLayout = () => {
  const { t } = useTranslation();
  const { user: authUser, logout } = useAuth();

  const menuItems = useMemo(() => [
    { id: 'main', text: t('dashboard.sidebar.main_page'), icon: <HomeIcon />, path: '/dashboard' },
    {
      id: 'accounts', text: t('dashboard.sidebar.accounts'), icon: <AccountBalanceWalletIcon />,
      children: [
        { id: 'acc-overview', text: t('dashboard.sidebar.account_overview'), path: '/dashboard/account-overview' },
        { id: 'acc-statement', text: t('dashboard.sidebar.account_statement'), path: '/dashboard/account-statement' },
        { id: 'withdraw-acc', text: t('dashboard.sidebar.withdraw_accounts'), path: '/dashboard/withdraw-accounts' },
        { id: 'acc-topup', text: t('dashboard.sidebar.account_top_up'), path: '/dashboard/account-top-up' }
      ]
    },
    {
      id: 'transfers', text: t('dashboard.sidebar.transfers'), icon: <SwapHorizIcon />,
      children: [
        { id: 'bank-transfer', text: t('dashboard.sidebar.bank_transfer'), path: '/dashboard/bank-transfer' },
        { id: 'list-transfers', text: t('dashboard.sidebar.list_transfers'), path: '/dashboard/list-transfers' }
      ]
    },
    {
      id: 'crypto', text: t('dashboard.sidebar.cryptocurrency'), icon: <CurrencyBitcoinIcon />,
      children: [
        { id: 'crypto-wallets', text: t('dashboard.sidebar.wallets'), path: '/dashboard/crypto-wallets' },
        { id: 'crypto-transfer', text: t('dashboard.sidebar.transfer'), path: '/dashboard/crypto-transfer' },
        { id: 'crypto-transactions', text: t('dashboard.sidebar.transactions'), path: '/dashboard/crypto-transactions' }
      ]
    },
    { id: 'exchange', text: t('dashboard.sidebar.currency_exchange'), icon: <CurrencyExchangeIcon />, path: '/dashboard/currency-exchange' },
    { id: 'invoices', text: t('dashboard.sidebar.invoices'), icon: <DescriptionIcon />, path: '/dashboard/invoices' },
    { id: 'loan', text: t('dashboard.sidebar.get_loan'), icon: <RealEstateAgentIcon />, path: '/dashboard/get-loan' },
    {
      id: 'settings', text: t('dashboard.sidebar.settings'), icon: <SettingsIcon />,
      children: [
        { id: 'profile', text: t('dashboard.sidebar.profile_settings'), path: '/dashboard/settings-profile' },
        { id: 'verification', text: t('dashboard.sidebar.verification'), path: '/dashboard/settings-verification' },
        { id: 'security', text: t('dashboard.sidebar.security'), path: '/dashboard/settings-security' }
      ]
    }
  ], [t]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardOpenMenus');
      return saved ? JSON.parse(saved) : { accounts: false, transfers: false, crypto: false, settings: false };
    } catch (e) {
      return { accounts: false, transfers: false, crypto: false, settings: false };
    }
  });
  const [user, setUser] = useState(authUser || { name: 'Loading...' });
  const [unreadCount, setUnreadCount] = useState(0);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const currentLangCode = i18n.language || 'gb';
  const open = Boolean(anchorEl);

  const handleLangClick = (event) => setAnchorEl(event.currentTarget);
  const handleLangClose = () => setAnchorEl(null);
  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    handleLangClose();
  };

  const handleSendCode = async () => {
    try {
      await api.post('/auth/send-verification');
      showNotification(t('email_verification.code_sent'), 'success');
      setVerifyModalOpen(true);
    } catch (err) {
      showNotification(err.message || 'Failed to send code', 'error');
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      await api.post('/auth/verify-email', { code: verificationCode });
      showNotification(t('email_verification.success'), 'success');
      setVerifyModalOpen(false);
      // Refresh user data
      const userData = await api.get('/user');
      setUser(userData);
    } catch (err) {
      showNotification(err.message || t('email_verification.failed'), 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.get('/user');
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user', err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const msgs = await api.get('/messages');
        const count = msgs.filter(m => m.status === 'unread' && m.sender_role === 'admin').length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread count', err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleMenu = (id) => {
    setOpenMenus(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      localStorage.setItem('dashboardOpenMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ bgcolor: 'white', height: '100%', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <img src="/assets/AlpenStark-bank-logo-dark.svg" alt="AlpenStark Logo" style={{ height: 40 }} />
      </Toolbar>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            if (item.children) {
              const isChildActive = item.children.some(child => location.pathname === child.path);
              return (
                <Box key={item.id}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => toggleMenu(item.id)}
                      sx={{ borderRadius: 1.5, color: isChildActive ? 'primary.main' : 'text.secondary' }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                      {openMenus[item.id] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={openMenus[item.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const active = location.pathname === child.path;
                        return (
                          <ListItemButton 
                            key={child.id} 
                            onClick={() => navigate(child.path)}
                            sx={{ 
                              pl: 7, 
                              mb: 0.5,
                              borderRadius: 1.5,
                              bgcolor: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                              color: active ? '#4F46E5' : 'text.secondary',
                              borderLeft: active ? '3px solid #4F46E5' : '3px solid transparent',
                              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.04)' }
                            }}
                          >
                            <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400 }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            const active = location.pathname === item.path;
            return (
              <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    borderRadius: 1.5,
                    bgcolor: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    color: active ? '#4F46E5' : 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.04)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center' }}>
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: 1000,
        bgcolor: '#f8fafc',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* Sidebar */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' }, height: '100%', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, position: 'relative', border: 'none', height: '100%' } }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, display: { md: 'none' } }}>
                <MenuIcon />
              </IconButton>
              
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
                <img src="/assets/AlpenStark-bank-logo-dark.svg" alt="AlpenStark Logo" style={{ height: 32 }} />
              </Box>

              <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

              
              <Stack direction="row" spacing={{ xs: 0.5, sm: 2 }} alignItems="center">
                {/* Language Switcher */}
                <Button
                  onClick={handleLangClick}
                  sx={{ color: 'text.secondary', minWidth: 'auto', px: 1, textTransform: 'none', fontWeight: 500 }}
                  startIcon={
                    <img
                      src={`/assets/${currentLangCode.startsWith('ru') ? 'ru' : currentLangCode.startsWith('it') ? 'it' : currentLangCode.startsWith('es') ? 'es' : currentLangCode.startsWith('de') ? 'de' : 'gb'}.svg`}
                      onError={(e) => { e.target.src = '/assets/eu.svg'; }}
                      alt={currentLangCode.toUpperCase()}
                      style={{ width: 20, height: 20, borderRadius: '50%' }}
                    />
                  }
                  endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-block' } }} />}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{currentLangCode.toUpperCase()}</Box>
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleLangClose}>
                  <MenuItem onClick={() => handleLangChange('gb')}>
                    <img src="/assets/gb.svg" onError={(e) => { e.target.src = '/assets/eu.svg'; }} alt="EN" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }} /> English
                  </MenuItem>
                  <MenuItem onClick={() => handleLangChange('ru')}>
                    <img src="/assets/ru.svg" onError={(e) => { e.target.src = '/assets/eu.svg'; }} alt="RU" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }} /> Русский
                  </MenuItem>
                  <MenuItem onClick={() => handleLangChange('it')}>
                    <img src="/assets/it.svg" onError={(e) => { e.target.src = '/assets/eu.svg'; }} alt="IT" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }} /> Italiano
                  </MenuItem>
                  <MenuItem onClick={() => handleLangChange('es')}>
                    <img src="/assets/es.svg" onError={(e) => { e.target.src = '/assets/eu.svg'; }} alt="ES" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }} /> Español
                  </MenuItem>
                  <MenuItem onClick={() => handleLangChange('de')}>
                    <img src="/assets/de.svg" onError={(e) => { e.target.src = '/assets/eu.svg'; }} alt="DE" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }} /> Deutsch
                  </MenuItem>
                </Menu>

                <Button
                  onClick={() => navigate('/dashboard/messages')}
                  color="inherit"
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 1, sm: 2 }
                  }}
                  startIcon={
                    <Badge badgeContent={unreadCount} color="error">
                      <MailOutlineIcon sx={{ color: 'text.primary' }} />
                    </Badge>
                  }
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {t('dashboard.sidebar.messages')}
                  </Box>
                </Button>

                <IconButton
                  onClick={() => navigate('/dashboard/settings-profile')}
                  color="inherit"
                  sx={{ color: 'text.secondary' }}
                >
                  <PersonIcon />
                </IconButton>

                <IconButton onClick={handleLogout} color="inherit" sx={{ color: 'text.secondary' }}>
                  <LogoutIcon />
                </IconButton>
              </Stack>
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, overflowY: 'auto' }}>
            {user.id && !user.is_email_verified && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={handleSendCode}>
                    {t('email_verification.button')}
                  </Button>
                }
              >
                {t('email_verification.banner')}
              </Alert>
            )}
            <Outlet />
            <Box sx={{ mt: 'auto', pt: 8 }}>
              <Footer />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Email Verification Modal */}
      <Dialog open={verifyModalOpen} onClose={() => setVerifyModalOpen(false)}>
        <DialogTitle>{t('email_verification.modal_title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('email_verification.modal_subtitle')}
          </Typography>
          <TextField
            fullWidth
            label={t('email_verification.code_label')}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            margin="dense"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyModalOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSendCode} color="primary">{t('email_verification.resend')}</Button>
          <Button 
            onClick={handleVerifyEmail} 
            color="primary" 
            variant="contained"
            disabled={isVerifying || !verificationCode}
          >
            {isVerifying ? t('common.loading') : t('common.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Dashboard = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<MainPage />} />
        <Route path="account-overview" element={<AccountOverview />} />
        <Route path="account-statement" element={<AccountStatement />} />
        <Route path="withdraw-accounts" element={<WithdrawAccounts />} />
        <Route path="account-top-up" element={<AccountTopUp />} />
        <Route path="bank-transfer" element={<BankTransfer />} />
        <Route path="list-transfers" element={<ListTransfers />} />
        <Route path="crypto-wallets" element={<CryptoWallets />} />
        <Route path="crypto-transfer" element={<CryptoTransfer />} />
        <Route path="crypto-transactions" element={<CryptoTransactions />} />
        <Route path="currency-exchange" element={<CurrencyExchange />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="get-loan" element={<GetLoan />} />
        <Route path="settings-profile" element={<ProfileSettings />} />
        <Route path="settings-verification" element={<Verification />} />
        <Route path="settings-security" element={<SecuritySettings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="contacts" element={<DashboardContacts />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
