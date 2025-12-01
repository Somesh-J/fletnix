/**
 * FletNix API Tests - Recommendations
 * 
 * Tests for genre-based recommendations.
 * Following the Zen of Python: Readability counts.
 */

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8000/api';

test.describe('Recommendations API', () => {
  let authToken;
  let userId;
  const testEmail = `rec_test_${Date.now()}@fletnix.com`;

  test.beforeAll(async ({ request }) => {
    // Register and login user for recommendation tests
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: 'RecTest123!', age: 25 },
    });

    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: testEmail, password: 'RecTest123!' },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.access_token;
  });

  test('should require authentication for recommendations', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/user/recommendations`);
    
    expect(response.status()).toBe(403);
  });

  test('should return recommendations for authenticated user', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/user/recommendations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('shows');
    expect(body).toHaveProperty('based_on_genres');
    expect(Array.isArray(body.shows)).toBe(true);
  });

  test('should track view and update recommendations', async ({ request }) => {
    // Get a show to view
    const showsResponse = await request.get(`${API_URL}/shows?limit=1`);
    const { shows } = await showsResponse.json();
    const showId = shows[0].id;

    // Track the view
    const viewResponse = await request.post(`${API_URL}/shows/view`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { show_id: showId },
    });

    expect(viewResponse.status()).toBe(201);
    const viewBody = await viewResponse.json();
    expect(viewBody.message).toContain('tracked');
  });

  test('should limit recommendations to specified count', async ({ request }) => {
    const limit = 5;
    const response = await request.get(
      `${API_URL}/shows/user/recommendations?limit=${limit}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.shows.length).toBeLessThanOrEqual(limit);
  });

  test('should filter age-restricted content in recommendations for minors', async ({ request }) => {
    // Create minor user
    const minorEmail = `minor_rec_${Date.now()}@fletnix.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { email: minorEmail, password: 'MinorRec123!', age: 15 },
    });

    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: minorEmail, password: 'MinorRec123!' },
    });
    const { access_token } = await loginResponse.json();

    // Get recommendations
    const response = await request.get(`${API_URL}/shows/user/recommendations`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // No R-rated content
    body.shows.forEach((show) => {
      expect(['R', 'NC-17', 'TV-MA']).not.toContain(show.rating);
    });
  });
});
