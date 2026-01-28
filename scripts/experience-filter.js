// Experience Filter and Search Functionality
class ExperienceFilter {
    constructor() {
        this.experiences = [];
        this.filteredExperiences = [];
        this.currentFilters = {
            search: '',
            dateFrom: '',
            dateTo: '',
            skills: []
        };
        
        this.init();
    }
    
    init() {
        this.collectExperiences();
        this.setupEventListeners();
        this.populateSkillsFilter();
        
        // Immediately ensure protected sections are visible
        this.ensureOtherSectionsVisible();
        
        console.log('Filter system initialized. Protected sections should be visible.');
    }
    
    collectExperiences() {
        // Clear experiences array first
        this.experiences = [];
        
        // Collect work experiences with data attributes - ONLY from work-experience section
        const workExperiences = document.querySelectorAll('#work-experience .experience-card-main[data-company]');
        
        workExperiences.forEach((card) => {
            const company = card.getAttribute('data-company');
            const position = card.getAttribute('data-position');
            const duration = card.getAttribute('data-duration');
            const skills = card.getAttribute('data-skills') ? card.getAttribute('data-skills').split(',') : [];
            const description = this.extractText(card, 'p');
            
            this.experiences.push({
                element: card,
                type: 'work',
                company: company || 'Unknown',
                position: position || 'Unknown',
                duration: duration || '',
                description: description || '',
                skills: [...skills, ...this.extractSkillsFromText(description)],
                dateRange: this.parseDuration(duration)
            });
        });
        
        // Collect internship experiences with data attributes - ONLY from internships section, NOT certifications
        const internshipExperiences = document.querySelectorAll('#internships .experience-card[data-company]');
        
        internshipExperiences.forEach((card) => {
            // Double-check: skip if this is in certifications section
            if (card.closest('#certifications')) return;
            
            const company = card.getAttribute('data-company');
            const position = card.getAttribute('data-position');
            const duration = card.getAttribute('data-duration');
            const skills = card.getAttribute('data-skills') ? card.getAttribute('data-skills').split(',') : [];
            const description = this.extractText(card, '.experience-body p:last-of-type');
            
            this.experiences.push({
                element: card.closest('.col-12'),
                type: 'internship',
                company: company || 'Unknown',
                position: position || 'Unknown',
                duration: duration || '',
                description: description || '',
                skills: [...skills, ...this.extractSkillsFromText(description + ' ' + position)],
                dateRange: this.parseDuration(duration)
            });
        });
        
        // Collect remaining internship experiences without data attributes - BE VERY SPECIFIC
        const internshipsContainer = document.getElementById('internships');
        if (internshipsContainer) {
            const otherInternships = internshipsContainer.querySelectorAll('.experience-card:not([data-company])');
            
            otherInternships.forEach((card) => {
                // Triple-check: absolutely skip if this is in certifications section
                if (card.closest('#certifications')) return;
                
                // Only process if this card is actually in the internships section
                if (!card.closest('#internships')) return;
                
                const company = this.extractText(card, '.h6:first-child');
                const position = this.extractText(card, '.experience-body .h6:first-child');
                const duration = this.extractText(card, '.experience-body p:first-of-type');
                const description = this.extractText(card, '.experience-body p:last-of-type');
                
                // Only add if it has the required fields and doesn't look like a certification
                if (company && company.trim() && position && duration && 
                    !card.querySelector('.certificate-logo') && // Skip if it has certificate logo
                    !card.querySelector('.download-btn')) { // Skip if it has download button (typical for certs)
                    
                    this.experiences.push({
                        element: card.closest('.col-12'),
                        type: 'internship',
                        company: company || 'Unknown',
                        position: position || 'Unknown',
                        duration: duration || '',
                        description: description || '',
                        skills: this.extractSkillsFromText(description + ' ' + position + ' ' + company),
                        dateRange: this.parseDuration(duration)
                    });
                }
            });
        }
        
        this.filteredExperiences = [...this.experiences];
        console.log('Collected experiences:', this.experiences);
        console.log('Experiences collected from:', this.experiences.map(exp => `${exp.company} (${exp.type})`));
    }
    
    extractText(element, selector) {
        const target = selector ? element.querySelector(selector) : element;
        return target ? target.textContent.trim() : '';
    }
    
