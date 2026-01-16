import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, currentUser } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch favorite property IDs
    const fetchFavoriteIds = useCallback(async () => {
        if (!isAuthenticated) {
            setFavoriteIds([]);
            return;
        }

        try {
            setLoading(true);
            const response = await favoritesAPI.getFavoriteIds();
            if (response.favoriteIds) {
                setFavoriteIds(response.favoriteIds);
            }
        } catch (error) {
            console.error('Error fetching favorite IDs:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchFavoriteIds();
    }, [fetchFavoriteIds]);

    // Toggle favorite
    const toggleFavorite = async (propertyId) => {
        if (!isAuthenticated) {
            // You could trigger a login modal here
            return { error: 'Login required' };
        }

        try {
            const response = await favoritesAPI.toggle(propertyId);
            if (response.isFavorite !== undefined) {
                if (response.isFavorite) {
                    setFavoriteIds(prev => [...prev, propertyId]);
                } else {
                    setFavoriteIds(prev => prev.filter(id => id !== propertyId));
                }
                return { success: true, isFavorite: response.isFavorite };
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return { error: 'Failed to toggle favorite' };
        }
    };

    const isFavorite = (propertyId) => {
        return favoriteIds.includes(propertyId);
    };

    const value = {
        favoriteIds,
        toggleFavorite,
        isFavorite,
        fetchFavoriteIds,
        loading
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
