import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiCheckCircle, FiTrash2, FiFileText, FiCalendar, FiHome, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './MyComplaints.css';

const MyComplaints = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [userComplaints, setUserComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ongoing');

    useEffect(() => {
        if (!currentUser) return;

        const complaintsRef = collection(db, 'complaints');
        const complaintsQuery = query(complaintsRef, where('userId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserComplaints(complaints);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching complaints:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleMarkFulfilled = async (e, id) => {
        e.stopPropagation();
        try {
            const complaintRef = doc(db, 'complaints', id);
            await updateDoc(complaintRef, {
                status: 'Resolved',
                resolvedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking as fulfilled:', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteComplaint = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this complaint permanently?')) {
            try {
                await deleteDoc(doc(db, 'complaints', id));
                if (selectedComplaint?.id === id) setSelectedComplaint(null);
            } catch (error) {
                console.error('Error deleting complaint:', error);
                alert('Failed to delete complaint');
            }
        }
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'Submitted': return 'status-submitted';
            case 'Under Review': return 'status-review';
            case 'In Progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    };

    if (!currentUser) return null;

    return (
        <div className="my-complaints-page">
            <div className="my-complaints-container">
                <header className="complaints-page-header">
                    <button className="back-btn" onClick={() => navigate('/profile')}>
                        <FiArrowLeft /> Back to Profile
                    </button>
                    <div className="header-titles">
                        <h1>My Complaints</h1>
                        <p>Track and manage your submitted grievances</p>
                    </div>
                </header>

                {loading ? (
                    <div className="complaints-loading">
                        <div className="spinner"></div>
                        <p>Loading your complaints...</p>
                    </div>
                ) : (
                    <div className="complaints-grid-container">
                        <div className="complaints-tabs">
                            <button
                                className={`complaint-tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
                                onClick={() => setActiveTab('ongoing')}
                            >
                                <FiClock /> Ongoing
                            </button>
                            <button
                                className={`complaint-tab-btn ${activeTab === 'fulfilled' ? 'active' : ''}`}
                                onClick={() => setActiveTab('fulfilled')}
                            >
                                <FiCheckCircle /> Fulfilled
                            </button>
                        </div>

                        <div className="complaints-sections">
                            <AnimatePresence mode="wait">
                                {activeTab === 'ongoing' ? (
                                    <motion.div
                                        key="ongoing"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="complaints-section"
                                    >
                                        <h3 className="section-title">
                                            <FiClock className="section-icon" /> Ongoing Complaints
                                        </h3>
                                        <div className="complaints-list">
                                            {userComplaints
                                                .filter(c => ['Submitted', 'Under Review', 'In Progress'].includes(c.status))
                                                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                                                .map(complaint => (
                                                    <div
                                                        key={complaint.id}
                                                        className="complaint-item-card"
                                                        onClick={() => setSelectedComplaint(complaint)}
                                                    >
                                                        <div className="complaint-item-header">
                                                            <span className="complaint-item-id">#{complaint.complaintId}</span>
                                                            <span className={`status-tag ${getStatusColorClass(complaint.status)}`}>
                                                                {complaint.status}
                                                            </span>
                                                        </div>
                                                        <h4 className="complaint-item-title">{complaint.title}</h4>
                                                        <p className="complaint-item-date">
                                                            {new Date(complaint.submittedDate || complaint.createdAt?.toDate()).toLocaleDateString()}
                                                        </p>
                                                        <div className="complaint-item-actions">
                                                            <button
                                                                className="action-btn fulfill"
                                                                onClick={(e) => handleMarkFulfilled(e, complaint.id)}
                                                                title="Mark as Fulfilled"
                                                            >
                                                                <FiCheckCircle /> Fulfil
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={(e) => handleDeleteComplaint(e, complaint.id)}
                                                                title="Delete Complaint"
                                                            >
                                                                <FiTrash2 /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            {userComplaints.filter(c => ['Submitted', 'Under Review', 'In Progress'].includes(c.status)).length === 0 && (
                                                <div className="no-data-msg">
                                                    <FiAlertCircle size={40} />
                                                    <p>No ongoing complaints</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="fulfilled"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="complaints-section"
                                    >
                                        <h3 className="section-title">
                                            <FiCheckCircle className="section-icon" /> Fulfilled Complaints
                                        </h3>
                                        <div className="complaints-list">
                                            {userComplaints
                                                .filter(c => ['Resolved', 'Rejected'].includes(c.status))
                                                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                                                .map(complaint => (
                                                    <div
                                                        key={complaint.id}
                                                        className="complaint-item-card fulfilled"
                                                        onClick={() => setSelectedComplaint(complaint)}
                                                    >
                                                        <div className="complaint-item-header">
                                                            <span className="complaint-item-id">#{complaint.complaintId}</span>
                                                            <span className={`status-tag ${getStatusColorClass(complaint.status)}`}>
                                                                {complaint.status}
                                                            </span>
                                                        </div>
                                                        <h4 className="complaint-item-title">{complaint.title}</h4>
                                                        <p className="complaint-item-date">
                                                            {new Date(complaint.submittedDate || complaint.createdAt?.toDate()).toLocaleDateString()}
                                                        </p>
                                                        <div className="complaint-item-actions">
                                                            <button
                                                                className="action-btn delete"
                                                                onClick={(e) => handleDeleteComplaint(e, complaint.id)}
                                                            >
                                                                <FiTrash2 /> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            {userComplaints.filter(c => ['Resolved', 'Rejected'].includes(c.status)).length === 0 && (
                                                <div className="no-data-msg">
                                                    <FiCheckCircle size={40} />
                                                    <p>No fulfilled complaints</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Complaint Detail Modal */}
                <AnimatePresence>
                    {selectedComplaint && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="complaint-detail-overlay"
                            onClick={() => setSelectedComplaint(null)}
                        >
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                className="complaint-detail-card"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button className="close-btn" onClick={() => setSelectedComplaint(null)}>
                                    <FiX />
                                </button>

                                <div className="detail-header">
                                    <span className={`status-badge-lg ${getStatusColorClass(selectedComplaint.status)}`}>
                                        {selectedComplaint.status}
                                    </span>
                                    <p className="detail-id">Complaint ID: {selectedComplaint.complaintId}</p>
                                </div>

                                <h2 className="detail-title">{selectedComplaint.title}</h2>
                                <div className="detail-meta">
                                    <span className="meta-tag"><FiFileText /> {selectedComplaint.category}</span>
                                    <span className="meta-tag"><FiCalendar /> {new Date(selectedComplaint.submittedDate || selectedComplaint.createdAt?.toDate()).toLocaleDateString()}</span>
                                </div>

                                <div className="detail-section">
                                    <label>Description</label>
                                    <p className="description-text">{selectedComplaint.description}</p>
                                </div>

                                {selectedComplaint.address && (
                                    <div className="detail-section">
                                        <label>Location</label>
                                        <p className="location-text"><FiHome /> {selectedComplaint.address}, {selectedComplaint.pincode}</p>
                                    </div>
                                )}

                                {selectedComplaint.mediaUrls && selectedComplaint.mediaUrls.length > 0 && (
                                    <div className="detail-section">
                                        <label>Attachments ({selectedComplaint.mediaUrls.length})</label>
                                        <div className="media-grid">
                                            {selectedComplaint.mediaUrls.map((url, idx) => (
                                                <div key={idx} className="media-item" onClick={() => window.open(url, '_blank')}>
                                                    {url.includes('/video/upload') ? (
                                                        <div className="video-thumb">▶ Video Proof</div>
                                                    ) : (
                                                        <img src={url} alt={`Attachment ${idx + 1}`} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="detail-footer-actions">
                                    {['Submitted', 'Under Review', 'In Progress'].includes(selectedComplaint.status) && (
                                        <button
                                            className="footer-action-btn fulfill"
                                            onClick={(e) => {
                                                handleMarkFulfilled(e, selectedComplaint.id);
                                                setSelectedComplaint(prev => ({ ...prev, status: 'Resolved' }));
                                            }}
                                        >
                                            <FiCheckCircle /> Mark as Fulfilled
                                        </button>
                                    )}
                                    <button
                                        className="footer-action-btn delete"
                                        onClick={(e) => handleDeleteComplaint(e, selectedComplaint.id)}
                                    >
                                        <FiTrash2 /> Delete Complaint
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyComplaints;
