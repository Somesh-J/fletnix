import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8000/api';

test.describe('Authentication API', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    age: 25,
  };

  test('should register a new user', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: testUser,
    });
    
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.email).toBe(testUser.email);
    expect(body.age).toBe(testUser.age);
    expect(body.id).toBeDefined();
  });

  test('should not register with existing email', async ({ request }) => {
    // First registration
    await request.post(`${API_URL}/auth/register`, {
      data: {
        email: 'duplicate@example.com',
        password: 'password123',
        age: 30,
      },
    });

    // Try to register again with same email
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: 'duplicate@example.com',
        password: 'password123',
        age: 30,
      },
    });
    
    expect(response.status()).toBe(400);
  });

  test('should login with valid credentials', async ({ request }) => {
    // Register first
    const email = `login${Date.now()}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: {
        email,
        password: 'password123',
        age: 25,
      },
    });

    // Login
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email,
        password: 'password123',
      },
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe('bearer');
  });

  test('should not login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      },
    });
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Shows API', () => {
  test('should get paginated shows', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?page=1&limit=15`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.shows).toBeDefined();
    expect(Array.isArray(body.shows)).toBe(true);
    expect(body.shows.length).toBeLessThanOrEqual(15);
    expect(body.page).toBe(1);
    expect(body.total).toBeGreaterThan(0);
  });

  test('should filter shows by type', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?type=Movie`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    body.shows.forEach((show) => {
      expect(show.type).toBe('Movie');
    });
  });

  test('should search shows', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?search=love`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.shows).toBeDefined();
  });

  test('should get show by ID', async ({ request }) => {
    // First get a show ID
    const listResponse = await request.get(`${API_URL}/shows?limit=1`);
    const listBody = await listResponse.json();
    const showId = listBody.shows[0].id;

    // Get show details
    const response = await request.get(`${API_URL}/shows/${showId}`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(showId);
    expect(body.title).toBeDefined();
    expect(body.type).toBeDefined();
  });

  test('should get genres list', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/genres`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});

test.describe('Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
