import { calculateResults, INITIAL_DATA } from './src/utils/finance.js';

const targetCashflow = 0;
const data = INITIAL_DATA;

const evaluateCashflow = (simData) => {
  if (simData.prixAchat !== data.prixAchat) {
     simData.fraisNotaire = Math.round(simData.prixAchat * 0.08);
  }
  const results = calculateResults(simData);
  return results.cashflowNetNet;
};

const calculateMaxPurchasePrice = () => {
  let minPrice = 1000;
  let maxPrice = 5000000;
  let bestPrice = null;
  let tolerance = 1;

  const baseSim = { ...data };
  baseSim.prixAchat = minPrice;
  if (evaluateCashflow(baseSim) < targetCashflow) return null;

  const testSim = { ...data };
  for (let i = 0; i < 50; i++) {
    let midPrice = (minPrice + maxPrice) / 2;
    testSim.prixAchat = midPrice;
    const cf = evaluateCashflow(testSim);
    if (Math.abs(cf - targetCashflow) <= tolerance) {
      bestPrice = midPrice;
      break;
    }
    if (cf > targetCashflow) minPrice = midPrice;
    else maxPrice = midPrice;
    bestPrice = midPrice;
  }
  return bestPrice ? Math.floor(bestPrice) : null;
};

const calculateMinRents = () => {
   let minRent = 0;
   let maxRent = 10000;
   let bestRent = null;
   let tolerance = 1;

   const testSim = { ...data };
   for (let i = 0; i < 50; i++) {
      let midRent = (minRent + maxRent) / 2;
      testSim.loyers = data.loyers.map(() => midRent);
      const cf = evaluateCashflow(testSim);
      if (Math.abs(cf - targetCashflow) <= tolerance) {
        bestRent = midRent;
        break;
      }
      if (cf < targetCashflow) minRent = midRent;
      else maxRent = midRent;
      bestRent = midRent;
   }
   return bestRent ? Math.ceil(bestRent) : null;
};

const start = performance.now();
for(let render=0; render<10; render++) {
  calculateMaxPurchasePrice();
  calculateMinRents();
}
const end = performance.now();
console.log(`10 renders of ReverseCalculator took ${end - start}ms`);
