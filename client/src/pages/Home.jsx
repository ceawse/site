import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Grid, Card, TextField, Stack, useTheme, useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SpeedIcon from '@mui/icons-material/Speed';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import StarIcon from '@mui/icons-material/Star';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  
  const solutions = [
    {
      title: t('home.solutions.items.iban.title'),
      description: t('home.solutions.items.iban.description'),
      image: "/assets/dedicated-iban-sqr.webp",
      button: t('home.solutions.items.iban.button'),
    },
    {
      title: t('home.solutions.items.multi_currency.title'),
      description: t('home.solutions.items.multi_currency.description'),
      image: "/assets/multi-currency-account-sqr.webp",
      button: t('home.solutions.items.multi_currency.button'),
    },
    {
      title: t('home.solutions.items.exchange.title'),
      description: t('home.solutions.items.exchange.description'),
      image: "/assets/currency-exchange-sqr.webp",
      button: t('home.solutions.items.exchange.button'),
    },
    {
      title: t('home.solutions.items.crypto.title'),
      description: t('home.solutions.items.crypto.description'),
      image: "/assets/buy-sell-crypto-sqr.webp",
      button: t('home.solutions.items.crypto.button'),
    },
    {
      title: t('home.solutions.items.cards.title'),
      description: t('home.solutions.items.cards.description'),
      image: "/assets/credit-card-sqr.webp",
      button: t('home.solutions.items.cards.button'),
    }
  ];

  const marqueeItems = [
    t('home.marquee.transfers'), t('home.marquee.exchange'), t('home.marquee.assets'), 
    t('home.marquee.wallets'), t('home.marquee.invoicing'), t('home.marquee.banking')
  ];

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const scrollRef = useRef(null);
  const [activeSolution, setActiveSolution] = useState(0);

  const handleTabClick = (idx) => {
    setActiveSolution(idx);
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cards = container.querySelectorAll('.solution-card');
      const child = cards[idx];
      if (child) {
        const scrollPosition = child.offsetLeft - (container.clientWidth / 2) + (child.offsetWidth / 2);
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  };

  const handleScroll = (e) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    let minDistance = Infinity;
    let activeIdx = activeSolution;

    const cards = container.querySelectorAll('.solution-card');
    cards.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        activeIdx = index;
      }
    });

    if (activeIdx !== activeSolution) {
      setActiveSolution(activeIdx);
    }
  };

  const [sellAmount, setSellAmount] = useState('500');
  const [exchangeRate, setExchangeRate] = useState(0.8533);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await api.get('/public/exchange-rates');
        const eurUsd = data.currencyPairs.find(p => p.pair === 'EUR/USD');
        if (eurUsd) {
          // Invert back to USD -> EUR rate (how many EUR for 1 USD)
          // eurUsd.sell is USD for 1 EUR. So 1 USD = 1/eurUsd.sell EUR.
          setExchangeRate(1 / parseFloat(eurUsd.sell));
        }
      } catch (err) {
        console.error('Failed to fetch public rates:', err);
      }
    };
    fetchRates();
  }, []);

  const buyAmount = sellAmount && !isNaN(parseFloat(sellAmount)) ? (parseFloat(sellAmount) * exchangeRate).toFixed(2) : '';

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', bgcolor: 'white' }}>
      
      {/* 1. Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: '#021B48'
      }}>
        <video 
          src="/assets/bg-sec1-1080x1080.mp4" 
          autoPlay loop muted playsInline 
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.6 }} 
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
          <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1.1, mb: 4 }}>
            {t('home.hero.title_1')}<br />
            <Box component="span" sx={{ 
              background: 'linear-gradient(90deg, #60cdff 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              {t('home.hero.title_2')}
            </Box>
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#a7bbe0', maxWidth: '600px', mx: 'auto', fontWeight: 400, fontSize: '1.25rem', lineHeight: 1.6, mb: 6 }}>
            {t('home.hero.subtitle')}
          </Typography>

          <Button 
            variant="contained" 
            component={RouterLink}
            to={user ? "/dashboard" : "/register"}
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#3b82f6', color: 'white', borderRadius: '50px', px: 5, py: 1.8, fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#2563eb' } }}
          >
            {user ? t('common.dashboard') : t('common.open_account')}
          </Button>
          
          <Box sx={{ mt: 8, animation: 'bounce 2s infinite', color: 'white', opacity: 0.7 }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
          </Box>
        </Container>
      </Box>

      {/* 2. Marquee Strip */}
      <Box sx={{ bgcolor: '#0f172a', py: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'inline-block', animation: 'ticker 30s linear infinite' }}>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <Typography key={i} component="span" sx={{ color: 'white', fontWeight: 600, mx: 4, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* 3. Solutions Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, rgb(113, 175, 255) 0%, #60cdff 100%)', overflowX: 'hidden' }}>
        <Container maxWidth="xl">
          <Typography variant="h2" align="center" sx={{ mb: { xs: 4, md: 8 }, fontWeight: 800, color: '#001742', fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' } }}>
            {t('home.solutions.title_1')}<br />{t('home.solutions.title_2')}
          </Typography>
        </Container>

        <Box 
          ref={scrollRef} 
          onScroll={handleScroll} 
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: { xs: 2, md: 4 }, 
            pb: 4, 
            width: '100vw',
            scrollSnapType: 'x mandatory', 
            '&::-webkit-scrollbar': { display: 'none' },
            '&::before': { content: '""', flexShrink: 0, width: { xs: '16px', md: 'calc(50vw - 325px - 16px)' } },
            '&::after': { content: '""', flexShrink: 0, width: { xs: '16px', md: 'calc(50vw - 325px - 16px)' } }
          }}
        >
          {solutions.map((sol, idx) => (
            <Card key={idx} className="solution-card" sx={{ 
              minWidth: { xs: 'calc(100vw - 32px)', sm: '400px', md: '650px' },
              scrollSnapAlign: 'center',
              borderRadius: { xs: 4, md: 6 }, 
              background: 'rgba(5, 29, 73, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              p: { xs: 3, md: 5 },
              gap: { xs: 2, md: 4 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 30px 60px rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(96, 205, 255, 0.3)',
              }
            }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{sol.title}</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: { xs: 2, md: 4 }, lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' } }}>{sol.description}</Typography>
                  <Box>
                    <Button component={RouterLink} to={user ? "/dashboard" : "/register"} variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', py: 1.5, px: 4, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                      {user ? t('common.dashboard') : sol.button}
                    </Button>
                  </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', '& img': { transition: 'transform 0.5s ease' }, '&:hover img': { transform: 'scale(1.05)' } }}>
                <img src={sol.image} alt={sol.title} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
              </Box>
            </Card>
          ))}
        </Box>


        <Container maxWidth="xl">
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 4, bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: 50, width: 'fit-content', mx: 'auto', border: '1px solid rgba(255,255,255,0.3)' }}>
            {solutions.map((sol, idx) => (
              <Button 
                key={idx} 
                onClick={() => handleTabClick(idx)}
                sx={{ 
                  borderRadius: 40, 
                  py: 1.5, 
                  px: 3, 
                  color: activeSolution === idx ? 'white' : '#001742', 
                  bgcolor: activeSolution === idx ? '#051d49' : 'transparent',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: activeSolution === idx ? '#051d49' : 'rgba(255,255,255,0.2)' },
                  boxShadow: activeSolution === idx ? '0 4px 12px rgba(30,41,59,0.4)' : 'none'
                }}
              >
                {sol.title}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 4. Advanced Financial Platform */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 3, color: '#0f172a', fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                {t('home.platform.title')} <span style={{ color: '#3b82f6' }}>{t('home.platform.title_accent')}</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 6, fontSize: '1.2rem', lineHeight: 1.7 }}>
                {t('home.platform.description')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
                {['eu', 'uk', 'usa', 'norway', 'india', 'china', 'btc', 'eth', 'usdt', 'xrp'].map((icon, i) => (
                  <img 
                    key={icon} 
                    src={`/assets/round-${icon}.webp`} 
                    alt={icon} 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      animation: `float 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`
                    }} 
                    onError={(e) => { e.target.src = '/assets/btc.svg'; }} 
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <PublicIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('home.platform.feature_1_title')}</Typography>
                    <Typography sx={{ color: '#64748b' }}>{t('home.platform.feature_1_desc')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <AutorenewIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('home.platform.feature_2_title')}</Typography>
                    <Typography sx={{ color: '#64748b' }}>{t('home.platform.feature_2_desc')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <AccountBalanceIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('home.platform.feature_3_title')}</Typography>
                    <Typography sx={{ color: '#64748b' }}>{t('home.platform.feature_3_desc')}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. Convert currencies widget */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 4, color: '#0f172a', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                {t('home.convert_widget.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 6, fontSize: '1.2rem', lineHeight: 1.7 }}>
                {t('home.convert_widget.description')}
              </Typography>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t('home.convert_widget.rate_title')}</Typography>
                  <Typography sx={{ color: '#64748b' }}>{t('home.convert_widget.rate_desc')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t('home.convert_widget.instant_title')}</Typography>
                  <Typography sx={{ color: '#64748b' }}>{t('home.convert_widget.instant_desc')}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: { xs: 3, md: 5 }, 
                borderRadius: 6, 
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)'
              }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>{t('home.convert_widget.card_title')}</Typography>
                
                <Box sx={{ bgcolor: '#f1f5f9', p: 2.5, borderRadius: 4, mb: 2, transition: 'all 0.2s', '&:focus-within': { bgcolor: 'white', boxShadow: '0 0 0 2px #3b82f6' } }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>{t('home.convert_widget.sell_label')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField fullWidth value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} sx={{ input: { fontSize: '2rem', fontWeight: 700, p: 0 } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, borderLeft: '1px solid #cbd5e1' }}>
                      <img src="/assets/us.svg" alt="USD" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <Typography fontWeight={700} fontSize="1.1rem">USD</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 2 }}>
                  <Typography variant="body2" color="#64748b" fontWeight={500}>{t('home.convert_widget.rate_label')}</Typography>
                  <Typography variant="body2" fontWeight={700} color="#3b82f6">1 USD = {exchangeRate.toFixed(4)} EUR</Typography>
                </Box>

                <Box sx={{ bgcolor: '#f1f5f9', p: 2.5, borderRadius: 4, mb: 4, transition: 'all 0.2s', '&:focus-within': { bgcolor: 'white', boxShadow: '0 0 0 2px #3b82f6' } }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 600 }}>{t('home.convert_widget.buy_label')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField fullWidth value={buyAmount} InputProps={{ disableUnderline: true, readOnly: true }} variant="standard" sx={{ input: { fontSize: '2rem', fontWeight: 700, p: 0 } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, borderLeft: '1px solid #cbd5e1' }}>
                      <img src="/assets/eu.svg" alt="EUR" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <Typography fontWeight={700} fontSize="1.1rem">EUR</Typography>
                    </Box>
                  </Box>
                </Box>

                <Button component={RouterLink} to="/register" variant="contained" fullWidth sx={{ 
                  py: 2.2, 
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  textTransform: 'none', 
                  borderRadius: 4,
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.6)' } 
                }}>
                  {t('home.convert_widget.button')}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 6. Process Large Transfers */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 4, color: '#0f172a', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                {t('home.large_transfers.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 6, fontSize: '1.2rem', lineHeight: 1.7 }}>
                {t('home.large_transfers.description')}
              </Typography>
              
              <Stack spacing={3}>
                {[
                  t('home.large_transfers.point_1'),
                  t('home.large_transfers.point_2'),
                  t('home.large_transfers.point_3'),
                  t('home.large_transfers.point_4')
                ].map((text, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ bgcolor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', p: 0.5, display: 'flex' }}>
                      <CheckCircleIcon />
                    </Box>
                    <Typography sx={{ color: '#1e293b', fontWeight: 500 }}>{text}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <img src="/assets/s5-phone-solid.webp" alt="Phone App" style={{ width: '100%', display: 'block' }} />
                <img src="/assets/s5-phone-overlay.webp" alt="Overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. Vault Video Section */}
      <Box sx={{ 
        position: 'relative', 
        py: { xs: 12, md: 16 }, 
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#000'
      }}>
        <video 
          src="/assets/bank-vault.mp4" 
          autoPlay loop muted playsInline 
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.5 }} 
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)', zIndex: 1 }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <Grid container spacing={8}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight={800} sx={{ color: 'white', mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                {t('home.security.title')} <span style={{ color: '#60cdff' }}>{t('home.security.title_accent')}</span>
              </Typography>
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 8, fontWeight: 400 }}>
                {t('home.security.subtitle')}
              </Typography>
              
              <Stack spacing={5}>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ color: '#60cdff' }} /> {t('home.security.feature_1_title')}
                  </Typography>
                  <Typography sx={{ color: '#cbd5e1' }}>{t('home.security.feature_1_desc')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SpeedIcon sx={{ color: '#60cdff' }} /> {t('home.security.feature_2_title')}
                  </Typography>
                  <Typography sx={{ color: '#cbd5e1' }}>{t('home.security.feature_2_desc')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalanceIcon sx={{ color: '#60cdff' }} /> {t('home.security.feature_3_title')}
                  </Typography>
                  <Typography sx={{ color: '#cbd5e1' }}>{t('home.security.feature_3_desc')}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 8. Trust Section */}
      <Box sx={{ py: { xs: 8, md: 16 }, bgcolor: '#f8fafc', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Stack direction="row" spacing={-2} justifyContent="center" sx={{ mb: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Box key={i} sx={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid white', overflow: 'hidden', zIndex: 10 - i, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <img src={`/assets/avatars-home-${i}.webp`} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </Box>
            ))}
          </Stack>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 3 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} sx={{ color: '#fbbf24', fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.3))' }} />
            ))}
          </Box>

          <Typography variant="h2" fontWeight={800} sx={{ mb: 4, color: '#0f172a', fontSize: { xs: '2rem', md: '3rem' } }}>
            {t('home.trust.title_1')} <span style={{ color: '#3b82f6' }}>{t('home.trust.title_2')}</span> {t('home.trust.title_3')}
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#64748b', mb: 6, fontSize: '1.2rem', maxWidth: 600, mx: 'auto' }}>
            {t('home.trust.subtitle')}
          </Typography>
          
          <Button variant="contained" component={RouterLink} to="/register" size="large" sx={{ bgcolor: '#0f172a', py: 2, px: 6, borderRadius: 50, fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}>
            {t('home.trust.button')}
          </Button>
        </Container>
      </Box>

      <style>
        {`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Home;
