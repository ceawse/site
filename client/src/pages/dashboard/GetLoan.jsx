import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Slider, Select, MenuItem, InputAdornment, Button, CircularProgress, Stack, Chip, Divider, Alert, Dialog, DialogContent, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { formatYears, formatMonths, formatYearsShort } from '../../utils/format';

const GetLoan = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [amount, setAmount] = useState(50000);
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(0);
  const [occupation, setOccupation] = useState('');
  const [income, setIncome] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingLoans, setExistingLoans] = useState([]);
  const fileInputRef = useRef(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedLoanId, setSubmittedLoanId] = useState('');

  const [monthlyRepayment, setMonthlyRepayment] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  const apr = 4.4;

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.get('/loans');
      setExistingLoans(data);
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
  };

  useEffect(() => {
    const totalMonths = (years * 12) + months;
    if (totalMonths === 0 || amount === 0) {
      setMonthlyRepayment(0);
      setTotalRepayment(0);
      return;
    }

    const r = (apr / 100) / 12;
    const n = totalMonths;
    
    // Standard loan formula: M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const m = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    setMonthlyRepayment(m);
    setTotalRepayment(m * n);
  }, [amount, years, months]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files].slice(0, 3));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!occupation || !income) {
      showNotification(t('dashboard.settings.errors.fill_all'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('term_years', years);
      formData.append('term_months', months);
      formData.append('occupation', occupation);
      formData.append('monthly_income', income);
      
      uploadedFiles.forEach(file => {
        formData.append('documents', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to submit loan');

      const data = await response.json();
      
      // Generate a string like "ByhWtcGW" based on the ID for display
      const displayId = data.id
        ? Math.abs(Math.sin(data.id) * 1e9).toString(36).substring(0, 8).replace(/[^a-z0-9]/gi, 'x').toUpperCase()
        : Math.random().toString(36).substring(2, 10).toUpperCase();

      setSubmittedLoanId(displayId);
      setSuccessModalOpen(true);
      
      setOccupation('');
      setIncome('');
      setUploadedFiles([]);
      fetchLoans();
    } catch (error) {
      console.error('Submit loan error:', error);
      showNotification(t('common.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
  };

  return (
    <Box sx={{ pb: 8, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.loan.title')}
      </Typography>
      
      {existingLoans.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t('dashboard.loan.your_applications') || 'Your Applications'}</Typography>
          {existingLoans.map((loan) => (
            <Alert key={loan.id} severity={getStatusColor(loan.status)} sx={{ mb: 1, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={600} sx={{ mr: 2 }}>
                  ${loan.amount.toLocaleString()} - {formatYearsShort(loan.term_years, i18n.language, t)} {loan.term_months}{t('dashboard.loan.months_short')}
                </Typography>
                <Chip size="small" label={t(`dashboard.verification.status.${loan.status}`)} color={getStatusColor(loan.status)} />
              </Box>
            </Alert>
          ))}
        </Box>
      )}

      {/* Promo Card */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 5 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
              {t('dashboard.loan.promo.title')}
            </Typography>
            <Typography variant="h6" sx={{ color: '#334155', mb: 3 }}>
              {t('dashboard.loan.promo.subtitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
              {t('dashboard.loan.promo.desc')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#22c55e', mr: 1.5, fontSize: 22 }} />
              <Typography variant="body1" fontWeight={500} sx={{ color: '#334155' }}>{t('dashboard.loan.promo.benefit_1')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckCircleIcon sx={{ color: '#22c55e', mr: 1.5, fontSize: 22 }} />
              <Typography variant="body1" fontWeight={500} sx={{ color: '#334155' }}>{t('dashboard.loan.promo.benefit_2')}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              width: '100%', 
              height: 280, 
              borderRadius: 3, 
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" 
                alt="Family" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.loan.calculator_title')}
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 6 }}>
        <Grid container spacing={{ xs: 3, md: 4, lg: 6 }} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Grid item xs={12} md={6} sm={12} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
              {t('dashboard.loan.how_much_borrow')}
            </Typography>
            <TextField 
              fullWidth
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start" sx={{ fontWeight: 600 }}>$</InputAdornment>,
              }}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fcfcfc' }
              }}
            />
            
            <Slider 
              value={amount} 
              onChange={(e, val) => setAmount(val)}
              min={1000} 
              max={100000} 
              step={1000}
              marks={[
                { value: 1000, label: '$1K' },
                { value: 25000, label: '$25K' },
                { value: 50000, label: '$50K' },
                { value: 75000, label: '$75K' },
                { value: 100000, label: '$100K' },
              ]}
              sx={{ 
                color: '#0f172a',
                height: 6,
                '& .MuiSlider-thumb': {
                  width: 24,
                  height: 24,
                  backgroundColor: '#0f172a',
                  border: '2px solid #fff',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                },
                '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: '#0f172a' },
                '& .MuiSlider-markLabel': { fontSize: '0.8rem', color: '#64748b', mt: 1 }
              }}
            />

            <Box sx={{ mt: 6, mb: 4, py: 2, px: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <Typography variant="body1" fontWeight={600} sx={{ color: '#334155' }}>
                {t('dashboard.loan.representative_apr', { apr })}
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
              {t('dashboard.loan.how_long_repay')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 12, bgcolor: 'white', px: 0.5, color: '#64748b', zIndex: 1, fontWeight: 500 }}>{t('dashboard.loan.years')}</Typography>
                  <Select fullWidth value={years} onChange={(e) => setYears(e.target.value)} sx={{ borderRadius: 2, '& .MuiSelect-select': { py: 1.8 }, minWidth: 120 }}>
                    {[...Array(11).keys()].map(y => (
                      <MenuItem key={y} value={y}>{formatYears(y, i18n.language, t)}</MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ position: 'relative' }}>
                  <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 12, bgcolor: 'white', px: 0.5, color: '#64748b', zIndex: 1, fontWeight: 500 }}>{t('dashboard.loan.months')}</Typography>
                  <Select fullWidth value={months} onChange={(e) => setMonths(e.target.value)} sx={{ borderRadius: 2, '& .MuiSelect-select': { py: 1.8 }, minWidth: 120 }}>
                    {[...Array(12).keys()].map(m => (
                      <MenuItem key={m} value={m}>{formatMonths(m, i18n.language, t)}</MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>
            </Grid>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, ml: 1, color: '#64748b', fontWeight: 500 }}>
              {formatMonths(years * 12 + months, i18n.language, t)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sm={12} sx={{ minWidth: 0 }}>
            <Box sx={{
              bgcolor: '#4caf50',
              color: 'white',
              p: { xs: 3, sm: 3.5, md: 4.5 },
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 15px 35px -10px rgba(76, 175, 80, 0.4)'
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                {t('dashboard.loan.example.title')}
              </Typography>
              
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.2, fontWeight: 500 }}>{t('dashboard.loan.example.borrowing')}</Typography>
                  <Typography variant="h5" fontWeight={700}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.2, fontWeight: 500 }}>{t('dashboard.loan.example.over')}</Typography>
                  <Typography variant="h6" fontWeight={700}>{formatYears(years, i18n.language, t)} {formatMonths(months, i18n.language, t)}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.2, fontWeight: 500 }}>{t('dashboard.loan.example.monthly_repayment')}</Typography>
                  <Typography variant="h5" fontWeight={700}>${monthlyRepayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.2, fontWeight: 500 }}>{t('dashboard.loan.example.total_repayment')}</Typography>
                  <Typography variant="h5" fontWeight={700}>${totalRepayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3, textAlign: 'center' }}>
        {t('dashboard.loan.tell_us_more')}
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid #e2e8f0', mb: 4, maxWidth: 1000, mx: 'auto' }}>
        <Grid container spacing={6} justifyContent="center">
          {/* Left Side: Inputs and Button */}
          <Grid item xs={12} md={10}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label={t('dashboard.loan.occupation_label')}
                    variant="outlined"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label={t('dashboard.loan.income_label')}
                    placeholder={t('dashboard.loan.income_placeholder')}
                    variant="outlined"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  bgcolor: '#4285f4',
                  '&:hover': { bgcolor: '#3367d6' },
                  textTransform: 'none',
                  px: { xs: 4, sm: 6 },
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  width: { xs: '100%', sm: 'auto' },
                  mb: 6
                }}
              >
                {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : t('dashboard.loan.quote_button')}
              </Button>

              <Divider sx={{ width: '100%', mb: 4 }} />

              <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#0f172a', textAlign: 'center' }}>
                  {t('dashboard.loan.upload_title')}
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Box
                  onClick={triggerFileInput}
                  sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 3,
                    p: { xs: 4, md: 5 },
                    height: { xs: 'auto', md: '180px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white',
                    cursor: uploading ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#4285f4', bgcolor: '#f8fafc' }
                  }}>
                  {uploading ? (
                    <CircularProgress size={40} sx={{ color: '#4285f4' }} />
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#0f172a', mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={700} color="#0f172a" align="center">
                        {t('dashboard.loan.drag_drop')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', mt: 0.5 }}>
                        {t('dashboard.loan.accepted_formats')}<br />
                        {t('dashboard.loan.max_files')}
                      </Typography>
                    </>
                  )}
                </Box>
                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {uploadedFiles.map((file, i) => (
                      <Chip key={i} label={file.name} sx={{ mr: 1, mb: 1 }} onDelete={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Success Modal */}
      <Dialog
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{
              bgcolor: '#16a34a',
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircleIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
          </Box>
          
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
            {t('dashboard.loan.success_modal.title')}
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#475569', mb: 3, px: { xs: 1, sm: 4 } }}>
            {t('dashboard.loan.success_modal.subtitle')}
          </Typography>

          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
            {t('dashboard.loan.success_modal.id_label')} {submittedLoanId}
          </Typography>

          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', mb: 2 }}>
              {t('dashboard.loan.success_modal.whats_next')}
            </Typography>
            
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AssignmentIcon sx={{ color: '#0f172a' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('dashboard.loan.success_modal.step_1')}
                  primaryTypographyProps={{ sx: { color: '#334155', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AccessTimeIcon sx={{ color: '#0f172a' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('dashboard.loan.success_modal.step_2')}
                  primaryTypographyProps={{ sx: { color: '#334155', fontWeight: 500 } }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AttachMoneyIcon sx={{ color: '#0f172a' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('dashboard.loan.success_modal.step_3')}
                  primaryTypographyProps={{ sx: { color: '#334155', fontWeight: 500 } }}
                />
              </ListItem>
            </List>
          </Box>

          <Button
            variant="contained"
            onClick={handleCloseSuccessModal}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              px: 6,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {t('dashboard.loan.success_modal.close')}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GetLoan;
