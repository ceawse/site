import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, 
  Divider, Stack, Chip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import { translateBackendMessage } from '../utils/i18n-helper';

const TransactionDetailsDialog = ({ open, onClose, transaction }) => {
  const { t } = useTranslation();
  if (!transaction) return null;

  const isOutgoing = transaction.amount < 0;
  const status = transaction.status || 'completed';

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

  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return { 
          label: t('transactions.status.processing'), 
          icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />, 
          color: '#ea580c', 
          bgcolor: '#fff7ed',
          borderColor: '#fed7aa'
        };
      case 'completed':
        return { 
          label: t('transactions.status.completed'), 
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, 
          color: '#16a34a', 
          bgcolor: '#f0fdf4', 
          borderColor: '#bbf7d0'
        };
      case 'declined':
        return { 
          label: t('transactions.status.declined'), 
          icon: <CancelIcon sx={{ fontSize: 16 }} />, 
          color: '#dc2626', 
          bgcolor: '#fef2f2', 
          borderColor: '#fecaca'
        };
      default:
        return { label: status, icon: null, color: '#64748b', bgcolor: '#f1f5f9', borderColor: '#e2e8f0' };
    }
  };

  const statusConfig = getStatusConfig();
  const totalImpact = isOutgoing ? -(Math.abs(transaction.amount) + (transaction.fee || 0)) : transaction.amount;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{t('transactions.details.title')}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2, 
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc'
        }}>
          <Box sx={{ 
            width: 44, 
            height: 44, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: isOutgoing ? '#fee2e2' : '#dcfce7',
            mr: 2
          }}>
            {isOutgoing ? (
              <ArrowUpwardIcon sx={{ color: '#ef4444', fontSize: 24, transform: 'rotate(45deg)' }} />
            ) : (
              <ArrowDownwardIcon sx={{ color: '#22c55e', fontSize: 24, transform: 'rotate(45deg)' }} />
            )}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
              {isOutgoing ? t('transactions.details.outgoing') : t('transactions.details.incoming')}
            </Typography>
            <Chip 
              icon={statusConfig.icon}
              label={statusConfig.label} 
              size="small"
              sx={{ 
                height: 24, 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: statusConfig.color,
                bgcolor: statusConfig.bgcolor,
                border: `1px solid ${statusConfig.borderColor}`,
                '& .MuiChip-icon': { color: 'inherit' }
              }} 
            />
          </Box>
          <Typography variant="h6" fontWeight={700} color={isOutgoing ? '#ef4444' : '#22c55e'}>
            {totalImpact > 0 ? '+' : ''}{totalImpact.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#64748b' }}>{transaction.currency}</Typography>
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          <DetailRow label={t('transactions.details.from')} value={transaction.sender_address || (transaction.account_number ? `${transaction.account_number} (${transaction.currency})` : t('transactions.details.internal_account'))} />
          <DetailRow label={t('transactions.details.to')} value={transaction.recipient_address || t('transactions.details.not_specified')} />
          <DetailRow label={t('transactions.details.amount')} value={`${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${transaction.currency}`} />
          <DetailRow label={t('transactions.details.fee')} value={`${(transaction.fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${transaction.currency}`} />
          <Divider />
          <DetailRow label={t('transactions.details.total_payment')} value={`${(Math.abs(transaction.amount) + (transaction.fee || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${transaction.currency}`} boldValue />
          <DetailRow label={t('transactions.details.purpose')} value={transaction.description ? translateBackendMessage(transaction.description) : t('transactions.details.not_specified')} />
          {transaction.comment && (
            <DetailRow label={t('dashboard.bank_transfer.comment', 'Комментарий')} value={transaction.comment} />
          )}
          <DetailRow label={t('transactions.details.date')} value={formatDate(transaction.date)} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value, boldValue }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={boldValue ? 700 : 500} color="#1e293b">{value}</Typography>
  </Box>
);

export default TransactionDetailsDialog;
