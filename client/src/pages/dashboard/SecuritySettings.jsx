import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Alert, CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';

const SecuritySettings = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('dashboard.settings.errors.fill_all'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('dashboard.settings.errors.passwords_mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('dashboard.settings.errors.password_too_short'));
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/password', {
        currentPassword,
        newPassword
      });
      setSuccess(t('dashboard.settings.password_success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || t('dashboard.settings.errors.password_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.settings.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.settings.change_password')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              label={t('dashboard.settings.current_password') + ' *'}
              fullWidth
              type="password"
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('dashboard.settings.new_password') + ' *'}
              fullWidth
              type="password"
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t('dashboard.settings.confirm_new_password') + ' *'}
              fullWidth
              type="password"
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loading}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              textTransform: 'none',
              px: 6,
              py: 1,
              borderRadius: 1.5,
              boxShadow: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('dashboard.settings.change_password')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SecuritySettings;
