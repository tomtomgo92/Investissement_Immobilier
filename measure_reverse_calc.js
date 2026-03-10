import { performance } from 'perf_hooks';
import { calculateResults } from './src/utils/finance.js';

// Mock evaluateCashflow
const evaluateCashflow = (simData) => {
  const results = calculateResults(simData);
  return results.cashflowNetNet;
};

const data = {
  "name": "Projet A",
  "prixAchat": 150000,
  "travaux": 20000,
  "fraisNotaire": 12000,
  "apport": 15000,
  "tauxInteret": 3.5,
  "dureeCredit": 20,
  "mensualiteCredit": 1100,
  "autoCredit": true,
  "loyers": [600, 600, 600],
  "vacanceLocative": 5,
  "charges": [
    { "name": "Taxe Foncière", "value": 1200 },
    { "name": "Assurance PNO", "value": 200 },
    { "name": "Charges de Copropriété", "value": 800 }
  ],
  "tmi": 30,
  "typeLocation": "meuble"
};

const targetCashflow = 500;

const runOld = () => {
  let minRent = 0;
  let maxRent = 10000;
  let tolerance = 1;
  const testSim = { ...data };

  for (let i = 0; i < 50; i++) {
    let midRent = (minRent + maxRent) / 2;
    testSim.loyers = data.loyers.map(() => midRent);

    const cf = evaluateCashflow(testSim);

    if (Math.abs(cf - targetCashflow) <= tolerance) {
      break;
    }

    if (cf < targetCashflow) {
       minRent = midRent;
    } else {
       maxRent = midRent;
    }
  }
};

const runNew = () => {
  let minRent = 0;
  let maxRent = 10000;
  let tolerance = 1;
  const testSim = { ...data, loyers: [...data.loyers] };

  for (let i = 0; i < 50; i++) {
    let midRent = (minRent + maxRent) / 2;
    for (let j = 0; j < testSim.loyers.length; j++) {
      testSim.loyers[j] = midRent;
    }

    const cf = evaluateCashflow(testSim);

    if (Math.abs(cf - targetCashflow) <= tolerance) {
      break;
    }

    if (cf < targetCashflow) {
       minRent = midRent;
    } else {
       maxRent = midRent;
    }
  }
};

let start = performance.now();
for(let i=0; i<100; i++) runOld();
console.log('Old mapping loyers:', performance.now() - start);

start = performance.now();
for(let i=0; i<100; i++) runNew();
console.log('New mutating loyers:', performance.now() - start);