    extractSkillsFromText(text) {
        const skills = [];
        const skillKeywords = [
            'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'HTML', 'CSS',
            'Machine Learning', 'AI', 'Artificial Intelligence', 'Django', 'Flask',
            'Network', 'Networking', 'Cloud', 'AWS', 'Azure', 'Docker', 'Kubernetes',
            'REST API', 'API', 'SQL', 'Database', 'MongoDB', 'PostgreSQL', 'MySQL',
            'Automation', 'DevOps', 'Git', 'GitHub', 'CI/CD', 'Testing',
            'BGP', 'OSPF', 'VLAN', 'VxLAN', 'EVPN', 'CloudVision', 'Arista',
            'Photoshop', 'Illustrator', 'UI/UX', 'Design', 'Figma',
            'Excel', 'Data Analysis', 'Analytics', 'Pandas', 'TensorFlow',
            'Android', 'Mobile Development', 'Web Development', 'Frontend', 'Backend'
        ];
        
        const lowerText = text.toLowerCase();
        skillKeywords.forEach(skill => {
            if (lowerText.includes(skill.toLowerCase())) {
                skills.push(skill);
            }
        });
        
        return [...new Set(skills)]; // Remove duplicates
    }
    
    parseDuration(duration) {
        const months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        
        const dateRegex = /(\w+)\s+(\d{4})/gi;
        const matches = [...duration.toLowerCase().matchAll(dateRegex)];
        
        if (matches.length >= 1) {
            const startMatch = matches[0];
            const endMatch = matches[matches.length - 1];
            
            const startMonth = months.indexOf(startMatch[1]) + 1;
            const startYear = parseInt(startMatch[2]);
            
            let endMonth = months.indexOf(endMatch[1]) + 1;
            let endYear = parseInt(endMatch[2]);
            
            // If only one date found, assume it's ongoing
            if (matches.length === 1 || duration.toLowerCase().includes('present')) {
                const now = new Date();
                endMonth = now.getMonth() + 1;
                endYear = now.getFullYear();
            }
            
            return {
                startDate: new Date(startYear, startMonth - 1),
                endDate: new Date(endYear, endMonth - 1)
            };
        }
        
        return null;
    }
    
    populateSkillsFilter() {
        const allSkills = new Set();
        this.experiences.forEach(exp => {
            exp.skills.forEach(skill => allSkills.add(skill));
        });
        
        const skillsList = document.getElementById('skillsList');
        const sortedSkills = [...allSkills].sort();
        
        skillsList.innerHTML = sortedSkills.map(skill => `
            <div class="skill-item" data-skill="${skill}">
                <input type="checkbox" id="skill-${skill.replace(/\s+/g, '-')}" value="${skill}">
                <label for="skill-${skill.replace(/\s+/g, '-')}">${skill}</label>
            </div>
        `).join('');
        
        // Add click event listeners to make entire row clickable
        this.setupSkillItemClickHandlers();
    }
    
