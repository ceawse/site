import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Container, TextField, Alert, CircularProgress, Stack
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

const AboutUsPage = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [contactEmail, setContactEmail] = useState('support@alpenstark.com');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings');
        if (data && data.contact_email) {
          setContactEmail(data.contact_email);
        }
      } catch (err) {
        console.error('Failed to fetch settings for about page', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus({ type: 'success', message: t('about.contact.success') });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: t('about.contact.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        backgroundColor: '#111827', // Deep slate like screenshot
        backgroundImage: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
        color: 'white',
        pt: { xs: 12, md: 20 },
        pb: { xs: 12, md: 20 },
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Box mb={4} sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255,255,255,0.05)',
            px: 2,
            py: 0.75,
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ade80' }} />
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.85rem' }}>
              {t('about.hero.badge')}
            </Typography>
          </Box>
          
          <Typography variant="h1" sx={{ 
            color: 'white',
            fontSize: { xs: '3rem', md: '4.5rem' }, 
            fontWeight: 800, 
            mb: 4,
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            {t('about.hero.title')}
          </Typography>
          
          <Typography variant="body1" sx={{ 
            fontSize: '1.25rem', 
            color: '#94a3b8', 
            lineHeight: 1.7,
            maxWidth: 700,
            mx: 'auto'
          }}>
            {t('about.hero.description')}
          </Typography>
        </Container>
      </Box>

      {/* Our Story Section with Overlapping Quote */}
      <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 6, md: 10 },
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
              <Box 
                component="img"
                src="/assets/about-s2.jpg"
                alt="About AlpenStark"
                sx={{ 
                  width: '100%', 
                  maxWidth: 500,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'block',
                  mx: 'auto'
                }}
              />
              {/* Overlapping Quote Card */}
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: { xs: '5%', md: '10%' },
                width: '80%',
                bgcolor: 'white',
                p: 3,
                borderRadius: 3,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f1f5f9'
              }}>
                <Typography variant="body1" sx={{ color: '#334155', fontStyle: 'italic', mb: 2, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {t('about.quote.text')}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Marcus Steinberg
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {t('about.quote.author')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, width: '100%', pt: { xs: 6, md: 0 } }}>
              <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, mb: 4, fontSize: { xs: '2rem', md: '3rem' } }}>
                {t('about.story.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.8, mb: 3 }}>
                {t('about.story.p1')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.8 }}>
                {t('about.story.p2')}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#f0f4f8' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: { xs: 6, md: 10 }
          }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '2.75rem' } }}>
                {t('about.contact.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, mb: 6 }}>
                {t('about.contact.description')}
              </Typography>
              
              <Box 
                component="img"
                src="/assets/banking-s2a.jpg" // Fallback since support video is missing
                alt="Support Team"
                sx={{ 
                  width: '100%', 
                  maxWidth: 400,
                  height: 'auto', 
                  borderRadius: 4,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Box>

            <Box sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ bgcolor: 'white', p: { xs: 4, md: 5 }, borderRadius: 4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800, mb: 2 }}>
                  {t('about.contact.formTitle')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                  {t('about.contact.formDescription').replace('support@alpenstark.com', contactEmail)}
                </Typography>
                
                {status.message && (
                  <Alert severity={status.type} sx={{ mb: 4 }}>
                    {status.message}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField 
                        fullWidth 
                        label={t('about.contact.firstName')} 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required 
                        variant="outlined"
                      />
                      <TextField 
                        fullWidth 
                        label={t('about.contact.lastName')} 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required 
                        variant="outlined"
                      />
                    </Box>
                    <TextField 
                      fullWidth 
                      label={t('about.contact.email')} 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      variant="outlined"
                    />
                    <TextField 
                      fullWidth 
                      label={t('about.contact.message')} 
                      multiline 
                      rows={4} 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      variant="outlined"
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={loading}
                      sx={{ 
                        py: 1.5, 
                        px: 4,
                        bgcolor: '#3b82f6',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        alignSelf: 'flex-start',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : t('about.contact.button')}
                    </Button>
                  </Stack>
                </form>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUsPage;
