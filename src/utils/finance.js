/**
 * Calculates the gross and net rental yields.
 *
 * @param {Object} params
 * @param {number} params.investTotal - The total investment cost (price + works + notary).
 * @param {number} params.monthlyGrossRent - The monthly gross rent (sum of rents).
 * @param {number} params.annualRealRent - The annual real rent (monthly real rent * 12).
 * @param {number} params.annualCharges - The total annual charges.
 * @returns {Object} An object containing the gross yield (rBrute) and net yield (rNet).
 */
export function calculateRentalYields({ investTotal, monthlyGrossRent, annualRealRent, annualCharges }) {
  const rBrute = investTotal > 0 ? ((monthlyGrossRent * 12) / investTotal) * 100 : 0;
  const rNet = investTotal > 0 ? ((annualRealRent - annualCharges) / investTotal) * 100 : 0;
  return { rBrute, rNet };
}
