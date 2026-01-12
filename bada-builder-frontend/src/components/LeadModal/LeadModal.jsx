import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leadsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './LeadModal.css';

const LeadModal = ({ isOpen, onClose }) => {
  const { userProfile, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    requirementType: '',
    bhkType: '',
    budget: '',
    location: '',
    phone: ''
  });

  // Pre-fill user data when modal opens or profile loads
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || userProfile?.name || currentUser?.displayName || '',
        phone: prev.phone || userProfile?.phone || ''
      }));
    }
  }, [isOpen, userProfile, currentUser]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Refs for form fields to enable auto-scroll
  const nameRef = useRef(null);
  const requirementTypeRef = useRef(null);
  const bhkTypeRef = useRef(null);
  const budgetRef = useRef(null);
  const locationRef = useRef(null);
  const phoneRef = useRef(null);
  const modalBodyRef = useRef(null);

  // Simplified auto-scroll function
  const scrollToNextField = (currentField) => {
    if (!modalBodyRef.current) return;

    // Determine next field based on form logic
    let nextField = null;

    if (currentField === 'name') {
      nextField = 'requirementType';
    } else if (currentField === 'requirementType') {
      const showBhkType = ['Flat', 'House', 'Villa'].includes(formData.requirementType);
      nextField = showBhkType ? 'bhkType' : 'budget';
    } else if (currentField === 'bhkType') {
      nextField = 'budget';
    } else if (currentField === 'budget') {
      nextField = 'location';
    } else if (currentField === 'location') {
      nextField = 'phone';
    }

    // Simple scroll without heavy animations
    if (nextField) {
      requestAnimationFrame(() => {
        const nextElement = document.getElementById(nextField);
        if (nextElement && modalBodyRef.current) {
          nextElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // Focus after a short delay
          setTimeout(() => nextElement.focus(), 200);
        }
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If property type changes, reset BHK type and budget
    if (name === 'requirementType') {
      setFormData(prev => ({ ...prev, [name]: value, bhkType: '', budget: '' }));
      if (value) scrollToNextField(name);
    }
    // If BHK type changes, reset budget
    else if (name === 'bhkType') {
      setFormData(prev => ({ ...prev, [name]: value, budget: '' }));
      if (value) scrollToNextField(name);
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Only auto-scroll for select fields to reduce performance impact
      if (value && ['budget'].includes(name)) {
        scrollToNextField(name);
      }
    }

    setError('');
  };

  // Check if BHK type should be shown
  const showBhkType = ['Flat', 'House', 'Villa'].includes(formData.requirementType);

  // Check if Budget should be shown - after property type is selected, and for BHK types after BHK is selected
  const showBudget = formData.requirementType && (
    !showBhkType || (showBhkType && formData.bhkType)
  );

  // Simplified auto-scroll when new fields appear
  useEffect(() => {
    if (showBhkType && formData.requirementType && !formData.bhkType) {
      requestAnimationFrame(() => {
        const bhkElement = document.getElementById('bhkType');
        if (bhkElement) {
          bhkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, [showBhkType, formData.requirementType]);

  useEffect(() => {
    if (showBudget && ((showBhkType && formData.bhkType) || (!showBhkType && formData.requirementType)) && !formData.budget) {
      requestAnimationFrame(() => {
        const budgetElement = document.getElementById('budget');
        if (budgetElement) {
          budgetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, [showBudget, formData.bhkType, formData.requirementType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.requirementType || !formData.budget || !formData.location || !formData.phone) {
      setError('All fields are required');
      return;
    }

    // Validate BHK type only if it should be shown
    if (showBhkType && !formData.bhkType) {
      setError('Please select BHK type');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save to backend API
      const leadData = {
        name: formData.name,
        requirement_type: formData.requirementType,
        location: formData.location,
        phone: formData.phone,
      };

      await leadsAPI.create(leadData);

      console.log('✅ Lead saved successfully:', formData);
      setSuccess(true);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setFormData({ name: '', requirementType: '', bhkType: '', budget: '', location: '', phone: '' });
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Error saving lead:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="lead-modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="lead-modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <button className="lead-modal-close" onClick={onClose}>&times;</button>

          {success ? (
            <motion.div
              className="success-message"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="success-icon">✓</div>
              <h2>Thank You!</h2>
              <p>We'll contact you soon</p>
            </motion.div>
          ) : (
            <>
              <div className="lead-modal-header">
                <h2 className="lead-modal-title">Find Your Dream Property</h2>
                <p className="lead-modal-subtitle">Tell us what you're looking for</p>
              </div>

              <form onSubmit={handleSubmit} className="lead-modal-form">
                <div className="lead-modal-body" ref={modalBodyRef}>
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      ref={nameRef}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="requirementType">Property Type *</label>
                    <select
                      ref={requirementTypeRef}
                      id="requirementType"
                      name="requirementType"
                      value={formData.requirementType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select property type</option>
                      <option value="Flat">Flat</option>
                      <option value="House">House</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Shop">Shop</option>
                      <option value="Office">Office</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Showroom">Showroom</option>
                    </select>
                  </div>

                  {/* Show BHK Type only for Flat, House, Villa */}
                  {showBhkType && (
                    <motion.div
                      className="form-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="bhkType">BHK Type *</label>
                      <select
                        ref={bhkTypeRef}
                        id="bhkType"
                        name="bhkType"
                        value={formData.bhkType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select BHK type</option>
                        <option value="1RK">1 RK</option>
                        <option value="1BHK">1 BHK</option>
                        <option value="2BHK">2 BHK</option>
                        <option value="3BHK">3 BHK</option>
                        <option value="4BHK">4 BHK</option>
                        <option value="5BHK">5 BHK</option>
                        <option value="6+BHK">6+ BHK</option>
                      </select>
                    </motion.div>
                  )}

                  {/* Show Budget only after property type is selected, and for BHK types after BHK is selected */}
                  {showBudget && (
                    <motion.div
                      className="form-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="budget">Budget *</label>
                      <select
                        ref={budgetRef}
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select budget range</option>
                        <optgroup label="In Lakhs">
                          <option value="Under 10 Lakhs">Under ₹10 Lakhs</option>
                          <option value="10-20 Lakhs">₹10-20 Lakhs</option>
                          <option value="20-30 Lakhs">₹20-30 Lakhs</option>
                          <option value="30-40 Lakhs">₹30-40 Lakhs</option>
                          <option value="40-50 Lakhs">₹40-50 Lakhs</option>
                          <option value="50-60 Lakhs">₹50-60 Lakhs</option>
                          <option value="60-70 Lakhs">₹60-70 Lakhs</option>
                          <option value="70-80 Lakhs">₹70-80 Lakhs</option>
                          <option value="80-90 Lakhs">₹80-90 Lakhs</option>
                          <option value="90 Lakhs - 1 Crore">₹90 Lakhs - 1 Crore</option>
                        </optgroup>
                        <optgroup label="In Crores">
                          <option value="1-2 Crores">₹1-2 Crores</option>
                          <option value="2-3 Crores">₹2-3 Crores</option>
                          <option value="3-4 Crores">₹3-4 Crores</option>
                          <option value="4-5 Crores">₹4-5 Crores</option>
                          <option value="5-10 Crores">₹5-10 Crores</option>
                          <option value="10-15 Crores">₹10-15 Crores</option>
                          <option value="15-20 Crores">₹15-20 Crores</option>
                          <option value="20-50 Crores">₹20-50 Crores</option>
                          <option value="Above 50 Crores">Above ₹50 Crores</option>
                        </optgroup>
                      </select>
                    </motion.div>
                  )}


                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      ref={locationRef}
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter city or location"
                      list="location-suggestions"
                      required
                    />
                    <datalist id="location-suggestions">
                      <option value="PAN India" />
                      <option value="Mumbai" />
                      <option value="Delhi" />
                      <option value="Bangalore" />
                      <option value="Hyderabad" />
                      <option value="Ahmedabad" />
                      <option value="Chennai" />
                      <option value="Kolkata" />
                      <option value="Pune" />
                      <option value="Jaipur" />
                      <option value="Surat" />
                      <option value="Lucknow" />
                      <option value="Kanpur" />
                      <option value="Nagpur" />
                      <option value="Indore" />
                      <option value="Thane" />
                      <option value="Bhopal" />
                      <option value="Visakhapatnam" />
                      <option value="Pimpri-Chinchwad" />
                      <option value="Patna" />
                      <option value="Vadodara" />
                      <option value="Ghaziabad" />
                      <option value="Ludhiana" />
                      <option value="Agra" />
                      <option value="Nashik" />
                      <option value="Faridabad" />
                      <option value="Meerut" />
                      <option value="Rajkot" />
                      <option value="Kalyan-Dombivali" />
                      <option value="Vasai-Virar" />
                      <option value="Varanasi" />
                      <option value="Srinagar" />
                      <option value="Aurangabad" />
                      <option value="Dhanbad" />
                      <option value="Amritsar" />
                      <option value="Navi Mumbai" />
                      <option value="Allahabad" />
                      <option value="Ranchi" />
                      <option value="Howrah" />
                      <option value="Coimbatore" />
                      <option value="Jabalpur" />
                      <option value="Gwalior" />
                      <option value="Vijayawada" />
                      <option value="Jodhpur" />
                      <option value="Madurai" />
                      <option value="Raipur" />
                      <option value="Kota" />
                      <option value="Chandigarh" />
                      <option value="Guwahati" />
                      <option value="Solapur" />
                      <option value="Hubli-Dharwad" />
                      <option value="Mysore" />
                      <option value="Tiruchirappalli" />
                      <option value="Bareilly" />
                      <option value="Aligarh" />
                      <option value="Tiruppur" />
                      <option value="Moradabad" />
                      <option value="Jalandhar" />
                      <option value="Bhubaneswar" />
                      <option value="Salem" />
                      <option value="Warangal" />
                      <option value="Mira-Bhayandar" />
                      <option value="Thiruvananthapuram" />
                      <option value="Bhiwandi" />
                      <option value="Saharanpur" />
                      <option value="Guntur" />
                      <option value="Amravati" />
                      <option value="Bikaner" />
                      <option value="Noida" />
                      <option value="Jamshedpur" />
                      <option value="Bhilai" />
                      <option value="Cuttack" />
                      <option value="Firozabad" />
                      <option value="Kochi" />
                      <option value="Nellore" />
                      <option value="Bhavnagar" />
                      <option value="Dehradun" />
                      <option value="Durgapur" />
                      <option value="Asansol" />
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      ref={phoneRef}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      maxLength="10"
                      required
                    />
                  </div>

                </div>

                <div className="lead-modal-footer">
                  {error && (
                    <motion.p
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: '16px' }}
                    >
                      {error}
                    </motion.p>
                  )}

                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadModal;
