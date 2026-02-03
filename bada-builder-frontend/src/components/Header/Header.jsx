import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import SearchBar from '../SearchBar/SearchBar';
import './Header.css';
// Firebase removed - using JWT auth via AuthContext
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PreloaderLink from '../Preloader/PreloaderLink';
import {
  FiGrid,
  FiSettings,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiDollarSign,
  FiPhone,
  FiUsers,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

// Long Live dropdown items for long-term rentals
const longLiveItems = [
  { label: 'Browse Rental Properties', href: '/long-live/browse' },
  { label: 'Post Rental Property', href: '/long-live/post' }
];

const ProfileAvatar = ({ photo, initials, sizeClass = "w-10 h-10", fontSizeClass = "text-sm", className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (photo) {
      const img = new Image();
      img.src = photo;
      img.onerror = () => setHasError(true);
    }
  }, [photo]);

  if (photo && !hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden relative flex-shrink-0 ${className}`}
        style={{
          backgroundImage: `url("${photo}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        role="img"
        aria-label="Profile"
      />
    );
  }

  // Fallback to initials with custom styling that mimics .profile-avatar but supports dynamic sizing
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold tracking-wide border-2 border-gray-200 shadow-sm flex-shrink-0 ${className} ${fontSizeClass}`}
      style={{
        background: 'linear-gradient(135deg, #58335e 0%, #6d4575 100%)',
      }}
    >
      {initials}
    </div>
  );
};

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  // ... existing state ...
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileLongLiveOpen, setMobileLongLiveOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const timeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loading: authLoading, logout } = useAuth();

  // Use AuthContext instead of direct Firebase listener
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
    setLoading(authLoading);
  }, [currentUser, authLoading]);

  // Close mobile menu and dropdowns on route change immediately to prevent flash
  useLayoutEffect(() => {
    setIsMobileMenuOpen(false);
    setMobileLongLiveOpen(false);
    setShowDropdown(false);
    setShowProfileDropdown(false);
  }, [location.pathname]);

  // ... existing effects ...

  useEffect(() => {
    const handleOpenMenu = () => {
      setIsMobileMenuOpen(true);
    };
    window.addEventListener('open-mobile-menu', handleOpenMenu);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      window.removeEventListener('open-mobile-menu', handleOpenMenu);
    };
  }, []);

  // Manage body class for modal
  useEffect(() => {
    if (showLogoutModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showLogoutModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showLogoutModal) {
        cancelLogout();
      }
    };

    if (showLogoutModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showLogoutModal]);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);

    try {
      logout(); // Use logout from AuthContext
      navigate('/');
      setIsMobileMenuOpen(false);
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handle login click - reset form if already on login page
  const handleLoginClick = (e) => {
    if (location.pathname === '/login') {
      e.preventDefault();
      // Trigger form reset by navigating with state
      navigate('/login', { state: { resetForm: true } });
    }
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <header className="custom-header flex items-center px-3 md:px-6 py-2.5 bg-white shadow-sm sticky top-0 z-50">
        <div className="header-content-wrapper flex flex-1 justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#58335e]"></div>
        </div>
      </header>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileLongLiveOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  // Profile dropdown handlers
  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setShowProfileDropdown(false);
    }, 150);
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    return userProfile?.name || currentUser?.displayName || 'User';
  };

  // Get user email
  const getUserEmail = () => {
    return userProfile?.email || currentUser?.email || '';
  };

  // Get user phone
  const getUserPhone = () => {
    return userProfile?.phone || 'Not provided';
  };

  return (
    <>
      <header className="custom-header sticky top-0 z-50 backdrop-blur-sm bg-white bg-opacity-95 shadow-sm px-6 md:px-12 py-2.5">
        <div className="header-content-wrapper flex justify-between items-center">
          {/* Logo */}
          <div className="logo-container flex-shrink-0">
            <Link to="/" className="logo-link inline-block transition-transform duration-200 hover:scale-105">
              <img src={logo} alt="Logo" className="logo-image h-9 md:h-11 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="items-center space-x-4 hidden lg:flex font-semibold text-gray-900">
            {/* ... navigation links ... */}
            <PreloaderLink
              to="/exhibition"
              icon={<FiGrid />}
              text="Exhibition"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              Exhibition
            </PreloaderLink>

            <PreloaderLink
              to="/services"
              icon={<FiSettings />}
              text="Services"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              Services
            </PreloaderLink>

            <PreloaderLink
              to="/short-stay"
              icon={<FiClock />}
              text="Short Stay"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              Short Stay
            </PreloaderLink>

            {/* Long Live Dropdown */}
            <div
              className="relative inline-block text-left"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`nav-link cursor-pointer py-2 px-3 text-gray-900 transition-all duration-200 flex items-center gap-1 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 whitespace-nowrap ${showDropdown ? 'text-[#58335e] after:w-full' : 'hover:text-[#58335e] hover:after:w-full'}`}>
                Long Live
                <span className={`inline-block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </div>

              {showDropdown && (
                <div className="dropdown-menu absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-2 animate-fadeIn">
                  {longLiveItems.map((item, index) => (
                    <PreloaderLink
                      key={index}
                      to={item.href}
                      icon={<FiActivity />}
                      text={item.label}
                      className="block px-5 py-3 text-sm text-gray-800 hover:bg-purple-50 hover:text-[#58335e] transition-all duration-150 border-l-4 border-transparent hover:border-[#58335e] font-semibold"
                    >
                      {item.label}
                    </PreloaderLink>
                  ))}
                </div>
              )}
            </div>

            <PreloaderLink
              to="/investments"
              icon={<FiTrendingUp />}
              text="Investment"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              Investment
            </PreloaderLink>

            <PreloaderLink
              to="/100-months"
              icon={<FiDollarSign />}
              text="100 Months"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              💰 100 Months
            </PreloaderLink>

            <PreloaderLink
              to="/contact"
              icon={<FiPhone />}
              text="Contact Us"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full whitespace-nowrap"
            >
              Contact Us
            </PreloaderLink>

            <PreloaderLink
              to="/about"
              icon={<FiUsers />}
              text="Who are we"
              className="nav-link relative py-2 px-3 text-gray-900 hover:text-[#58335e] transition-all duration-200 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#58335e] after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
            >
              Who are we
            </PreloaderLink>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => navigate('/post-property')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 font-medium text-sm tracking-wide transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Post Property
            </button>
            {isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <button className="clean-avatar-btn" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
                  <ProfileAvatar
                    photo={userProfile?.profilePhoto}
                    initials={getUserInitials()}
                    sizeClass="w-10 h-10"
                  />
                </button>

                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <ProfileAvatar
                        photo={userProfile?.profilePhoto}
                        initials={getUserInitials()}
                        sizeClass="w-12 h-12"
                        fontSizeClass="text-base"
                      />
                      <div className="profile-dropdown-info">
                        <div className="profile-dropdown-name">
                          {getUserDisplayName()}
                        </div>
                        <div className="profile-dropdown-email">
                          {getUserEmail()}
                        </div>
                      </div>
                    </div>

                    <div className="profile-dropdown-divider"></div>

                    <div className="profile-dropdown-details">
                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Name:</span>
                        <span className="profile-detail-value">{getUserDisplayName()}</span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Email:</span>
                        <span className="profile-detail-value">{getUserEmail()}</span>
                      </div>
                      <div className="profile-detail-item">
                        <span className="profile-detail-label">Phone:</span>
                        <span className="profile-detail-value">{getUserPhone()}</span>
                      </div>
                    </div>

                    <div className="profile-dropdown-divider"></div>

                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileDropdown(false);
                      }}
                      className="profile-dropdown-link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-logout"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" onClick={handleLoginClick}>
                <button className="header-login-btn">
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Strictly hidden on desktop */}
          <div className="mobile-menu-toggle-wrapper items-center ml-2 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#58335e] transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-4 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div
            className="mobile-menu-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="mobile-menu-top-header">
              <div className="mobile-menu-title-container">
                <span className="mobile-menu-indicator"></span>
                <h2 className="mobile-menu-title">Menu</h2>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="mobile-close-btn-premium"
                aria-label="Close menu"
              >
                <div className="mobile-close-cross"></div>
              </button>
            </div>

            {/* Mobile Menu Content Scrollable Area */}
            <div className="mobile-menu-content">
              <nav className="mobile-nav">
                {/* Mobile Login/Profile */}
                {isLoggedIn ? (
                  <div className="mobile-profile-section">
                    <div className="mobile-profile-header">
                      <ProfileAvatar
                        photo={userProfile?.profilePhoto}
                        initials={getUserInitials()}
                        sizeClass="w-[50px] h-[50px]"
                        fontSizeClass="text-lg"
                      />
                      <div className="mobile-profile-info">
                        <div className="mobile-profile-name">
                          {getUserDisplayName()}
                        </div>
                        <div className="mobile-profile-email">
                          {getUserEmail()}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-profile-details">
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Name:</span>
                        <span className="mobile-detail-value">{getUserDisplayName()}</span>
                      </div>
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Email:</span>
                        <span className="mobile-detail-value">{getUserEmail()}</span>
                      </div>
                      <div className="mobile-profile-detail">
                        <span className="mobile-detail-label">Phone:</span>
                        <span className="mobile-detail-value">{getUserPhone()}</span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={toggleMobileMenu}
                      className="mobile-view-profile-btn"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mobile-logout-btn"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={handleLoginClick} className="mobile-login-btn-premium">
                    🔐 Login / Sign Up
                  </Link>
                )}

                {/* Post Property Button Section */}
                <div className="mobile-action-section">
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      navigate('/post-property');
                    }}
                    className="mobile-post-listing-btn"
                  >
                    <span className="mobile-btn-icon-bg">📝</span>
                    <div className="mobile-btn-text">
                      <span className="main-text">Post Property</span>
                      <span className="sub-text">List your project fast</span>
                    </div>
                    <svg className="w-5 h-5 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="mobile-menu-divider">
                  <span>Explore BADA BUILDER</span>
                </div>

                {/* Regular Menu Items with Icons */}
                <PreloaderLink
                  to="/exhibition"
                  icon={<FiGrid />}
                  text="Exhibition"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item"
                >
                  <span className="mobile-icon-box"><FiGrid /></span>
                  <span>Exhibition</span>
                </PreloaderLink>

                <PreloaderLink
                  to="/services"
                  icon={<FiSettings />}
                  text="Services"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item"
                >
                  <span className="mobile-icon-box"><FiSettings /></span>
                  <span>Services</span>
                </PreloaderLink>

                <PreloaderLink
                  to="/short-stay"
                  icon={<FiClock />}
                  text="Short Stay"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item"
                >
                  <span className="mobile-icon-box"><FiClock /></span>
                  <span>Short Stay</span>
                </PreloaderLink>

                {/* Mobile Long Live Dropdown */}
                <div className="mobile-nav-dropdown">
                  <button onClick={() => setMobileLongLiveOpen(!mobileLongLiveOpen)} className="mobile-nav-dropdown-btn">
                    <div className="flex items-center gap-3.5">
                      <span className="mobile-icon-box"><FiActivity /></span>
                      <span>Long Live</span>
                    </div>
                    <span className={`transition-transform duration-200 ${mobileLongLiveOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {mobileLongLiveOpen && (
                    <div className="mobile-nav-dropdown-content">
                      {longLiveItems.map((item, index) => (
                        <PreloaderLink
                          key={index}
                          to={item.href}
                          icon={<FiActivity />}
                          text={item.label}
                          onClick={toggleMobileMenu}
                          className="mobile-nav-dropdown-link"
                        >
                          <span className="dot"></span>
                          {item.label}
                        </PreloaderLink>
                      ))}
                    </div>
                  )}
                </div>

                <PreloaderLink
                  to="/investments"
                  icon={<FiTrendingUp />}
                  text="Investment"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item"
                >
                  <span className="mobile-icon-box"><FiTrendingUp /></span>
                  <span>Investment</span>
                </PreloaderLink>

                <PreloaderLink
                  to="/100-months"
                  icon={<FiDollarSign />}
                  text="100 Months"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item"
                >
                  <span className="mobile-icon-box"><FiDollarSign /></span>
                  <span>100 Months</span>
                </PreloaderLink>

                <div className="mobile-menu-divider-thin"></div>

                <PreloaderLink
                  to="/contact"
                  icon={<FiPhone />}
                  text="Contact Us"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item secondary"
                >
                  <span className="mobile-icon-box"><FiPhone /></span>
                  <span>Contact Us</span>
                </PreloaderLink>

                <PreloaderLink
                  to="/about"
                  icon={<FiUsers />}
                  text="Who are we"
                  onClick={toggleMobileMenu}
                  className="mobile-nav-item secondary"
                >
                  <span className="mobile-icon-box"><FiUsers /></span>
                  <span>Who are we</span>
                </PreloaderLink>
              </nav>

              {/* Mobile Footer Area */}
              <div className="mobile-menu-footer">
                <p>© 2026 BADA BUILDER. Premium Real Estate</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Logout</h3>
              <button
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-lg text-gray-700 mb-2">
                Are you sure you want to logout?
              </p>
              <p className="text-sm text-gray-500">
                You will need to login again to access your account.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelLogout}
                className="modal-cancel-btn"
                disabled={logoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={logoutLoading}
                className="modal-logout-confirm-btn"
              >
                {logoutLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Yes, Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
