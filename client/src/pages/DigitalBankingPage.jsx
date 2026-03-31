import React, { useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Stack, useTheme, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

const DigitalBankingPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    { q: t('digitalBanking.faq.q1'), a: t('digitalBanking.faq.a1') },
    { q: t('digitalBanking.faq.q2'), a: t('digitalBanking.faq.a2') },
    { q: t('digitalBanking.faq.q3'), a: t('digitalBanking.faq.a3') },
    { q: t('digitalBanking.faq.q4'), a: t('digitalBanking.faq.a4') },
    { q: t('digitalBanking.faq.q5'), a: t('digitalBanking.faq.a5') },
    { q: t('digitalBanking.faq.q6'), a: t('digitalBanking.faq.a6') },
    { q: t('digitalBanking.faq.q7'), a: t('digitalBanking.faq.a7') },
    { q: t('digitalBanking.faq.q8'), a: t('digitalBanking.faq.a8') },
  ];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        backgroundColor: '#0a192f', // Dark blue background
        color: 'white',
        overflow: 'hidden',
        pt: { xs: 8, md: 15 },
        pb: { xs: 8, md: 15 },
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center', 
            gap: { xs: 6, md: 8 } 
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box mb={3} sx={{ 
                display: 'inline-block',
                bgcolor: 'rgba(255,255,255,0.1)',
                px: 2,
                py: 0.5,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="body2" sx={{ color: '#93c5fd', fontWeight: 600 }}>
                  ★ {t('digitalBanking.hero.badge')}
                </Typography>
              </Box>
              
              <Typography variant="h1" sx={{ 
                color: 'white',
                fontSize: { xs: '2.5rem', md: '3.75rem' }, 
                fontWeight: 700, 
                mb: 3,
                lineHeight: 1.1,
                fontFamily: '"Roboto", sans-serif'
              }}>
                {t('digitalBanking.hero.title')}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.125rem', 
                color: '#9ca3af', 
                mb: 4,
                lineHeight: 1.6,
                maxWidth: '90%'
              }}>
                {t('digitalBanking.hero.description')}
              </Typography>
              
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                sx={{ 
                  bgcolor: '#3b82f6',
                  color: 'white',
                  py: 1.5, 
                  px: 4, 
                  mb: 5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#2563eb',
                  }
                }}
              >
                {t('digitalBanking.hero.button')}
              </Button>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <SecurityIcon sx={{ color: '#3b82f6' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t('digitalBanking.hero.feature1Title')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    {t('digitalBanking.hero.feature1Desc')}
                  </Typography>
                </Box>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <LanguageIcon sx={{ color: '#3b82f6' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t('digitalBanking.hero.feature2Title')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    {t('digitalBanking.hero.feature2Desc')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/assets/banking-s1a.jpg"
                alt="Digital Banking"
                sx={{ 
                  width: '100%', 
                  maxWidth: 480,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Section 1 */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 15 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column-reverse', md: 'row' }, 
            alignItems: 'center', 
            gap: { xs: 6, md: 10 } 
          }}>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/assets/banking-s2a.jpg"
                alt="Manage Money"
                sx={{ 
                  width: '100%', 
                  maxWidth: 440,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h2" sx={{ 
                color: '#0f172a',
                fontSize: { xs: '2rem', md: '2.75rem' }, 
                fontWeight: 800, 
                mb: 3,
                lineHeight: 1.2
              }}>
                {t('digitalBanking.section1.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7 }}>
                {t('digitalBanking.section1.description')}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Section 2 */}
      <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 15 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center', 
            gap: { xs: 6, md: 10 } 
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h2" sx={{ 
                color: '#0f172a',
                fontSize: { xs: '2rem', md: '2.75rem' }, 
                fontWeight: 800, 
                mb: 3,
                lineHeight: 1.2
              }}>
                {t('digitalBanking.section2.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7 }}>
                {t('digitalBanking.section2.description')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/assets/banking-s3a.jpg"
                alt="Transaction Transparency"
                sx={{ 
                  width: '100%', 
                  maxWidth: 440,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Section 3 */}
      <Box sx={{ bgcolor: '#f0f9ff', py: { xs: 8, md: 15 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column-reverse', md: 'row' }, 
            alignItems: 'center', 
            gap: { xs: 6, md: 10 } 
          }}>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/assets/banking-s4a.jpg"
                alt="Payment Processing"
                sx={{ 
                  width: '100%', 
                  maxWidth: 440,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h2" sx={{ 
                color: '#0f172a',
                fontSize: { xs: '2rem', md: '2.75rem' }, 
                fontWeight: 800, 
                mb: 3,
                lineHeight: 1.2
              }}>
                {t('digitalBanking.section3.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, mb: 4 }}>
                {t('digitalBanking.section3.description')}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                sx={{ 
                  bgcolor: '#3b82f6',
                  color: 'white',
                  py: 1.5, 
                  px: 4, 
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#2563eb',
                  }
                }}
              >
                {t('digitalBanking.section3.button')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" sx={{ 
              color: '#0f172a',
              fontSize: { xs: '2rem', md: '2.75rem' }, 
              fontWeight: 800, 
              mb: 2
            }}>
              {t('digitalBanking.faq.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.125rem' }}>
              {t('digitalBanking.faq.subtitle')}
            </Typography>
          </Box>

          <Box>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  mb: 2,
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#3b82f6' }} />}
                  sx={{ py: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                  <Typography sx={{ color: '#475569', lineHeight: 1.6 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DigitalBankingPage;
