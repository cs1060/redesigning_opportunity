export default class ActionPlan {
    constructor() {
        this.steps = [];
        this.focusArea = '';
        this.container = document.querySelector('.action-plan');
        this.stepsList = this.container.querySelector('.action-steps');
        this.progressBar = this.container.querySelector('.progress-fill');
        this.focusAreaElement = this.container.querySelector('.action-plan-focus');
        
        // Bind methods
        this.handleStepClick = this.handleStepClick.bind(this);
        this.handleEditStep = this.handleEditStep.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.stepsList.addEventListener('click', this.handleStepClick);
        this.stepsList.addEventListener('keydown', this.handleKeyDown);
        
        // Custom event listeners for external updates
        document.addEventListener('nextStepsUpdate', (event) => {
            this.updateStepsFromNextSteps(event.detail);
        });
    }

    handleKeyDown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        
        const button = event.target.closest('.step-button');
        if (!button) return;

        event.preventDefault();
        const stepElement = button.closest('.action-step');
        const stepIndex = Array.from(this.stepsList.children).indexOf(stepElement);

        if (button.querySelector('.fa-edit')) {
            this.handleEditStep(stepIndex);
        } else if (button.querySelector('.fa-square') || button.querySelector('.fa-check')) {
            this.toggleStepCompletion(stepIndex);
        }
    }

    handleStepClick(event) {
        const button = event.target.closest('.step-button');
        if (!button) return;

        const stepElement = button.closest('.action-step');
        const stepIndex = Array.from(this.stepsList.children).indexOf(stepElement);

        if (button.querySelector('.fa-edit')) {
            this.handleEditStep(stepIndex);
        } else if (button.querySelector('.fa-square') || button.querySelector('.fa-check')) {
            this.toggleStepCompletion(stepIndex);
        }
    }

    toggleStepCompletion(stepIndex) {
        const stepElement = this.stepsList.children[stepIndex];
        const isCompleted = stepElement.classList.toggle('completed');
        const button = stepElement.querySelector('.step-button');
        const icon = button.querySelector('i');

        if (isCompleted) {
            icon.className = 'fas fa-check';
            button.innerHTML = '<i class="fas fa-check"></i> Completed';
        } else {
            icon.className = 'far fa-square';
            button.innerHTML = '<i class="far fa-square"></i> Mark Complete';
        }

        this.updateProgress();
        this.notifyStepUpdate(stepIndex, isCompleted);
    }

    handleEditStep(stepIndex) {
        const stepElement = this.stepsList.children[stepIndex];
        const titleElement = stepElement.querySelector('.step-title');
        const descriptionElement = stepElement.querySelector('.step-description');

        // Create edit form
        const editForm = document.createElement('div');
        editForm.className = 'step-edit-form';
        editForm.innerHTML = `
            <div class="form-group">
                <input type="text" class="edit-title" value="${titleElement.textContent}" />
            </div>
            <div class="form-group">
                <textarea class="edit-description">${descriptionElement.textContent.trim()}</textarea>
            </div>
            <div class="edit-actions">
                <button class="save-edit">Save</button>
                <button class="cancel-edit">Cancel</button>
            </div>
        `;

        // Hide existing content
        titleElement.style.display = 'none';
        descriptionElement.style.display = 'none';

        // Insert form after header
        stepElement.querySelector('.action-step-header').after(editForm);

        // Add event listeners for save/cancel
        editForm.querySelector('.save-edit').addEventListener('click', () => {
            const newTitle = editForm.querySelector('.edit-title').value;
            const newDescription = editForm.querySelector('.edit-description').value;

            titleElement.textContent = newTitle;
            descriptionElement.textContent = newDescription;

            // Show original elements
            titleElement.style.display = '';
            descriptionElement.style.display = '';

            // Remove edit form
            editForm.remove();

            // Notify about the edit
            this.notifyStepEdit(stepIndex, { title: newTitle, description: newDescription });
        });

        editForm.querySelector('.cancel-edit').addEventListener('click', () => {
            // Show original elements
            titleElement.style.display = '';
            descriptionElement.style.display = '';

            // Remove edit form
            editForm.remove();
        });
    }

    updateProgress() {
        const totalSteps = this.stepsList.children.length;
        const completedSteps = this.stepsList.querySelectorAll('.action-step.completed').length;
        const progress = (completedSteps / totalSteps) * 100;
        
        this.progressBar.style.width = `${progress}%`;
    }

    updateStepsFromNextSteps(nextStepsData) {
        // Clear existing steps
        this.stepsList.innerHTML = '';
        
        // Update focus area if provided
        if (nextStepsData.focusArea) {
            this.focusArea = nextStepsData.focusArea;
            this.focusAreaElement.textContent = `Focus: ${this.focusArea}`;
        }

        // Add new steps
        nextStepsData.steps.forEach((step, index) => {
            this.addStep({
                number: index + 1,
                title: step.title,
                description: step.description,
                completed: step.completed || false
            });
        });

        this.updateProgress();
    }

    addStep({ number, title, description, completed = false }) {
        const stepElement = document.createElement('li');
        stepElement.className = `action-step${completed ? ' completed' : ''}`;
        
        stepElement.innerHTML = `
            <div class="action-step-header">
                <span class="step-number">${number}</span>
                <h3 class="step-title">${title}</h3>
            </div>
            <p class="step-description">
                ${description}
            </p>
            <div class="step-actions">
                <button class="step-button">
                    <i class="${completed ? 'fas fa-check' : 'far fa-square'}"></i>
                    ${completed ? 'Completed' : 'Mark Complete'}
                </button>
                <button class="step-button">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
            </div>
        `;

        this.stepsList.appendChild(stepElement);
    }

    notifyStepUpdate(stepIndex, completed) {
        // Create and dispatch custom event for step completion update
        const event = new CustomEvent('actionStepUpdate', {
            detail: {
                stepIndex,
                completed,
                type: 'completion'
            }
        });
        document.dispatchEvent(event);
    }

    notifyStepEdit(stepIndex, updates) {
        // Create and dispatch custom event for step edit
        const event = new CustomEvent('actionStepUpdate', {
            detail: {
                stepIndex,
                updates,
                type: 'edit'
            }
        });
        document.dispatchEvent(event);
    }
}
