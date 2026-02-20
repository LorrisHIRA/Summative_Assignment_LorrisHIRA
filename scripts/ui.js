// ui.js - Update user interface and display data

import { markMatchingText, createRegexFromInput } from './search.js';
import { getFilteredAndSortedRecords, calculateDashboardStats, calculateRemainingBudget } from './state.js';

// Render all records in the table, applying search highlighting
export function displayRecordsInTable(searchQuery) {
    const records = getFilteredAndSortedRecords();
    const tableBody = document.getElementById('records-body');
    tableBody.innerHTML = ''; // Clear existing rows

    // Create a regex for highlighting matches
    const highlightRegex = createRegexFromInput(searchQuery);

    // Add each record as a table row
    records.forEach(record => {
        const row = document.createElement('tr');
        
        // Apply highlighting to searchable fields
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

// Update all dashboard statistics
export function updateDashboardDisplay() {
    const stats = calculateDashboardStats();
    
    // Update stat cards
    document.getElementById('total-records').textContent = stats.totalRecords;
    document.getElementById('total-amount').textContent = `$${stats.totalAmount.toFixed(2)}`;
    document.getElementById('top-category').textContent = stats.topCategory;

    // Draw a simple trend chart for the last 7 days
    drawSpendingTrendChart(stats.last7DaysTotal);

    // Update budget cap status
    refreshBudgetCapDisplay();
}

// Draw a simple bar chart showing trend
function drawSpendingTrendChart(sevenDayTotal) {
    const canvas = document.getElementById('trend-chart');
    const context = canvas.getContext('2d');
    
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw 7 bars representing days
    context.fillStyle = '#8B6F47';
    const barWidth = canvas.width / 7;
    
    for (let day = 0; day < 7; day++) {
        // Calculate height proportionally
        const barHeight = Math.min(sevenDayTotal / 7 * (day + 1) / 10, canvas.height);
        context.fillRect(day * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    }
}

// Display form for adding/editing a record
export function showRecordForm(recordToEdit = null) {
    const form = document.getElementById('record-form');
    const submitButton = document.getElementById('submit-record');
    const cancelButton = document.getElementById('cancel-edit');

    if (recordToEdit) {
        // Populate form with existing record data
        document.getElementById('description').value = recordToEdit.description;
        document.getElementById('amount').value = recordToEdit.amount;
        document.getElementById('category').value = recordToEdit.category;
        document.getElementById('date').value = recordToEdit.date;
        
        submitButton.textContent = 'Update Record';
        submitButton.dataset.recordId = recordToEdit.id;
        cancelButton.style.display = 'inline-block';
    } else {
        // Clear form for new record
        form.reset();
        submitButton.textContent = 'Add Record';
        delete submitButton.dataset.recordId;
        cancelButton.style.display = 'none';
    }

    // Scroll to form
    document.getElementById('add-record').scrollIntoView({ behavior: 'smooth' });
}

// Clear form and hide edit mode
export function resetRecordForm() {
    document.getElementById('record-form').reset();
    document.getElementById('submit-record').textContent = 'Add Record';
    delete document.getElementById('submit-record').dataset.recordId;
    document.getElementById('cancel-edit').style.display = 'none';
    clearFormErrors();
}

// Display validation errors on the form
export function displayFormErrors(errorMap) {
    // First clear all previous errors
    clearFormErrors();
    
    // Display each error next to its field
    for (const [fieldName, errorMessage] of Object.entries(errorMap)) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
}

// Clear all error messages from form
export function clearFormErrors() {
    document.querySelectorAll('.error').forEach(element => {
        element.textContent = '';
    });
}

// Update the budget cap status message
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

// Show feedback messages to user
export function displayStatusMessage(message, isError = false) {
    const statusElement = document.getElementById('import-status');
    statusElement.textContent = message;
    statusElement.setAttribute('aria-live', isError ? 'assertive' : 'polite');
}