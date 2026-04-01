import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Divider,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { countries } from '../../utils/countries';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function AdminUserDetail() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [tempReason, setTempReason] = useState('');

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
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSaveUser = async (customData = null) => {
    try {
      const dataToSave = customData || user;
      await api.put(`/admin/users/${id}`, dataToSave);
      showNotification(t('admin.user_detail.notification.user_saved'), 'success');
      fetchUser();
    } catch (error) {
      showNotification(t('admin.user_detail.notification.user_save_error'), 'error');
    }
  };

  const handleBlockAction = async () => {
    const updatedUser = {
      ...user,
      is_blocked: 1,
      blocked_reason: tempReason
    };
    try {
      await api.put(`/admin/users/${id}`, updatedUser);
      setUser(updatedUser);
      setBlockDialogOpen(false);
      showNotification("Пользователь заблокирован", "success");
    } catch (e) {
      showNotification("Ошибка при блокировке", "error");
    }
  };

  const handleUnblockAction = async () => {
    const updatedUser = {
      ...user,
      is_blocked: 0,
      blocked_reason: ''
    };
    try {
      await api.put(`/admin/users/${id}`, updatedUser);
      setUser(updatedUser);
      showNotification("Пользователь разблокирован", "success");
    } catch (e) {
      showNotification("Ошибка при разблокировке", "error");
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
    const comment = prompt(t('admin.user_detail.prompts.comment', 'Комментарий'), '') || '';
    try {
      await api.post(`/admin/transactions`, {
        user_id: id, account_id: accountId, type: amount > 0 ? 'deposit' : 'withdraw',
        amount, currency, status: 'processing', description, comment
      });
      fetchUser();
      showNotification(t('admin.user_detail.notification.transaction_created'), 'success');
    } catch (error) {
      showNotification(t('admin.user_detail.notification.balance_error'), 'error');
    }
  };

  const handleCreateAccount = async () => {
    try {
      await api.post('/admin/accounts', {
        user_id: id, type: newAccType, currency: newAccCurrency, balance: newAccBalance
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

                {/* НОВЫЙ БЛОК БАНА */}
                <Grid item xs={12}>
                  <Box sx={{
                    p: 3, borderRadius: 2, border: '1px solid',
                    bgcolor: user.is_blocked ? '#fef2f2' : '#f0fdf4',
                    borderColor: user.is_blocked ? '#fee2e2' : '#dcfce7',
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: user.is_blocked ? '#991b1b' : '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                          {user.is_blocked ? <BlockIcon /> : <CheckCircleOutlineIcon />}
                          {user.is_blocked ? "Аккаунт заблокирован" : "Аккаунт активен"}
                        </Typography>
                        {user.is_blocked === 1 && (
                            <Typography variant="body2" sx={{ mt: 1, color: '#b91c1c', fontStyle: 'italic' }}>
                              <strong>Причина:</strong> {user.blocked_reason || "Не указана"}
                            </Typography>
                        )}
                      </Box>
                      {user.is_blocked ? (
                          <Button variant="contained" color="success" onClick={handleUnblockAction}>Разблокировать</Button>
                      ) : (
                          <Button variant="contained" color="error" onClick={() => { setTempReason(''); setBlockDialogOpen(true); }}>Заблокировать</Button>
                      )}
                    </Box>
                  </Box>
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
                  <FormControlLabel control={<Switch name="verified" checked={!!user.verified} onChange={handleUserChange} />} label={t('admin.user_detail.verified_status')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel control={<Switch name="is_email_verified" checked={!!user.is_email_verified} onChange={handleUserChange} />} label="Email Verified" />
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

                <Grid item xs={12}>
                  <TextField fullWidth label={t('auth.phone')} name="phone" value={user.phone || ''} onChange={handleUserChange} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('auth.country')}</InputLabel>
                    <Select name="country" value={user.country || ''} onChange={handleUserChange}>
                      {countries.map((c) => <MenuItem key={c} value={c}>{t(`countries.${c}`, c)}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="primary" onClick={() => handleSaveUser()}>
                    {t('admin.user_detail.save_profile')}
                  </Button>
                  <Button variant="outlined" color="warning" onClick={handleResetPassword}>
                    {t('dashboard.settings.change_password')}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>{t('admin.user_detail.accounts_title')}</Typography>
              {user.accounts && user.accounts.map(acc => (
                  <Box key={acc.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{acc.currency} ({acc.type})</Typography>
                    <Typography variant="body2" color="textSecondary">{acc.account_number}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>Баланс: <strong>{acc.balance}</strong></Typography>
                    <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => handleUpdateBalance(acc.id, acc.currency)}>Изменить</Button>
                  </Box>
              ))}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Добавить счет</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <Select value={newAccType} onChange={(e) => setNewAccType(e.target.value)}>
                      <MenuItem value="fiat">Фиатный</MenuItem>
                      <MenuItem value="crypto">Крипто</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Валюта" value={newAccCurrency} onChange={(e) => setNewAccCurrency(e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="secondary" fullWidth onClick={handleCreateAccount}>Создать счет</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* ДИАЛОГ БАНА */}
        <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>Блокировка аккаунта</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: '#5f6368' }}>Укажите причину блокировки. Пользователь увидит её при попытке входа.</Typography>
            <TextField fullWidth multiline rows={3} label="Причина бана" value={tempReason} onChange={(e) => setTempReason(e.target.value)} autoFocus />
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
            <Button onClick={() => setBlockDialogOpen(false)}>Отмена</Button>
            <Button variant="contained" color="error" onClick={handleBlockAction} disabled={!tempReason.trim()}>Заблокировать</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}