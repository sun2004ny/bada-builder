
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

  // Bio editing state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

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
    bio: userProfile?.bio || '',
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
      path: '/hosting',
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
                <div className="detail-item full-width">
                  <div className="detail-icon-wrapper bio"><FiBriefcase className="detail-icon" /></div>
                  <div className="detail-content">
                    <div className="detail-header">
                      <p className="detail-label">Bio</p>
                      {!isEditingBio && (
                        <button className="edit-bio-btn" onClick={() => {
                          setBioInput(userData.bio || '');
                          setIsEditingBio(true);
                        }}>
                          <FiEdit3 size={14} /> Edit
                        </button>
                      )}
                    </div>
                    {isEditingBio ? (
                      <div className="bio-edit-container">
                        <textarea
                          className="bio-textarea"
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          placeholder="Tell others about yourself..."
                          rows={4}
                        />
                        <div className="bio-actions">
                          <button className="bio-btn cancel" onClick={() => setIsEditingBio(false)}>Cancel</button>
                          <button className="bio-btn save" onClick={() => {
                            authAPI.updateProfile({ bio: bioInput }).then(() => {
                              refreshProfile();
                              setIsEditingBio(false);
                            });
                          }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="detail-value bio-text">{userData.bio || 'Tell others about yourself...'}</p>
                    )}
                  </div>
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

        {/* ========================================= */}
        {/* DELETE ACCOUNT SECTION (DANGER ZONE)     */}
        {/* ========================================= */}
        <DeleteAccountSection />
      </div>
    </div>
  );
};

