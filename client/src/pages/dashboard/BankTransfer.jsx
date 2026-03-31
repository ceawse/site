import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, InputAdornment,
  Stepper, Step, StepLabel, FormControl, InputLabel, Divider, CircularProgress, Alert
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';

const BankTransfer = () => {
  const { t } = useTranslation();
  const steps = [t('dashboard.bank_transfer.steps.enter_data'), t('dashboard.bank_transfer.steps.confirmation'), t('dashboard.bank_transfer.steps.result')];
  
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [savedBanks, setSavedBanks] = useState([]);
  const [selectedSavedBankId, setSelectedSavedBankId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    beneficiaryName: user.name || '',
    swiftCode: '',
    beneficiaryAccount: '',
    payerAccountId: '',
    amount: '',
    purpose: '',
    comment: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, banksData] = await Promise.all([
          api.get('/accounts'),
          api.get('/banks')
        ]);
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          setFormData(prev => ({ ...prev, payerAccountId: accountsData[0].id }));
        }
        setSavedBanks(banksData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!formData.beneficiaryName || !formData.beneficiaryAccount || !formData.amount) {
        setError(t('dashboard.bank_transfer.errors.fill_required'));
        return;
      }
      if (parseFloat(formData.amount) > (selectedAccount.balance || 0)) {
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
          account_id: formData.payerAccountId,
          amount: parseFloat(formData.amount),
          beneficiary: formData.beneficiaryName,
          description: `To Account: ${formData.beneficiaryAccount}. SWIFT: ${formData.swiftCode}. Purpose: ${formData.purpose}`,
          comment: formData.comment
        });
        setSuccess(t('dashboard.bank_transfer.completed_title'));
        setActiveStep(2);
      } catch (err) {
        setError(err.message || t('dashboard.bank_transfer.errors.failed'));
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(0);
      setFormData({ ...formData, amount: '', beneficiaryName: user.name || '', beneficiaryAccount: '', swiftCode: '', purpose: '', comment: '' });
      setSelectedSavedBankId('');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const selectedAccount = accounts.find(a => a.id === formData.payerAccountId) || {};

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.bank_transfer.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 6 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 500 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 4 }}>
          {activeStep === 0 ? t('dashboard.bank_transfer.details_subtitle') : steps[activeStep]}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {savedBanks.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.withdraw_accounts.title')}</InputLabel>
                  <Select
                    value={selectedSavedBankId}
                    onChange={(e) => {
                      const bankId = e.target.value;
                      setSelectedSavedBankId(bankId);
                      const bank = savedBanks.find(b => b.id === bankId);
                      if (bank) {
                        setFormData(prev => ({
                          ...prev,
                          swiftCode: bank.swift,
                          beneficiaryAccount: bank.account_number
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          swiftCode: '',
                          beneficiaryAccount: ''
                        }));
                      }
                    }}
                    sx={{ borderRadius: 2 }}
                    displayEmpty
                  >
                    <MenuItem value=""><em>---</em></MenuItem>
                    {savedBanks.map(b => (
                      <MenuItem key={b.id} value={b.id}>{b.bank_name} - {b.account_number} ({b.type})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label={t('dashboard.bank_transfer.beneficiary_name')}
                fullWidth
                value={formData.beneficiaryName}
                onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label={t('dashboard.bank_transfer.swift_bic')}
                fullWidth
                value={formData.swiftCode}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                label={t('dashboard.bank_transfer.beneficiary_account')}
                fullWidth
                value={formData.beneficiaryAccount}
                onChange={(e) => setFormData({ ...formData, beneficiaryAccount: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ minWidth: 250 }}>
                <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.bank_transfer.payer_account')}</InputLabel>
                <Select 
                  value={formData.payerAccountId}
                  onChange={(e) => setFormData({ ...formData, payerAccountId: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {accounts.map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.account_number} ({a.currency})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('dashboard.bank_transfer.amount')}
                fullWidth
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={parseFloat(formData.amount) > (selectedAccount.balance || 0)}
                helperText={parseFloat(formData.amount) > (selectedAccount.balance || 0) ? t('dashboard.crypto_transfer.errors.insufficient_balance') : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: parseFloat(formData.amount) > (selectedAccount.balance || 0) ? '#ef4444' : '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.bank_transfer.currency')}</InputLabel>
                <Select value={selectedAccount.currency || ''} disabled sx={{ borderRadius: 2 }}>
                  <MenuItem value={selectedAccount.currency || ''}>
                    {selectedAccount.currency} ({t('dashboard.bank_transfer.available')}: {selectedAccount.balance?.toFixed(2) || '0.00'})
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField 
                label={t('dashboard.bank_transfer.purpose')}
                fullWidth
                multiline
                rows={3}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField 
                label={t('dashboard.bank_transfer.comment', 'Комментарий')}
                fullWidth
                multiline
                rows={2}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <InfoOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>{t('dashboard.bank_transfer.review_instruction')}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="textSecondary">{t('dashboard.bank_transfer.beneficiary_name')}:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" fontWeight={600}>{formData.beneficiaryName}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="textSecondary">{t('dashboard.bank_transfer.beneficiary_account')}:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" fontWeight={600}>{formData.beneficiaryAccount}</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" color="textSecondary">{t('dashboard.bank_transfer.amount')}:</Typography></Grid>
              <Grid size={{ xs: 6 }}><Typography variant="body2" fontWeight={600}>{formData.amount} {selectedAccount.currency}</Typography></Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" gutterBottom>{t('dashboard.bank_transfer.completed_title')}</Typography>
            <Typography variant="body1">{success}</Typography>
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
          <Button 
            onClick={handleNext}
            variant="contained" 
            disabled={loading}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', px: 5, borderRadius: 1.5, boxShadow: 'none' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 0 ? t('auth.next') : activeStep === 1 ? t('dashboard.top_up.steps.confirmation') : t('common.save')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BankTransfer;
