import React from 'react';
import { FiStar } from 'react-icons/fi';

const ReviewStats = ({ stats, loading }) => {
    if (loading) return <div className="stats-loading">Loading stats...</div>;
    if (!stats || stats.total_reviews === "0") {
        return (
            <div className="no-reviews-stats">
                <h3>No ratings yet</h3>
                <p>Be the first to review this property!</p>
            </div>
        );
    }

    const {
        total_reviews,
        avg_overall,
        avg_connectivity,
        avg_lifestyle,
        avg_safety,
        avg_green_area,
        star_5, star_4, star_3, star_2, star_1
    } = stats;

    const starCounts = [star_5, star_4, star_3, star_2, star_1];
    const totalCount = parseInt(total_reviews);

    const featureRatings = [
        { label: 'Connectivity', value: parseFloat(avg_connectivity).toFixed(1) },
        { label: 'Lifestyle', value: parseFloat(avg_lifestyle).toFixed(1) },
        { label: 'Safety', value: parseFloat(avg_safety).toFixed(1) },
        { label: 'Green Area', value: parseFloat(avg_green_area).toFixed(1) }
    ];

    return (
        <div className="review-stats-card">
            <div className="overall-rating-box">
                <div className="big-rating">{parseFloat(avg_overall).toFixed(1)}</div>
                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                            key={s}
                            fill={s <= Math.round(avg_overall) ? "#ffc107" : "none"}
                            color={s <= Math.round(avg_overall) ? "#ffc107" : "#e4e5e9"}
                        />
                    ))}
                </div>
                <p className="total-count">{total_reviews} Reviews</p>
            </div>

            <div className="star-distribution">
                {starCounts.map((count, index) => {
                    const stars = 5 - index;
                    const percentage = totalCount > 0 ? (parseInt(count) / totalCount) * 100 : 0;
                    return (
                        <div key={stars} className="distribution-row">
                            <span className="star-label">{stars} ★</span>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <span className="count-label">{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="feature-ratings">
                <h4>Feature Ratings</h4>
                <div className="features-grid">
                    {featureRatings.map((feature) => (
                        <div key={feature.label} className="feature-row">
                            <span className="feature-label">{feature.label}</span>
                            <div className="feature-value-row">
                                <div className="mini-progress-bg">
                                    <div
                                        className="mini-progress-fill"
                                        style={{ width: `${(feature.value / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="feature-num">{feature.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewStats;
