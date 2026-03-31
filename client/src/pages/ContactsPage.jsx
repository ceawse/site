import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, Link, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { api } from '../api';

const ContactsPage = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const email = settings?.contact_email || 'support@alpenstark.com';
  const address = settings?.contact_address || 'Avenue Industrielle 12, 1227 Carouge GE, Switzerland';

  return (
    <Box sx={{ py: 8, bgcolor: '#f8fafc', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#1e293b', mb: 2 }}>
          {t('contacts.title')}
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', mb: 6, fontWeight: 400 }}>
          {t('contacts.subtitle')}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ bgcolor: '#eff6ff', p: 1.5, borderRadius: '50%', mr: 2, display: 'flex' }}>
                  <MailOutlineIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>{t('contacts.general_inquiries')}</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#475569', mb: 4 }}>
                {t('contacts.general_desc')}
              </Typography>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>{t('contacts.email_label')}</Typography>
                <Link href={`mailto:${email}`} sx={{ fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none', color: '#3b82f6' }}>
                  {email}
                </Link>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: '50%', mr: 2, display: 'flex' }}>
                  <BusinessIcon sx={{ color: '#16a34a' }} />
                </Box>
                <Typography variant="h6" fontWeight={700}>{t('contacts.office')}</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {address}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactsPage;
