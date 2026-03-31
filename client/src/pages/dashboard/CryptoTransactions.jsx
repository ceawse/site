import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Grid, TextField, Button, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { api } from '../../api';
import TransactionDetailsDialog from '../../components/TransactionDetailsDialog';
import { translateBackendMessage } from '../../utils/i18n-helper';

const CryptoTransactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    const fetchTransactions = async () => {
      try {
        const data = await api.get('/transactions?type=crypto');
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleTxClick = (tx) => {
    setSelectedTx(tx);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.crypto_transactions.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('dashboard.crypto_transactions.filter.date_from')}
              defaultValue="02/10/2026"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t('dashboard.crypto_transactions.filter.date_to')}
              defaultValue="03/10/2026"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: '#3b82f6', 
                  '&:hover': { bgcolor: '#2563eb' },
                  textTransform: 'none',
                  py: 1,
                  px: 5,
                  boxShadow: 'none'
                }}
              >
                {t('dashboard.crypto_transactions.filter.button')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Typography sx={{ textAlign: 'center', py: 4 }}>{t('common.loading')}</Typography>
      ) : transactions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#334155' }}>
            {t('dashboard.crypto_transactions.no_transactions')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('dashboard.crypto_transactions.table.date')}</TableCell>
                <TableCell>{t('dashboard.crypto_transactions.table.account')}</TableCell>
                <TableCell>{t('dashboard.crypto_transactions.table.description')}</TableCell>
                <TableCell>{t('dashboard.crypto_transactions.table.status')}</TableCell>
                <TableCell align="right">{t('dashboard.crypto_transactions.table.amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.id} 
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                  onClick={() => handleTxClick(tx)}
                >
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>{tx.account_number}</TableCell>
                  <TableCell>{translateBackendMessage(tx.description) || t(`transactions.types.${tx.type}`)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`transactions.status.${tx.status?.toLowerCase()}`)}
                      size="small"
                      color={tx.status === 'completed' ? 'success' : tx.status === 'processing' ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: tx.amount < 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
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

export default CryptoTransactions;
