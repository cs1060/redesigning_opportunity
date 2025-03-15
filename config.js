// Configuration settings
const CONFIG = {
    // Set to true to use OpenAI API, false to use mock data
    useOpenAI: false,
    
    // OpenAI API settings
    openAI: {
        apiKey: '', // Add your API key here
        model: 'gpt-4',
        temperature: 0.7
    },
    
    // API endpoint (replace with your actual backend endpoint)
    apiEndpoint: 'http://localhost:3000/api'
};

module.exports = CONFIG;
