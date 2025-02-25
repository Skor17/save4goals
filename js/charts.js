// Chart functionality
class ChartManager {
    constructor() {
        this.charts = {};
    }

    // Create a progress bar
    createProgressBar(element, currentAmount, targetAmount) {
        const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
        const progressFill = element.querySelector('.progress-fill');
        progressFill.style.width = `${percentage}%`;
        
        // Change color based on progress
        if (percentage >= 100) {
            progressFill.style.backgroundColor = '#2ecc71'; // Green for completed
        } else if (percentage >= 75) {
            progressFill.style.backgroundColor = '#3498db'; // Blue for good progress
        } else if (percentage >= 50) {
            progressFill.style.backgroundColor = '#f39c12'; // Orange for halfway
        } else if (percentage >= 25) {
            progressFill.style.backgroundColor = '#e67e22'; // Dark orange for started
        } else {
            progressFill.style.backgroundColor = '#e74c3c'; // Red for just beginning
        }
    }

    // Create a bar chart for transaction history
    createTransactionChart(canvasId, transactions) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Clear previous chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // If no transactions, show empty state
        if (transactions.length === 0) {
            this.drawEmptyChart(ctx, canvas.width, canvas.height);
            return;
        }
        
        // Get last 10 transactions or fewer if less exist
        const recentTransactions = transactions.slice(-10);
        
        // Find min and max values for scaling
        let minAmount = 0;
        let maxAmount = Math.max(...recentTransactions.map(t => t.balance));
        
        // Add some padding to the max
        maxAmount = maxAmount * 1.1;
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.strokeStyle = '#aaa';
        ctx.stroke();
        
        // Draw bars
        const barWidth = chartWidth / recentTransactions.length;
        
        recentTransactions.forEach((transaction, index) => {
            const x = padding + (index * barWidth);
            const barHeight = ((transaction.balance - minAmount) / (maxAmount - minAmount)) * chartHeight;
            const y = canvas.height - padding - barHeight;
            
            // Draw bar
            ctx.fillStyle = transaction.amount >= 0 ? '#4cc9f0' : '#f72585';
            ctx.fillRect(x, y, barWidth - 5, barHeight);
            
            // Draw date label
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - padding + 10);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            const date = new Date(transaction.date);
            ctx.fillText(date.toLocaleDateString(), 0, 0);
            ctx.restore();
            
            // Draw amount on top of bar
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$' + transaction.balance.toFixed(2), x + barWidth / 2, y - 5);
        });
        
        // Draw y-axis labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        
        // Draw 5 evenly spaced labels
        for (let i = 0; i <= 5; i++) {
            const value = minAmount + ((maxAmount - minAmount) * i / 5);
            const y = canvas.height - padding - ((value - minAmount) / (maxAmount - minAmount)) * chartHeight;
            ctx.fillText('$' + value.toFixed(2), padding - 5, y + 4);
            
            // Draw horizontal grid line
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.strokeStyle = '#eee';
            ctx.stroke();
        }
    }
    
    // Draw empty chart state
    drawEmptyChart(ctx, width, height) {
        ctx.fillStyle = '#ddd';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No transaction data available', width / 2, height / 2);
    }
} 