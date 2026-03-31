import React, { useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Stack, useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

const CryptoPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { text: t('crypto.features.item1'), icon: <CurrencyExchangeIcon sx={{ fontSize: 32, color: '#000' }} />, title: "Broad Asset Coverage" },
    { text: t('crypto.features.item2'), icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#000' }} />, title: "Low-Cost Trading" },
    { text: t('crypto.features.item3'), icon: <SupportAgentIcon sx={{ fontSize: 32, color: '#000' }} />, title: "24/7 Platform Access" },
    { text: t('crypto.features.item4'), icon: <SecurityIcon sx={{ fontSize: 32, color: '#000' }} />, title: "Institutional Security" },
  ];

  const stats = [
    t('crypto.stats.item1'),
    t('crypto.stats.item2'),
    t('crypto.stats.item3'),
    t('crypto.stats.item4'),
    t('crypto.stats.item5'),
    t('crypto.stats.item6'),
  ];

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        backgroundColor: '#1c2230', // Deep dark slate background
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
              <Stack direction="row" spacing={1} mb={2}>
                <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/round-eth.webp" alt="Ethereum" style={{ width: 24, height: 24 }} />
                </Box>
                <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/round-btc.webp" alt="Bitcoin" style={{ width: 24, height: 24 }} />
                </Box>
                <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/round-usdt.webp" alt="Tether" style={{ width: 24, height: 24 }} />
                </Box>
                <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/round-xrp.webp" alt="Ripple" style={{ width: 24, height: 24 }} />
                </Box>
              </Stack>
              
              <Box mb={2}>
                <Typography variant="body2" sx={{ 
                  color: '#9ca3af', 
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}>
                  {t('crypto.hero.subtitle')}
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
                {t('crypto.hero.title')}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.125rem', 
                color: '#9ca3af', 
                mb: 4,
                lineHeight: 1.6,
                maxWidth: '90%'
              }}>
                {t('crypto.hero.description')}
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
                {t('crypto.hero.button')}
              </Button>
            </Box>
            
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Box 
                component="img"
                src="/assets/crypto-s1a.jpg"
                alt="Crypto trading interface"
                sx={{ 
                  width: '100%', 
                  maxWidth: 480,
                  height: 'auto', 
                  borderRadius: 4,
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              />
              {/* BTC Glassmorphism Overlay */}
              <Box sx={{
                position: 'absolute',
                left: { xs: '5%', md: '-10%' },
                bottom: '20%',
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
              }}>
                <Box sx={{ 
                  width: 28, 
                  height: 28, 
                  bgcolor: '#f7931a', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img src="/assets/round-btc.webp" alt="BTC" style={{ width: 28, height: 28 }} />
                </Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
                  BTC
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                  +0.17
                </Typography>
                <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 20 }} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Feature Section with Light Cyan Background */}
      <Box sx={{ bgcolor: '#68dcf3', py: { xs: 8, md: 15 } }}>
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
                alt="Crypto mobile app interface"
                sx={{ 
                  width: '100%', 
                  maxWidth: 440,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  display: 'block'
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h2" sx={{ 
                color: '#000',
                fontSize: { xs: '2rem', md: '2.75rem' }, 
                fontWeight: 800, 
                mb: 5,
                lineHeight: 1.2
              }}>
                {t('crypto.features.title')}
              </Typography>
              
              <Stack spacing={4}>
                {features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 700, mb: 0.5, fontSize: '1.1rem' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#333', fontSize: '1rem', lineHeight: 1.5 }}>
                        {feature.text}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 6, md: 8 } 
          }}>
            <Box sx={{ flex: { xs: 1, md: '0 0 40%' } }}>
              <Typography variant="h2" sx={{ 
                color: '#111827',
                fontSize: { xs: '2rem', md: '2.5rem' }, 
                fontWeight: 800, 
                mb: 3
              }}>
                {t('crypto.why.title')}
              </Typography>
              <Typography variant="body1" sx={{ 
                fontSize: '1rem', 
                color: '#4b5563', 
                mb: 5,
                lineHeight: 1.7
              }}>
                {t('crypto.why.description')}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="outlined" 
                sx={{ 
                  color: '#111827',
                  borderColor: '#e5e7eb',
                  py: 1.2, 
                  px: 3, 
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderWidth: 1,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#111827',
                    borderWidth: 1,
                    bgcolor: 'transparent'
                  }
                }}
              >
                {t('crypto.why.button')}
              </Button>
            </Box>
            
            <Box sx={{ flex: { xs: 1, md: '0 0 60%' } }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 3 
              }}>
                {stats.map((stat, index) => (
                  <Box key={index} sx={{ 
                    p: 3, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      bgcolor: '#3b82f6', 
                      borderRadius: 4,
                      mr: 2,
                      flexShrink: 0
                    }} />
                    <Typography variant="body1" sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>
                      {stat}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default CryptoPage;
