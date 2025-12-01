/**
 * FletNix API Tests - Shows & Content
 * 
 * Tests for shows listing, search, filtering, and details.
 * Following the Zen of Python: Simple is better than complex.
 */

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8000/api';

test.describe('Shows API - Pagination', () => {
  test('should return paginated shows with default limit of 15', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('shows');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('pages');
    expect(body).toHaveProperty('has_next');
    expect(body).toHaveProperty('has_prev');
    expect(body.shows.length).toBeLessThanOrEqual(15);
    expect(body.page).toBe(1);
  });

  test('should return specified number of items per page', async ({ request }) => {
    const limit = 5;
    const response = await request.get(`${API_URL}/shows?limit=${limit}`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.shows.length).toBeLessThanOrEqual(limit);
  });

  test('should return correct page of results', async ({ request }) => {
    const response1 = await request.get(`${API_URL}/shows?page=1&limit=5`);
    const response2 = await request.get(`${API_URL}/shows?page=2&limit=5`);

    const body1 = await response1.json();
    const body2 = await response2.json();

    expect(body1.page).toBe(1);
    expect(body2.page).toBe(2);
    expect(body1.has_next).toBe(true);
    expect(body2.has_prev).toBe(true);
    
    // First show on page 2 should be different from page 1
    expect(body1.shows[0].id).not.toBe(body2.shows[0].id);
  });

  test('should indicate no previous page on first page', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?page=1`);
    const body = await response.json();

    expect(body.has_prev).toBe(false);
  });

  test('should return correct total pages', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?limit=10`);
    const body = await response.json();

    const expectedPages = Math.ceil(body.total / 10);
    expect(body.pages).toBe(expectedPages);
  });
});

test.describe('Shows API - Type Filter', () => {
  test('should filter shows by Movie type', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?type=Movie`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    body.shows.forEach((show) => {
      expect(show.type).toBe('Movie');
    });
  });

  test('should filter shows by TV Show type', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?type=TV Show`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    body.shows.forEach((show) => {
      expect(show.type).toBe('TV Show');
    });
  });

  test('should return all shows when no type filter', async ({ request }) => {
    const allResponse = await request.get(`${API_URL}/shows?limit=100`);
    const movieResponse = await request.get(`${API_URL}/shows?type=Movie`);
    const tvResponse = await request.get(`${API_URL}/shows?type=TV Show`);

    const allBody = await allResponse.json();
    const movieBody = await movieResponse.json();
    const tvBody = await tvResponse.json();

    // Total should be sum of movies and TV shows
    expect(allBody.total).toBe(movieBody.total + tvBody.total);
  });
});

test.describe('Shows API - Search Functionality', () => {
  test('should search shows by title', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?search=love`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.shows.length).toBeGreaterThan(0);
    // At least one result should contain 'love' in title
    const hasMatchingTitle = body.shows.some((show) =>
      show.title.toLowerCase().includes('love')
    );
    expect(hasMatchingTitle).toBe(true);
  });

  test('should search shows by cast member', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?search=Adam Sandler`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.shows.length > 0) {
      const hasMatchingCast = body.shows.some(
        (show) => show.cast && show.cast.toLowerCase().includes('adam sandler')
      );
      expect(hasMatchingCast).toBe(true);
    }
  });

  test('should return empty array for non-matching search', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?search=xyznonexistent123`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.shows).toEqual([]);
    expect(body.total).toBe(0);
  });

  test('should combine search with type filter', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?search=love&type=Movie`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    body.shows.forEach((show) => {
      expect(show.type).toBe('Movie');
    });
  });
});

test.describe('Shows API - Genre Filter', () => {
  test('should filter shows by genre', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?genre=Comedy`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    body.shows.forEach((show) => {
      expect(show.listed_in.toLowerCase()).toContain('comed');
    });
  });

  test('should return all available genres', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/genres`);

    expect(response.status()).toBe(200);
    const genres = await response.json();

    expect(Array.isArray(genres)).toBe(true);
    expect(genres.length).toBeGreaterThan(0);
    expect(genres).toContain('Comedies');
  });
});

test.describe('Shows API - Show Details', () => {
  let testShowId;

  test.beforeAll(async ({ request }) => {
    const response = await request.get(`${API_URL}/shows?limit=1`);
    const body = await response.json();
    testShowId = body.shows[0].id;
  });

  test('should get show details by MongoDB ID', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/${testShowId}`);

    expect(response.status()).toBe(200);
    const show = await response.json();

    expect(show.id).toBe(testShowId);
    expect(show).toHaveProperty('title');
    expect(show).toHaveProperty('type');
    expect(show).toHaveProperty('description');
    expect(show).toHaveProperty('release_year');
    expect(show).toHaveProperty('rating');
    expect(show).toHaveProperty('duration');
    expect(show).toHaveProperty('listed_in');
    expect(show).toHaveProperty('genres');
    expect(Array.isArray(show.genres)).toBe(true);
  });

  test('should get show details by show_id', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/s1`);

    expect(response.status()).toBe(200);
    const show = await response.json();

    expect(show.show_id).toBe('s1');
  });

  test('should return 404 for non-existent show', async ({ request }) => {
    const response = await request.get(`${API_URL}/shows/nonexistent123`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toContain('not found');
  });
});

test.describe('Shows API - Age Restriction', () => {
  test('should hide R-rated content for minor users', async ({ request }) => {
    // Register minor user
    const email = `minor_age_${Date.now()}@fletnix.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'MinorPass123!', age: 16 },
    });

    // Login to get token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: 'MinorPass123!' },
    });
    const { access_token } = await loginResponse.json();

    // Get shows with authentication
    const response = await request.get(`${API_URL}/shows?limit=100`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Should not contain R-rated content
    body.shows.forEach((show) => {
      expect(['R', 'NC-17', 'TV-MA']).not.toContain(show.rating);
    });
  });

  test('should show all content for adult users', async ({ request }) => {
    // Register adult user
    const email = `adult_age_${Date.now()}@fletnix.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'AdultPass123!', age: 25 },
    });

    // Login to get token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: 'AdultPass123!' },
    });
    const { access_token } = await loginResponse.json();

    // Get shows with authentication
    const response = await request.get(`${API_URL}/shows?limit=100`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Should have some adult content (R, NC-17, or TV-MA)
    const hasAdultContent = body.shows.some((show) =>
      ['R', 'NC-17', 'TV-MA'].includes(show.rating)
    );
    expect(hasAdultContent).toBe(true);
  });
});

test.describe('Shows API - Reviews (OMDB Integration)', () => {
  test('should get reviews for a show', async ({ request }) => {
    // Get a show first
    const showsResponse = await request.get(`${API_URL}/shows?limit=1`);
    const { shows } = await showsResponse.json();
    const showId = shows[0].id;

    const response = await request.get(`${API_URL}/shows/${showId}/reviews`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('imdb_rating');
    expect(body).toHaveProperty('reviews');
    expect(Array.isArray(body.reviews)).toBe(true);
  });
});

test.describe('Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('should return API info on root', async ({ request }) => {
    const response = await request.get('http://localhost:8000/');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain('FletNix');
    expect(body).toHaveProperty('version');
  });
});
