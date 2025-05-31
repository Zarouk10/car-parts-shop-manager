
/**
 * تنسيق العملة العراقية - الدينار العراقي (IQD)
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencySimple = (amount: number): string => {
  return `${amount.toLocaleString('ar-IQ')} دينار`;
};

// دالة لتحويل من الريال السعودي إلى الدينار العراقي
export const convertSARtoIQD = (amountInSAR: number, exchangeRate: number = 1195): number => {
  // سعر الصرف التقريبي: 1 ريال سعودي = 1195 دينار عراقي
  return amountInSAR * exchangeRate;
};

// دالة للحصول على سعر الصرف من API خارجي (اختيارية)
export const getExchangeRate = async (): Promise<number> => {
  try {
    // يمكن استخدام API مثل ExchangeRate-API أو CurrencyAPI
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/SAR');
    // const data = await response.json();
    // return data.rates.IQD || 1195;
    
    // للآن نستخدم سعر ثابت تقريبي
    return 1195;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1195; // سعر افتراضي
  }
};
