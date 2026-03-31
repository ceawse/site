import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack
} from '@mui/material';
import { api } from '../../api';
import { useNotification } from '../../context/NotificationContext';

export default function AdminTransactions() {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0 = all, 1 = processing, 2 = completed

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [editForm, setEditForm] = useState({ recipient_address: '', fee: '0' });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchTransactions();
  }, [tabValue]);

  const fetchTransactions = async () => {
    setLoading(true);
    let url = '/admin/transactions';
    if (tabValue === 1) url += '?status=processing';
    if (tabValue === 2) url += '?status=completed';

    try {
      const data = await api.get(url);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(t('admin.transactions.confirm_status', { status }))) return;

    try {
      await api.put(`/admin/transactions/${id}`, { status });
      fetchTransactions();
      showNotification(t('admin.transactions.notification.status_success'), 'success');
    } catch (error) {
      showNotification(t('admin.transactions.notification.status_error'), 'error');
    }
  };

  const handleEditClick = (tx) => {
    setSelectedTx(tx);
    let defaultSender = tx.sender_address || '';
    let defaultRecipient = tx.recipient_address || '';

    if (tx.type === 'deposit') {
      if (!defaultRecipient) defaultRecipient = tx.account_number || '';
      if (!defaultSender) {
        if (tx.description?.includes('MSG_METHOD_BANK')) defaultSender = 'Bank Transfer';
        else if (tx.description?.includes('MSG_METHOD_CARD')) defaultSender = 'Card Payment';
        else if (tx.description?.includes('MSG_METHOD_CRYPTO')) defaultSender = 'Crypto Transfer';
      }
    } else if (tx.type === 'transfer' || tx.type === 'withdraw') {
      if (!defaultSender) defaultSender = tx.account_number || '';
    }

    setEditForm({
      amount: Math.abs(tx.amount).toString(),
      sender_address: defaultSender,
      recipient_address: defaultRecipient,
      fee: tx.fee?.toString() || '0',
      description: tx.description || '',
      comment: tx.comment || ''
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/transactions/${selectedTx.id}`, {
        amount: parseFloat(editForm.amount),
        sender_address: editForm.sender_address,
        recipient_address: editForm.recipient_address,
        fee: parseFloat(editForm.fee),
        description: editForm.description,
        comment: editForm.comment
      });
      showNotification(t('admin.transactions.notification.update_success'), 'success');
      setEditOpen(false);
      fetchTransactions();
    } catch (error) {
      showNotification(error.message || t('admin.transactions.notification.update_error'), 'error');
    }
  };

  const calculateImpact = () => {
    if (!selectedTx) return 0;
    const amt = parseFloat(editForm.amount) || 0;
    const fee = parseFloat(editForm.fee) || 0;
    if (selectedTx.type === 'deposit') {
      return amt;
    } else {
      return -(amt + fee);
    }
  };

  const impact = calculateImpact();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.transactions.management')}</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label={t('admin.transactions.tabs.all')} />
          <Tab label={t('admin.transactions.tabs.pending')} />
          <Tab label={t('admin.transactions.tabs.completed')} />
        </Tabs>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.transactions.table.id')}</TableCell>
              <TableCell>{t('admin.transactions.table.user')}</TableCell>
              <TableCell>{t('admin.transactions.table.account')}</TableCell>
              <TableCell>{t('admin.transactions.table.type')}</TableCell>
              <TableCell>{t('admin.transactions.table.amount')}</TableCell>
              <TableCell>{t('admin.transactions.table.currency')}</TableCell>
              <TableCell>{t('admin.transactions.table.status')}</TableCell>
              <TableCell>{t('admin.transactions.table.date')}</TableCell>
              <TableCell>{t('admin.transactions.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center">{t('common.loading')}</TableCell></TableRow>
            ) : transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.id}</TableCell>
                <TableCell>{tx.user_email}</TableCell>
                <TableCell>{tx.account_number}</TableCell>
                <TableCell>{t(`transactions.types.${tx.type}`)}</TableCell>
                <TableCell>
                  <Typography color={tx.amount > 0 ? 'success.main' : 'error.main'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </Typography>
                </TableCell>
                <TableCell>{tx.currency}</TableCell>
                <TableCell>
                  <Chip
                    label={t(`transactions.status.${tx.status?.toLowerCase()}`)}
                    color={
                      tx.status === 'completed' ? 'success' :
                      tx.status === 'processing' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleEditClick(tx)}
                    >
                      {t('admin.transactions.edit')}
                    </Button>
                    {tx.status === 'processing' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleStatusChange(tx.id, 'completed')}
                        >
                          {t('admin.transactions.approve')}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleStatusChange(tx.id, 'declined')}
                        >
                          {t('admin.transactions.decline')}
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!loading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">{t('admin.transactions.no_transactions')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>{t('admin.transactions.dialog.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1, minWidth: 400 }}>
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.sender')}
              value={editForm.sender_address}
              onChange={(e) => setEditForm({ ...editForm, sender_address: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.recipient')}
              value={editForm.recipient_address}
              onChange={(e) => setEditForm({ ...editForm, recipient_address: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.amount')}
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.fee')}
              type="number"
              value={editForm.fee}
              onChange={(e) => setEditForm({ ...editForm, fee: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.description')}
              multiline
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('admin.transactions.dialog.comment', 'Комментарий')}
              multiline
              rows={2}
              value={editForm.comment || ''}
              onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
            />
            
            <Box sx={{ p: 2, bgcolor: impact >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 2, border: `1px solid ${impact >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
                <Typography variant="subtitle2" color="text.secondary">{t('admin.transactions.dialog.impact_title')}</Typography>
                <Typography variant="h6" color={impact >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }}>
                    {impact >= 0 ? '+' : ''}{impact.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedTx?.currency}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {selectedTx?.type === 'deposit'
                      ? t('admin.transactions.dialog.impact_desc_deposit')
                      : t('admin.transactions.dialog.impact_desc_transfer')}
                </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('admin.transactions.dialog.note')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('admin.transactions.dialog.cancel')}</Button>
          <Button onClick={handleSaveEdit} variant="contained">{t('admin.transactions.dialog.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}