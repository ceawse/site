import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';

const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await api.get('/invoices');
        setInvoices(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
        {t('dashboard.invoices.title')}
      </Typography>
      
      {invoices.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#334155' }}>
          {t('dashboard.invoices.no_invoices')}
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('dashboard.invoices.table.invoice_num')}</TableCell>
                <TableCell>{t('dashboard.invoices.table.date')}</TableCell>
                <TableCell>{t('dashboard.invoices.table.amount')}</TableCell>
                <TableCell>{t('dashboard.invoices.table.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.invoice_number}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.amount} {inv.currency}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Invoices;
