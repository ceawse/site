import React from 'react';
import { Box } from '@mui/material';

const currencyIcons = {
  USD: '/assets/us.svg',
  EUR: '/assets/eu.svg',
  GBP: '/assets/gb.svg',
  CHF: '/assets/ch.svg',
  RUB: '/assets/ru.svg',
  JPY: '/assets/jp.svg',
  BTC: '/assets/BTC.svg',
  ETH: '/assets/ETH.svg',
  BNB: '/assets/BNB.svg',
  SOL: '/assets/SOL.svg',
  TRX: '/assets/TRX.svg',
  USDT: '/assets/round-usdt.webp',
  USDC: '/assets/round-usdt.webp', // fallback or placeholder
  XRP: '/assets/round-xrp.webp'
};

const CurrencyIcon = ({ currency, sx = {} }) => {
  if (!currency) return null;
  const upperCur = currency.toUpperCase();
  const iconSrc = currencyIcons[upperCur];
  
  if (!iconSrc) return null; // Or return a default generic icon

  return (
    <Box
      component="img"
      src={iconSrc}
      alt={upperCur}
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        objectFit: 'cover',
        ...sx
      }}
    />
  );
};

export default CurrencyIcon;
