// DOM Element References
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

// This will hold the conversation history
let chatHistory = [];

/**
 * Appends a message to the chat window.
 * @param {string} sender - Who sent the message ('user' or 'ai').
 * @param {string} text - The message content. Can be HTML.
 * @returns {HTMLElement} The created message element.
 */
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const bubbleElement = document.createElement('div');
    bubbleElement.className = 'bubble';
    bubbleElement.innerHTML = text; // Use innerHTML to render formatted text or loading dots
    
    messageElement.appendChild(bubbleElement);
    chatMessages.appendChild(messageElement);
    
    // Scroll to the newest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageElement;
}

/**
 * Shows a loading indicator in the chat.
 * @returns {HTMLElement} The loading indicator element.
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
 * Fetches a response from the Gemini API.
 * @param {string} prompt - The user's message.
 * @returns {Promise<string>} The AI's response text.
 */
async function getAIResponse(prompt) {
    // Add the user's message to the history
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: chatHistory,
        // Optional: Add safety settings and generation config if needed
    };

    const apiKey = API_KEY;
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
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            
            const aiResponseText = result.candidates[0].content.parts[0].text;
            // Add the AI's response to the history
            chatHistory.push({ role: "model", parts: [{ text: aiResponseText }] });
            return aiResponseText;

        } else {
            // If the response is valid but empty (e.g., due to safety settings)
            return "I'm not sure how to respond to that. Try asking something else.";
        }

    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "Sorry, I'm having trouble connecting. Please try again in a moment.";
    }
}


/**
 * Handles the chat form submission.
 * @param {Event} e - The form submission event.
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = chatInput.value.trim();
    if (messageText === '') return;

    // 1. Add the user's message to the UI
    addMessage('user', messageText);
    
    // Clear the input and disable the form while waiting for a response
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;

    // 2. Show the loading indicator
    const loadingIndicator = showLoadingIndicator();

    // 3. Get the AI's response
    const aiResponse = await getAIResponse(messageText);

    // 4. Remove the loading indicator
    loadingIndicator.remove();

    // 5. Add the AI's response to the UI
    addMessage('ai', aiResponse);
    
    // Re-enable the form
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
});

// Initial focus on the input field
chatInput.focus();
