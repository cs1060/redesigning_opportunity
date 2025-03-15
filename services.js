// Mock data providers
const mockData = {
    neighborhoods: (zipcode) => [
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
    ],

    schools: (zipcode) => [
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
    ],

    demographics: (zipcode) => ({
        'Hispanic': Math.random() * 100,
        'White': Math.random() * 100,
        'Black': Math.random() * 100,
        'Asian': Math.random() * 100,
        'Other': Math.random() * 100
    }),

    housing: (zipcode) => [
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
    ]
};

// OpenAI API providers
const apiData = {
    async neighborhoods(zipcode) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/neighborhoods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zipcode })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return data.neighborhoods;
        } catch (error) {
            console.error('Failed to fetch neighborhood data:', error);
            return mockData.neighborhoods(zipcode); // Fallback to mock data
        }
    },

    async schools(zipcode) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/schools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zipcode })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return data.schools;
        } catch (error) {
            console.error('Failed to fetch school data:', error);
            return mockData.schools(zipcode); // Fallback to mock data
        }
    },

    async demographics(zipcode) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/demographics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zipcode })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return data.demographics;
        } catch (error) {
            console.error('Failed to fetch demographic data:', error);
            return mockData.demographics(zipcode); // Fallback to mock data
        }
    },

    async housing(zipcode) {
        try {
            const response = await fetch(`${CONFIG.apiEndpoint}/housing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zipcode })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            return data.housing;
        } catch (error) {
            console.error('Failed to fetch housing data:', error);
            return mockData.housing(zipcode); // Fallback to mock data
        }
    }
};

// Service layer that decides whether to use mock or API data
const DataService = {
    async getNeighborhoods(zipcode) {
        return CONFIG.useOpenAI 
            ? await apiData.neighborhoods(zipcode)
            : mockData.neighborhoods(zipcode);
    },

    async getSchools(zipcode) {
        return CONFIG.useOpenAI 
            ? await apiData.schools(zipcode)
            : mockData.schools(zipcode);
    },

    async getDemographics(zipcode) {
        return CONFIG.useOpenAI 
            ? await apiData.demographics(zipcode)
            : mockData.demographics(zipcode);
    },

    async getHousing(zipcode) {
        return CONFIG.useOpenAI 
            ? await apiData.housing(zipcode)
            : mockData.housing(zipcode);
    }
};
