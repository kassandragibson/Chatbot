// Get references to the essential HTML elements for interaction.
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');
const menuButton = document.getElementById('menu-toggle-button');

// IMPORTANT: This line expects a constant named API_KEY to be defined in config.js
// It makes the API key available to all functions in this file and in other modules.
const apiKey = typeof API_KEY !== 'undefined' ? API_KEY : '';

// Global state variables to manage the application's behavior.
let currentMode = 'menu'; // Tracks the current feature: 'menu', 'chat', 'jokes', etc.
let chatHistory = [];     // Stores the conversation history for context with the AI.

/**
 * Creates and appends a new message bubble to the chat window.
 * @param {string} sender - The sender of the message ('user' or 'ai').
 * @param {string} text - The content of the message. Can include HTML for formatting.
 * @returns {HTMLElement} The newly created message element.
 */
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const bubbleElement = document.createElement('div');
    bubbleElement.className = 'bubble';
    bubbleElement.innerHTML = text;
    
    messageElement.appendChild(bubbleElement);
    chatMessages.appendChild(messageElement);
    
    // Automatically scroll to the bottom to show the latest message.
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageElement;
}

/**
 * Displays an animated "typing" indicator in the chat.
 * @returns {HTMLElement} The loading indicator message element.
 */
function showLoadingIndicator() {
    const loadingText = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    return addMessage('ai loading', loadingText);
}

/**
 * Displays the initial menu of options for the user to select.
 * This function is called when the application first starts or when the menu button is clicked.
 */
function displayMenu() {
    currentMode = 'menu';
    chatMessages.innerHTML = ''; // Clear the chat window.

    // Hide the menu button when we are already in the menu.
    menuButton.style.display = 'none';

    // Disable the input form until a mode is selected.
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.placeholder = "Select a mode to begin...";

    const menuHtml = `
        Hello! I'm your AI Assistant. Please choose an option below to get started.
        <div class="menu-buttons">
            <button class="menu-button" data-mode="chat">General Chat</button>
            <button class="menu-button" data-mode="jokes">Dad Jokes</button>
            <button class="menu-button" data-mode="madlibs">Mad Libs</button>
            <button class="menu-button" data-mode="guessing">Guess the Number</button>
            <button class="menu-button" data-mode="calculator">Calculator</button>
            <button class="menu-button" data-mode="todo">To-Do List</button>
        </div>
    `;
    addMessage('ai', menuHtml);
}

/**
 * Displays the difficulty options for the Guessing Game.
 */
function displayGuessingGameOptions() {
    chatMessages.innerHTML = ''; // Clear the chat window.
    addMessage('ai', `
        Please choose a difficulty level:
        <div class="menu-buttons">
            <button class="menu-button difficulty-button" data-max-number="50" data-max-attempts="10">Easy (1-50, 10 Tries)</button>
            <button class="menu-button difficulty-button" data-max-number="100" data-max-attempts="7">Medium (1-100, 7 Tries)</button>
            <button class="menu-button difficulty-button" data-max-number="200" data-max-attempts="5">Hard (1-200, 5 Tries)</button>
            <button class="menu-button difficulty-button" data-max-number="100" data-max-attempts="0">Practice (1-100, Unlimited)</button>
        </div>
    `);
    // Keep input disabled until a choice is made.
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.placeholder = "Select a difficulty to begin...";
}


/**
 * Sets up the application state based on the user's menu selection.
 * @param {string} mode - The mode selected by the user (e.g., 'chat', 'jokes').
 */
function handleModeSelection(mode) {
    currentMode = mode;
    chatMessages.innerHTML = ''; // Clear the chat window for the new mode.
    
    // Show the menu button now that we are in a specific mode.
    menuButton.style.display = 'block';

    let welcomeMessage = '';
    switch (mode) {
        case 'chat':
            welcomeMessage = "You've selected **General Chat**. You can ask me anything!";
            break;
        case 'jokes':
            welcomeMessage = "You've selected **Dad Jokes**. Ask me for a joke, or for a joke about a specific topic!";
            break;
        case 'madlibs':
            welcomeMessage = "You've selected **Mad Libs**. Let's make a silly story!";
            break;
        case 'guessing':
            // Instead of a welcome message, show the game options.
            displayGuessingGameOptions();
            return; // Exit here to prevent default message/input enabling.
        case 'calculator':
            welcomeMessage = "You've selected **Calculator**. Please enter a math problem (e.g., '5 * 8').";
            break;
        case 'todo':
            welcomeMessage = "You've selected **To-Do List**. You can 'add', 'remove', or 'list' items.";
            break;
    }

    addMessage('ai', welcomeMessage);

    // Reset chat history with a context-setting prompt for the selected mode.
    chatHistory = [
        { role: "user", parts: [{ text: `Let's start a new session in ${mode} mode.` }] },
        { role: "model", parts: [{ text: "Understood." }] }
    ];

    // Enable the input form so the user can start typing.
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.placeholder = `Type your message for ${mode} mode...`;
    chatInput.focus();
}

