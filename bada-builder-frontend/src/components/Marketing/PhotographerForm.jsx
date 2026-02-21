import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogleDrive, FaInstagram, FaGlobe, FaPaperPlane, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

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

            {name === 'driveLink' && value && (
                <span className={`validation-icon ${!error && /^https?:\/\//.test(value) ? 'valid' : 'invalid'}`}>
                    {!error && /^https?:\/\//.test(value) ? <FaCheckCircle /> : <FaExclamationCircle />}
                </span>
            )}
        </div>
        {error && <div className="error-msg"><FaExclamationCircle /> {error}</div>}
        {name === 'driveLink' && <div className="helper-text">Make sure sharing access is public or accessible.</div>}
    </div>
);

const ToggleSwitch = ({ label, name, value, onChange }) => (
    <div className="toggle-row">
        <span className="toggle-label">{label}</span>
        <div className="toggle-switch" onClick={() => onChange(name, !value)}>
            <motion.div
                className={`toggle-slider ${value ? 'right' : ''}`}
                layout
            />
            <span className={`toggle-option ${!value ? 'active' : ''}`}>No</span>
            <span className={`toggle-option ${value ? 'active' : ''}`}>Yes</span>
        </div>
    </div>
);

const PhotographerForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        experience: '',
        photographyType: 'Real Estate',
        driveLink: '',
        instagram: '',
        website: '',
        hasDslr: false,
        hasDrone: false,
        outstationAvailable: false,
        bio: ''
    });
    const [errors, setErrors] = useState({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleToggle = (name, val) => {
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.driveLink.trim()) newErrors.driveLink = 'Drive link is required';
        else if (!/^https?:\/\//i.test(formData.driveLink)) newErrors.driveLink = 'Must be a valid URL';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={isLoading} style={{ border: 'none', padding: 0, margin: 0 }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <div className="form-section-divider">
                        <div className="section-line"></div>
                        <span>Personal Information</span>
                        <div className="section-line"></div>
                    </div>

                    <div className="form-grid">
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Full Name *"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                error={errors.fullName}
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

                    <div className="form-grid">
                        <motion.div variants={itemVariants} className="form-full">
                            <FloatingInput
                                label="Email Address *"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={errors.email}
                            />
                        </motion.div>
                    </div>

                    <div className="form-grid">
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Experience (Years)"
                                name="experience"
                                type="number"
                                value={formData.experience}
                                onChange={handleInputChange}
                            />
                        </motion.div>
                    </div>

                    <div className="form-section-divider">
                        <div className="section-line"></div>
                        <span>Portfolio & Links</span>
                        <div className="section-line"></div>
                    </div>

                    <motion.div variants={itemVariants} className="form-group form-full">
                        <FloatingInput
                            label="Portfolio / Drive Link *"
                            name="driveLink"
                            value={formData.driveLink}
                            onChange={handleInputChange}
                            error={errors.driveLink}
                            icon={<FaGoogleDrive />}
                        />
                    </motion.div>

                    <div className="form-grid">
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Instagram"
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleInputChange}
                                icon={<FaInstagram />}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                icon={<FaGlobe />}
                            />
                        </motion.div>
                    </div>

                    <div className="form-section-divider">
                        <div className="section-line"></div>
                        <span>Equipment & Bio</span>
                        <div className="section-line"></div>
                    </div>

                    <motion.div variants={itemVariants} className="toggle-group">
                        <ToggleSwitch label="Do you own a DSLR?" name="hasDslr" value={formData.hasDslr} onChange={handleToggle} />
                        <ToggleSwitch label="Do you own a Drone?" name="hasDrone" value={formData.hasDrone} onChange={handleToggle} />
                        <ToggleSwitch label="Available for Outstation?" name="outstationAvailable" value={formData.outstationAvailable} onChange={handleToggle} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group form-full" style={{ marginTop: '24px' }}>
                        <div className="input-group-premium">
                            <textarea
                                className="input-field-glass"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder=" "
                            ></textarea>
                            <label className="input-label-floating">Short Bio / About You</label>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="terms-section">
                        <label className="terms-checkbox-wrapper">
                            <input
                                type="checkbox"
                                className="terms-checkbox"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                            />
                            <span className="terms-label">I agree to the Terms & Conditions and Photographer Agreement</span>
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

export default PhotographerForm;
