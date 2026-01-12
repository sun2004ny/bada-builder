// src/pages/MyInvestments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// TODO: Remove Firebase - implement with API
import { formatDate } from '../utils/dateFormatter';
import { FaChartLine, FaRupeeSign, FaCalendarAlt, FaArrowRight, FaBuilding } from 'react-icons/fa';
import './MyInvestments.css';

const MyInvestments = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [stats, setStats] = useState({
        totalInvested: 0,
        activeOpportunities: 0,
        averageReturn: 0
    });

    const categories = ['All', 'Commercial', 'Residential', 'Co-Working', 'Co-Living', 'Land'];

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Subscribe to investments for the current user
        const investmentsRef = collection(db, 'investments');
        const q = query(
            investmentsRef,
            where('user_id', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const investmentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by date manually if Firestore index isn't ready
            investmentsData.sort((a, b) => {
                const dateA = a.investedDate?.toDate() || new Date(0);
                const dateB = b.investedDate?.toDate() || new Date(0);
                return dateB - dateA;
            });

            setInvestments(investmentsData);

            // Calculate Stats (Global, not filtered for portfolio overview)
            const total = investmentsData.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
            const uniqueProps = new Set(investmentsData.map(inv => inv.propertyId)).size;
            const avgReturn = investmentsData.length > 0
                ? investmentsData.reduce((sum, inv) => sum + (inv.expectedReturn || 0), 0) / investmentsData.length
                : 0;

            setStats({
                totalInvested: total,
                activeOpportunities: uniqueProps,
                averageReturn: avgReturn.toFixed(1)
            });

            setLoading(false);
        }, (error) => {
            console.error("Error fetching investments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, navigate]);

    const filteredInvestments = investments.filter(inv => {
        if (activeCategory === 'All') return true;
        return inv.category?.toLowerCase() === activeCategory.toLowerCase();
    });

    if (loading) {
        return (
            <div className="my-investments-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Analyzing your portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-investments-page">
            <div className="my-investments-container">
                {/* Header */}
                <div className="page-header">
                    <h1>📈 My Portfolio</h1>
                    <p>Track and manage your fractional real estate investments</p>
                </div>

                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-label">Total Invested</span>
                        <span className="stat-value">₹{(stats.totalInvested / 100000).toFixed(2)} L</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Projects</span>
                        <span className="stat-value">{stats.activeOpportunities}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Avg. Expected Yield</span>
                        <span className="stat-value">{stats.averageReturn}%</span>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Investments Content */}
                {filteredInvestments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h3>{activeCategory === 'All' ? 'No Investments Yet' : `No ${activeCategory} Investments`}</h3>
                        <p>
                            {activeCategory === 'All'
                                ? "You haven't made any investments yet. Start building your portfolio with high-yield fractional properties!"
                                : `You don't have any investments in the ${activeCategory} category yet.`}
                        </p>
                        {activeCategory === 'All' && (
                            <button
                                className="explore-btn"
                                onClick={() => navigate('/investments')}
                            >
                                Explore Opportunities
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="investments-list">
                        {filteredInvestments.map((investment) => (
                            <div key={investment.id} className="investment-card">
                                <div className="investment-image">
                                    <img src={investment.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'} alt={investment.propertyName} />
                                    <div className="status-badge">{investment.status || 'Active'}</div>
                                </div>

                                <div className="investment-details">
                                    <div className="investment-header">
                                        <h3>{investment.propertyName}</h3>
                                        <div className="type-category">
                                            <span className="type-tag">{investment.propertyType}</span>
                                            <span className="separator">•</span>
                                            <span className="category-tag">{investment.category}</span>
                                        </div>
                                    </div>

                                    <div className="investment-metrics">
                                        <div className="metric-item">
                                            <span className="metric-label">Invested Amount</span>
                                            <span className="metric-value">₹{investment.investedAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="metric-item">
                                            <span className="metric-label">Expected Yield</span>
                                            <span className="metric-value">{investment.expectedReturn}% p.a.</span>
                                        </div>
                                    </div>

                                    <div className="investment-footer">
                                        <span className="invested-on">
                                            <FaCalendarAlt className="inline mr-1" />
                                            Invested: {investment.investedDate ? formatDate(investment.investedDate.toDate()) : 'N/A'}
                                        </span>
                                        <Link to={`/investment-details/${investment.propertyId}`} className="view-btn">
                                            View Details <FaArrowRight />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInvestments;
