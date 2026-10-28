const http = require('http');

// In-memory registered users
const registeredEmails = new Set(['test@example.com']);

// --- 1. API SERVER (Port 5000) ---
const apiServer = http.createServer((req, res) => {
  // CORS & Cookies headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost:5000');
  const path = url.pathname;

  let bodyData = '';
  req.on('data', chunk => { bodyData += chunk; });
  req.on('end', () => {
    let body = {};
    if (bodyData) {
      try {
        body = JSON.parse(bodyData);
      } catch (e) {
        body = {};
      }
    }

    res.setHeader('Content-Type', 'application/json');

    // POST /api/auth/register
    if (req.method === 'POST' && path === '/api/auth/register') {
      if (!body.email) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Email is required' }));
        return;
      }
      if (registeredEmails.has(body.email)) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Email already exists' }));
        return;
      }
      registeredEmails.add(body.email);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'User registered',
        data: { id: 1, userName: body.userName || 'QA User', email: body.email }
      }));
      return;
    }

    // POST /api/auth/login
    if (req.method === 'POST' && path === '/api/auth/login') {
      const { email, password } = body;
      if (password === 'DefinitelyWrongPassword!' || password === 'wrong-password') {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
        return;
      }

      const userAgent = req.headers['user-agent'] || '';
      const isMobile = userAgent.includes('Android 13; Mobile');

      if (isMobile) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            user: { id: 1, email: email || 'test@example.com' },
            accessToken: 'mock-jwt-mobile-token-xyz'
          }
        }));
        return;
      }

      // Web client: Set HttpOnly cookie
      res.setHeader('Set-Cookie', 'accessToken=mock-jwt-web-token-xyz; Path=/; HttpOnly; SameSite=Lax');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          user: { id: 1, email: email || 'test@example.com' }
        }
      }));
      return;
    }

    // GET /api/auth/me
    if (req.method === 'GET' && path === '/api/auth/me') {
      const cookieHeader = req.headers.cookie || '';
      const authHeader = req.headers.authorization || '';

      const hasCookie = cookieHeader.includes('accessToken=') && !cookieHeader.includes('accessToken=;');
      const hasBearer = authHeader.startsWith('Bearer ');

      if (!hasCookie && !hasBearer) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, message: 'Not authorized' }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: { id: 1, email: 'test@example.com', userName: 'QA Test User' }
      }));
      return;
    }

    // POST /api/auth/logout
    if (req.method === 'POST' && path === '/api/auth/logout') {
      res.setHeader('Set-Cookie', 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }));
      return;
    }

    // Default 404
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'Not found' }));
  });
});

// --- 2. FRONTEND SERVER (Port 5173) ---
const frontendServer = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:5173');
  const path = url.pathname;

  if (path === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body><h1>Dashboard</h1><p>Welcome to admissions management system</p></body>
</html>`);
    return;
  }

  // Login page at /
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RICR Dashboard - Sign In</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f2f5; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 320px; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; }
    input { width: 100%; padding: 0.5rem; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 0.6rem; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button:disabled { background: #99c2ff; cursor: not-allowed; }
    .error { color: #d32f2f; margin-top: 1rem; display: none; }
    .spinner { display: none; margin-top: 1rem; text-align: center; color: #555; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Login</h2>
    <form id="loginForm" novalidate>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Password" />
      </div>
      <button type="submit" id="submitBtn">Login</button>
      <div id="loading" class="spinner" role="progressbar">Logging in...</div>
      <div id="error" class="error"></div>
    </form>
  </div>

  <script>
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      spinner.style.display = 'block';

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          window.location.href = '/dashboard';
        } else {
          errorDiv.textContent = data.message || 'Invalid credentials';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Invalid credentials';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        spinner.style.display = 'none';
      }
    });
  </script>
</body>
</html>`);
});

// Start both listeners
const API_PORT = 5000;
const UI_PORT = 5173;

apiServer.listen(API_PORT, () => {
  console.log(`[Mock API Server] Listening on http://localhost:${API_PORT}/api`);
});

frontendServer.listen(UI_PORT, () => {
  console.log(`[Mock Frontend Server] Listening on http://localhost:${UI_PORT}`);
});
