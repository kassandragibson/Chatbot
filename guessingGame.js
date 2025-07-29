/**
 * This module contains all the logic for the "Guess the Number" game.
 */

// An object to hold the state of the current game.
const guessingGame = {
    secretNumber: 0,
    maxNumber: 100,
    currentAttempts: 0,
    maxAttempts: 0, // A value of 0 means infinite attempts.
    isActive: false
};

/**
 * Starts a new guessing game with specific difficulty settings.
 * @param {number} maxNumber - The upper bound for the secret number (e.g., 50, 100).
 * @param {number} maxAttempts - The number of allowed guesses. Use 0 for infinite.
 */
function startNewGuessingGame(maxNumber, maxAttempts) {
    guessingGame.maxNumber = maxNumber;
    guessingGame.maxAttempts = maxAttempts;
    guessingGame.secretNumber = Math.floor(Math.random() * guessingGame.maxNumber) + 1;
    guessingGame.currentAttempts = 0;
    guessingGame.isActive = true;
    // Log to console for easier debugging.
    console.log(`New game started. Secret: ${guessingGame.secretNumber}, Max: ${guessingGame.maxNumber}, Tries: ${guessingGame.maxAttempts}`);
}

/**
 * Processes the user's guess and returns feedback.
 * @param {string} userInput - The number guessed by the user as a string.
 * @returns {string} A feedback message for the user.
 */
function handleGuess(userInput) {
    // First, check if a game is even active.
    if (!guessingGame.isActive) {
        return "The game is over. Please select a difficulty level to play again.";
    }

    const guess = parseInt(userInput, 10);

    // Check if the input is a valid number within the game's bounds.
    if (isNaN(guess) || guess < 1 || guess > guessingGame.maxNumber) {
        return `Please enter a valid number between 1 and ${guessingGame.maxNumber}.`;
    }

    guessingGame.currentAttempts++;

    // Check for a correct guess first.
    if (guess === guessingGame.secretNumber) {
        guessingGame.isActive = false; // End the game
        return `You got it! The number was ${guessingGame.secretNumber}. It took you ${guessingGame.currentAttempts} attempts. <br><br>Select a difficulty to play again.`;
    }

    // Check if the user has run out of attempts (if a limit is set).
    if (guessingGame.maxAttempts > 0 && guessingGame.currentAttempts >= guessingGame.maxAttempts) {
        guessingGame.isActive = false; // End the game
        return `Sorry, you've run out of attempts. The secret number was ${guessingGame.secretNumber}. <br><br>Select a difficulty to play again.`;
    }

    // Provide hints if the game is still ongoing.
    const attemptsLeft = guessingGame.maxAttempts - guessingGame.currentAttempts;
    const attemptsMessage = guessingGame.maxAttempts > 0 ? `You have ${attemptsLeft} attempts left.` : `You have unlimited attempts.`;

    if (guess < guessingGame.secretNumber) {
        return `Too low! Try again. ${attemptsMessage}`;
    } else { // guess > guessingGame.secretNumber
        return `Too high! Try again. ${attemptsMessage}`;
    }
}
