
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { decodeShareCode, encodeShareCode } from './share.js';

describe('share utils', () => {
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
      charges: [{ id: '1', name: 'Charge', value: 100 }],
      loyers: [500, 500]
    }
  };

  it('should decode a valid share code', () => {
    const encoded = encodeShareCode(validData);
    const decoded = decodeShareCode(encoded);
    assert.deepStrictEqual(decoded, validData);
  });

  it('should return null for invalid base64', () => {
    const decoded = decodeShareCode('invalid-base64');
    assert.strictEqual(decoded, null);
  });

  it('should properly encode and decode names with special characters and emojis', () => {
    const dataWithSpecialChars = JSON.parse(JSON.stringify(validData));
    dataWithSpecialChars.name = 'Investissement à Lyon 💸';
    const encoded = encodeShareCode(dataWithSpecialChars);
    const decoded = decodeShareCode(encoded);
    assert.deepStrictEqual(decoded, dataWithSpecialChars);
  });

  it('should reject incomplete data (security fix)', () => {
    const malicious = { evil: 'data' };
    const encoded = encodeShareCode(malicious);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject data with missing numeric fields', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    delete invalid.data.prixAchat;
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject data with invalid types', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.data.prixAchat = "100000"; // string instead of number
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });

  it('should reject data with invalid charges structure', () => {
    const invalid = JSON.parse(JSON.stringify(validData));
    invalid.data.charges = [{ id: '1', name: 'Charge', value: "100" }]; // value as string
    const encoded = encodeShareCode(invalid);
    const decoded = decodeShareCode(encoded);
    assert.strictEqual(decoded, null);
  });
});
