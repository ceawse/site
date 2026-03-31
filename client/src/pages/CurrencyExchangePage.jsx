import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Stack, useTheme, Card, TextField, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

const CurrencyExchangePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [sellAmount, setSellAmount] = useState('1000');
  const [exchangeRate, setExchangeRate] = useState(0.8524);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const buyAmount = (parseFloat(sellAmount || 0) * exchangeRate).toFixed(2);

  const steps = [
    t('currencyExchange.section2.step1'),
    t('currencyExchange.section2.step2'),
    t('currencyExchange.section2.step3'),
    t('currencyExchange.section2.step4'),
  ];

  const faqs = [
    { q: t('currencyExchange.faq.q1'), a: t('currencyExchange.faq.a1') },
    { q: t('currencyExchange.faq.q2'), a: t('currencyExchange.faq.a2') },
    { q: t('currencyExchange.faq.q3'), a: t('currencyExchange.faq.a3') },
    { q: t('currencyExchange.faq.q4'), a: t('currencyExchange.faq.a4') },
  ];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        backgroundColor: '#0a192f',
        color: 'white',
        overflow: 'hidden',
        pt: { xs: 8, md: 15 },
        pb: { xs: 8, md: 15 },
      }}>
        {/* Fallback background video */}
        <video 
          src="/assets/bank-vault.mp4" 
          autoPlay loop muted playsInline 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'cover', 
            zIndex: 0, opacity: 0.15 
          }} 
        />
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
                <Typography variant="body2" sx={{ color: '#4ade80', fontWeight: 600 }}>
                  ★ {t('currencyExchange.hero.badge')}
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
                {t('currencyExchange.hero.title')}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.125rem', 
                color: '#9ca3af', 
                mb: 4,
                lineHeight: 1.6,
                maxWidth: '90%'
              }}>
                {t('currencyExchange.hero.description')}
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Card sx={{ 
                p: { xs: 3, md: 5 }, 
                borderRadius: 6, 
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                width: '100%',
                maxWidth: 480
              }}>
                <Box sx={{ bgcolor: '#f1f5f9', p: 2.5, borderRadius: 4, mb: 2, transition: 'all 0.2s', '&:focus-within': { bgcolor: 'white', boxShadow: '0 0 0 2px #3b82f6' } }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>{t('currencyExchange.hero.widget.sell')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField fullWidth value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} sx={{ input: { fontSize: '2rem', fontWeight: 700, p: 0, color: '#0f172a' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, borderLeft: '1px solid #cbd5e1' }}>
                      <img src="/assets/gb.svg" alt="GBP" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <Typography fontWeight={700} fontSize="1.1rem" color="#0f172a">GBP</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 2 }}>
                  <Typography variant="body2" color="#64748b" fontWeight={500}>{t('currencyExchange.hero.widget.rate')}</Typography>
                  <Typography variant="body2" fontWeight={700} color="#3b82f6">1 GBP = {exchangeRate.toFixed(4)} EUR</Typography>
                </Box>

                <Box sx={{ bgcolor: '#f1f5f9', p: 2.5, borderRadius: 4, mb: 4, transition: 'all 0.2s', '&:focus-within': { bgcolor: 'white', boxShadow: '0 0 0 2px #3b82f6' } }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>{t('currencyExchange.hero.widget.buy')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField fullWidth value={buyAmount} InputProps={{ disableUnderline: true, readOnly: true }} variant="standard" sx={{ input: { fontSize: '2rem', fontWeight: 700, p: 0, color: '#0f172a' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, borderLeft: '1px solid #cbd5e1' }}>
                      <img src="/assets/eu.svg" alt="EUR" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <Typography fontWeight={700} fontSize="1.1rem" color="#0f172a">EUR</Typography>
                    </Box>
                  </Box>
                </Box>

                <Button component={RouterLink} to="/register" variant="contained" fullWidth sx={{ 
                  py: 2.2, 
                  background: '#3b82f6', 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  textTransform: 'none', 
                  borderRadius: 4,
                  '&:hover': { background: '#2563eb' } 
                }}>
                  {t('currencyExchange.hero.widget.button')}
                </Button>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 3, textAlign: 'center', fontSize: '0.8rem' }}>
                  {t('currencyExchange.hero.widget.adding')}
                </Typography>
              </Card>
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
                alt="International Coverage"
                sx={{ 
                  width: '100%', 
                  maxWidth: 480,
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
                {t('currencyExchange.section1.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, mb: 4 }}>
                {t('currencyExchange.section1.description')}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="outlined" 
                sx={{ 
                  color: '#0f172a',
                  borderColor: '#cbd5e1',
                  py: 1.2, px: 3, 
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {t('currencyExchange.section1.button')}
              </Button>
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
                mb: 4,
                lineHeight: 1.2
              }}>
                {t('currencyExchange.section2.title')}
              </Typography>
              
              <Stack spacing={3}>
                {steps.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
                    <Box sx={{ 
                      width: 32, height: 32, 
                      borderRadius: '50%', 
                      bgcolor: '#3b82f6', 
                      color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, mr: 2, flexShrink: 0
                    }}>
                      {idx + 1}
                    </Box>
                    <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 600 }}>
                      {step}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box 
                component="img"
                src="/assets/banking-s3a.jpg"
                alt="Conversion Steps"
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
                src="/assets/crypto-s2a.jpg"
                alt="Live Market Rates"
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
                {t('currencyExchange.section3.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, mb: 4 }}>
                {t('currencyExchange.section3.description')}
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
                {t('currencyExchange.section3.button')}
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
              {t('currencyExchange.faq.title')}
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

export default CurrencyExchangePage;
