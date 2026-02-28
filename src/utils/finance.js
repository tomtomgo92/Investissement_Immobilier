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
  // Property & Loan
  prixAchat: 92000, travaux: 20000, fraisNotaire: 7360, apport: 15000,
  tauxInteret: 3.85, dureeCredit: 20, mensualiteCredit: 567,
  autoCredit: true,

  // Investor Profile (Bankability)
  revenusFoyer: 3500, chargesFoyer: 800, // Monthly net revenue & existing loans/rent

  // Operations
  nbColocs: 3, loyers: [493, 493, 493],
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
 * Generates a full amortization schedule (capital/interest split per month).
 */
export const calculateAmortizationSchedule = (loanAmount, annualRate, durationYears, monthlyPayment) => {
  const schedule = [];
  let remainingCapital = loanAmount;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = durationYears * 12;

  // If monthlyPayment is provided (fixed), use it. Otherwise calculate.
  const payment = monthlyPayment || calculateMonthlyPayment(loanAmount, annualRate, durationYears);

  for (let m = 1; m <= totalMonths; m++) {
    const interest = remainingCapital * monthlyRate;
    const capital = payment - interest;
    remainingCapital -= capital;
    if (remainingCapital < 0) remainingCapital = 0;

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment,
      interest,
      capital,
      remainingCapital
    });

    if (remainingCapital <= 0) break;
  }
  return schedule;
};

/**
 * Aggregates amortization schedule by year.
 */
export const aggregateScheduleByYear = (schedule) => {
  const years = {};
  schedule.forEach(row => {
    if (!years[row.year]) years[row.year] = { interest: 0, capital: 0, remainingCapital: 0 };
    years[row.year].interest += row.interest;
    years[row.year].capital += row.capital;
    years[row.year].remainingCapital = row.remainingCapital; // Last month's value
  });
  return years; // Object with year keys
};


/**
 * Calculates Bankability / Debt Ratio.
 */
export const calculateBankability = (revenusFoyer, chargesFoyer, loyerPondere, mensualiteCredit) => {
  // HCSF Calculation typically uses 70% of rental income
  const totalRevenus = revenusFoyer + (loyerPondere * 0.7);
  const totalCharges = chargesFoyer + mensualiteCredit;

  const tauxEndettement = totalRevenus > 0 ? (totalCharges / totalRevenus) * 100 : 0;
  const resteAVivre = totalRevenus - totalCharges;

  // Simple heuristic for status
  let status = 'green';
  if (tauxEndettement > 35) status = 'red';
  else if (tauxEndettement > 33) status = 'orange';

  return { tauxEndettement, resteAVivre, status };
};


/**
 * Generates Stress Test Scenarios based on base data.
 */
export const generateStressScenarios = (baseData) => {
  // Scenario Prudent: 1 mois de vacance (8.33%) et charges augmentées de 20%
  const higherChargesFactorPrudent = 1.2;
  const dataPrudent = {
    ...baseData,
    vacanceLocative: 8.33,
    charges: baseData.charges.map(c => ({ ...c, value: c.value * higherChargesFactorPrudent })),
    name: 'Prudent'
  };

  // Scenario Pessimiste: Taux d'intérêt augmenté (+2%), Taxe foncière x1.5, et budget travaux doublé
  const dataPessimiste = {
    ...baseData,
    tauxInteret: baseData.tauxInteret + 2,
    travaux: baseData.travaux * 2,
    charges: baseData.charges.map(c => {
      if (c.name.toLowerCase().includes('foncière') || c.name.toLowerCase().includes('fonciere')) {
        return { ...c, value: c.value * 1.5 };
      }
      return c;
    }),
    name: 'Pessimiste'
  };

  return {
    nominal: { ...baseData, name: 'Nominal' },
    prudent: dataPrudent,
    pessimiste: dataPessimiste
  };
};


/**
 * Auto-estimates standard real estate charges.
 */
