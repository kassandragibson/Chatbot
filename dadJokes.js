/**
 * This module is dedicated to the "Dad Jokes" feature.
 */

/**
 * Fetches a dad joke from the Gemini API, optionally about a specific topic.
 * @param {string} apiKey - The API key for the Gemini API.
 * @param {string} topic - The user's specific request (e.g., "about fish").
 * @returns {Promise<string>} A promise that resolves to a dad joke.
 */
async function getDadJoke(apiKey, topic) {
    // A dynamic prompt that incorporates the user's request.
    let prompt;
    if (topic && topic.trim() !== '') {
        prompt = `Tell me a short, classic dad joke about ${topic}.`;
    } else {
        // A fallback prompt if the user doesn't specify a topic.
        prompt = "Tell me a short, classic dad joke.";
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // The payload now includes a 'generationConfig' to increase randomness.
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            // A higher temperature (e.g., 1.0) makes the output more random and creative.
            "temperature": 1.0, 
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If the API returns an error, we throw an error to be caught below.
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        
        // Safely access the joke text from the API response.
        if (result.candidates && result.candidates.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            // A fallback response if the API returns no candidates.
            return "I tried to think of a joke, but my brain is on vacation. Ask again!";
        }
    } catch (error) {
        console.error("Error fetching dad joke:", error);
        // A user-friendly error message if the fetch fails.
        return "I couldn't connect to my joke book. Please try again.";
    }
}
