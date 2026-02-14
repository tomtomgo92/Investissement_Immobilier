/**
 * Calculates the total investment cost.
 * @param {number} purchasePrice - The purchase price of the property.
 * @param {number} works - The estimated cost of works/renovations.
 * @param {number} notaryFees - The notary fees.
 * @returns {number} The total investment cost.
 */
export function calculateInvestmentTotal(purchasePrice, works, notaryFees) {
  return purchasePrice + works + notaryFees;
}

/**
 * Calculates the loan amount needed based on total investment and down payment.
 * @param {number} investmentTotal - The total investment cost.
 * @param {number} downPayment - The personal contribution (apport).
 * @returns {number} The loan amount (minimum 0).
 */
export function calculateLoanAmount(investmentTotal, downPayment) {
  return Math.max(0, investmentTotal - downPayment);
}

/**
 * Calculates the monthly mortgage payment.
 * @param {number} loanAmount - The principal loan amount.
 * @param {number} annualRatePercent - The annual interest rate in percentage (e.g., 3.5 for 3.5%).
 * @param {number} durationYears - The duration of the loan in years.
 * @returns {number} The monthly payment amount. Returns 0 if duration is 0.
 */
export function calculateMonthlyPayment(loanAmount, annualRatePercent, durationYears) {
  if (durationYears <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / 12;
  const numberOfPayments = durationYears * 12;

  // If interest rate is 0, simple division
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  return numerator / denominator;
}
