// UI functionality
class UI {
    constructor(goalManager, chartManager) {
        this.goalManager = goalManager;
        this.chartManager = chartManager;
        this.initEventListeners();
        this.updateSummary();
        this.renderGoals();
    }

    // Initialize event listeners
    initEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());
        
        // Goal form submission
        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddGoal();
        });
        
        // Export/Import buttons
        document.getElementById('export-goals').addEventListener('click', () => this.goalManager.exportGoals());
        document.getElementById('import-goals').addEventListener('change', (e) => this.handleImportGoals(e));
        
        // Modal close button
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('goal-modal')) {
                this.closeModal();
            }
        });
    }

    // Toggle between light and dark mode
    toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-toggle i');
        
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('save4goals-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('save4goals-theme', 'light');
        }
    }

    // Load saved theme preference
    loadTheme() {
        const savedTheme = localStorage.getItem('save4goals-theme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
    }
} 