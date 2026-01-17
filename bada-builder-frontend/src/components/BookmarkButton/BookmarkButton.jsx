import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast/Toast';

const BookmarkButton = ({ propertyId, source = 'card' }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const favorited = isFavorite(propertyId);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            const shouldLogin = window.confirm('Please login to bookmark properties. Would you like to go to the login page?');
            if (shouldLogin) {
                navigate('/login');
            }
            return;
        }

        if (loading) return;

        // Check if we are about to add to favorites (currently not favorited)
        const isAdding = !favorited;

        setLoading(true);
        const result = await toggleFavorite(propertyId);
        setLoading(false);

        if (result?.error) {
            alert('Failed to update bookmark. Please try again.');
        } else if (result?.success && isAdding && result.isFavorite) {
            // Only show toast when successfully ADDED
            setShowToast(true);
        }
    };

    const style = source === 'details'
        ? "p-3 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
        : "p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all";

    return (
        <>
            <button
                onClick={handleToggle}
                className={`bookmark-btn ${style} ${loading ? 'opacity-50 cursor-wait' : ''}`}
                title={favorited ? "Remove from Favorites" : "Add to Favorites"}
                disabled={loading}
            >
                {favorited ? (
                    <FaHeart className="text-red-500 scale-110 transition-transform" size={source === 'details' ? 24 : 20} />
                ) : (
                    <FiHeart className="text-gray-600 hover:text-red-500 transition-colors" size={source === 'details' ? 24 : 20} />
                )}
            </button>

            <Toast
                message="Added to favorites. Tap to view saved properties."
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profile/favorites');
                }}
            />
        </>
    );
};

export default BookmarkButton;
