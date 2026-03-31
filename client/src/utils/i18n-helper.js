import i18n from '../i18n';

/**
 * Translates messages coming from the backend.
 * Backend messages can be simple keys like "ERR_AUTH_UNAUTHORIZED"
 * or complex strings like "MSG_DEPOSIT_VIA|{\"method\":\"MSG_METHOD_CRYPTO\"}"
 * 
 * @param {string} message - The message key or complex string from backend
 * @returns {string} - The translated string
 */
export const translateBackendMessage = (message) => {
  if (!message) return '';

  // Check if it's a complex message with parameters
  if (message.includes('|')) {
    const [key, paramsStr] = message.split('|');
    try {
      const params = JSON.parse(paramsStr);
      
      // Recursively translate values if they look like keys (start with MSG_ or ERR_)
      const translatedParams = {};
      for (const [k, v] of Object.entries(params)) {
        if (typeof v === 'string' && (v.startsWith('MSG_') || v.startsWith('ERR_'))) {
          translatedParams[k] = translateBackendMessage(v);
        } else {
          translatedParams[k] = v;
        }
      }
      
      const translated = i18n.t(`backend.${key}`, translatedParams);
      if (key === 'MSG_TRANSFER_TO' || key === 'MSG_TRANSFER_TO_NETWORK') {
        return i18n.t('transactions.types.transfer');
      }
      return translated;
    } catch (e) {
      console.error('Error parsing backend message params:', e);
      if (key === 'MSG_TRANSFER_TO' || key === 'MSG_TRANSFER_TO_NETWORK') return i18n.t('transactions.types.transfer');
      const fallbackTranslated = i18n.t(`backend.${key.split('.')[1] || key}`);
      if (fallbackTranslated.includes('{{') && (key === 'MSG_TRANSFER_TO' || key === 'MSG_TRANSFER_TO_NETWORK')) {
         return i18n.t('transactions.types.transfer');
      }
      return fallbackTranslated;
    }
  }

  // Simple key
  if (message === 'MSG_TRANSFER_TO' || message === 'MSG_TRANSFER_TO_NETWORK') {
    return i18n.t('transactions.types.transfer');
  }
  const simpleTranslated = i18n.t(`backend.${message}`, message);
  return simpleTranslated;
};
