// Configuration settings
const CONFIG = {
    // Set to true to use OpenAI API, false to use mock data
    useOpenAI: false,
    
    // OpenAI API settings
    openAI: {
        apiKey: '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', // Add your API key here
        model: 'gpt-4o-mini',
        temperature: 0.7
    },
    
    // API endpoint (replace with your actual backend endpoint)
    apiEndpoint: 'http://localhost:3000/api'
};

module.exports = CONFIG;
