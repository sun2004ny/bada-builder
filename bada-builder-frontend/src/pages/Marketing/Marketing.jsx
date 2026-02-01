import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaBullhorn, FaUserTie, FaHandshake, FaChevronDown, FaChevronUp, FaCheckCircle, FaHelicopter, FaTimes, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import './Marketing.css';

const packages = [
    {
        id: 1,
        title: "Only Shoot (DSLR)",
        target: "Individuals & Developers",
        icon: <FaVideo size={24} />,
        videos: "2 Videos (3 mins each)",
        price: "₹7,000",
        priceSub: "Flat fee",
        features: [
            "Professional DSLR Shoot",
            "Video Editing & Color Grading",
            "YouTube/Instagram Optimized Output"
        ],
        payment: "100% after shoot (Online)",
        popular: false
    },
    {
        id: 2,
        title: "Only Shoot (DSLR + Drone)",
        target: "Individuals & Developers",
        icon: <FaHelicopter size={24} />,
        videos: "3 Videos (3 mins each)",
        price: "₹25,000",
        priceSub: "Flat fee",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage"
        ],
        payment: "100% after shoot (Online)",
        popular: true
    },
    {
        id: 3,
        title: "Shoot (DSLR + Drone) + Digital Marketing",
        target: "Individuals & Developers",
        icon: <FaBullhorn size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "1%",
        priceSub: "of property price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach"
        ],
        payment: "Online: 20% brokerage upfront + 80% after sale. Offline: 20% before sale + 80% after sale.",
        popular: false
    },
    {
        id: 4,
        title: "Influencer Marketing",
        target: "Individuals & Developers",
        icon: <FaUserTie size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "2%",
        priceSub: "of property price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates"
        ],
        payment: "Online: 20% brokerage upfront + 80% after sale. Offline: 20% before sale + 80% after sale.",
        popular: true
    },
    {
        id: 5,
        title: "Sole Selling + Marketing Agent",
        target: "Developers Only",
        icon: <FaHandshake size={24} />,
        videos: "Unlimited Video Content",
        price: "4%",
        priceSub: "of project price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates",
            "Exclusive Selling Rights",
            "Dedicated Real Estate Agent",
            "On-desk Enquiry Handling",
            "Possession & Record Maintenance"
        ],
        payment: "Payment starts after selling properties (from buyer collections)",
        popular: false
    },
    {
        id: 6,
        title: "Sole Selling + RISG Guarantee",
        target: "Developers Only",
        icon: <FaCheckCircle size={24} />,
        videos: "Unlimited Video Content",
        price: "8%",
        priceSub: "of project price",
        features: [
             "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates",
            "Exclusive Selling Rights",
            "Dedicated Real Estate Agent",
            "On-desk Enquiry Handling",
            "Possession & Record Maintenance",
            "RISG: Rental Income Substitution Guarantee",
            "Upfront Monthly Rental till Sale",
            "Guaranteed Cash Flow",
            "Unlimited Marketing Assets"
        ],
        payment: "Payment starts after selling properties (from buyer collections)",
        popular: true
    }
];

