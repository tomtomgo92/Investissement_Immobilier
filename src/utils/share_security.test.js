
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { decodeShareCode, encodeShareCode } from './share.js';

describe('share utils - security boundaries', () => {
  const validData = {
    id: '1',
    name: 'Test',
    data: {
      prixAchat: 100000,
      travaux: 0,
      fraisNotaire: 8000,
      apport: 20000,
      tauxInteret: 3.5,
      dureeCredit: 20,
      mensualiteCredit: 500,
      vacanceLocative: 5,
      tmi: 30,
      nbColocs: 3,
      charges: [{ id: '1', name: 'Charge', value: 100 }],
      loyers: [500, 500]
    }
  };

  it('should reject extremely long name (DoS risk)', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.name = 'A'.repeat(1000000); // 1MB string
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject extremely large number of charges (DoS/Memory)', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    // Create a sparse array of length 10001
    invalid.data.charges = Array(10001).fill({ id: '1', name: 'Charge', value: 100 });
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject extremely large number of loyers (DoS/Memory)', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.data.loyers = Array(10001).fill(500);
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject Infinite numbers (Calculation break)', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    const json = JSON.stringify(invalid).replace('100000', '1e1000'); // Number too big for JS
    const encoded = btoa(json);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject extremely large values outside safe range', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.data.prixAchat = 2e9; // > 1e9
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject negative values where not appropriate', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.data.dureeCredit = -10;
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject malformed numeric fields (NaN)', () => {
     // Manually craft NaN in JSON is tricky as JSON spec doesn't support it,
     // but we can test runtime injection if someone bypassed JSON.parse somehow or if client code was buggy.
     // For decodeShareCode, JSON.parse handles the input.
     // However, we can simulate missing fields which become undefined/NaN in calculations
     const invalid = JSON.parse(JSON.stringify(validData));
     delete invalid.data.prixAchat;
     const encoded = encodeShareCode(invalid);
     const decoded = decodeShareCode(encoded);
     assert.strictEqual(decoded, null);
  });
});
