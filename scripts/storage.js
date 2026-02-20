// this storage file it will be focused on data management with json file with exporting 

const DATA_STORAGE_NAME = 'expense_records';


export function retrieveAllRecords() {
    try {
        const rawData = localStorage.getItem(DATA_STORAGE_NAME);
        
        if (rawData === null) {
            return [];
        }
        return JSON.parse(rawData);
    } catch (err) {
        console.warn('Could not retrieve records:', err);
        return [];
    }
}


export function storeRecords(recordList) {
    try {
        const jsonString = JSON.stringify(recordList);
        localStorage.setItem(DATA_STORAGE_NAME, jsonString);
    } catch (err) {
        console.error('Unable to save records:', err);
    }
}

// here it will  download records as a JSON file to user's computer
export function downloadRecordsAsJSON(recordList) {
    
    const jsonContent = JSON.stringify(recordList, null, 2);
    
    const fileBlob = new Blob([jsonContent], { type: 'application/json' });
    
    const downloadURL = URL.createObjectURL(fileBlob);
    
    
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadURL;
    downloadLink.download = 'expense-records.json';
    downloadLink.click();
    
    
    URL.revokeObjectURL(downloadURL);
}

// here this function will read and validate JSON file from user upload
export function uploadRecordsFromFile(fileObject) {
    return new Promise((resolvePromise, rejectPromise) => {
        const fileReader = new FileReader();
        
        
        fileReader.onload = (readEvent) => {
            try {
                
                const parsedData = JSON.parse(readEvent.target.result);
                
                
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
        
        
        fileReader.onerror = () => {
            rejectPromise(new Error('Failed to read file'));
        };
        
        
        fileReader.readAsText(fileObject);
    });
}


function isValidRecord(rec) {
    
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