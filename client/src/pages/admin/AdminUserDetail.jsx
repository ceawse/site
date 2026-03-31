import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { countries } from '../../utils/countries';

export default function AdminUserDetail() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // New account form
  const [newAccType, setNewAccType] = useState('fiat');
  const [newAccCurrency, setNewAccCurrency] = useState('USD');
  const [newAccBalance, setNewAccBalance] = useState('0');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const data = await api.get(`/admin/users/${id}`);
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      showNotification(t('admin.user_detail.notification.user_not_found'), 'error');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveUser = async () => {
    try {
      await api.put(`/admin/users/${id}`, user);
      showNotification(t('admin.user_detail.notification.user_saved'), 'success');
    } catch (error) {
      showNotification(t('admin.user_detail.notification.user_save_error'), 'error');
    }
  };

  const handleResetPassword = async () => {
    const newPassword = prompt(t('dashboard.settings.new_password'));
    if (!newPassword) return;
    if (newPassword.length < 6) {
      showNotification(t('dashboard.settings.errors.password_too_short'), 'error');
      return;
    }

    try {
      await api.put(`/admin/users/${id}/password`, { newPassword });
      showNotification(t('dashboard.settings.password_success'), 'success');
    } catch (err) {
      console.error(err);
      showNotification(t('dashboard.settings.errors.password_failed'), 'error');
    }
  };

  const handleUpdateBalance = async (accountId, currency) => {
    const amountStr = prompt(t('admin.user_detail.prompts.amount'), '0');
    if (!amountStr || isNaN(amountStr)) return;
    const amount = parseFloat(amountStr);
    if (amount === 0) return;

    const defaultDesc = amount > 0 ? t('admin.user_detail.prompts.incoming') : t('admin.user_detail.prompts.outgoing');
    const description = prompt(t('admin.user_detail.prompts.description'), defaultDesc) || defaultDesc;
    const comment = prompt(t('admin.user_detail.prompts.comment', 'Комментарий (необязательно)'), '') || '';

    try {
      await api.post(`/admin/transactions`, {
        user_id: id,
        account_id: accountId,
        type: amount > 0 ? 'deposit' : 'withdraw',
        amount: amount,
        currency: currency,
        status: 'processing',
        description: description,
        comment: comment
      });
      fetchUser(); // refresh data
      showNotification(t('admin.user_detail.notification.transaction_created'), 'success');
    } catch (error) {
      showNotification(t('admin.user_detail.notification.balance_error'), 'error');
    }
  };

  const handleCreateAccount = async () => {
    try {
      await api.post('/admin/accounts', {
        user_id: id,
        type: newAccType,
        currency: newAccCurrency,
        balance: newAccBalance
      });
      fetchUser();
      showNotification(t('admin.user_detail.notification.account_created'), 'success');
    } catch (error) {
      showNotification(t('admin.user_detail.notification.account_error'), 'error');
    }
  };

  if (loading || !user) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.user_detail.title', { name: user.name })}</Typography>
      
      <Grid container spacing={4}>
        {/* User Info Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.user_detail.profile_data')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label={t('admin.users.table.name')} name="name" value={user.name || ''} onChange={handleUserChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={t('admin.users.table.email')} name="email" value={user.email || ''} onChange={handleUserChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.user_detail.role_label')}</InputLabel>
                  <Select name="role" value={user.role || 'user'} label={t('admin.user_detail.role_label')} onChange={handleUserChange}>
                    <MenuItem value="user">{t('admin.users.roles.user')}</MenuItem>
                    <MenuItem value="admin">{t('admin.users.roles.admin')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch name="verified" checked={!!user.verified} onChange={handleUserChange} />}
                  label={t('admin.user_detail.verified_status')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch name="is_email_verified" checked={!!user.is_email_verified} onChange={handleUserChange} />}
                  label={t('email_verification.modal_title')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.user_detail.verification_status_label')}</InputLabel>
                  <Select name="verification_status" value={user.verification_status || 'not_started'} label={t('admin.user_detail.verification_status_label')} onChange={handleUserChange}>
                    <MenuItem value="not_started">{t('dashboard.verification.status.not_started')}</MenuItem>
                    <MenuItem value="pending">{t('dashboard.verification.status.pending')}</MenuItem>
                    <MenuItem value="verified">{t('dashboard.verification.status.verified')}</MenuItem>
                    <MenuItem value="rejected">{t('dashboard.verification.status.rejected')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {user.verification_document && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('admin.user_detail.verification_doc', { type: user.verification_document_type || 'passport' })}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {user.verification_document.split(',').map((doc, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box 
                          component="a" 
                          href={`/api/${doc.startsWith('uploads') ? '' : 'uploads/'}${doc}`} 
                          target="_blank" 
                          sx={{ 
                            display: 'block', 
                            p: 1, 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 1, 
                            bgcolor: '#f8fafc',
                            textDecoration: 'none',
                            color: '#3b82f6',
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '0.8rem',
                            '&:hover': { bgcolor: '#eff6ff' }
                          }}
                        >
                          {t('admin.user_detail.view_doc', { index: index + 1 })}
                        </Box>
                        {doc.toLowerCase().endsWith('.pdf') ? (
                          <Box 
                            sx={{ 
                              width: 200, 
                              height: 150, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              bgcolor: '#f1f5f9', 
                              borderRadius: 1, 
                              border: '1px solid #e2e8f0' 
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} color="#64748b">PDF DOCUMENT</Typography>
                          </Box>
                        ) : (
                          <img 
                            src={`/api/${doc.startsWith('uploads') ? '' : 'uploads/'}${doc}`} 
                            alt={`Verification Doc ${index + 1}`} 
                            style={{ maxWidth: 200, maxHeight: 150, borderRadius: 4, border: '1px solid #e2e8f0' }} 
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              {user.bank_statement_document && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('dashboard.verification.bank_statement', 'Выписка по счету')}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {user.bank_statement_document.split(',').map((doc, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box 
                          component="a" 
                          href={`/api/${doc.startsWith('uploads') ? '' : 'uploads/'}${doc}`} 
                          target="_blank" 
                          sx={{ 
                            display: 'block', 
                            p: 1, 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 1, 
                            bgcolor: '#f8fafc',
                            textDecoration: 'none',
                            color: '#3b82f6',
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '0.8rem',
                            '&:hover': { bgcolor: '#eff6ff' }
                          }}
                        >
                          {t('admin.user_detail.view_doc', { index: index + 1 })}
                        </Box>
                        {doc.toLowerCase().endsWith('.pdf') ? (
                          <Box 
                            sx={{ 
                              width: 200, 
                              height: 150, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              bgcolor: '#f1f5f9', 
                              borderRadius: 1, 
                              border: '1px solid #e2e8f0' 
                            }}
                          >
                            <Typography variant="caption" fontWeight={600} color="#64748b">PDF DOCUMENT</Typography>
                          </Box>
                        ) : (
                          <img 
                            src={`/api/${doc.startsWith('uploads') ? '' : 'uploads/'}${doc}`} 
                            alt={`Bank Statement ${index + 1}`} 
                            style={{ maxWidth: 200, maxHeight: 150, borderRadius: 4, border: '1px solid #e2e8f0' }} 
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField fullWidth label={t('auth.phone')} name="phone" value={user.phone || ''} onChange={handleUserChange} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('auth.country')}</InputLabel>
                  <Select
                    name="country"
                    value={user.country || ''}
                    onChange={handleUserChange}
                  >
                    {countries.map((c) => (
                      <MenuItem key={c} value={c}>{t(`countries.${c}`, c)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSaveUser}>
                  {t('admin.user_detail.save_profile')}
                </Button>
                <Button variant="outlined" color="warning" onClick={handleResetPassword}>
                  {t('dashboard.settings.change_password')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* User Accounts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.user_detail.accounts_title')}</Typography>
            {user.accounts && user.accounts.map(acc => (
              <Box key={acc.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('admin.user_detail.account_info', { currency: acc.currency, type: acc.type })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('admin.user_detail.account_number', { num: acc.account_number })}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {t('admin.user_detail.balance')} <strong>{acc.balance}</strong>
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => handleUpdateBalance(acc.id, acc.currency)}
                >
                  {t('admin.user_detail.deposit_withdraw')}
                </Button>
              </Box>
            ))}
            {(!user.accounts || user.accounts.length === 0) && (
              <Typography>{t('admin.user_detail.no_accounts')}</Typography>
            )}
          </Paper>

          {/* Add Account */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('admin.user_detail.add_account')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.user_detail.type_label')}</InputLabel>
                  <Select value={newAccType} label={t('admin.user_detail.type_label')} onChange={(e) => setNewAccType(e.target.value)}>
                    <MenuItem value="fiat">{t('dashboard.fiat_account')}</MenuItem>
                    <MenuItem value="crypto">{t('dashboard.crypto_account')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t('admin.user_detail.currency_placeholder')}
                  value={newAccCurrency}
                  onChange={(e) => setNewAccCurrency(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('admin.user_detail.initial_balance')}
                  type="number"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="secondary" onClick={handleCreateAccount}>
                  {t('admin.user_detail.create_account')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}