import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    MessageSquare,
    Star,
    MapPin,
    User,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { reviewsAPI } from '../../services/api';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewsAPI.getPending();
            setReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load pending reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setProcessingId(id);
            if (action === 'approve') {
                await reviewsAPI.approve(id);
            } else {
                await reviewsAPI.reject(id);
            }

            // Remove from list
            setReviews(prev => prev.filter(r => r.id !== id));

            // Show success toast or notification (optional)
        } catch (err) {
            console.error(`Error ${action}ing review:`, err);
            alert(`Failed to ${action} review: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StarRating = ({ rating }) => (
        <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                    Review Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Review and moderate user feedback before it goes live.
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading pending reviews...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Reviews</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
                    <button
                        onClick={fetchPendingReviews}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Caught Up!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                        There are no pending reviews to moderate at this time. Great job!
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    <AnimatePresence>
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                layout
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Header: User & Project Info */}
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                                                {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {review.user_name}
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                                        Verified User
                                                    </span>
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        Property ID: {review.property_id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Rating</span>
                                                <StarRating rating={review.overall_rating} />
                                            </div>
                                            <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Connection: {review.connectivity_rating}/5</span>
                                                <span>•</span>
                                                <span>Lifestyle: {review.lifestyle_rating}/5</span>
                                                <span>•</span>
                                                <span>Safety: {review.safety_rating}/5</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Review Comment</h4>
                                        <p className="text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>

                                        {/* Tags */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(review.positives || []).map((tag, i) => (
                                                <span key={`pos-${i}`} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md border border-green-200 dark:border-green-800">
                                                    + {tag}
                                                </span>
                                            ))}
                                            {(review.negatives || []).map((tag, i) => (
                                                <span key={`neg-${i}`} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-200 dark:border-red-800">
                                                    - {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <button
                                            onClick={() => handleAction(review.id, 'reject')}
                                            disabled={processingId === review.id}
                                            className="px-4 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(review.id, 'approve')}
                                            disabled={processingId === review.id}
                                            className="px-6 py-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                                        >
                                            {processingId === review.id ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5" />
                                            )}
                                            Approve Review
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
