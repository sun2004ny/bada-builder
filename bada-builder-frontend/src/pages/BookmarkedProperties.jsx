import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';
import { wishlistAPI } from '../services/wishlistAPI';
import { shortStayAPI } from '../services/shortStayApi';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import ShortStayCard from '../components/PropertyCard/ShortStayCard';
import { FiHeart, FiSearch, FiPlus, FiFolder, FiTrash2, FiHome, FiBriefcase, FiMap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import WishlistModal from '../components/Wishlist/WishlistModal';
import WishlistSelectionModal from '../components/Wishlist/WishlistSelectionModal';
import './BookmarkedProperties.css';

const BookmarkedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [shortStayFavorites, setShortStayFavorites] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeWishlist, setActiveWishlist] = useState('all'); // 'all' or wishlist.id
    const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'individual', 'developer', 'short_stay'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [favResponse, wishResponse, shortStayResponse] = await Promise.all([
                favoritesAPI.getFavorites(),
                wishlistAPI.getWishlists(),
                shortStayAPI.getUserFavorites().catch(() => ({ favorites: [] }))
            ]);
            setProperties(favResponse.properties || []);
            setWishlists(wishResponse.wishlists || []);
            setShortStayFavorites(shortStayResponse.favorites || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateWishlist = async (name) => {
        try {
            await wishlistAPI.createWishlist(name);
            const response = await wishlistAPI.getWishlists();
            setWishlists(response.wishlists || []);
        } catch (error) {
            console.error('Error creating wishlist:', error);
        }
    };

    const handleDeleteWishlist = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this wishlist?')) {
            try {
                await wishlistAPI.deleteWishlist(id);
                if (activeWishlist === id) setActiveWishlist('all');
                const response = await wishlistAPI.getWishlists();
                setWishlists(response.wishlists || []);
            } catch (error) {
                console.error('Error deleting wishlist:', error);
            }
        }
    };

    const handleOpenSelection = (e, propertyId) => {
        e.stopPropagation();
        setSelectedPropertyId(propertyId);
        setIsSelectionModalOpen(true);
    };

    const handleRemoveFromWishlist = async (e, propertyId) => {
        e.stopPropagation();
        if (!activeWishlist || activeWishlist === 'all') return;

        try {
            await wishlistAPI.removePropertyFromWishlist(activeWishlist, propertyId);
            const response = await wishlistAPI.getWishlistProperties(activeWishlist);
            setProperties(response.properties || []);
            const wishResponse = await wishlistAPI.getWishlists();
            setWishlists(wishResponse.wishlists || []);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleWishlistChange = async (id) => {
        setActiveWishlist(id);
        setLoading(true);
        try {
            if (id === 'all') {
                const data = await favoritesAPI.getFavorites();
                setProperties(data.properties || []);
            } else {
                const data = await wishlistAPI.getWishlistProperties(id);
                setProperties(data.properties || []);
            }
        } catch (error) {
            console.error('Error changing wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && properties.length === 0 && shortStayFavorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="loading-spinner"></div>
                <p className="text-gray-600 mt-4 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    const currentWishlistName = activeWishlist === 'all'
        ? 'All Favorites'
        : wishlists.find(w => w.id === activeWishlist)?.name || 'Wishlist';

    return (
        <div className="bookmarked-properties-page bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {currentWishlistName}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {activeWishlist === 'all'
                                ? "Manage all your bookmarked properties"
                                : `Properties in your ${currentWishlistName} wishlist`}
                        </p>
                    </div>
                    <button
                        className="wishlist-header-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <FiPlus size={20} />
                        <span>Create wishlist</span>
                    </button>
                </div>

                {/* Category Filtering Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
                   <button 
                     className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${activeCategory === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveCategory('all')}
                   >
                     All Properties
                   </button>
                   <button 
                     className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${activeCategory === 'individual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveCategory('individual')}
                   >
                     <div className="flex items-center gap-2"><FiHome size={16} /> By Individual</div>
                   </button>
                   <button 
                     className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${activeCategory === 'developer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveCategory('developer')}
                   >
                     <div className="flex items-center gap-2"><FiBriefcase size={16} /> By Developer</div>
                   </button>
                   <button 
                     className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${activeCategory === 'short_stay' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveCategory('short_stay')}
                   >
                     <div className="flex items-center gap-2"><FiMap size={16} /> Short Stays</div>
                   </button>
                </div>

                {/* Wishlist Tabs - Only show for regular properties if needed, or hide for 'short_stay' */}
                {activeCategory !== 'short_stay' && (
                <div className="wishlist-tabs-container mb-10">
                    <div className="wishlist-tabs-scroll">
                        <button
                            className={`wishlist-tab ${activeWishlist === 'all' ? 'active' : ''}`}
                            onClick={() => handleWishlistChange('all')}
                        >
                            <FiHeart size={18} />
                            <span>All</span>
                        </button>

                        {wishlists.map((wishlist) => (
                            <div key={wishlist.id} className="relative group/tab">
                                <button
                                    className={`wishlist-tab ${activeWishlist === wishlist.id ? 'active' : ''}`}
                                    onClick={() => handleWishlistChange(wishlist.id)}
                                >
                                    <FiFolder size={18} />
                                    <span>{wishlist.name}</span>
                                    {wishlist.property_count > 0 && (
                                        <span className="tab-count">{wishlist.property_count}</span>
                                    )}
                                </button>
                                <button
                                    className="wishlist-tab-delete-btn"
                                    onClick={(e) => handleDeleteWishlist(e, wishlist.id)}
                                    title="Delete wishlist"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Property Grid */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-gray-50/50 z-20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="loading-spinner"></div>
                        </div>
                    )}

                    {(properties.length > 0 || shortStayFavorites.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {/* Short Stay Cards */}
                            {(activeCategory === 'all' || activeCategory === 'short_stay') && shortStayFavorites.map((property, index) => (
                                <ShortStayCard
                                    key={`ss-${property.id}`}
                                    listing={property}
                                    index={index}
                                    favorites={new Set(shortStayFavorites.map(p => p.id))}
                                    onToggleFavorite={async (e) => {
                                        e.stopPropagation();
                                        await shortStayAPI.toggleFavorite(property.id);
                                        // Refresh only short stay favorites
                                        const res = await shortStayAPI.getUserFavorites();
                                        setShortStayFavorites(res.favorites || []);
                                    }}
                                />
                            ))}

                            {/* Regular Property Cards - Filtered by Category */}
                            {(activeCategory !== 'short_stay') && properties.filter(p => {
                                if (activeCategory === 'all') return true;
                                if (activeCategory === 'individual') return p.type?.toLowerCase().includes('individual') || p.category?.toLowerCase() === 'individual';
                                if (activeCategory === 'developer') return p.type?.toLowerCase().includes('developer') || p.category?.toLowerCase() === 'developer';
                                return true;
                            }).map((property) => (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    layout
                                    className="relative group"
                                >
                                    <PropertyCard property={property} source="favorites" />

                                    {/* Wishlist Overlay Button */}
                                    <div className="wishlist-action-overlay">
                                        <div className="relative">
                                            <button
                                                className="remove-from-wishlist-fab"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Toggle selection for this specific property
                                                    setSelectedPropertyId(selectedPropertyId === property.id ? null : property.id);
                                                }}
                                                title="Delete options"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>

                                            {/* Deletion Dropdown */}
                                            <AnimatePresence>
                                                {selectedPropertyId === property.id && (
                                                    <motion.div
                                                        className="delete-dropdown-menu"
                                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {activeWishlist !== 'all' && (
                                                            <button
                                                                className="delete-menu-item"
                                                                onClick={(e) => {
                                                                    handleRemoveFromWishlist(e, property.id);
                                                                    setSelectedPropertyId(null);
                                                                }}
                                                            >
                                                                Remove from this list
                                                            </button>
                                                        )}
                                                        <button
                                                            className="delete-menu-item danger"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('Remove from favorites entirely?')) {
                                                                    try {
                                                                        await favoritesAPI.toggle(property.id);
                                                                        fetchData();
                                                                        setSelectedPropertyId(null);
                                                                    } catch (error) {
                                                                        console.error('Error removing from favorites:', error);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Remove from Favorites
                                                        </button>
                                                        <button
                                                            className="delete-menu-item cancel"
                                                            onClick={() => setSelectedPropertyId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {activeWishlist === 'all' && (
                                            <button
                                                className="add-to-wishlist-fab"
                                                onClick={(e) => handleOpenSelection(e, property.id)}
                                                title="Add to wishlist"
                                            >
                                                <FiPlus size={20} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-6 bg-gray-50 rounded-full text-gray-400">
                                    <FiSearch size={48} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No properties found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {activeWishlist === 'all'
                                    ? "You haven't added any properties to your favorites yet."
                                    : `This wishlist is empty. Add properties from your 'All' favorites.`}
                            </p>
                            {activeWishlist === 'all' && (
                                <button
                                    onClick={() => window.location.href = '/exhibition'}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Explore Properties
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <WishlistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateWishlist}
            />

            <WishlistSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                propertyId={selectedPropertyId}
                wishlists={wishlists}
                onPropertyAdded={() => {
                    fetchData(); // Refresh counts
                }}
                onCreateNew={() => setIsCreateModalOpen(true)}
            />
        </div>
    );
};

export default BookmarkedProperties;
