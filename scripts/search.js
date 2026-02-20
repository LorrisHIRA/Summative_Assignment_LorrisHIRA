// so tis sarch .js will  Search functionality with regex



export function createRegexFromInput(userInput, flags = 'i') {
    
    if (!userInput) return null;

    try {
        
        const regexObj = new RegExp(userInput, flags);
        return regexObj;
    } catch (regexError) {
        
        console.warn('Invalid regex pattern:', regexError.message);
        return null;
    }
}



export function markMatchingText(text, regex) {
    if (!regex) return text; 

    
    
    return text.replace(regex, match => `<mark>${match}</mark>`);
}



export function filterRecordsBySearch(recordsList, searchQuery) {
    
    if (!searchQuery) {
        return recordsList;
    }

    //  here is where you can create a regex from the search 
    const searchRegex = createRegexFromInput(searchQuery);
    if (!searchRegex) {
        
        return [];
    }

    
    return recordsList.filter(record => {
        
        const matchesDescription = searchRegex.test(record.description);
        const matchesCategory = searchRegex.test(record.category);
        const matchesAmount = searchRegex.test(record.amount.toString());
        const matchesDate = searchRegex.test(record.date);

        
        return matchesDescription || matchesCategory || matchesAmount || matchesDate;
    });
}

//  so here it will Sort records based on a chosen field
export function arrangeRecordsByField(recordsList, sortField, ascending = true) {
    
    const sortedList = [...recordsList];

    
    sortedList.sort((recordA, recordB) => {
        let valueA, valueB;

        
        if (sortField === 'date') {
            
            valueA = new Date(recordA.date);
            valueB = new Date(recordB.date);
        } else if (sortField === 'description') {
            
            valueA = recordA.description.toLowerCase();
            valueB = recordB.description.toLowerCase();
        } else if (sortField === 'amount') {
            
            valueA = recordA.amount;
            valueB = recordB.amount;
        } else {
            
            return 0;
        }

        
        if (valueA < valueB) {
            return ascending ? -1 : 1; 
        }
        if (valueA > valueB) {
            return ascending ? 1 : -1; 
        }
        
        return 0;
    });

    return sortedList;
}