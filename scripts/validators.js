// so i added the regex here as they were given in the description they will  be used in this validators.js follwong rules of regex with user input 

const validationRules = {
    
    descriptionFormat: {
        pattern: /^\S(?:.*\S)?$/,
        message: 'Description: remove leading/trailing spaces'
    },

    
    amountFormat: {
        pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        message: 'Amount: must be a valid number with max 2 decimal places'
    },

    
    
    dateFormat: {
        pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        message: 'Date: use YYYY-MM-DD format'
    },

    
    
    categoryFormat: {
        pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        message: 'Category: only letters, spaces, and hyphens allowed'
    },

    
    
    duplicateWords: {
        pattern: /\b(\w+)\s+\1\b/i,
        message: 'Description: contains duplicate consecutive words'
    }
};


export function validateSingleField(fieldName, fieldValue) {

    if (fieldName === 'description') {
        
        const formatCheck = validationRules.descriptionFormat.pattern.test(fieldValue);
        if (!formatCheck) {
            return validationRules.descriptionFormat.message;
        }
        
        
        const hasDuplicates = validationRules.duplicateWords.pattern.test(fieldValue);
        if (hasDuplicates) {
            return validationRules.duplicateWords.message;
        }
        
        return null; // 
    }

    
    const rule = validationRules[fieldName + 'Format'];
    if (!rule) return null;

    const isValid = rule.pattern.test(fieldValue);
    return isValid ? null : rule.message;
}


export function isRealDate(dateString) {
    const date = new Date(dateString);
    
    return date.toISOString().slice(0, 10) === dateString;
}


export function validateAllFormFields(formInputs) {
    const errorMessages = {};

    
    for (const [fieldName, fieldValue] of Object.entries(formInputs)) {
        let error = null;

        
        if (fieldName === 'date') {
            
            const formatError = validateSingleField(fieldName, fieldValue);
            if (formatError) {
                error = formatError;
            } else if (!isRealDate(fieldValue)) {
                error = 'Date: invalid calendar date';
            }
        } else {
            error = validateSingleField(fieldName, fieldValue);
        }

        
        if (error) {
            errorMessages[fieldName] = error;
        }
    }

    return errorMessages;
}