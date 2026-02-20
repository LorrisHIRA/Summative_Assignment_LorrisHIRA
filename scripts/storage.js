// storage.js - Manages browser data persistence

const DATA_STORAGE_NAME = 'expense_records';

// Retrieve all records from browser's localStorage
export function retrieveAllRecords() {
    try {
        const rawData = localStorage.getItem(DATA_STORAGE_NAME);
        // If nothing stored, return empty array; otherwise parse JSON
        if (rawData === null) {
            return [];
        }
        return JSON.parse(rawData);
    } catch (err) {
        console.warn('Could not retrieve records:', err);
        return [];
    }
}

// Save records to browser's localStorage
export function storeRecords(recordList) {
    try {
        const jsonString = JSON.stringify(recordList);
        localStorage.setItem(DATA_STORAGE_NAME, jsonString);
    } catch (err) {
        console.error('Unable to save records:', err);
    }
}

// Download records as a JSON file to user's computer
export function downloadRecordsAsJSON(recordList) {
    // Create a JSON string with nice formatting (2-space indentation)
    const jsonContent = JSON.stringify(recordList, null, 2);
    // Convert string to blob (binary data)
    const fileBlob = new Blob([jsonContent], { type: 'application/json' });
    // Create URL pointing to the blob
    const downloadURL = URL.createObjectURL(fileBlob);
    
    // Create a temporary link and trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadURL;
    downloadLink.download = 'expense-records.json';
    downloadLink.click();
    
    // Clean up the URL
    URL.revokeObjectURL(downloadURL);
}

// Read and validate JSON file from user upload
export function uploadRecordsFromFile(fileObject) {
    return new Promise((resolvePromise, rejectPromise) => {
        const fileReader = new FileReader();
        
        // When file finishes reading
        fileReader.onload = (readEvent) => {
            try {
                // Parse the file content as JSON
                const parsedData = JSON.parse(readEvent.target.result);
                
                // Validate it's an array of proper record objects
                if (Array.isArray(parsedData)) {
                    const allValid = parsedData.every(record => isValidRecord(record));
                    if (allValid) {
                        resolvePromise(parsedData);
                    } else {
                        rejectPromise(new Error('Some records have invalid structure'));
                    }
                } else {
                    rejectPromise(new Error('File must contain an array of records'));
                }
            } catch (parseErr) {
                rejectPromise(new Error('Invalid JSON format'));
            }
        };
        
        // Handle file reading errors
        fileReader.onerror = () => {
            rejectPromise(new Error('Failed to read file'));
        };
        
        // Start reading the file as text
        fileReader.readAsText(fileObject);
    });
}

// Check if a record has all required fields with correct types
function isValidRecord(rec) {
    // All these fields must exist and have the right type
    return (
        rec &&
        typeof rec.id === 'string' &&
        typeof rec.description === 'string' &&
        typeof rec.amount === 'number' &&
        typeof rec.category === 'string' &&
        typeof rec.date === 'string' &&
        typeof rec.createdAt === 'string' &&
        typeof rec.updatedAt === 'string'
    );
}