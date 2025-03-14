// Initialize chart with accessibility-friendly colors
let demographicsChart = null;
const chartColors = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#059669', // Green
    '#d97706', // Orange
    '#7c3aed'  // Purple
];

// Language support
const translations = {
    en: {
        title: 'Building Your Child\'s Future',
        submit: 'Continue',
        // Add more translations as needed
    },
    es: {
        title: 'Construyendo el Futuro de tu Hijo',
        submit: 'Continuar',
    },
    fr: {
        title: 'Construire l\'Avenir de Votre Enfant',
        submit: 'Continuer',
    }
};

// Language switcher
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        document.documentElement.lang = lang;
        updateLanguage(lang);
        
        // Update ARIA pressed state
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.setAttribute('aria-pressed', b === e.target);
        });
    });
});

function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Voice input support
let recognition = null;
try {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
} catch (e) {
    console.log('Speech recognition not supported');
}

const voiceInputBtn = document.querySelector('.voice-input-btn');
if (voiceInputBtn && recognition) {
    voiceInputBtn.addEventListener('click', toggleVoiceInput);
}

let activeInput = null;

function toggleVoiceInput() {
    if (!recognition) return;

    if (recognition.started) {
        recognition.stop();
        voiceInputBtn.classList.remove('active');
        voiceInputBtn.setAttribute('aria-pressed', 'false');
    } else {
        activeInput = document.activeElement;
        if (!activeInput || !activeInput.tagName.match(/input|select|textarea/i)) {
            activeInput = document.querySelector('input:not([type="file"])');
        }
        
        if (activeInput) {
            recognition.start();
            voiceInputBtn.classList.add('active');
            voiceInputBtn.setAttribute('aria-pressed', 'true');
        }
    }
}

recognition?.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    if (activeInput) {
        activeInput.value = transcript;
        activeInput.dispatchEvent(new Event('input'));
    }
});

recognition?.addEventListener('end', () => {
    voiceInputBtn.classList.remove('active');
    voiceInputBtn.setAttribute('aria-pressed', 'false');
});

// File upload handling
document.getElementById('file-input')?.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = parseCSV(e.target.result);
                fillFormWithData(data);
            } catch (error) {
                showError('Error reading CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    } else {
        showError('Please upload a valid CSV file.');
    }
}

// Form validation and error handling
const form = document.getElementById('family-form');
form?.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
        document.getElementById('demographics-page').scrollIntoView({ behavior: 'smooth' });
    }
}

function validateForm() {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value) {
            showError(`Please fill out ${input.previousElementSibling.textContent}`, input);
            isValid = false;
        } else if (input.id === 'zipcode' && !/^\d{5}$/.test(input.value)) {
            showError('Please enter a valid 5-digit zipcode', input);
            isValid = false;
        }
    });
    
    return isValid;
}

function showError(message, input) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    const existing = input.parentElement.querySelector('.error-message');
    if (existing) {
        existing.remove();
    }
    
    input.parentElement.appendChild(errorDiv);
    input.setAttribute('aria-invalid', 'true');
}

// Demographics visualization
const getDemographicData = async (zipcode) => {
    // This would be replaced with real API call
    return {
        'White': Math.random() * 100,
        'Black': Math.random() * 100,
        'Hispanic': Math.random() * 100,
        'Asian': Math.random() * 100,
        'Other': Math.random() * 100
    };
};

const updateDemographicsChart = async (zipcode) => {
    const data = await getDemographicData(zipcode);
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Population Percentage',
                data: Object.values(data),
                backgroundColor: chartColors,
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
    
    // Update table view
    updateDemographicsTable(data);
    
    // Update text summary for screen readers
    updateDemographicsSummary(data, zipcode);
};

function updateDemographicsTable(data) {
    const tbody = document.querySelector('#demographicsTable tbody');
    tbody.innerHTML = '';
    
    Object.entries(data).forEach(([race, percentage]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${race}</td>
            <td>${percentage.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateDemographicsSummary(data, zipcode) {
    const summary = document.querySelector('.demographics-summary');
    const summaryText = `
        Demographic breakdown for zipcode ${zipcode}:
        ${Object.entries(data)
            .map(([race, percentage]) => `${race}: ${percentage.toFixed(1)}%`)
            .join(', ')}
    `;
    summary.textContent = summaryText;
}

// Toggle between chart and table view
const viewToggleBtn = document.querySelector('.view-toggle');
viewToggleBtn?.addEventListener('click', () => {
    const chartContainer = document.querySelector('.chart-container');
    const tableContainer = document.querySelector('.table-container');
    const isShowingChart = !chartContainer.hidden;
    
    chartContainer.hidden = isShowingChart;
    tableContainer.hidden = !isShowingChart;
    viewToggleBtn.textContent = isShowingChart ? 'Switch to Chart View' : 'Switch to Table View';
});

// Handle zipcode input
document.getElementById('zipcode')?.addEventListener('input', (e) => {
    const zipcode = e.target.value;
    if (/^\d{5}$/.test(zipcode)) {
        updateDemographicsChart(zipcode);
    }
});

// Initialize with empty data
document.addEventListener('DOMContentLoaded', () => {
    updateDemographicsChart('00000');
});
