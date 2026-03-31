import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Modal,
  FormControl, InputLabel, Select, MenuItem, IconButton, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import CurrencyIcon from '../../components/CurrencyIcon';

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

const networks = {
  Bitcoin: ['BTC'],
  Ethereum: ['ETH', 'USDT (ERC20)', 'USDC (ERC20)'],
  Binance: ['BNB'],
  Solana: ['SOL', 'USDC (SOL)', 'EURC'],
  TRON: ['TRX', 'USDT (TRC20)']
};

const CryptoWallets = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [wallets, setWallets] = useState([]);
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState('');
  const [currency, setCurrency] = useState('');
  const [rates, setRates] = useState({});
  const navigate = useNavigate();

  const fetchWallets = async () => {
    try {
      const accs = await api.get('/accounts');
      setWallets(accs.filter(a => a.type === 'crypto'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRates = async () => {
    try {
      const ratesData = await api.get('/exchange-rates');
      const parsedRates = {};
      ratesData.cryptoRates.forEach(c => {
        parsedRates[c.symbol] = parseFloat(c.price.replace(/,/g, '').split(' ')[0]);
      });
      setRates(parsedRates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallets();
    fetchRates();
  }, []);

  const getUsdValue = (balance, currencyName) => {
    // currencyName might be "USDT (ERC20)", we need to extract "USDT"
    const base = currencyName.split(' ')[0];
    const rate = rates[base] || (base.includes('USD') ? 1 : 0);
    return (balance * rate).toFixed(2);
  };

  const handleCreate = async () => {
    if (!network || !currency) return;
    try {
      // In a real app, we'd hit a user-facing endpoint to create a wallet,
      // but since we have an admin endpoint or we can add a user endpoint.
      // Let's add a user endpoint for creating a wallet in server.js or just call a user endpoint.
      // Wait, there's no user endpoint for creating account currently except topup/transfer.
      // I will use a direct call if I add it to server.js or just simulate it for now if not.
      // Actually, I need to add POST /api/accounts to server.js for users to create crypto wallets.
      await api.post('/accounts/crypto', { currency, network });
      setOpen(false);
      fetchWallets();
      showNotification(t('dashboard.crypto_wallets.notification.success'), 'success');
    } catch (err) {
      console.error(err);
      showNotification(t('dashboard.crypto_wallets.notification.failed'), 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600} sx={{ color: '#1e293b' }}>
          {t('dashboard.crypto_wallets.title')}
        </Typography>
        {wallets.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {t('dashboard.crypto_wallets.add_button')}
          </Button>
        )}
      </Box>

      {wallets.length === 0 ? (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              mb: 4,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'transparent'
            }}
          >
            {/* Full Banner Image */}
            <Box
              component="img"
              src="/assets/crypto-banner-820x220.webp"
              alt="Crypto Banner"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'right center',
                zIndex: 0
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '60%', p: 4 }}>
              <Typography variant="h4" fontWeight={700} mb={2} sx={{ color: 'white' }}>
                {t('dashboard.crypto_wallets.landing.hero_title', 'Криптовалюта — просто и безопасно')}
              </Typography>
              <Typography variant="subtitle1" mb={3} sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 400 }}>
                {t('dashboard.crypto_wallets.landing.hero_subtitle', 'Мгновенные переводы и банковская защита ваших средств')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setOpen(true)}
                sx={{
                  bgcolor: 'white',
                  color: '#1e3a8a',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                {t('dashboard.crypto_wallets.landing.create_first', 'Создать Первый Кошелек')}
              </Button>
            </Box>
          </Paper>

          <Typography variant="h5" fontWeight={600} mb={3} sx={{ color: '#1e293b' }}>
            {t('dashboard.crypto_wallets.landing.benefits_title', 'Преимущества Криптовалюты')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2 }}>
                <img src="/assets/icon-fast-transactions.webp" alt="Fast Transactions" style={{ width: 64, height: 64 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} mb={1}>{t('dashboard.crypto_wallets.landing.benefit_1_title', 'Молниеносные Транзакции')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.crypto_wallets.landing.benefit_1_desc', 'Отправляйте и получайте средства по всему миру за считанные минуты.')}</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2 }}>
                <img src="/assets/icon-enhanced-security.webp" alt="Enhanced Security" style={{ width: 64, height: 64 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} mb={1}>{t('dashboard.crypto_wallets.landing.benefit_2_title', 'Повышенная Безопасность')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.crypto_wallets.landing.benefit_2_desc', 'Технология блокчейн обеспечивает непревзойденную безопасность.')}</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2 }}>
                <img src="/assets/icon-borderless-transactions.webp" alt="Global Reach" style={{ width: 64, height: 64 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} mb={1}>{t('dashboard.crypto_wallets.landing.benefit_3_title', 'Глобальный Охват')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.crypto_wallets.landing.benefit_3_desc', 'Совершайте транзакции через границы с легкостью, минуя задержки.')}</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2 }}>
                <img src="/assets/icon-low-fees.webp" alt="Low Fees" style={{ width: 64, height: 64 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} mb={1}>{t('dashboard.crypto_wallets.landing.benefit_4_title', 'Низкие Комиссии')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('dashboard.crypto_wallets.landing.benefit_4_desc', 'Пользуйтесь значительно более низкими комиссиями за транзакции.')}</Typography>
            </Paper>
          </Box>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('dashboard.crypto_wallets.table.crypto')}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('dashboard.crypto_wallets.table.blockchain')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>{t('dashboard.crypto_wallets.table.balance')}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b' }}>{t('dashboard.crypto_wallets.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wallets.map((w) => (
                <TableRow key={w.id}>
                  <TableCell sx={{ fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CurrencyIcon currency={w.currency.split(' ')[0]} />
                      {w.currency}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>
                    {Object.keys(networks).find(n => networks[n].includes(w.currency)) || 'Unknown'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>{w.balance.toFixed(6)} {w.currency}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>≈ ${getUsdValue(w.balance, w.currency)} USD</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" title="Send" onClick={() => navigate('/dashboard/crypto-transfer')}><SendIcon fontSize="small" /></IconButton>
                    <IconButton size="small" title="Exchange" onClick={() => navigate('/dashboard/currency-exchange')}><SwapHorizIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={3} fontWeight={600}>
            {t('dashboard.crypto_wallets.modal.title')}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t('dashboard.crypto_wallets.modal.network_label')}</InputLabel>
            <Select
              value={network}
              label={t('dashboard.crypto_wallets.modal.network_label')}
              onChange={(e) => {
                setNetwork(e.target.value);
                setCurrency(''); // reset currency
              }}
            >
              {Object.keys(networks).map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }} disabled={!network}>
            <InputLabel>{t('dashboard.crypto_wallets.modal.crypto_label')}</InputLabel>
            <Select
              value={currency}
              label={t('dashboard.crypto_wallets.modal.crypto_label')}
              onChange={(e) => setCurrency(e.target.value)}
              sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } }}
            >
              {network && networks[network].map(c => {
                // Remove trailing (ERC20) etc to get icon
                const baseCurrency = c.split(' ')[0];
                return (
                  <MenuItem key={c} value={c}>
                    <CurrencyIcon currency={baseCurrency} /> {c}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!network || !currency}>
              {t('dashboard.crypto_wallets.modal.create_button')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CryptoWallets;
