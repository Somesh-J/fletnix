import api from './api';

export const showService = {
  async getShows(params = {}) {
    const response = await api.get('/shows', { params });
    return response.data;
  },

  async getShowById(id) {
    const response = await api.get(`/shows/${id}`);
    return response.data;
  },

  async getShowReviews(id) {
    const response = await api.get(`/shows/${id}/reviews`);
    return response.data;
  },

  async getGenres() {
    const response = await api.get('/shows/genres');
    return response.data;
  },

  async trackView(showId) {
    const response = await api.post('/shows/view', { show_id: showId });
    return response.data;
  },

  async getRecommendations(limit = 10) {
    const response = await api.get('/shows/user/recommendations', { params: { limit } });
    return response.data;
  },
};
