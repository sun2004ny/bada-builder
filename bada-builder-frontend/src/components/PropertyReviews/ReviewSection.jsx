import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import './PropertyReviews.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReviewSection = ({ propertyId, currentUser, userProfile }) => {
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReviewData = async () => {
        try {
            setLoading(true);
            const [statsRes, reviewsRes] = await Promise.all([
                axios.get(`${API_URL}/reviews/stats/${propertyId}`),
                axios.get(`${API_URL}/reviews/property/${propertyId}`)
            ]);
            setStats(statsRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error('Error fetching review data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewData();
    }, [propertyId]);

    return (
        <section className="property-reviews-section">
            <div className="review-section-header">
                <h2 className="section-title">Property Reviews & Ratings</h2>
                {!showForm && currentUser && (
                    <button
                        className="write-review-btn"
                        onClick={() => setShowForm(true)}
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {showForm ? (
                <ReviewForm
                    propertyId={propertyId}
                    currentUser={currentUser}
                    userProfile={userProfile}
                    onCancel={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        // Stats won't update until admin approves, but we can show a message
                        alert('Review submitted! It will be visible after admin approval.');
                    }}
                />
            ) : null}

            <div className="reviews-container">
                <div className="reviews-summary-grid">
                    <ReviewStats stats={stats} loading={loading} />
                    <ReviewList reviews={reviews} loading={loading} />
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;
