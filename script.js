// Mock data providers (can be replaced with API calls later)
const getMockNeighborhoods = (zipcode) => {
    // This would be replaced with OpenAI API call
    return [
        {
            name: "Greenfield Heights",
            distance: "5 miles",
            description: "Family-friendly area with excellent public parks and community centers."
        },
        {
            name: "Oakwood District",
            distance: "8 miles",
            description: "Known for its great schools and safe streets. Active community events."
        },
        {
            name: "Pine Hill Estates",
            distance: "10 miles",
            description: "Affordable housing with growing community programs and new developments."
        }
    ];
};

const getMockSchools = (zipcode) => {
    // This would be replaced with OpenAI API call
    return [
        {
            name: "Lincoln Elementary School",
            type: "Public",
            description: "Strong focus on STEM education with after-school programs."
        },
        {
            name: "Westview Academy",
            type: "Charter",
            description: "Offers bilingual education and cultural enrichment programs."
        },
        {
            name: "Greenfield High School",
            type: "Public",
            description: "High graduation rates and diverse AP course offerings."
        }
    ];
};

const getMockHousingResources = (zipcode) => {
    // This would be replaced with OpenAI API call
    return [
        {
            name: "Zillow Listings",
            url: "https://www.zillow.com",
            description: "Find homes for sale & rent in this area"
        },
        {
            name: "Affordable Housing Directory",
            url: "https://www.hud.gov",
            description: "Government & nonprofit housing programs"
        },
        {
            name: "Community Housing Support",
            url: "https://www.usa.gov/housing-help",
            description: "Local resources and assistance for new residents"
        }
    ];
};

const getDemographicData = (zipcode) => {
    // This would be replaced with real API data
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

// Update neighborhoods section
const updateNeighborhoods = (zipcode) => {
    const neighborhoods = getMockNeighborhoods(zipcode);
    const container = document.querySelector('.neighborhood-list');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to discover nearby neighborhoods.</p>';
        return;
    }
    
    container.innerHTML = neighborhoods.map(n => `
        <div class="neighborhood-item">
            <div class="neighborhood-name">${n.name}</div>
            <div class="neighborhood-distance">${n.distance}</div>
            <div class="neighborhood-description">${n.description}</div>
        </div>
    `).join('');
};

// Update schools section
const updateSchools = (zipcode) => {
    const schools = getMockSchools(zipcode);
    const container = document.querySelector('.schools-list');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to see local schools.</p>';
        return;
    }
    
    container.innerHTML = schools.map(s => `
        <div class="school-item">
            <div class="school-name">${s.name}</div>
            <div class="school-type">${s.type}</div>
            <div class="school-description">${s.description}</div>
        </div>
    `).join('');
};

// Update demographics section
const updateDemographics = (zipcode) => {
    const data = getDemographicData(zipcode);
    const primarySummary = document.querySelector('.primary-summary');
    const detailedSummary = document.querySelector('.detailed-summary');
    const contextSummary = document.querySelector('.context-summary');
    
    if (!zipcode) {
        primarySummary.textContent = 'Enter a zipcode to learn about the community.';
        detailedSummary.textContent = "We'll show you a detailed breakdown of who lives in this area.";
        contextSummary.textContent = "Once you enter a zipcode, we'll help you understand what these demographics mean for your family.";
        return;
    }
    
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
    primarySummary.textContent = `In this neighborhood, ${primaryGroup[0]} residents make up the ${describeProportion(primaryGroup[1])} of the community at ${formatNumber(primaryGroup[1])}%.`;

    // Generate detailed summary
    detailedSummary.textContent = `For every 100 people in this area, you'll find about ${
        sortedDemographics.map(([race, pct]) => 
            `${formatNumber(pct)} ${race}`
        ).join(', ').replace(/,([^,]*)$/, ' and$1')
    } residents.`;

    // Generate context summary
    const diversity = sortedDemographics[0][1] > 75 ? "less" : "more";
    contextSummary.textContent = `This is a ${diversity} diverse community compared to many other areas. ${
        diversity === "more" 
            ? "This means your child will have opportunities to interact with people from various backgrounds."
            : `With a strong ${sortedDemographics[0][0]} presence, your child will be exposed to rich cultural traditions and community values.`
    }`;
};

// Update housing resources section
const updateHousingResources = (zipcode) => {
    const resources = getMockHousingResources(zipcode);
    const container = document.querySelector('.housing-links');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to find housing resources.</p>';
        return;
    }
    
    container.innerHTML = resources.map(r => `
        <a href="${r.url}" target="_blank" class="housing-link">
            <i class="fas fa-external-link-alt"></i>
            <div>
                <div>${r.name}</div>
                <div class="housing-link-description">${r.description}</div>
            </div>
        </a>
    `).join('');
};

// Update all sections when zipcode changes
const updateAllSections = (zipcode) => {
    // Show loading state
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('loaded');
        if (zipcode && zipcode.length === 5) {
            section.classList.add('loading');
        }
    });

    // Simulate API delay
    setTimeout(() => {
        updateNeighborhoods(zipcode);
        updateSchools(zipcode);
        updateDemographics(zipcode);
        updateHousingResources(zipcode);

        // Remove loading state and show content
        document.querySelectorAll('.results-section').forEach(section => {
            section.classList.remove('loading');
            if (zipcode && zipcode.length === 5) {
                section.classList.add('loaded');
            }
        });
    }, 500);
};

// Handle zipcode input
document.getElementById('zipcode').addEventListener('input', (e) => {
    const zipcode = e.target.value;
    if (zipcode.length === 5) {
        updateAllSections(zipcode);
    } else if (zipcode.length === 0) {
        updateAllSections('');
    }
});

// Handle form submission
document.getElementById('family-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('results-page').scrollIntoView({ behavior: 'smooth' });
});

// Initialize with empty state
document.addEventListener('DOMContentLoaded', () => {
    updateAllSections('');
});
