// Load data from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

// DOM elements
const amountInput = document.getElementById('amount');
const itemInput = document.getElementById('item');
const categorySelect = document.getElementById('category');
const addExpenseBtn = document.getElementById('add-expense');
const totalSpan = document.getElementById('total');
const budgetInput = document.getElementById('budget');
const setBudgetBtn = document.getElementById('set-budget');
const budgetStatus = document.getElementById('budget-status');
const themeToggle = document.getElementById('theme-toggle');
const categorySummaryBtn = document.getElementById('category-summary');
const dailyReportBtn = document.getElementById('daily-report');
const monthlyReportBtn = document.getElementById('monthly-report');
const exportCsvBtn = document.getElementById('export-csv');
const displayArea = document.getElementById('display-area');
const chartArea = document.getElementById('chart-area');
const chartDateInput = document.getElementById('chart-date');
const showChartBtn = document.getElementById('show-chart');
const pieChartCanvas = document.getElementById('pie-chart');

// Initialize
updateTotal();
updateBudgetStatus();
loadTheme();
chartDateInput.value = new Date().toISOString().split('T')[0];

// Event listeners
addExpenseBtn.addEventListener('click', addExpense);
setBudgetBtn.addEventListener('click', setBudget);
themeToggle.addEventListener('click', toggleTheme);
categorySummaryBtn.addEventListener('click', showCategorySummary);
dailyReportBtn.addEventListener('click', showDailyReport);
monthlyReportBtn.addEventListener('click', showMonthlyReport);
exportCsvBtn.addEventListener('click', exportToCSV);
showChartBtn.addEventListener('click', showPieChart);

// Functions
function addExpense() {
    const amount = parseFloat(amountInput.value);
    const item = itemInput.value.trim();
    const category = categorySelect.value;
    
    if (!amount || amount <= 0 || !category || !item) {
        alert('Please enter a valid amount, item name, and select a category.');
        return;
    }
    
    const expense = {
        amount,
        item,
        category,
        date: new Date().toISOString().split('T')[0]
    };
    
    expenses.push(expense);
    saveExpenses();
    updateTotal();
    updateBudgetStatus();
    
    // Clear inputs
    amountInput.value = '';
    itemInput.value = '';
    categorySelect.value = '';
}

function updateTotal() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalSpan.textContent = total.toFixed(2);
}

function setBudget() {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget >= 0) {
        budget = newBudget;
        localStorage.setItem('budget', budget);
        updateBudgetStatus();
        budgetInput.value = '';
    }
}

function updateBudgetStatus() {
    if (budget > 0) {
        const total = parseFloat(totalSpan.textContent);
        const remaining = budget - total;
        if (remaining >= 0) {
            budgetStatus.textContent = `Budget remaining: $${remaining.toFixed(2)}`;
            budgetStatus.style.color = 'green';
        } else {
            budgetStatus.textContent = `Over budget by: $${Math.abs(remaining).toFixed(2)}`;
            budgetStatus.style.color = 'red';
        }
    } else {
        budgetStatus.textContent = '';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span') || themeToggle;
    if (isDark) {
        icon.className = 'fas fa-sun';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function showCategorySummary() {
    const summary = {};
    expenses.forEach(exp => {
        summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    
    let output = 'Category Summary:\n\n';
    for (const [cat, amt] of Object.entries(summary)) {
        output += `${cat}: $${amt.toFixed(2)}\n`;
    }
    
    displayArea.textContent = output;
    displayChart(summary);
}

function showDailyReport() {
    const summary = {};
    expenses.forEach(exp => {
        summary[exp.date] = (summary[exp.date] || 0) + exp.amount;
    });
    
    let output = 'Daily Report:\n\n';
    for (const [date, amt] of Object.entries(summary).sort()) {
        output += `${date}: $${amt.toFixed(2)}\n`;
    }
    
    displayArea.textContent = output;
}

function showMonthlyReport() {
    const summary = {};
    expenses.forEach(exp => {
        const month = exp.date.substring(0, 7); // YYYY-MM
        summary[month] = (summary[month] || 0) + exp.amount;
    });
    
    let output = 'Monthly Report:\n\n';
    for (const [month, amt] of Object.entries(summary).sort()) {
        output += `${month}: $${amt.toFixed(2)}\n`;
    }
    
    displayArea.textContent = output;
}

function displayChart(summary) {
    const chartArea = document.getElementById('chart-area');
    chartArea.innerHTML = '<h3>Category Chart</h3>';
    
    const maxAmt = Math.max(...Object.values(summary));
    const categories = Object.keys(summary);
    
    categories.forEach(cat => {
        const amt = summary[cat];
        const percentage = maxAmt > 0 ? (amt / maxAmt) * 100 : 0;
        
        const barDiv = document.createElement('div');
        barDiv.className = 'bar';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'bar-label';
        labelDiv.textContent = cat;
        
        const fillDiv = document.createElement('div');
        fillDiv.className = 'bar-fill';
        fillDiv.style.width = '0%';
        setTimeout(() => fillDiv.style.width = percentage + '%', 100);
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'bar-value';
        valueDiv.textContent = '$' + amt.toFixed(2);
        
        barDiv.appendChild(labelDiv);
        barDiv.appendChild(fillDiv);
        barDiv.appendChild(valueDiv);
        
        chartArea.appendChild(barDiv);
    });
}

function exportToCSV() {
    if (expenses.length === 0) {
        alert('No expenses to export.');
        return;
    }
    
    let csv = 'Date,Item,Category,Amount\n';
    expenses.forEach(exp => {
        csv += `${exp.date},${exp.item},${exp.category},${exp.amount}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function showPieChart() {
    const selectedDate = chartDateInput.value;
    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }
    
    const dayExpenses = expenses.filter(exp => exp.date === selectedDate);
    if (dayExpenses.length === 0) {
        alert('No expenses for this date.');
        return;
    }
    
    const summary = {};
    dayExpenses.forEach(exp => {
        summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    
    const labels = Object.keys(summary);
    const data = Object.values(summary);
    
    // Destroy existing chart if any
    if (window.pieChart) {
        window.pieChart.destroy();
    }
    
    window.pieChart = new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Expenses for ${selectedDate}`
                }
            }
        }
    });
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}
