import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, ButtonBase, Modal, RadioGroup, FormControlLabel, Radio, TextField, Checkbox, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const WithdrawAccounts = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const [accountType, setAccountType] = useState('Personal');
  const [bankName, setBankName] = useState('');
  const [swift, setSwift] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [savedBanks, setSavedBanks] = useState([]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await api.get('/banks');
      setSavedBanks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!bankName || !swift || !accountNumber || !confirmed) return;
    try {
      await api.post('/banks', {
        type: accountType,
        bank_name: bankName,
        swift: swift,
        account_number: accountNumber
      });
      showNotification(t('dashboard.withdraw_accounts.notification.success'), 'success');
      setOpen(false);
      setBankName('');
      setSwift('');
      setAccountNumber('');
      setConfirmed(false);
      fetchBanks();
    } catch (err) {
      showNotification(t('dashboard.withdraw_accounts.notification.failed'), 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 1 }}>
        {t('dashboard.withdraw_accounts.title')}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: 800 }}>
        {t('dashboard.withdraw_accounts.subtitle')}
      </Typography>
      
      {savedBanks.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.withdraw_accounts.table.bank_name')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.withdraw_accounts.table.swift_bic')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.withdraw_accounts.table.account_number')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.withdraw_accounts.table.type')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savedBanks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell>{bank.bank_name}</TableCell>
                  <TableCell>{bank.swift}</TableCell>
                  <TableCell>{bank.account_number}</TableCell>
                  <TableCell>{bank.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ButtonBase 
        onClick={() => setOpen(true)}
        sx={{ 
          display: 'block', 
          width: { xs: '100%', sm: 280 }, 
          borderRadius: 2, 
          overflow: 'hidden',
          '&:hover .MuiPaper-root': {
            borderColor: '#3b82f6',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
          }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            height: 120,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed #cbd5e1',
            bgcolor: '#f8fafc',
            position: 'relative',
            transition: 'all 0.2s'
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 60, color: '#e2e8f0', position: 'absolute', zIndex: 0 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#0f172a', zIndex: 1, mt: 1 }}>
            {t('dashboard.withdraw_accounts.add_button')}
          </Typography>
        </Paper>
      </ButtonBase>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2} fontWeight={600}>
            {t('dashboard.withdraw_accounts.modal_title')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={1}>{t('dashboard.withdraw_accounts.account_type')}</Typography>
          <RadioGroup row value={accountType} onChange={(e) => setAccountType(e.target.value)} sx={{ mb: 2 }}>
            <FormControlLabel value="Personal" control={<Radio size="small" />} label={t('dashboard.withdraw_accounts.personal')} />
            <FormControlLabel value="Business" control={<Radio size="small" />} label={t('dashboard.withdraw_accounts.business')} />
          </RadioGroup>

          <Stack spacing={2} mb={3}>
            <TextField
              fullWidth label={t('dashboard.withdraw_accounts.bank_name_label')} size="small"
              value={bankName} onChange={e => setBankName(e.target.value)}
            />
            <TextField
              fullWidth label={t('dashboard.withdraw_accounts.swift_bic_label')} size="small"
              value={swift} onChange={e => setSwift(e.target.value)}
            />
            <TextField
              fullWidth label={t('dashboard.withdraw_accounts.account_number_label')} size="small"
              value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
            />
          </Stack>

          <FormControlLabel
            control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} size="small" />}
            label={<Typography variant="body2">{t('dashboard.withdraw_accounts.confirm_checkbox')}</Typography>}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleSave} disabled={!bankName || !swift || !accountNumber || !confirmed} sx={{ textTransform: 'none' }}>
              {t('common.save')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default WithdrawAccounts;
