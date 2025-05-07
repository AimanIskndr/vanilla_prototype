document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  const usernameDisplay = document.getElementById('username-display');
  const logoutBtn = document.getElementById('logout-btn');

  // Check if the user is logged in
  const token = localStorage.getItem('token');
  if (token) {
    // Decode the token to get the username (or fetch user info from the server)
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const username = user.username || 'User'; // Replace 'username' with the correct field from your token

    // Show the username and logout button
    loginBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    usernameDisplay.textContent = username;

    // Redirect to profile page when username is clicked
    usernameDisplay.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'profile.html';
    });
  }

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }
});