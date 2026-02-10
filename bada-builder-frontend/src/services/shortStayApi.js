import { apiRequest, uploadFile } from './api';

export const shortStayAPI = {
  // --- Listings ---
  getAll: async (filters = {}) => {
    return apiRequest('/short-stay', { 
        params: filters,
        includeAuth: false 
    });
  },

  getById: async (id) => {
    return apiRequest(`/short-stay/${id}`, { 
        includeAuth: false 
    });
  },

  create: async (propertyData, images = []) => {
    const formData = new FormData();

    // Append standard fields
    ['title', 'description', 'category'].forEach(key => {
        if (propertyData[key]) formData.append(key, propertyData[key]);
    });

    // Append JSON fields (need to be stringified)
    ['location', 'pricing', 'rules', 'policies', 'specific_details'].forEach(key => {
        if (propertyData[key]) {
            formData.append(key, JSON.stringify(propertyData[key]));
        }
    });
    
    // Append Amenities (Array -> JSON string)
    if (propertyData.amenities) {
        formData.append('amenities', JSON.stringify(propertyData.amenities));
    }

    // Append Images
    images.forEach(image => {
        formData.append('images', image);
    });

    return uploadFile('/short-stay', formData);
  },

  update: async (id, propertyData, newImages = []) => {
    const formData = new FormData();

    // Append standard fields
    ['title', 'description', 'category'].forEach(key => {
        if (propertyData[key]) formData.append(key, propertyData[key]);
    });

    // Append JSON fields
    ['location', 'pricing', 'rules', 'policies', 'specific_details'].forEach(key => {
        if (propertyData[key]) {
            formData.append(key, JSON.stringify(propertyData[key]));
        }
    });

    // Append Amenities
    if (propertyData.amenities) {
        formData.append('amenities', JSON.stringify(propertyData.amenities));
    }

    // Append existing images array (as JSON string)
    if (propertyData.existing_images) {
         formData.append('existing_images', JSON.stringify(propertyData.existing_images));
    }

    // Append New Images
    newImages.forEach(image => {
        formData.append('images', image);
    });

    return uploadFile(`/short-stay/${id}`, formData, true, 'PUT');
  },

  delete: async (id) => {
    return apiRequest(`/short-stay/${id}`, { method: 'DELETE' });
  },

  getMyListings: async () => {
    return apiRequest('/short-stay/user/my-listings');
  },

  // --- Favorites ---
  toggleFavorite: async (propertyId) => {
    return apiRequest('/short-stay/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  getUserFavorites: async () => {
    return apiRequest('/short-stay/user/favorites');
  },

  // --- Reservations ---
  reserve: async (data) => {
    return apiRequest('/short-stay/reserve', {
        method: 'POST',
        body: JSON.stringify(data)
    });
  },

  getHostReservations: async () => {
    return apiRequest('/short-stay/reservations/host');
  },

  verifyBooking: async (reservationId, bookingCode) => {
    return apiRequest('/short-stay/host/verify-booking', {
        method: 'POST',
        body: JSON.stringify({ reservationId, bookingCode })
    });
  },

  // --- Analytics ---
  getRevenueSummary: async () => {
    return apiRequest('/short-stay/analytics/revenue-summary');
  },

  getRevenueChart: async () => {
    return apiRequest('/short-stay/analytics/monthly-chart');
  },

  getPropertyPerformance: async () => {
    return apiRequest('/short-stay/analytics/property-performance');
  },

  // --- Reservations ---
  getTravelerReservations: async () => {
    return apiRequest('/short-stay/reservations/traveler');
  },

  getAvailability: async (propertyId, checkIn, checkOut) => {
    const params = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    
    return apiRequest(`/short-stay/availability/${propertyId}`, {
        params,
        includeAuth: false
    });
  },

  // --- Host Calendar ---
  getCalendar: async (propertyId, start, end) => {
      return apiRequest(`/short-stay/calendar/${propertyId}`, {
          params: { start, end }
      });
  },

  updateCalendar: async (data) => {
      return apiRequest('/short-stay/calendar/update', {
          method: 'POST',
          body: JSON.stringify(data)
      });
  },
  // --- Reviews ---
  submitReview: async (reviewData) => {
    return apiRequest('/short-stay-reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData)
    });
  },

  getPropertyReviews: async (propertyId) => {
    return apiRequest(`/short-stay-reviews/property/${propertyId}`, {
        includeAuth: false
    });
  },

  checkReviewStatus: async (bookingId) => {
    return apiRequest(`/short-stay-reviews/check/${bookingId}`);
  },
};
