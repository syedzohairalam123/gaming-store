// ── Auth Helper Functions ──────────────────────────────────────
const API = window.location.origin;

function getToken()  { return localStorage.getItem('gs_token'); }
function getUser()   { try { return JSON.parse(localStorage.getItem('gs_user')); } catch { return null; } }
function isLoggedIn(){ return !!getToken(); }

function logout() {
  localStorage.removeItem('gs_token');
  localStorage.removeItem('gs_user');
  window.location.href = 'index.html';
}

// Update nav links based on login state
function updateNavAuth() {
  const user     = getUser();
  const loginEl  = document.getElementById('navLoginLink');
  const logoutEl = document.getElementById('navLogoutLink');
  const ordersEl = document.getElementById('navOrdersLink');
  const nameEl   = document.getElementById('navUserName');

  if (user) {
    if (loginEl)  loginEl.style.display  = 'none';
    if (logoutEl) logoutEl.style.display = 'inline';
    if (ordersEl) ordersEl.style.display = 'inline';
    if (nameEl)   nameEl.textContent     = `Hi, ${user.name.split(' ')[0]}!`;
  } else {
    if (loginEl)  loginEl.style.display  = 'inline';
    if (logoutEl) logoutEl.style.display = 'none';
    if (ordersEl) ordersEl.style.display = 'none';
    if (nameEl)   nameEl.textContent     = '';
  }
}

// Main login function (Made global to strictly prevent "login is not defined" error)
async function handleLoginProcess() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg      = document.getElementById('loginMsg');
  const btn      = loginForm.querySelector('button[type="submit"]');

  if (!email || !password) {
    if (msg) {
      msg.textContent = '❌ Please fill in all fields.';
      msg.className = 'auth-msg error';
    }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
  if (msg) { msg.textContent = ''; msg.className = 'auth-msg'; }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('gs_token', data.token);
      localStorage.setItem('gs_user',  JSON.stringify(data.user));
      if (msg) {
        msg.textContent = '✅ Login successful! Redirecting...';
        msg.className   = 'auth-msg success';
      }
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      if (msg) {
        msg.textContent = '❌ ' + data.message;
        msg.className   = 'auth-msg error';
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Login to Account'; }
    }
  } catch (error) {
    if (msg) {
      msg.textContent = '❌ Server error. Try again.';
      msg.className   = 'auth-msg error';
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Login to Account'; }
  }
}

// Global exposure for backup
window.login = function(e) {
  if (e) e.preventDefault();
  handleLoginProcess();
};

document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();

  // Logout button
  document.getElementById('navLogoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // ── LOGIN FORM ─────────────────────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    if (isLoggedIn()) { window.location.href = 'index.html'; return; }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      handleLoginProcess();
    });
  }

  // ── SIGNUP FORM ────────────────────────────────────────────
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    if (isLoggedIn()) { window.location.href = 'index.html'; return; }

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name     = document.getElementById('signupName').value.trim();
      const email    = document.getElementById('signupEmail').value.trim();
      const phone    = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm  = document.getElementById('signupConfirm').value;
      const msg      = document.getElementById('signupMsg');
      const btn      = signupForm.querySelector('button[type="submit"]');

      if (password !== confirm) {
        msg.textContent = '❌ Passwords do not match.';
        msg.className   = 'auth-msg error'; return;
      }

      btn.disabled = true; btn.textContent = 'Creating account...';
      msg.textContent = ''; msg.className = 'auth-msg';

      try {
        const res  = await fetch(`${API}/api/auth/signup`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('gs_token', data.token);
          localStorage.setItem('gs_user',  JSON.stringify(data.user));
          msg.textContent = '✅ Account created! Redirecting...';
          msg.className   = 'auth-msg success';
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } else {
          msg.textContent = '❌ ' + data.message;
          msg.className   = 'auth-msg error';
          btn.disabled = false; btn.textContent = 'Create Account';
        }
      } catch {
        msg.textContent = '❌ Server error. Try again.';
        msg.className   = 'auth-msg error';
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    });
  }
});