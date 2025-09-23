document.addEventListener('DOMContentLoaded', function() {
  // Password toggle functionality
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');
  
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      passwordToggle.textContent = isPassword ? 'Ocultar' : 'Mostrar';
      passwordToggle.setAttribute('aria-pressed', !isPassword);
    });
  }
  
  // Form validation
  const form = document.getElementById('login-form');
  const submitButton = document.getElementById('login-button');
  const emailInput = document.getElementById('email');
  
  function validateForm() {
    const isValid = emailInput.value.trim() && passwordInput.value.trim();
    submitButton.disabled = !isValid;
  }
  
  if (emailInput && passwordInput) {
    emailInput.addEventListener('input', validateForm);
    passwordInput.addEventListener('input', validateForm);
    validateForm(); // Initial check
  }
  
  // Add fade-in animation to card
  const loginCard = document.querySelector('.login-card');
  if (loginCard) {
    loginCard.classList.add('fade-in');
  }
});