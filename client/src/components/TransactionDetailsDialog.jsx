import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
  Divider, Stack, Chip, useMediaQuery, useTheme
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />,
          color: '#ea580c',
          bgcolor: '#fff7ed',
          borderColor: '#fed7aa'
        };
      case 'completed':
        return {
          label: t('transactions.status.completed'),
          icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
          color: '#16a34a',
          bgcolor: '#f0fdf4',
          borderColor: '#bbf7d0'
        };
      case 'declined':
        return {
          label: t('transactions.status.declined'),
          icon: <CancelIcon sx={{ fontSize: 14 }} />,
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, mx: 2, width: 'calc(100% - 32px)' } }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{t('transactions.details.title')}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc'
        }}>
          {/* Контейнер для Иконки и Типа транзакции */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isOutgoing ? '#fee2e2' : '#dcfce7',
              mr: 2,
              flexShrink: 0
            }}>
              {isOutgoing ? (
                <ArrowUpwardIcon sx={{ color: '#ef4444', fontSize: 24, transform: 'rotate(45deg)' }} />
              ) : (
                <ArrowDownwardIcon sx={{ color: '#22c55e', fontSize: 24, transform: 'rotate(45deg)' }} />
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                {isOutgoing ? t('transactions.details.outgoing') : t('transactions.details.incoming')}
              </Typography>
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: statusConfig.color,
                  bgcolor: statusConfig.bgcolor,
                  border: `1px solid ${statusConfig.borderColor}`,
                  '& .MuiChip-icon': { color: 'inherit' }
                }}
              />
            </Box>
          </Box>

          {/* Сумма: на мобилке прижимаем к правому краю снизу, на десктопе в ряд */}
          <Box sx={{
            width: isMobile ? '100%' : 'auto',
            textAlign: isMobile ? 'right' : 'right',
            mt: isMobile ? -1 : 0
          }}>
            <Typography
              variant="h6"
              fontWeight={800}
              color={isOutgoing ? '#ef4444' : '#22c55e'}
              sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', whiteSpace: 'nowrap' }}
            >
              {totalImpact > 0 ? '+' : ''}{totalImpact.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#64748b', fontWeight: 600 }}>
                {transaction.currency}
              </Typography>
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2}>
          <DetailRow label={t('transactions.details.from')} value={transaction.sender_address || (transaction.account_number ? `${transaction.account_number} (${transaction.currency})` : t('transactions.details.internal_account'))} />
          <DetailRow label={t('transactions.details.to')} value={transaction.recipient_address || t('transactions.details.not_specified')} />
          <DetailRow label={t('transactions.details.amount')} value={`${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${transaction.currency}`} />
          <Divider />
          <DetailRow label={t('transactions.details.purpose')} value={transaction.description ? translateBackendMessage(transaction.description) : t('transactions.details.not_specified')} />
          {transaction.comment && (
            <DetailRow label="Комментарий" value={transaction.comment} />
          )}
          <DetailRow label={t('transactions.details.date')} value={formatDate(transaction.date)} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value, boldValue }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="caption" sx={{ color: '#64748b', mb: 0.2, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={boldValue ? 700 : 500} color="#1e293b" sx={{ wordBreak: 'break-all' }}>{value}</Typography>
  </Box>
);

export default TransactionDetailsDialog;