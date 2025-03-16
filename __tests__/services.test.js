/**
 * @jest-environment jsdom
 */

const { DataService, mockData } = require('../services');

// Mock the CONFIG object
global.CONFIG = {
    useOpenAI: false
};

describe('DataService', () => {
    describe('Mock Data Mode', () => {
        beforeEach(() => {
            CONFIG.useOpenAI = false;
        });

        test('getNeighborhoods returns valid mock data structure', async () => {
            const neighborhoods = await DataService.getNeighborhoods('12345');
            expect(Array.isArray(neighborhoods)).toBe(true);
            expect(neighborhoods.length).toBeGreaterThan(0);
            
            const firstNeighborhood = neighborhoods[0];
            expect(firstNeighborhood).toHaveProperty('name');
            expect(firstNeighborhood).toHaveProperty('distance');
            expect(firstNeighborhood).toHaveProperty('description');
        });

        test('getSchools returns valid mock data structure', async () => {
            const schools = await DataService.getSchools('12345');
            expect(Array.isArray(schools)).toBe(true);
            expect(schools.length).toBeGreaterThan(0);
            
            const firstSchool = schools[0];
            expect(firstSchool).toHaveProperty('name');
            expect(firstSchool).toHaveProperty('type');
            expect(firstSchool).toHaveProperty('description');
        });

        test('getDemographics returns valid mock data structure', async () => {
            const demographics = await DataService.getDemographics('12345');
            expect(demographics).toBeInstanceOf(Object);
            expect(Object.keys(demographics)).toEqual(
                expect.arrayContaining(['Hispanic', 'White', 'Black', 'Asian', 'Other'])
            );
        });

        test('getHousing returns valid mock data structure', async () => {
            const housing = await DataService.getHousing('12345');
            expect(Array.isArray(housing)).toBe(true);
            expect(housing.length).toBeGreaterThan(0);
            
            const firstResource = housing[0];
            expect(firstResource).toHaveProperty('name');
            expect(firstResource).toHaveProperty('url');
            expect(firstResource).toHaveProperty('description');
        });
    });
});
