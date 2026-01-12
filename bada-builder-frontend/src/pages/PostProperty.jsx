import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PropertyForm from '../components/PropertyForm/PropertyForm';
import DeveloperForm from '../components/DeveloperForm/DeveloperForm';
import SubscriptionGuard from '../components/SubscriptionGuard/SubscriptionGuard';
import SubscriptionService from '../services/subscriptionService';
import { formatDate } from '../utils/dateFormatter';
import PropertyTemplateEditor from '../components/PropertyTemplateEditor/PropertyTemplateEditor';
import { compressImage } from '../utils/imageCompressor';
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



const NewPropertySelectionContent = ({ userType, setUserType, setSelectedPropertyFlow, handleCreateNewProperty }) => (
  <>
    <div className="selected-type-badge">
      <span>
        {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
      </span>
      <button
        type="button"
        className="change-type-btn"
        onClick={() => { setUserType(null); setSelectedPropertyFlow(null); }}
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

  // Get userType from navigation state or location state
  const locationState = location.state || window.history.state?.usr;
  const [userType, setUserType] = useState(locationState?.userType || null);
  const [selectedPropertyFlow, setSelectedPropertyFlow] = useState(null);
  const [existingProperties, setExistingProperties] = useState([]);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [subscriptionVerified, setSubscriptionVerified] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [developerCredits, setDeveloperCredits] = useState(null); // Add developer credits state
  const [timerRefresh, setTimerRefresh] = useState(0); // For refreshing timers
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    price: '',
    bhk: '',
    description: '',
    facilities: '',
    // Developer specific fields
    schemeType: '', // Residential, Commercial, Both
    residentialOptions: [], // Bungalows, Flats, etc.
    commercialOptions: [], // Shops, Offices, Both
    basePrice: '',
    maxPrice: '',
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
      area: ''
    },
    contactPhone: ''
  });

  const [projectImages, setProjectImages] = useState([]);
  const [brochureFile, setBrochureFile] = useState(null);

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

  // Effect to fetch developer credits
  useEffect(() => {
    if (userType === 'developer' && currentUser?.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot && typeof onSnapshot === 'function' ? onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDeveloperCredits(userData.property_credits || 0);
        }
      }) : null;

      // Fallback if onSnapshot is not imported (though it should be added to imports)
      if (!unsubscribe) {
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setDeveloperCredits(userData.property_credits || 0);
          }
        });
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userType, currentUser]);

  // Effect to fetch existing properties
  useEffect(() => {
    const fetchExistingProperties = async () => {
      if (selectedPropertyFlow === 'existing' && currentUser?.uid) {
        setFetchingProperties(true);
        try {
          const propertiesRef = collection(db, 'properties');
          const q = query(propertiesRef, where('user_id', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const propertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExistingProperties(propertiesData);
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

  const handleEditProperty = (property) => {
    // Double-check if property is still editable
    if (!isEditable(property.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.');
      return;
    }

    setEditingProperty(property);
    // Populate form with property data for editing
    setFormData({
      title: property.title || '',
      type: property.type || '',
      location: property.location || '',
      price: property.price || '',
      bhk: property.bhk || '',
      description: property.description || '',
      facilities: property.facilities ? property.facilities.join(', ') : '',
      schemeType: property.scheme_type || '',
      residentialOptions: property.residential_options || [],
      commercialOptions: property.commercial_options || [],
      basePrice: property.base_price || '',
      maxPrice: property.max_price || '',
      projectLocation: property.project_location || '',
      amenities: property.amenities || [],
      ownerName: property.owner_name || '',
      possessionStatus: property.possession_status || '',
      reraStatus: property.rera_status || 'No',
      reraNumber: property.rera_number || '',
      projectName: property.project_name || '',
      projectStats: property.project_stats || { towers: '', floors: '', units: '', area: '' },
      contactPhone: property.contact_phone || '',
      completionDate: property.completion_date || ''
    });
    setImagePreview(property.image_url || '');
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

      const propertyData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        price: formData.price,
        description: formData.description,
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        image_url: imageUrl,
        user_type: userType, // Keep user type
        // created_at should not change
        status: 'active'
      };

      if (showBhkType && formData.bhk) {
        propertyData.bhk = formData.bhk;
      } else {
        propertyData.bhk = ''; // Clear BHK if property type no longer supports it
      }

      if (userType === 'developer') {
        propertyData.company_name = formData.companyName || '';
        propertyData.project_name = formData.projectName || '';
        propertyData.total_units = formData.totalUnits || '';
        propertyData.completion_date = formData.completionDate || '';
        propertyData.rera_number = formData.reraNumber || '';
      } else {
        // Clear developer specific fields if user type changed from developer
        propertyData.company_name = '';
        propertyData.project_name = '';
        propertyData.total_units = '';
        propertyData.completion_date = '';
        propertyData.rera_number = '';
      }

      const propertyRef = doc(db, 'properties', editingProperty.id);
      await updateDoc(propertyRef, propertyData);

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
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('user_id', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const updatedPropertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExistingProperties(updatedPropertiesData);

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

      if (formData.contactPhone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      if (projectImages.length < 5) {
        alert(`Please upload at least 5 project images (currently ${projectImages.length})`);
        return;
      }

      if (projectImages.length > 30) {
        alert(`Maximum 30 images allowed (currently ${projectImages.length})`);
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

      if (!imageFile && !editingProperty) {
        alert('Please upload a property image');
        return;
      }

      // For individual, proceed directly or show disclaimer? 
      // User specifically mentioned Developer Form destination/disclaimer issues.
      // I'll proceed directly for individual to avoid changing their existing flow,
      // but developers get the disclaimer.
    }

    // Proceed to final submission (for Individual)
    handleFinalSubmit();
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
      } else if (userType === 'developer') {
        filesToUpload = projectImages;
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
      const propertyData = {
        title: userType === 'developer' ? (activeData.projectName || '') : (activeData.title || ''),
        type: userType === 'developer' ? (activeData.schemeType || '') : (activeData.type || ''),
        location: userType === 'developer' ? (activeData.projectLocation || '') : (activeData.location || ''),
        price: userType === 'developer' ? `₹${activeData.basePrice} - ₹${activeData.maxPrice}` : (activeData.price || ''),
        description: activeData.description || '',
        facilities: activeData.facilities ? (Array.isArray(activeData.facilities) ? activeData.facilities : activeData.facilities.split(',').map(f => f.trim()).filter(f => f)) : [],
        image_url: imageUrl,
        user_id: currentUser.uid || '',
        user_type: userType || 'individual',
        created_at: new Date().toISOString(),
        status: 'active'
      };

      // Subscription logic...
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().subscription_expiry) {
          propertyData.subscription_expiry = userDoc.data().subscription_expiry;
        }
      } catch (e) { console.error(e); }

      if (showBhkType && formData.bhk) propertyData.bhk = formData.bhk;

      // Map images to schema
      if (extraImageUrls.length > 0) {
        propertyData.images = extraImageUrls;
        propertyData.project_images = extraImageUrls; // Maintain compatibility
        // Fallback for cover if missing
        if (!imageUrl && extraImageUrls.length > 0) {
          propertyData.image_url = extraImageUrls[0];
        }
      }

      // Developer fields...
      if (userType === 'developer') {
        // ... existing dev fields mapping ...
        // Note: activeData contains the merged template data which has these fields
        if (brochureFile) propertyData.brochure_url = await uploadToCloudinary(brochureFile);

        propertyData.scheme_type = activeData.schemeType || '';
        propertyData.residential_options = activeData.residentialOptions || [];
        propertyData.commercial_options = activeData.commercialOptions || [];
        propertyData.base_price = activeData.basePrice || activeData.minPrice || ''; // handle key vars
        propertyData.max_price = activeData.maxPrice || '';
        propertyData.project_location = activeData.projectLocation || '';
        propertyData.amenities = activeData.amenities || [];
        propertyData.owner_name = activeData.ownerName || '';
        propertyData.company_name = activeData.ownerName || '';
        propertyData.possession_status = activeData.possessionStatus || '';
        propertyData.rera_status = activeData.reraStatus || 'No';
        propertyData.rera_number = activeData.reraNumber || '';
        propertyData.project_name = activeData.projectName || '';
        propertyData.project_stats = activeData.projectStats || { towers: '', floors: '', units: '', area: '' };
        propertyData.contact_phone = activeData.contactPhone || '';
        propertyData.completionDate = activeData.completionDate || '';

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        propertyData.expiry_date = expiryDate.toISOString();
      } else {
        // Pass owner/contact for Individual too if template sent them
        if (activeData.ownerName) propertyData.owner_name = activeData.ownerName;
        if (activeData.contactPhone) propertyData.contact_phone = activeData.contactPhone;
      }

      console.log('💾 Saving to Firestore...', propertyData);
      const docRef = await addDoc(collection(db, 'properties'), propertyData);
      const propertyId = docRef.id;

      // ... Credits/Subscription deduction (Reuse existing logic block if possible or copy) ...
      if (userType === 'developer') {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { property_credits: increment(-1) });
      } else if (userType === 'individual' && currentUser?.uid) {
        await SubscriptionService.markSubscriptionUsed(currentUser.uid, propertyId);
      }

      setLoading(false);
      setShowDisclaimer(false);
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
    if (flow === 'new_selection' && userType === 'developer') {
      if (developerCredits === null) {
        alert('Please wait, checking developer credits...');
        return;
      }
      if (developerCredits <= 0) {
        alert('You do not have enough credits to post a property. Please purchase a developer subscription plan.');
        navigate('/developer-plan');
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
                onClick={() => setUserType('individual')}
              >
                <div className="card-icon">👤</div>
                <h3>Individual Owner</h3>
                <p>Selling or renting your own property</p>
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
                onClick={() => setUserType('developer')}
              >
                <div className="card-icon">🏢</div>
                <h3>Developer / Builder</h3>
                <p>Listing projects or multiple units</p>
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
                onClick={() => setUserType(null)}
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
            {/* Wrap in SubscriptionGuard for Individuals */}
            {userType === 'individual' ? (
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
                onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setEditingProperty(null); }}
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
            {/* For Individual users creating new properties, enforce subscription */}
            {userType === 'individual' && selectedPropertyFlow === 'new' && !editingProperty ? (
              <SubscriptionGuard
                userType={userType}
                action="post a property"
                onSubscriptionVerified={handleSubscriptionVerified}
              >
                <div className="selected-type-badge">
                  <span>👤 Individual Owner</span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setEditingProperty(null); }}
                  >
                    Change User Type
                  </button>
                </div>
                <div className="selected-flow-badge">
                  <span>✨ Create New Property</span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setSelectedPropertyFlow('new_selection'); setEditingProperty(null); }}
                  >
                    Change Method
                  </button>
                </div>
                <p className="subtitle">Fill in the details to list your property</p>
                <PropertyForm
                  formData={formData}
                  handleChange={handleChange}
                  handleImageChange={handleImageChange}
                  imagePreview={imagePreview}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  userType={userType}
                  showBhkType={showBhkType}
                  editingProperty={editingProperty}
                />
              </SubscriptionGuard>
            ) : (
              <>
                <div className="selected-type-badge">
                  <span>
                    {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
                  </span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setEditingProperty(null); }}
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
                    projectImages={projectImages}
                    setProjectImages={setProjectImages}
                    brochureFile={brochureFile}
                    setBrochureFile={setBrochureFile}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    disabled={developerCredits !== null && developerCredits <= 0}
                  />
                ) : (
                  <PropertyForm
                    formData={formData}
                    handleChange={handleChange}
                    handleImageChange={handleImageChange}
                    imagePreview={imagePreview}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    userType={userType}
                    showBhkType={showBhkType}
                    editingProperty={editingProperty}
                    disabled={userType === 'developer' && developerCredits !== null && developerCredits <= 0}
                  />
                )}
              </>
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
                    onClick={handleFinalSubmit}
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