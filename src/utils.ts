export const formatCurrency = (amount: number, currency: 'CFA' | 'EUR' = 'CFA'): string => {
  if (currency === 'EUR') {
    const eurAmount = amount / 655.957; // Taux de conversion fixe CFA vers EUR
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(eurAmount);
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};