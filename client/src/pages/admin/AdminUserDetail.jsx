import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Divider,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack, Link
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { countries } from '../../utils/countries';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
  const [walletAddresses, setWalletAddresses] = useState({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const data = await api.get(`/admin/users/${id}`);
      setUser(data);
      const addresses = {};
      if (data.accounts) {
        data.accounts.forEach(acc => {
          addresses[acc.id] = acc.wallet_address || '';
        });
      }
      setWalletAddresses(addresses);
    } catch (error) {
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

  const handleWalletAddressChange = (accId, value) => {
    setWalletAddresses(prev => ({ ...prev, [accId]: value }));
  };

  const saveWalletAddress = async (accId, balance) => {
    try {
      await api.put(`/admin/accounts/${accId}`, {
        balance: balance,
        wallet_address: walletAddresses[accId]
      });
      showNotification("Адрес кошелька сохранен", "success");
      fetchUser();
    } catch (err) {
      showNotification("Ошибка сохранения адреса", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      await api.put(`/admin/users/${id}`, user);
      showNotification(t('admin.user_detail.notification.user_saved'), 'success');
      fetchUser();
    } catch (error) {
      showNotification(t('admin.user_detail.notification.user_save_error'), 'error');
    }
  };

  // ЛОГИКА БЛОКИРОВКИ
  const handleBlockAction = async () => {
    const updatedUser = { ...user, is_blocked: 1, blocked_reason: tempReason };
    try {
      await api.put(`/admin/users/${id}`, updatedUser);
      setUser(updatedUser);
      setBlockDialogOpen(false);
      showNotification("Пользователь заблокирован", "success");
    } catch (e) {
      showNotification("Ошибка при блокировке", "error");
    }
  };

  // ЛОГИКА РАЗБЛОКИРОВКИ
  const handleUnblockAction = async () => {
    const updatedUser = { ...user, is_blocked: 0, blocked_reason: '' };
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
    const description = prompt(t('admin.user_detail.prompts.description'), "Balance Update") || "Balance Update";
    try {
      await api.post(`/admin/transactions`, {
        user_id: id, account_id: accountId, type: amount > 0 ? 'deposit' : 'withdraw',
        amount, currency, status: 'processing', description
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

  const renderDocsForAdmin = (title, filesString) => {
    if (!filesString) return null;
    const files = filesString.split(',').filter(f => f.trim() !== '');
    if (files.length === 0) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569' }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {files.map((filePath, idx) => {
            const cleanPath = filePath.replace('server/', '');
            const fileName = cleanPath.split(/[/\\]/).pop();
            const isPdf = fileName.toLowerCase().endsWith('.pdf');
            return (
              <Grid item xs={12} key={idx}>
                <Link
                  href={`/api/${cleanPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none' }}
                >
                  <Paper variant="outlined" sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#3b82f6' }
                  }}>
                    {isPdf ? <PictureAsPdfIcon color="error" /> : <ImageIcon color="primary" />}
                    <Typography variant="body2" color="text.primary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {fileName}
                    </Typography>
                  </Paper>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  if (loading || !user) return <Typography sx={{p: 4}}>{t('common.loading')}</Typography>;

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Правка пользователя: {user.name}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Данные профиля</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Имя" name="name" value={user.name || ''} onChange={handleUserChange} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Email" name="email" value={user.email || ''} onChange={handleUserChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{
                  p: 1, px: 2, borderRadius: 1, border: '1px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  bgcolor: user.is_blocked ? '#fef2f2' : '#f0fdf4',
                  borderColor: user.is_blocked ? '#fee2e2' : '#dcfce7'
                }}>
                  <Typography variant="body2" sx={{ color: user.is_blocked ? '#991b1b' : '#166534', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    {user.is_blocked ? <BlockIcon fontSize="small"/> : <CheckCircleOutlineIcon fontSize="small"/>}
                    {user.is_blocked ? `Заблокирован: ${user.blocked_reason || 'Без причины'}` : "Аккаунт активен"}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color={user.is_blocked ? "success" : "error"}
                    onClick={() => user.is_blocked ? handleUnblockAction() : setBlockDialogOpen(true)}
                  >
                    {user.is_blocked ? "Разблокировать" : "Заблокировать"}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Роль</InputLabel>
                  <Select name="role" value={user.role || 'user'} label="Роль" onChange={handleUserChange}>
                    <MenuItem value="user">Пользователь</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={<Switch name="verified" checked={!!user.verified} onChange={handleUserChange} size="small" />}
                  label="Статус верификации"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={<Switch name="is_email_verified" checked={!!user.is_email_verified} onChange={handleUserChange} size="small" />}
                  label="Email Verified"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус док-тов</InputLabel>
                  <Select name="verification_status" value={user.verification_status || 'not_started'} label="Статус док-тов" onChange={handleUserChange}>
                    <MenuItem value="not_started">Не начато</MenuItem>
                    <MenuItem value="pending">В процессе</MenuItem>
                    <MenuItem value="verified">Подтвержден</MenuItem>
                    <MenuItem value="rejected">Отклонен</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Номер телефона" name="phone" value={user.phone || ''} onChange={handleUserChange} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Страна</InputLabel>
                  <Select name="country" value={user.country || ''} label="Страна" onChange={handleUserChange}>
                    {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" sx={{ bgcolor: '#4F46E5' }} onClick={handleSaveUser}>Сохранить профиль</Button>
                  <Button variant="outlined" color="warning" onClick={handleResetPassword}>Сменить пароль</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertDriveFileIcon color="primary" /> Документы для верификации
            </Typography>
            {!user.verification_document && !user.bank_statement_document ? (
               <Typography variant="body2" color="text.secondary">Пользователь еще не загрузил ни одного документа.</Typography>
            ) : (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  {renderDocsForAdmin(`Удостоверение личности (${user.verification_document_type || 'ID'})`, user.verification_document)}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderDocsForAdmin("Выписка / Подтверждение адреса", user.bank_statement_document)}
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Счета</Typography>
            <Grid container spacing={2}>
              {user.accounts && user.accounts.map(acc => (
                <Grid item xs={12} sm={6} key={acc.id}>
                  <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fcfcfc' }}>
                    <Typography variant="subtitle2" fontWeight={700}>{acc.currency} ({acc.type})</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>{acc.account_number}</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>Баланс: <strong>{acc.balance}</strong></Typography>
                    {acc.type === 'crypto' && (
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Адрес кошелька"
                          variant="outlined"
                          value={walletAddresses[acc.id] || ''}
                          onChange={(e) => handleWalletAddressChange(acc.id, e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <IconButton size="small" color="primary" onClick={() => saveWalletAddress(acc.id, acc.balance)}>
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    )}
                    <Button size="small" variant="outlined" fullWidth onClick={() => handleUpdateBalance(acc.id, acc.currency)}>Изменить баланс</Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Добавить счет</Typography>
            <Stack direction="row" spacing={1}>
              <Select size="small" value={newAccType} onChange={(e) => setNewAccType(e.target.value)} sx={{ minWidth: 110 }}>
                <MenuItem value="fiat">Фиатный</MenuItem>
                <MenuItem value="crypto">Крипто</MenuItem>
              </Select>
              <TextField size="small" label="Валюта" value={newAccCurrency} onChange={(e) => setNewAccCurrency(e.target.value)} />
              <Button variant="contained" sx={{ bgcolor: '#4F46E5', whiteSpace: 'nowrap' }} onClick={handleCreateAccount}>Создать счет</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Причина блокировки</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} sx={{ mt: 1 }} value={tempReason} onChange={(e) => setTempReason(e.target.value)} placeholder="Напр. Нарушение правил..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleBlockAction}>Заблокировать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}