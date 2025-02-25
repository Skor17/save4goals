// Goal management functionality
class GoalManager {
    constructor() {
        this.goals = [];
        this.loadGoals();
    }

    // Load goals from localStorage
    loadGoals() {
        const savedGoals = localStorage.getItem('save4goals');
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        }
    }

    // Save goals to localStorage
    saveGoals() {
        localStorage.setItem('save4goals', JSON.stringify(this.goals));
    }

    // Add a new goal
    addGoal(name, initialSavings, targetAmount, targetDate) {
        const goal = {
            id: Date.now().toString(),
            name,
            currentAmount: parseFloat(initialSavings),
            targetAmount: parseFloat(targetAmount),
            targetDate: targetDate || null,
            createdAt: new Date().toISOString(),
            transactions: []
        };

        // Add initial transaction if there's an initial amount
        if (initialSavings > 0) {
            goal.transactions.push({
                date: new Date().toISOString(),
                amount: parseFloat(initialSavings),
                balance: parseFloat(initialSavings),
                type: 'initial'
            });
        }

        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }

    // Get a goal by ID
    getGoal(id) {
        return this.goals.find(goal => goal.id === id);
    }

    // Update a goal
    updateGoal(id, updates) {
        const index = this.goals.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.goals[index] = { ...this.goals[index], ...updates };
            this.saveGoals();
            return this.goals[index];
        }
        return null;
    }

    // Delete a goal
    deleteGoal(id) {
        const index = this.goals.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.goals.splice(index, 1);
            this.saveGoals();
            return true;
        }
        return false;
    }

    // Add money to a goal
    addMoney(id, amount) {
        const goal = this.getGoal(id);
        if (goal) {
            const parsedAmount = parseFloat(amount);
            goal.currentAmount += parsedAmount;
            
            // Add transaction
            goal.transactions.push({
                date: new Date().toISOString(),
                amount: parsedAmount,
                balance: goal.currentAmount,
                type: 'deposit'
            });
            
            this.saveGoals();
            return goal;
        }
        return null;
    }

    // Subtract money from a goal
    subtractMoney(id, amount) {
        const goal = this.getGoal(id);
        if (goal) {
            const parsedAmount = parseFloat(amount);
            if (goal.currentAmount >= parsedAmount) {
                goal.currentAmount -= parsedAmount;
                
                // Add transaction
                goal.transactions.push({
                    date: new Date().toISOString(),
                    amount: -parsedAmount,
                    balance: goal.currentAmount,
                    type: 'withdrawal'
                });
                
                this.saveGoals();
                return goal;
            }
        }
        return null;
    }

    // Get all goals
    getAllGoals() {
        return this.goals;
    }

    // Get total savings across all goals
    getTotalSavings() {
        return this.goals.reduce((total, goal) => total + goal.currentAmount, 0);
    }

    // Get count of active goals
    getActiveGoalsCount() {
        return this.goals.filter(goal => goal.currentAmount < goal.targetAmount).length;
    }

    // Get count of completed goals
    getCompletedGoalsCount() {
        return this.goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    }

    // Export goals as JSON
    exportGoals() {
        const dataStr = JSON.stringify(this.goals, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'save4goals-export.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Import goals from JSON
    importGoals(jsonData) {
        try {
            const importedGoals = JSON.parse(jsonData);
            if (Array.isArray(importedGoals)) {
                this.goals = importedGoals;
                this.saveGoals();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing goals:', error);
            return false;
        }
    }
} 