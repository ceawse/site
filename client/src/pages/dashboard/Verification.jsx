import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

const Verification = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [user, setUser] = useState({ email: 'Loading...', verification_status: 'not_started', verification_document_type: 'passport' });
  const [uploading, setUploading] = useState(false);
  const [uploadingBank, setUploadingBank] = useState(false);
  const [docType, setDocType] = useState('passport');
  const fileInputRef = useRef(null);
  const bankInputRef = useRef(null);

  const fetchUser = async () => {
    try {
      const userData = await api.get('/user');
      setUser(userData);
      if (userData.verification_document_type) {
        setDocType(userData.verification_document_type);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('document', file);
    });
    formData.append('documentType', docType);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchUser();
        showNotification(t('dashboard.verification.notification.success'), 'success');
      } else {
        const err = await response.json();
        showNotification(err.message || t('dashboard.verification.notification.failed'), 'error');
      }
    } catch (err) {
      console.error('Error uploading file', err);
      showNotification(t('dashboard.verification.notification.failed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBankUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('document', file);
    });

    setUploadingBank(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/verify-bank', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchUser();
        showNotification(t('dashboard.verification.notification.success'), 'success');
      } else {
        const err = await response.json();
        showNotification(err.message || t('dashboard.verification.notification.failed'), 'error');
      }
    } catch (err) {
      console.error('Error uploading bank statement', err);
      showNotification(t('dashboard.verification.notification.failed'), 'error');
    } finally {
      setUploadingBank(false);
    }
  };

  const triggerBankInput = () => {
    if (bankInputRef.current) {
      bankInputRef.current.click();
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Chip 
            icon={<CheckCircleIcon style={{ color: '#16a34a' }} />} 
            label={t('dashboard.verification.status.verified')}
            variant="outlined"
            sx={{ borderColor: '#16a34a', color: '#16a34a', fontWeight: 500, bgcolor: '#f0fdf4' }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<HourglassEmptyIcon style={{ color: '#ea580c' }} />}
            label={t('dashboard.verification.status.pending')}
            variant="outlined"
            sx={{ borderColor: '#ea580c', color: '#ea580c', fontWeight: 500, bgcolor: '#fff7ed' }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<CancelIcon style={{ color: '#dc2626' }} />}
            label={t('dashboard.verification.status.rejected')}
            variant="outlined"
            sx={{ borderColor: '#dc2626', color: '#dc2626', fontWeight: 500, bgcolor: '#fef2f2' }}
          />
        );
      default:
        return (
          <Chip
            label={t('dashboard.verification.status.not_started')}
            variant="outlined"
            sx={{ borderColor: '#64748b', color: '#64748b', fontWeight: 500, bgcolor: '#f1f5f9' }}
          />
        );
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, maxWidth: 800 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b' }}>
          {t('dashboard.verification.title')}
        </Typography>
        {getStatusChip(user.verification_status)}
      </Box>
      <Typography variant="body2" sx={{ color: '#334155', mb: 4, maxWidth: 800 }}>
        {t('dashboard.verification.subtitle')}
      </Typography>
      
      {/* Identity Document Verification */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.verification.id_verification')}
        </Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('dashboard.verification.doc_type_label')}</InputLabel>
          <Select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={user.verification_status === 'pending' || user.verification_status === 'verified'}
          >
            <MenuItem value="passport">{t('dashboard.verification.passport')}</MenuItem>
            <MenuItem value="id_card">{t('dashboard.verification.id_card')}</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, bgcolor: '#eff6ff', borderRadius: 1, mb: 3, border: '1px solid #bfdbfe' }}>
          <InfoOutlinedIcon sx={{ color: '#3b82f6', mr: 1.5, mt: 0.5, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#1e40af' }}>
            {docType === 'passport' ? t('dashboard.verification.upload_instruction_passport') : t('dashboard.verification.upload_instruction_id')}
          </Typography>
        </Box>

        <input
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
        />

        {user.verification_status === 'pending' && (
          <Alert severity="info" sx={{ mb: 3 }}>{t('dashboard.verification.alerts.pending')}</Alert>
        )}
        {user.verification_status === 'verified' && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            {t('dashboard.verification.alerts.verified')}
          </Alert>
        )}
        {user.verification_status === 'rejected' && (
          <Alert severity="error" sx={{ mb: 3 }}>{t('dashboard.verification.alerts.rejected')}</Alert>
        )}
        
        <UploadBox triggerFileInput={triggerFileInput} uploading={uploading} docType={docType} t={t} />
      </Paper>

      {/* Bank Account Verification */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4, maxWidth: 800 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
          {t('dashboard.verification.bank_verification')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, bgcolor: '#eff6ff', borderRadius: 1, border: '1px solid #bfdbfe', mb: 3 }}>
          <InfoOutlinedIcon sx={{ color: '#3b82f6', mr: 1.5, mt: 0.5, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#1e40af' }}>
            {t('dashboard.verification.bank_instruction')}
          </Typography>
        </Box>

        <input
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          ref={bankInputRef}
          onChange={handleBankUpload}
          multiple
        />

        {user.bank_statement_document && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            {t('dashboard.verification.alerts.pending', 'Документ успешно загружен и ожидает проверки.')}
          </Alert>
        )}
        
        <UploadBox triggerFileInput={triggerBankInput} uploading={uploadingBank} docType="bank_statement" t={t} />
      </Paper>
    </Box>
  );
};

const UploadBox = ({ triggerFileInput, uploading, docType, t }) => (
  <Box
    onClick={triggerFileInput}
    sx={{
      border: '2px dashed #cbd5e1',
      borderRadius: 2,
      p: 5,
      textAlign: 'center',
      bgcolor: '#f8fafc',
      '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
      cursor: uploading ? 'default' : 'pointer',
      transition: 'all 0.2s',
      opacity: uploading ? 0.7 : 1
    }}>
    {uploading ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress size={48} sx={{ color: '#3b82f6', mb: 2 }} />
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#0f172a', mb: 0.5 }}>
          {t('dashboard.verification.upload_box.uploading')}
        </Typography>
      </Box>
    ) : (
      <>
        <CloudUploadIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#0f172a', mb: 0.5 }}>
          {t('dashboard.verification.upload_box.upload_doc', { type: t(`dashboard.verification.${docType}`) })}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          {t('dashboard.verification.upload_box.click_select')}
        </Typography>
        <Button
          variant="outlined"
          component="span"
          sx={{ textTransform: 'none', px: 4, borderRadius: 1.5, borderColor: '#cbd5e1', color: '#3b82f6' }}>
          {t('dashboard.verification.upload_box.select_button')}
        </Button>
      </>
    )}
  </Box>
);

export default Verification;
