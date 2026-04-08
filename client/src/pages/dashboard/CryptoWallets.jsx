import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Modal,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotification(t('common.copied', 'Скопировано в буфер обмена'), 'success');
  };

  const getUsdValue = (balance, currencyName) => {
    const base = currencyName.split(' ')[0];
    const rate = rates[base] || (base.includes('USD') ? 1 : 0);
    return (balance * rate).toFixed(2);
  };

  const handleCreate = async () => {
    if (!network || !currency) return;
    try {
      await api.post('/accounts/crypto', { currency, network });
      setOpen(false);
      fetchWallets();
      showNotification(t('dashboard.crypto_wallets.notification.success'), 'success');
    } catch (err) {
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
          <Paper elevation={0} sx={{ p: 0, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box component="img" src="/assets/crypto-banner-820x220.webp" sx={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '60%', p: 4 }}>
              <Typography variant="h4" fontWeight={700} mb={2} sx={{ color: 'white' }}>Криптовалюта — просто и безопасно</Typography>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: 'white', color: '#1e3a8a', fontWeight: 600, borderRadius: 2 }}>
                Создать Первый Кошелек
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{t('dashboard.crypto_wallets.table.crypto')}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Блокчейн</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Адрес</TableCell>
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
                  <TableCell>
                    {w.wallet_address ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#334155' }}>
                          {w.wallet_address.substring(0, 8)}...{w.wallet_address.slice(-8)}
                        </Typography>
                        <Tooltip title="Копировать адрес">
                          <IconButton size="small" onClick={() => handleCopy(w.wallet_address)}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">Не назначен</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>{w.balance.toFixed(6)} {w.currency}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>≈ ${getUsdValue(w.balance, w.currency)} USD</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate('/dashboard/crypto-transfer')}><SendIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => navigate('/dashboard/currency-exchange')}><SwapHorizIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={3} fontWeight={600}>Создать кошелек</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Сеть</InputLabel>
            <Select value={network} label="Сеть" onChange={(e) => { setNetwork(e.target.value); setCurrency(''); }}>
              {Object.keys(networks).map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 4 }} disabled={!network}>
            <InputLabel>Валюта</InputLabel>
            <Select value={currency} label="Валюта" onChange={(e) => setCurrency(e.target.value)}>
              {network && networks[network].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!network || !currency}>Создать</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CryptoWallets;