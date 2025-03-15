// Load action steps when the page loads
document.addEventListener('DOMContentLoaded', loadActionSteps);

function loadActionSteps() {
    fetch('/api/action-steps')
        .then(response => response.json())
        .then(steps => {
            const actionPlanList = document.getElementById('actionPlanList');
            actionPlanList.innerHTML = '';
            steps.forEach(step => {
                actionPlanList.appendChild(createStepElement(step));
            });
        })
        .catch(error => console.error('Error loading action steps:', error));
}

function createStepElement(step) {
    const div = document.createElement('div');
    div.className = `list-group-item action-step ${step.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <input type="checkbox" class="form-check-input me-3" 
                    ${step.completed ? 'checked' : ''} 
                    onchange="toggleStepCompletion(${step.id}, this.checked)">
                <span class="step-content" id="step-content-${step.id}">${step.description}</span>
            </div>
            <div class="step-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editStep(${step.id})">
                    Edit
                </button>
            </div>
        </div>
    `;
    return div;
}

function generateActionPlan() {
    const focusArea = document.getElementById('focusArea').value;
    if (focusArea === 'Select a focus area') {
        alert('Please select a focus area first');
        return;
    }

    // Sample action steps based on focus area
    const actionSteps = {
        schools: [
            'Research local school performance metrics',
            'Schedule meetings with school administrators',
            'Identify key areas for improvement'
        ],
        community: [
            'Map existing community programs',
            'Identify program gaps',
            'Connect with community leaders'
        ],
        resources: [
            'Create inventory of available resources',
            'Identify resource needs',
            'Develop resource sharing plan'
        ]
    };

    // Add steps to database
    const steps = actionSteps[focusArea];
    steps.forEach((description, index) => {
        fetch('/api/action-steps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                order: index + 1
            })
        });
    });

    // Reload the action steps
    setTimeout(loadActionSteps, 500);
}

function toggleStepCompletion(stepId, completed) {
    fetch(`/api/action-steps/${stepId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: completed })
    })
    .then(response => response.json())
    .then(() => loadActionSteps())
    .catch(error => console.error('Error updating step:', error));
}

function editStep(stepId) {
    const contentElement = document.getElementById(`step-content-${stepId}`);
    const currentContent = contentElement.textContent;
    const newContent = prompt('Edit step:', currentContent);
    
    if (newContent && newContent !== currentContent) {
        fetch(`/api/action-steps/${stepId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: newContent })
        })
        .then(response => response.json())
        .then(() => loadActionSteps())
        .catch(error => console.error('Error updating step:', error));
    }
}

function addNewStep() {
    const description = prompt('Enter new step description:');
    if (description) {
        fetch('/api/action-steps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                order: 999 // Will be added at the end
            })
        })
        .then(response => response.json())
        .then(() => loadActionSteps())
        .catch(error => console.error('Error adding step:', error));
    }
}
