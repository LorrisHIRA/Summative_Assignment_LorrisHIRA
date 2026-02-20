// search.js - Search functionality with regex

// Safely create a regex pattern from user input
// Uses try-catch to prevent crashes from invalid patterns
export function createRegexFromInput(userInput, flags = 'i') {
    // If no input, return null
    if (!userInput) return null;

    try {
        // Try to create a regex object from the input
        const regexObj = new RegExp(userInput, flags);
        return regexObj;
    } catch (regexError) {
        // If regex is invalid, log the error and return null
        console.warn('Invalid regex pattern:', regexError.message);
        return null;
    }
}

// Highlight matching text in a string using HTML <mark> tags
// This makes search results visible without breaking accessibility
export function markMatchingText(text, regex) {
    if (!regex) return text; // If no regex, return original text

    // Replace all matches with <mark> tags around them
    // The match (m) is the actual text that matched the pattern
    return text.replace(regex, match => `<mark>${match}</mark>`);
}

// Filter records based on search term
// Checks description, category, amount, and date fields
export function filterRecordsBySearch(recordsList, searchQuery) {
    // If no search query, return all records
    if (!searchQuery) {
        return recordsList;
    }

    // Try to create a regex from the search query
    const searchRegex = createRegexFromInput(searchQuery);
    if (!searchRegex) {
        // If regex is invalid, return empty array (no results)
        return [];
    }

    // Filter records - keep only those where ANY field matches
    return recordsList.filter(record => {
        // Check if search matches in any of these fields
        const matchesDescription = searchRegex.test(record.description);
        const matchesCategory = searchRegex.test(record.category);
        const matchesAmount = searchRegex.test(record.amount.toString());
        const matchesDate = searchRegex.test(record.date);

        // Return true if any field matches
        return matchesDescription || matchesCategory || matchesAmount || matchesDate;
    });
}

// Sort records based on a chosen field
export function arrangeRecordsByField(recordsList, sortField, ascending = true) {
    // Create a copy so we don't modify the original array
    const sortedList = [...recordsList];

    // Sort using a comparison function
    sortedList.sort((recordA, recordB) => {
        let valueA, valueB;

        // Get the values to compare based on sort field
        if (sortField === 'date') {
            // Convert dates to Date objects for proper comparison
            valueA = new Date(recordA.date);
            valueB = new Date(recordB.date);
        } else if (sortField === 'description') {
            // Convert to lowercase for case-insensitive sorting
            valueA = recordA.description.toLowerCase();
            valueB = recordB.description.toLowerCase();
        } else if (sortField === 'amount') {
            // Use numeric values directly
            valueA = recordA.amount;
            valueB = recordB.amount;
        } else {
            // No sorting for unknown fields
            return 0;
        }

        // Compare the values
        if (valueA < valueB) {
            return ascending ? -1 : 1; // -1 means A comes first
        }
        if (valueA > valueB) {
            return ascending ? 1 : -1; // 1 means B comes first
        }
        // Values are equal
        return 0;
    });

    return sortedList;
}