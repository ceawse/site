import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Tabs, Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { api } from '../../api';
import { translateBackendMessage } from '../../utils/i18n-helper';

const ListTransfers = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);

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
      setTransactions(txs.filter(t => t.account_id === selectedAccountId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredTransactions = transactions.filter(t => {
    if (tabValue === 0) return true; // All
    const status = t.status?.toLowerCase();
    if (tabValue === 1) return status === 'completed';
    if (tabValue === 2) return status === 'processing';
    if (tabValue === 3) return status === 'declined';
    return true;
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.list_transfers.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label={t('dashboard.account_statement.filter.date_from')}
              defaultValue="02/08/2026"
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
          <Grid item xs={12} sm={3}>
            <TextField
              label={t('dashboard.account_statement.filter.date_to')}
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748b', minWidth: 'auto', mr: 4 }, '& .Mui-selected': { color: '#0f172a' }, '& .MuiTabs-indicator': { backgroundColor: '#0f172a' } }}>
          <Tab label={<span>{t('dashboard.list_transfers.tabs.all')} <Box component="span" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.2, borderRadius: 1, ml: 0.5, fontSize: 12 }}>{transactions.length}</Box></span>} />
          <Tab label={<span>{t('dashboard.list_transfers.tabs.completed')} <Box component="span" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.2, borderRadius: 1, ml: 0.5, fontSize: 12 }}>{transactions.filter(t => t.status?.toLowerCase() === 'completed').length}</Box></span>} />
          <Tab label={<span>{t('dashboard.list_transfers.tabs.processing')} <Box component="span" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.2, borderRadius: 1, ml: 0.5, fontSize: 12 }}>{transactions.filter(t => t.status?.toLowerCase() === 'processing').length}</Box></span>} />
          <Tab label={<span>{t('dashboard.list_transfers.tabs.declined')} <Box component="span" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.2, borderRadius: 1, ml: 0.5, fontSize: 12 }}>{transactions.filter(t => t.status?.toLowerCase() === 'declined').length}</Box></span>} />
        </Tabs>
      </Box>

      <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
        {t('dashboard.list_transfers.showing_period', { from: '2026-02-08', to: '2026-03-10' })}
      </Typography>

      {filteredTransactions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#334155' }}>
            {t('dashboard.list_transfers.no_transactions')}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          {filteredTransactions.map((tx, i) => (
            <Box key={tx.id} sx={{ p: 2, borderBottom: i === filteredTransactions.length - 1 ? 0 : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ color: '#1e293b' }}>
                  {tx.description ? translateBackendMessage(tx.description) : t(`transactions.types.${tx.type}`)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>{tx.date} • {tx.account_number}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: tx.amount < 0 ? '#ef4444' : '#22c55e' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: tx.status === 'Completed' ? '#22c55e' : tx.status === 'Declined' ? '#ef4444' : '#f59e0b' }}>
                  {t(`transactions.status.${tx.status?.toLowerCase()}`)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ListTransfers;
