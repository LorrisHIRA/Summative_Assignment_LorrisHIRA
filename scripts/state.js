//  so the state file will be focused on data management

import { retrieveAllRecords, storeRecords } from './storage.js';
import { arrangeRecordsByField, filterRecordsBySearch } from './search.js';


let allExpenseRecords = retrieveAllRecords();


let currentSortingConfig = { 
    field: 'date', 
    isAscending: false 
};


let activeSearchQuery = '';


let monthlyBudgetLimit = 0;


let exchangeRates = { 
    USD: 1, 
    EUR: 0.85, 
    GBP: 0.73 
};

// this is the section for the records addind and deleting


export function getAllRecords() {
    return allExpenseRecords;
}


export function createNewRecord(recordData) {
    const newRecord = {
        ...recordData,
        id: `txn_${Date.now()}`, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    allExpenseRecords.push(newRecord);
    storeRecords(allExpenseRecords);
    return newRecord;
}


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


export function removeRecord(recordId) {
    allExpenseRecords = allExpenseRecords.filter(r => r.id !== recordId);
    storeRecords(allExpenseRecords);
}




export function getFilteredAndSortedRecords() {
    
    let filtered = filterRecordsBySearch(allExpenseRecords, activeSearchQuery);
    
    
    return arrangeRecordsByField(filtered, currentSortingConfig.field, currentSortingConfig.isAscending);
}


export function updateSearchQuery(newQuery) {
    activeSearchQuery = newQuery;
}


export function updateSorting(fieldName) {
    
    if (currentSortingConfig.field === fieldName) {
        currentSortingConfig.isAscending = !currentSortingConfig.isAscending;
    } else {
        
        currentSortingConfig.field = fieldName;
        currentSortingConfig.isAscending = fieldName === 'date' ? false : true;
    }
}

// so this is the section of the statisctics

export function calculateDashboardStats() {
    const totalCount = allExpenseRecords.length;
    
    // Sum all amounts
    const totalSpent = allExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
    
    
    const categoryCounts = allExpenseRecords.reduce((counts, record) => {
        counts[record.category] = (counts[record.category] || 0) + 1;
        return counts;
    }, {});
    
    
    const mostUsedCategory = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b)
        : 'None';

    
    const last7DaysRecords = allExpenseRecords.filter(record => {
        const recordDate = new Date(record.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
    });
    
    
    const last7DaysSpent = last7DaysRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
        totalRecords: totalCount,
        totalAmount: totalSpent,
        topCategory: mostUsedCategory,
        last7DaysTotal: last7DaysSpent
    };
}


export function calculateRemainingBudget() {
    const total = calculateDashboardStats().totalAmount;
    return monthlyBudgetLimit - total;
}



export function getBudgetCap() {
    return monthlyBudgetLimit;
}

export function setBudgetCap(newLimit) {
    monthlyBudgetLimit = newLimit;
}



export function getExchangeRates() {
    return exchangeRates;
}

export function setExchangeRates(newRates) {
    exchangeRates = newRates;
    localStorage.setItem('financeTracker:rates', JSON.stringify(newRates));
}



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


loadAllSettings();