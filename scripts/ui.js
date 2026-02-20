// ui.js - Update user interface and display data
// so this ui will be focused on the 7 days trend will also the chart
import { markMatchingText, createRegexFromInput } from './search.js';
import { getFilteredAndSortedRecords, calculateDashboardStats, calculateRemainingBudget } from './state.js';


export function displayRecordsInTable(searchQuery) {
    const records = getFilteredAndSortedRecords();
    const tableBody = document.getElementById('records-body');
    tableBody.innerHTML = ''; 

    
    const highlightRegex = createRegexFromInput(searchQuery);

    
    records.forEach(record => {
        const row = document.createElement('tr');
        
        
        const descriptionHTML = markMatchingText(record.description, highlightRegex);
        const categoryHTML = markMatchingText(record.category, highlightRegex);

        row.innerHTML = `
            <td>${descriptionHTML}</td>
            <td>$${record.amount.toFixed(2)}</td>
            <td>${categoryHTML}</td>
            <td>${record.date}</td>
            <td>
                <button class="edit-record-btn" data-record-id="${record.id}">Edit</button>
                <button class="delete-record-btn" data-record-id="${record.id}">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}


export function updateDashboardDisplay() {
    const stats = calculateDashboardStats();
    
    
    document.getElementById('total-records').textContent = stats.totalRecords;
    document.getElementById('total-amount').textContent = `$${stats.totalAmount.toFixed(2)}`;
    document.getElementById('top-category').textContent = stats.topCategory;

    
    drawSpendingTrendChart(stats.last7DaysTotal);

    
    refreshBudgetCapDisplay();
}


function drawSpendingTrendChart(sevenDayTotal) {
    const canvas = document.getElementById('trend-chart');
    const context = canvas.getContext('2d');
    
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    
    context.fillStyle = '#8B6F47';
    const barWidth = canvas.width / 7;
    
    for (let day = 0; day < 7; day++) {
        
        const barHeight = Math.min(sevenDayTotal / 7 * (day + 1) / 10, canvas.height);
        context.fillRect(day * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    }
}


export function showRecordForm(recordToEdit = null) {
    const form = document.getElementById('record-form');
    const submitButton = document.getElementById('submit-record');
    const cancelButton = document.getElementById('cancel-edit');

    if (recordToEdit) {
        
        document.getElementById('description').value = recordToEdit.description;
        document.getElementById('amount').value = recordToEdit.amount;
        document.getElementById('category').value = recordToEdit.category;
        document.getElementById('date').value = recordToEdit.date;
        
        submitButton.textContent = 'Update Record';
        submitButton.dataset.recordId = recordToEdit.id;
        cancelButton.style.display = 'inline-block';
    } else {
        
        form.reset();
        submitButton.textContent = 'Add Record';
        delete submitButton.dataset.recordId;
        cancelButton.style.display = 'none';
    }

    
    document.getElementById('add-record').scrollIntoView({ behavior: 'smooth' });
}


export function resetRecordForm() {
    document.getElementById('record-form').reset();
    document.getElementById('submit-record').textContent = 'Add Record';
    delete document.getElementById('submit-record').dataset.recordId;
    document.getElementById('cancel-edit').style.display = 'none';
    clearFormErrors();
}


export function displayFormErrors(errorMap) {
    
    clearFormErrors();
    
    
    for (const [fieldName, errorMessage] of Object.entries(errorMap)) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
}


export function clearFormErrors() {
    document.querySelectorAll('.error').forEach(element => {
        element.textContent = '';
    });
}


export function refreshBudgetCapDisplay() {
    const remaining = calculateRemainingBudget();
    const statusElement = document.getElementById('cap-status');
    
    if (remaining >= 0) {
        statusElement.textContent = `Remaining: $${remaining.toFixed(2)}`;
        statusElement.setAttribute('aria-live', 'polite');
    } else {
        statusElement.textContent = `Over budget by: $${Math.abs(remaining).toFixed(2)}`;
        statusElement.setAttribute('aria-live', 'assertive');
    }
}


export function displayStatusMessage(message, isError = false) {
    const statusElement = document.getElementById('import-status');
    statusElement.textContent = message;
    statusElement.setAttribute('aria-live', isError ? 'assertive' : 'polite');
}