    setupSkillItemClickHandlers() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if user clicked directly on the checkbox (to avoid double toggle)
                if (e.target.type === 'checkbox') return;
                
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    // Trigger change event for any other listeners
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            // Add visual feedback on hover
            item.style.cursor = 'pointer';
        });
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('experienceSearch');
        searchInput.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });
        
        // Filter button
        document.getElementById('filterBtn').addEventListener('click', () => {
            document.getElementById('filterModal').style.display = 'block';
        });
        
        // Modal close buttons
        document.getElementById('closeFilterModal').addEventListener('click', () => {
            document.getElementById('filterModal').style.display = 'none';
        });
        
        document.getElementById('closeDateModal').addEventListener('click', () => {
            document.getElementById('dateFilterModal').style.display = 'none';
        });
        
        document.getElementById('closeSkillsModal').addEventListener('click', () => {
            document.getElementById('skillsFilterModal').style.display = 'none';
        });
        
        // Filter options
        document.getElementById('dateFilterOption').addEventListener('click', () => {
            document.getElementById('filterModal').style.display = 'none';
            document.getElementById('dateFilterModal').style.display = 'block';
        });
        
        document.getElementById('skillsFilterOption').addEventListener('click', () => {
            document.getElementById('filterModal').style.display = 'none';
            document.getElementById('skillsFilterModal').style.display = 'block';
        });
        
        // Apply filters
        document.getElementById('applyDateFilter').addEventListener('click', () => {
            this.currentFilters.dateFrom = document.getElementById('dateFrom').value;
            this.currentFilters.dateTo = document.getElementById('dateTo').value;
            this.applyFilters();
            document.getElementById('dateFilterModal').style.display = 'none';
            this.showClearButton();
        });
        
        document.getElementById('applySkillsFilter').addEventListener('click', () => {
            const selectedSkills = [];
            document.querySelectorAll('#skillsList input[type="checkbox"]:checked').forEach(checkbox => {
                selectedSkills.push(checkbox.value);
            });
            this.currentFilters.skills = selectedSkills;
            this.applyFilters();
            document.getElementById('skillsFilterModal').style.display = 'none';
            this.showClearButton();
        });
        
        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        // Skills search
        document.getElementById('skillsSearch').addEventListener('input', (e) => {
            this.filterSkillsList(e.target.value);
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    filterSkillsList(searchTerm) {
        const skillItems = document.querySelectorAll('.skill-item');
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        skillItems.forEach(item => {
            const label = item.querySelector('label').textContent.toLowerCase();
            item.style.display = label.includes(lowerSearchTerm) ? 'flex' : 'none';
        });
        
        // Re-setup click handlers for visible items (in case DOM was modified)
        this.setupSkillItemClickHandlers();
    }
    
    applyFilters() {
        this.filteredExperiences = this.experiences.filter(exp => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchText = (exp.company + ' ' + exp.position).toLowerCase();
                if (!searchText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Date filter
            if (this.currentFilters.dateFrom || this.currentFilters.dateTo) {
                if (!exp.dateRange) return false;
                
                if (this.currentFilters.dateFrom) {
                    const filterFromDate = new Date(this.currentFilters.dateFrom);
                    if (exp.dateRange.endDate < filterFromDate) return false;
                }
                
                if (this.currentFilters.dateTo) {
                    const filterToDate = new Date(this.currentFilters.dateTo);
                    if (exp.dateRange.startDate > filterToDate) return false;
                }
            }
            
            // Skills filter
            if (this.currentFilters.skills.length > 0) {
                const hasMatchingSkill = this.currentFilters.skills.some(skill => 
                    exp.skills.includes(skill)
                );
                if (!hasMatchingSkill) return false;
            }
            
            return true;
        });
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Hide all collected experiences first
        this.experiences.forEach(exp => {
            exp.element.style.display = 'none';
        });
        
        // Show filtered experiences
        this.filteredExperiences.forEach(exp => {
            exp.element.style.display = 'block';
        });
        
        // Always keep sections that should not be affected visible
        this.ensureOtherSectionsVisible();
        
        // Update active filters display
        this.updateActiveFiltersDisplay();
        
        // Show/hide no results message
        const noResultsMessage = document.getElementById('noResultsMessage');
        if (this.filteredExperiences.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
        
        console.log(`Showing ${this.filteredExperiences.length} of ${this.experiences.length} experiences`);
    }
    
    ensureOtherSectionsVisible() {
        // CAREFULLY restore the certifications section - preserve Bootstrap grid layout
        const certificationsSection = document.getElementById('certifications');
        if (certificationsSection) {
            // Ensure the section itself is visible
            certificationsSection.style.display = 'block';
            
            // Restore Bootstrap grid elements WITHOUT forcing block display
            const gridElements = certificationsSection.querySelectorAll('.container, .row');
            gridElements.forEach(element => {
                if (element.style.display === 'none') {
                    element.style.display = ''; // Reset to default (uses CSS)
                }
            });
            
            // Restore Bootstrap columns WITHOUT forcing block - let CSS handle grid
            const columnElements = certificationsSection.querySelectorAll('[class*="col-"]');
            columnElements.forEach(column => {
                if (column.style.display === 'none') {
                    column.style.display = ''; // Reset to default (flex for Bootstrap grid)
                }
            });
            
            // Restore certification cards and their content
            const certificationCards = certificationsSection.querySelectorAll('.experience-card');
            certificationCards.forEach(card => {
                if (card.style.display === 'none') {
                    card.style.display = ''; // Reset to default
                }
                
                // Also restore card content
                const cardContent = card.querySelectorAll('.card-body, .certificate-logo, .download-btn');
                cardContent.forEach(content => {
                    if (content.style.display === 'none') {
                        content.style.display = ''; // Reset to default
                    }
                });
            });
        }
        
        // Carefully restore the skills section
        const skillsSection = document.getElementById('skill');
        if (skillsSection) {
            skillsSection.style.display = 'block';
            
            // Restore progress bars and skill content
            const skillElements = skillsSection.querySelectorAll('.progress-container, .progress, .progress-bar, .card, .row, [class*="col-"]');
            skillElements.forEach(element => {
                if (element.style.display === 'none') {
                    element.style.display = ''; // Reset to default
                }
            });
        }
        
        // Restore other protected sections carefully
        const protectedSections = document.querySelectorAll('.section');
        protectedSections.forEach(section => {
            // Only protect sections that are NOT the work/internship sections
            if (!section.querySelector('#work-experience') && 
                !section.querySelector('#internships') && 
                section.id !== 'experience') {
                
                if (section.style.display === 'none') {
                    section.style.display = 'block';
                }
                
                // Restore Bootstrap grid elements in protected sections
                const gridElements = section.querySelectorAll('.container, .row, [class*="col-"]');
                gridElements.forEach(element => {
                    if (element.style.display === 'none') {
                        element.style.display = ''; // Let CSS handle the display type
                    }
                });
            }
        });
        
        console.log('Protected sections restored with proper grid layout');
    }
    
    updateActiveFiltersDisplay() {
        const activeFiltersContainer = document.getElementById('activeFiltersContainer');
        const activeFiltersRow = document.getElementById('activeFiltersRow');
        
        // Clear existing filter tags
        activeFiltersRow.innerHTML = '';
        
        let hasActiveFilters = false;
        
        // Add search filter tag
        if (this.currentFilters.search) {
            hasActiveFilters = true;
            const searchTag = this.createFilterTag('search', `Search: "${this.currentFilters.search}"`, 'fas fa-search');
            activeFiltersRow.appendChild(searchTag);
        }
        
        // Add date filter tags
        if (this.currentFilters.dateFrom) {
            hasActiveFilters = true;
            const fromDate = new Date(this.currentFilters.dateFrom);
            const fromTag = this.createFilterTag('dateFrom', `From: ${fromDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`, 'fas fa-calendar-alt');
            activeFiltersRow.appendChild(fromTag);
        }
        
        if (this.currentFilters.dateTo) {
            hasActiveFilters = true;
            const toDate = new Date(this.currentFilters.dateTo);
            const toTag = this.createFilterTag('dateTo', `To: ${toDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`, 'fas fa-calendar-alt');
            activeFiltersRow.appendChild(toTag);
        }
        
        // Add skills filter tags
        this.currentFilters.skills.forEach(skill => {
            hasActiveFilters = true;
            const skillTag = this.createFilterTag('skill', skill, 'fas fa-code', skill);
            activeFiltersRow.appendChild(skillTag);
        });
        
        // Show/hide active filters container
        activeFiltersContainer.style.display = hasActiveFilters ? 'block' : 'none';
    }
    
    createFilterTag(type, text, iconClass, value = null) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        
        tag.innerHTML = `
            <i class="${iconClass} filter-tag-icon"></i>
            <span>${text}</span>
            <i class="fas fa-times filter-tag-close"></i>
        `;
        
        // Add click event to remove individual filter
        tag.querySelector('.filter-tag-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFilter(type, value);
        });
        
        return tag;
    }
    
    removeFilter(type, value = null) {
        switch (type) {
            case 'search':
                this.currentFilters.search = '';
                document.getElementById('experienceSearch').value = '';
                break;
            case 'dateFrom':
                this.currentFilters.dateFrom = '';
                document.getElementById('dateFrom').value = '';
                break;
            case 'dateTo':
                this.currentFilters.dateTo = '';
                document.getElementById('dateTo').value = '';
                break;
            case 'skill':
                const skillIndex = this.currentFilters.skills.indexOf(value);
                if (skillIndex > -1) {
                    this.currentFilters.skills.splice(skillIndex, 1);
                    // Uncheck the corresponding checkbox
                    const checkbox = document.querySelector(`#skillsList input[value="${value}"]`);
                    if (checkbox) checkbox.checked = false;
                }
                break;
        }
        
        this.applyFilters();
    }
    
    showClearButton() {
        // This function is now handled by updateActiveFiltersDisplay()
        // The clear button is shown/hidden with the active filters container
    }
    
    clearAllFilters() {
        // Reset filters
        this.currentFilters = {
            search: '',
            dateFrom: '',
            dateTo: '',
            skills: []
        };
        
        // Reset inputs
        document.getElementById('experienceSearch').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('skillsSearch').value = '';
        
        // Uncheck all skills
        document.querySelectorAll('#skillsList input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset skills list display
        this.filterSkillsList('');
        
        // Apply filters (will show all)
        this.applyFilters();
        
        // Hide active filters container (which includes the clear button)
        document.getElementById('activeFiltersContainer').style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExperienceFilter();
});