// state.js - Application state and data management

import { retrieveAllRecords, storeRecords } from './storage.js';
import { arrangeRecordsByField, filterRecordsBySearch } from './search.js';

// Load records from storage on startup
let allExpenseRecords = retrieveAllRecords();

// Current sorting configuration
let currentSortingConfig = { 
    field: 'date', 
    isAscending: false 
};

// Current search term
let activeSearchQuery = '';

// Budget limit
let monthlyBudgetLimit = 0;

// Currency conversion rates (hardcoded, can be changed in settings)
let exchangeRates = { 
    USD: 1, 
    EUR: 0.85, 
    GBP: 0.73 
};

// ===== RECORD CRUD OPERATIONS =====

// Get all records
export function getAllRecords() {
    return allExpenseRecords;
}

// Add a new record
export function createNewRecord(recordData) {
    const newRecord = {
        ...recordData,
        id: `txn_${Date.now()}`, // Unique ID based on timestamp
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    allExpenseRecords.push(newRecord);
    storeRecords(allExpenseRecords);
    return newRecord;
}

// Update an existing record
export function modifyRecord(recordId, updatedData) {
    const recordIndex = allExpenseRecords.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        allExpenseRecords[recordIndex] = {
            ...allExpenseRecords[recordIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        storeRecords(allExpenseRecords);
        return allExpenseRecords[recordIndex];
    }
    return null;
}

// Delete a record
export function removeRecord(recordId) {
    allExpenseRecords = allExpenseRecords.filter(r => r.id !== recordId);
    storeRecords(allExpenseRecords);
}

// ===== SEARCH AND SORT =====

// Get records after applying search and sort
export function getFilteredAndSortedRecords() {
    // First apply search filter
    let filtered = filterRecordsBySearch(allExpenseRecords, activeSearchQuery);
    
    // Then apply sorting
    return arrangeRecordsByField(filtered, currentSortingConfig.field, currentSortingConfig.isAscending);
}

// Update the search query
export function updateSearchQuery(newQuery) {
    activeSearchQuery = newQuery;
}

// Update the sorting configuration and toggle ascending/descending
export function updateSorting(fieldName) {
    // If clicking the same field, toggle ascending/descending
    if (currentSortingConfig.field === fieldName) {
        currentSortingConfig.isAscending = !currentSortingConfig.isAscending;
    } else {
        // If clicking a new field, set it as current and default to ascending
        currentSortingConfig.field = fieldName;
        currentSortingConfig.isAscending = fieldName === 'date' ? false : true;
    }
}

// ===== STATISTICS =====

// Calculate various statistics for the dashboard
export function calculateDashboardStats() {
    const totalCount = allExpenseRecords.length;
    
    // Sum all amounts
    const totalSpent = allExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // Count occurrences of each category
    const categoryCounts = allExpenseRecords.reduce((counts, record) => {
        counts[record.category] = (counts[record.category] || 0) + 1;
        return counts;
    }, {});
    
    // Find the category with the most records
    const mostUsedCategory = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b)
        : 'None';

    // Get records from the last 7 days
    const last7DaysRecords = allExpenseRecords.filter(record => {
        const recordDate = new Date(record.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
    });
    
    // Sum last 7 days spending
    const last7DaysSpent = last7DaysRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
        totalRecords: totalCount,
        totalAmount: totalSpent,
        topCategory: mostUsedCategory,
        last7DaysTotal: last7DaysSpent
    };
}

// Calculate remaining budget
export function calculateRemainingBudget() {
    const total = calculateDashboardStats().totalAmount;
    return monthlyBudgetLimit - total;
}

// ===== BUDGET CAP =====

export function getBudgetCap() {
    return monthlyBudgetLimit;
}

export function setBudgetCap(newLimit) {
    monthlyBudgetLimit = newLimit;
}

// ===== CURRENCY RATES =====

export function getExchangeRates() {
    return exchangeRates;
}

export function setExchangeRates(newRates) {
    exchangeRates = newRates;
    localStorage.setItem('financeTracker:rates', JSON.stringify(newRates));
}

// ===== SETTINGS =====

export function loadAllSettings() {
    try {
        const savedRates = localStorage.getItem('financeTracker:rates');
        if (savedRates) {
            exchangeRates = JSON.parse(savedRates);
        }
        
        const savedCap = localStorage.getItem('financeTracker:cap');
        if (savedCap) {
            monthlyBudgetLimit = parseFloat(savedCap);
        }
    } catch (err) {
        console.warn('Could not load settings:', err);
    }
}

// Load settings on startup
loadAllSettings();