/**
 * @jest-environment jsdom
 */

import ActionPlan from '../js/actionPlan.js';

describe('ActionPlan', () => {
    let actionPlan;
    let container;

    // Set up the DOM environment before each test
    beforeEach(() => {
        // Create a container with the required structure
        container = document.createElement('div');
        container.innerHTML = `
            <div class="action-plan">
                <div class="action-plan-header">
                    <h2 class="action-plan-title">Your Action Plan</h2>
                    <span class="action-plan-focus">Focus: Education</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <ul class="action-steps"></ul>
            </div>
        `;
        document.body.appendChild(container);
        
        // Initialize ActionPlan instance
        actionPlan = new ActionPlan();
    });

    // Clean up after each test
    afterEach(() => {
        document.body.removeChild(container);
    });

    // Test Group 1: Functionality Testing
    describe('Step Completion', () => {
        test('should mark a step as complete when clicking the complete button', () => {
            // Arrange
            const mockStep = {
                number: 1,
                title: 'Test Step',
                description: 'Test Description',
                completed: false
            };
            actionPlan.addStep(mockStep);
            
            // Act
            const completeButton = container.querySelector('.step-button');
            completeButton.click();
            
            // Assert
            const stepElement = container.querySelector('.action-step');
            expect(stepElement.classList.contains('completed')).toBe(true);
        });

        test('should update progress bar when marking steps complete', () => {
            // Arrange
            const mockSteps = [
                { number: 1, title: 'Step 1', description: 'Description 1' },
                { number: 2, title: 'Step 2', description: 'Description 2' }
            ];
            mockSteps.forEach(step => actionPlan.addStep(step));
            
            // Act
            const completeButton = container.querySelector('.step-button');
            completeButton.click();
            
            // Assert
            const progressFill = container.querySelector('.progress-fill');
            expect(progressFill.style.width).toBe('50%');
        });
    });

    // Test Group 2: Step Editing
    describe('Step Editing', () => {
        test('should display edit form when clicking edit button', () => {
            // Arrange
            actionPlan.addStep({
                number: 1,
                title: 'Original Title',
                description: 'Original Description'
            });
            
            // Act
            const editButton = container.querySelector('.step-button:last-child');
            editButton.click();
            
            // Assert
            const editForm = container.querySelector('.step-edit-form');
            expect(editForm).not.toBeNull();
        });

        test('should update step content after saving edits', () => {
            // Arrange
            actionPlan.addStep({
                number: 1,
                title: 'Original Title',
                description: 'Original Description'
            });
            
            // Act
            const editButton = container.querySelector('.step-button:last-child');
            editButton.click();
            
            const editForm = container.querySelector('.step-edit-form');
            const titleInput = editForm.querySelector('.edit-title');
            const descriptionInput = editForm.querySelector('.edit-description');
            
            titleInput.value = 'Updated Title';
            descriptionInput.value = 'Updated Description';
            
            const saveButton = editForm.querySelector('.save-edit');
            saveButton.click();
            
            // Assert
            const updatedTitle = container.querySelector('.step-title');
            const updatedDescription = container.querySelector('.step-description');
            expect(updatedTitle.textContent).toBe('Updated Title');
            expect(updatedDescription.textContent).toBe('Updated Description');
        });
    });

    // Test Group 3: Dynamic Updates
    describe('Next Steps Integration', () => {
        test('should update steps when receiving nextStepsUpdate event', () => {
            // Arrange
            const mockNextSteps = {
                focusArea: 'Community',
                steps: [
                    { title: 'New Step 1', description: 'New Description 1' },
                    { title: 'New Step 2', description: 'New Description 2' }
                ]
            };
            
            // Act
            document.dispatchEvent(new CustomEvent('nextStepsUpdate', {
                detail: mockNextSteps
            }));
            
            // Assert
            const steps = container.querySelectorAll('.action-step');
            expect(steps.length).toBe(2);
            expect(steps[0].querySelector('.step-title').textContent).toBe('New Step 1');
        });
    });

    // Test Group 4: Accessibility
    describe('Accessibility', () => {
        test('should handle keyboard navigation for step completion', () => {
            // Arrange
            actionPlan.addStep({
                number: 1,
                title: 'Test Step',
                description: 'Test Description'
            });
            
            // Act
            const completeButton = container.querySelector('.step-button');
            completeButton.focus();
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true
            });
            completeButton.dispatchEvent(enterEvent);
            
            // Assert
            const stepElement = container.querySelector('.action-step');
            expect(stepElement.classList.contains('completed')).toBe(true);
        });

        test('should handle space key for step completion', () => {
            // Arrange
            actionPlan.addStep({
                number: 1,
                title: 'Test Step',
                description: 'Test Description'
            });
            
            // Act
            const completeButton = container.querySelector('.step-button');
            completeButton.focus();
            const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                bubbles: true,
                cancelable: true
            });
            completeButton.dispatchEvent(spaceEvent);
            
            // Assert
            const stepElement = container.querySelector('.action-step');
            expect(stepElement.classList.contains('completed')).toBe(true);
        });
    });

    // Test Group 5: Event Communication
    describe('Event Communication', () => {
        test('should emit actionStepUpdate event when step is completed', () => {
            // Arrange
            const mockCallback = jest.fn();
            document.addEventListener('actionStepUpdate', mockCallback);
            
            actionPlan.addStep({
                number: 1,
                title: 'Test Step',
                description: 'Test Description'
            });
            
            // Act
            const completeButton = container.querySelector('.step-button');
            completeButton.click();
            
            // Assert
            expect(mockCallback).toHaveBeenCalled();
            const eventDetail = mockCallback.mock.calls[0][0].detail;
            expect(eventDetail.type).toBe('completion');
            
            // Cleanup
            document.removeEventListener('actionStepUpdate', mockCallback);
        });
    });
});
