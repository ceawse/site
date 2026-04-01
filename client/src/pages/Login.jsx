import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { translateBackendMessage } from '../utils/i18n-helper';

const Login = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInfo('');
        setError('');
        try {
            const data = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            const serverData = err.responseData || {};

            if (serverData.message === 'ERR_USER_BLOCKED') {
                setError(t('backend.ERR_USER_BLOCKED', {
                    reason: serverData.reason || t('common.not_specified', 'Не указана')
                }));
            } else {
                const errorMessage = translateBackendMessage(serverData.message || err.message);
                setError(errorMessage || t('auth.invalid_credentials'));
            }
        }
    };

    const handleForgotPassword = () => {
        setError('');
        setInfo(t('auth.forgot_password_msg'));
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 8, md: 15 } }}>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                    {t('auth.login_title')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, textAlign: 'left', borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {info && (
                    <Alert severity="info" sx={{ mb: 2, textAlign: 'left', borderRadius: 2 }}>
                        {info}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                        variant="outlined"
                    />
                    <Box>
                        <TextField
                            label={t('auth.password')}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Typography
                                variant="caption"
                                onClick={handleForgotPassword}
                                sx={{
                                    color: '#4F46E5',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {t('auth.forgot_password_link')}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 1,
                            bgcolor: '#4F46E5',
                            color: 'white',
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#4338CA' }
                        }}
                    >
                        {t('auth.login_button')}
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {t('auth.no_account')}{' '}
                            <Box component="span" onClick={() => navigate('/register')} sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                                {t('common.register')}
                            </Box>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;