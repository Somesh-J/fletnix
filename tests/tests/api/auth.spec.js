/**
 * FletNix API Tests - Authentication
 * 
 * Tests for user registration, login, and JWT authentication.
 * Following the Zen of Python: Explicit is better than implicit.
 */

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8000/api';

test.describe('Authentication API - Registration', () => {
  test('should register a new user with valid data', async ({ request }) => {
    const testUser = {
      email: `user_${Date.now()}@fletnix.com`,
      password: 'SecurePass123!',
      age: 25,
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: testUser,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    
    expect(body).toHaveProperty('id');
    expect(body.email).toBe(testUser.email);
    expect(body.age).toBe(testUser.age);
    expect(body).toHaveProperty('created_at');
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('hashed_password');
  });

  test('should reject registration with duplicate email', async ({ request }) => {
    const email = `duplicate_${Date.now()}@fletnix.com`;
    
    // First registration
    await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'Password123!', age: 30 },
    });

    // Second registration with same email
    const response = await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'DifferentPass123!', age: 25 },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.detail).toContain('already registered');
  });

  test('should reject registration with invalid email format', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: 'invalid-email',
        password: 'Password123!',
        age: 25,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('should reject registration with missing required fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: { email: 'test@example.com' },
    });

    expect(response.status()).toBe(422);
  });

  test('should accept registration for minor (age < 18)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `minor_${Date.now()}@fletnix.com`,
        password: 'Password123!',
        age: 16,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.age).toBe(16);
  });
});

test.describe('Authentication API - Login', () => {
  const loginUser = {
    email: `login_test_${Date.now()}@fletnix.com`,
    password: 'LoginPass123!',
    age: 28,
  };

  test.beforeAll(async ({ request }) => {
    // Register user for login tests
    await request.post(`${API_URL}/auth/register`, {
      data: loginUser,
    });
  });

  test('should login with valid credentials and return JWT', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: loginUser.email,
        password: loginUser.password,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('access_token');
    expect(body.token_type).toBe('bearer');
    expect(body.access_token).toMatch(/^eyJ/); // JWT starts with eyJ
  });

  test('should reject login with wrong password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: loginUser.email,
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.detail).toContain('Invalid');
  });

  test('should reject login with non-existent email', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'nonexistent@fletnix.com',
        password: 'AnyPassword123!',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should reject login with missing credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: loginUser.email },
    });

    expect(response.status()).toBe(422);
  });
});

test.describe('Authentication API - JWT Token', () => {
  test('should access protected endpoint with valid token', async ({ request }) => {
    // Register and login
    const email = `jwt_test_${Date.now()}@fletnix.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'JwtPass123!', age: 30 },
    });

    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: 'JwtPass123!' },
    });
    const { access_token } = await loginResponse.json();

    // Access protected endpoint (recommendations require auth)
    const response = await request.get(`${API_URL}/shows/user/recommendations`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(response.status()).toBe(200);
  });

  test('should reject access to protected endpoint without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/user/recommendations`);
    
    expect(response.status()).toBe(403);
  });

  test('should reject access with invalid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/user/recommendations`, {
      headers: { Authorization: 'Bearer invalid_token_here' },
    });

    expect(response.status()).toBe(401);
  });
});
