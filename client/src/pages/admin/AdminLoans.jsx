import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatYears, formatMonths } from '../../utils/format';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Link
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';

export default function AdminLoans() {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await api.get('/admin/loans');
      setLoans(data);
    } catch (err) {
      showNotification('Failed to fetch loans', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/loans/${id}`, { status });
      showNotification('Loan updated successfully', 'success');
      setOpen(false);
      fetchLoans();
    } catch (err) {
      showNotification('Failed to update loan', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.loans.title') || 'Loan Applications'}</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('admin.users.table.name')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.loan.example.borrowing')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.loan.example.over')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id} hover>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{loan.user_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{loan.user_email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>${loan.amount.toLocaleString()}</TableCell>
                <TableCell>{formatYears(loan.term_years, i18n.language, t)} {formatMonths(loan.term_months, i18n.language, t)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={t(`dashboard.verification.status.${loan.status}`)} color={getStatusColor(loan.status)} />
                  </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => { setSelectedLoan(loan); setOpen(true); }}>
                    {t('common.view')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {loans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">{t('admin.loans.no_loans') || 'No loan applications found'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        {selectedLoan && (
          <>
            <DialogTitle>{t('admin.loans.details_title')} # {selectedLoan.id}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.user')}</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedLoan.user_name}</Typography>
                  <Typography variant="body2">{selectedLoan.user_email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.application_date')}</Typography>
                  <Typography variant="body1">{new Date(selectedLoan.created_at).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.amount')}</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>${selectedLoan.amount.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.term')}</Typography>
                  <Typography variant="body1">{formatYears(selectedLoan.term_years, i18n.language, t)}, {formatMonths(selectedLoan.term_months, i18n.language, t)}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">{t('common.status')}</Typography>
                  <Chip label={t(`dashboard.verification.status.${selectedLoan.status}`)} color={getStatusColor(selectedLoan.status)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.occupation')}</Typography>
                  <Typography variant="body1">{selectedLoan.occupation}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">{t('admin.loans.monthly_income')}</Typography>
                  <Typography variant="body1">${selectedLoan.monthly_income}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('admin.loans.documents')}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedLoan.documents ? selectedLoan.documents.split(',').map((doc, idx) => {
                      const cleanPath = doc.replace('server/', '').replace('uploads/', '');
                      const isPdf = cleanPath.toLowerCase().endsWith('.pdf');
                      return (
                        <Link key={idx} href={`/api/uploads/${cleanPath}`} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: 'none' }}>
                          <Box sx={{ 
                            p: 2, 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 1, 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#3b82f6' } 
                          }}>
                            {isPdf ? <PictureAsPdfIcon sx={{ color: '#ef4444' }} /> : <ImageIcon sx={{ color: '#3b82f6' }} />}
                            <Typography variant="body2" fontWeight={500} color="text.primary">
                              {t('admin.loans.doc')} {idx + 1} {isPdf ? '(PDF)' : ''}
                            </Typography>
                          </Box>
                        </Link>
                      );
                    }) : t('admin.loans.no_documents')}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpen(false)}>{t('common.close')}</Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" color="error" onClick={() => handleUpdateStatus(selectedLoan.id, 'rejected')}>
                {t('admin.loans.reject')}
              </Button>
              <Button variant="contained" color="success" onClick={() => handleUpdateStatus(selectedLoan.id, 'approved')}>
                {t('admin.loans.approve')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
