document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.AutoInit();
    
    // Initialize Sortable
    const actionStepsList = document.getElementById('actionStepsList');
    const sortable = new Sortable(actionStepsList, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function(evt) {
            updateStepOrder();
        }
    });

    // Load initial action steps
    loadActionSteps();
});

function loadActionSteps() {
    fetch('/api/action-steps')
        .then(response => response.json())
        .then(steps => {
            const actionStepsList = document.getElementById('actionStepsList');
            actionStepsList.innerHTML = '';
            steps.forEach(step => {
                actionStepsList.appendChild(createStepElement(step));
            });
        })
        .catch(error => {
            M.toast({html: 'Error loading action steps'});
            console.error('Error:', error);
        });
}

function createStepElement(step) {
    const template = document.getElementById('action-step-template');
    const stepElement = template.content.cloneNode(true).querySelector('.action-step');
    
    stepElement.dataset.id = step.id;
    stepElement.querySelector('.step-title').textContent = step.description;
    stepElement.querySelector('.step-details').textContent = step.details || '';
    
    // Set urgency icon and class
    const urgencyIcon = stepElement.querySelector('.step-urgency i');
    urgencyIcon.textContent = getUrgencyIcon(step.urgency);
    stepElement.querySelector('.step-urgency').classList.add(`urgency-${step.urgency}`);
    
    // Set completion status
    const checkbox = stepElement.querySelector('.step-checkbox');
    checkbox.checked = step.completed;
    if (step.completed) {
        stepElement.classList.add('completed');
    }
    
    // Add event listeners
    checkbox.addEventListener('change', () => toggleStepCompletion(step.id, checkbox.checked));
    stepElement.querySelector('.edit-btn').addEventListener('click', () => editStep(step.id));
    
    return stepElement;
}

function getUrgencyIcon(urgency) {
    switch(urgency) {
        case 'urgent':
            return 'priority_high';
        case 'optional':
            return 'low_priority';
        default:
            return 'radio_button_unchecked';
    }
}

function generateActionPlan() {
    const focusArea = document.getElementById('focusArea').value;
    if (!focusArea) {
        M.toast({html: 'Please select a focus area'});
        return;
    }

    // Sample action steps based on focus area
    const actionSteps = {
        schools: [
            {description: 'Research local school performance metrics', urgency: 'urgent', details: 'Gather data on academic performance, graduation rates, and student engagement'},
            {description: 'Schedule meetings with school administrators', urgency: 'normal', details: 'Discuss current challenges and potential improvements'},
            {description: 'Identify key areas for improvement', urgency: 'normal', details: 'Based on data and discussions, prioritize areas that need attention'}
        ],
        community: [
            {description: 'Map existing community programs', urgency: 'urgent', details: 'Create a comprehensive list of current educational programs'},
            {description: 'Identify program gaps', urgency: 'normal', details: 'Analyze where new programs might be needed'},
            {description: 'Connect with community leaders', urgency: 'optional', details: 'Build relationships with key stakeholders'}
        ],
        resources: [
            {description: 'Create inventory of available resources', urgency: 'urgent', details: 'Document current educational resources and their utilization'},
            {description: 'Identify resource needs', urgency: 'normal', details: 'Determine what additional resources would be most beneficial'},
            {description: 'Develop resource sharing plan', urgency: 'optional', details: 'Create strategy for optimal resource distribution'}
        ]
    };

    // Add steps to database
    const steps = actionSteps[focusArea];
    Promise.all(steps.map((step, index) => 
        fetch('/api/action-steps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: step.description,
                urgency: step.urgency,
                details: step.details,
                order: index + 1
            })
        })
    ))
    .then(() => {
        loadActionSteps();
        M.toast({html: 'Action plan generated successfully'});
    })
    .catch(error => {
        M.toast({html: 'Error generating action plan'});
        console.error('Error:', error);
    });
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
    .catch(error => {
        M.toast({html: 'Error updating step'});
        console.error('Error:', error);
    });
}

