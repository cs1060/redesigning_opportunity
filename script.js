// Initialize chart
let demographicsChart = null;

// Sample demographic data (replace with real API data in production)
const getDemographicData = (zipcode) => {
    // This is mock data - in a real application, this would fetch from an API
    return {
        'White': Math.random() * 100,
        'Black': Math.random() * 100,
        'Hispanic': Math.random() * 100,
        'Asian': Math.random() * 100,
        'Other': Math.random() * 100
    };
};

// Create or update demographics chart
const updateDemographicsChart = (zipcode) => {
    const data = getDemographicData(zipcode);
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Population Percentage',
                data: Object.values(data),
                backgroundColor: [
                    '#4361ee',
                    '#3f37c9',
                    '#3a0ca3',
                    '#480ca8',
                    '#560bad'
                ],
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Demographics for Zipcode ${zipcode}`,
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    };

    if (demographicsChart) {
        demographicsChart.destroy();
    }

    const ctx = document.getElementById('demographicsChart').getContext('2d');
    demographicsChart = new Chart(ctx, chartConfig);
};

// Handle zipcode input
document.getElementById('zipcode').addEventListener('input', (e) => {
    const zipcode = e.target.value;
    if (zipcode.length === 5) {
        updateDemographicsChart(zipcode);
    }
});

// Handle form submission
document.getElementById('family-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Smooth scroll to demographics section
    document.getElementById('demographics-page').scrollIntoView({ behavior: 'smooth' });
});

// Initialize the chart with empty data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDemographicsChart('00000');
});
