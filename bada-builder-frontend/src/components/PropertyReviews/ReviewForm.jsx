import React, { useState } from 'react';
import axios from 'axios';
import { FiStar, FiX } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReviewForm = ({ propertyId, currentUser, userProfile, onCancel, onSuccess }) => {
    const [ratings, setRatings] = useState({
        overall: 0,
        connectivity: 0,
        lifestyle: 0,
        safety: 0,
        green_area: 0
    });
    const [comment, setComment] = useState('');
    const [positives, setPositives] = useState([]);
    const [negatives, setNegatives] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const availablePositives = ['Prime Location', 'Good Connectivity', 'Safe Neighborhood', 'Gated Community', 'Greenery', 'Modern Amenities'];
    const availableNegatives = ['Crowded Area', 'High Traffic', 'Noise Pollution', 'Water Supply Issues', 'Limited Parking', 'Old Construction'];

    const handleRatingChange = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const toggleTag = (tag, list, setList) => {
        if (list.includes(tag)) {
            setList(list.filter(t => t !== tag));
        } else {
            setList([...list, tag]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ratings.overall === 0) {
            alert('Please provide an overall rating.');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const reviewData = {
                property_id: propertyId,
                user_id: currentUser.uid || currentUser.id,
                user_name: userProfile?.name || currentUser.displayName || currentUser.email,
                overall_rating: ratings.overall,
                connectivity_rating: ratings.connectivity || 1,
                lifestyle_rating: ratings.lifestyle || 1,
                safety_rating: ratings.safety || 1,
                green_area_rating: ratings.green_area || 1,
                comment,
                positives,
                negatives
            };

            await axios.post(`${API_URL}/reviews`, reviewData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ category, label }) => (
        <div className="star-rating-row">
            <span>{label}</span>
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(category, star)}
                        onMouseEnter={(e) => {
                            // Simple hover effect
                        }}
                    >
                        <FiStar
                            fill={star <= ratings[category] ? "#ffc107" : "none"}
                            color={star <= ratings[category] ? "#ffc107" : "#cbd5e1"}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="review-form-overlay">
            <div className="review-form-container">
                <div className="form-header">
                    <h3>Write a Review</h3>
                    <button className="close-form-btn" onClick={onCancel}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="ratings-section">
                        <h4>Rate your experience</h4>
                        <StarRating category="overall" label="Overall Rating *" />
                        <div className="feature-ratings-grid">
                            <StarRating category="connectivity" label="Connectivity" />
                            <StarRating category="lifestyle" label="Lifestyle" />
                            <StarRating category="safety" label="Safety" />
                            <StarRating category="green_area" label="Green Area" />
                        </div>
                    </div>

                    <div className="tags-section">
                        <h4>Positives</h4>
                        <div className="tags-container">
                            {availablePositives.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-btn pos ${positives.includes(tag) ? 'active' : ''}`}
                                    onClick={() => toggleTag(tag, positives, setPositives)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <h4 className="mt-4">Negatives</h4>
                        <div className="tags-container">
                            {availableNegatives.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-btn neg ${negatives.includes(tag) ? 'active' : ''}`}
                                    onClick={() => toggleTag(tag, negatives, setNegatives)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="comment-section">
                        <h4>Share more details</h4>
                        <textarea
                            placeholder="Write your detailed review here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="submit-review-btn" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