/**
 * Sends the conversation history to the Gemini API and gets a response for General Chat.
 * @param {string} prompt - The user's most recent message.
 * @returns {Promise<string>} A promise that resolves to the AI's response text.
 */
async function getAIResponse(prompt) {
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const aiResponseText = result.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "model", parts: [{ text: aiResponseText }] });
            return aiResponseText;
        } else {
            return "I'm not sure how to respond to that. Try asking something else.";
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "Sorry, I'm having trouble connecting. Please check your API key and try again.";
    }
}

/**
 * Handles the submission of the main chat form.
 * This function orchestrates the user interaction and AI response cycle.
 * @param {Event} e - The form submission event.
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = chatInput.value.trim();
    // If the input is empty, do nothing.
    if (messageText === '') return;

    // Display the user's message in the chat window.
    addMessage('user', messageText);
    chatInput.value = '';

    // Disable the form while waiting for the AI's response.
    chatInput.disabled = true;
    sendButton.disabled = true;

    let aiResponse = '';
    // Show a loading indicator for API calls, but not for instant local logic.
    let loadingIndicator;
    if (currentMode === 'chat' || currentMode === 'jokes') {
        loadingIndicator = showLoadingIndicator();
    }
    
    // Determine the correct action based on the current chatbot mode.
    if (currentMode === 'chat') {
        aiResponse = await getAIResponse(messageText);
    } else if (currentMode === 'jokes') {
        // Call the dedicated function from dadJokes.js, passing the user's text.
        aiResponse = await getDadJoke(apiKey, messageText);
    } else if (currentMode === 'madlibs') {
        aiResponse = "Okay, give me a noun. <br><br>_(This is a placeholder, real Mad Libs logic coming soon!)_";
    } else if (currentMode === 'guessing') {
        // Call the dedicated function from guessingGame.js
        aiResponse = handleGuess(messageText);
    } else if (currentMode === 'calculator') {
        // Call the dedicated function from calculator.js
        aiResponse = evaluateExpression(messageText);
    } else if (currentMode === 'todo') {
        aiResponse = "Okay, I've added 'finish chatbot' to your list. <br><br>_(This is a placeholder, real to-do logic coming soon!)_";
    }
    
    // Remove the loading indicator if it was created.
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    addMessage('ai', aiResponse);

    // Re-enable the form for the next message, unless the guessing game is over.
    if (currentMode === 'guessing' && !guessingGame.isActive) {
        // The game has just ended. Display the difficulty options again.
        addMessage('ai', `
            <div class="menu-buttons">
                <button class="menu-button difficulty-button" data-max-number="50" data-max-attempts="10">Easy (1-50, 10 Tries)</button>
                <button class="menu-button difficulty-button" data-max-number="100" data-max-attempts="7">Medium (1-100, 7 Tries)</button>
                <button class="menu-button difficulty-button" data-max-number="200" data-max-attempts="5">Hard (1-200, 5 Tries)</button>
                <button class="menu-button difficulty-button" data-max-number="100" data-max-attempts="0">Practice (1-100, Unlimited)</button>
            </div>
        `);
        chatInput.disabled = true;
        sendButton.disabled = true;
        chatInput.placeholder = "Game over! Select a new difficulty.";
    } else {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
});

// Event listener for the menu button in the header.
menuButton.addEventListener('click', displayMenu);

// Use event delegation on the chat messages container to handle menu button clicks.
chatMessages.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('menu-button')) {
        const selectedMode = target.dataset.mode;
        if (selectedMode) {
            handleModeSelection(selectedMode);
        }
    }
    
    if (target.classList.contains('difficulty-button')) {
        const maxNumber = parseInt(target.dataset.maxNumber, 10);
        const maxAttempts = parseInt(target.dataset.maxAttempts, 10);
        
        chatMessages.innerHTML = ''; // Clear options
        addMessage('ai', `Great! I'm thinking of a number between 1 and ${maxNumber}. Let the game begin!`);
        
        startNewGuessingGame(maxNumber, maxAttempts);

        // Enable input form for guessing
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.placeholder = 'Type your guess...';
        chatInput.focus();
    }
});

// Kicks off the application by showing the main menu to the user.
displayMenu();
