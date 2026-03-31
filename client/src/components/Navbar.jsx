import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current language from i18n
  const currentLangCode = i18n.language || 'gb';
  const getLangName = (code) => {
    if (code.startsWith('ru')) return 'Русский';
    if (code.startsWith('it')) return 'Italiano';
    if (code.startsWith('es')) return 'Español';
    if (code.startsWith('de')) return 'Deutsch';
    return 'English';
  };

  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    handleClose();
  };

  const toggleMobileMenu = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileMenuOpen(open);
  };

  const navLinks = [
    { text: t('navbar.crypto'), to: '/crypto' },
    { text: t('navbar.digital_banking'), to: '/digital-banking' },
    { text: t('navbar.currency_exchange'), to: '/currency-exchange' },
    { text: t('navbar.about_us'), to: '/about' },
  ];

  const drawer = (
    <Box
      sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <img src="/assets/AlpenStark-bank-logo-dark.svg" alt="AlpenStark Bank" style={{ height: 32 }} />
        <IconButton onClick={toggleMobileMenu(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ flexGrow: 1, pt: 4 }}>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton component={RouterLink} to={link.to} onClick={toggleMobileMenu(false)} sx={{ py: 2, textAlign: 'center' }}>
              <ListItemText primary={link.text} primaryTypographyProps={{ fontSize: '1.2rem', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!user ? (
          <>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to="/login"
              fullWidth
              onClick={toggleMobileMenu(false)}
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('common.login')}
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/register"
              fullWidth
              onClick={toggleMobileMenu(false)}
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#2563eb' }}
            >
              {t('common.open_account')}
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to="/dashboard"
              fullWidth
              onClick={toggleMobileMenu(false)}
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('common.dashboard')}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => { logout(); toggleMobileMenu(false)(); }}
              fullWidth
              sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#ef4444' }}
            >
              {t('common.logout')}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid rgba(0, 0, 0, 0.12)', zIndex: 1100 }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, width: '100%', mx: 'auto', minHeight: { xs: 64, sm: 70 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/assets/AlpenStark-bank-logo-dark.svg" alt="AlpenStark Bank" style={{ height: 32, display: 'block' }} />
          </RouterLink>
        </Box>

        
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', flexGrow: 1, justifyContent: 'center', gap: 4 }}>
          {navLinks.map((link) => (
            <Button key={link.text} color="inherit" component={RouterLink} to={link.to} sx={{ fontWeight: 500, color: '#1a1a1a', textTransform: 'none', '&:hover': { color: '#2563eb', bgcolor: 'transparent' } }}>
              {link.text}
            </Button>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
          <Button
            onClick={handleClick}
            sx={{ color: '#1a1a1a', minWidth: 'auto', px: 1 }}
            endIcon={<KeyboardArrowDownIcon />}
          >
            <img
              src={`/assets/${currentLangCode.startsWith('ru') ? 'ru' : currentLangCode.startsWith('it') ? 'it' : currentLangCode.startsWith('es') ? 'es' : currentLangCode.startsWith('de') ? 'de' : 'gb'}.svg`}
              onError={(e) => { e.target.src = '/assets/eu.svg'; }}
              alt={currentLangCode.toUpperCase()}
              style={{ width: 20, height: 20, borderRadius: '50%' }}
            />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
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

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {!user ? (
              <>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    borderColor: '#2563eb', 
                    color: '#2563eb',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      bgcolor: 'rgba(37, 99, 235, 0.04)',
                    }
                  }}
                >
                  {t('common.login')}
                </Button>
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/register"
                  sx={{
                    bgcolor: '#2563eb',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#1d4ed8',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {t('common.open_account')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  component={RouterLink} 
                  to="/dashboard"
                  sx={{ 
                    borderColor: '#2563eb', 
                    color: '#2563eb',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      bgcolor: 'rgba(37, 99, 235, 0.04)',
                    }
                  }}
                >
                  {t('common.dashboard')}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={logout}
                  sx={{
                    bgcolor: '#ef4444',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#dc2626',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {t('common.logout')}
                </Button>
              </>
            )}
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={toggleMobileMenu(true)}
            sx={{ display: { lg: 'none' }, ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;

