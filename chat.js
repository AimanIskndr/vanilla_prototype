document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopPracticeBtn = document.getElementById('stopPracticeBtn');
  const outputBox = document.getElementById('outputBox');
  let recognition;
  let isListening = false;

  // Initialize conversationHistory; if there's a previous summary saved, use it.
  let conversationHistory = [];
  const prevSummary = localStorage.getItem('conversationSummary');
  if (prevSummary) {
    conversationHistory.push({
      role: "system",
      content: `The following is a summary of our previous conversation: ${prevSummary}`
    });
  } else {
    conversationHistory.push({
      role: "system",
      content: `You are a warm, friendly, and encouraging language learning partner. Your goal is to help users practice their target language in a natural, conversational way. Follow these guidelines:
      
1. Start conversations naturally.
2. Adapt to the user's level.
3. Encourage practice and provide gentle corrections.
4. Share cultural context occasionally.
5. Keep the conversation friendly and engaging.
      
Example: "Hi! What did you do today?"`
    });
  }

  if (!startBtn || !outputBox) return; // Only run on chat page

  // Get selected language from localStorage or default to English (US)
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';

  // Initialize Web Speech API if supported.
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = selectedLanguage;
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
      // Fetch ChatGPT response using the conversation history
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

  // Stop Practice button: When clicked, summarize the session.
  stopPracticeBtn.addEventListener('click', async () => {
    await summarizeSession();
    alert('Practice session summarized. You can start a new session now.');
    // Optionally, reload or redirect to index.html:
    window.location.href = 'index.html';
  });

  // Function to fetch a response from ChatGPT API using conversationHistory
  async function fetchChatGPTResponse(userInput) {
    // Add user input to conversation history
    conversationHistory.push({ role: "user", content: userInput });
    
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      max_tokens: 1000  // Reduced token count within the model's limits
    };

    try {
      const apiKey = await getApiKey();
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
        outputBox.innerText = `LingoPair: ${botResponse}`;
        // Add assistant response to conversation history
        conversationHistory.push({ role: "assistant", content: botResponse });
        
        // Speak the response using Web Speech API
        const utterance = new SpeechSynthesisUtterance(botResponse);
        utterance.lang = selectedLanguage;
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

  // Function to summarize the session
  async function summarizeSession() {
    const summaryPrompt = "Please provide a brief summary of our conversation so far.";
    // Build a temporary messages array with the summary prompt appended.
    const summaryMessages = [
      {
        role: "system",
        content: "You are an assistant that summarizes conversations."
      },
      ...conversationHistory,
      {
        role: "user",
        content: summaryPrompt
      }
    ];
    
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: summaryMessages,
      max_tokens: 2000
    };

    try {
      const apiKey = await getApiKey();
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${apiKey}`
         },
         body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        const summary = data.choices[0].message.content;
        // Save the summary in localStorage for next time
        localStorage.setItem('conversationSummary', summary);
        // Reset conversationHistory with the summary as the new context
        conversationHistory = [
          {
            role: "system",
            content: `The following is a summary of our previous conversation: ${summary}`
          }
        ];
      } else {
        console.error("Summary API error:", await response.text());
      }
    } catch (error) {
      console.error("Error summarizing session:", error);
    }
  }

  // Function to fetch the API key from a local file
  async function getApiKey() {
    try {
      const response = await fetch('api_key.txt');
      if (!response.ok) throw new Error('Failed to load API key');
      const apiKey = await response.text();
      return apiKey.trim();
    } catch (error) {
      console.error('Error loading API key:', error);
      throw error;
    }
  }
});
