import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accs = await api.get('/accounts');
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
          const txs = await api.get('/transactions');
          setTransactions(txs.filter(t => t.account_id === accs[0].id));
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

  const handleTxClick = (tx) => {
    setSelectedTx(tx);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (selectedAccountId) {
      handleFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || {};
  const debitTurnover = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const creditTurnover = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.account_statement.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField 
              type="date"
              label={t('dashboard.account_statement.filter.date_from')}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField 
              type="date"
              label={t('dashboard.account_statement.filter.date_to')}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="caption" sx={{ position: 'absolute', top: -8, left: 8, bgcolor: 'white', px: 0.5, color: '#64748b', zIndex: 1 }}>{t('dashboard.account_statement.filter.account')}</Typography>
              <Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                {accounts.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.account_number} ({a.currency})</MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              onClick={handleFilter}
              variant="contained" 
              fullWidth
              sx={{ 
                bgcolor: '#3b82f6', 
                '&:hover': { bgcolor: '#2563eb' },
                textTransform: 'none',
                py: 1,
                boxShadow: 'none'
              }}
            >
              {t('dashboard.account_statement.filter.button')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ width: 140, color: '#1e293b' }}>{t('dashboard.account_statement.info.account_number')}</Typography>
            <Typography variant="body2" sx={{ color: '#334155' }}>{selectedAccount.account_number}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ width: 140, color: '#1e293b' }}>{t('dashboard.account_statement.info.currency')}</Typography>
            <Typography variant="body2" sx={{ color: '#334155' }}>{selectedAccount.currency}</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body2" fontWeight={600} sx={{ width: 140, color: '#1e293b' }}>{t('dashboard.account_statement.info.period')}</Typography>
            <Typography variant="body2" sx={{ color: '#334155' }}>{formatDateOnly(appliedPeriod.from)} - {formatDateOnly(appliedPeriod.to)}</Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e2e8f0', p: 1.5, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" sx={{ flexGrow: 1, color: '#334155', fontWeight: 500 }}>{t('dashboard.account_statement.info.debit_turnover')}</Typography>
              <Typography variant="body2" sx={{ color: '#ef4444' }}>{formatCurrency(debitTurnover, selectedAccount.currency, i18n.language)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', p: 1.5, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" sx={{ flexGrow: 1, color: '#334155', fontWeight: 500 }}>{t('dashboard.account_statement.info.credit_turnover')}</Typography>
              <Typography variant="body2" sx={{ color: '#22c55e' }}>+{formatCurrency(creditTurnover, selectedAccount.currency, i18n.language)}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {transactions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#334155' }}>
            {t('dashboard.account_statement.no_transactions')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('transactions.details.date')}</TableCell>
                <TableCell>{t('transactions.details.description')}</TableCell>
                <TableCell>{t('transactions.details.status')}</TableCell>
                <TableCell align="right">{t('transactions.details.amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(tx => (
                <TableRow 
                  key={tx.id} 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                  onClick={() => handleTxClick(tx)}
                >
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>{translateBackendMessage(tx.description) || t(`transactions.types.${tx.type}`)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {tx.status === 'processing' ? (
                        <HourglassEmptyIcon sx={{ fontSize: 16, mr: 1, color: '#ea580c' }} />
                      ) : tx.status === 'declined' ? (
                        <CancelIcon sx={{ fontSize: 16, mr: 1, color: '#dc2626' }} />
                      ) : (
                        <CheckCircleIcon sx={{ fontSize: 16, mr: 1, color: '#16a34a' }} />
                      )}
                      <Typography variant="body2" sx={{ color: tx.status === 'processing' ? '#ea580c' : tx.status === 'declined' ? '#dc2626' : '#16a34a', fontWeight: 500, textTransform: 'capitalize' }}>
                        {t(`transactions.status.${tx.status}`)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {(() => {
                      const isOutgoing = tx.amount < 0;
                      const totalImpact = isOutgoing ? (tx.amount - (tx.fee || 0)) : tx.amount;
                      return (
                        <Typography variant="body2" sx={{ color: totalImpact < 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                          {totalImpact > 0 ? '+' : ''}{formatCurrency(totalImpact, selectedAccount.currency, i18n.language)}
                        </Typography>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TransactionDetailsDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        transaction={selectedTx} 
      />
    </Box>
  );
};

export default AccountStatement;
