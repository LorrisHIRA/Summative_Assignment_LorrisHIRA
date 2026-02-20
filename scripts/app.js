//   So this is the Main application controller and event handler

import {
    createNewRecord, modifyRecord, removeRecord,
    updateSearchQuery, updateSorting, getAllRecords,
    setBudgetCap, getBudgetCap, 
    setExchangeRates, getExchangeRates
} from './state.js';

import {
    downloadRecordsAsJSON, uploadRecordsFromFile
} from './storage.js';

import {
    validateAllFormFields
} from './validators.js';

import {
    displayRecordsInTable, updateDashboardDisplay, showRecordForm, 
    resetRecordForm, displayFormErrors, clearFormErrors, displayStatusMessage
} from './ui.js';


function initializeApp() {
    
    displayRecordsInTable('');
    updateDashboardDisplay();

    
    document.getElementById('search-input').addEventListener('input', handleSearchInput);

    
    document.getElementById('sort-date').addEventListener('click', () => handleSortClick('date'));
    document.getElementById('sort-description').addEventListener('click', () => handleSortClick('description'));
    document.getElementById('sort-amount').addEventListener('click', () => handleSortClick('amount'));

    
    document.getElementById('record-form').addEventListener('submit', handleFormSubmission);
    document.getElementById('cancel-edit').addEventListener('click', resetRecordForm);

    
    document.getElementById('records-body').addEventListener('click', handleRecordButtonClick);

    
    document.getElementById('set-cap').addEventListener('click', handleSetBudgetCap);
    document.getElementById('cap-input').value = getBudgetCap();

    
    document.getElementById('save-rates').addEventListener('click', handleSaveExchangeRates);
    
    
    const currentRates = getExchangeRates();
    document.getElementById('usd-rate').value = currentRates.USD;
    document.getElementById('eur-rate').value = currentRates.EUR;
    document.getElementById('gbp-rate').value = currentRates.GBP;

    
    document.getElementById('export-data').addEventListener('click', handleExportData);
    document.getElementById('import-data').addEventListener('click', handleImportData);
}


function handleSearchInput(event) {
    const searchQuery = event.target.value;
    updateSearchQuery(searchQuery);
    displayRecordsInTable(searchQuery);
}


function handleSortClick(fieldName) {
    updateSorting(fieldName);
    const searchQuery = document.getElementById('search-input').value;
    displayRecordsInTable(searchQuery);
}


function handleFormSubmission(event) {
    event.preventDefault();

    //  here it will Collect form data
    const formData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    
    const validationErrors = validateAllFormFields(formData);
    
    if (Object.keys(validationErrors).length > 0) {
        
        displayFormErrors(validationErrors);
        return;
    }

    
    const submitBtn = document.getElementById('submit-record');
    
    if (submitBtn.dataset.recordId) {
        
        modifyRecord(submitBtn.dataset.recordId, formData);
    } else {
        
        createNewRecord(formData);
    }

    
    resetRecordForm();
    const searchQuery = document.getElementById('search-input').value;
    displayRecordsInTable(searchQuery);
    updateDashboardDisplay();
}


function handleRecordButtonClick(event) {
    const recordId = event.target.dataset.recordId;
    if (!recordId) return;

    if (event.target.classList.contains('edit-record-btn')) {
        
        const record = getAllRecords().find(r => r.id === recordId);
        if (record) {
            showRecordForm(record);
        }
    } else if (event.target.classList.contains('delete-record-btn')) {
        
        if (confirm('Are you sure you want to delete this record?')) {
            removeRecord(recordId);
            const searchQuery = document.getElementById('search-input').value;
            displayRecordsInTable(searchQuery);
            updateDashboardDisplay();
        }
    }
}


function handleSetBudgetCap() {
    const capValue = parseFloat(document.getElementById('cap-input').value);
    if (!isNaN(capValue) && capValue >= 0) {
        setBudgetCap(capValue);
        localStorage.setItem('financeTracker:cap', capValue);
        updateDashboardDisplay();
        displayStatusMessage('Budget cap updated successfully.');
    } else {
        displayStatusMessage('Please enter a valid budget cap amount.', true);
    }
}


function handleSaveExchangeRates() {
    const newRates = {
        USD: parseFloat(document.getElementById('usd-rate').value) || 1,
        EUR: parseFloat(document.getElementById('eur-rate').value) || 0.85,
        GBP: parseFloat(document.getElementById('gbp-rate').value) || 0.73
    };
    
    setExchangeRates(newRates);
    displayStatusMessage('Exchange rates saved successfully.');
}


function handleExportData() {
    const allRecords = getAllRecords();
    downloadRecordsAsJSON(allRecords);
    displayStatusMessage('Data exported successfully.');
}

// here it will be  importing data from JSON  file
async function handleImportData() {
    const fileInput = document.getElementById('import-file');
    
    if (!fileInput.files[0]) {
        displayStatusMessage('Please select a JSON file to import.', true);
        return;
    }

    try {
        const importedData = await uploadRecordsFromFile(fileInput.files[0]);
        // Save imported data and reload page
        localStorage.setItem('financeTracker:data', JSON.stringify(importedData));
        displayStatusMessage('Data imported successfully. Reloading...');
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        displayStatusMessage(`Import failed: ${error.message}`, true);
    }
}


document.addEventListener('DOMContentLoaded', initializeApp);