import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Stepper, Step, StepLabel, ToggleButtonGroup, ToggleButton, Divider, InputLabel, FormControl, Alert,
  Checkbox, FormControlLabel, TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CurrencyIcon from '../../components/CurrencyIcon';

const AccountTopUp = () => {
  const { t } = useTranslation();
  const steps = [t('dashboard.top_up.steps.enter_details'), t('dashboard.top_up.steps.payment_info'), t('dashboard.top_up.steps.confirmation')];
  
  const [accountType, setAccountType] = useState('fiat');
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [settings, setSettings] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    method: 'bank',
    currency: 'USD'
  });

  const getNetworkName = (currency) => {
    if (currency === 'BTC') return 'Bitcoin';
    if (currency === 'ETH') return 'Ethereum';
    if (currency === 'SOL') return 'Solana';
    return 'Tron (TRC20)';
  };

  const getAddress = (currency) => {
    if (currency === 'BTC') return settings.wallet_btc;
    if (currency === 'ETH') return settings.wallet_eth;
    if (currency === 'SOL') return settings.wallet_sol;
    return settings.wallet_trc20;
  };

  const handleAccountChange = (e) => {
    const accId = e.target.value;
    const selected = accounts.find(a => a.id === accId);
    let newCurrency = formData.currency;

    if (selected) {
      if (selected.type === 'fiat') {
        if (!['USD', 'EUR', 'GBP'].includes(newCurrency)) newCurrency = 'USD';
      } else {
        if (selected.currency === 'BTC') {
          newCurrency = 'BTC';
        } else if (selected.currency === 'ETH') {
          if (!['ETH', 'USDT'].includes(newCurrency)) newCurrency = 'ETH';
        } else if (selected.currency === 'SOL') {
          if (!['SOL', 'USDT'].includes(newCurrency)) newCurrency = 'SOL';
        } else if (selected.currency === 'USDT') {
          newCurrency = 'USDT';
        } else {
          newCurrency = selected.currency;
        }
      }
    }

    setFormData({ ...formData, accountId: accId, currency: newCurrency });
  };

  const allowedCurrencies = (() => {
    const selected = accounts.find(a => a.id === formData.accountId);
    if (!selected) return [];
    if (selected.type === 'fiat') return ['USD', 'EUR', 'GBP'];
    if (selected.currency === 'BTC') return ['BTC'];
    if (selected.currency === 'ETH') return ['ETH', 'USDT'];
    if (selected.currency === 'SOL') return ['SOL', 'USDT'];
    if (selected.currency === 'USDT') return ['USDT'];
    return [selected.currency];
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, settingsData] = await Promise.all([
          api.get('/accounts'),
          api.get('/settings')
        ]);
        setAccounts(accData);
        setSettings(settingsData);
        const fiatAcc = accData.find(a => a.type === 'fiat');
        if (fiatAcc) {
          setFormData(prev => ({ ...prev, accountId: fiatAcc.id, currency: fiatAcc.currency }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAccountTypeChange = (event, newType) => {
    if (newType !== null) {
      setAccountType(newType);
      const acc = accounts.find(a => a.type === newType);
      if (acc) {
        setFormData({ ...formData, accountId: acc.id, currency: acc.currency });
      } else {
        setFormData({ ...formData, accountId: '', currency: newType === 'fiat' ? 'USD' : 'USDT' });
      }
    }
  };

  const isCrypto = accountType === 'crypto' || ['USDT', 'ETH', 'BTC'].includes(formData.currency);
  const isBank = !isCrypto && formData.method === 'bank';
  const isCash = !isCrypto && formData.method === 'cash';

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!formData.amount || !formData.accountId) {
        setError(t('dashboard.top_up.errors.enter_amount_account'));
        return;
      }
      if (parseFloat(formData.amount) <= 0) {
        setError(t('dashboard.top_up.errors.amount_gt_zero'));
        return;
      }
      setError('');
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (isCrypto && !confirmed) {
        setError(t('dashboard.top_up.errors.confirm_transfer'));
        return;
      }
      setLoading(true);
      setError('');
      try {
        await api.post('/topup', {
          account_id: formData.accountId,
          amount: parseFloat(formData.amount),
          currency: formData.currency, // Use the selected payment currency
          method: (accountType === 'crypto' || ['USDT', 'ETH', 'BTC'].includes(formData.currency)) ? 'crypto_transfer' : formData.method
        });
        setSuccess(true);
        setActiveStep(2);
      } catch (err) {
        setError(err.message || t('dashboard.top_up.errors.failed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.top_up.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 6 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 500 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {!success && (
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
            {activeStep === 0 ? t('dashboard.top_up.subtitle_details') : accountType === 'crypto' ? t('dashboard.top_up.subtitle_crypto') : t('dashboard.top_up.subtitle_bank')}
          </Typography>
        )}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 && (
          <>
            <Typography variant="body2" sx={{ color: '#334155', mb: 1 }}>
              {t('dashboard.top_up.select_type')}
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={accountType}
              exclusive
              onChange={handleAccountTypeChange}
              fullWidth
              sx={{ mb: 4 }}
            >
              <ToggleButton value="fiat" sx={{ textTransform: 'none', fontWeight: 600, py: 1.5 }}>
                {t('dashboard.top_up.fiat_account')}
              </ToggleButton>
              <ToggleButton value="crypto" sx={{ textTransform: 'none', fontWeight: 600, py: 1.5 }}>
                {t('dashboard.top_up.crypto_account')}
              </ToggleButton>
            </ToggleButtonGroup>

            {accountType === 'crypto' && accounts.filter(a => a.type === 'crypto').length === 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('dashboard.top_up.no_wallets_error')}
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ minWidth: 250 }}>
                  <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.top_up.select_account_label')}</InputLabel>
                  <Select
                    value={formData.accountId}
                    onChange={handleAccountChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {accounts.filter(a => a.type === accountType).map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CurrencyIcon currency={a.currency.split(' ')[0]} />
                          {a.account_number} ({a.currency})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField 
                  label={t('dashboard.top_up.amount_label')}
                  fullWidth
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.top_up.currency_label')}</InputLabel>
                  <Select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                    }}
                  >
                    {allowedCurrencies.map(curr => (
                      <MenuItem key={curr} value={curr}>
                        <CurrencyIcon currency={curr.split(' ')[0]} /> {curr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {accountType === 'fiat' && (
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ minWidth: 250 }}>
                    <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.top_up.payment_method_label')}</InputLabel>
                    <Select 
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="bank">{t('dashboard.top_up.bank_transfer')}</MenuItem>
                      <MenuItem value="card">{t('dashboard.top_up.card_payment')}</MenuItem>
                      <MenuItem value="cash">{t('dashboard.top_up.cash_transfer')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </>
        )}

        {activeStep === 1 && (
          <Box sx={{ mb: 4 }}>
            {isCrypto ? (
              <>
                <Alert severity="info" sx={{ mb: 4 }}>
                  {t('dashboard.top_up.crypto_instruction', { amount: formData.amount, currency: formData.currency })}
                </Alert>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('dashboard.top_up.blockchain_network')}</TableCell>
                        <TableCell>{t('dashboard.top_up.address')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{getNetworkName(formData.currency)}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all', minWidth: '150px' }}>
                          {getAddress(formData.currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 4, bgcolor: '#e0f2fe', color: '#0369a1', '& .MuiAlert-icon': { color: '#0ea5e9' } }}>
                  {t('dashboard.top_up.card_instruction')}
                </Alert>
                <Typography variant="body1" sx={{ color: '#334155', mb: 4 }}>
                  {t('dashboard.top_up.card_request_summary', {
                    amount: formData.amount,
                    currency: formData.currency,
                    method: isBank ? t('dashboard.top_up.bank_transfer') : t('dashboard.top_up.card_payment')
                  })}
                </Typography>
              </>
            )}

            {isCrypto && (
              <>
                <Typography variant="body1" fontWeight={600} mb={2}>
                  {t('dashboard.top_up.amount_to_deposit', { amount: formData.amount, currency: formData.currency })}
                </Typography>

                <FormControlLabel
                  control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
                  label={t('dashboard.top_up.confirm_checkbox')}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.top_up.terms_agreement')}
                </Typography>
              </>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HourglassEmptyIcon sx={{ fontSize: 64, mb: 2, color: '#1e293b' }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>{t('dashboard.top_up.success_title')}</Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>{t('dashboard.top_up.success_subtitle')}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              {t('dashboard.top_up.success_desc')}
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', px: 4 }}>
              {t('dashboard.top_up.view_accounts')}
            </Button>
          </Box>
        )}

        {activeStep < 2 && (
          <>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={handleBack} 
                variant="outlined" 
                disabled={activeStep === 0}
                sx={{ textTransform: 'none', px: 4, visibility: activeStep === 0 ? 'hidden' : 'visible' }}
              >
                {t('auth.back')}
              </Button>
              <Button 
                onClick={handleNext} 
                variant="contained" 
                disabled={loading || (activeStep === 0 && (!formData.amount || !formData.accountId))}
                sx={{ textTransform: 'none', px: 4 }}
              >
                {activeStep === 0 ? t('auth.next') : t('dashboard.top_up.confirm_button')}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AccountTopUp;
