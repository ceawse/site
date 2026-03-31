import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Checkbox, FormControlLabel, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { api } from '../../api';
import { countries } from '../../utils/countries';
import { translateBackendMessage } from '../../utils/i18n-helper';

const ProfileSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    region: '',
    zip: '',
    country: 'romania'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await api.get('/user');
        const nameParts = (user.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          firstName,
          lastName,
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob || '',
          address: user.address || '',
          city: user.city || '',
          region: user.state || '',
          zip: user.zip || '',
          country: user.country || 'romania'
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        state: formData.region
      };
      await api.put('/user', payload);
      setSuccess(t('dashboard.settings.notification.success'));
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('dashboard.settings.notification.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.settings.title')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, maxWidth: 800 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, maxWidth: 800 }}>{success}</Alert>}
      
      {/* Personal Information */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.settings.personal_info')}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.first_name')}
              fullWidth
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.last_name')}
              fullWidth
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.email')}
              fullWidth
              value={formData.email} 
              disabled 
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.phone')}
              fullWidth
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.dob')}
              fullWidth
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Address Information */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.settings.address_info')}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label={t('auth.address')}
              fullWidth
              value={formData.address} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.city')}
              fullWidth
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.region')}
              fullWidth
              value={formData.region} 
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('auth.postal_code')}
              fullWidth
              value={formData.zip} 
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              size="small" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('auth.country')}</InputLabel>
              <Select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                label={t('auth.country')}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>{t(`countries.${c}`, c)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Preferences */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.settings.notifications')}
        </Typography>
        
        <FormControlLabel
          control={<Checkbox defaultChecked sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }} />}
          label={<Typography variant="body1" fontWeight={500}>{t('dashboard.settings.show_notifications')}</Typography>}
          sx={{ mb: 1, alignItems: 'flex-start' }}
        />
        <Typography variant="body2" sx={{ color: '#64748b', ml: 4, mb: 4 }}>
          {t('dashboard.settings.notification_desc')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={loading}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', px: 6, py: 1, borderRadius: 1.5, boxShadow: 'none' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('common.save')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileSettings;
