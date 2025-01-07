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
});