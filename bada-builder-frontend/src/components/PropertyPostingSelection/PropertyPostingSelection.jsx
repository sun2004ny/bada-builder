import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import './PropertyPostingSelection.css';

const PropertyPostingSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(null);

  // Get data from navigation state
  const { userType, subscriptionVerified, message } = location.state || {};

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Navigate to PostProperty with the selected flow
    setTimeout(() => {
      navigate('/post-property', {
        state: {
          userType: userType,
          subscriptionVerified: subscriptionVerified,
          selectedFlow: option, // 'form' or 'template'
          message: message
        }
      });
    }, 300);
  };

  return (
    <div className="property-posting-selection-page">
      <div className="selection-container">
        <motion.div
          className="selection-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="success-badge">
            <span className="success-icon">✅</span>
            <span>Subscription Activated Successfully!</span>
          </div>
          
          <h1>How would you like to post your property?</h1>
          <p>Choose your preferred method to create your property listing</p>
          
          {userType && (
            <div className="user-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer/Builder'}
              </span>
            </div>
          )}
        </motion.div>

        <div className="posting-options">
          <motion.div
            className={`posting-option-card ${selectedOption === 'form' ? 'selected' : ''}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => handleOptionSelect('form')}
          >
            <div className="option-icon">📝</div>
            <h3>Fill Standard Form</h3>
            <p>Enter property details manually using our step-by-step form</p>
            <ul className="option-features">
              <li>✓ Guided form fields</li>
              <li>✓ Image upload support</li>
              <li>✓ Validation & error checking</li>
              <li>✓ Preview before posting</li>
            </ul>
            <button 
              type="button" 
              className="select-option-btn"
              disabled={selectedOption && selectedOption !== 'form'}
            >
              {selectedOption === 'form' ? 'Selected' : 'Choose Form'}
            </button>
          </motion.div>

          <motion.div
            className={`posting-option-card ${selectedOption === 'template' ? 'selected' : ''}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => handleOptionSelect('template')}
          >
            <div className="option-icon">📋</div>
            <h3>Post Using Template</h3>
            <p>Use a pre-filled, editable text template for quick posting</p>
            <ul className="option-features">
              <li>✓ Pre-formatted template</li>
              <li>✓ Quick text editing</li>
              <li>✓ Bulk image upload</li>
              <li>✓ Faster posting process</li>
            </ul>
            <button 
              type="button" 
              className="select-option-btn"
              disabled={selectedOption && selectedOption !== 'template'}
            >
              {selectedOption === 'template' ? 'Selected' : 'Choose Template'}
            </button>
          </motion.div>
        </div>

        <motion.div
          className="selection-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>💡 You can always switch between methods later. Both options will create the same quality listing.</p>
        </motion.div>

        <motion.div
          className="back-button-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PropertyPostingSelection;