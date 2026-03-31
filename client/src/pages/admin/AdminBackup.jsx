import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Button, Divider, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import WarningIcon from '@mui/icons-material/Warning';
import { useNotification } from '../../context/NotificationContext';

export default function AdminBackup() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/backup/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_backup_${new Date().toISOString().split('T')[0]}.sqlite`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showNotification(t('admin.backup.notification.export_success'), 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification(t('admin.backup.notification.export_error'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setConfirmOpen(true);
    }
  };

  const handleImport = async () => {
    setConfirmOpen(false);
    if (!selectedFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('backup', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/backup/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        showNotification(t('admin.backup.notification.import_success'), 'success');
        // Optional: reload the page after a short delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification(t('admin.backup.notification.import_error'), 'error');
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.backup.title')}</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <FileDownloadIcon sx={{ mr: 1 }} /> {t('admin.backup.export_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('admin.backup.export_description')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleExport} 
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            >
              {t('admin.backup.export_button')}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <FileUploadIcon sx={{ mr: 1 }} /> {t('admin.backup.import_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('admin.backup.import_description')}
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('admin.backup.import_warning')}
            </Alert>

            <Button
              variant="outlined"
              component="label"
              disabled={importing}
              startIcon={importing ? <CircularProgress size={20} /> : <FileUploadIcon />}
              color="error"
            >
              {t('admin.backup.import_button')}
              <input
                type="file"
                hidden
                accept=".sqlite"
                onChange={handleFileChange}
              />
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1 }} /> {t('admin.backup.confirm_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.backup.confirm_text')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleImport} color="error" variant="contained" autoFocus>
            {t('admin.backup.confirm_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
