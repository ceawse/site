import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Stepper, Step, StepLabel, FormControl, InputLabel, Divider, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { api } from '../../api';
import CurrencyIcon from '../../components/CurrencyIcon';

const CryptoTransfer = () => {
  const { t } = useTranslation();
  const steps = [t('dashboard.crypto_transfer.steps.details'), t('dashboard.crypto_transfer.steps.confirm'), t('dashboard.crypto_transfer.steps.result')];
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountId: '',
    address: '',
    amount: '',
    network: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.get('/accounts');
        setAccounts(data.filter(a => a.type === 'crypto'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!formData.accountId || !formData.address || !formData.amount || !formData.network) {
        setError(t('dashboard.crypto_transfer.errors.fill_all'));
        return;
      }
      if (parseFloat(formData.amount) <= 0) {
        setError(t('dashboard.crypto_transfer.errors.amount_gt_zero'));
        return;
      }
      const acc = accounts.find(a => a.id === formData.accountId);
      if (acc && parseFloat(formData.amount) > acc.balance) {
        setError(t('dashboard.crypto_transfer.errors.insufficient_balance'));
        return;
      }
      setError('');
      setActiveStep(1);
    } else if (activeStep === 1) {
      setLoading(true);
      setError('');
      try {
        await api.post('/transfer', {
          account_id: formData.accountId,
          amount: parseFloat(formData.amount),
          beneficiary: formData.address,
          description: `MSG_TRANSFER_TO_NETWORK|{"network":"${formData.network}"}`
        });
        setActiveStep(2);
      } catch (err) {
        setError(err.message || t('dashboard.crypto_transfer.errors.failed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleAccountChange = (e) => {
    const accId = e.target.value;
    const selected = accounts.find(a => a.id === accId);
    let newNetwork = '';

    if (selected) {
      const curr = selected.currency || '';
      if (curr.includes('BTC')) newNetwork = 'Bitcoin';
      else if (curr.includes('SOL')) newNetwork = 'Solana';
      else if (curr.includes('ETH')) {
        if (curr.includes('BEP20')) newNetwork = 'Binance Smart Chain (BEP20)';
        else newNetwork = 'Ethereum (ERC20)';
      } else if (curr.includes('BNB')) newNetwork = 'Binance Smart Chain (BEP20)';
      else if (curr.includes('USDT') || curr.includes('USDC')) {
        if (curr.includes('ERC20')) newNetwork = 'Ethereum (ERC20)';
        else if (curr.includes('TRC20')) newNetwork = 'Tron (TRC20)';
        else if (curr.includes('BEP20')) newNetwork = 'Binance Smart Chain (BEP20)';
        else if (curr.includes('SOL')) newNetwork = 'Solana';
        else newNetwork = 'Tron (TRC20)';
      }
    }

    setFormData({ ...formData, accountId: accId, network: newNetwork });
  };

  const selectedAccount = accounts.find(a => a.id === formData.accountId) || {};

  const networkOptions = [
    { value: 'Bitcoin', key: 'dashboard.crypto_transfer.networks.bitcoin' },
    { value: 'Ethereum (ERC20)', key: 'dashboard.crypto_transfer.networks.ethereum' },
    { value: 'Binance Smart Chain (BEP20)', key: 'dashboard.crypto_transfer.networks.bsc' },
    { value: 'Solana', key: 'dashboard.crypto_transfer.networks.solana' },
    { value: 'Tron (TRC20)', key: 'dashboard.crypto_transfer.networks.tron' },
  ];

  const allowedNetworks = networkOptions.filter(opt => {
    const curr = selectedAccount.currency || '';
    if (curr.includes('BTC')) return opt.value === 'Bitcoin';
    if (curr.includes('SOL')) return opt.value === 'Solana';
    if (curr.includes('BNB')) return opt.value === 'Binance Smart Chain (BEP20)';
    
    if (curr.includes('ETH')) {
      if (curr.includes('BEP20')) return opt.value === 'Binance Smart Chain (BEP20)';
      if (curr.includes('ERC20')) return opt.value === 'Ethereum (ERC20)';
      return ['Ethereum (ERC20)', 'Binance Smart Chain (BEP20)'].includes(opt.value);
    }
    
    if (curr.includes('USDT') || curr.includes('USDC')) {
      if (curr.includes('ERC20')) return opt.value === 'Ethereum (ERC20)';
      if (curr.includes('TRC20')) return opt.value === 'Tron (TRC20)';
      if (curr.includes('BEP20')) return opt.value === 'Binance Smart Chain (BEP20)';
      if (curr.includes('SOL')) return opt.value === 'Solana';
      return ['Tron (TRC20)', 'Ethereum (ERC20)', 'Binance Smart Chain (BEP20)', 'Solana'].includes(opt.value);
    }
    
    return true;
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.crypto_transfer.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 6 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 500 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ minWidth: 250 }}>
                <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.crypto_transfer.from_wallet')}</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={handleAccountChange}
                  sx={{ borderRadius: 2 }}
                >
                  {accounts.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CurrencyIcon currency={a.currency.split(' ')[0]} />
                        {a.currency} - {a.balance} {t('dashboard.crypto_transfer.available')}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={t('dashboard.crypto_transfer.to_address')}
                fullWidth
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('dashboard.crypto_transfer.amount')}
                fullWidth
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={parseFloat(formData.amount) > (selectedAccount.balance || 0)}
                helperText={parseFloat(formData.amount) > (selectedAccount.balance || 0) ? t('dashboard.crypto_transfer.errors.insufficient_balance') : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedAccount.currency || ''}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.crypto_transfer.network')}</InputLabel>
                <Select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {allowedNetworks.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{t(opt.key)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ mb: 4 }}>{t('dashboard.crypto_transfer.review_instruction')}</Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><Typography color="text.secondary">{t('dashboard.crypto_transfer.from')}</Typography></Grid>
                <Grid item xs={12} sm={8}><Typography fontWeight={500}>{selectedAccount.currency} {t('dashboard.crypto_transfer.wallet')}</Typography></Grid>
                
                <Grid item xs={12} sm={4}><Typography color="text.secondary">{t('dashboard.crypto_transfer.to_address_label')}</Typography></Grid>
                <Grid item xs={12} sm={8}><Typography fontWeight={500} sx={{ wordBreak: 'break-all' }}>{formData.address}</Typography></Grid>
                
                <Grid item xs={12} sm={4}><Typography color="text.secondary">{t('dashboard.crypto_transfer.network_label')}</Typography></Grid>
                <Grid item xs={12} sm={8}><Typography fontWeight={500}>{formData.network}</Typography></Grid>
                
                <Grid item xs={12} sm={4}><Typography color="text.secondary">{t('dashboard.crypto_transfer.amount_label')}</Typography></Grid>
                <Grid item xs={12} sm={8}><Typography fontWeight={500} color="error.main">-{formData.amount} {selectedAccount.currency}</Typography></Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" color="success.main" gutterBottom>{t('dashboard.crypto_transfer.success_title')}</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>{t('dashboard.crypto_transfer.success_desc')}</Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>{t('dashboard.crypto_transfer.another_transfer')}</Button>
          </Box>
        )}

        <Divider sx={{ mb: 4, mx: -6 }} />

        <Box sx={{ display: 'flex', justifyContent: activeStep === 0 ? 'flex-end' : 'space-between' }}>
          {activeStep > 0 && activeStep < 2 && (
            <Button 
              onClick={handleBack}
              variant="outlined"
              sx={{ borderColor: '#cbd5e1', color: '#64748b', textTransform: 'none', px: 5, borderRadius: 1.5 }}
            >
              {t('auth.back')}
            </Button>
          )}
          {activeStep < 2 && (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', px: 5, borderRadius: 1.5, boxShadow: 'none' }}
            >
              {activeStep === 1 ? t('dashboard.crypto_transfer.confirm_transfer_button') : t('auth.next')}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CryptoTransfer;
