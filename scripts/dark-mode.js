// Dark Mode Toggle Functionality
class DarkModeToggle {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Apply saved theme on page load
        this.applyTheme(this.currentTheme);
        
        // Setup event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        console.log('Dark mode toggle initialized');
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.currentTheme = newTheme;
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
        
        // Add visual feedback
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 150);
        
        console.log(`Theme switched to: ${newTheme}`);
    }
    
    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            this.updateToggleButton('dark');
        } else {
            body.removeAttribute('data-theme');
            this.updateToggleButton('light');
        }
        
        // Smooth transition
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }
    
    updateToggleButton(theme) {
        if (!this.themeToggle) return;
        
        const lightIcon = this.themeToggle.querySelector('.light-icon');
        const darkIcon = this.themeToggle.querySelector('.dark-icon');
        const toggleText = this.themeToggle.querySelector('.toggle-text');
        
        if (theme === 'dark') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            toggleText.textContent = 'Light Mode';
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            toggleText.textContent = 'Dark Mode';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
});

// Also initialize if the script is loaded after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DarkModeToggle();
    });
} else {
    new DarkModeToggle();
}