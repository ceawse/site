import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Stepper, Step, StepLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { countries } from '../utils/countries';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { translateBackendMessage } from '../utils/i18n-helper';

const Register = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const steps = [t('auth.step_account'), t('auth.step_personal')];
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Определение системного языка для календаря
  const calendarLang = i18n.language === 'gb' ? 'en-US' : i18n.language;

  // Step 1
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = {
        name: fullName,
        email,
        password,
        phone,
        dob,
        address,
        city,
        state: region,
        zip,
        country
      };
      const data = await api.post('/auth/register', payload);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(translateBackendMessage(err.message) || t('auth.register_error'));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (activeStep === 0) {
      if (!phone || !email || !password) {
        setError(t('auth.fill_required'));
        return;
      }
      setError('');
      setActiveStep(1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 15 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" align="center" gutterBottom>
          {t('common.open_account')}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 2 }}>
            <Typography color="error" variant="body2" align="center">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleNext} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {activeStep === 0 && (
            <>
              <TextField
                label={t('auth.phone')}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </>
          )}

          {activeStep === 1 && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('auth.first_name')}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
                <TextField
                  label={t('auth.last_name')}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
              </Box>

              <TextField
                label={t('auth.dob')}
                type="date"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                  lang: calendarLang
                }}
                value={dob}
                onChange={e => setDob(e.target.value)}
                fullWidth
                required
                size="small"
              />

              <TextField
                label={t('auth.address')}
                value={address}
                onChange={e => setAddress(e.target.value)}
                fullWidth
                required
                size="small"
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('auth.city')}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
                <TextField
                  label={t('auth.region')}
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  fullWidth
                  required
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label={t('auth.postal_code')}
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
                <FormControl fullWidth required size="small">
                  <InputLabel sx={{ bgcolor: 'white', px: 0.5 }}>{t('auth.country')}</InputLabel>
                  <Select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    variant="outlined"
                    label={t('auth.country')}
                  >
                    {countries.map((c) => (
                      <MenuItem key={c} value={c}>{t(`countries.${c}`, c)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            {activeStep === 1 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                fullWidth
                sx={{ py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {t('auth.back')}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#4F46E5',
                color: 'white',
                py: 1.2,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: '#4338CA' }
              }}
            >
              {activeStep === 0 ? t('auth.next') : t('auth.register_button')}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {t('auth.already_have_account')}{' '}
              <Box component="span" onClick={() => navigate('/login')} sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                {t('auth.sign_in')}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;