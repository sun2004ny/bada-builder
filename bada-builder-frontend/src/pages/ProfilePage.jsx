
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, usersAPI } from '../services/api';
import { shortStayAPI } from '../services/shortStayApi';
import {
  FiUser, FiMail, FiPhone, FiHash, FiBriefcase, FiEdit3,
  FiTrash2, FiMessageSquare, FiHome, FiUsers, FiCalendar,
  FiTrendingUp, FiAlertCircle, FiX, FiHeart
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import ChatList from '../components/ChatList/ChatList';
import ChatBox from '../components/ChatBox/ChatBox';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const fileInputRef = useRef(null);

  const [activityCounts, setActivityCounts] = useState({
    propertiesUploaded: 0,
    joinedLiveGroups: 0,
    bookedSiteVisits: 0,
    shortStayBookings: 0,
    investments: 0,
    myComplaints: 0,
    favorites: 0
  });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [showChatList, setShowChatList] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (userProfile?.profile_photo) {
      setProfilePhoto(userProfile.profile_photo);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        setLoadingActivity(true);
        const [response, shortStayResponse] = await Promise.all([
          usersAPI.getStats(),
          shortStayAPI.getUserFavorites().catch(() => ({ favorites: [] }))
        ]);

        const shortStayCount = shortStayResponse?.favorites?.length || 0;

        if (response) {
          setActivityCounts({
            propertiesUploaded: response.properties || 0,
            joinedLiveGroups: response.liveGroupings || 0,
            bookedSiteVisits: response.bookings || 0,
            shortStayBookings: response.shortStayBookings || 0,
            investments: response.investments || 0,
            myComplaints: response.complaints || 0,
            favorites: (response.favorites || 0) + shortStayCount
          });
        }
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        // Keep defaults on error
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  useEffect(() => {
    document.body.style.overflow = (showChatList || selectedChat) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showChatList, selectedChat]);

  const userData = {
    name: userProfile?.name || 'User',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    userId: currentUser?.id?.toString().substring(0, 8).toUpperCase() || '',
    userType: userProfile?.user_type || '',
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
      path: '/profile/joined-live-groups',
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
    },
    {
      id: 8,
      title: 'Bookmarked Properties',
      icon: <FiHeart className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.favorites,
      path: '/profile/favorites',
      color: 'red'
    }
  ];

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      setUploading(true);

      // Use the backend API which handles Cloudinary upload securely
      const response = await usersAPI.uploadProfilePhoto(file);
      const photoURL = response.profilePhoto;

      setProfilePhoto(photoURL);
      await refreshProfile();
      setProfilePhoto(photoURL);
      await refreshProfile();
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

      // Remove profile photo via API
      await authAPI.updateProfile({ profile_photo: null });

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
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-name-desktop">
                <h2>{userData.name}</h2>
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
                <ChatBox chatId={selectedChat.chatId} chatData={selectedChat} onClose={() => setSelectedChat(null)} isOwner={selectedChat.ownerId === currentUser?.id} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
