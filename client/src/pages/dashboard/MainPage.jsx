import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { 
  Box, Typography, Grid, Paper, Button, Select, MenuItem, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, List, ListItem, ListItemText
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TransactionDetailsDialog from '../../components/TransactionDetailsDialog';
import { useTranslation } from 'react-i18next';
import { translateBackendMessage } from '../../utils/i18n-helper';
import { formatCurrency, formatPercent } from '../../utils/format';
import CurrencyIcon from '../../components/CurrencyIcon';

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState('USD');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rates, setRates] = useState({ currencyPairs: [], cryptoRates: [] });
  const [selectedTx, setSelectedTx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    const fetchData = async () => {
      try {
        const [accs, txs, ratesData] = await Promise.all([
          api.get('/accounts'),
          api.get('/transactions'),
          api.get('/exchange-rates')
        ]);
        setAccounts(accs);
        setTransactions(txs.slice(0, 50)); // limit to recent 50

        const parsedRates = { 'USD': 1, currencyPairs: ratesData.currencyPairs, cryptoRates: ratesData.cryptoRates };
        ratesData.currencyPairs.forEach(p => {
          const [base, target] = p.pair.split('/');
          if (target === 'USD') parsedRates[base] = p.buyRaw;
        });
        ratesData.cryptoRates.forEach(c => {
          parsedRates[c.symbol] = c.priceRaw;
        });
        setRates(parsedRates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleTxClick = (tx) => {
    setSelectedTx(tx);
    setDialogOpen(true);
  };

  const getConvertedBalance = (accountList) => {
    return accountList.reduce((sum, a) => {
      const rateToUsd = rates[a.currency] || 1;
      const usdValue = a.balance * rateToUsd;
      const selectedCurrencyRateToUsd = rates[currency] || 1;
      return sum + (usdValue / selectedCurrencyRateToUsd);
    }, 0);
  };

  const fiatBalance = getConvertedBalance(accounts.filter(a => a.type === 'fiat'));
  const cryptoBalance = getConvertedBalance(accounts.filter(a => a.type === 'crypto'));
  const totalBalance = fiatBalance + cryptoBalance;

  return (
    <Box>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Left Column - Welcome, Balance, Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: { xs: 2, md: 3 } }}>
              {t('dashboard.welcome', { name: user.name })}
            </Typography>
            
            {/* Balance Card */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="body1" sx={{ color: '#334155', mr: 1, fontWeight: 500 }}>{t('dashboard.total_balance_in')}</Typography>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{
                    color: '#2563eb',
                    fontWeight: 600,
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
                    '& .MuiSelect-icon': { color: '#2563eb' }
                  }}
                >
                  <MenuItem value="USD"><CurrencyIcon currency="USD" sx={{ mr: 1, width: 20, height: 20 }} /> USD</MenuItem>
                  <MenuItem value="EUR"><CurrencyIcon currency="EUR" sx={{ mr: 1, width: 20, height: 20 }} /> EUR</MenuItem>
                  <MenuItem value="GBP"><CurrencyIcon currency="GBP" sx={{ mr: 1, width: 20, height: 20 }} /> GBP</MenuItem>
                  <MenuItem value="CHF"><CurrencyIcon currency="CHF" sx={{ mr: 1, width: 20, height: 20 }} /> CHF</MenuItem>
                </Select>
              </Box>
              
              <Typography variant="h3" fontWeight={700} sx={{ mb: 4, color: '#0f172a', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                {formatCurrency(totalBalance, currency, i18n.language)}
              </Typography>
              
              <Stack spacing={1} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{t('dashboard.bank_accounts')}</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(fiatBalance, currency, i18n.language)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{t('dashboard.cryptocurrency')}</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(cryptoBalance, currency, i18n.language)}</Typography>
                </Box>
              </Stack>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Button onClick={() => navigate('/dashboard/bank-transfer')} variant="outlined" fullWidth startIcon={<ArrowUpwardIcon sx={{ transform: 'rotate(45deg)', fontSize: 18 }}/>} sx={{ borderRadius: 1.5, py: 1.2, px: 0, borderColor: '#e2e8f0', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                    {t('common.withdraw')}
                  </Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button onClick={() => navigate('/dashboard/account-top-up')} variant="outlined" fullWidth startIcon={<ArrowDownwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 18 }}/>} sx={{ borderRadius: 1.5, py: 1.2, px: 0, borderColor: '#e2e8f0', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                    {t('common.deposit')}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Activity */}
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 2 }}>
              {t('dashboard.recent_activity')}
            </Typography>
            <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: '1px solid #e2e8f0', mb: 0, overflow: 'hidden', maxHeight: 400, overflowY: 'auto' }}>
              {transactions.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748b', py: 4, textAlign: 'center' }}>
                  {t('dashboard.no_transactions')}
                </Typography>
              ) : (
                <List disablePadding>
                  {transactions.map((tx, idx) => (
                    <ListItem 
                      key={idx} 
                      divider={idx !== transactions.length - 1} 
                      sx={{ p: { xs: 1.5, sm: 2 }, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                      onClick={() => handleTxClick(tx)}
                    >
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        bgcolor: tx.amount < 0 ? '#fee2e2' : '#dcfce7',
                        mr: { xs: 1.5, sm: 2 },
                        flexShrink: 0
                      }}>
                        {tx.amount < 0 ? (
                          <ArrowUpwardIcon sx={{ color: '#ef4444', fontSize: 20, transform: 'rotate(45deg)' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ color: '#22c55e', fontSize: 20, transform: 'rotate(45deg)' }} />
                        )}
                      </Box>
                      <ListItemText 
                        primary={tx.description ? translateBackendMessage(tx.description).split(':')[0] : t(`transactions.types.${tx.type}`)}
                        secondary={formatDate(tx.date)} 
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600, sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        {(() => {
                          const isOutgoing = tx.amount < 0;
                          const totalImpact = isOutgoing ? (tx.amount - (tx.fee || 0)) : tx.amount;
                          return (
                            <Typography variant="body2" sx={{ color: totalImpact < 0 ? '#ef4444' : '#22c55e', fontWeight: 700, mr: { xs: 0.5, sm: 1.5 }, whiteSpace: 'nowrap' }}>
                              {totalImpact > 0 ? '+' : ''}{formatCurrency(totalImpact, tx.currency, i18n.language)}
                            </Typography>
                          );
                        })()}
                        {tx.status === 'processing' ? (
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', bgcolor: '#fff7ed', flexShrink: 0 }}>
                            <HourglassEmptyIcon sx={{ fontSize: 12 }} />
                          </Box>
                        ) : tx.status === 'declined' ? (
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', bgcolor: '#fef2f2', flexShrink: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10 }}>X</Typography>
                          </Box>
                        ) : (
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', bgcolor: '#f0fdf4', flexShrink: 0 }}>
                            <CheckCircleIcon sx={{ fontSize: 12 }} />
                          </Box>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* Right Column - Quick Links */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: { xs: 2, md: 3 } }}>
            {t('dashboard.quick_links')}
          </Typography>
          
          <Stack spacing={2}>
            <Button
              onClick={() => navigate('/dashboard/withdraw-accounts')}
              variant="outlined"
              fullWidth
              startIcon={<AccountBalanceIcon sx={{ color: '#64748b' }} />}
              sx={{ justifyContent: 'flex-start', py: 2.2, px: { xs: 2, lg: 1.5 }, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: 'white', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', lg: '0.75rem', xl: '0.8rem' }, whiteSpace: 'nowrap' }}
            >
              {t('dashboard.add_bank')}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/currency-exchange')}
              variant="outlined"
              fullWidth
              startIcon={<CurrencyExchangeIcon sx={{ color: '#64748b' }} />}
              sx={{ justifyContent: 'flex-start', py: 2.2, px: { xs: 2, lg: 1.5 }, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: 'white', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', lg: '0.75rem', xl: '0.8rem' }, whiteSpace: 'nowrap' }}
            >
              {t('common.exchange')}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/crypto-wallets')}
              variant="outlined"
              fullWidth
              startIcon={<AccountBalanceWalletIcon sx={{ color: '#64748b' }} />}
              sx={{ justifyContent: 'flex-start', py: 2.2, px: { xs: 2, lg: 1.5 }, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: 'white', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', lg: '0.75rem', xl: '0.8rem' }, whiteSpace: 'nowrap' }}
            >
              {t('dashboard.create_crypto_wallet')}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/crypto-transfer')}
              variant="outlined"
              fullWidth
              startIcon={<CurrencyBitcoinIcon sx={{ color: '#64748b' }} />}
              sx={{ justifyContent: 'flex-start', py: 2.2, px: { xs: 2, lg: 1.5 }, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: 'white', color: '#0f172a', textTransform: 'none', fontWeight: 600, fontSize: { xs: '0.8rem', lg: '0.75rem', xl: '0.8rem' }, whiteSpace: 'nowrap' }}
            >
              {t('dashboard.buy_crypto')}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <TransactionDetailsDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        transaction={selectedTx} 
      />

      {/* Currency Exchange */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b' }}>
          {t('dashboard.currency_exchange_title')}
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <IconButton size="small"><ChevronLeftIcon /></IconButton>
          <IconButton size="small"><ChevronRightIcon /></IconButton>
        </Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(rates.currencyPairs || []).map((pair) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pair.pair}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img src={pair.flag} alt={pair.pair} style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }} />
                <Typography variant="subtitle2" fontWeight={600}>{pair.pair}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 2, mt: 'auto' }}>
                <Box sx={{ borderRight: '1px solid #f1f5f9', pr: 1, flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }} noWrap>{t('dashboard.table.buy')} {pair.pair.split('/')[0]}</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main" sx={{ wordBreak: 'break-word' }}>{formatCurrency(pair.buyRaw || pair.buy, pair.pair.split('/')[1], i18n.language, 4, 4)}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', pl: 1, flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }} noWrap>{t('dashboard.table.sell')} {pair.pair.split('/')[0]}</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main" sx={{ wordBreak: 'break-word' }}>{formatCurrency(pair.sellRaw || pair.sell, pair.pair.split('/')[1], i18n.language, 4, 4)}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Cryptocurrency Exchange */}
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 2 }}>
        {t('dashboard.cryptocurrency_exchange_title')}
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflowX: 'auto', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.table.name')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.table.price')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0', display: { xs: 'none', sm: 'table-cell' } }}>{t('dashboard.table.change_24h')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.table.change_percent')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rates.cryptoRates || []).map((row) => (
              <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="img" src={row.icon} alt={row.name} sx={{ width: 24, height: 24, borderRadius: '50%', mr: { xs: 1.5, sm: 2 }, display: 'block' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{row.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.2 }}>{row.symbol}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.priceRaw || row.price, 'USD', i18n.language)}
                </TableCell>
                <TableCell align="right" sx={{ color: row.isPositive ? '#22c55e' : '#ef4444', borderBottom: '1px solid #e2e8f0', display: { xs: 'none', sm: 'table-cell' }, fontWeight: 500 }}>
                  {row.isPositive ? '↑' : '↓'} {formatCurrency(row.changeRaw || row.change, 'USD', i18n.language)}
                </TableCell>
                <TableCell align="right" sx={{ color: row.isPositive ? '#22c55e' : '#ef4444', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>
                  {row.isPositive ? '↑' : '↓'} {formatPercent(row.percentRaw || row.percent, i18n.language)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MainPage;
