import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCameraRetro, FaChartLine, FaCheckCircle, FaSpinner, FaChevronRight, FaPaperPlane, FaUserShield, FaGem, FaUserTie, FaShareAlt, FaHandshake, FaBullhorn, FaAward, FaUsers, FaLock } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import photographerVideo from "../../assets/marketing videos/photographer.mp4";
import realEstateVideo from "../../assets/marketing videos/Real-Estate-Agent.mp4";
import influencerVideo from "../../assets/marketing videos/Influencer.mp4";
import './JoinPhotographer.css';

// Import New Components
import JoinModal from '../../components/Marketing/JoinModal';
import PhotographerForm from '../../components/Marketing/PhotographerForm';
import RealEstateForm from '../../components/Marketing/RealEstateForm';
import InfluencerForm from '../../components/Marketing/InfluencerForm';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

const BenefitItem = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        className="benefit-item-v3"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="benefit-icon-v3"><Icon /></div>
        <div className="benefit-text">
            <h4>{title}</h4>
            <p>{desc}</p>
        </div>
    </motion.div>
);

const MarketingSection = ({
    id,
    title,
    subtitle,
    benefits,
    ctaText,
    onCtaClick,
    videoSrc,
    badgeText,
    badgeIcon: BadgeIcon,
    hasApplied,
    statusLoading,
    statNumber,
    statLabel,
    reverse = false
}) => (
    <section className={`marketing-hero-section ${id}`} id={id}>
        <div className="section-glow-accent"></div>
        <div className={`join-photographer-content ${reverse ? 'reverse-layout' : ''}`}>
            <motion.div
                className="photographer-text-content"
                initial={{ opacity: 0, x: reverse ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="selective-badge">
                    <BadgeIcon /> {badgeText}
                </div>

                <h2 className="premium-heading">
                    {title.main} <br />
                    <span>{title.highlight}</span>
                </h2>

                <p className="photographer-subtitle premium">
                    {subtitle}
                </p>

                <div className="premium-benefit-list">
                    {benefits.map((benefit, index) => (
                        <BenefitItem
                            key={index}
                            icon={benefit.icon}
                            title={benefit.title}
                            desc={benefit.desc}
                            delay={0.2 + (index * 0.1)}
                        />
                    ))}
                </div>

                <div className="cta-wrapper">
                    <button
                        className={`apply-now-btn-v3 ${hasApplied ? 'applied' : ''}`}
                        onClick={onCtaClick}
                        disabled={statusLoading || hasApplied}
                    >
                        {statusLoading ? <FaSpinner className="spinner" /> : (
                            hasApplied ? <><FaCheckCircle /> Application Received</> : (
                                <>{ctaText} <FaChevronRight className="btn-icon-right" /></>
                            )
                        )}
                    </button>
                </div>
            </motion.div>

            <motion.div
                className="photographer-visual-v3"
                initial={{ opacity: 0, scale: 0.9, x: reverse ? -40 : 40 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="visual-card-premium-v3">
                    <div className="card-glass-glow"></div>
                    <video
                        src={videoSrc}
                        className="visual-image-premium"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <motion.div
                        className="floating-stat-card-v3"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className="stat-number">{statNumber}</span>
                        <span className="stat-label">{statLabel}</span>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    </section>
);

const JoinPhotographer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRole, setActiveRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasApplied, setHasApplied] = useState({
        photographer: false,
        'real-estate': false,
        'influencer': false
    });
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // 🎯 Robust Effect: Fetches application status for all roles
    useEffect(() => {
        let isMounted = true;
        const checkStatus = async () => {
            if (!isAuthenticated) return;
            setStatusLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const token = localStorage.getItem('token');
                if (!token) return;

                const [photoResponse, marketingResponse] = await Promise.all([
                    fetch(`${API_URL}/photographer/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/marketing-signup/status`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!photoResponse.ok || !marketingResponse.ok) throw new Error('Status check failed');

                const photoData = await photoResponse.json();
                const marketingData = await marketingResponse.json();

                if (isMounted) {
                    setHasApplied({
                        photographer: !!photoData.applied,
                        'real-estate': !!marketingData['real-estate'],
                        'influencer': !!marketingData['influencer']
                    });
                }
            } catch (error) {
                console.error('❌ Status check failed:', error);
            } finally {
                if (isMounted) setStatusLoading(false);
            }
        };
        checkStatus();
        return () => { isMounted = false; };
    }, [isAuthenticated, user?.email]); // Re-run on auth change

    const handleApplyClick = (role) => {
        if (hasApplied[role]) {
            showToast('Application already received for this role.', 'info');
            return;
        }
        if (isAuthenticated) {
            setActiveRole(role);
            setAlreadyRegistered(false);
            setIsModalOpen(true);
        } else {
            navigate('/login', {
                state: {
                    from: location.pathname,
                    scrollToSection: true,
                    message: `Join our elite network by logging in first.`
                }
            });
        }
    };

    const handleFormSubmit = async (formData) => {
        if (isLoading || hasApplied[activeRole]) return;
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            let endpoint = '';

            // Payload Sanitization
            const payload = {};
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (typeof value === 'string' && value.trim() === '') return;
                if (key === 'experience' || key === 'followers') {
                    payload[key] = parseInt(value) || 0;
                    return;
                }
                const urlKeys = ['website', 'driveLink', 'metaLink'];
                if (urlKeys.includes(key)) {
                    if (!/^https?:\/\//i.test(value)) {
                        if (key === 'website') return;
                    }
                }
                payload[key] = value;
            });

            // Determine endpoint based on activeRole
            if (activeRole === 'photographer') endpoint = '/photographer/register';
            else if (activeRole === 'real-estate') endpoint = '/marketing-signup/real-estate-agent/register';
            else if (activeRole === 'influencer') endpoint = '/marketing-signup/influencer/register';

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.alreadyRegistered) {
                setAlreadyRegistered(true);
                setHasApplied(prev => ({ ...prev, [activeRole]: true }));
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                if (response.status === 400 && data.error?.toLowerCase().includes('already')) {
                    setAlreadyRegistered(true);
                    setHasApplied(prev => ({ ...prev, [activeRole]: true }));
                    setIsLoading(false);
                    return;
                }
                throw new Error(data.error || (data.errors && data.errors[0]?.msg) || 'Submission failed');
            }

            // Success Flow
            setIsSuccess(true);
            setHasApplied(prev => ({ ...prev, [activeRole]: true }));
            showToast('Application Submitted Successfully!', 'success');
            setIsModalOpen(false);
            setIsLoading(false);
            setIsSuccess(false);

        } catch (error) {
            console.error('❌ Submission Error:', error);
            showToast(error.message, 'error');
            setIsLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
    };

    return (
        <div className="marketing-stacked-container">
            {/* Unified Loading Overlay - Restored to Old Design */}
            <LoadingOverlay
                isSubmitting={isLoading}
                text="Processing Application..."
            />

            {/* SECTION 1: Photographer */}
            <MarketingSection
                id="photographer"
                title={{ main: "We’re Hiring Elite", highlight: "Real Estate Photographers" }}
                subtitle="Work with premium developers and capture landmark properties. We selectively partner with the industry’s finest lensmen to maintain our unmatched standard of luxury marketing."
                ctaText="Apply as Photographer"
                onCtaClick={() => handleApplyClick('photographer')}
                videoSrc={photographerVideo}
                badgeText="Exclusive Opportunity"
                badgeIcon={FaGem}
                hasApplied={hasApplied.photographer}
                statusLoading={statusLoading}
                statNumber="4K+"
                statLabel="Luxury Shoots"
                benefits={[
                    { icon: FaCameraRetro, title: "Luxury Property Shoots", desc: "Access highly exclusive high-ticket developer projects." },
                    { icon: FaChartLine, title: "Consistent Pipeline", desc: "Reliable project flow directly through our centralized platform." },
                    { icon: FaUserShield, title: "Elite Partnerships", desc: "Long-term collaboration with a market-leading real estate brand." }
                ]}
            />

            {/* SECTION 2: Real Estate Agent (Developer) */}
            <MarketingSection
                id="real-estate"
                title={{ main: "Partner With", highlight: "Premium Developers" }}
                subtitle="Join our luxury property network and gain exclusive access to qualified buyers and high-ticket listings. Scale your business with our premium marketing tools and developer connections."
                ctaText="Apply as Real Estate Agent"
                onCtaClick={() => handleApplyClick('real-estate')}
                videoSrc={realEstateVideo}
                badgeText="Partner Program"
                badgeIcon={FaHandshake}
                hasApplied={hasApplied['real-estate']}
                statusLoading={statusLoading}
                statNumber="250+"
                statLabel="Global Agents"
                reverse={true}
                benefits={[
                    { icon: FaUsers, title: "Verified Buyer Pipeline", desc: "Gain access to a curated list of high-intent luxury property seekers." },
                    { icon: FaUserTie, title: "Exclusive Developer Access", desc: "Direct connection to landmark projects before they hit the market." },
                    { icon: FaAward, title: "Luxury Brand Exposure", desc: "Leverage our premium brand positioning to elevate your personal profile." }
                ]}
            />

            {/* SECTION 3: Influencer */}
            <MarketingSection
                id="influencer"
                title={{ main: "Collaborate With a", highlight: "Luxury Property Brand" }}
                subtitle="Work with high-end real estate projects and monetize your audience with premium collaborations. We provide the stage, you bring the creative vision."
                ctaText="Apply as Influencer"
                onCtaClick={() => handleApplyClick('influencer')}
                videoSrc={influencerVideo}
                badgeText="Influencer Program"
                badgeIcon={FaBullhorn}
                hasApplied={hasApplied.influencer}
                statusLoading={statusLoading}
                statNumber="10M+"
                statLabel="Total Reach"
                benefits={[
                    { icon: FaShareAlt, title: "Paid Brand Campaigns", desc: "Competitive compensation for high-quality content and audience reach." },
                    { icon: FaCameraRetro, title: "Exclusive Property Previews", desc: "First-look access to the most stunning architectural marvels." },
                    { icon: FaHandshake, title: "Long-term Partnerships", desc: "Build a lasting relationship with a prestigious real estate ecosystem." }
                ]}
            />

            <JoinModal
                isOpen={isModalOpen}
                onClose={() => !isLoading && setIsModalOpen(false)}
                title={alreadyRegistered ? "Status: Confirmed" : (activeRole === 'photographer' ? "Elite Photographer Application" : (activeRole === 'real-estate' ? "Real Estate Partner Program" : "Influencer Collaboration"))}
                subtitle={alreadyRegistered ? "Your application is already in our system" : (activeRole === 'photographer' ? "Join our exclusive circle of creative partners" : (activeRole === 'real-estate' ? "Scale your business with our premium tools" : "Collaborate on luxury real estate campaigns"))}
            >
                {alreadyRegistered ? (
                    <motion.div
                        className="already-registered-badge-v3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="success-circle-check">
                            <FaCheckCircle />
                        </div>
                        <h3>Application Received</h3>
                        <p>Our team is currently reviewing your professional profile. We will contact you shortly via email.</p>
                        <button className="close-status-btn" onClick={() => setIsModalOpen(false)}>Close Window</button>
                    </motion.div>
                ) : (
                    <>
                        {activeRole === 'photographer' && <PhotographerForm onSubmit={handleFormSubmit} isLoading={isLoading} />}
                        {activeRole === 'real-estate' && <RealEstateForm onSubmit={handleFormSubmit} isLoading={isLoading} />}
                        {activeRole === 'influencer' && <InfluencerForm onSubmit={handleFormSubmit} isLoading={isLoading} />}
                    </>
                )}
            </JoinModal>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        className={`toast-premium ${toast.type}`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                    >
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaPaperPlane />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .marketing-stacked-container { background: #020617; }
                .marketing-hero-section { padding: 8px 24px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
                .section-glow-accent { position: absolute; top: 20%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%); filter: blur(100px); pointer-events: none; }
                .join-photographer-content { max-width: 1280px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: center; }
                .reverse-layout { grid-template-columns: 0.9fr 1.1fr; }
                .reverse-layout .photographer-text-content { order: 2; }
                .reverse-layout .photographer-visual-v3 { order: 1; }
                .selective-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 8px 16px; border-radius: 100px; color: #38BDF8; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
                .premium-heading { font-size: clamp(32px, 5vw, 48px); font-weight: 900; line-height: 1.1; color: #FFF; margin-bottom: 8px; }
                .premium-heading span { background: linear-gradient(90deg, #38BDF8, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .photographer-subtitle.premium { font-size: 18px; color: #94A3B8; max-width: 580px; line-height: 1.7; margin-bottom: 16px; }
                .premium-benefit-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
                .benefit-item-v3 { display: flex; gap: 20px; }
                .benefit-icon-v3 { width: 48px; height: 48px; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #38BDF8; font-size: 20px; flex-shrink: 0; }
                .benefit-text h4 { font-size: 16px; font-weight: 700; color: #F1F5F9; margin: 0 0 4px 0; }
                .benefit-text p { font-size: 14px; color: #64748B; margin: 0; line-height: 1.5; }
                .apply-now-btn-v3 { background: #FFF; color: #020617; border: none; padding: 18px 42px; border-radius: 100px; font-weight: 800; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 12px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
                .apply-now-btn-v3:hover:not(:disabled) { transform: translateY(-4px) scale(1.02); box-shadow: 0 25px 50px -12px rgba(56, 189, 248, 0.2); background: #38BDF8; color: #FFF; }
                .apply-now-btn-v3.applied { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10B981; cursor: default; box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
                .visual-card-premium-v3 { position: relative; padding: 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px; overflow: hidden; box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8); }
                .visual-image-premium { width: 100%; border-radius: 24px; display: block; filter: saturate(1.1); }
                .floating-stat-card-v3 { position: absolute; bottom: 40px; left: -20px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.2); padding: 16px 24px; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); z-index: 10; }
                .already-registered-badge-v3 { padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; background: rgba(255, 255, 255, 0.02); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); }
                .already-registered-badge-v3 h3 { font-size: 24px; font-weight: 800; color: #FFF; margin-bottom: 12px; }
                .already-registered-badge-v3 p { color: #94A3B8; font-size: 16px; line-height: 1.6; max-width: 320px; margin-bottom: 32px; }
                .close-status-btn { background: rgba(255, 255, 255, 0.05); color: #FFF; border: 1px solid rgba(255, 255, 255, 0.1); padding: 12px 32px; border-radius: 100px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .close-status-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }

                @media (max-width: 991px) {
                    .join-photographer-content { grid-template-columns: 1fr !important; gap: 12px; text-align: center; }
                    .photographer-text-content { order: 2 !important; }
                    .photographer-visual-v3 { order: 1 !important; }
                    .premium-heading, .photographer-subtitle.premium { text-align: center; }
                    .photographer-subtitle.premium { margin-left: auto; margin-right: auto; }
                    .premium-benefit-list { align-items: center; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; }
                    .floating-stat-card-v3 { left: 20px !important; right: auto !important; bottom: 20px; }
                }
            `}} />
        </div>
    );
};

export default JoinPhotographer;
