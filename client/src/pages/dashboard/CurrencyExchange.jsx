import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { api } from '../../api';
import CurrencyIcon from '../../components/CurrencyIcon';

const CurrencyExchange = () => {
  const { t, i18n } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [sellAccountId, setSellAccountId] = useState('');
  const [buyCurrency, setBuyCurrency] = useState('eur');
  const [sellAmount, setSellAmount] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exchangeRates, setExchangeRates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accs, rates] = await Promise.all([
          api.get('/accounts'),
          api.get('/exchange-rates')
        ]);
        setAccounts(accs);
        const usdAcc = accs.find(a => a.currency === 'USD');
        if (usdAcc) setSellAccountId(usdAcc.id);
        
        // Parse rates into a usable format
        const parsedRates = {};
        rates.currencyPairs.forEach(p => {
          const [base, target] = p.pair.split('/');
          parsedRates[`${base}-${target}`] = p.buyRaw;
          parsedRates[`${target}-${base}`] = 1 / p.sellRaw;
        });
        rates.cryptoRates.forEach(c => {
          const price = c.priceRaw;
          parsedRates[`${c.symbol}-USD`] = price;
          parsedRates[`USD-${c.symbol}`] = 1 / price;
        });
        // some cross rates
        rates.cryptoRates.forEach(c => {
          const price = parseFloat(c.price.replace(/,/g, '').split(' ')[0]);
          ['EUR', 'GBP', 'CHF'].forEach(fiat => {
            const usdToFiat = parsedRates[`USD-${fiat}`] || 1;
            parsedRates[`${c.symbol}-${fiat}`] = price * usdToFiat;
            parsedRates[`${fiat}-${c.symbol}`] = 1 / (price * usdToFiat);
          });
        });
        setExchangeRates(parsedRates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const selectedSellAccount = accounts.find(a => a.id === sellAccountId) || {};
  const balance = selectedSellAccount.balance || 0;
  const numSellAmount = parseFloat(sellAmount) || 0;
  const isInsufficient = numSellAmount > balance;

  const sellCurrency = selectedSellAccount.currency || 'USD';
  const rateKey = `${sellCurrency}-${buyCurrency.toUpperCase()}`;
  const currentRate = exchangeRates[rateKey] || 1;
  const buyAmount = (numSellAmount * currentRate).toFixed(4);

  const canExchange = numSellAmount > 0 && !isInsufficient;

  const handleExchange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/exchange', {
        from_account_id: sellAccountId,
        to_currency: buyCurrency.toUpperCase(),
        sell_amount: numSellAmount,
        rate: currentRate
      });
      setSuccess(t('dashboard.currency_exchange.success_msg'));
      setSellAmount('0.00');
    } catch (err) {
      setError(err.message || t('dashboard.currency_exchange.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.currency_exchange.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', maxWidth: 800 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 2 }}>
          {t('dashboard.currency_exchange.you_sell')}
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label={t('dashboard.currency_exchange.amount_label')}
              fullWidth
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              error={isInsufficient}
              helperText={isInsufficient ? t('dashboard.currency_exchange.insufficient_balance', { currency: sellCurrency }) : ""}
              FormHelperTextProps={{ sx: { mx: 0, mt: 1 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <InfoOutlinedIcon fontSize="small" sx={{ color: isInsufficient ? '#ef4444' : '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.currency_exchange.from_account')}</InputLabel>
              <Select value={sellAccountId} onChange={(e) => setSellAccountId(e.target.value)} sx={{ borderRadius: 2 }}>
                {accounts.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CurrencyIcon currency={a.currency} />
                      {a.currency} {t('dashboard.crypto_transfer.wallet')}: {a.balance.toLocaleString(undefined, { minimumFractionDigits: a.type === 'crypto' ? 8 : 2 })} {a.currency}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mt: 4, mb: 2 }}>
          {t('dashboard.currency_exchange.you_buy')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label={t('dashboard.currency_exchange.amount_label')}
              fullWidth
              value={numSellAmount > 0 ? buyAmount : ''}
              placeholder={t('dashboard.currency_exchange.placeholder_amount')}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.currency_exchange.to_currency')}</InputLabel>
              <Select
                value={buyCurrency}
                onChange={(e) => setBuyCurrency(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                }}
              >
                <MenuItem value="eur"><CurrencyIcon currency="EUR" /> EUR</MenuItem>
                <MenuItem value="gbp"><CurrencyIcon currency="GBP" /> GBP</MenuItem>
                <MenuItem value="usd"><CurrencyIcon currency="USD" /> USD</MenuItem>
                <MenuItem value="chf"><CurrencyIcon currency="CHF" /> CHF</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          fullWidth
          disabled={!canExchange || loading}
          onClick={handleExchange}
          sx={{ 
            bgcolor: canExchange ? '#3b82f6' : '#e2e8f0', 
            color: canExchange ? 'white' : '#94a3b8',
            '&.Mui-disabled': {
              bgcolor: '#e2e8f0',
              color: '#94a3b8'
            },
            '&:hover': {
              bgcolor: canExchange ? '#2563eb' : '#e2e8f0'
            },
            textTransform: 'none', 
            py: 1.5, 
            borderRadius: 1.5,
            fontWeight: 500,
            boxShadow: 'none'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('dashboard.currency_exchange.exchange_button')}
        </Button>
      </Paper>
    </Box>
  );
};

export default CurrencyExchange;
