import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../firebase';
import { FaClipboardList, FaClock, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { compressImage } from '../../utils/imageCompressor';
import './RegisterComplaint.css';

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images"; // Reusing existing preset or change if needed

/**
 * Uploads an image/video file to Cloudinary using an unsigned preset.
 */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const resourceType = file.type.startsWith('image/') ? 'image' : 'video';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

const RegisterComplaint = () => {
  const [activeView, setActiveView] = useState('register'); // register, ongoing, fulfilled
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [ongoingComplaints, setOngoingComplaints] = useState([]);
  const [fulfilledComplaints, setFulfilledComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    address: '',
    pincode: '',
    latitude: '',
    longitude: '',
    fullName: '',
    phone: '',
    email: '',
    consent: false
  });

  const categories = [
    'Potholes / Roads',
    'Drainage / Sewer',
    'Garbage / Sanitation',
    'Water Supply',
    'Street Lights',
    'Illegal Construction',
    'Other'
  ];

  // Fetch user's complaints
  useEffect(() => {
    if (activeView !== 'register') {
      fetchComplaints();
    }
  }, [activeView]);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login to view your complaints');
        return;
      }

      // Fetch ongoing complaints (Submitted, Under Review, In Progress)
      const ongoingQuery = query(
        collection(db, 'complaints'),
        where('phone', '==', formData.phone || user.phoneNumber),
        where('status', 'in', ['Submitted', 'Under Review', 'In Progress']),
        orderBy('createdAt', 'desc')
      );
      const ongoingSnapshot = await getDocs(ongoingQuery);
      const ongoing = ongoingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOngoingComplaints(ongoing);

      // Fetch fulfilled complaints (Resolved, Rejected)
      const fulfilledQuery = query(
        collection(db, 'complaints'),
        where('phone', '==', formData.phone || user.phoneNumber),
        where('status', 'in', ['Resolved', 'Rejected']),
        orderBy('createdAt', 'desc')
      );
      const fulfilledSnapshot = await getDocs(fulfilledQuery);
      const fulfilled = fulfilledSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFulfilledComplaints(fulfilled);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (mediaFiles.length + files.length > 20) {
      alert('Maximum 20 files allowed');
      return;
    }
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMediaFiles = async () => {
    console.log(`☁️ Uploading ${mediaFiles.length} files...`);

    const uploadPromises = mediaFiles.map(async (file) => {
      // 1. Compress image if it's an image
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try {
          console.log(`📉 Compressing ${file.name}...`);
          fileToUpload = await compressImage(file, 1280, 0.7);
        } catch (err) {
          console.warn(`Compression failed for ${file.name}, using original`, err);
        }
      }

      // 2. Upload to Cloudinary
      return uploadToCloudinary(fileToUpload);
    });

    const mediaUrls = await Promise.all(uploadPromises);
    console.log('✅ All media uploaded successfully.');
    return mediaUrls;
  };

  const validateForm = () => {
    if (!formData.category || !formData.title || !formData.description) {
      alert('Please fill all issue details');
      return false;
    }
    if (mediaFiles.length < 5) {
      alert('Please upload at least 5 photos/videos as proof');
      return false;
    }
    if (!formData.address || !formData.pincode) {
      alert('Please provide complete location details');
      return false;
    }
    if (!formData.fullName || !formData.phone) {
      alert('Please provide your contact details');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert('Please enter a valid Indian mobile number');
      return false;
    }
    if (!formData.consent) {
      alert('Please confirm the information is true');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Upload media files
      const mediaUrls = await uploadMediaFiles();

      // Generate complaint ID
      const timestamp = Date.now();
      const generatedId = `CMP${timestamp}`;

      // Save to Firestore
      await addDoc(collection(db, 'complaints'), {
        complaintId: generatedId,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        pincode: formData.pincode,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        mediaUrls: mediaUrls,
        status: 'Submitted',
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
        submittedDate: new Date().toISOString()
      });

      setComplaintId(generatedId);
      setStep(5); // Success screen
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-section">
            <h2>📋 Issue Details</h2>
            <div className="form-group">
              <label>Complaint Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Complaint Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief title of the issue"
                required
              />
            </div>
            <div className="form-group">
              <label>Complaint Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail..."
                rows="5"
                required
              />
            </div>
            <button
              className="next-btn"
              onClick={() => setStep(2)}
              disabled={!formData.category || !formData.title || !formData.description}
            >
              Next: Upload Media →
            </button>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <h2>📸 Media Upload (Proof)</h2>
            <div className="upload-info">
              <p>Upload 5-20 photos/videos as proof</p>
              <p className="upload-counter">
                {mediaFiles.length} / 20 uploaded
                {mediaFiles.length < 5 && <span className="warning"> (Minimum 5 required)</span>}
              </p>
            </div>
            <div className="form-group">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="file-input"
                />
                <span className="upload-btn">Choose Files</span>
              </label>
            </div>
            <div className="media-preview-grid">
              {mediaFiles.map((file, index) => (
                <div key={index} className="media-preview">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                  ) : (
                    <video src={URL.createObjectURL(file)} />
                  )}
                  <button
                    className="remove-media-btn"
                    onClick={() => removeMedia(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="next-btn"
                onClick={() => setStep(3)}
                disabled={mediaFiles.length < 5}
              >
                Next: Location →
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <h2>📍 Location Details</h2>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Complete address of the issue"
                required
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                maxLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label>Latitude (Optional)</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="e.g., 22.3072"
              />
            </div>
            <div className="form-group">
              <label>Longitude (Optional)</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="e.g., 73.1812"
              />
            </div>
            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="next-btn"
                onClick={() => setStep(4)}
                disabled={!formData.address || !formData.pincode}
              >
                Next: Your Details →
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-section">
            <h2>👤 Your Details</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                required
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="consent-section">
              <label className="consent-label">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  required
                />
                <span>I confirm that the information provided is true to the best of my knowledge.</span>
              </label>
            </div>
            <div className="step-buttons">
              <button className="back-btn" onClick={() => setStep(3)}>
                ← Back
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || !formData.fullName || !formData.phone || !formData.consent}
              >
                {loading ? 'Submitting...' : 'Register Complaint'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h2>Complaint Registered Successfully!</h2>
            <div className="complaint-details">
              <p><strong>Complaint ID:</strong> {complaintId}</p>
              <p><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> <span className="status-badge">Submitted</span></p>
            </div>
            <p className="success-message">
              Your complaint has been registered. The concerned authorities will review it shortly.
              Please save your Complaint ID for future reference.
            </p>
            <button
              className="home-btn"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Under Review': return 'status-review';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const renderComplaintCard = (complaint) => (
    <motion.div
      key={complaint.id}
      className="complaint-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="complaint-card-header">
        <div className="complaint-id-section">
          <span className="complaint-id-label">ID:</span>
          <span className="complaint-id-value">{complaint.complaintId}</span>
        </div>
        <span className={`complaint-status-badge ${getStatusColor(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>

      <h3 className="complaint-title">{complaint.title}</h3>
      <p className="complaint-category">📂 {complaint.category}</p>
      <p className="complaint-description">{complaint.description}</p>

      <div className="complaint-meta">
        <div className="meta-item">
          <FaMapMarkerAlt className="meta-icon" />
          <span>{complaint.address}</span>
        </div>
        <div className="meta-item">
          <FaCalendarAlt className="meta-icon" />
          <span>Submitted: {formatDate(complaint.createdAt)}</span>
        </div>
      </div>

      {complaint.mediaUrls && complaint.mediaUrls.length > 0 && (
        <div className="complaint-media-preview">
          <span className="media-count">📷 {complaint.mediaUrls.length} attachments</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="register-complaint-page">
      <div className="complaint-header">
        <h1>🏛️ Civic Complaint System</h1>
        <p>Report municipal irregularities and track your complaints</p>
      </div>

      {/* View Tabs */}
      <div className="complaint-tabs">
        <button
          className={`complaint-tab ${activeView === 'register' ? 'active' : ''}`}
          onClick={() => setActiveView('register')}
        >
          <FaClipboardList className="tab-icon" />
          Register New
        </button>
        <button
          className={`complaint-tab ${activeView === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveView('ongoing')}
        >
          <FaClock className="tab-icon" />
          Ongoing Complaints
          {ongoingComplaints.length > 0 && (
            <span className="tab-badge">{ongoingComplaints.length}</span>
          )}
        </button>
        <button
          className={`complaint-tab ${activeView === 'fulfilled' ? 'active' : ''}`}
          onClick={() => setActiveView('fulfilled')}
        >
          <FaCheckCircle className="tab-icon" />
          Fulfilled Complaints
          {fulfilledComplaints.length > 0 && (
            <span className="tab-badge">{fulfilledComplaints.length}</span>
          )}
        </button>
      </div>

      {/* Register New Complaint View */}
      {activeView === 'register' && (
        <>
          {step < 5 && (
            <div className="progress-bar-container">
              <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Issue</div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Media</div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Location</div>
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Details</div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <motion.div
            className="complaint-form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderStep()}
          </motion.div>

          {step < 5 && (
            <div className="disclaimer-box">
              <p>
                <strong>Note:</strong> Your phone number will be kept confidential.
                All complaints are reviewed by authorities. False complaints may lead to legal action.
              </p>
            </div>
          )}
        </>
      )}

      {/* Ongoing Complaints View */}
      {activeView === 'ongoing' && (
        <div className="complaints-list-container">
          <div className="complaints-list-header">
            <h2>⏳ Ongoing Complaints</h2>
            <p>Track the status of your active complaints</p>
          </div>

          {loadingComplaints ? (
            <div className="loading-state">Loading complaints...</div>
          ) : ongoingComplaints.length === 0 ? (
            <div className="empty-state">
              <FaClock className="empty-icon" />
              <h3>No Ongoing Complaints</h3>
              <p>You don't have any active complaints at the moment.</p>
              <button
                className="register-new-btn"
                onClick={() => setActiveView('register')}
              >
                Register New Complaint
              </button>
            </div>
          ) : (
            <div className="complaints-grid">
              {ongoingComplaints.map(complaint => renderComplaintCard(complaint))}
            </div>
          )}
        </div>
      )}

      {/* Fulfilled Complaints View */}
      {activeView === 'fulfilled' && (
        <div className="complaints-list-container">
          <div className="complaints-list-header">
            <h2>✅ Fulfilled Complaints</h2>
            <p>View your resolved and closed complaints</p>
          </div>

          {loadingComplaints ? (
            <div className="loading-state">Loading complaints...</div>
          ) : fulfilledComplaints.length === 0 ? (
            <div className="empty-state">
              <FaCheckCircle className="empty-icon" />
              <h3>No Fulfilled Complaints</h3>
              <p>You don't have any resolved complaints yet.</p>
              <button
                className="register-new-btn"
                onClick={() => setActiveView('register')}
              >
                Register New Complaint
              </button>
            </div>
          ) : (
            <div className="complaints-grid">
              {fulfilledComplaints.map(complaint => renderComplaintCard(complaint))}
            </div>
          )}
        </div>
      )}
      {/* Full Screen Loading Overlay */}
      {loading && (
        <div className="submission-loading-overlay">
          <motion.div
            className="loading-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="loading-spinner"></div>
            <h3>Submitting Complaint...</h3>
            <p>Please wait while we upload your proof and register the complaint.</p>
            <p className="loading-warning">Do not refresh or close this page.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RegisterComplaint;