{/* Delete Account Component with Password/OTP Verification */ }
const DeleteAccountSection = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState('password'); // 'password', 'email', 'otp', 'confirm'
  const [password, setPassword] = useState('');
  const [emailInput, setEmailInput] = useState(''); // NEW: Email confirmation input
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpSuccess, setShowOtpSuccess] = useState(false); // NEW: Show OTP sent message
  const [deletionReason, setDeletionReason] = useState(''); // Optional reason

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

  const performLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/login';
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setVerificationStep('password');
    setPassword('');
    setEmailInput('');
    setOtp('');
    setError('');
    setOtpSent(false);
    setShowOtpSuccess(false);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVerificationStep('password');
    setPassword('');
    setEmailInput('');
    setOtp('');
    setVerificationToken('');
    setError('');
    setOtpSent(false);
    setShowOtpSuccess(false);
    setDeletionReason(''); // Reset reason
    document.body.style.overflow = 'auto';
  };

  const handleVerifyPassword = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/delete-account/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationToken(data.verificationToken);
        setVerificationStep('confirm');
        setPassword('');
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Verify email before sending OTP
  const handleVerifyEmail = async () => {
    if (!emailInput || !emailInput.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/delete-account/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailInput.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        // Email verified, now send OTP
        await handleSendOtpToEmail();
      } else {
        setError(data.error || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Send OTP after email verification
  const handleSendOtpToEmail = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/delete-account/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setShowOtpSuccess(true);
        setVerificationStep('otp');
        setError('');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP request error:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // We'll use OTP directly in deletion
      setVerificationStep('confirm');
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verificationToken: verificationToken || undefined,
          otp: otp || undefined,
          deletionReason: deletionReason || undefined // Send reason if provided
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show success and logout
        alert('Account deleted successfully. Redirecting...');
        setTimeout(performLogout, 1500);
      } else {
        setError(data.error || 'Failed to delete account');
        setVerificationStep('password');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      setError('Deletion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const qaItems = [
    {
      question: "What happens when you delete your account?",
      answer: "Your account will be permanently deactivated and you will lose access to all features, bookings, and listings."
    },
    {
      question: "Is this action reversible?",
      answer: "No. Once deleted, your account cannot be recovered. All your data will be permanently removed from our systems."
    },
    {
      question: "What data will be removed?",
      answer: "All personal information, profile data, property listings, bookings, favorites, wishlists, and communication history will be deleted."
    },
    {
      question: "What happens to your active bookings and listings?",
      answer: "Active bookings will be cancelled and property listings will be removed. Other users will be notified of cancellations."
    }
  ];

  return (
    <>
      {/* Danger Zone Container */}
      <motion.div
        className="max-w-6xl mx-auto mt-12 mb-16 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="relative bg-gradient-to-br from-red-50 via-white to-pink-50 rounded-3xl border-2 border-red-300 shadow-2xl overflow-hidden"
          whileHover={{ borderColor: 'rgb(239 68 68)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                ⚠️
              </motion.span>
              <div className="flex flex-col">
                <h2 className="text-4xl font-extrabold text-black tracking-tighter drop-shadow-md">Danger Zone</h2>
                <p className="text-black/80 text-lg font-bold mt-1 uppercase tracking-widest">Permanent and irreversible actions</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Q&A Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Before You Delete</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {qaItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="bg-white p-5 rounded-xl border border-red-100 hover:border-red-300 hover:shadow-lg transition-all duration-300"
                  >
                    <h4 className="text-base font-bold text-red-600 mb-2">{item.question}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delete Button */}
            <div className="flex justify-center pt-6 border-t-2 border-red-200">
              <motion.button
                onClick={handleOpenModal}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <FiTrash2 size={20} />
                  Delete My Account Forever
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6 flex items-center justify-between shrink-0 z-10">
                <h3 className="text-2xl font-black text-white tracking-tight">Verify Identity</h3>
                <button
                  onClick={handleCloseModal}
                  className="bg-white text-red-600 hover:bg-gray-100 p-2.5 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {/* Password Verification Step */}
                {verificationStep === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-6">
                      <p className="text-gray-700 mb-4">Enter your current password to verify your identity:</p>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                        placeholder="Current password"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleVerifyPassword}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        {loading ? 'Verifying...' : 'Verify Password'}
                      </button>

                      <button
                        onClick={() => {
                          setVerificationStep('email');
                          setError('');
                        }}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Forgot Password? Use OTP Instead
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Email Verification Step (NEW) */}
                {verificationStep === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Verify Your Email</h4>
                      <p className="text-gray-600 mb-4 text-sm">
                        Enter the email address associated with this account to receive the OTP
                      </p>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyEmail()}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleVerifyEmail}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        {loading ? 'Verifying...' : 'Send OTP to Email'}
                      </button>

                      <button
                        onClick={() => {
                          setVerificationStep('password');
                          setEmailInput('');
                          setError('');
                        }}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Back to Password
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* OTP Verification Step */}
                {verificationStep === 'otp' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-6">
                      {showOtpSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                          <span>✓</span>
                          <span>OTP sent to your email</span>
                        </div>
                      )}

                      <p className="text-gray-700 mb-4">
                        {otpSent ? 'Enter the 6-digit code sent to your email:' : 'We will send an OTP to your registered email.'}
                      </p>
                      {otpSent && (
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                        />
                      )}
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {otpSent ? (
                        <>
                          <button
                            onClick={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                          >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                          <button
                            onClick={handleSendOtpToEmail}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            Resend OTP
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleSendOtpToEmail}
                          disabled={loading}
                          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                        >
                          {loading ? 'Sending...' : 'Send OTP to Email'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setVerificationStep('email');
                          setOtp('');
                          setOtpSent(false);
                          setShowOtpSuccess(false);
                          setError('');
                        }}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Back to Email
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Final Confirmation Step */}
                {verificationStep === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-6">
                      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
                        <h4 className="text-red-800 font-bold text-lg mb-3 flex items-center gap-2">
                          <span className="text-2xl">⚠️</span>
                          Final Warning
                        </h4>
                        <ul className="space-y-2 text-sm text-red-700">
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Your account will be permanently deleted</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>All bookings and listings will be cancelled</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>This action cannot be undone</span>
                          </li>
                        </ul>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Why are you leaving? (Optional)
                        </label>
                        <select
                          value={deletionReason}
                          onChange={(e) => setDeletionReason(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors bg-white text-gray-700"
                        >
                          <option value="">Select a reason (optional)</option>
                          <option value="not_using">Not using the platform anymore</option>
                          <option value="privacy_concerns">Privacy concerns</option>
                          <option value="found_alternative">Found a better alternative</option>
                          <option value="too_expensive">Too expensive</option>
                          <option value="missing_features">Missing features I need</option>
                          <option value="technical_issues">Technical issues/bugs</option>
                          <option value="poor_support">Poor customer support</option>
                          <option value="other">Other reason</option>
                        </select>
                      </div>

                      <p className="text-center text-gray-700 font-semibold">
                        Are you absolutely sure?
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-700 to-red-600 text-white text-lg font-black rounded-xl hover:shadow-2xl hover:shadow-red-500/50 disabled:opacity-50 transition-all"
                      >
                        {loading ? 'Deleting Account...' : 'Yes, Delete Forever'}
                      </button>

                      <button
                        onClick={handleCloseModal}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
