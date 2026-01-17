import { apiRequest } from './api';

export const wishlistAPI = {
    // Get all wishlists
    getWishlists: async () => {
        return await apiRequest('/wishlists');
    },

    // Create new wishlist
    createWishlist: async (name) => {
        return await apiRequest('/wishlists', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    // Get specific wishlist properties
    getWishlistProperties: async (wishlistId) => {
        return await apiRequest(`/wishlists/${wishlistId}`);
    },

    // Add property to wishlist
    addPropertyToWishlist: async (wishlistId, propertyId) => {
        return await apiRequest(`/wishlists/${wishlistId}/properties`, {
            method: 'POST',
            body: JSON.stringify({ propertyId }),
        });
    },

    // Remove property from wishlist
    removePropertyFromWishlist: async (wishlistId, propertyId) => {
        return await apiRequest(`/wishlists/${wishlistId}/properties/${propertyId}`, {
            method: 'DELETE',
        });
    },

    // Delete wishlist
    deleteWishlist: async (wishlistId) => {
        return await apiRequest(`/wishlists/${wishlistId}`, {
            method: 'DELETE',
        });
    },
};
