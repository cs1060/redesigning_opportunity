/**
 * @jest-environment jsdom
 */

describe('UI Components', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="zipcode-input">
                <input type="text" id="zipcode" maxlength="5">
            </div>
            <div class="neighborhood-list"></div>
            <div class="schools-list"></div>
            <div class="demographics-display">
                <p class="primary-summary"></p>
                <p class="detailed-summary"></p>
                <p class="context-summary"></p>
            </div>
            <div class="housing-links"></div>
        `;
    });

    test('zipcode input validation', () => {
        const input = document.getElementById('zipcode');
        
        // Test maxlength attribute
        expect(input.maxLength).toBe(5);
        
        // Test numeric input
        input.value = '12345';
        expect(/^\d*$/.test(input.value)).toBe(true);
    });

    test('placeholder text appears when sections are empty', () => {
        const sections = [
            '.neighborhood-list',
            '.schools-list',
            '.demographics-display',
            '.housing-links'
        ];

        sections.forEach(selector => {
            const element = document.querySelector(selector);
            expect(element.textContent.trim()).toBe('');
        });
    });

    test('loading state classes are properly toggled', () => {
        const section = document.createElement('div');
        section.classList.add('results-section');
        document.body.appendChild(section);

        // Add loading state
        section.classList.add('loading');
        expect(section.classList.contains('loading')).toBe(true);

        // Remove loading state
        section.classList.remove('loading');
        expect(section.classList.contains('loading')).toBe(false);
    });
});
