import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaBullhorn, FaUserTie, FaHandshake, FaChevronDown, FaChevronUp, FaCheckCircle, FaHelicopter } from 'react-icons/fa';
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
        title: "Shoot + Digital Marketing",
        target: "Individuals & Developers",
        icon: <FaBullhorn size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "1%",
        priceSub: "of property price",
        features: [
            "DSLR + Drone Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach"
        ],
        payment: "Online: 20% brokerage upfront + 80% after sale. Offline: 20% before sale + 80% after sale.",
        popular: false
    },
    {
        id: 4,
        title: "Shoot + Meta Ads + Influencer",
        target: "Individuals & Developers",
        icon: <FaUserTie size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "2%",
        priceSub: "of property price",
        features: [
            "Everything in Package 3",
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
        videos: "Unlimited",
        price: "4%",
        priceSub: "of project price",
        features: [
            "Exclusive Selling Rights",
            "Dedicated Real Estate Agent",
            "On-desk Enquiry Handling",
            "Possession & Record Maintenance",
            "Unlimited Video Content"
        ],
        payment: "Payment starts after selling properties (from buyer collections)",
        popular: false
    },
    {
        id: 6,
        title: "Sole Selling + RISG Guarantee",
        target: "Developers Only",
        icon: <FaCheckCircle size={24} />,
        videos: "Unlimited",
        price: "8%",
        priceSub: "of project price",
        features: [
            "Everything in Package 5",
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

const Marketing = () => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="marketing-page">
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

                            <button className="book-btn">Select Package</button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="info-section">
                <h2>Terms & Regulations</h2>
                
                <TermsAccordion 
                    title="Terms and Conditions" 
                    isOpen={openSection === 'terms'} 
                    onClick={() => toggleSection('terms')}
                >
                    <h4>1. Service Scope</h4>
                    <p>Includes Videography (DSLR/Drone), Editing, Meta Ads, Influencer promotions, and Sole selling based on package.</p>
                    
                    <h4>2. Eligibility</h4>
                    <ul>
                        <li>Pack 1-4: Owners & Developers</li>
                        <li>Pack 5-6: Developers Only</li>
                    </ul>

                    <h4>3. Payment Terms</h4>
                    <p>Pack 1-2: 100% after shoot. Pack 3-4: 20% Brokerage upfront. Pack 5-6: From buyer collections.</p>

                    <h4>11. RISG (Guaranteed Rent)</h4>
                    <p>Only for Residential properties in Pack 6. Paid monthly until sold after project completion.</p>

                    <h4>12. Refund Policy</h4>
                    <p>No refund if shoot/marketing has started. Pro-rata if Bada Builder fails to deliver.</p>
                </TermsAccordion>

                <TermsAccordion 
                    title="Rules and Regulations" 
                    isOpen={openSection === 'rules'} 
                    onClick={() => toggleSection('rules')}
                >
                    <h4>1. Property Verification</h4>
                    <p>Must submit Ownership proof and Government ID. No illegal properties.</p>
                    
                    <h4>2. Pricing Honesty</h4>
                    <p>Any under-reporting or hidden deals will result in contract termination and forfeiture.</p>
                    
                    <h4>3. Exclusive Rights (Pack 5 & 6)</h4>
                    <p>Developer cannot sell independently or appoint other brokers.</p>
                    
                    <h4>6. Lead Handling</h4>
                    <p>All leads generated must be handled through Bada Builder.</p>
                </TermsAccordion>
            </div>
        </div>
    );
};

export default Marketing;
