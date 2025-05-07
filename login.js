document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginSection = document.getElementById('loginSection');
  const signupSection = document.getElementById('signupSection');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const signupTargetLanguage = document.getElementById('signupTargetLanguage');
  const carouselCards = document.querySelectorAll('.carousel-card');

  // Switch between login & signup screens
  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  });

  // ------------------ Signup ------------------
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const nativeLanguage = document.getElementById('signupNativeLanguage').value;
    const targetLanguage = document.getElementById('signupTargetLanguage').value;

    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, nativeLanguage, targetLanguage })
    });

    if (response.ok) {
      alert('Signup successful! You can now log in.');
      // Optionally redirect to login
      signupSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    } else {
      alert('Signup failed');
    }
  });

  // ------------------ Login -------------------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value; // Username or Email
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }) // Send identifier instead of email
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } else {
      alert('Login failed');
    }
  });

  // Carousel functionality
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  const CARD_WIDTH = 220; // card width + gap
  let currentIndex = 0;

  function slideCards(direction) {
    track.style.transition = 'transform 0.3s ease-out';

    if (direction === 'next') {
      currentIndex++;
      if (currentIndex >= carouselCards.length) {
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
          currentIndex = carouselCards.length - 1;
          track.style.transform = `translateX(-${(carouselCards.length) * CARD_WIDTH}px)`;
        }, 300);
      }
    }

    track.style.transform = `translateX(-${(currentIndex + 1) * CARD_WIDTH}px)`;
  }

  nextBtn.addEventListener('click', () => slideCards('next'));
  prevBtn.addEventListener('click', () => slideCards('prev'));

  // Update card selection logic
  carouselCards.forEach(card => {
    card.addEventListener('click', () => {
      carouselCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      signupTargetLanguage.value = card.dataset.lang;
    });
  });
});