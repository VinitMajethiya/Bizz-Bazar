export type Paise = number; // integer, never a float

/**
 * Converts integer paise into displayable Indian Rupee format.
 * E.g., 49900 -> "₹499", 129900 -> "₹1,299", 99 -> "₹0.99"
 */
export const formatINR = (paise: Paise): string => {
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  });
};

/**
 * Converts rupees (number or string) to integer paise, avoiding floating point drift.
 */
export const rupeesToPaise = (rupees: number | string): Paise => {
  return Math.round(Number(rupees) * 100);
};

/**
 * Calculates percentage saved given a sale price and compare-at price in paise.
 */
export const savingPercent = (price: Paise, compare: Paise | null): number => {
  if (!compare || compare <= price) return 0;
  return Math.round((1 - price / compare) * 100);
};