const TermsAccordion = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="accordion-item">
            <div className="accordion-header" onClick={onClick}>
                <h3>{title}</h3>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="accordion-content"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PackageInquiryModal = ({ isOpen, onClose, packageData }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        propertyPrice: '',
        address: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/marketing/inquiry', {
                ...formData,
                packageTitle: packageData.title,
                packagePrice: packageData.price + ' ' + packageData.priceSub,
                packageTarget: packageData.target
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setFormData({ name: '', phone: '', propertyPrice: '', address: '' });
                setAgreedToTerms(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send inquiry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !packageData) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="marketing-modal-overlay" onClick={onClose}>
                    <motion.div 
                        className="marketing-modal-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={onClose}>
                            <FaTimes />
                        </button>
                        
                        {!success ? (
                            <>
                                {/* Package Details First */}
                                <div className="selected-package">
                                    <div className="pkg-icon">{packageData.icon}</div>
                                    <div>
                                        <h4>{packageData.title}</h4>
                                        <p className="pkg-meta">{packageData.target}</p>
                                        <p className="pkg-price">{packageData.price} <span>{packageData.priceSub}</span></p>
                                    </div>
                                </div>

                                {/* Form Section Header */}
                                <div className="form-section-header">
                                    <h3>Your Details</h3>
                                    <p>Fill in your information to inquire about this package</p>
                                </div>

                                <form onSubmit={handleSubmit} className="inquiry-form">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Property Price (₹)</label>
                                        <input 
                                            type="number" 
                                            name="propertyPrice" 
                                            value={formData.propertyPrice} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="50,00,000"
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Property Location</label>
                                        <textarea 
                                            name="address" 
                                            value={formData.address} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="Enter complete property address"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    {error && <p className="error-msg">{error}</p>}

                                    <div className="terms-agreement">
                                        <label className="checkbox-container">
                                            <input 
                                                type="checkbox" 
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                            <span className="agreement-text">
                                                I agree to the{' '}
                                                <a 
                                                    href="/services/marketing/terms-conditions" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Terms & Conditions
                                                </a>
                                                {' '}and{' '}
                                                <a 
                                                    href="/services/marketing/rules-regulations" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Rules & Regulations
                                                </a>
                                            </span>
                                        </label>
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={loading || !agreedToTerms}>
                                        {loading ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success-message">
                                <FaCheckCircle size={64} color="#10B981" />
                                <h3>Inquiry Sent Successfully!</h3>
                                <p>Our team will contact you shortly.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Marketing = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setModalOpen(true);
    };

    return (
        <div className="marketing-page">
            <PackageInquiryModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                packageData={selectedPackage} 
            />
            <div className="marketing-hero">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="hero-bg-video"
                    poster="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-building-and-its-pool-10338-large.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        Premium Real Estate Marketing
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        From cinematic drone shots to targeted Meta ads and influencer campaigns,
                        we provide end-to-end marketing solutions to sell your property faster.
                    </motion.p>
                </div>
            </div>

            <div className="packages-section">
                <div className="packages-grid">
                    {packages.map((pkg, index) => (
                        <motion.div 
                            key={pkg.id} 
                            className="package-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="package-number">Package {pkg.id}</div>
                            <div className="card-badge-row">
                                <span className="package-target">{pkg.target}</span>
                                {pkg.popular && <span className="popular-badge">High Demand</span>}
                            </div>
                            
                            <div className="package-header">
                                <div className="package-title">
                                    <div className="package-icon-wrapper">
                                        {pkg.icon}
                                    </div>
                                    <span>{pkg.title}</span>
                                </div>
                                <div className="package-price">
                                    <span className="price-amount">{pkg.price}</span>
                                    <span className="price-sub">{pkg.priceSub}</span>
                                </div>
                            </div>

                            <ul className="package-features">
                                <li><FaVideo className="feature-icon" /> {pkg.videos}</li>
                                {pkg.features.map((feature, idx) => (
                                    <li key={idx}>
                                        <FaCheckCircle className="feature-icon" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="payment-terms">
                                <h4>Payment Terms</h4>
                                <p>{pkg.payment}</p>
                            </div>

                            <button className="book-btn" onClick={() => handlePackageSelect(pkg)}>Select Package</button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="info-section">
                <h2>Legal Information</h2>
                <p className="section-subtitle">Click to view complete legal documentation</p>
                
                <div className="legal-cards-container">
                    <a href="/services/marketing/terms-conditions" className="legal-card">
                        <div className="legal-card-icon">📋</div>
                        <h3>Terms & Conditions</h3>
                        <p>Complete service agreement covering all 6 marketing packages, payment terms, brokerage calculations, and RISG guarantee details.</p>
                        <div className="legal-card-footer">
                            <span>View Full Document</span>
                            <FaChevronRight />
                        </div>
                    </a>

                    <a href="/services/marketing/rules-regulations" className="legal-card">
                        <div className="legal-card-icon">⚖️</div>
                        <h3>Rules & Regulations</h3>
                        <p>Property verification requirements, pricing policies, exclusive rights agreements, and lead handling procedures.</p>
                        <div className="legal-card-footer">
                            <span>View Full Document</span>
                            <FaChevronRight />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
