import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { 
  Box, Typography, Paper, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';
import CurrencyIcon from '../../components/CurrencyIcon';

const AccountOverview = () => {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState('USD');
  const [accounts, setAccounts] = useState([]);
  const [rates, setRates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, ratesData] = await Promise.all([
          api.get('/accounts'),
          api.get('/exchange-rates')
        ]);
        setAccounts(accData);
        
        const parsedRates = { 'USD': 1 };
        ratesData.currencyPairs.forEach(p => {
          const [base, target] = p.pair.split('/');
          if (target === 'USD') parsedRates[base] = p.buyRaw || parseFloat(p.buy);
        });
        ratesData.cryptoRates.forEach(c => {
          parsedRates[c.symbol] = c.priceRaw || parseFloat(c.price.replace(/,/g, '').split(' ')[0]);
        });
        setRates(parsedRates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const totalFundsInSelectedCurrency = accounts.reduce((sum, a) => {
    const rateToUsd = rates[a.currency] || 1; // Convert to USD
    const usdValue = a.balance * rateToUsd;
    const selectedCurrencyRateToUsd = rates[currency] || 1; // Conversion from USD to target
    return sum + (usdValue / selectedCurrencyRateToUsd);
  }, 0);

  const formatBalance = (val, cur) => {
    const isCrypto = ['BTC','ETH','SOL','BNB', 'TRX'].some(c => cur.toUpperCase().includes(c));
    return formatCurrency(val, cur, i18n.language, isCrypto ? 6 : 2, isCrypto ? 8 : 2);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.account_overview.title')}
      </Typography>
      
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mr: 1 }}>{t('dashboard.account_overview.available_funds')}</Typography>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
                  '& .MuiSelect-icon': { color: '#2563eb' }
                }}
              >
                <MenuItem value="USD"><CurrencyIcon currency="USD" sx={{ mr: 1, width: 20, height: 20 }} /> USD</MenuItem>
                <MenuItem value="EUR"><CurrencyIcon currency="EUR" sx={{ mr: 1, width: 20, height: 20 }} /> EUR</MenuItem>
                <MenuItem value="GBP"><CurrencyIcon currency="GBP" sx={{ mr: 1, width: 20, height: 20 }} /> GBP</MenuItem>
                <MenuItem value="CHF"><CurrencyIcon currency="CHF" sx={{ mr: 1, width: 20, height: 20 }} /> CHF</MenuItem>
              </Select>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#0f172a' }}>
              {formatCurrency(totalFundsInSelectedCurrency, currency, i18n.language)}
            </Typography>
          </Box>
          <Button 
            onClick={() => navigate('/dashboard/bank-transfer')}
            variant="contained" 
            startIcon={<CallMadeIcon fontSize="small" />} 
            sx={{ 
              bgcolor: '#3b82f6', 
              '&:hover': { bgcolor: '#2563eb' },
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 500
            }}
          >
            {t('dashboard.account_overview.new_transfer')}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.account_overview.table.account')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.account_overview.table.balance')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.account_overview.table.reserved')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.account_overview.table.available')}</TableCell>
              <TableCell align="right" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>{t('dashboard.account_overview.table.currency')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((row) => (
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CurrencyIcon currency={row.currency} sx={{ width: 20, height: 15, mr: 1.5, borderRadius: '2px' }} />
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {row.account_number} ({row.currency})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{formatBalance(row.balance, row.currency)}</TableCell>
                <TableCell align="right" sx={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{formatBalance(row.reserved, row.currency)}</TableCell>
                <TableCell align="right" sx={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{formatBalance(row.balance - row.reserved, row.currency)}</TableCell>
                <TableCell align="right" sx={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{row.currency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountOverview;
