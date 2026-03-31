import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { api } from '../../api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTransactions: 0,
    totalFiat: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/admin/stats');
      setStats({
        totalUsers: data.totalUsers || 0,
        pendingTransactions: data.pendingTransactions || 0,
        totalFiat: data.totalFiat || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t('admin.dashboard.overview')}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{t('admin.dashboard.total_users')}</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{t('admin.dashboard.pending_transactions')}</Typography>
              <Typography variant="h4">{stats.pendingTransactions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{t('admin.dashboard.total_fiat')}</Typography>
              <Typography variant="h4">${stats.totalFiat.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}