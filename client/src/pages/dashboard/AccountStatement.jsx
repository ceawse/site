import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, FormControl, InputLabel, Chip
} from '@mui/material';

import { api } from '../../api';
import TransactionDetailsDialog from '../../components/TransactionDetailsDialog';
import { useTranslation } from 'react-i18next';
import { translateBackendMessage } from '../../utils/i18n-helper';
import { formatCurrency } from '../../utils/format';

const AccountStatement = () => {
  const { t, i18n } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedPeriod, setAppliedPeriod] = useState({ from: '', to: '' });

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(i18n.language === 'gb' ? 'en-GB' : i18n.language);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString(i18n.language === 'gb' ? 'en-GB' : i18n.language, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accs = await api.get('/accounts');
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleFilter = async () => {
    if (!selectedAccountId) return;
    try {
      const txs = await api.get('/transactions');
      let filtered = txs.filter(t => t.account_id === selectedAccountId);

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        filtered = filtered.filter(t => new Date(t.date) >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => new Date(t.date) <= to);
      }

      setTransactions(filtered);
      setAppliedPeriod({ from: dateFrom, to: dateTo });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedAccountId) handleFilter();
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || {};
  const debitTurnover = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const creditTurnover = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.account_statement.title')}
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          {/* Дата С */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              label={t('dashboard.account_statement.filter.date_from')}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ lang: i18n.language === 'gb' ? 'en' : i18n.language }}
            />
          </Grid>

          {/* Дата ПО */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              label={t('dashboard.account_statement.filter.date_to')}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ lang: i18n.language === 'gb' ? 'en' : i18n.language }}
            />
          </Grid>

          {/* Выбор счета */}
          <Grid item xs={12} sm={8} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>{t('dashboard.account_statement.filter.account')}</InputLabel>
              <Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                label={t('dashboard.account_statement.filter.account')}
                notched
              >
                {accounts.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.account_number} ({a.currency})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Кнопка */}
          <Grid item xs={12} sm={4} md={2}>
            <Button
              onClick={handleFilter}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#3b82f6',
                height: '40px',
                textTransform: 'none',
                boxShadow: 'none'
              }}
            >
              {t('dashboard.account_statement.filter.button')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Информационный блок */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" sx={{ width: 140, color: '#64748b', fontWeight: 500 }}>{t('dashboard.account_statement.info.account_number')}</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedAccount.account_number || '-'}</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" sx={{ width: 140, color: '#64748b', fontWeight: 500 }}>{t('dashboard.account_statement.info.currency')}</Typography>
              <Typography variant="body2" fontWeight={600}>{selectedAccount.currency}</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="body2" sx={{ width: 140, color: '#64748b', fontWeight: 500 }}>{t('dashboard.account_statement.info.period')}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {dateFrom ? formatDateOnly(dateFrom) : '...'} — {dateTo ? formatDateOnly(dateTo) : '...'}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e2e8f0', p: 1.5, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" sx={{ flexGrow: 1, color: '#475569' }}>{t('dashboard.account_statement.info.debit_turnover')}</Typography>
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(debitTurnover, selectedAccount.currency, i18n.language)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', p: 1.5, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" sx={{ flexGrow: 1, color: '#475569' }}>{t('dashboard.account_statement.info.credit_turnover')}</Typography>
              <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 700 }}>+{formatCurrency(creditTurnover, selectedAccount.currency, i18n.language)}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Таблица */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('transactions.details.date')}</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('transactions.details.description')}</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('transactions.details.status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>{t('transactions.details.amount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>
                  {t('dashboard.account_statement.no_transactions')}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(tx => (
                <TableRow
                  key={tx.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedTx(tx); setDialogOpen(true); }}
                >
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(tx.date)}</TableCell>
                  <TableCell>{translateBackendMessage(tx.description) || t(`transactions.types.${tx.type}`)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`transactions.status.${tx.status}`)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: tx.status === 'completed' ? '#16a34a' : tx.status === 'processing' ? '#ea580c' : '#dc2626',
                        borderColor: 'currentColor',
                        bgcolor: 'transparent'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: tx.amount < 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, selectedAccount.currency, i18n.language)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TransactionDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transaction={selectedTx}
      />
    </Box>
  );
};

export default AccountStatement;