/**
 * NeighborhoodAnalysis.js
 * 
 * This class handles the neighborhood analysis panel functionality,
 * including updating scores, displaying factor ratings, and handling
 * user interactions with the ratings.
 */

class NeighborhoodAnalysis {
    /**
     * Create a new NeighborhoodAnalysis
     * @param {string} containerId - The ID of the container element
     */
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        this.opportunityScore = 0;
        this.factors = {
            schoolQuality: 0,
            safety: 0,
            healthcare: 0,
            amenities: 0,
            housing: 0,
            transportation: 0,
            jobOpportunities: 0 // Added based on the job opportunities section in memories
        };
        
        this.init();
    }

    /**
     * Initialize the neighborhood analysis panel
     */
    init() {
        if (!this.container) {
            console.error('Neighborhood analysis container not found');
            return;
        }

        // Add event listeners for factor rating clicks
        const factorItems = this.container.querySelectorAll('.factor-item');
        factorItems.forEach(item => {
            const factorIcons = item.querySelectorAll('.factor-icon');
            factorIcons.forEach((icon, index) => {
                icon.addEventListener('click', () => {
                    this.updateFactorRating(item, index + 1);
                });
            });
        });
    }

    /**
     * Update the neighborhood analysis with data
     * @param {Object} data - Neighborhood data including opportunity score and factors
     */
    updateAnalysis(data) {
        if (!data) return;
        
        // Update opportunity score
        this.opportunityScore = data.opportunityScore || 0;
        const scoreElement = this.container.querySelector('.score-value');
        if (scoreElement) {
            scoreElement.textContent = `${this.opportunityScore}/10`;
            
            // Update score circle color based on score
            const scoreCircle = this.container.querySelector('.score-circle');
            if (scoreCircle) {
                // Remove existing color classes
                scoreCircle.classList.remove('low-score', 'medium-score', 'high-score');
                
                // Add appropriate color class
                if (this.opportunityScore <= 3) {
                    scoreCircle.classList.add('low-score');
                } else if (this.opportunityScore <= 7) {
                    scoreCircle.classList.add('medium-score');
                } else {
                    scoreCircle.classList.add('high-score');
                }
            }
        }
        
        // Update factors
        if (data.factors) {
            this.factors = { ...this.factors, ...data.factors };
            
            // Update UI for each factor
            Object.entries(this.factors).forEach(([factor, rating]) => {
                this.updateFactorUI(factor, rating);
            });
        }
    }
    
    /**
     * Update the UI for a specific factor
     * @param {string} factor - The factor name
     * @param {number} rating - The rating (1-10)
     */
    updateFactorUI(factor, rating) {
        // Convert camelCase to readable format
        const readableFactor = factor.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        
        // Find the factor item
        const factorItems = this.container.querySelectorAll('.factor-item');
        let factorItem = null;
        
        factorItems.forEach(item => {
            const nameElement = item.querySelector('.factor-name');
            if (nameElement && nameElement.textContent.trim() === readableFactor) {
                factorItem = item;
            }
        });
        
        if (!factorItem) return;
        
        // Update score text
        const scoreElement = factorItem.querySelector('.factor-score');
        if (scoreElement) {
            scoreElement.textContent = `${rating}/10`;
        }
        
        // Update icons
        const icons = factorItem.querySelectorAll('.factor-icon');
        icons.forEach((icon, index) => {
            if (index < rating) {
                icon.classList.remove('inactive');
            } else {
                icon.classList.add('inactive');
            }
        });
    }
    
    /**
     * Update a factor rating based on user click
     * @param {Element} factorItem - The factor item element
     * @param {number} rating - The new rating (1-10)
     */
    updateFactorRating(factorItem, rating) {
        // Get factor name
        const nameElement = factorItem.querySelector('.factor-name');
        if (!nameElement) return;
        
        const readableFactor = nameElement.textContent.trim();
        
        // Convert to camelCase for internal storage
        const camelCaseFactor = readableFactor
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
                index === 0 ? letter.toLowerCase() : letter.toUpperCase()
            )
            .replace(/\s+/g, '');
        
        // Update internal state
        this.factors[camelCaseFactor] = rating;
        
        // Update UI
        this.updateFactorUI(camelCaseFactor, rating);
        
        // Recalculate opportunity score (simple average for now)
        const factorValues = Object.values(this.factors).filter(val => val > 0);
        if (factorValues.length > 0) {
            const sum = factorValues.reduce((a, b) => a + b, 0);
            this.opportunityScore = Math.round(sum / factorValues.length);
            
            // Update opportunity score in UI
            const scoreElement = this.container.querySelector('.score-value');
            if (scoreElement) {
                scoreElement.textContent = `${this.opportunityScore}/10`;
            }
        }
        
        // Dispatch event for other components to react to the change
        const event = new CustomEvent('factorRatingChanged', {
            detail: {
                factor: camelCaseFactor,
                rating: rating,
                opportunityScore: this.opportunityScore
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Add job opportunities data to the analysis panel
     * @param {Array} jobOpportunities - Array of job opportunity data
     */
    addJobOpportunities(jobOpportunities) {
        if (!jobOpportunities || !jobOpportunities.length) return;
        
        // Check if job opportunities section already exists
        let jobSection = this.container.querySelector('.job-opportunities');
        
        if (!jobSection) {
            // Create job opportunities section
            jobSection = document.createElement('div');
            jobSection.className = 'job-opportunities';
            
            const heading = document.createElement('h4');
            heading.textContent = 'Job Opportunities';
            jobSection.appendChild(heading);
            
            // Add to container
            this.container.appendChild(jobSection);
        } else {
            // Clear existing content except heading
            const heading = jobSection.querySelector('h4');
            jobSection.innerHTML = '';
            jobSection.appendChild(heading);
        }
        
        // Add job sectors
        jobOpportunities.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.className = 'job-item';
            
            const jobHeader = document.createElement('div');
            jobHeader.className = 'job-header';
            
            const jobName = document.createElement('span');
            jobName.className = 'job-name';
            jobName.textContent = job.sector;
            
            const jobGrowth = document.createElement('span');
            jobGrowth.className = 'job-growth';
            jobGrowth.textContent = `${job.growthRate}% growth`;
            
            jobHeader.appendChild(jobName);
            jobHeader.appendChild(jobGrowth);
            
            const jobSalary = document.createElement('div');
            jobSalary.className = 'job-salary';
            jobSalary.textContent = `Median salary: $${job.medianSalary}`;
            
            const jobDescription = document.createElement('div');
            jobDescription.className = 'job-description';
            jobDescription.textContent = job.description;
            
            jobItem.appendChild(jobHeader);
            jobItem.appendChild(jobSalary);
            jobItem.appendChild(jobDescription);
            
            // Add resources if available
            if (job.resources && job.resources.length > 0) {
                const resourcesContainer = document.createElement('div');
                resourcesContainer.className = 'job-resources';
                
                const resourcesTitle = document.createElement('div');
                resourcesTitle.className = 'job-resources-title';
                resourcesTitle.textContent = 'Career Resources:';
                resourcesContainer.appendChild(resourcesTitle);
                
                job.resources.forEach(resource => {
                    const resourceLink = document.createElement('a');
                    resourceLink.className = 'job-resource-link';
                    resourceLink.href = resource.url;
                    resourceLink.target = '_blank';
                    resourceLink.textContent = resource.name;
                    resourceLink.title = resource.description;
                    resourcesContainer.appendChild(resourceLink);
                });
                
                jobItem.appendChild(resourcesContainer);
            }
            
            jobSection.appendChild(jobItem);
        });
        
        // Add personalized advice section
        const income = document.getElementById('income')?.value || 75000;
        const hasChildren = document.getElementById('child-name')?.value ? true : false;
        const advice = this.generateJobOpportunityAdvice(income, hasChildren);
        
        const adviceContainer = document.createElement('div');
        adviceContainer.className = 'job-advice';
        adviceContainer.textContent = advice;
        jobSection.appendChild(adviceContainer);
        
        // Add major job search platforms as mentioned in the memories
        const platformsContainer = document.createElement('div');
        platformsContainer.className = 'job-platforms';
        
        const platforms = [
            { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', icon: 'fab fa-linkedin' },
            { name: 'Indeed', url: 'https://www.indeed.com', icon: 'fas fa-search' },
            { name: 'Glassdoor', url: 'https://www.glassdoor.com', icon: 'fas fa-door-open' },
            { name: 'USAJobs', url: 'https://www.usajobs.gov', icon: 'fas fa-flag-usa' }
        ];
        
        platforms.forEach(platform => {
            const platformLink = document.createElement('a');
            platformLink.className = 'job-platform-link';
            platformLink.href = platform.url;
            platformLink.target = '_blank';
            
            const icon = document.createElement('i');
            icon.className = platform.icon;
            platformLink.appendChild(icon);
            
            const text = document.createTextNode(platform.name);
            platformLink.appendChild(text);
            
            platformsContainer.appendChild(platformLink);
        });
        
        jobSection.appendChild(platformsContainer);
    }
    
    /**
     * Generate personalized job opportunity advice
     * @param {number} income - Household income
     * @param {boolean} hasChildren - Whether the family has children
     * @returns {string} Personalized advice
     */
    generateJobOpportunityAdvice(income, hasChildren) {
        let advice = '';
        
        // Income-based advice
        if (income < 30000) {
            advice = 'Consider job training programs in healthcare or technical fields to increase earning potential. Look for employers offering tuition assistance.';
        } else if (income < 60000) {
            advice = 'Your income level provides stability, but advancing skills in technology or specialized trades could significantly increase earnings.';
        } else if (income < 100000) {
            advice = 'Your solid income allows for career flexibility. Consider opportunities that balance work-life needs with growth potential.';
        } else {
            advice = 'Your strong income position allows for strategic career moves. Consider leadership roles or entrepreneurial opportunities.';
        }
        
        // Additional advice for families with children
        if (hasChildren) {
            advice += ' When evaluating job opportunities, consider employers with family-friendly policies like flexible schedules and childcare benefits.';
        }
        
        return advice;
    }
}

export default NeighborhoodAnalysis;
