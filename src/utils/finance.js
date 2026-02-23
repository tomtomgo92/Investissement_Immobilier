export const INITIAL_CHARGES = [
  { id: crypto.randomUUID(), name: 'Copropriété', value: 2733 },
  { id: crypto.randomUUID(), name: 'Taxe Foncière', value: 1170 },
  { id: crypto.randomUUID(), name: 'Assurance PNO', value: 159.81 },
  { id: crypto.randomUUID(), name: 'Électricité', value: 600 },
  { id: crypto.randomUUID(), name: 'Eau', value: 696 },
  { id: crypto.randomUUID(), name: 'Internet', value: 420 },
  { id: crypto.randomUUID(), name: 'CFE', value: 354 },
  { id: crypto.randomUUID(), name: 'Comptabilité', value: 289 },
];

export const INITIAL_DATA = {
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true, nbColocs: 3, loyers: [493, 493, 493],
  charges: [...INITIAL_CHARGES],
  vacanceLocative: 5,
  tmi: 30, // Tranche Marginale d'Imposition default
};

export const TMI_OPTIONS = [0, 11, 30, 41, 45];

/**
 * Calculates the notary fee (approx 8%).
 */
export const calculateNotaryFee = (purchasePrice) => {
  return Math.round(purchasePrice * 0.08);
};

/**
 * Calculates the total investment cost.
 */
export const calculateInvestmentTotal = (prixAchat, travaux, fraisNotaire) => {
  return (prixAchat || 0) + (travaux || 0) + (fraisNotaire || 0);
};

/**
 * Calculates the loan amount needed based on total investment and down payment.
 */
export const calculateLoanAmount = (investTotal, apport) => {
  return Math.max(0, (investTotal || 0) - (apport || 0));
};

/**
 * Calculates the monthly mortgage payment.
 */
export const calculateMonthlyPayment = (loanAmount, tauxInteret, dureeCredit) => {
  if (dureeCredit <= 0) return 0;
  if (loanAmount <= 0) return 0;

  const rMensuel = (tauxInteret || 0) / 100 / 12;
  const nMensuel = dureeCredit * 12;

  if (rMensuel === 0) return loanAmount / nMensuel;

  return (loanAmount * rMensuel * Math.pow(1 + rMensuel, nMensuel)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
};

/**
 * Calculates the gross and net rental yields.
 */
export function calculateRentalYields({ investTotal, monthlyGrossRent, annualRealRent, annualCharges }) {
  const rBrute = investTotal > 0 ? ((monthlyGrossRent * 12) / investTotal) * 100 : 0;
  const rNet = investTotal > 0 ? ((annualRealRent - annualCharges) / investTotal) * 100 : 0;
  return { rBrute, rNet };
}

/**
 * Calculates all simulation results.
 */
export const calculateResults = (d) => {
  const investTotal = calculateInvestmentTotal(d.prixAchat, d.travaux, d.fraisNotaire);
  const loanAmount = calculateLoanAmount(investTotal, d.apport);

  let mCredit = d.mensualiteCredit;
  if (d.autoCredit) {
    mCredit = calculateMonthlyPayment(loanAmount, d.tauxInteret, d.dureeCredit);
  }

  const recetteMensuelleBrute = d.loyers.reduce((acc, curr) => acc + curr, 0);
  const recetteMensuelleRéelle = recetteMensuelleBrute * (1 - (d.vacanceLocative / 100));
  const recetteAnnuelle = recetteMensuelleRéelle * 12;
  const totalChargesAnnuelles = d.charges.reduce((acc, c) => acc + c.value, 0);
  const creditAnnee = mCredit * 12;

  const { rBrute, rNet } = calculateRentalYields({
    investTotal,
    monthlyGrossRent: recetteMensuelleBrute,
    annualRealRent: recetteAnnuelle,
    annualCharges: totalChargesAnnuelles
  });

  const beneficeAn = recetteAnnuelle - (creditAnnee + totalChargesAnnuelles);
  const cashflowM = beneficeAn / 12;

  // --- Tax Calculation (Simplified LMNP Réel) ---
  const amortissementAnnuel = ((d.prixAchat * 0.85) + d.fraisNotaire + d.travaux) / 25;
  const interetsAnnuels = loanAmount * (d.tauxInteret / 100);

  const resultatFiscal = Math.max(0, recetteAnnuelle - totalChargesAnnuelles - interetsAnnuels - amortissementAnnuel);
  const impots = resultatFiscal * ((d.tmi + 17.2) / 100); // TMI + CSG
  const cashflowNetNet = cashflowM - (impots / 12);

  const years = Array.from({ length: 21 }, (_, i) => i);
  const rMensuel = (d.tauxInteret || 0) / 100 / 12;
  const nMensuel = d.dureeCredit * 12;

  const projectionData = years.map(year => {
    const months = year * 12;
    let remainingDebt = loanAmount;
    if (rMensuel > 0 && months > 0) {
      remainingDebt = loanAmount * (Math.pow(1 + rMensuel, nMensuel) - Math.pow(1 + rMensuel, months)) / (Math.pow(1 + rMensuel, nMensuel) - 1);
    } else if (months > 0) {
      remainingDebt = Math.max(0, loanAmount - (mCredit * months));
    }
    if (year > d.dureeCredit) remainingDebt = 0;
    const cumCashflow = beneficeAn * year;
    const netWorth = (d.prixAchat + d.travaux) - remainingDebt + cumCashflow;
    return { year, remainingDebt, cumCashflow, netWorth, cumCharges: totalChargesAnnuelles * year };
  });

  return {
    investTotal, loanAmount, recetteMensuelleBrute, recetteAnnuelle, totalChargesAnnuelles,
    creditAnnee, rBrute, rNet, beneficeAn, cashflowM, mCredit, projectionData, recetteMensuelleRéelle,
    impots, cashflowNetNet
  };
};

export const updateSimulationData = (data, field, value) => {
  const numericValue = parseFloat(value) || 0;
  const newData = { ...data, [field]: numericValue };

  if (field === 'prixAchat') {
    newData.fraisNotaire = calculateNotaryFee(numericValue);
  }

  return newData;
};
