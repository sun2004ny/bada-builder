const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function for file upload headers
const getFileHeaders = (includeAuth = true) => {
  const headers = {};

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API request wrapper
export const apiRequest = async (endpoint, options = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;

  // Handle query parameters
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.keys(options.params).forEach(key => {
      if (options.params[key] !== undefined && options.params[key] !== null && options.params[key] !== '') {
        queryParams.append(key, options.params[key]);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    // Remove params from options so it's not sent in the fetch config
    delete options.params;
  }

  const config = {
    ...options,
    headers: {
      ...getHeaders(options.includeAuth !== false),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Safe JSON Parsing Check
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON response safely (e.g., HTML 404/500/502)
      const text = await response.text();
      data = { error: text || `Request failed with status ${response.status}` };
    }

    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      const error = new Error(data.error || 'Request failed');
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// File upload helper
export const uploadFile = async (endpoint, formData, includeAuth = true, method = 'POST') => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getFileHeaders(includeAuth);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    // Safe JSON Parsing Check
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON response safely
      const text = await response.text();
      data = { error: text || `Upload failed with status ${response.status}` };
    }

    if (!response.ok) {
      console.error('❌ API Error Response:', data);
      const error = new Error(data.error || 'Upload failed');
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  },

  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });

    // Store token
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// ==================== USERS API ====================
export const usersAPI = {
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return uploadFile('/users/profile-photo', formData);
  },

  getStats: async () => {
    return apiRequest('/users/stats');
  },
};

// ==================== PROPERTIES API ====================
export const propertiesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/properties${queryString ? `?${queryString}` : ''}`, {
      includeAuth: false,
    });
  },

  getById: async (id) => {
    return apiRequest(`/properties/${id}`, {
      includeAuth: false,
    });
  },

  create: async (propertyData, images = []) => {
    const formData = new FormData();

    // Append property data
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          // Send as multiple fields or stringify depending on backend preference
          // Our backend handles facilities as array if multiple appends or specific logic
          // Let's stringify if it's an object/array to be safe for complex fields
          if (['residential_options', 'commercial_options', 'amenities', 'facilities', 'images', 'project_images'].includes(key)) {
            propertyData[key].forEach(item => formData.append(key, item));
          } else {
            formData.append(key, JSON.stringify(propertyData[key]));
          }
        } else if (typeof propertyData[key] === 'object' && !(propertyData[key] instanceof File)) {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile('/properties', formData);
  },

  update: async (id, propertyData, images = []) => {
    const formData = new FormData();

    // Append property data
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          if (['residential_options', 'commercial_options', 'amenities', 'facilities', 'images', 'project_images'].includes(key)) {
            propertyData[key].forEach(item => formData.append(key, item));
          } else {
            formData.append(key, JSON.stringify(propertyData[key]));
          }
        } else if (typeof propertyData[key] === 'object' && !(propertyData[key] instanceof File)) {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Append images if provided
    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile(`/properties/${id}`, formData, true, 'PUT');
  },

  delete: async (id) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  getMyProperties: async () => {
    return apiRequest('/properties/user/my-properties');
  },
};

// ==================== LEADS API ====================
export const leadsAPI = {
  create: async (leadData) => {
    return apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
      includeAuth: false,
    });
  },
};

// ==================== BOOKINGS API ====================
export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  verifyPayment: async (paymentData) => {
    return apiRequest('/bookings/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getMyBookings: async () => {
    return apiRequest('/bookings/my-bookings');
  },

  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },
};

// ==================== SUBSCRIPTIONS API ====================
export const subscriptionsAPI = {
  getPlans: async () => {
    return apiRequest('/subscriptions/plans', {
      includeAuth: false,
    });
  },

  createOrder: async (planId) => {
    return apiRequest('/subscriptions/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  },

  verifyPayment: async (paymentData) => {
    return apiRequest('/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getStatus: async () => {
    return apiRequest('/subscriptions/status');
  },
};

// ==================== LIVE GROUPING API ====================
export const liveGroupingAPI = {
  getAll: async () => {
    return apiRequest('/live-grouping', {
      includeAuth: false,
    });
  },

  getById: async (id) => {
    return apiRequest(`/live-grouping/${id}`, {
      includeAuth: false,
    });
  },

  create: async (propertyData, images = []) => {
    const formData = new FormData();

    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else if (typeof propertyData[key] === 'object') {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile('/live-grouping', formData);
  },

  update: async (id, propertyData, images = []) => {
    const formData = new FormData();

    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else if (typeof propertyData[key] === 'object') {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile(`/live-grouping/${id}`, formData, true, 'PUT');
  },

  join: async (id) => {
    return apiRequest(`/live-grouping/${id}/join`, {
      method: 'PATCH',
    });
  },
};

// ==================== DYNAMIC LIVE GROUPING API ====================
export const liveGroupDynamicAPI = {
  // Public
  getAll: async () => {
    return apiRequest('/live-grouping-dynamic', { includeAuth: false });
  },

  getFullHierarchy: async (projectId) => {
    return apiRequest(`/live-grouping-dynamic/${projectId}/full`, { includeAuth: false });
  },

  lockUnit: async (unitId, duration) => {
    return apiRequest(`/live-grouping-dynamic/units/${unitId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  },

  bookUnit: async (unitId, paymentData) => {
    return apiRequest(`/live-grouping-dynamic/units/${unitId}/book`, {
      method: 'POST',
      body: JSON.stringify({ paymentData }),
    });
  },

  createBookingOrder: async (bookingData) => {
    return apiRequest('/live-grouping-dynamic/create-booking-order', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Admin
  createProject: async (projectData, images = [], brochure = null) => {
    const formData = new FormData();
    Object.keys(projectData).forEach(key => {
      if (projectData[key] !== undefined && projectData[key] !== null) {
        formData.append(key, projectData[key]);
      }
    });
    images.forEach(image => formData.append('images', image));
    if (brochure) formData.append('brochure', brochure);
    return uploadFile('/live-grouping-dynamic/admin/projects', formData);
  },

  addTower: async (projectId, towerData) => {
    return apiRequest(`/live-grouping-dynamic/admin/projects/${projectId}/towers`, {
      method: 'POST',
      body: JSON.stringify(towerData),
    });
  },

  updateUnit: async (unitId, unitData) => {
    return apiRequest(`/live-grouping-dynamic/admin/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(unitData),
    });
  },

  generateUnits: async (towerId, generationData) => {
    return apiRequest(`/live-grouping-dynamic/admin/towers/${towerId}/generate-units`, {
      method: 'POST',
      body: JSON.stringify(generationData),
    });
  },

  deleteProject: async (projectId) => {
    return apiRequest(`/live-grouping-dynamic/admin/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  updateProjectStatus: async (projectId, status) => {
    return apiRequest(`/live-grouping-dynamic/admin/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== COMPLAINTS API ====================
export const complaintsAPI = {
  create: async (complaintData, mediaFiles = []) => {
    const formData = new FormData();

    Object.keys(complaintData).forEach(key => {
      if (complaintData[key] !== undefined && complaintData[key] !== null) {
        formData.append(key, complaintData[key]);
      }
    });

    mediaFiles.forEach(file => {
      formData.append('media', file);
    });

    return uploadFile('/complaints', formData, true);
  },

  getAll: async () => {
    return apiRequest('/complaints', { includeAuth: false });
  },

  getMyComplaints: async () => {
    return apiRequest('/complaints/my-complaints');
  },

  getById: async (id) => {
    return apiRequest(`/complaints/${id}`);
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== FAVORITES API ====================
export const favoritesAPI = {
  toggle: async (propertyId) => {
    return apiRequest('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  getFavoriteIds: async () => {
    return apiRequest('/favorites/ids');
  },

  getFavorites: async () => {
    return apiRequest('/favorites');
  },
};

// ==================== CHAT API ====================
export const chatAPI = {
  getUserChats: async () => {
    return apiRequest('/chat/user-chats');
  },

  createOrGetChat: async (chatData) => {
    return apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  },

  sendMessage: async (chatId, message) => {
    return apiRequest(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getMessages: async (chatId) => {
    return apiRequest(`/chat/${chatId}/messages`);
  },

  markAsRead: async (chatId) => {
    return apiRequest(`/chat/${chatId}/read`, {
      method: 'PATCH',
    });
  },
};

// ==================== REVIEWS API ====================
export const reviewsAPI = {
  getPending: async () => {
    return apiRequest('/reviews/admin/pending');
  },

  approve: async (id) => {
    return apiRequest(`/reviews/admin/approve/${id}`, {
      method: 'PATCH',
    });
  },

  reject: async (id) => {
    return apiRequest(`/reviews/admin/reject/${id}`, {
      method: 'PATCH',
    });
  },

  getAll: async (propertyId) => {
    return apiRequest(`/reviews/property/${propertyId}`, { includeAuth: false });
  },

  getStats: async (propertyId) => {
    return apiRequest(`/reviews/stats/${propertyId}`, { includeAuth: false });
  },
};


export default {
  authAPI,
  usersAPI,
  propertiesAPI,
  leadsAPI,
  bookingsAPI,
  subscriptionsAPI,
  liveGroupingAPI,
  liveGroupDynamicAPI,
  complaintsAPI,
  favoritesAPI,
  chatAPI,
  reviewsAPI,
};

