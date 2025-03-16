// Helper functions
const formatNumber = (num) => {
    return Math.round(num);
};

const describeProportion = (percentage) => {
    if (percentage >= 75) return "vast majority";
    if (percentage >= 50) return "majority";
    if (percentage >= 30) return "significant portion";
    if (percentage >= 15) return "notable portion";
    return "small portion";
};

// Update neighborhoods section
const updateNeighborhoods = async (zipcode) => {
    const container = document.querySelector('.neighborhood-list');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to discover nearby neighborhoods.</p>';
        return;
    }

    try {
        const neighborhoods = await DataService.getNeighborhoods(zipcode);
        container.innerHTML = neighborhoods.map(n => `
            <div class="neighborhood-item">
                <div class="neighborhood-name">${n.name}</div>
                <div class="neighborhood-distance">${n.distance}</div>
                <div class="neighborhood-description">${n.description}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="error-text">Sorry, we couldn\'t load neighborhood data. Please try again later.</p>';
        console.error('Error updating neighborhoods:', error);
    }
};

// Update schools section
const updateSchools = async (zipcode) => {
    const container = document.querySelector('.schools-list');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to see local schools.</p>';
        return;
    }

    try {
        const schools = await DataService.getSchools(zipcode);
        container.innerHTML = schools.map(s => `
            <div class="school-item">
                <div class="school-name">${s.name}</div>
                <div class="school-type">${s.type}</div>
                <div class="school-description">${s.description}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="error-text">Sorry, we couldn\'t load school data. Please try again later.</p>';
        console.error('Error updating schools:', error);
    }
};

// Update demographics section
const updateDemographics = async (zipcode) => {
    const primarySummary = document.querySelector('.primary-summary');
    const detailedSummary = document.querySelector('.detailed-summary');
    const contextSummary = document.querySelector('.context-summary');
    
    if (!zipcode) {
        primarySummary.textContent = 'Enter a zipcode to learn about the community.';
        detailedSummary.textContent = "We'll show you a detailed breakdown of who lives in this area.";
        contextSummary.textContent = "Once you enter a zipcode, we'll help you understand what these demographics mean for your family.";
        return;
    }

    try {
        const data = await DataService.getDemographics(zipcode);
        
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
    } catch (error) {
        primarySummary.textContent = 'Sorry, we couldn\'t load demographic data. Please try again later.';
        detailedSummary.textContent = '';
        contextSummary.textContent = '';
        console.error('Error updating demographics:', error);
    }
};

// Update housing resources section
const updateHousingResources = async (zipcode) => {
    const container = document.querySelector('.housing-links');
    
    if (!zipcode) {
        container.innerHTML = '<p class="placeholder-text">Enter a zipcode to find housing resources.</p>';
        return;
    }

    try {
        const resources = await DataService.getHousing(zipcode);
        container.innerHTML = resources.map(r => `
            <a href="${r.url}" target="_blank" class="housing-link">
                <i class="fas fa-external-link-alt"></i>
                <div>
                    <div>${r.name}</div>
                    <div class="housing-link-description">${r.description}</div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="error-text">Sorry, we couldn\'t load housing resources. Please try again later.</p>';
        console.error('Error updating housing resources:', error);
    }
};

// Update all sections when zipcode changes
const updateAllSections = async (zipcode) => {
    // Show loading state
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('loaded');
        if (zipcode && zipcode.length === 5) {
            section.classList.add('loading');
        }
    });

    try {
        // Update all sections in parallel
        await Promise.all([
            updateNeighborhoods(zipcode),
            updateSchools(zipcode),
            updateDemographics(zipcode),
            updateHousingResources(zipcode)
        ]);

        // Remove loading state and show content
        document.querySelectorAll('.results-section').forEach(section => {
            section.classList.remove('loading');
            if (zipcode && zipcode.length === 5) {
                section.classList.add('loaded');
            }
        });
    } catch (error) {
        console.error('Error updating sections:', error);
        // Remove loading state even if there's an error
        document.querySelectorAll('.results-section').forEach(section => {
            section.classList.remove('loading');
        });
    }
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
