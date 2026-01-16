import React from 'react';
import { FiStar, FiCheck, FiX } from 'react-icons/fi';

const ReviewList = ({ reviews, loading }) => {
    if (loading) return <div className="reviews-loading">Loading reviews...</div>;

    if (!reviews || reviews.length === 0) {
        return (
            <div className="no-reviews-list">
                <p>No verified reviews for this property yet.</p>
            </div>
        );
    }

    const parseTags = (tags) => {
        if (!tags) return [];
        if (typeof tags === 'string') {
            try {
                return JSON.parse(tags);
            } catch (e) {
                return [];
            }
        }
        return Array.isArray(tags) ? tags : [];
    };

    return (
        <div className="review-list-container">
            <h3 className="list-title">Verified User Reviews</h3>
            <div className="reviews-scroll">
                {reviews.map((review) => {
                    const positives = parseTags(review.positives);
                    const negatives = parseTags(review.negatives);

                    return (
                        <div key={review.id} className="review-card">
                            <div className="review-card-header">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <span className="user-name">{review.user_name}</span>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    {review.overall_rating} ★
                                </div>
                            </div>

                            <div className="review-body">
                                <p className="review-comment">{review.comment}</p>

                                {positives.length > 0 && (
                                    <div className="review-tags pos">
                                        <span className="tag-label"><FiCheck /> Positives:</span>
                                        <div className="tags">
                                            {positives.map((tag, i) => (
                                                <span key={i} className="tag green">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {negatives.length > 0 && (
                                    <div className="review-tags neg">
                                        <span className="tag-label"><FiX /> Negatives:</span>
                                        <div className="tags">
                                            {negatives.map((tag, i) => (
                                                <span key={i} className="tag red">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="feature-ratings-pills">
                                <span className="pill">Connectivity: {review.connectivity_rating}</span>
                                <span className="pill">Lifestyle: {review.lifestyle_rating}</span>
                                <span className="pill">Safety: {review.safety_rating}</span>
                                <span className="pill">Greenery: {review.green_area_rating}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewList;
