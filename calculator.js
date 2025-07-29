/**
 * This module contains the logic for the calculator feature.
 */

/**
 * Safely evaluates a mathematical expression from a string.
 * @param {string} expression - The mathematical expression to evaluate (e.g., "5 * (2 + 3)").
 * @returns {string} The result of the calculation or an error message.
 */
function evaluateExpression(expression) {
    try {
        // Sanitize the expression to only allow numbers and basic math operators.
        // This is a crucial security step to prevent arbitrary code execution.
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');

        if (sanitizedExpression !== expression) {
            return "Sorry, I can only handle numbers and basic math operators (+, -, *, /).";
        }
        
        // Use the Function constructor for a safer way to evaluate the expression
        // compared to the dangerous eval().
        const result = new Function('return ' + sanitizedExpression)();

        // Check if the result is a valid number.
        if (isNaN(result) || !isFinite(result)) {
            return "That's not a valid calculation. Please try again.";
        }

        return `The result is: <strong>${result}</strong>`;

    } catch (error) {
        // Catch any errors from invalid syntax.
        console.error("Calculator error:", error);
        return "I couldn't understand that calculation. Please check the format and try again.";
    }
}
