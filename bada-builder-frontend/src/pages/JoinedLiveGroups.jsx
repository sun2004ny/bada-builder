import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUsers, FiCheckCircle, FiClock, FiDollarSign, FiArrowRight, FiInfo,
    FiMapPin, FiBox, FiCheck, FiShield, FiExternalLink, FiHelpCircle
} from 'react-icons/fi';
import { apiRequest } from '../services/api';
import './JoinedLiveGroups.css';

const JoinedLiveGroups = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchJoinedGroups();
    }, []);

    const fetchJoinedGroups = async () => {
        try {
            setLoading(true);
            const response = await apiRequest('/joined-live-groups');
            if (response && response.success) {
                setGroups(response.data || []);
            } else {
                setError('Failed to load your groups.');
            }
        } catch (err) {
            console.error('Error fetching joined groups:', err);
            setError('Could not load your joined groups.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'waiting': return 'status-waiting';
            case 'closed': return 'status-closed';
            default: return 'status-default';
        }
    };

    const getStatusLabel = (status, isActivated) => {
        switch (status) {
            case 'active': return isActivated ? 'Group Activated 🚀' : 'Active & Filling';
            case 'waiting': return 'Waiting for Buyers ⏳';
            case 'closed': return 'Group Closed ✅';
            default: return 'In Progress';
        }
    };

    if (loading) {
        return (
            <div className="jlg-loading-container">
                <div className="jlg-spinner"></div>
                <p>Loading your investment dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="jlg-error-container">
                <div className="jlg-error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onClick={fetchJoinedGroups} className="jlg-retry-btn">Try Again</button>
            </div>
        );
    }

    // --- Empty State ---
    if (groups.length === 0) {
        return (
            <div className="jlg-empty-state">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="jlg-empty-content"
                >
                    <div className="jlg-empty-icon-wrapper">
                        <FiUsers size={48} />
                    </div>
                    <h2>You haven’t joined any live groups yet</h2>
                    <p>Join a live group to unlock exclusive prices and track your investment here.</p>
                    <button onClick={() => navigate('/exhibition/live-grouping')} className="jlg-explore-btn">
                        Explore Live Groups
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="jlg-page-container">
            <div className="jlg-header">
                <h1>Joined Live Groups</h1>
                <p>Track your group status, progress, and investment details.</p>
            </div>

            <div className="jlg-grid">
                {groups.map((group, index) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="jlg-card"
                    >
                        {/* 1. Card Header & Asset Info */}
                        <div className="jlg-card-image-section">
                            <img src={group.projectImage || '/placeholder-project.jpg'} alt={group.projectName} className="jlg-project-img" />
                            <div className="jlg-overlay-gradient"></div>
                            <div className="jlg-image-content">
                                <span className={`jlg-badge ${getStatusColor(group.status)}`}>
                                    {getStatusLabel(group.status, group.isActivated)}
                                </span>
                                <h2 className="jlg-project-title-img">{group.projectName}</h2>
                                <div className="jlg-location-row">
                                    <FiMapPin size={14} className="mr-1" /> {group.location}
                                </div>
                            </div>
                        </div>

                        <div className="jlg-card-body">
                            {/* Asset Details Row */}
                            <div className="jlg-asset-meta">
                                <div className="jlg-meta-item">
                                    <span className="jlg-meta-label">Unit / Plot</span>
                                    <span className="jlg-meta-value">{group.unitNumber}</span>
                                </div>
                                <div className="jlg-meta-item">
                                    <span className="jlg-meta-label">Type</span>
                                    <span className="jlg-meta-value">{group.assetType}</span>
                                </div>
                                <div className="jlg-meta-item">
                                    <span className="jlg-meta-label">Developer</span>
                                    <span className="jlg-meta-value">{group.developer}</span>
                                </div>
                            </div>

                            <div className="jlg-divider"></div>

                            {/* 2. Group Status & Progress */}
                            <div className="jlg-section">
                                <div className="jlg-progress-header">
                                    <h3>Group Progress</h3>
                                    <span className="jlg-progress-percent">{group.progressPercentage}%</span>
                                </div>

                                <div className="jlg-progress-bar-track">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${group.progressPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`jlg-progress-bar-fill ${group.isActivated ? 'bg-success' : ''}`}
                                    ></motion.div>
                                </div>

                                <div className="jlg-progress-stats">
                                    <span><FiUsers className="inline-icon" /> <strong>{group.buyersJoined}</strong> joined</span>
                                    <span>Target: <strong>{group.buyersRequired}</strong></span>
                                </div>

                                {!group.isActivated && group.status !== 'closed' && (
                                    <p className="jlg-progress-note">
                                        🚀 Group activates automatically once minimum buyers join.
                                    </p>
                                )}
                            </div>

                            <div className="jlg-divider"></div>

                            {/* 3. Investment Summary */}
                            <div className="jlg-section jlg-investment-box">
                                <h3>Your Investment</h3>

                                <div className="jlg-stat-row">
                                    <span className="jlg-stat-label">Regular Price</span>
                                    <span className="jlg-stat-value strike">₹{Number(group.regularPrice).toLocaleString('en-IN')}</span>
                                </div>

                                <div className="jlg-stat-row highlight-row">
                                    <span className="jlg-stat-label">Your Locked Price <FiShield className="inline-icon ml-1" /></span>
                                    <span className="jlg-stat-value primary">₹{Number(group.userJoinedPrice).toLocaleString('en-IN')}</span>
                                </div>

                                {group.totalSavings > 0 && (
                                    <div className="jlg-savings-badge">
                                        You saved ₹{Number(group.totalSavings).toLocaleString('en-IN')}!
                                    </div>
                                )}

                                <div className="jlg-stat-row small-text">
                                    <span className="jlg-stat-label">Token Paid</span>
                                    <span className="jlg-stat-value">
                                        {group.tokenPaid > 0 ? `₹${Number(group.tokenPaid).toLocaleString('en-IN')}` : 'Paid ✅'}
                                    </span>
                                </div>

                                <div className="jlg-stat-row small-text">
                                    <span className="jlg-stat-label">Remaining Payable</span>
                                    <span className="jlg-stat-value">₹{Number(group.remainingPayable).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="jlg-divider"></div>

                            {/* 4. Post-Join Journey (Stepper) */}
                            <div className="jlg-section">
                                <h3>What Happens Next?</h3>
                                <div className="jlg-stepper">
                                    {/* Step 1: Joined */}
                                    <div className="jlg-step active completed">
                                        <div className="jlg-step-icon"><FiCheck /></div>
                                        <div className="jlg-step-content">
                                            <h4>Joined & Token Paid</h4>
                                            <p>Price locked on {new Date(group.joinedDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Activation */}
                                    <div className={`jlg-step ${group.isActivated ? 'active completed' : 'active'}`}>
                                        <div className="jlg-step-icon">{group.isActivated ? <FiCheck /> : <div className="spinner-dot"></div>}</div>
                                        <div className="jlg-step-content">
                                            <h4>{group.isActivated ? 'Group Activated' : 'Waiting for Buyers'}</h4>
                                            <p>{group.isActivated ? 'Minimum target met!' : 'Activation is automatic.'}</p>
                                        </div>
                                    </div>

                                    {/* Step 3: Final Payment */}
                                    <div className={`jlg-step ${group.status === 'closed' ? 'active' : ''}`}>
                                        <div className="jlg-step-icon"><FiBox /></div>
                                        <div className="jlg-step-content">
                                            <h4>Possession & Final Payment</h4>
                                            <p>Payable only after activation.</p>
                                        </div>
                                    </div>
                                </div>

                                {!group.isActivated && (
                                    <div className="jlg-reassurance">
                                        <FiShield className="reassurance-icon" />
                                        <p>No further payment required until group activates. You will be notified via email.</p>
                                    </div>
                                )}
                            </div>

                            {/* 5. Actions */}
                            <div className="jlg-actions">
                                <button className="jlg-action-btn primary" onClick={() => navigate(`/exhibition/live-grouping/${group.projectId}`)}>
                                    View Full Details
                                </button>
                                <button className="jlg-action-btn secondary" onClick={() => window.open('/contact', '_blank')}>
                                    <FiHelpCircle className="mr-1" /> Contact Support
                                </button>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default JoinedLiveGroups;
