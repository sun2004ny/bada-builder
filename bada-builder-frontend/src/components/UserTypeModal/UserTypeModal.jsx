import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserTypeModal.css';

const UserTypeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isSubscribed } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
      setIsChecking(false);
    }
  }, [isOpen]);

  const handleTypeSelection = async (type) => {
    if (isChecking) return; // Prevent multiple clicks

    setSelectedType(type);
    setIsChecking(true);

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check authentication
    if (!isAuthenticated) {
      alert('Please login to post a property');
      setIsChecking(false);
      setSelectedType(null);
      onClose();
      navigate('/login');
      return;
    }

    // Navigate to post property with user type (no subscription check here)
    setIsChecking(false);
    setSelectedType(null);
    onClose();
    navigate('/post-property', { state: { userType: type } });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="user-type-modal-overlay" onClick={onClose}>
        <motion.div
          className="user-type-modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>

          <div className="modal-header">
            <h2>Post Your Property</h2>
            <p>First, tell us who you are</p>
          </div>

          <div className="user-type-options">
            <motion.div
              className={`type-option-card ${selectedType === 'individual' ? 'selected' : ''} ${isChecking && selectedType === 'individual' ? 'checking' : ''}`}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isChecking && handleTypeSelection('individual')}
            >
              <div className="option-icon">👤</div>
              <h3>Individual Owner</h3>
              <p>I'm selling or renting my own property</p>
              <ul className="option-features">
                <li>✓ Direct listing</li>
                <li>✓ No commission</li>
                <li>✓ Quick posting</li>
              </ul>
              {isChecking && selectedType === 'individual' && (
                <div className="checking-spinner"></div>
              )}
            </motion.div>

            <motion.div
              className={`type-option-card ${selectedType === 'developer' ? 'selected' : ''} ${isChecking && selectedType === 'developer' ? 'checking' : ''}`}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isChecking && handleTypeSelection('developer')}
            >
              <div className="option-icon">🏢</div>
              <h3>Developer / Builder</h3>
              <p>I'm listing projects or multiple units</p>
              <ul className="option-features">
                <li>✓ Project listing</li>
                <li>✓ Multiple units</li>
                <li>✓ RERA verified</li>
              </ul>
              {isChecking && selectedType === 'developer' && (
                <div className="checking-spinner"></div>
              )}
            </motion.div>
          </div>

          <div className="modal-footer">
            <p className="footer-note">
              💡 You'll need to be logged in to post properties
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserTypeModal;