export const autoEstimateCharges = (prixAchat, totalLoyerMensuel) => {
  return [
    { id: crypto.randomUUID(), name: 'Taxe Foncière', value: Math.round(totalLoyerMensuel) }, // Approx 1 month rent
    { id: crypto.randomUUID(), name: 'Assurance PNO', value: 150 }, // Standard 150€
    { id: crypto.randomUUID(), name: 'Gestion Locative', value: Math.round(totalLoyerMensuel * 12 * 0.07) }, // 7% of annual rent
    { id: crypto.randomUUID(), name: 'Entretien & Réparations', value: Math.round(prixAchat * 0.01) }, // 1% of purchase price
    { id: crypto.randomUUID(), name: 'Copropriété', value: Math.round(totalLoyerMensuel * 12 * 0.10) }, // 10% of annual rent roughly
    { id: crypto.randomUUID(), name: 'Comptabilité', value: 300 }, // Standard accountant
  ];
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

  // Credit Calculation
  let mCredit = d.mensualiteCredit;
  if (d.autoCredit) {
    mCredit = calculateMonthlyPayment(loanAmount, d.tauxInteret, d.dureeCredit);
  }

  // Generate Amortization Schedule (Yearly Aggregates)
  const schedule = calculateAmortizationSchedule(loanAmount, d.tauxInteret, d.dureeCredit, mCredit);
  const yearlySchedule = aggregateScheduleByYear(schedule);


  // Operational Flows
  const recetteMensuelleBrute = d.loyers.reduce((acc, curr) => acc + curr, 0);
  const recetteMensuelleRéelle = recetteMensuelleBrute * (1 - (d.vacanceLocative / 100));
  const recetteAnnuelle = recetteMensuelleRéelle * 12;
  const totalChargesAnnuelles = d.charges.reduce((acc, c) => acc + c.value, 0);
  const creditAnnee = mCredit * 12;

  // Yields
  const { rBrute, rNet } = calculateRentalYields({
    investTotal,
    monthlyGrossRent: recetteMensuelleBrute,
    annualRealRent: recetteAnnuelle,
    annualCharges: totalChargesAnnuelles
  });

  const beneficeAn = recetteAnnuelle - (creditAnnee + totalChargesAnnuelles);
  const cashflowM = beneficeAn / 12;

  // --- Dynamic Tax Projection (Year by Year) ---
  const amortissementImmobilier = (d.prixAchat * 0.85 + d.fraisNotaire) / 30; // 30 years approx
  const amortissementMobilier = (d.travaux) / 10; // 10 years for furniture/works approx

  const projectionData = [];
  const years = 20;

  for (let year = 1; year <= years; year++) {
    // 1. Interest for this year (from schedule or 0 if loan over)
    const interests = yearlySchedule[year] ? yearlySchedule[year].interest : 0;
    const remainingDebt = yearlySchedule[year] ? yearlySchedule[year].remainingCapital : 0;

    // 2. LMNP Réel Calculation
    // Resultat = Recettes - Charges - Intérêts - Amortissements
    // Amortissement stops after its duration
    let amortTotal = 0;
    if (year <= 30) amortTotal += amortissementImmobilier;
    if (year <= 10) amortTotal += amortissementMobilier;

    const resultatFiscalReel = Math.max(0, recetteAnnuelle - totalChargesAnnuelles - interests - amortTotal);
    const impotsReel = resultatFiscalReel * ((d.tmi + 17.2) / 100);

    // 3. Micro-BIC (50% abatement)
    const resultatFiscalMicro = Math.max(0, recetteAnnuelle * 0.5);
    const impotsMicro = resultatFiscalMicro * ((d.tmi + 17.2) / 100);

    const impots = Math.min(impotsReel, impotsMicro);
    const bestRegime = impotsReel < impotsMicro ? 'reel' : 'micro';

    // Cashflow Net Net for this specific year
    const cfNetNetYear = beneficeAn - impots;

    // Net Worth (Asset Value - Debt + Cash Accumulation)
    // Simple appreciation model: 1% / year
    const assetValue = (d.prixAchat + d.travaux) * Math.pow(1.01, year);
    const cumCashflow = beneficeAn * year; // Simplified cumulative without tax reinvestment for now
    const netWorth = assetValue - remainingDebt + cumCashflow;

    projectionData.push({
      year,
      remainingDebt,
      interests,
      amortTotal,
      impots,
      impotsReel,
      impotsMicro,
      bestRegime,
      cfNetNetYear,
      netWorth,
      cumCashflow
    });
  }

  // Averages for KPI display (Year 1)
  const firstYear = projectionData[0] || {};
  const impotsFirstYear = firstYear.impots || 0;
  const cashflowNetNet = cashflowM - (impotsFirstYear / 12);
  const bestRegime = firstYear.bestRegime || 'micro';
  const impotsReel = firstYear.impotsReel || 0;
  const impotsMicro = firstYear.impotsMicro || 0;

  // Bankability Check
  const bankability = calculateBankability(d.revenusFoyer, d.chargesFoyer, recetteMensuelleRéelle, mCredit);

  return {
    investTotal, loanAmount, recetteMensuelleBrute, recetteAnnuelle, totalChargesAnnuelles,
    creditAnnee, rBrute, rNet, beneficeAn, cashflowM, mCredit,
    recetteMensuelleRéelle,
    // New specific outputs
    projectionData,
    cashflowNetNet,
    bankability,
    // Preserving old structure for compatibility where needed, but favoring projectionData
    bestRegime,
    impots: impotsFirstYear,
    impotsReel,
    impotsMicro,
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
