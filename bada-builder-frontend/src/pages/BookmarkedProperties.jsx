import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import { FiHeart, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BookmarkedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await favoritesAPI.getFavorites();
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="loading-spinner"></div>
                <p className="text-gray-600 mt-4 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="bookmarked-properties-page bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex p-4 rounded-full bg-red-50 text-red-500 mb-4"
                    >
                        <FiHeart size={32} />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Favorite Properties</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage all the properties you've bookmarked for later.
                        Click the heart icon to remove them from your list.
                    </p>
                </div>

                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {properties.map((property) => (
                            <motion.div
                                key={property.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <PropertyCard property={property} source="favorites" />
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
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No bookmarks found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            You haven't added any properties to your favorites yet.
                            Start exploring and click the heart icon to save listings you like!
                        </p>
                        <button
                            onClick={() => window.location.href = '/exhibition'}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Explore Properties
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BookmarkedProperties;
