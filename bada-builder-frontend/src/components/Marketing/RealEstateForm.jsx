import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFilePdf, FaPaperPlane, FaSpinner, FaExclamationCircle, FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';

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

const RealEstateForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        agencyName: '',
        experience: '',
        pdfUrl: ''
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setErrors(prev => ({ ...prev, pdf: 'Only PDF files are allowed' }));
            return;
        }

        setPdfFile(file);
        setErrors(prev => ({ ...prev, pdf: null }));

        // Simulate upload for now, or implement actual upload
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                // In a real app, this would be the URL from S3/Cloudinary
                setFormData(prev => ({ ...prev, pdfUrl: `https://storage.badabuilder.com/resumés/${file.name}` }));
            }
        }, 200);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.agencyName.trim()) newErrors.agencyName = 'Agency Name is required';
        if (!formData.pdfUrl) newErrors.pdf = 'PDF Upload is required';

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
                        <span>Professional Details</span>
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

                    <div className="form-grid">
                        <motion.div variants={itemVariants}>
                            <FloatingInput
                                label="Agency Name *"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleInputChange}
                                error={errors.agencyName}
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
                        <span>Resume / Portfolio (PDF)</span>
                        <div className="section-line"></div>
                    </div>

                    <motion.div variants={itemVariants} className="file-upload-container">
                        <input
                            type="file"
                            id="pdfUpload"
                            accept=".pdf"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="pdfUpload" className={`file-upload-label ${errors.pdf ? 'has-error' : ''}`}>
                            {pdfFile ? (
                                <div className="file-info">
                                    <FaFilePdf className="pdf-icon" />
                                    <span>{pdfFile.name}</span>
                                    {isUploading ? (
                                        <div className="upload-progress-bar">
                                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    ) : (
                                        <FaCheckCircle className="success-icon" />
                                    )}
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <FaCloudUploadAlt />
                                    <span>Click to upload Resume (PDF)</span>
                                </div>
                            )}
                        </label>
                        {errors.pdf && <div className="error-msg"><FaExclamationCircle /> {errors.pdf}</div>}
                    </motion.div>

                    <motion.div variants={itemVariants} className="terms-section" style={{ marginTop: '24px' }}>
                        <label className="terms-checkbox-wrapper">
                            <input
                                type="checkbox"
                                className="terms-checkbox"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                            />
                            <span className="terms-label">I agree to join as a Real Estate Agent and accept the terms.</span>
                        </label>
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="submit-btn-premium"
                        disabled={!isTermsAccepted || isLoading || isUploading}
                        whileHover={isTermsAccepted && !isLoading && !isUploading ? { scale: 1.02 } : {}}
                        whileTap={isTermsAccepted && !isLoading && !isUploading ? { scale: 0.98 } : {}}
                    >
                        <div className="btn-shine-anim"></div>
                        {isLoading ? <FaSpinner className="spinner" /> : <><FaPaperPlane /> Submit Application</>}
                    </motion.button>
                </motion.div>
            </fieldset>

            <style dangerouslySetInnerHTML={{
                __html: `
                .file-upload-label {
                    display: block;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px dashed rgba(56, 189, 248, 0.3);
                    border-radius: 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .file-upload-label:hover {
                    background: rgba(56, 189, 248, 0.05);
                    border-color: #38BDF8;
                }
                .file-upload-label.has-error {
                    border-color: #F43F5E;
                }
                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: #94A3B8;
                }
                .upload-placeholder svg {
                    font-size: 32px;
                    color: #38BDF8;
                }
                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #E2E8F0;
                    justify-content: center;
                }
                .pdf-icon {
                    font-size: 24px;
                    color: #F43F5E;
                }
                .success-icon {
                    color: #10B981;
                }
                .upload-progress-bar {
                    width: 100px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: #38BDF8;
                    transition: width 0.3s ease;
                }
            `}} />
        </form>
    );
};

export default RealEstateForm;
