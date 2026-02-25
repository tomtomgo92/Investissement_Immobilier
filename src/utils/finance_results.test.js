import { test } from 'node:test';
import assert from 'node:assert';
import { calculateResults, INITIAL_DATA } from './finance.js';

test('calculateResults - Tax Optimization - Micro-BIC better (Low charges)', () => {
    // Rent: 12 * 500 = 6000
    // Charges: Very low (0)
    // Interest: Very low (0)
    // Works/Amortization: Very low (0)
    // Micro abatement = 3000. Taxable = 3000.
    // Real deduction = 0. Taxable = 6000.
    // Micro should be better.

    const data = {
        ...INITIAL_DATA,
        loyers: [500], // 6000/yr
        charges: [], // 0 charges
        travaux: 0,
        fraisNotaire: 0,
        prixAchat: 0, // 0 amortization
        tauxInteret: 0, // 0 interest
        vacanceLocative: 0,
        tmi: 30
    };

    const results = calculateResults(data);
    assert.strictEqual(results.recetteAnnuelle, 6000);

    // Micro: Tax base = 3000. Tax = 3000 * (30+17.2)% = 3000 * 0.472 = 1416.
    // Real: Tax base = 6000. Tax = 6000 * 0.472 = 2832.

    assert.strictEqual(results.bestRegime, 'micro');
    assert.ok(results.impotsMicro < results.impotsReel);
    assert.strictEqual(results.impots, results.impotsMicro);
});

test('calculateResults - Tax Optimization - Real better (High amortization/charges)', () => {
    // Rent: 6000
    // Amortization + Charges > 3000 (50%)

    const data = {
        ...INITIAL_DATA,
        loyers: [500], // 6000/yr
        charges: [{ id: '1', name: 'Charge', value: 4000 }], // 4000 charges
        travaux: 0,
        fraisNotaire: 0,
        prixAchat: 0,
        tauxInteret: 0,
        vacanceLocative: 0,
        tmi: 30
    };

    const results = calculateResults(data);

    // Micro: Tax base = 3000. Tax = 1416.
    // Real: Tax base = 6000 - 4000 = 2000. Tax = 2000 * 0.472 = 944.

    assert.strictEqual(results.bestRegime, 'reel');
    assert.ok(results.impotsReel < results.impotsMicro);
    assert.strictEqual(results.impots, results.impotsReel);
});
