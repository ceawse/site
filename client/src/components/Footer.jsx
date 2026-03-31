import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PublicIcon from '@mui/icons-material/Public';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings in footer', err);
      }
    };
    fetchSettings();
  }, []);

  const email = settings?.contact_email || 'support@alpenstark.com';
  const address = settings?.contact_address || 'Avenue Industrielle 12, 1227 Carouge GE, Switzerland';
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <Box component="footer" sx={{ bgcolor: 'white', color: '#1a1a1a', pt: 12, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <img src="/assets/AlpenStark-bank-logo-dark.svg" alt="AlpenStark Bank Logo" style={{ height: 32 }} />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
              {t('footer.legal_info')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <MuiLink component={RouterLink} to="/legal/terms" underline="hover" sx={{ color: '#64748b', variant: 'body2' }}>{t('footer.terms')}</MuiLink>
              <MuiLink component={RouterLink} to="/legal/cookies" underline="hover" sx={{ color: '#64748b', variant: 'body2' }}>{t('footer.cookie_policy')}</MuiLink>
              <MuiLink component={RouterLink} to="/legal/privacy" underline="hover" sx={{ color: '#64748b', variant: 'body2' }}>{t('footer.privacy_policy')}</MuiLink>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
              {t('footer.contact_info')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <PublicIcon sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>
                  {address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MailOutlineIcon sx={{ color: '#64748b', fontSize: 20 }} />
                <MuiLink href={`mailto:${email}`} underline="hover" sx={{ color: '#64748b', variant: 'body2' }}>
                  {email}
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            © 2007-{new Date().getFullYear()} AlpenStark Bank. {t('footer.all_rights_reserved')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <MuiLink component={RouterLink} to="/legal/terms" underline="hover" sx={{ color: '#94a3b8', variant: 'body2' }}>{t('footer.terms')}</MuiLink>
            <MuiLink component={RouterLink} to="/legal/cookies" underline="hover" sx={{ color: '#94a3b8', variant: 'body2' }}>{t('footer.cookie_policy')}</MuiLink>
            <MuiLink component={RouterLink} to="/legal/privacy" underline="hover" sx={{ color: '#94a3b8', variant: 'body2' }}>{t('footer.privacy_policy')}</MuiLink>
            <MuiLink component={RouterLink} to={isDashboard ? "/dashboard/contacts" : "/contacts"} underline="hover" sx={{ color: '#94a3b8', variant: 'body2' }}>{t('footer.contacts')}</MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
