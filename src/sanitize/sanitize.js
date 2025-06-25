import xss from 'xss';

export function sanitizeInput(input) {
    if (typeof input === 'string') {
        return xss(input);
    } else if (typeof input === 'number' || input === null || input === undefined) {
        return input;
    } else if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    } else if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (let key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    } else {
        return input; 
    }
}
