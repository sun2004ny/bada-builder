import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiTrash2, FiStar, FiCalendar, FiUser } from 'react-icons/fi';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageReviews = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/reviews/admin/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingReviews(res.data);
        } catch (error) {
            console.error('Error fetching pending reviews:', error);
            if (error.response?.status === 401) {
                setMessage({
                    text: 'Unauthorized: You need a backend account to moderate reviews. Please ensure your admin email is registered in the database.',
                    type: 'error'
                });
            } else {
                setMessage({ text: 'Failed to load pending reviews.', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/reviews/admin/${action}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({
                text: `Review ${action === 'approve' ? 'approved' : 'rejected'} successfully!`,
                type: 'success'
            });

            // Remove from list
            setPendingReviews(prev => prev.filter(r => r.id !== id));

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error(`Error ${action}ing review:`, error);
            setMessage({ text: `Failed to ${action} review.`, type: 'error' });
        }
    };

    if (loading) return <div className="admin-loading">Loading pending reviews...</div>;

    return (
        <div className="manage-reviews-container">
            <div className="admin-header">
                <h1>Manage Reviews</h1>
                <p>Approve or reject customer property reviews</p>
            </div>

            {message.text && (
                <div className={`admin-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            {pendingReviews.length === 0 ? (
                <div className="no-pending">
                    <p>No pending reviews to moderate.</p>
                </div>
            ) : (
                <div className="reviews-grid">
                    {pendingReviews.map(review => (
                        <div key={review.id} className="admin-review-card">
                            <div className="card-top">
                                <div className="user-box">
                                    <FiUser />
                                    <span>{review.user_name}</span>
                                </div>
                                <div className="rating-badge">
                                    {review.overall_rating} <FiStar fill="currentColor" />
                                </div>
                            </div>

                            <div className="property-ref">
                                <strong>Property ID:</strong> {review.property_id}
                            </div>

                            <div className="review-text">
                                "{review.comment}"
                            </div>

                            <div className="review-metadata">
                                <div><FiCalendar /> {new Date(review.created_at).toLocaleDateString()}</div>
                            </div>

                            <div className="admin-actions">
                                <button
                                    className="approve-btn"
                                    onClick={() => handleAction(review.id, 'approve')}
                                    title="Approve"
                                >
                                    <FiCheck /> Approve
                                </button>
                                <button
                                    className="reject-btn"
                                    onClick={() => handleAction(review.id, 'reject')}
                                    title="Reject & Delete"
                                >
                                    <FiTrash2 /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageReviews;
