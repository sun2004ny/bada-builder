import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiHash, FiBriefcase, FiHome, FiUsers, FiCalendar, FiUpload, FiTrash2, FiEdit3, FiTrendingUp, FiMessageSquare, FiX, FiAlertCircle } from 'react-icons/fi';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import ChatList from '../components/ChatList/ChatList';
import ChatBox from '../components/ChatBox/ChatBox';
import './ProfilePage.css';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityCounts, setActivityCounts] = useState({
    propertiesUploaded: 0,
    joinedLiveGroups: 0,
    bookedSiteVisits: 0,
    shortStayBookings: 0,
    investments: 0,
    myComplaints: 0
  });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [showChatList, setShowChatList] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      try {
        setLoading(true);
        if (userProfile) {
          setProfilePhoto(userProfile.profilePhoto || null);
        }
      } catch (error) {
        console.error('Error loading profile photo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfilePhoto();
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    setLoadingActivity(true);

    const propertiesQuery = query(collection(db, 'properties'), where('user_id', '==', currentUser.uid));
    const bookingsQuery = query(collection(db, 'bookings'), where('user_id', '==', currentUser.uid));
    const liveGroupQuery = query(collection(db, 'liveGroupInteractions'), where('userId', '==', currentUser.uid));
    const investmentsQuery = query(collection(db, 'investments'), where('user_id', '==', currentUser.uid));
    const shortStayQuery = query(collection(db, 'short_stay_bookings'), where('guestId', '==', currentUser.uid));
    const complaintsQuery = query(collection(db, 'complaints'), where('userId', '==', currentUser.uid));

    const unsubscribeProperties = onSnapshot(propertiesQuery, (snapshot) => {
      setActivityCounts(prev => ({ ...prev, propertiesUploaded: snapshot.size }));
      setLoadingActivity(false);
    });

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeBookings = snapshot.docs.filter(doc => {
        const data = doc.data();
        if (data.visit_date) {
          const visitDate = new Date(data.visit_date);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate >= today;
        }
        return true;
      });
      setActivityCounts(prev => ({ ...prev, bookedSiteVisits: activeBookings.length }));
    });

    const unsubscribeLiveGroups = onSnapshot(liveGroupQuery, (snapshot) => {
      setActivityCounts(prev => ({ ...prev, joinedLiveGroups: snapshot.size }));
    });

    const unsubscribeInvestments = onSnapshot(investmentsQuery, (snapshot) => {
      setActivityCounts(prev => ({ ...prev, investments: snapshot.size }));
    });

    const unsubscribeShortStay = onSnapshot(shortStayQuery, (snapshot) => {
      setActivityCounts(prev => ({ ...prev, shortStayBookings: snapshot.size }));
    });

    const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
      const ongoingCount = snapshot.docs.filter(doc =>
        ['Submitted', 'Under Review', 'In Progress'].includes(doc.data().status)
      ).length;
      setActivityCounts(prev => ({ ...prev, myComplaints: ongoingCount }));
    });

    return () => {
      unsubscribeProperties();
      unsubscribeBookings();
      unsubscribeLiveGroups();
      unsubscribeInvestments();
      unsubscribeShortStay();
      unsubscribeComplaints();
    };
  }, [currentUser]);

  useEffect(() => {
    document.body.style.overflow = (showChatList || selectedChat) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showChatList, selectedChat]);

  const userData = {
    name: userProfile?.name || 'User',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    userId: currentUser?.uid?.substring(0, 8).toUpperCase() || '',
    userType: userProfile?.userType || '',
    profilePhoto: profilePhoto
  };

  const activityItemsWithChat = [
    {
      id: 7,
      title: 'My Chats',
      icon: <FiMessageSquare className="activity-icon" />,
      count: '📬',
      action: () => {
        if (window.innerWidth > 768) navigate('/messages');
        else setShowChatList(true);
      },
      color: 'indigo'
    },
    {
      id: 1,
      title: 'Properties Uploaded',
      icon: <FiHome className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.propertiesUploaded,
      path: '/my-properties',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Joined Live Groups',
      icon: <FiUsers className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.joinedLiveGroups,
      path: '/exhibition/live-grouping',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Booked Site Visits',
      icon: <FiCalendar className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.bookedSiteVisits,
      path: '/my-bookings',
      color: 'green'
    },
    {
      id: 4,
      title: 'Short Stay Bookings',
      icon: <FiHome className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.shortStayBookings,
      path: '/short-stay/my-bookings',
      color: 'teal'
    },
    {
      id: 5,
      title: 'Investments',
      icon: <FiTrendingUp className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.investments,
      path: '/profile/investments',
      color: 'orange'
    },
    {
      id: 6,
      title: 'My Complaints',
      icon: <FiAlertCircle className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.myComplaints,
      action: () => navigate('/my-complaints'),
      color: 'rose'
    }
  ];

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      setUploading(true);
      const photoURL = await uploadToCloudinary(file);
      await updateDoc(doc(db, 'users', currentUser.uid), { profilePhoto: photoURL });
      setProfilePhoto(photoURL);
      await refreshProfile();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    try {
      setUploading(true);
      await updateDoc(doc(db, 'users', currentUser.uid), { profilePhoto: null });
      setProfilePhoto(null);
      await refreshProfile();
    } catch (error) {
      console.error('Error removing photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">View your account information and activity</p>
        </div>

        <div className="profile-card">
          <div className="profile-content">
            <div className="profile-photo-section">
              <div className="profile-photo-container">
                <div className="profile-photo-wrapper">
                  {userData.profilePhoto ? (
                    <img src={userData.profilePhoto} alt="Profile" className="profile-photo" />
                  ) : (
                    <div className="profile-photo-placeholder"><FiUser className="profile-photo-icon" /></div>
                  )}
                  {uploading && <div className="photo-overlay"><div className="spinner"></div></div>}
                </div>
                <div className="photo-action-buttons">
                  <button className="photo-action-btn change-photo" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <FiEdit3 className="action-icon" /><span>Change Photo</span>
                  </button>
                  {userData.profilePhoto && (
                    <button className="photo-action-btn remove-photo" onClick={handleRemovePhoto} disabled={uploading}>
                      <FiTrash2 className="action-icon" /><span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              <div className="profile-name-mobile">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>{userData.userType}</span>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-name-desktop">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>{userData.userType}</span>
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-icon-wrapper email"><FiMail className="detail-icon" /></div>
                  <div className="detail-content"><p className="detail-label">Email Address</p><p className="detail-value">{userData.email}</p></div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon-wrapper phone"><FiPhone className="detail-icon" /></div>
                  <div className="detail-content"><p className="detail-label">Phone Number</p><p className="detail-value">{userData.phone}</p></div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon-wrapper userid"><FiHash className="detail-icon" /></div>
                  <div className="detail-content"><p className="detail-label">User ID</p><p className="detail-value user-id">{userData.userId}</p></div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon-wrapper usertype"><FiBriefcase className="detail-icon" /></div>
                  <div className="detail-content"><p className="detail-label">Account Type</p><p className="detail-value">{userData.userType} Owner</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h2 className="activity-title">Activity Overview</h2>
            <p className="activity-subtitle">Track your engagement and contributions</p>
          </div>
          <div className="activity-grid">
            {activityItemsWithChat.map((item) => (
              <button key={item.id} onClick={() => item.action ? item.action() : navigate(item.path)} className={`activity-card ${item.color}`}>
                <div className="activity-icon-wrapper">{item.icon}</div>
                <h3 className="activity-card-title">{item.title}</h3>
                <p className="activity-count">{item.count}</p>
                <div className="activity-arrow">→</div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showChatList && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="chat-modal-overlay" onClick={() => setShowChatList(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                  <h2>My Chats</h2>
                  <button className="chat-modal-close" onClick={() => setShowChatList(false)}><FiX size={24} /></button>
                </div>
                <div className="modal-content-scrollable"><ChatList onChatSelect={(chat) => { setSelectedChat(chat); setShowChatList(false); }} /></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedChat && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="chat-modal-overlay" onClick={() => setSelectedChat(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                <ChatBox chatId={selectedChat.chatId} chatData={selectedChat} onClose={() => setSelectedChat(null)} isOwner={selectedChat.ownerId === currentUser.uid} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
