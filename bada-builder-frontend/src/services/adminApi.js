import { apiRequest } from './api';

// Admin API service - uses existing endpoints with admin context
export const adminAPI = {
  // Dashboard stats
  async getDashboardStats() {
    try {
      const response = await apiRequest('/admin/stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // User management
  async getUsers(filters = {}) {
    try {
      // Mock data for now - replace with actual admin endpoint
      // In production: return apiRequest('/admin/users', { params: filters });

      return {
        users: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            user_type: 'individual',
            status: 'active',
            created_at: '2024-01-15T10:30:00Z',
            last_login: '2024-01-20T14:22:00Z',
            properties_count: 3,
            bookings_count: 5
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@developer.com',
            user_type: 'developer',
            status: 'active',
            created_at: '2024-01-10T09:15:00Z',
            last_login: '2024-01-21T11:45:00Z',
            properties_count: 15,
            bookings_count: 0
          },
          {
            id: 4,
            name: 'Admin User',
            email: 'sunny260604@gmail.com',
            user_type: 'admin',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            last_login: '2024-01-21T15:00:00Z',
            properties_count: 0,
            bookings_count: 0
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async updateUserStatus(userId, status) {
    try {
      // Mock implementation - replace with actual admin endpoint
      // In production: return apiRequest(`/admin/users/${userId}/status`, { method: 'PATCH', body: { status } });

      console.log(`Updating user ${userId} status to ${status}`);
      return { success: true, message: `User ${status} successfully` };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Property management
  async getPropertiesForApproval(filters = {}) {
    try {
      // Use existing properties endpoint but filter for admin review
      const response = await apiRequest('/properties', {
        params: {
          status: 'all', // Get all statuses for admin review
          limit: 100,
          ...filters
        }
      });

      // Mock additional admin-specific data
      const mockProperties = [
        {
          id: 1,
          title: 'Luxury Villa in Gurgaon',
          type: 'Villa',
          price: '2.5 Cr',
          location: 'Sector 54, Gurgaon',
          status: 'pending',
          submitted_by: 'John Developer',
          submitted_at: '2024-01-20T10:30:00Z',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
          description: 'Beautiful luxury villa with modern amenities and spacious rooms.',
          area: '2500 sq ft',
          bedrooms: 4,
          bathrooms: 3,
          amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security']
        },
        {
          id: 2,
          title: 'Modern Apartment Complex',
          type: 'Apartment',
          price: '1.2 Cr',
          location: 'Sector 150, Noida',
          status: 'approved',
          submitted_by: 'Jane Builder',
          submitted_at: '2024-01-19T14:22:00Z',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
          description: 'Contemporary apartment complex with excellent connectivity.',
          area: '1200 sq ft',
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['Gym', 'Elevator', 'Parking', 'Power Backup']
        }
      ];

      return { properties: mockProperties };
    } catch (error) {
      console.error('Error fetching properties for approval:', error);
      throw error;
    }
  },

  async approveProperty(propertyId) {
    try {
      // Mock implementation - replace with actual admin endpoint
      // In production: return apiRequest(`/admin/properties/${propertyId}/approve`, { method: 'PATCH' });

      console.log(`Approving property ${propertyId}`);
      return { success: true, message: 'Property approved successfully' };
    } catch (error) {
      console.error('Error approving property:', error);
      throw error;
    }
  },

  async rejectProperty(propertyId, reason) {
    try {
      // Mock implementation - replace with actual admin endpoint
      // In production: return apiRequest(`/admin/properties/${propertyId}/reject`, { method: 'PATCH', body: { reason } });

      console.log(`Rejecting property ${propertyId} with reason: ${reason}`);
      return { success: true, message: 'Property rejected successfully' };
    } catch (error) {
      console.error('Error rejecting property:', error);
      throw error;
    }
  },

  // Unified Property Management
  async getAdminProperties(filters = {}) {
    try {
      return await apiRequest('/admin/properties', { params: filters });
    } catch (error) {
      console.error('Error fetching admin properties:', error);
      throw error;
    }
  },

  async getAdminPropertyStats() {
    try {
      return await apiRequest('/admin/properties/stats');
    } catch (error) {
      console.error('Error fetching admin property stats:', error);
      throw error;
    }
  },

  async addAdminProperty(propertyData) {
    try {
      return await apiRequest('/admin/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData)
      });
    } catch (error) {
      console.error('Error adding admin property:', error);
      throw error;
    }
  },

  async updateAdminProperty(propertyId, propertyData) {
    try {
      return await apiRequest(`/admin/properties/${propertyId}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData)
      });
    } catch (error) {
      console.error('Error updating admin property:', error);
      throw error;
    }
  },

  async patchAdminProperty(propertyId, data) {
    try {
      return await apiRequest(`/admin/properties/${propertyId}/status`, {
        method: 'PATCH',
        body: data
      });
    } catch (error) {
      console.error('Error patching admin property:', error);
      throw error;
    }
  },

  async deleteAdminProperty(propertyId) {
    try {
      return await apiRequest(`/admin/properties/${propertyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting admin property:', error);
      throw error;
    }
  },

  // Audit logs
  async getAuditLogs(filters = {}) {
    try {
      // Mock data for now - replace with actual admin endpoint
      // In production: return apiRequest('/admin/audit-logs', { params: filters });

      return {
        logs: [
          {
            id: 1,
            timestamp: '2024-01-21T15:30:00Z',
            action: 'user_login',
            user_id: 'admin@example.com',
            user_name: 'Admin User',
            resource_type: 'authentication',
            resource_id: null,
            details: 'Admin user logged in successfully',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            status: 'success'
          },
          {
            id: 2,
            timestamp: '2024-01-21T15:25:00Z',
            action: 'property_approved',
            user_id: 'admin@example.com',
            user_name: 'Admin User',
            resource_type: 'property',
            resource_id: 'prop_123',
            details: 'Property "Luxury Villa in Gurgaon" approved for listing',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            status: 'success'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Site Visit Bookings
  async getSiteVisitBookings(params = {}) {
    try {
      return await apiRequest('/admin/bookings', { params });
    } catch (error) {
      console.error('Error fetching site visit bookings:', error);
      throw error;
    }
  }
};