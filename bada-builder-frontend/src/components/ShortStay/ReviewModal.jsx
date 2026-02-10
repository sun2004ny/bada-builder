import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import './ReviewModal.css';

const StarRating = ({ rating, setRating, size = 24, color = "#FF385C" }) => {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    size={size}
                    color={star <= rating ? color : "#e0e0e0"}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer', marginRight: '5px' }}
                />
            ))}
        </div>
    );
};

const ReviewModal = ({ isOpen, onClose, booking, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [ratings, setRatings] = useState({
        cleanliness: 0,
        accuracy: 0,
        checkIn: 0,
        communication: 0,
        location: 0,
        value: 0
    });
    const [publicComment, setPublicComment] = useState('');
    const [privateFeedback, setPrivateFeedback] = useState('');
    const [recommend, setRecommend] = useState(null);
    const safetyIssues = []; // Placeholder for now or just remove if unused
    
    // Derived overall rating (simple average)
    const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 6;

    const handleSubmit = () => {
        const reviewData = {
            booking_id: booking.id,
            ratings,
            overall_rating: parseFloat(overallRating.toFixed(1)),
            public_comment: publicComment,
            private_feedback: privateFeedback,
            recommend,
            safety_issues: safetyIssues
        };
        onSubmit(reviewData);
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay">
            <motion.div 
                className="review-modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className="review-modal-header">
                    <h2>Rate your stay</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="review-modal-body">
                    {step === 1 && (
                        <div className="review-step">
                            <h3>How was your stay at {booking.property_title}?</h3>
                            <p className="subtitle">Rate your experience</p>
                            
                            <div className="rating-categories">
                                <div className="rating-row">
                                    <span>Cleanliness</span>
                                    <StarRating rating={ratings.cleanliness} setRating={(v) => setRatings({...ratings, cleanliness: v})} />
                                </div>
                                <div className="rating-row">
                                    <span>Accuracy</span>
                                    <StarRating rating={ratings.accuracy} setRating={(v) => setRatings({...ratings, accuracy: v})} />
                                </div>
                                <div className="rating-row">
                                    <span>Check-in</span>
                                    <StarRating rating={ratings.checkIn} setRating={(v) => setRatings({...ratings, checkIn: v})} />
                                </div>
                                <div className="rating-row">
                                    <span>Communication</span>
                                    <StarRating rating={ratings.communication} setRating={(v) => setRatings({...ratings, communication: v})} />
                                </div>
                                <div className="rating-row">
                                    <span>Location</span>
                                    <StarRating rating={ratings.location} setRating={(v) => setRatings({...ratings, location: v})} />
                                </div>
                                <div className="rating-row">
                                    <span>Value</span>
                                    <StarRating rating={ratings.value} setRating={(v) => setRatings({...ratings, value: v})} />
                                </div>
                            </div>
                            
                            <button 
                                className="next-btn" 
                                disabled={Object.values(ratings).some(r => r === 0)}
                                onClick={() => setStep(2)}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="review-step">
                            <h3>Write a public review</h3>
                            <p className="subtitle">Tell future travelers about your stay</p>
                            <textarea
                                value={publicComment}
                                onChange={(e) => setPublicComment(e.target.value)}
                                placeholder="What did you like? What could be improved?"
                                rows={5}
                            />
                            
                            <h3>Private feedback (Optional)</h3>
                            <p className="subtitle">Share private feedback with the host</p>
                            <textarea
                                value={privateFeedback}
                                onChange={(e) => setPrivateFeedback(e.target.value)}
                                placeholder="Any private suggestions?"
                                rows={3}
                            />

                            <div className="recommend-section">
                                <p>Would you recommend this place?</p>
                                <div className="recommend-options">
                                    <button 
                                        className={`choice-btn ${recommend === true ? 'selected' : ''}`}
                                        onClick={() => setRecommend(true)}
                                    >
                                        Yes
                                    </button>
                                    <button 
                                        className={`choice-btn ${recommend === false ? 'selected' : ''}`}
                                        onClick={() => setRecommend(false)}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                                <button 
                                    className="submit-btn" 
                                    disabled={!publicComment || recommend === null}
                                    onClick={handleSubmit}
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ReviewModal;
