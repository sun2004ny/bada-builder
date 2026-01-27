import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, authAPI, subscriptionsAPI } from '../services/api';
import PropertyForm from '../components/PropertyForm/PropertyForm';
import DeveloperForm from '../components/DeveloperForm/DeveloperForm';
import SubscriptionGuard from '../components/SubscriptionGuard/SubscriptionGuard';
import { formatDate } from '../utils/dateFormatter';
import PropertyTemplateEditor from '../components/PropertyTemplateEditor/PropertyTemplateEditor';
import { compressImage } from '../utils/imageCompressor';
import LocationPicker from '../components/Map/LocationPicker';
import './PostProperty.css';

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

/**
 * Uploads an image file to Cloudinary using an unsigned preset.
 * @param {File} file The image file to upload.
 * @returns {Promise<string>} A promise that resolves to the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

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



const NewPropertySelectionContent = ({ userType, setUserType, setSelectedPropertyFlow, handleCreateNewProperty, setCreditUsed }) => (
  <>
    <div className="selected-type-badge">
      <span>
        {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
      </span>
      <button
        type="button"
        className="change-type-btn"
        onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setCreditUsed(null); }}
      >
        Change User Type
      </button>
    </div>
    <div className="selected-flow-badge">
      <span>✨ Create New Property</span>
      <button
        type="button"
        className="change-type-btn"
        onClick={() => setSelectedPropertyFlow(null)}
      >
        Change Flow
      </button>
    </div>

    <h2>How would you like to post?</h2>
    <div className="property-flow-cards">
      <motion.div
        className="property-flow-card"
        whileHover={{ y: -8, scale: 1.02 }}
        onClick={handleCreateNewProperty}
      >
        <div className="card-icon">📝</div>
        <h3>Fill Standard Form</h3>
        <p>Enter details manually step-by-step</p>
        <button type="button" className="select-type-btn">
          Select
        </button>
      </motion.div>

      <motion.div
        className="property-flow-card"
        whileHover={{ y: -8, scale: 1.02 }}
        onClick={() => setSelectedPropertyFlow('template')}
      >
        <div className="card-icon">📋</div>
        <h3>Post Using Template</h3>
        <p>Use a pre-filled, editable text template</p>
        <button type="button" className="select-type-btn">
          Select
        </button>
      </motion.div>
    </div>
  </>
);

const PostProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [extraFiles, setExtraFiles] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);

  // Get state from navigation
  const locationState = location.state;
  const [userType, setUserType] = useState(locationState?.userType || null);
  const [selectedPropertyFlow, setSelectedPropertyFlow] = useState(
    locationState?.selectedPropertyFlow || null
  );
  const [subscriptionVerified, setSubscriptionVerified] = useState(
    locationState?.subscriptionVerified || false
  );

  const [existingProperties, setExistingProperties] = useState([]);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [developerCredits, setDeveloperCredits] = useState(null);
  const [individualCredits, setIndividualCredits] = useState(null);
  const [timerRefresh, setTimerRefresh] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Use explicit credit used selection
  const [creditUsed, setCreditUsed] = useState(locationState?.userType || null);

  // Sync state if it changes via navigation
  useEffect(() => {
    if (location.state) {
      if (location.state.userType) {
        setUserType(location.state.userType);
        setCreditUsed(location.state.userType);
      }
      if (location.state.selectedPropertyFlow) {
        setSelectedPropertyFlow(location.state.selectedPropertyFlow);
      }
      if (location.state.subscriptionVerified) {
        setSubscriptionVerified(location.state.subscriptionVerified);
      }
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    price: '',
    priceUnit: 'Lakh',
    bhk: '',
    area: '',
    areaUnit: 'sq.ft',
    description: '',
    facilities: '',
    // Developer specific fields
    schemeType: '', // Residential, Commercial, Both
    residentialOptions: [], // Bungalows, Flats, etc.
    commercialOptions: [], // Shops, Offices, Both
    basePrice: '',
    basePriceUnit: 'Lakh',
    maxPrice: '',
    maxPriceUnit: 'Lakh',
    projectLocation: '',
    amenities: [],
    ownerName: '',
    possessionStatus: '',
    reraStatus: 'No',
    reraNumber: '',
    projectName: '',
    projectStats: {
      towers: '',
      floors: '',
      units: '',
      area: '' // Legacy area in stats
    },
    contactPhone: '',
    completionDate: '',
    // Geolocation fields
    latitude: null,
    longitude: null,
    mapAddress: ''
  });

  const [brochureFile, setBrochureFile] = useState(null);

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
        ...prev,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        mapAddress: locationData.map_address
    }));
  };

  useEffect(() => {
    console.log('🔍 Checking authentication...');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Current User:', currentUser);

    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      alert('Please login to post a property');
      navigate('/login');
      return;
    }

    // Note: Subscription check is now handled only when user clicks "Create New Property"
  }, [isAuthenticated, navigate, currentUser]);

  // Effect to fetch all credits from backend
  useEffect(() => {
    const fetchCredits = async () => {
      if (currentUser?.id) {
        try {
          const response = await subscriptionsAPI.getStatus();
          setDeveloperCredits(response.developer_credits || 0);
          setIndividualCredits(response.individual_credits || 0);
        } catch (error) {
          console.error('Error fetching credits:', error);
          setDeveloperCredits(0);
          setIndividualCredits(0);
        }
      }
    };

    fetchCredits();
  }, [currentUser]);

  // Effect to fetch existing properties from backend
  useEffect(() => {
    const fetchExistingProperties = async () => {
      if (selectedPropertyFlow === 'existing' && currentUser?.id) {
        setFetchingProperties(true);
        try {
          const response = await propertiesAPI.getMyProperties();
          setExistingProperties(response.properties || []);
        } catch (error) {
          console.error("Error fetching existing properties:", error);
          alert("Failed to fetch your properties. Please try again.");
        } finally {
          setFetchingProperties(false);
        }
      }
    };

    fetchExistingProperties();
  }, [selectedPropertyFlow, currentUser]);

  // Effect to refresh timer display every minute
  useEffect(() => {
    if (selectedPropertyFlow === 'existing' && existingProperties.length > 0) {
      const interval = setInterval(() => {
        setTimerRefresh(prev => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [selectedPropertyFlow, existingProperties]);

  const handleCreateNewProperty = async () => {
    console.log('🔍 User wants to fill standard form...');
    // Developer credits are checked at flow entry
    // Individual subscription is checked at flow entry (via Guard)

    console.log('✅ Proceeding to standard form');
    setSelectedPropertyFlow('new');
  };

  const handleSubscriptionVerified = (subscription) => {
    console.log('✅ Subscription verified:', subscription);
    setSubscriptionVerified(true);
    setCurrentSubscription(subscription);
  };

  const isEditable = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();
    return now < threeDaysLater;
  };

  const getTimeRemaining = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();

    const diffMs = threeDaysLater - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Edit period expired' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h remaining`,
        urgent: diffDays === 0
      };
    } else if (diffHours > 0) {
      return {
        expired: false,
        text: `${diffHours}h ${diffMinutes}m remaining`,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`,
        urgent: true
      };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If property type changes, reset BHK if not applicable
    if (name === 'type') {
      const newFormData = { ...formData, [name]: value };
      // Reset BHK if property type doesn't support it
      if (!['Flat/Apartment', 'Independent House/Villa'].includes(value)) {
        newFormData.bhk = '';
      }
      setFormData(newFormData);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    console.log('PostProperty handleChange:', name, value);
  };

  // Check if BHK type should be shown
  const showBhkType = ['Flat/Apartment', 'Independent House/Villa'].includes(formData.type);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const currentCount = extraPreviews.length;
      const remainingSlots = 20 - currentCount;

      if (remainingSlots <= 0) {
        alert('Maximum 20 additional images allowed.');
        return;
      }

      let filesToAdd = files;
      if (files.length > remainingSlots) {
        alert(`Only ${remainingSlots} more images can be added. Clipping to 20 images total.`);
        filesToAdd = files.slice(0, remainingSlots);
      }

      setExtraFiles(prev => [...prev, ...filesToAdd]);
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setExtraPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExtraImage = (index) => {
    setExtraFiles(prev => prev.filter((_, i) => i !== index));
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditProperty = (property) => {
    // Double-check if property is still editable
    if (!isEditable(property.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.');
      return;
    }

    setEditingProperty(property);
    // Populate form with property data for editing
    // Parse price and unit
    let priceVal = property.price || '';
    let priceUnit = 'Lakh';
    if (priceVal && typeof priceVal === 'string') {
      const parts = priceVal.split(' ');
      if (parts.length > 1) {
        priceVal = parts[0].replace(/[^0-9.]/g, '');
        priceUnit = parts[1];
      } else {
        priceVal = priceVal.replace(/[^0-9.]/g, '');
      }
    }

    // Parse Developer Prices
    let basePriceVal = property.base_price || '';
    let basePriceUnit = 'Lakh';
    if (basePriceVal && typeof basePriceVal === 'string') {
      const cleaned = basePriceVal.replace(/₹/g, '').trim();
      const parts = cleaned.split(' ');
      basePriceVal = parts[0].replace(/[^0-9.]/g, '');
      if (parts.length > 1) basePriceUnit = parts[1];
    }

    let maxPriceVal = property.max_price || property.maxPrice || '';
    let maxPriceUnit = 'Lakh';
    if (maxPriceVal && typeof maxPriceVal === 'string') {
      const cleaned = maxPriceVal.replace(/₹/g, '').trim();
      const parts = cleaned.split(' ');
      maxPriceVal = parts[0].replace(/[^0-9.]/g, '');
      if (parts.length > 1) maxPriceUnit = parts[1];
    }

    // Parse Area
    let areaVal = property.area || '';
    let areaUnit = 'sq.ft';
    if (areaVal && typeof areaVal === 'string') {
      const parts = areaVal.split(' ');
      if (parts.length > 1) {
        areaVal = parts[0].replace(/[^0-9.]/g, '');
        areaUnit = parts[1];
      } else {
        areaVal = areaVal.replace(/[^0-9.]/g, '');
      }
    }

    setFormData({
      title: property.title || '',
      type: property.type || '',
      location: property.location || '',
      price: priceVal,
      priceUnit: priceUnit,
      bhk: property.bhk || '',
      area: areaVal,
      areaUnit: areaUnit,
      description: property.description || '',
      facilities: property.facilities ? property.facilities.join(', ') : '',
      schemeType: property.scheme_type || '',
      residentialOptions: property.residential_options || [],
      commercialOptions: property.commercial_options || [],
      basePrice: basePriceVal,
      basePriceUnit: basePriceUnit,
      maxPrice: maxPriceVal,
      maxPriceUnit: maxPriceUnit,
      projectLocation: property.project_location || '',
      amenities: property.amenities || [],
      ownerName: property.owner_name || '',
      possessionStatus: property.possession_status || '',
      reraStatus: property.rera_status || 'No',
      reraNumber: property.rera_number || '',
      projectName: property.project_name || '',
      projectStats: property.project_stats || { towers: '', floors: '', units: '', area: '' },
      contactPhone: property.contact_phone || '',
      completionDate: property.completion_date || '',
      latitude: property.latitude || null,
      longitude: property.longitude || null,
      mapAddress: property.map_address || ''
    });
    setImagePreview(property.image_url || '');
    setExtraPreviews(property.images || []);
    // Note: Multiple images logic would need expansion if editing existing ones
    // Scroll to the form or open a modal for editing
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    // Validate edit period before allowing update
    if (!isEditable(editingProperty.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.\n\nPlease refresh the page.');
      setLoading(false);
      // Reset editing state
      setEditingProperty(null);
      setSelectedPropertyFlow(null);
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image_url || ''; // Use existing image URL

      // Check if a new image file is selected
      if (imageFile) {
        console.log('📸 Uploading new image to Cloudinary...');
        imageUrl = await uploadToCloudinary(imageFile);
        console.log('✅ New image uploaded successfully:', imageUrl);
      }

      // Upload extra images if any
      let extraImageUrls = [];
      if (extraFiles.length > 0) {
        console.log(`📉 Compressing and uploading ${extraFiles.length} extra images...`);
        const compressedExtras = await Promise.all(
          extraFiles.map(async (file) => {
            try { return await compressImage(file); }
            catch (e) { return file; }
          })
        );
        extraImageUrls = await Promise.all(
          compressedExtras.map(file => uploadToCloudinary(file))
        );
      }

      // Combine existing URLs with new ones
      const finalExtraImages = [
        ...extraPreviews.filter(p => typeof p === 'string' && p.startsWith('http')),
        ...extraImageUrls
      ];

      // Helper to ensure we have value from any possible key
      const getVal = (keys) => {
        for (const key of keys) {
          if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') return formData[key];
        }
        return '';
      };

      const propertyData = {
        title: getVal(['projectName', 'title']) || (userType === 'developer' ? 'Untitled Project' : 'Untitled Property'),
        type: getVal(['schemeType', 'type']) || (userType === 'developer' ? 'Project' : 'Property'),
        location: getVal(['projectLocation', 'location']) || 'Location Not Specified',
        price: userType === 'developer'
          ? (formData.basePrice ? `₹${formData.basePrice} ${formData.basePriceUnit}${formData.maxPrice ? ` - ₹${formData.maxPrice} ${formData.maxPriceUnit}` : ''}` : (formData.price ? `${formData.price} ${formData.priceUnit}` : 'Contact for Price'))
          : (formData.price ? `${formData.price} ${formData.priceUnit}` : 'Contact for Price'),
        bhk: userType === 'developer' ? null : formData.bhk,
        description: formData.description || '',
        facilities: userType === 'developer' ? (formData.amenities || []) : (formData.facilities ? (Array.isArray(formData.facilities) ? formData.facilities : formData.facilities.split(',').map(f => f.trim()).filter(f => f)) : []),
        area: formData.area ? `${formData.area} ${formData.areaUnit}` : (formData.projectStats?.area || ''),
        image_url: imageUrl,
        images: finalExtraImages,
        user_type: userType || 'individual',
        status: 'active',

        // Developer Specific (snake_case for backend)
        project_name: getVal(['projectName', 'title']),
        project_location: getVal(['projectLocation', 'location']),
        scheme_type: getVal(['schemeType', 'type']),
        base_price: formData.basePrice ? `₹${formData.basePrice} ${formData.basePriceUnit}` : '',
        max_price: formData.maxPrice ? `₹${formData.maxPrice} ${formData.maxPriceUnit}` : '',
        owner_name: formData.ownerName || formData.companyName || '',
        company_name: formData.companyName || formData.ownerName || '',
        contact_phone: formData.contactPhone || '',
        completion_date: formData.completionDate || '',
        possession_status: formData.possessionStatus || '',
        total_units: formData.projectStats?.units || formData.totalUnits || '',
        rera_status: formData.reraStatus || 'No',
        rera_number: formData.reraNumber || '',
        project_stats: formData.projectStats || { towers: '', floors: '', units: '', area: '' },
        amenities: formData.amenities || [],
        residential_options: formData.residentialOptions || [],
        commercial_options: formData.commercialOptions || [],
        latitude: formData.latitude,
        longitude: formData.longitude,
        map_address: formData.mapAddress
      };

      // Update property via backend API
      const response = await propertiesAPI.update(editingProperty.id, propertyData, []); // Pass empty array as images are already on Cloudinary

      alert(`Property updated successfully! You can view it in the ${userType === 'developer' ? 'Developer' : 'Individual'} Exhibition.`);
      setLoading(false);
      setEditingProperty(null); // Exit editing mode
      setFormData({ // Reset form data
        title: '', type: '', location: '', price: '', bhk: '', description: '', facilities: '',
        companyName: '', projectName: '', totalUnits: '', completionDate: '', reraNumber: ''
      });
      setImageFile(null);
      setImagePreview('');

      // Re-fetch properties to show updated list
      const updatedResponse = await propertiesAPI.getMyProperties();
      setExistingProperties(updatedResponse.properties || []);

      // Navigate to exhibition page after a delay
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/exhibition/developer');
        } else {
          navigate('/exhibition/individual');
        }
      }, 1500);

    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property. " + (error.message.includes('Cloudinary') ? 'Image upload failed.' : ''));
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If we are editing, call update function
    if (editingProperty) {
      handleUpdateProperty(e);
      return;
    }

    console.log('🚀 Validating property form...');

    // --- Validation Logic ---
    if (userType === 'developer') {
      // Developer Validation
      const devRequired = [
        { field: 'projectName', label: 'Project Name' },
        { field: 'schemeType', label: 'Scheme Type' },
        { field: 'projectLocation', label: 'Project Location' },
        { field: 'basePrice', label: 'Min Price' },
        { field: 'maxPrice', label: 'Max Price' },
        { field: 'possessionStatus', label: 'Possession Status' },
        { field: 'contactPhone', label: 'Contact Phone' },
        { field: 'description', label: 'Project Description' }
      ];

      const missingDev = devRequired.filter(item => {
        const value = formData[item.field];
        return !value || (typeof value === 'string' && !value.trim());
      });

      if (missingDev.length > 0) {
        alert(`Please fill in required fields: ${missingDev.map(i => i.label).join(', ')}`);
        return;
      }

      if (formData.contactPhone?.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      // --- Image Validation (Mandatory for Everyone) ---
      if (!imageFile && !imagePreview) {
        alert('Cover Image (Main Image) is required');
        return;
      }

      if (extraPreviews.length < 5) {
        alert(`At least 5 Additional Images are required (currently ${extraPreviews.length})`);
        return;
      }

      if (extraPreviews.length > 20) {
        alert(`Maximum 20 additional images allowed (currently ${extraPreviews.length})`);
        return;
      }

      if ((formData.possessionStatus === 'Under Construction' || formData.possessionStatus === 'Just Launched') && !formData.completionDate) {
        alert('Completion Date is required for the selected possession status');
        return;
      }

      if (formData.reraStatus === 'Yes' && !formData.reraNumber?.trim()) {
        alert('RERA Number is required if RERA Status is "Yes"');
        return;
      }

      // If all valid for developer, show disclaimer instead of submitting directly
      setShowDisclaimer(true);
      return;

    } else {
      // Individual Validation
      const requiredFields = [
        { field: 'title', label: 'Property Title' },
        { field: 'type', label: 'Property Type' },
        { field: 'location', label: 'Location' },
        { field: 'price', label: 'Price' },
        { field: 'description', label: 'Description' }
      ];

      const missingFields = requiredFields.filter(item => !formData[item.field]?.trim());

      if (missingFields.length > 0) {
        alert(`Please fill in required fields: ${missingFields.map(i => i.label).join(', ')}`);
        return;
      }

      // --- Image Validation (Mandatory for Everyone) ---
      if (!imageFile && !imagePreview) {
        alert('Cover Image (Main Image) is required');
        return;
      }

      if (extraPreviews.length < 5) {
        alert(`At least 5 Additional Images are required (currently ${extraPreviews.length})`);
        return;
      }

      if (extraPreviews.length > 20) {
        alert(`Maximum 20 additional images allowed (currently ${extraPreviews.length})`);
        return;
      }

      // Merge extraFiles into formData before submit
      const finalData = { ...formData, extraFiles };
      handleFinalSubmit(finalData);
    }
  };



  const handleTemplateSubmit = async (parsedData) => {
    // Extract extra images if present (files)
    const { extraImages, ...dataWithoutImages } = parsedData;

    // Merge data
    const finalData = { ...formData, ...dataWithoutImages };

    // Attach files to finalData for handleFinalSubmit to clean pickup
    if (extraImages && extraImages.length > 0) {
      finalData.extraFiles = extraImages;
    }

    setFormData(finalData);

    console.log("📝 Submitting via Template:", finalData);
    await handleFinalSubmit(finalData);
  };


  const handleFinalSubmit = async (dataOverride = null) => {
    const activeData = dataOverride || formData;

    console.log('🚀 Starting final submission...');
    setLoading(true);

    try {
      // --- OPTIMIZATION START: Image Compression & Parallel Uploads ---

      // 1. Prepare files and Compress
      let compressedCoverFile = null;
      if (imageFile) {
        // Only compress if it's a new file (not already uploaded/url)
        console.log('📉 Compressing cover image...');
        try {
          compressedCoverFile = await compressImage(imageFile);
        } catch (err) {
          console.warn('Cover compression failed, using original', err);
          compressedCoverFile = imageFile;
        }
      }

      let filesToUpload = [];
      if (activeData.extraFiles && activeData.extraFiles.length > 0) {
        filesToUpload = activeData.extraFiles;
      }

      let compressedExtraFiles = [];
      if (filesToUpload.length > 0) {
        console.log(`📉 Compressing ${filesToUpload.length} extra images...`);
        compressedExtraFiles = await Promise.all(
          filesToUpload.map(async (file) => {
            try { return await compressImage(file); }
            catch (e) { return file; }
          })
        );
      }

      // 2. Parallel Uploads (Cover + Extras at same time)
      console.log('☁️ Uploading images in parallel...');

      const uploadPromises = [];

      // Promise for Cover
      let coverUploadPromise = Promise.resolve('');
      if (compressedCoverFile) {
        coverUploadPromise = uploadToCloudinary(compressedCoverFile).catch(err => {
          console.error("Cover upload failed", err);
          throw new Error("Cover image upload failed");
        });
      }

      // Promise for Extras
      let extrasUploadPromise = Promise.resolve([]);
      if (compressedExtraFiles.length > 0) {
        extrasUploadPromise = Promise.all(
          compressedExtraFiles.map(file => uploadToCloudinary(file))
        ).catch(err => {
          console.error("Extra images upload failed", err);
          throw new Error("Some gallery images failed to upload");
        });
      }

      // Wait for all uploads
      const [imageUrl, extraImageUrls] = await Promise.all([
        coverUploadPromise,
        extrasUploadPromise
      ]);

      console.log('✅ All uploads complete.');

      // --- END OPTIMIZATION ---

      // Prepare base property data
      // Helper to ensure we have value from any possible key
      const getVal = (keys) => {
        for (const key of keys) {
          if (activeData[key] !== undefined && activeData[key] !== null && activeData[key] !== '') return activeData[key];
        }
        return '';
      };

      const propertyData = {
        title: getVal(['projectName', 'title']) || (userType === 'developer' ? 'Untitled Project' : 'Untitled Property'),
        type: getVal(['schemeType', 'type']) || (userType === 'developer' ? 'Project' : 'Property'),
        location: getVal(['projectLocation', 'location']) || 'Location Not Specified',
        price: userType === 'developer'
          ? (activeData.basePrice && activeData.maxPrice ? `₹${activeData.basePrice} ${activeData.basePriceUnit} - ₹${activeData.maxPrice} ${activeData.maxPriceUnit}` : (activeData.basePrice ? `₹${activeData.basePrice} ${activeData.basePriceUnit}` : (activeData.price ? `${activeData.price} ${activeData.priceUnit}` : 'Contact for Price')))
          : (activeData.price ? `${activeData.price} ${activeData.priceUnit}` : 'Contact for Price'),
        description: activeData.description || '',
        facilities: activeData.facilities ? (Array.isArray(activeData.facilities) ? activeData.facilities : activeData.facilities.split(',').map(f => f.trim()).filter(f => f)) : [],
        area: activeData.area ? `${activeData.area} ${activeData.areaUnit}` : (activeData.projectStats?.area || ''),
        user_type: userType || 'individual',
        credit_used: creditUsed || (userType === 'developer' ? 'developer' : 'individual'),
        status: 'active',
        latitude: activeData.latitude,
        longitude: activeData.longitude,
        map_address: activeData.mapAddress
      };

      if (showBhkType && formData.bhk) propertyData.bhk = formData.bhk;

      // Map images to schema
      const finalExtraImages = [
        ...extraPreviews.filter(p => typeof p === 'string' && p.startsWith('http')),
        ...extraImageUrls
      ];

      if (finalExtraImages.length > 0) {
        propertyData.images = finalExtraImages;
        propertyData.project_images = finalExtraImages; // Maintain compatibility
      }

      if (imageUrl || activeData.image_url) {
        propertyData.image_url = imageUrl || activeData.image_url;
      } else if (finalExtraImages.length > 0) {
        propertyData.image_url = finalExtraImages[0];
      }

      // Developer fields...
      if (userType === 'developer') {
        if (brochureFile) propertyData.brochure_url = await uploadToCloudinary(brochureFile);

        propertyData.project_name = getVal(['projectName', 'title']);
        propertyData.project_location = getVal(['projectLocation', 'location']);
        propertyData.scheme_type = getVal(['schemeType', 'type']);
        propertyData.base_price = activeData.basePrice ? `₹${activeData.basePrice} ${activeData.basePriceUnit}` : '';
        propertyData.max_price = activeData.maxPrice ? `₹${activeData.maxPrice} ${activeData.maxPriceUnit}` : '';
        propertyData.owner_name = activeData.ownerName || activeData.companyName || '';
        propertyData.company_name = activeData.companyName || activeData.ownerName || '';
        propertyData.possession_status = activeData.possessionStatus || '';
        propertyData.rera_status = activeData.reraStatus || 'No';
        propertyData.rera_number = activeData.reraNumber || '';
        propertyData.project_stats = activeData.projectStats || { towers: '', floors: '', units: '', area: '' };
        propertyData.contact_phone = activeData.contactPhone || '';
        propertyData.completion_date = activeData.completionDate || '';
        propertyData.total_units = activeData.projectStats?.units || '';
        propertyData.amenities = activeData.amenities || [];
        propertyData.residential_options = activeData.residentialOptions || [];
        propertyData.commercial_options = activeData.commercialOptions || [];

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        propertyData.expiry_date = expiryDate.toISOString();
      } else {
        // Individual Owner fields
        propertyData.owner_name = activeData.ownerName || '';
        propertyData.contact_phone = activeData.contactPhone || '';
      }

      console.log('💾 Saving to database via API...', propertyData);

      // Call backend API to create property with Cloudinary URLs in propertyData
      const response = await propertiesAPI.create(propertyData, []); // Pass empty array as images are already on Cloudinary
      console.log('✅ Property created successfully:', response.property);

      setLoading(false);
      setShowDisclaimer(false);

      alert('Property posted successfully!');

      setTimeout(() => {
        navigate(userType === 'developer' ? '/exhibition/developer' : '/exhibition/individual');
      }, 500);

    } catch (error) {
      console.error('❌ Error posting property:', error);
      setLoading(false);
      alert('Failed to post property: ' + error.message);
    }
  };





  const handleFlowEntry = (flow) => {
    if (flow === 'new_selection') {
      const type = creditUsed || userType;
      const credits = type === 'developer' ? developerCredits : individualCredits;

      if (credits === null) {
        alert('Please wait, checking credits...');
        return;
      }

      if (credits <= 0) {
        alert(`You do not have enough ${type === 'developer' ? 'Developer' : 'Individual'} credits to post. Please purchase a plan.`);
        const targetPath = type === 'developer' ? '/developer-plan' : '/subscription-plans';
        navigate(targetPath, {
          state: {
            returnTo: '/post-property',
            userType: type
          }
        });
        return;
      }
    }
    setSelectedPropertyFlow(flow);
  };

  return (
    <div className="post-property-page">
      <motion.div
        className="post-property-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{editingProperty ? 'Edit Property' : 'Post Your Property'}</h1>
        <p className="subtitle">{editingProperty ? 'Modify the details of your property' : 'Fill in the details to list your property'}</p>

        {/* Step 1: User Type Selection */}
        {!userType && (
          <div className="user-type-selection">
            <h2>I am a...</h2>
            <div className="user-type-cards">
              <motion.div
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => {
                  setUserType('individual');
                  setCreditUsed('individual');
                }}
              >
                <div className="card-icon">👤</div>
                <h3>Individual Owner</h3>
                <p>Selling or renting your own property</p>
                <div className="credit-balance-badge" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Available Credits: {individualCredits ?? '...'}
                </div>
                <ul className="card-features">
                  <li>✓ Direct listing</li>
                  <li>✓ No commission</li>
                  <li>✓ Quick posting</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>

              <motion.div
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => {
                  setUserType('developer');
                  setCreditUsed('developer');
                }}
              >
                <div className="card-icon">🏢</div>
                <h3>Developer / Builder</h3>
                <p>Listing projects or multiple units</p>
                <div className="credit-balance-badge" style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Available Credits: {developerCredits ?? '...'}
                </div>
                <ul className="card-features">
                  <li>✓ Project listing</li>
                  <li>✓ Multiple units</li>
                  <li>✓ RERA verified</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 2: Property Flow Selection (New or Existing) */}
        {userType && !selectedPropertyFlow && (
          <div className="property-flow-selection">
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => {
                  setUserType(null);
                  setCreditUsed(null);
                }}
              >
                Change User Type
              </button>
            </div>
            <h2>What would you like to do?</h2>
            <div className="property-flow-cards">
              <motion.div
                className="property-flow-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleFlowEntry('new_selection')}
              >
                <div className="card-icon">✨</div>
                <h3>Create New Property</h3>
                <p>List a brand new property or project</p>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>

              <motion.div
                className="property-flow-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedPropertyFlow('existing')}
              >
                <div className="card-icon">📝</div>
                <h3>Existing Property</h3>
                <p>View, edit, or update your listed properties</p>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 2.5: Sub-selection for New Property (Form vs Template) */}
        {userType && selectedPropertyFlow === 'new_selection' && (
          <div className="property-flow-selection">
            {/* Wrap in SubscriptionGuard for Individuals ONLY if not already verified */}
            {userType === 'individual' && !subscriptionVerified ? (
              <SubscriptionGuard
                userType="individual"
                action="post a property"
                onSubscriptionVerified={handleSubscriptionVerified}
              >
                <NewPropertySelectionContent
                  userType={userType}
                  setUserType={setUserType}
                  setSelectedPropertyFlow={setSelectedPropertyFlow}
                  handleCreateNewProperty={handleCreateNewProperty}
                />
              </SubscriptionGuard>
            ) : (
              <NewPropertySelectionContent
                userType={userType}
                setUserType={setUserType}
                setSelectedPropertyFlow={setSelectedPropertyFlow}
                handleCreateNewProperty={handleCreateNewProperty}
              />
            )}
          </div>
        )}

        {/* Step 3: Property Creation Form */}
        {(userType && selectedPropertyFlow === 'template') ? (
          <div className="template-editor-wrapper">
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => {
                  setUserType(null);
                  setSelectedPropertyFlow(null);
                  setEditingProperty(null);
                  setSubscriptionVerified(false); // Reset subscription flag
                }}
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>📋 Post Using Template</span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => { setSelectedPropertyFlow('new_selection'); }}
              >
                Change Method
              </button>
            </div>

            <PropertyTemplateEditor
              userType={userType}
              onCancel={() => setSelectedPropertyFlow(null)}
              onSubmit={handleTemplateSubmit}
              handleImageChange={handleImageChange}
              imagePreview={imagePreview}
            />
          </div>
        ) : (userType && selectedPropertyFlow === 'new') || (editingProperty && selectedPropertyFlow === 'existing') ? (
          <>
            {/* No SubscriptionGuard here - already checked at new_selection flow */}
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => {
                  setUserType(null);
                  setSelectedPropertyFlow(null);
                  setEditingProperty(null);
                  setSubscriptionVerified(false); // Reset subscription flag
                }}
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                {selectedPropertyFlow === 'new' ? '✨ Create New Property' : '📝 Editing Existing Property'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => {
                  if (selectedPropertyFlow === 'new') setSelectedPropertyFlow('new_selection');
                  else setSelectedPropertyFlow(null);
                  setEditingProperty(null);
                }}
              >
                Change {selectedPropertyFlow === 'new' ? 'Method' : 'Flow'}
              </button>
            </div>
            <p className="subtitle">Fill in the details to list your property</p>

            {/* Developer Credit Display */}
            {userType === 'developer' && developerCredits !== null && (
              <div style={{
                background: developerCredits > 0 ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${developerCredits > 0 ? '#86efac' : '#fecaca'}`,
                color: developerCredits > 0 ? '#166534' : '#991b1b',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.2em' }}>🏢</span>
                {developerCredits > 0 ? (
                  <span>You have <strong>{developerCredits}</strong> out of <strong>20</strong> properties remaining</span>
                ) : (
                  <span>You have reached your posting limit. <a href="#" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }} onClick={(e) => { e.preventDefault(); navigate('/developer-plan'); }}>Purchase plan to continue</a></span>
                )}
              </div>
            )}

            {userType === 'developer' ? (
              <DeveloperForm
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                extraPreviews={extraPreviews}
                handleImageChange={handleImageChange}
                handleExtraImagesChange={handleExtraImagesChange}
                removeExtraImage={removeExtraImage}
                brochureFile={brochureFile}
                setBrochureFile={setBrochureFile}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                disabled={developerCredits !== null && developerCredits <= 0}
                handleLocationSelect={handleLocationSelect}
              />
            ) : (
              <PropertyForm
                formData={formData}
                handleChange={handleChange}
                handleImageChange={handleImageChange}
                imagePreview={imagePreview}
                extraPreviews={extraPreviews}
                handleExtraImagesChange={handleExtraImagesChange}
                removeExtraImage={removeExtraImage}
                handleSubmit={handleSubmit}
                loading={loading}
                userType={userType}
                showBhkType={showBhkType}
                editingProperty={editingProperty}
                disabled={userType === 'developer' && developerCredits !== null && developerCredits <= 0}
                handleLocationSelect={handleLocationSelect}
              />
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="spinner-large"></div>
                  <h3>{editingProperty ? 'Updating Your Property...' : 'Posting Your Property...'}</h3>
                  <p>Please wait while we save your property details</p>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Step 3 (Existing Property Flow): Display Existing Properties */}
        {userType && selectedPropertyFlow === 'existing' && !editingProperty && (
          <>
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => { setUserType(null); setSelectedPropertyFlow(null); }} // Reset both
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                📝 Existing Property
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => setSelectedPropertyFlow(null)}
              >
                Change Flow
              </button>
            </div>
            <h2>Your Existing Properties</h2>
            {fetchingProperties ? (
              <p>Loading your properties...</p>
            ) : existingProperties.length > 0 ? (
              <div className="existing-properties-list">
                {existingProperties.map((property) => {
                  const timeRemaining = getTimeRemaining(property.created_at);
                  const editable = isEditable(property.created_at);
                  return (
                    <motion.div
                      key={property.id}
                      className={`property-card ${!editable ? 'expired-property' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {property.image_url && <img src={property.image_url} alt={property.title} className="property-card-image" />}
                      <div className="property-card-details">
                        <h3>{property.title}</h3>
                        <p><strong>Type:</strong> {property.type}</p>
                        <p><strong>Location:</strong> {property.location}</p>
                        <p><strong>Price:</strong> {property.price}</p>
                        <p><strong>Posted On:</strong> {formatDate(property.created_at)}</p>

                        {/* Time Remaining Display */}
                        <div className={`edit-timer ${timeRemaining.expired ? 'expired' : timeRemaining.urgent ? 'urgent' : 'active'}`}>
                          <span className="timer-icon">⏱️</span>
                          <span className="timer-text">{timeRemaining.text}</span>
                        </div>

                        {editable ? (
                          <button
                            className="edit-property-btn"
                            onClick={() => handleEditProperty(property)}
                          >
                            ✏️ Edit Property
                          </button>
                        ) : (
                          <div className="edit-locked-section">
                            <p className="edit-restriction-message">
                              🔒 Editing Locked
                            </p>
                            <p className="edit-restriction-detail">
                              This property can no longer be edited as the 3-day edit window has expired.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p>You have not posted any properties yet.</p>
            )}
          </>
        )}
        {/* Disclaimer Modal */}
        <AnimatePresence>
          {showDisclaimer && (
            <div className="disclaimer-overlay">
              <motion.div
                className="disclaimer-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="disclaimer-header">
                  <div className="disclaimer-icon">⚠️</div>
                  <h2>Post Property Disclaimer</h2>
                </div>
                <div className="disclaimer-body">
                  <p>Please review your project details before posting. By clicking "Confirm & Post", you agree that:</p>
                  <ul>
                    <li>The information provided is accurate and authentic.</li>
                    <li>You have the necessary rights and permissions to list this project.</li>
                    <li>This project will be listed in the <strong>Developer Exhibition</strong>.</li>
                    <li>One credit will be deducted from your developer account.</li>
                  </ul>

                  <div className="project-summary-box">
                    <h4>Project Summary</h4>
                    <div className="summary-item">
                      <span>Project Name:</span>
                      <strong>{formData.projectName}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Location:</span>
                      <strong>{formData.projectLocation}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Price Range:</span>
                      <strong>₹{formData.basePrice} - ₹{formData.maxPrice}</strong>
                    </div>
                  </div>
                </div>
                <div className="disclaimer-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowDisclaimer(false)}
                    disabled={loading}
                  >
                    Go Back
                  </button>
                  <button
                    className="confirm-btn"
                    onClick={() => handleFinalSubmit({ ...formData, extraFiles, extraPreviews })}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner"></span>
                        Posting...
                      </span>
                    ) : (
                      'Confirm & Post'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PostProperty;