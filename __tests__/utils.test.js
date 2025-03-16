/**
 * @jest-environment jsdom
 */

const { formatNumber, describeProportion } = require('../utils');

describe('Utility Functions', () => {
    describe('formatNumber', () => {
        test('rounds numbers correctly', () => {
            expect(formatNumber(10.2)).toBe(10);
            expect(formatNumber(10.7)).toBe(11);
            expect(formatNumber(0)).toBe(0);
        });
    });

    describe('describeProportion', () => {
        test('returns correct proportion descriptions', () => {
            expect(describeProportion(80)).toBe("vast majority");
            expect(describeProportion(60)).toBe("majority");
            expect(describeProportion(35)).toBe("significant portion");
            expect(describeProportion(20)).toBe("notable portion");
            expect(describeProportion(10)).toBe("small portion");
        });
    });
});
