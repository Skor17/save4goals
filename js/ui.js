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
        
        // Add goal button
        document.getElementById('add-goal-btn').addEventListener('click', () => this.showAddGoalModal());
        
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
        
        // Create a fallback logo if the image doesn't load
        const logoImg = document.querySelector('.logo');
        if (logoImg) {
            logoImg.onerror = function() {
                // Replace with a Font Awesome icon
                const logoContainer = document.querySelector('.logo-container');
                logoContainer.innerHTML = `
                    <i class="fas fa-piggy-bank logo-icon"></i>
                    <h1><span class="highlight">save4</span>goals</h1>
                `;
            };
        }
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

    // Show add goal modal
    showAddGoalModal() {
        const modal = document.getElementById('goal-modal');
        const detailsContainer = document.getElementById('goal-details');
        
        detailsContainer.innerHTML = `
            <div class="add-goal-form-container">
                <h2>Add New Goal</h2>
                
                <form id="add-goal-form" class="add-goal-form">
                    <div class="form-group">
                        <label for="modal-goal-name">Goal Name</label>
                        <input type="text" id="modal-goal-name" placeholder="e.g., New Car, Dream Vacation" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-initial-savings">Initial Savings ($)</label>
                        <div class="amount-input-container">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="modal-initial-savings" min="0" step="0.01" placeholder="0.00" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-target-amount">Target Amount ($)</label>
                        <div class="amount-input-container">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="modal-target-amount" min="0.01" step="0.01" placeholder="1000.00" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-target-date">Target Date (optional)</label>
                        <input type="date" id="modal-target-date">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-add-goal">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="confirm-add-goal">Add Goal</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('modal-goal-name').focus();
        }, 100);
        
        // Cancel button
        document.getElementById('cancel-add-goal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Form submission
        document.getElementById('add-goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('modal-goal-name').value;
            const initialSavings = document.getElementById('modal-initial-savings').value;
            const targetAmount = document.getElementById('modal-target-amount').value;
            const targetDate = document.getElementById('modal-target-date').value || null;
            
            const goal = this.goalManager.addGoal(name, initialSavings, targetAmount, targetDate);
            
            this.updateSummary();
            this.renderGoals();
            this.closeModal();
        });
    }

    // Handle importing goals
    handleImportGoals(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const success = this.goalManager.importGoals(event.target.result);
            if (success) {
                this.updateSummary();
                this.renderGoals();
                alert('Goals imported successfully!');
            } else {
                alert('Failed to import goals. Invalid file format.');
            }
        };
        reader.readAsText(file);
    }

    // Update summary statistics
    updateSummary() {
        document.getElementById('total-savings').textContent = '$' + this.goalManager.getTotalSavings().toFixed(2);
        document.getElementById('active-goals').textContent = this.goalManager.getActiveGoalsCount();
        document.getElementById('completed-goals').textContent = this.goalManager.getCompletedGoalsCount();
    }

    // Render all goals
    renderGoals() {
        const goalsContainer = document.getElementById('goals-container');
        const goals = this.goalManager.getAllGoals();
        
        // Clear container
        goalsContainer.innerHTML = '';
        
        if (goals.length === 0) {
            goalsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-piggy-bank"></i>
                    <p>No savings goals yet. Add your first goal above!</p>
                </div>
            `;
            return;
        }
        
        // Render each goal
        goals.forEach(goal => {
            const goalElement = this.createGoalElement(goal);
            goalsContainer.appendChild(goalElement);
        });
    }

    // Create a goal card element
    createGoalElement(goal) {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-card';
        goalElement.dataset.id = goal.id;
        
        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);
        
        // Format target date if exists
        let targetDateText = '';
        if (goal.targetDate) {
            const date = new Date(goal.targetDate);
            targetDateText = `Target date: ${date.toLocaleDateString()}`;
        }
        
        // Calculate days remaining if target date exists
        let daysRemainingText = '';
        if (goal.targetDate) {
            const today = new Date();
            const targetDate = new Date(goal.targetDate);
            const timeDiff = targetDate - today;
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysRemaining > 0) {
                daysRemainingText = `${daysRemaining} days remaining`;
            } else if (daysRemaining === 0) {
                daysRemainingText = 'Due today!';
            } else {
                daysRemainingText = `${Math.abs(daysRemaining)} days overdue`;
            }
        }
        
        goalElement.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">
                    <h3>${goal.name}</h3>
                    <small>${targetDateText}</small>
                </div>
                <div class="goal-actions">
                    <button class="edit-goal" title="Edit Goal">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-goal" title="Delete Goal">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-stats">
                    <span>$${goal.currentAmount.toFixed(2)} saved</span>
                    <span>${percentage}% of $${goal.targetAmount.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="goal-footer">
                <div class="goal-remaining">
                    ${daysRemainingText}
                </div>
                <div class="goal-actions-primary">
                    <button class="btn btn-add add-money" title="Add Money">
                        <i class="fas fa-plus-circle"></i> Add
                    </button>
                    <button class="btn btn-subtract subtract-money" title="Withdraw Money">
                        <i class="fas fa-minus-circle"></i> Withdraw
                    </button>
                    <button class="btn btn-details view-details" title="View Details">
                        <i class="fas fa-chart-line"></i> Details
                    </button>
                </div>
            </div>
        `;
        
        // Update progress bar colors
        const progressBar = goalElement.querySelector('.progress-bar');
        this.chartManager.createProgressBar(progressBar, goal.currentAmount, goal.targetAmount);
        
        // Add event listeners
        this.addGoalEventListeners(goalElement, goal.id);
        
        return goalElement;
    }

    // Add event listeners to goal card
    addGoalEventListeners(goalElement, goalId) {
        // Edit button
        goalElement.querySelector('.edit-goal').addEventListener('click', () => {
            this.handleEditGoal(goalId);
        });
        
        // Delete button
        goalElement.querySelector('.delete-goal').addEventListener('click', () => {
            this.handleDeleteGoal(goalId);
        });
        
        // Add money button
        goalElement.querySelector('.btn-add').addEventListener('click', () => {
            this.handleAddMoney(goalId);
        });
        
        // Subtract money button
        goalElement.querySelector('.btn-subtract').addEventListener('click', () => {
            this.handleSubtractMoney(goalId);
        });
        
        // Details button
        goalElement.querySelector('.btn-details').addEventListener('click', () => {
            this.showGoalDetails(goalId);
        });
    }

    // Handle editing a goal
    handleEditGoal(goalId) {
        const goal = this.goalManager.getGoal(goalId);
        if (!goal) return;
        
        const modal = document.getElementById('goal-modal');
        const detailsContainer = document.getElementById('goal-details');
        
        // Format date for input field (YYYY-MM-DD)
        let formattedDate = '';
        if (goal.targetDate) {
            formattedDate = goal.targetDate.split('T')[0];
        }
        
        detailsContainer.innerHTML = `
            <div class="edit-form-container">
                <h2>Edit Goal</h2>
                
                <form id="edit-goal-form" class="edit-form">
                    <div class="form-group">
                        <label for="edit-goal-name">Goal Name</label>
                        <input type="text" id="edit-goal-name" value="${goal.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-target-amount">Target Amount ($)</label>
                        <div class="amount-input-container">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="edit-target-amount" min="0.01" step="0.01" value="${goal.targetAmount.toFixed(2)}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-target-date">Target Date (optional)</label>
                        <input type="date" id="edit-target-date" value="${formattedDate}">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="confirm-edit">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Focus on name input
        setTimeout(() => {
            document.getElementById('edit-goal-name').focus();
        }, 100);
        
        // Cancel button
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Form submission
        document.getElementById('edit-goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('edit-goal-name').value;
            const newTargetAmount = parseFloat(document.getElementById('edit-target-amount').value);
            const newTargetDate = document.getElementById('edit-target-date').value || null;
            
            if (isNaN(newTargetAmount) || newTargetAmount <= 0) {
                alert('Please enter a valid target amount.');
                return;
            }
            
            // Update goal
            this.goalManager.updateGoal(goalId, {
                name: newName,
                targetAmount: newTargetAmount,
                targetDate: newTargetDate
            });
            
            this.updateSummary();
            this.renderGoals();
            this.closeModal();
        });
    }

    // Handle deleting a goal
    handleDeleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goalManager.deleteGoal(goalId);
            this.updateSummary();
            this.renderGoals();
        }
    }

    // Handle adding money to a goal
    handleAddMoney(goalId) {
        this.showMoneyModal(goalId, 'add');
    }

    // Handle subtracting money from a goal
    handleSubtractMoney(goalId) {
        this.showMoneyModal(goalId, 'withdraw');
    }

    // Show modal for adding/withdrawing money
    showMoneyModal(goalId, action) {
        const goal = this.goalManager.getGoal(goalId);
        if (!goal) return;
        
        const modal = document.getElementById('goal-modal');
        const detailsContainer = document.getElementById('goal-details');
        
        const actionText = action === 'add' ? 'Add Money' : 'Withdraw Money';
        const buttonClass = action === 'add' ? 'btn-add' : 'btn-subtract';
        const buttonText = action === 'add' ? 'Add' : 'Withdraw';
        
        detailsContainer.innerHTML = `
            <div class="money-form-container">
                <h2>${actionText} to "${goal.name}"</h2>
                <p>Current balance: $${goal.currentAmount.toFixed(2)}</p>
                
                <form id="money-form" class="money-form">
                    <div class="form-group">
                        <label for="money-amount">Amount ($)</label>
                        <div class="amount-input-container">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="money-amount" min="0.01" step="0.01" placeholder="0.00" required>
                        </div>
                    </div>
                    
                    <div class="quick-amounts">
                        <button type="button" class="quick-amount" data-amount="5">$5</button>
                        <button type="button" class="quick-amount" data-amount="10">$10</button>
                        <button type="button" class="quick-amount" data-amount="20">$20</button>
                        <button type="button" class="quick-amount" data-amount="50">$50</button>
                        <button type="button" class="quick-amount" data-amount="100">$100</button>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-money">Cancel</button>
                        <button type="submit" class="btn ${buttonClass}" id="confirm-money">${buttonText}</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Focus on amount input
        setTimeout(() => {
            document.getElementById('money-amount').focus();
        }, 100);
        
        // Add event listeners for quick amount buttons
        document.querySelectorAll('.quick-amount').forEach(button => {
            button.addEventListener('click', () => {
                document.getElementById('money-amount').value = button.dataset.amount;
            });
        });
        
        // Cancel button
        document.getElementById('cancel-money').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Form submission
        document.getElementById('money-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amount = parseFloat(document.getElementById('money-amount').value);
            
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid positive amount.');
                return;
            }
            
            if (action === 'withdraw' && amount > goal.currentAmount) {
                alert(`You cannot withdraw more than your current savings ($${goal.currentAmount.toFixed(2)}).`);
                return;
            }
            
            if (action === 'add') {
                this.goalManager.addMoney(goalId, amount);
            } else {
                this.goalManager.subtractMoney(goalId, amount);
            }
            
            this.updateSummary();
            this.renderGoals();
            this.closeModal();
        });
    }

    // Show goal details in modal
    showGoalDetails(goalId) {
        const goal = this.goalManager.getGoal(goalId);
        if (!goal) return;
        
        const modal = document.getElementById('goal-modal');
        const detailsContainer = document.getElementById('goal-details');
        
        // Calculate stats
        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1);
        const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0).toFixed(2);
        
        let timeInfo = 'No target date set';
        if (goal.targetDate) {
            const targetDate = new Date(goal.targetDate);
            const today = new Date();
            const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0) {
                timeInfo = `${daysLeft} days left until target date`;
            } else if (daysLeft === 0) {
                timeInfo = `Target date is today!`;
            } else {
                timeInfo = `Target date passed ${Math.abs(daysLeft)} days ago`;
            }
        }
        
        // Create details HTML
        detailsContainer.innerHTML = `
            <div class="goal-details-header">
                <h2>${goal.name}</h2>
                <p>${timeInfo}</p>
            </div>
            
            <div class="goal-details-stats">
                <div class="stat-card">
                    <h4>Current Savings</h4>
                    <p>$${goal.currentAmount.toFixed(2)}</p>
                </div>
                <div class="stat-card">
                    <h4>Target Amount</h4>
                    <p>$${goal.targetAmount.toFixed(2)}</p>
                </div>
                <div class="stat-card">
                    <h4>Remaining</h4>
                    <p>$${remaining}</p>
                </div>
                <div class="stat-card">
                    <h4>Progress</h4>
                    <p>${percentage}%</p>
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="transaction-chart" width="700" height="300"></canvas>
            </div>
            
            <div class="transactions-section">
                <div class="transactions-header">
                    <h3>Transaction History</h3>
                </div>
                <div class="transaction-list">
                    ${this.generateTransactionsList(goal.transactions)}
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Create chart
        setTimeout(() => {
            this.chartManager.createTransactionChart('transaction-chart', goal.transactions);
        }, 100);
    }

    // Generate transactions list HTML
    generateTransactionsList(transactions) {
        if (transactions.length === 0) {
            return '<p class="empty-transactions">No transactions yet.</p>';
        }
        
        return transactions.map(transaction => {
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const isPositive = transaction.amount >= 0;
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-date">${formattedDate}</div>
                        <div class="transaction-type">${this.getTransactionTypeLabel(transaction.type)}</div>
                    </div>
                    <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : ''}$${transaction.amount.toFixed(2)}
                    </div>
                    <div class="transaction-balance">
                        Balance: $${transaction.balance.toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get readable label for transaction type
    getTransactionTypeLabel(type) {
        switch (type) {
            case 'initial': return 'Initial Deposit';
            case 'deposit': return 'Deposit';
            case 'withdrawal': return 'Withdrawal';
            default: return 'Transaction';
        }
    }

    // Close the modal
    closeModal() {
        document.getElementById('goal-modal').style.display = 'none';
    }
} 