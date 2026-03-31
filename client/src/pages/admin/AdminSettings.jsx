import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, TextField, Button, Grid, Stack } from '@mui/material';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({
    wallet_btc: '',
    wallet_eth: '',
    wallet_sol: '',
    wallet_trc20: '',
    bank_beneficiary: '',
    bank_iban: '',
    bank_swift: '',
    contact_email: '',
    contact_address: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/admin/settings', settings);
      showNotification(t('admin.settings.notification.success'), 'success');
    } catch (error) {
      showNotification(t('admin.settings.notification.error'), 'error');
    }
  };

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.settings.title')}</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.settings.crypto_wallets')}</Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Bitcoin (BTC) Address" name="wallet_btc"
                value={settings.wallet_btc || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label="Ethereum (ETH/USDT ERC20) Address" name="wallet_eth"
                value={settings.wallet_eth || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label="Solana (SOL) Address" name="wallet_sol"
                value={settings.wallet_sol || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label="Tron (TRC20/USDT) Address" name="wallet_trc20"
                value={settings.wallet_trc20 || ''} onChange={handleChange}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.settings.bank_details')}</Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth label={t('admin.settings.beneficiary')} name="bank_beneficiary"
                value={settings.bank_beneficiary || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label={t('admin.settings.iban')} name="bank_iban"
                value={settings.bank_iban || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label={t('admin.settings.bic_swift')} name="bank_swift"
                value={settings.bank_swift || ''} onChange={handleChange}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.settings.general_contacts')}</Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth label={t('admin.settings.contact_email')} name="contact_email"
                value={settings.contact_email || ''} onChange={handleChange}
              />
              <TextField
                fullWidth label={t('admin.settings.contact_address')} name="contact_address"
                value={settings.contact_address || ''} onChange={handleChange}
                multiline rows={2}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" onClick={handleSave} sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}>
              {t('admin.settings.save_all')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
