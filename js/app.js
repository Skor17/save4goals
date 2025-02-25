// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create instances of our classes
    const goalManager = new GoalManager();
    const chartManager = new ChartManager();
    const ui = new UI(goalManager, chartManager);
    
    // Load saved theme
    ui.loadTheme();
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('goal-modal');
        if (e.target === modal) {
            ui.closeModal();
        }
    });
}); 