/**
 * Currency formatting utilities
 */

export function formatCurrencyPHP(amount: number): string {
  return `PHP ${amount.toLocaleString("en-PH", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function formatCurrency(amount: number, currency: string = 'PHP'): string {
  if (currency === 'PHP') {
    return formatCurrencyPHP(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
