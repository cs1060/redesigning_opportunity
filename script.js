// Initialize chart
let demographicsChart = null;

// Sample demographic data (replace with real API data in production)
const getDemographicData = (zipcode) => {
    // This is mock data - in a real application, this would fetch from an API
    return {
        'Hispanic': Math.floor(Math.random() * 100),
        'White': Math.floor(Math.random() * 100),
        'Black': Math.floor(Math.random() * 100),
        'Asian': Math.floor(Math.random() * 100),
        'Other': Math.floor(Math.random() * 100)
    };
};

// Create or update demographics display
const updateDemographicsDisplay = (zipcode) => {
    const data = getDemographicData(zipcode);
    
    // Normalize data to ensure total is 100
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const normalizedData = {};
    Object.entries(data).forEach(([key, value]) => {
        normalizedData[key] = Math.round((value / total) * 100);
    });

    // Update summary text
    const summaryElement = document.querySelector('.summary-text');
    const majorityGroup = Object.entries(normalizedData)
        .sort(([,a], [,b]) => b - a)[0];
    summaryElement.textContent = `In ${zipcode}, ${majorityGroup[0]} residents make up the largest group at ${majorityGroup[1]}% of the population.`;

    // Update icons display
    const iconsContainer = document.querySelector('.demographics-icons');
    iconsContainer.innerHTML = '';

    Object.entries(normalizedData).forEach(([race, percentage]) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'demographic-group';

        const iconGroup = document.createElement('div');
        iconGroup.className = 'icon-group';

        // Add 5 icons, filled based on percentage
        const numFilledIcons = Math.round(percentage / 20); // 20% per icon
        for (let i = 0; i < 5; i++) {
            const icon = document.createElement('i');
            icon.className = `fas fa-user ${race.toLowerCase()}-color`;
            if (i >= numFilledIcons) {
                icon.style.opacity = '0.3';
            }
            iconGroup.appendChild(icon);
        }

        const label = document.createElement('div');
        label.className = 'demographic-label';
        label.textContent = race;

        const percentageText = document.createElement('div');
        percentageText.className = 'demographic-percentage';
        percentageText.textContent = `${percentage}%`;

        groupDiv.appendChild(iconGroup);
        groupDiv.appendChild(label);
        groupDiv.appendChild(percentageText);
        iconsContainer.appendChild(groupDiv);
    });

    // Update table
    const tbody = document.querySelector('.demographics-table tbody');
    tbody.innerHTML = '';

    Object.entries(normalizedData)
        .sort(([,a], [,b]) => b - a) // Sort by percentage descending
        .forEach(([race, percentage]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${race}</td>
                <td>${percentage}</td>
            `;
            tbody.appendChild(row);
        });
};

// Handle zipcode input
document.getElementById('zipcode').addEventListener('input', (e) => {
    const zipcode = e.target.value;
    if (zipcode.length === 5) {
        updateDemographicsDisplay(zipcode);
    }
});

// Handle form submission
document.getElementById('family-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Smooth scroll to demographics section
    document.getElementById('demographics-page').scrollIntoView({ behavior: 'smooth' });
});

// Initialize with empty data
document.addEventListener('DOMContentLoaded', () => {
    updateDemographicsDisplay('00000');
});
