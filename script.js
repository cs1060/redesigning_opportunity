// Sample demographic data (replace with real API data in production)
const getDemographicData = (zipcode) => {
    // This is mock data - in a real application, this would fetch from an API
    return {
        'Hispanic': Math.random() * 100,
        'White': Math.random() * 100,
        'Black': Math.random() * 100,
        'Asian': Math.random() * 100,
        'Other': Math.random() * 100
    };
};

// Helper function to format numbers
const formatNumber = (num) => {
    return Math.round(num);
};

// Helper function to describe proportion
const describeProportion = (percentage) => {
    if (percentage >= 75) return "vast majority";
    if (percentage >= 50) return "majority";
    if (percentage >= 30) return "significant portion";
    if (percentage >= 15) return "notable portion";
    return "small portion";
};

// Create or update demographics display
const updateDemographicsDisplay = (zipcode) => {
    const data = getDemographicData(zipcode);
    
    // Normalize data to ensure total is 100
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const normalizedData = {};
    Object.entries(data).forEach(([key, value]) => {
        normalizedData[key] = (value / total) * 100;
    });

    // Sort demographics by percentage
    const sortedDemographics = Object.entries(normalizedData)
        .sort(([,a], [,b]) => b - a);

    // Generate primary summary
    const primaryGroup = sortedDemographics[0];
    const primarySummary = document.querySelector('.primary-summary');
    primarySummary.textContent = `In this neighborhood, ${primaryGroup[0]} residents make up the ${describeProportion(primaryGroup[1])} of the community at ${formatNumber(primaryGroup[1])}%.`;

    // Generate detailed summary
    const detailedSummary = document.querySelector('.detailed-summary');
    detailedSummary.textContent = `For every 100 people in this area, you'll find about ${
        sortedDemographics.map(([race, pct]) => 
            `${formatNumber(pct)} ${race}`
        ).join(', ').replace(/,([^,]*)$/, ' and$1')
    } residents.`;

    // Generate context summary
    const contextSummary = document.querySelector('.context-summary');
    const diversity = sortedDemographics[0][1] > 75 ? "less" : "more";
    contextSummary.textContent = `This is a ${diversity} diverse community compared to many other areas. ${
        diversity === "more" 
            ? "This means your child will have opportunities to interact with people from various backgrounds."
            : `With a strong ${sortedDemographics[0][0]} presence, your child will be exposed to rich cultural traditions and community values.`
    }`;
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
    document.getElementById('demographics-page').scrollIntoView({ behavior: 'smooth' });
});

// Initialize with empty data
document.addEventListener('DOMContentLoaded', () => {
    updateDemographicsDisplay('00000');
});
