import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const LegalPage = () => {
  const { t } = useTranslation();
  const { type } = useParams();

  const getTitle = () => {
    switch (type) {
      case 'terms': return t('legal.terms_title');
      case 'privacy': return t('legal.privacy_title');
      case 'cookies': return t('legal.cookies_title');
      default: return t('footer.legal_info');
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#f8fafc', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#0f172a', mb: 1 }}>
            {getTitle()}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
            {t('legal.last_updated')}
          </Typography>
          
          <Divider sx={{ mb: 6 }} />

          <Box className="legal-content" sx={{ 
            color: '#334155', 
            lineHeight: 1.8,
            '& h3': { color: '#0f172a', mt: 4, mb: 2, fontWeight: 700, fontSize: '1.5rem' },
            '& p': { mb: 2 },
            '& ul': { mb: 2, pl: 4 },
            '& li': { mb: 1 }
          }}>
            <div dangerouslySetInnerHTML={{ __html: t(`legal.${type}_content`) }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LegalPage;
