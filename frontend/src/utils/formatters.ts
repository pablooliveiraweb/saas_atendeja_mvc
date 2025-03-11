/**
 * Formata um valor para o formato de moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 29,90)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param date Data a ser formatada
 * @returns String formatada (ex: 15/03/2023)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data e hora para o formato brasileiro (DD/MM/YYYY HH:MM)
 * @param date Data a ser formatada
 * @returns String formatada (ex: 15/03/2023 14:30)
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 