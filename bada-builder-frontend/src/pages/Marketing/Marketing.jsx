import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaChevronRight, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { packages } from './packages';
import JoinPhotographer from './JoinPhotographer';
import './Marketing.css';

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

const Marketing = () => {
    const navigate = useNavigate();

    // Video Audio Control
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);

    const toggleAudio = () => {
        setIsMuted(!isMuted);
    };

    const handlePackageSelect = (pkg) => {
        navigate(`/services/marketing/package/${pkg.id}`);
    };

    return (
        <div className="marketing-page">
            <div className="marketing-hero">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="hero-bg-video"
                    poster="/logo.png"
                >
                    <source src="/BadaBuilder_Marketing.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="hero-overlay"></div>

                {/* Audio Control Button */}
                <button
                    className="video-audio-toggle"
                    onClick={toggleAudio}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>

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

                            <button className="book-btn" onClick={() => handlePackageSelect(pkg)}>View More Details</button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <JoinPhotographer />

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
