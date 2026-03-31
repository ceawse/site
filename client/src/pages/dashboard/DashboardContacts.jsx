import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, Link, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';

const DashboardContacts = () => {
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
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#1e293b', mb: 1 }}>
        {t('contacts.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        {t('contacts.subtitle')}
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid #e2e8f0', maxWidth: 800 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
            {t('contacts.general_inquiries')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', mb: 2 }}>
            {t('contacts.general_desc')}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>{t('contacts.email_label')}</Typography>
            <Link href={`mailto:${email}`} sx={{ fontSize: '1.1rem', fontWeight: 500, textDecoration: 'none', color: '#0f172a', '&:hover': { color: '#3b82f6' } }}>
              {email}
            </Link>
          </Box>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
            {t('contacts.office')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {address}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardContacts;
