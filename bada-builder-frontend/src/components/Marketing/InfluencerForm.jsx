import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaExclamationCircle, FaUserCircle, FaLink } from 'react-icons/fa';

const FloatingInput = ({ label, name, type = "text", value, onChange, error, icon = null, placeholder = " " }) => (
    <div className={`input-group-premium ${error ? 'has-error' : ''}`}>
        <div className="drive-input-wrapper">
            {icon && <span className="drive-icon">{icon}</span>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`input-field-glass ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
                placeholder={placeholder}
            />
            <label className={`input-label-floating ${icon ? 'label-with-icon' : ''}`} style={icon ? { left: '48px' } : {}}>{label}</label>
        </div>
        {error && <div className="error-msg"><FaExclamationCircle /> {error}</div>}
    </div>
);

const InfluencerForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        metaLink: '',
        followers: ''
    });
    const [errors, setErrors] = useState({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.metaLink.trim()) newErrors.metaLink = 'Profile Link is required';
        else if (!/^https?:\/\//i.test(formData.metaLink)) newErrors.metaLink = 'Must be a valid URL';
        if (!formData.followers) newErrors.followers = 'Followers count is required';
        else if (isNaN(formData.followers) || parseInt(formData.followers) < 0) newErrors.followers = 'Must be a valid number';

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSubmit(formData);
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={isLoading} style={{ border: 'none', padding: 0, margin: 0 }}>
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    <div className="form-section-divider">
                        <div className="section-line"></div>
                        <span>Influencer Profile</span>
                        <div className="section-line"></div>
                    </div>

                    <div className="form-grid">
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Full Name *"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={errors.name}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Phone Number *"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                error={errors.phone}
                            />
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <FloatingInput
                            label="Email Address *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                        />
                    </motion.div>

                    <div className="form-section-divider">
                        <div className="section-line"></div>
                        <span>Social Media & Reach</span>
                        <div className="section-line"></div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <FloatingInput
                            label="Meta / Instagram Profile Link *"
                            name="metaLink"
                            value={formData.metaLink}
                            onChange={handleInputChange}
                            error={errors.metaLink}
                            icon={<FaLink />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <FloatingInput
                            label="Total Followers *"
                            name="followers"
                            type="number"
                            value={formData.followers}
                            onChange={handleInputChange}
                            error={errors.followers}
                            icon={<FaUserCircle />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="terms-section" style={{ marginTop: '24px' }}>
                        <label className="terms-checkbox-wrapper">
                            <input
                                type="checkbox"
                                className="terms-checkbox"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                            />
                            <span className="terms-label">I agree to the terms as an Influencer.</span>
                        </label>
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="submit-btn-premium"
                        disabled={!isTermsAccepted || isLoading}
                        whileHover={isTermsAccepted && !isLoading ? { scale: 1.02 } : {}}
                        whileTap={isTermsAccepted && !isLoading ? { scale: 0.98 } : {}}
                    >
                        <div className="btn-shine-anim"></div>
                        {isLoading ? <FaSpinner className="spinner" /> : <><FaPaperPlane /> Submit Application</>}
                    </motion.button>
                </motion.div>
            </fieldset>
        </form>
    );
};

export default InfluencerForm;
