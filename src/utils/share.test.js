import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encodeShareCode, decodeShareCode } from './share.js';

describe('Share Utilities', () => {
    it('should encode and decode a simulation correctly', () => {
        const simulation = {
            id: 'test-id',
            name: 'Test Simulation',
            data: {
                prixAchat: 100000,
                loyers: [500, 500],
            },
        };

        const encoded = encodeShareCode(simulation);
        assert.strictEqual(typeof encoded, 'string');
        assert.ok(encoded.length > 0);

        const decoded = decodeShareCode(encoded);
        assert.deepStrictEqual(decoded, simulation);
    });

    it('should return null for valid base64 but invalid JSON', () => {
        const invalidJson = 'not json';
        const encoded = btoa(invalidJson);
        const decoded = decodeShareCode(encoded);
        assert.strictEqual(decoded, null);
    });

    it('should handle empty input gracefully', () => {
        const result = decodeShareCode("");
        assert.strictEqual(result, null);
    });
});
