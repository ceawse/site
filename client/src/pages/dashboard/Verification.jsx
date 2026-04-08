import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Alert, Stack, Divider, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';

const Verification = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [user, setUser] = useState({
    email: 'Loading...',
    verification_status: 'not_started',
    verification_document_type: 'passport'
  });

  // Состояния для процесса загрузки
  const [uploading, setUploading] = useState(false);
  const [uploadingBank, setUploadingBank] = useState(false);

  // Состояния для выбранных, но не отправленных файлов
  const [selectedIdFiles, setSelectedIdFiles] = useState([]);
  const [selectedBankFiles, setSelectedBankFiles] = useState([]);

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

  // 1. Обработка ВЫБОРА файлов (ID)
  const handleIdFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedIdFiles(files);
    }
  };

  // 2. Фактическая ОТПРАВКА файлов (ID)
  const handleIdUploadSubmit = async () => {
    if (selectedIdFiles.length === 0) return;

    const formData = new FormData();
    selectedIdFiles.forEach(file => {
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
        setSelectedIdFiles([]); // Очищаем выбор после успеха
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

  // 3. Обработка ВЫБОРА файлов (Bank)
  const handleBankFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedBankFiles(files);
    }
  };

  // 4. Фактическая ОТПРАВКА файлов (Bank)
  const handleBankUploadSubmit = async () => {
    if (selectedBankFiles.length === 0) return;

    const formData = new FormData();
    selectedBankFiles.forEach(file => {
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
        setSelectedBankFiles([]); // Очищаем выбор после успеха
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

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerBankInput = () => bankInputRef.current?.click();

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

      {/* СЕКЦИЯ ID ВЕРИФИКАЦИИ */}
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
          onChange={handleIdFileSelect}
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

        <UploadPreviewZone
          selectedFiles={selectedIdFiles}
          onSelect={triggerFileInput}
          onCancel={() => setSelectedIdFiles([])}
          onSubmit={handleIdUploadSubmit}
          uploading={uploading}
          t={t}
          docType={docType}
        />
      </Paper>

      {/* СЕКЦИЯ БАНКОВСКОЙ ВЫПИСКИ */}
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
          onChange={handleBankFileSelect}
          multiple
        />

        {user.bank_statement_document && !selectedBankFiles.length && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            {t('dashboard.verification.alerts.pending', 'Document uploaded and awaiting review.')}
          </Alert>
        )}

        <UploadPreviewZone
          selectedFiles={selectedBankFiles}
          onSelect={triggerBankInput}
          onCancel={() => setSelectedBankFiles([])}
          onSubmit={handleBankUploadSubmit}
          uploading={uploadingBank}
          t={t}
          docType="bank_statement"
        />
      </Paper>
    </Box>
  );
};

// Вспомогательный компонент зоны загрузки с предпросмотром
const UploadPreviewZone = ({ selectedFiles, onSelect, onCancel, onSubmit, uploading, t, docType }) => {
  if (uploading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5, border: '2px dashed #cbd5e1', borderRadius: 2 }}>
        <CircularProgress size={48} sx={{ color: '#3b82f6', mb: 2 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          {t('dashboard.verification.upload_box.uploading')}
        </Typography>
      </Box>
    );
  }

  // Если файлы выбраны, показываем список и кнопки подтверждения
  if (selectedFiles.length > 0) {
    return (
      <Box sx={{ p: 3, border: '2px solid #3b82f6', bgcolor: '#f0f9ff', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} color="#1e40af" gutterBottom>
          {t('common.selected_files', 'Выбранные файлы:')}
        </Typography>
        <List dense sx={{ mb: 2 }}>
          {selectedFiles.map((file, idx) => (
            <ListItem key={idx} sx={{ px: 0 }}>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={onSubmit}
            fullWidth
            sx={{ textTransform: 'none', borderRadius: 1.5, bgcolor: '#3b82f6' }}
          >
            {t('common.confirm', 'Подтвердить и отправить')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={onCancel}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            {t('common.cancel', 'Отмена')}
          </Button>
        </Stack>
      </Box>
    );
  }

  // Обычное состояние загрузки (как было)
  return (
    <Box
      onClick={onSelect}
      sx={{
        border: '2px dashed #cbd5e1',
        borderRadius: 2,
        p: 5,
        textAlign: 'center',
        bgcolor: '#f8fafc',
        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
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
    </Box>
  );
};

export default Verification;