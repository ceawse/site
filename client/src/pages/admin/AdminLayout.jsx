import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminUserDetail from './AdminUserDetail';
import AdminTransactions from './AdminTransactions';
import AdminSettings from './AdminSettings';
import AdminMessages from './AdminMessages';
import AdminBackup from './AdminBackup';
import AdminLoans from './AdminLoans';

const drawerWidth = 240;

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(authUser);

  const [notification, setNotification] = useState({ open: false, message: '' });
  const lastEventId = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));

  useEffect(() => {
      let isFirstLoad = true;

      const checkNotifications = async () => {
        try {
          const response = await api.get('/admin/notification-counts');
          const { latestEvent } = response;

          if (latestEvent) {
            if (isFirstLoad) {
              lastEventId.current = latestEvent.id;
              isFirstLoad = false;
              return;
            }

            if (latestEvent.id !== lastEventId.current) {
              console.log("[ADMIN] Новая активность:", latestEvent.text);

              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => {});

              setNotification({ open: true, message: latestEvent.text });
              lastEventId.current = latestEvent.id;

              setTimeout(() => {
                setNotification(prev => ({ ...prev, open: false }));
              }, 8000);
            }
          }
        } catch (err) {
          console.error("Ошибка при проверке уведомлений:", err);
        }
      };

      const interval = setInterval(checkNotifications, 10000);
      checkNotifications();
      return () => clearInterval(interval);
    }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = useMemo(() => [
    { text: t('admin.sidebar.dashboard'), icon: <DashboardIcon />, path: '/admin' },
    { text: t('admin.sidebar.users'), icon: <PeopleIcon />, path: '/admin/users' },
    { text: t('admin.sidebar.transactions'), icon: <ReceiptLongIcon />, path: '/admin/transactions' },
    { text: t('admin.sidebar.loans'), icon: <AccountBalanceIcon />, path: '/admin/loans' },
    { text: t('admin.sidebar.messages'), icon: <ChatIcon />, path: '/admin/messages' },
    { text: t('admin.sidebar.settings'), icon: <SettingsIcon />, path: '/admin/settings' },
    { text: t('admin.sidebar.backup'), icon: <StorageIcon />, path: '/admin/backup' },
  ], [t]);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          {t('admin.panel_title')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('admin.sidebar.logout')} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  if (!adminUser) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1e293b'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AlpenStark Bank {t('admin.panel_title')}
          </Typography>
          <Typography variant="body1">
            {adminUser.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/users/:id" element={<AdminUserDetail />} />
          <Route path="/transactions" element={<AdminTransactions />} />
          <Route path="/loans" element={<AdminLoans />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/backup" element={<AdminBackup />} />
        </Routes>
      </Box>

      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
        {notification.open && (
          <Paper
            elevation={10}
            sx={{
              p: 2.5,
              bgcolor: '#0f172a',
              color: 'white',
              borderRadius: 3,
              minWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              animation: 'slideInRight 0.5s ease-out'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#818cf8' }}>
                 Системное уведомление
               </Typography>
               <Typography
                 variant="caption"
                 onClick={() => setNotification({ ...notification, open: false })}
                 sx={{ cursor: 'pointer', opacity: 0.6, '&:hover': { opacity: 1 } }}
               >
                 Закрыть
               </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              {notification.message}
            </Typography>
          </Paper>
        )}
      </Box>

      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}