/**
 * Robustly parses a formatted number string into a float.
 * Handles both US (e.g., 1,234.56) and EU (e.g., 1.234,56) formats.
 * 
 * @param {number|string} value - The formatted number or string.
 * @returns {number} The parsed float value.
 */
const parseFormattedNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  
  const clean = value.replace(/[^0-9,.-]/g, '');
  if (!clean) return NaN;

  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');

  if (lastComma > lastDot) {
    // If comma is the last separator, check if it's a thousands separator (e.g., "68,690")
    if (lastDot === -1 && clean.length - lastComma - 1 === 3) {
      return parseFloat(clean.replace(/,/g, ''));
    }
    // Otherwise it's a decimal separator (e.g., "1.234,56" or "1234,56")
    return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
  } else if (lastDot > lastComma) {
    // Dot is the last separator (e.g., "1,234.56" or "1234.56")
    return parseFloat(clean.replace(/,/g, ''));
  } else {
    return parseFloat(clean);
  }
};

/**
 * Formats a number according to the specified locale and currency options.
 * 
 * @param {number|string} amount - The amount to format.
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'EUR').
 * @param {string} locale - The locale string (e.g., 'ru-RU', 'en-US').
 * @param {number} minimumFractionDigits - Minimum decimal places.
 * @param {number} maximumFractionDigits - Maximum decimal places.
 * @param {string} currencyDisplay - How to display currency ('symbol', 'code', 'name').
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2, currencyDisplay = 'code') => {
  if (amount === undefined || amount === null) return '---';
  
  const num = parseFormattedNumber(amount);
  
  if (isNaN(num)) return amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay
    }).format(num);
  } catch (e) {
    // Fallback if currency code is not supported by Intl
    const formattedNum = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
    return `${formattedNum} ${currencyCode.toUpperCase()}`;
  }
};

/**
 * Formats a percentage change.
 * 
 * @param {number|string} percent - The percentage value.
 * @param {string} locale - The locale string.
 * @returns {string} Formatted percentage.
 */
export const formatPercent = (percent, locale = 'en-US') => {
  if (percent === undefined || percent === null) return '---';

  const num = parseFormattedNumber(percent);
  if (isNaN(num)) return percent;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(num / 100);
};

export const formatYearsShort = (count, lang, t) => {
  if (lang?.startsWith('ru')) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count}г`;
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count}г`;
    return `${count}л`;
  }
  return `${count}${t('dashboard.loan.years_short') || 'y'}`;
};

export const formatYears = (count, lang, t) => {
  if (lang?.startsWith('ru')) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} год`;
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} года`;
    return `${count} лет`;
  }
  return `${count} ${t('dashboard.loan.years')}`;
};

export const formatMonths = (count, lang, t) => {
  if (lang?.startsWith('ru')) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} месяц`;
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} месяца`;
    return `${count} месяцев`;
  }
  return `${count} ${t('dashboard.loan.months')}`;
};
