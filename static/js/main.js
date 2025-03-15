// Accessibility Controls
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessibilityControls();
    loadActionSteps();
    initializeKeyboardNavigation();
});

// Text-to-Speech Setup
const speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Accessibility Control Functions
function initializeAccessibilityControls() {
    // High Contrast Toggle
    document.getElementById('high-contrast-toggle').addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        this.setAttribute('aria-pressed', document.body.classList.contains('high-contrast'));
        announceChange('High contrast mode ' + 
            (document.body.classList.contains('high-contrast') ? 'enabled' : 'disabled'));
    });

    // Simplified View Toggle
    document.getElementById('simplified-view-toggle').addEventListener('click', function() {
        document.body.classList.toggle('simplified-view');
        this.setAttribute('aria-pressed', document.body.classList.contains('simplified-view'));
        loadActionSteps(document.body.classList.contains('simplified-view'));
        announceChange('Simplified view ' + 
            (document.body.classList.contains('simplified-view') ? 'enabled' : 'disabled'));
    });

    // Text Size Controls
    document.getElementById('text-size-increase').addEventListener('click', function() {
        changeTextSize(1);
    });

    document.getElementById('text-size-decrease').addEventListener('click', function() {
        changeTextSize(-1);
    });
}

function changeTextSize(change) {
    const root = document.documentElement;
    const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--text-size-base'));
    const newSize = Math.max(12, Math.min(24, currentSize + change));
    root.style.setProperty('--text-size-base', `${newSize}px`);
    announceChange(`Text size changed to ${newSize} pixels`);
}

// Screen Reader Announcements
function announceChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Keyboard Navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.classList.contains('step-checkbox')) {
                e.preventDefault();
                e.target.click();
            }
        }

        // Alt + number keys for quick navigation
        if (e.altKey && !isNaN(e.key)) {
            e.preventDefault();
            const sections = document.querySelectorAll('section');
            const index = parseInt(e.key) - 1;
            if (sections[index]) {
                sections[index].scrollIntoView();
                sections[index].querySelector('h2').focus();
            }
        }
    });
}

// Action Steps Management
function loadActionSteps(simplified = false) {
    const url = `/api/action-steps${simplified ? '?simplified=true' : ''}`;
    fetch(url)
        .then(response => response.json())
        .then(steps => {
            const container = document.getElementById('action-steps-container');
            container.innerHTML = '';
            steps.forEach(step => {
                container.appendChild(createStepElement(step));
            });
            announceChange('Action steps loaded');
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to load action steps. Please try again.');
        });
}

function createStepElement(step) {
    const template = document.getElementById('action-step-template');
    const stepElement = template.content.cloneNode(true).querySelector('.action-step');
    
    const checkbox = stepElement.querySelector('.step-checkbox');
    const label = stepElement.querySelector('.step-label');
    const details = stepElement.querySelector('.step-details');
    
    // Set unique IDs for accessibility
    const stepId = `step-${step.id}`;
    checkbox.id = stepId;
    label.htmlFor = stepId;
    
    // Set content
    label.textContent = step.description;
    details.textContent = step.details || '';
    checkbox.checked = step.completed;
    
    if (step.completed) {
        stepElement.classList.add('completed');
    }
    
    // Add event listeners
    checkbox.addEventListener('change', () => toggleStepCompletion(step.id, checkbox.checked));
    stepElement.querySelector('.edit-btn').addEventListener('click', () => editStep(step));
    stepElement.querySelector('.speak-btn').addEventListener('click', () => speakStep(step));
    
    // Set ARIA attributes
    stepElement.setAttribute('aria-labelledby', stepId);
    details.setAttribute('aria-label', `Details for step: ${step.description}`);
    
    return stepElement;
}

function speakStep(step) {
    if (currentUtterance) {
        speechSynthesis.cancel();
    }
    
    const text = `Step: ${step.description}. ${step.details || ''}`;
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 0.9; // Slightly slower for better comprehension
    currentUtterance.pitch = 1;
    
    speechSynthesis.speak(currentUtterance);
}

function toggleStepCompletion(stepId, completed) {
    fetch(`/api/action-steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: completed })
    })
    .then(response => response.json())
    .then(() => {
        loadActionSteps(document.body.classList.contains('simplified-view'));
        announceChange(`Step marked as ${completed ? 'completed' : 'not completed'}`);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Failed to update step. Please try again.');
    });
}

function editStep(step) {
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    
    // Set form values
    document.getElementById('editDescription').value = step.description;
    document.getElementById('editDetails').value = step.details || '';
    document.getElementById('editDifficulty').value = step.difficulty;
    
    // Store step ID for save function
    document.getElementById('editModal').dataset.stepId = step.id;
    
    modal.show();
}

function saveEdit() {
    const modal = document.getElementById('editModal');
    const stepId = modal.dataset.stepId;
    
    const data = {
        description: document.getElementById('editDescription').value,
        details: document.getElementById('editDetails').value,
        difficulty: document.getElementById('editDifficulty').value
    };
    
    fetch(`/api/action-steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(() => {
        bootstrap.Modal.getInstance(modal).hide();
        loadActionSteps(document.body.classList.contains('simplified-view'));
        announceChange('Step updated successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Failed to save changes. Please try again.');
    });
}

function generateActionPlan() {
    const focusArea = document.getElementById('focusArea').value;
    if (!focusArea) {
        showError('Please select a focus area');
        return;
    }

    const actionSteps = {
        schools: [
            { description: 'Research local school performance metrics', details: 'Gather data on academic performance, graduation rates, and student engagement', difficulty: 'medium' },
            { description: 'Schedule meetings with school administrators', details: 'Discuss current challenges and potential improvements', difficulty: 'easy' },
            { description: 'Identify key areas for improvement', details: 'Based on data and discussions, prioritize areas that need attention', difficulty: 'hard' }
        ],
        community: [
            { description: 'Map existing community programs', details: 'Create a comprehensive list of current educational programs', difficulty: 'medium' },
            { description: 'Identify program gaps', details: 'Analyze where new programs might be needed', difficulty: 'medium' },
            { description: 'Connect with community leaders', details: 'Build relationships with key stakeholders', difficulty: 'easy' }
        ],
        resources: [
            { description: 'Create inventory of available resources', details: 'Document current educational resources and their utilization', difficulty: 'easy' },
            { description: 'Identify resource needs', details: 'Determine what additional resources would be most beneficial', difficulty: 'medium' },
            { description: 'Develop resource sharing plan', details: 'Create strategy for optimal resource distribution', difficulty: 'hard' }
        ]
    };

    Promise.all(actionSteps[focusArea].map((step, index) => 
        fetch('/api/action-steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: step.description,
                details: step.details,
                difficulty: step.difficulty,
                order: index + 1
            })
        })
    ))
    .then(() => {
        loadActionSteps(document.body.classList.contains('simplified-view'));
        announceChange('Action plan generated successfully');
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Failed to generate action plan. Please try again.');
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;
    
    const container = document.querySelector('main');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}
