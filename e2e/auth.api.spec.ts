import { test, expect } from '@playwright/test';

const validPassword = 'Test123!';
const uniqueEmail = () => `qa-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

test.describe('Authentication API', () => {
  test('register succeeds with valid data', async ({ request }) => {
    const email = uniqueEmail();
    const response = await request.post('auth/register', {
      data: { userName: 'QA Test User', email, password: validPassword, userType: 1 }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(email);
  });

  test('register rejects a missing email', async ({ request }) => {
    const response = await request.post('auth/register', {
      data: { userName: 'QA Test User', password: validPassword, userType: 1 }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).success).toBe(false);
  });

  test('web login sets an accessToken cookie', async ({ request }) => {
    const response = await request.post('auth/login', {
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: process.env.TEST_USER_PASSWORD ?? validPassword }
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['set-cookie'] ?? '').toContain('accessToken');
  });

  test('mobile login returns a non-empty accessToken in body', async ({ request }) => {
    const response = await request.post('auth/login', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Android 13; Mobile)' },
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: process.env.TEST_USER_PASSWORD ?? validPassword }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.data.accessToken).toBe('string');
    expect(body.data.accessToken.length).toBeGreaterThan(0);
  });

  test('wrong password returns 401', async ({ request }) => {
    const response = await request.post('auth/login', {
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: 'DefinitelyWrongPassword!' }
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).success).toBe(false);
  });

  test('GET /auth/me without a token returns 401', async ({ request }) => {
    const response = await request.get('auth/me');
    expect(response.status()).toBe(401);
  });

  test('GET /auth/me succeeds with a login cookie', async ({ request }) => {
    const login = await request.post('auth/login', {
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: process.env.TEST_USER_PASSWORD ?? validPassword }
    });
    expect(login.status()).toBe(200);
    const setCookie = login.headers()['set-cookie'] ?? '';
    const cookiePair = setCookie.split(';')[0];
    expect(cookiePair).toContain('accessToken=');

    const me = await request.get('auth/me', {
      headers: { Cookie: cookiePair }
    });
    expect(me.status()).toBe(200);
    expect(typeof (await me.json()).data.id).toBe('number');
  });

  test('logout succeeds and clears the accessToken cookie', async ({ request }) => {
    const login = await request.post('auth/login', {
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: process.env.TEST_USER_PASSWORD ?? validPassword }
    });
    expect(login.status()).toBe(200);
    const cookiePair = (login.headers()['set-cookie'] ?? '').split(';')[0];

    const logout = await request.post('auth/logout', {
      headers: { Cookie: cookiePair }
    });
    expect(logout.status()).toBe(200);
    const setCookie = logout.headers()['set-cookie'] ?? '';
    expect(setCookie).toContain('accessToken');
    expect(/accessToken=;|Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(setCookie)).toBe(true);
  });
});