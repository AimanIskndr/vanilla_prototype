# LingoPair

LingoPair is a web application that helps users practice languages with AI. It allows users to have natural conversations in multiple languages with an AI language partner. The application uses the Web Speech API for speech recognition and the OpenAI API for generating conversational responses.

## Features

- **AI Conversation Partner**: Engage in conversations with an AI that adapts to your language proficiency.
- **Real-time Captions**: See real-time captions of your speech.
- **Progress Tracking**: Track your progress over time.
- **Multiple Languages**: Practice in over 10 languages including English, Spanish, French, Japanese, and more.

## Getting Started

### Prerequisites

- A modern web browser that supports the Web Speech API (e.g., Google Chrome).
- An OpenAI API key.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/lingopair.git
    cd lingopair
    ```

2. Create a file named `api_key.txt` in the root directory and add your OpenAI API key to it:
    ```
    YOUR-API-KEY-HERE
    ```

3. Open the project in Visual Studio Code and start the Live Server:
    ```bash
    code .
    ```

4. Open [index.html](http://_vscodecontentref_/1) in your browser using Live Server.

### Usage

1. **Select a Language**: On the home page, select the language you want to practice by clicking on the corresponding flag.
2. **Start Speaking**: Click the "Start Speaking" button to begin the conversation. The AI will listen to your speech and respond accordingly.
3. **View Captions**: See real-time captions of your speech and the AI's responses.
4. **Track Progress**: Monitor your progress over time.

### File Structure

- [index.html](http://_vscodecontentref_/2): The main landing page with language selection.
- [chat.html](http://_vscodecontentref_/3): The chat interface for practicing conversations.
- [style.css](http://_vscodecontentref_/4): The stylesheet for the application.
- [script.js](http://_vscodecontentref_/5): JavaScript for handling language selection and carousel functionality.
- [chat.js](http://_vscodecontentref_/6): JavaScript for handling speech recognition and AI responses.
- `api_key.txt`: File to store your OpenAI API key (not included in the repository).

### Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

### License

This project is licensed under the MIT License.

### Credits

Developed by Aiman Iskandar.

---

**Note**: Ensure your browser supports the Web Speech API for the best experience.