function editStep(stepId) {
    const stepElement = document.querySelector(`.action-step[data-id="${stepId}"]`);
    const currentDescription = stepElement.querySelector('.step-title').textContent;
    const currentDetails = stepElement.querySelector('.step-details').textContent;
    
    // Create modal for editing
    const modalHtml = `
        <div id="edit-modal" class="modal">
            <div class="modal-content">
                <h4>Edit Step</h4>
                <div class="input-field">
                    <input type="text" id="edit-description" value="${currentDescription}">
                    <label for="edit-description" class="active">Description</label>
                </div>
                <div class="input-field">
                    <textarea id="edit-details" class="materialize-textarea">${currentDetails}</textarea>
                    <label for="edit-details" class="active">Details</label>
                </div>
                <div class="input-field">
                    <select id="edit-urgency">
                        <option value="urgent">Urgent</option>
                        <option value="normal">Normal</option>
                        <option value="optional">Optional</option>
                    </select>
                    <label>Urgency</label>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#!" class="modal-close waves-effect waves-red btn-flat">Cancel</a>
                <a href="#!" onclick="saveEdit(${stepId})" class="modal-close waves-effect waves-green btn-flat">Save</a>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and open modal
    const modal = M.Modal.init(document.getElementById('edit-modal'));
    modal.open();
    
    // Initialize select
    M.FormSelect.init(document.getElementById('edit-urgency'));
}

function saveEdit(stepId) {
    const description = document.getElementById('edit-description').value;
    const details = document.getElementById('edit-details').value;
    const urgency = document.getElementById('edit-urgency').value;
    
    fetch(`/api/action-steps/${stepId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: description,
            details: details,
            urgency: urgency
        })
    })
    .then(response => response.json())
    .then(() => {
        loadActionSteps();
        M.toast({html: 'Step updated successfully'});
    })
    .catch(error => {
        M.toast({html: 'Error updating step'});
        console.error('Error:', error);
    });
    
    // Remove modal from document
    document.getElementById('edit-modal').remove();
}

function addNewStep() {
    // Create modal for new step
    const modalHtml = `
        <div id="new-step-modal" class="modal">
            <div class="modal-content">
                <h4>Add New Step</h4>
                <div class="input-field">
                    <input type="text" id="new-description">
                    <label for="new-description">Description</label>
                </div>
                <div class="input-field">
                    <textarea id="new-details" class="materialize-textarea"></textarea>
                    <label for="new-details">Details</label>
                </div>
                <div class="input-field">
                    <select id="new-urgency">
                        <option value="urgent">Urgent</option>
                        <option value="normal" selected>Normal</option>
                        <option value="optional">Optional</option>
                    </select>
                    <label>Urgency</label>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#!" class="modal-close waves-effect waves-red btn-flat">Cancel</a>
                <a href="#!" onclick="saveNewStep()" class="modal-close waves-effect waves-green btn-flat">Add</a>
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Initialize and open modal
    const modal = M.Modal.init(document.getElementById('new-step-modal'));
    modal.open();
    
    // Initialize select
    M.FormSelect.init(document.getElementById('new-urgency'));
}

function saveNewStep() {
    const description = document.getElementById('new-description').value;
    const details = document.getElementById('new-details').value;
    const urgency = document.getElementById('new-urgency').value;
    
    fetch('/api/action-steps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: description,
            details: details,
            urgency: urgency,
            order: 999
        })
    })
    .then(response => response.json())
    .then(() => {
        loadActionSteps();
        M.toast({html: 'Step added successfully'});
    })
    .catch(error => {
        M.toast({html: 'Error adding step'});
        console.error('Error:', error);
    });
    
    // Remove modal from document
    document.getElementById('new-step-modal').remove();
}

function updateStepOrder() {
    const steps = Array.from(document.querySelectorAll('.action-step')).map((el, index) => ({
        id: parseInt(el.dataset.id),
        order: index + 1
    }));
    
    fetch('/api/action-steps/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(steps)
    })
    .catch(error => {
        M.toast({html: 'Error updating step order'});
        console.error('Error:', error);
    });
}
