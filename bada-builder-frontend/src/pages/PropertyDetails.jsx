import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyDetails.css';
import { FiPhone, FiCheckCircle, FiInfo, FiMap, FiHome, FiMaximize2, FiBriefcase, FiUser, FiX, FiMessageSquare, FiPlay, FiPause } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight, FaBed, FaBath, FaCouch } from 'react-icons/fa';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ChatBox from '../components/ChatBox/ChatBox';
import { generateChatId } from '../services/chatService';

import ReviewSection from '../components/PropertyReviews/ReviewSection';
import BookmarkButton from '../components/BookmarkButton/BookmarkButton';
import PropertyMap from '../components/Map/PropertyMap';

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Prepare dynamic data - declared early to avoid hoisting issues in hooks
  const isDeveloper = property?.user_type === 'developer';
  const propertyTitle = property?.project_name || property?.projectName || property?.title || property?.project_name || 'Untitled Property';
  const coverImage = property?.image_url;
  const extraImages = property?.images || property?.project_images || [];
  const propertyImages = (coverImage && !extraImages.includes(coverImage)) ? [coverImage, ...extraImages] : (extraImages.length > 0 ? extraImages : (coverImage ? [coverImage] : []));

  // Get owner ID - check multiple possible field names
  const ownerId = property?.userId || property?.user_id || property?.ownerId;

  // Debug logging - MUST be at the top level
  useEffect(() => {
    if (property) {
      console.log('🔍 Chat Button Debug:');
      console.log('Current User:', currentUser?.uid);
      console.log('Owner ID (userId):', property.userId);
      console.log('Owner ID (user_id):', property.user_id);
      console.log('Owner ID (ownerId):', property.ownerId);
      console.log('Final ownerId:', ownerId);
      console.log('Should show button:', currentUser && ownerId && String(currentUser.uid) !== String(ownerId));
    }
  }, [currentUser, property, ownerId]);

  useEffect(() => {
    const getPropertyData = async () => {
      if (location.state?.property) {
        setProperty(location.state.property);
        setLoading(false);
      } else if (id) {
        try {
          const propertyData = await propertiesAPI.getById(id);
          if (propertyData.property) {
            const p = propertyData.property;
            // Parse project_stats if it's a string
            if (p.project_stats && typeof p.project_stats === 'string') {
              try { p.project_stats = JSON.parse(p.project_stats); } catch (e) { console.error("Error parsing project_stats:", e); }
            }
            setProperty({ id: p.id, ...p });
          } else if (propertyData.id) {
            const p = propertyData.id; // Wait, propertyData.id is usually the property itself in some API structures
            if (p.project_stats && typeof p.project_stats === 'string') {
              try { p.project_stats = JSON.parse(p.project_stats); } catch (e) { console.error("Error parsing project_stats:", e); }
            }
            setProperty(propertyData);
          }
        } catch (error) {
          console.error("Error fetching property:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    getPropertyData();
  }, [id, location.state]);

  const nextImage = React.useCallback(() => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  }, [propertyImages.length]);

  const prevImage = React.useCallback(() => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  }, [propertyImages.length]);

  // Full Screen Image Viewer Logic
  const [isFullScreen, setIsFullScreen] = useState(false);

  const openFullScreen = () => {
    setIsFullScreen(true);
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  };

  // Slideshow Logic
  useEffect(() => {
    let interval;
    if (isPlaying && propertyImages.length > 1) {
      interval = setInterval(() => {
        nextImage();
      }, 4000); // 4 seconds per image
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, nextImage, propertyImages.length]);

  // Handle body scroll when chat modal is open
  useEffect(() => {
    if (showChat || isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showChat, isFullScreen]);

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullScreen) return;

      if (e.key === 'Escape') {
        closeFullScreen();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Safety cleanup
    };
  }, [isFullScreen, nextImage, prevImage]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-screen">
        <div className="loading-spinner"></div>
        <p className="text-gray-600 font-medium mt-4">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary-redesign"
        >
          Go Back
        </button>
      </div>
    );
  }



  const propertyTags = isDeveloper
    ? [property.scheme_type || property.type, property.possession_status].filter(Boolean)
    : property.tags || [property.status, property.type].filter(Boolean);

  if (property.rera_status === 'Yes' && !propertyTags.includes('RERA Registered')) {
    propertyTags.push('RERA Registered');
  }

  const propertyFacilities = property.amenities || property.facilities || [];

  // Default amenities if none provided
  const defaultAmenities = ['Lift', 'Parking', 'Garden', 'Security', 'Gym', 'Power Backup'];
  const displayAmenities = propertyFacilities.length > 0 ? propertyFacilities : defaultAmenities;
  const displayPrice = (property.price && !property.price.toString().includes('undefined'))
    ? property.price
    : (property.base_price && property.max_price ? `${property.base_price} - ${property.max_price}` : (property.base_price ? property.base_price : (property.price && !property.price.toString().includes('undefined') ? property.price : 'Contact for Price')));

  return (
    <div className="property-details-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-6 pb-24 lg:pb-12">

        {/* Image Gallery Section */}
        <div className="mb-8 lg:mb-4">
          <div className="slider-container relative w-full h-[400px] md:h-[500px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl mx-auto">
            {propertyImages.length > 0 ? (
              <>
                <AnimatePresence mode='wait'>
                  <Motion.img
                    key={currentImageIndex}
                    src={propertyImages[currentImageIndex]}
                    alt={`Property Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={openFullScreen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -100) {
                        nextImage();
                      } else if (swipe > 100) {
                        prevImage();
                      }
                    }}
                  />
                </AnimatePresence>

                {/* Navigation Controls */}
                {propertyImages.length > 1 && (
                  <div className="slider-controls absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="pointer-events-auto bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft size={20} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="pointer-events-auto bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <FaChevronRight size={20} className="text-gray-800" />
                    </button>
                  </div>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}
                    className="hover:text-blue-400 transition-colors p-1"
                    aria-label={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                  >
                    {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                  </button>
                  <span className="w-px h-4 bg-white/30"></span>
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>

                {/* Thumbnail Strip */}
                {propertyImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto scrollbar-hide">
                    {propertyImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx
                          ? 'border-blue-500 scale-110 shadow-lg'
                          : 'border-white/50 opacity-70 hover:opacity-100 hover:border-white'
                          }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-400 font-medium">No images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                {propertyTitle}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FiMap className="text-blue-600 flex-shrink-0" size={20} />
                <p className="text-lg font-medium">{property?.project_location || property?.projectLocation || property?.location || 'Location Not Specified'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {propertyTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              <button
                onClick={() => navigate('/book-visit', { state: { property } })}
                className="btn-primary-redesign w-full text-center whitespace-nowrap"
              >
                Book Site Visit
              </button>
              <div className="flex items-center gap-3">
                <BookmarkButton propertyId={property.id} source="details" />
                <span className="text-sm font-semibold text-gray-500 hidden sm:inline">Save to Favorites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Key Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Price</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{displayPrice}</p>
            {property.type && (
              <p className="text-gray-600 font-medium">{property.type}</p>
            )}
          </div>

          {/* Individual Property Specs */}
          {!isDeveloper && (
            <>
              {property.bhk && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaBed className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.bhk}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaBath className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bathrooms</p>
                </div>
              )}
              {(property.area || property.project_stats?.area) && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiMaximize2 className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.area || property.project_stats?.area}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Built-up Area</p>
                </div>
              )}
              {property.furnishing && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FaCouch className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.furnishing}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Furnishing</p>
                </div>
              )}
            </>
          )}

          {/* Developer Project Stats */}
          {isDeveloper && property.project_stats && (
            <>
              {property.project_stats.towers && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiHome className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.project_stats.towers}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Towers</p>
                </div>
              )}
              {property.project_stats.units && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiBriefcase className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.project_stats.units}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Units</p>
                </div>
              )}
              {property.project_stats.floors && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col items-center justify-center text-center">
                  <FiMaximize2 className="text-blue-600 mb-2" size={32} />
                  <p className="text-2xl font-bold text-gray-900">{property.project_stats.floors}</p>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Floors</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Property Specifications */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiInfo className="text-blue-600" />
              Property Details
            </h2>
            <div className="space-y-4">
              {!isDeveloper && (
                <>
                  {property.type && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Property Type</span>
                      <span className="text-gray-900 font-semibold">{property.type}</span>
                    </div>
                  )}
                  {property.bhk && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Configuration</span>
                      <span className="text-gray-900 font-semibold">{property.bhk}</span>
                    </div>
                  )}
                  {(property.area || property.project_stats?.area) && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Built-up Area</span>
                      <span className="text-gray-900 font-semibold">{property.area || property.project_stats?.area}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Bathrooms</span>
                      <span className="text-gray-900 font-semibold">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Furnishing Status</span>
                      <span className="text-gray-900 font-semibold">{property.furnishing}</span>
                    </div>
                  )}
                  {property.status && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Availability</span>
                      <span className="text-gray-900 font-semibold">{property.status}</span>
                    </div>
                  )}
                </>
              )}

              {isDeveloper && (
                <>
                  {property.type && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Property Type</span>
                      <span className="text-gray-900 font-semibold">{property.type}</span>
                    </div>
                  )}
                  {property.scheme_type && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Scheme Type</span>
                      <span className="text-gray-900 font-semibold">{property.scheme_type}</span>
                    </div>
                  )}
                  {property.possession_status && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Possession Status</span>
                      <span className="text-gray-900 font-semibold">{property.possession_status}</span>
                    </div>
                  )}
                  {property.completion_date && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Expected Completion</span>
                      <span className="text-orange-600 font-semibold">{property.completion_date}</span>
                    </div>
                  )}
                  {property.total_units && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total Units</span>
                      <span className="text-gray-900 font-semibold">{property.total_units}</span>
                    </div>
                  )}
                  {property.project_stats?.floors && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total Floors</span>
                      <span className="text-gray-900 font-semibold">{property.project_stats.floors}</span>
                    </div>
                  )}
                  {property.project_stats?.area && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Project Area</span>
                      <span className="text-gray-900 font-semibold">{property.project_stats.area}</span>
                    </div>
                  )}
                  {property.rera_status && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">RERA Status</span>
                      <span className={`font-semibold ${property.rera_status === 'Yes' ? 'text-green-600' : 'text-gray-900'}`}>
                        {property.rera_status === 'Yes' ? 'Registered' : 'N/A'}
                      </span>
                    </div>
                  )}
                  {property.rera_number && (
                    <div className="flex flex-col gap-2 py-3">
                      <span className="text-gray-600 font-medium">RERA Number</span>
                      <div className="rera-box">{property.rera_number}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Owner/Developer Contact */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 md:p-8 shadow-md border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              {isDeveloper ? 'Developer Contact' : 'Owner Contact'}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {isDeveloper ? 'Developer Name' : 'Owner Name'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {property.developer || property.company_name || property.owner_name || property.owner || 'Property Owner'}
                </p>
              </div>

              {/* Chat with Owner Button - Shown to buyers only */}
              {currentUser && ownerId && String(currentUser.uid) !== String(ownerId) && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      const chatId = generateChatId(property.id, currentUser.uid, ownerId);
                      setChatData({
                        chatId,
                        propertyId: property.id,
                        propertyTitle,
                        propertyImage: propertyImages[0] || null,
                        buyerId: currentUser.uid,
                        buyerName: userProfile?.name || currentUser.email,
                        buyerEmail: currentUser.email,
                        ownerId: ownerId,
                        ownerName: property.developer || property.company_name || property.owner_name || property.owner || 'Property Owner',
                        ownerEmail: property.email || ''
                      });
                      setShowChat(true);
                    }}
                    className="chat-with-owner-btn w-full justify-center"
                  >
                    <FiMessageSquare size={20} />
                    Chat with Owner
                  </button>
                </div>
              )}

              {/* Phone Number Display Rules */}
              {property.contact_phone && (
                isDeveloper ? (
                  /* Developer Property: Always show phone number if available */
                  <div className="pt-4">
                    <a
                      href={`tel:+91${property.contact_phone}`}
                      className="developer-contact-btn w-full justify-center"
                    >
                      <FiPhone size={20} />
                      +91 {property.contact_phone}
                    </a>
                  </div>
                ) : (
                  /* Individual Property: Only show to the owner for reference, hidden from everyone else */
                  currentUser?.uid === ownerId && (
                    <div className="pt-4">
                      <div className="developer-contact-btn w-full justify-center opacity-50 cursor-default">
                        <FiPhone size={20} />
                        +91 {property.contact_phone} (Only you can see this)
                      </div>
                    </div>
                  )
                )
              )}

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" size={20} />
                  <span className="text-sm font-semibold text-gray-700">
                    Verified {isDeveloper ? 'Builder' : 'Seller'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities/Facilities - Always Show */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Amenities & Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {displayAmenities.map((facility, idx) => (
              <div
                key={idx}
                className="feature-tag bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-center font-semibold"
              >
                {facility}
              </div>
            ))}
          </div>
        </div>

        {/* Developer Options */}
        {isDeveloper && (property.residential_options?.length > 0 || property.commercial_options?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Configurations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {property.residential_options?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Residential</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.residential_options.map((opt, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.commercial_options?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Commercial</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.commercial_options.map((opt, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Property</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description ||
                `This ${property.type || 'property'} is located in ${property.location || 'a prime location'} and offers excellent value. Contact us today to schedule a visit and explore this opportunity.`}
            </p>
          </div>
        </div>

        {/* Map Section */}
        {property.latitude && property.longitude && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiMap className="text-blue-600" />
              Location on Map
            </h2>
            <div style={{ height: '400px', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
              <PropertyMap
                latitude={parseFloat(property.latitude)}
                longitude={parseFloat(property.longitude)}
                address={property.map_address || property.address || property.location}
              />
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection
          propertyId={property.id}
          currentUser={currentUser}
          userProfile={userProfile}
        />
      </div>

      {/* Full Screen Image Viewer Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fullscreen-overlay"
            onClick={closeFullScreen}
          >
            {/* Close Button */}
            <button
              className="fullscreen-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeFullScreen();
              }}
              aria-label="Close Full Screen"
            >
              <FiX size={32} />
            </button>

            {/* Navigation Buttons (Desktop) */}
            {propertyImages.length > 1 && (
              <>
                <button
                  className="fullscreen-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous Image"
                >
                  <FaChevronLeft size={32} />
                </button>
                <button
                  className="fullscreen-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next Image"
                >
                  <FaChevronRight size={32} />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <div
              className="fullscreen-image-container"
              onClick={(e) => e.stopPropagation()} // Prevent close on image click
            >
              <Motion.img
                key={currentImageIndex}
                src={propertyImages[currentImageIndex]}
                alt={`Full Screen Image ${currentImageIndex + 1}`}
                className="fullscreen-image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -100) {
                    nextImage();
                  } else if (swipe > 100) {
                    prevImage();
                  }
                }}
              />
              {/* Image Counter */}
              <div className="fullscreen-counter">
                {currentImageIndex + 1} / {propertyImages.length}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && chatData && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="chat-modal-overlay"
            onClick={() => setShowChat(false)}
          >
            <Motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="chat-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatBox
                chatId={chatData.chatId}
                chatData={chatData}
                onClose={() => setShowChat(false)}
                isOwner={false}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;
