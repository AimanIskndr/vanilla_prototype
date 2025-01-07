document.addEventListener('DOMContentLoaded', () => {
  const sections = {
    home: document.getElementById('home'),
    languageSelect: document.getElementById('language-select')
  };

  let selectedLanguage = '';

  // Function to show specific section and hide others
  function showSection(sectionId) {
    Object.values(sections).forEach(section => {
      section.classList.add('hidden');
    });
    sections[sectionId].classList.remove('hidden');
  }

  // Make function available globally
  window.startSpeaking = () => {
    showSection('languageSelect');
  };

  window.goToChat = () => {
    window.location.href = 'chat.html';
  };

  // Scroll to language section
  window.scrollToLanguages = () => {
    document.getElementById('language-select').scrollIntoView({ behavior: 'smooth' });
  };

  // Carousel functionality
  const track = document.querySelector('.carousel-track');
  const cards = Array.from(document.querySelectorAll('.carousel-card'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  const CARD_WIDTH = 220; // card width + gap
  const VISIBLE_CARDS = 4;
  let currentIndex = 0;

  // Clone first and last cards for smooth infinite scroll
  const firstCardClone = cards[0].cloneNode(true);
  const lastCardClone = cards[cards.length - 1].cloneNode(true);
  track.appendChild(firstCardClone);
  track.insertBefore(lastCardClone, cards[0]);

  // Set initial position
  track.style.transform = `translateX(-${CARD_WIDTH}px)`;

  function slideCards(direction) {
    track.style.transition = 'transform 0.3s ease-out';

    if (direction === 'next') {
      currentIndex++;
      if (currentIndex >= cards.length) {
        // Jump back to start after animation
        setTimeout(() => {
          track.style.transition = 'none';
          currentIndex = 0;
          track.style.transform = `translateX(-${CARD_WIDTH}px)`;
        }, 300);
      }
    } else {
      currentIndex--;
      if (currentIndex < -1) {
        // Jump to end after animation
        setTimeout(() => {
          track.style.transition = 'none';
          currentIndex = cards.length - 1;
          track.style.transform = `translateX(-${(cards.length) * CARD_WIDTH}px)`;
        }, 300);
      }
    }

    track.style.transform = `translateX(-${(currentIndex + 1) * CARD_WIDTH}px)`;
  }

  nextBtn.addEventListener('click', () => slideCards('next'));
  prevBtn.addEventListener('click', () => slideCards('prev'));

  // Update card selection logic
  const allCards = document.querySelectorAll('.carousel-card');
  allCards.forEach(card => {
    card.addEventListener('click', () => {
      allCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('startSpeakingBtn').classList.remove('hidden');
    });
  });

  // Card selection
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedLanguage = card.dataset.lang;
      document.getElementById('startSpeakingBtn').classList.remove('hidden');
    });
  });

  // Recording controls with spacebar
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isRecording && document.getElementById('chat-interface')?.style.display !== 'none') {
      e.preventDefault();
      isRecording = true;
      document.getElementById('startRecording').classList.add('hidden');
      document.getElementById('stopRecording').classList.remove('hidden');
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && isRecording && document.getElementById('chat-interface')?.style.display !== 'none') {
      e.preventDefault();
      isRecording = false;
      document.getElementById('stopRecording').classList.add('hidden');
      document.getElementById('startRecording').classList.remove('hidden');
    }
  });

  if (document.getElementById('chat-interface')) {
    setupChat();
  }

  const startBtn = document.getElementById('startBtn');
  const outputBox = document.getElementById('outputBox');

  if (!startBtn || !outputBox) return; // Only run on chat page

  let recognition;
  let isListening = false;

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
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
    outputBox.innerText = "Speech recognition not supported in this browser.";
    startBtn.disabled = true;
  }

  startBtn?.addEventListener('click', () => {
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

  async function fetchChatGPTResponse(userInput) {
    try {
      const apiKey = await getApiKey();
      const endpoint = "https://api.openai.com/v1/chat/completions";
      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a warm, friendly language learning partner...`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 200
      };

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
        outputBox.innerText = `ChatGPT: ${botResponse}`;

        const utterance = new SpeechSynthesisUtterance(botResponse);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error("Error:", error);
      outputBox.innerText = "Failed to get response. Check connection.";
    }
  }
});

function setupChat() {
  const messagesContainer = document.getElementById('messages');
  const startBtn = document.getElementById('startRecording');
  const stopBtn = document.getElementById('stopRecording');
  let recognition;
  let isRecording = false;

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      addMessage('Listening...', 'loading');
    };

    recognition.onresult = (event) => {
      const userSpeech = event.results[0][0].transcript;
      addMessage(userSpeech, 'user-message');
      fetchChatGPTResponse(userSpeech);
    };

    recognition.onerror = (event) => {
      addMessage('Error occurred. Please try again.', 'loading');
    };
  }

  startBtn.addEventListener('click', () => {
    if (!isRecording) {
      recognition.start();
      isRecording = true;
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    }
  });

  stopBtn.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
      isRecording = false;
      stopBtn.classList.add('hidden');
      startBtn.classList.remove('hidden');
    }
  });

  function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

  async function fetchChatGPTResponse(userInput) {
    addMessage('Processing...', 'loading');

    try {
      const apiKey = await getApiKey();
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

        // Remove loading message
        messagesContainer.removeChild(messagesContainer.lastChild);

        // Add bot response
        addMessage(botResponse, 'bot-message');

        // Speak response
        const utterance = new SpeechSynthesisUtterance(botResponse);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage('Failed to get response. Check API key or connection.', 'loading');
    }
  }
}