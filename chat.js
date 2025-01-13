document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const outputBox = document.getElementById('outputBox');
  let recognition;
  let isListening = false;

  if (!startBtn || !outputBox) return; // Only run on chat page

  // Get selected language from localStorage
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';

  // Initialize Web Speech API
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = selectedLanguage; // Set language based on selection
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      outputBox.innerText = "Listening...";
    };

    recognition.onspeechend = () => {
      recognition.stop();
      outputBox.innerText = "Processing...";
      startBtn.innerText = "Start Speaking";
      isListening = false;
    };

    recognition.onresult = (event) => {
      const userSpeech = event.results[0][0].transcript;
      outputBox.innerText = `You said: "${userSpeech}"`;
      fetchChatGPTResponse(userSpeech);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      outputBox.innerText = "Error occurred. Please try again.";
      startBtn.innerText = "Start Speaking";
      isListening = false;
    };
  } else {
    outputBox.innerText = "Sorry, your browser does not support speech recognition.";
  }

  // Start/stop speech recognition on button click
  startBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      startBtn.innerText = "Start Speaking";
      isListening = false;
    } else {
      recognition.start();
      startBtn.innerText = "Stop Speaking";
      isListening = true;
    }
  });

  // Function to fetch response from ChatGPT API
  async function fetchChatGPTResponse(userInput) {
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a warm, friendly, and encouraging language learning partner. Your goal is to help users practice their target language in a natural, conversational way. Follow these guidelines:
  
  1. **Start Conversations Naturally**: Begin with simple, open-ended questions or topics related to everyday life (e.g., hobbies, travel, food, or daily routines) to encourage the user to speak.
  2. **Adapt to the User's Level**: Adjust your language complexity based on the user's proficiency. Use simpler vocabulary and grammar for beginners, and more advanced structures for intermediate or advanced learners.
  3. **Encourage Practice**: Motivate the user to speak more by praising their efforts and progress. For example, say, "That's great! You're doing really well!" or "I can see you're improving!"
  4. **Gentle Corrections**: If the user makes a mistake, politely correct them by rephrasing their sentence correctly and explaining the error in a simple, non-intimidating way. For example, "You said, 'I go to park.' It's more natural to say, 'I go to the park.'"
  5. **Cultural Context**: Occasionally share interesting cultural facts or phrases related to the target language to make the conversation more engaging. For example, "In France, people often say 'Bon appétit' before eating a meal."
  6. **Keep It Conversational**: Avoid robotic or overly formal language. Speak as if you're having a friendly chat with the user.
  7. **Avoid Emojis**: Since this conversation will be used with text-to-speech, do not use emojis or symbols.
  
  Example Conversations:
  - For beginners: "Hi! What did you do today? Did you have a good day?"
  - For intermediate learners: "What kind of music do you like? Do you have a favorite singer or band?"
  - For advanced learners: "What do you think about the role of technology in education? Should schools use more technology?"
  `
        },
        {
          role: "user",
          content: userInput
        }
      ],
      max_tokens: 500
    };

    try {
      const apiKey = await getApiKey();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        // Display ChatGPT response
        outputBox.innerText = `LingoPair: ${botResponse}`;

        // Use TTS to speak the response
        const utterance = new SpeechSynthesisUtterance(botResponse);
        utterance.lang = selectedLanguage; // Set language for TTS
        window.speechSynthesis.speak(utterance);
      } else {
        const errorText = await response.text();
        console.error("Error from ChatGPT API:", errorText);
        outputBox.innerText = "Failed to fetch response. Check your API key or internet connection.";
      }
    } catch (error) {
      console.error("Fetch error:", error);
      outputBox.innerText = "An error occurred while fetching the response.";
    }
  }

  async function getApiKey() {
    try {
      const response = await fetch('api_key.txt');
      if (!response.ok) throw new Error('Failed to load API key');
      const apiKey = await response.text();
      return apiKey.trim(); // Remove any whitespace
    } catch (error) {
      console.error('Error loading API key:', error);
      throw error;
    }
  }
});
