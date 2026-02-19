// validators.js - Input validation using regex patterns

// Collection of regex validation rules
const validationRules = {
    // Description: no leading/trailing spaces, no consecutive spaces
    // \S means non-whitespace character
    // (?:.*\S)? means optionally match anything ending with non-whitespace
    descriptionFormat: {
        pattern: /^\S(?:.*\S)?$/,
        message: 'Description: remove leading/trailing spaces'
    },

    // Amount: must be a valid number (whole or decimal up to 2 places)
    // Allows: 0, 5, 10.5, 99.99 but not: 05, 10.999
    amountFormat: {
        pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        message: 'Amount: must be a valid number with max 2 decimal places'
    },

    // Date: must be YYYY-MM-DD format
    // Year: 4 digits, Month: 01-12, Day: 01-31
    dateFormat: {
        pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: 'Date: use YYYY-MM-DD format'
    },

    // Category: only letters, spaces, and hyphens
    // Examples: "Food", "Books", "Fast Food", "School-Supplies"
    categoryFormat: {
        pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        message: 'Category: only letters, spaces, and hyphens allowed'
    },

    // Advanced pattern: detect duplicate consecutive words
    // \b = word boundary, (\w+) = capture a word, \s+ = spaces, \1 = backreference to same word
    duplicateWords: {
        pattern: /\b(\w+)\s+\1\b/i,
        message: 'Description: contains duplicate consecutive words'
    }
};

// Validate a single field based on its type
export function validateSingleField(fieldName, fieldValue) {
    // Handle description - check both regular format and duplicate words
    if (fieldName === 'description') {
        // First check format
        const formatCheck = validationRules.descriptionFormat.pattern.test(fieldValue);
        if (!formatCheck) {
            return validationRules.descriptionFormat.message;
        }
        
        // Then check for duplicates
        const hasDuplicates = validationRules.duplicateWords.pattern.test(fieldValue);
        if (hasDuplicates) {
            return validationRules.duplicateWords.message;
        }
        
        return null; // No errors
    }

    // For other fields, just check the pattern
    const rule = validationRules[fieldName + 'Format'];
    if (!rule) return null;

    const isValid = rule.pattern.test(fieldValue);
    return isValid ? null : rule.message;
}

// Special validation for dates - check if it's actually a real calendar date
export function isRealDate(dateString) {
    const date = new Date(dateString);
    // Ensure the date we parsed matches what was entered
    return date.toISOString().slice(0, 10) === dateString;
}

// Validate entire form at once
export function validateAllFormFields(formInputs) {
    const errorMessages = {};

    // Check each field in the form
    for (const [fieldName, fieldValue] of Object.entries(formInputs)) {
        let error = null;

        // Special handling for date
        if (fieldName === 'date') {
            // First check format
            const formatError = validateSingleField(fieldName, fieldValue);
            if (formatError) {
                error = formatError;
            } else if (!isRealDate(fieldValue)) {
                error = 'Date: invalid calendar date';
            }
        } else {
            error = validateSingleField(fieldName, fieldValue);
        }

        // If there's an error, add it to the collection
        if (error) {
            errorMessages[fieldName] = error;
        }
    }

    return errorMessages;
}