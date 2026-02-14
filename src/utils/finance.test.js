import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateNotaryFee, updateSimulationData, calculateResults } from './finance.js';

describe('Finance Utils', () => {
  test('calculateNotaryFee returns 8% of purchase price rounded', () => {
    assert.strictEqual(calculateNotaryFee(100000), 8000);
    assert.strictEqual(calculateNotaryFee(92000), 7360);
    assert.strictEqual(calculateNotaryFee(50000), 4000);
    assert.strictEqual(calculateNotaryFee(0), 0);
  });

  test('updateSimulationData updates field correctly', () => {
    const data = { prixAchat: 100000, travaux: 20000, fraisNotaire: 8000 };
    const newData = updateSimulationData(data, 'travaux', 30000);
    assert.strictEqual(newData.travaux, 30000);
    assert.strictEqual(newData.prixAchat, 100000);
    assert.strictEqual(newData.fraisNotaire, 8000);
  });

  test('updateSimulationData auto-calculates notary fee when prixAchat changes', () => {
    const data = { prixAchat: 100000, travaux: 20000, fraisNotaire: 8000 };
    const newData = updateSimulationData(data, 'prixAchat', 200000);
    assert.strictEqual(newData.prixAchat, 200000);
    assert.strictEqual(newData.fraisNotaire, 16000);
  });

  test('calculateResults returns correct investment total and loan amount', () => {
    const data = {
      prixAchat: 100000,
      travaux: 20000,
      fraisNotaire: 8000,
      apport: 20000,
      tauxInteret: 4,
      dureeCredit: 20,
      mensualiteCredit: 500,
      autoCredit: true,
      nbColocs: 1,
      loyers: [1000],
      charges: [{ id: '1', name: 'Charge', value: 100 }],
      vacanceLocative: 0,
      tmi: 30
    };
    const results = calculateResults(data);
    assert.strictEqual(results.investTotal, 128000);
    assert.strictEqual(results.loanAmount, 108000);
  });

  test('calculateResults handles 0 purchase price', () => {
    const data = {
      prixAchat: 0,
      travaux: 0,
      fraisNotaire: 0,
      apport: 0,
      tauxInteret: 0,
      dureeCredit: 0,
      mensualiteCredit: 0,
      autoCredit: true,
      nbColocs: 0,
      loyers: [],
      charges: [],
      vacanceLocative: 0,
      tmi: 0
    };
    const results = calculateResults(data);
    assert.strictEqual(results.investTotal, 0);
    assert.strictEqual(results.loanAmount, 0);
    assert.strictEqual(results.rBrute, 0);
    assert.strictEqual(results.rNet, 0);
  });
});
