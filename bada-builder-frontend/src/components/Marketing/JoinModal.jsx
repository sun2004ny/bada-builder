import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const JoinModal = ({ isOpen, onClose, title, subtitle, children }) => {
    // 4️⃣ Close modal logic inside component
    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="join-modal-overlay-premium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(5, 10, 20, 0.8)', // ✅ 1️⃣ Dark backdrop theme
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 11000, // ✅ Fixed: Higher than site header (10000)
                        padding: '20px'
                    }}
                >
                    <motion.div
                        className="join-modal-container-premium"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '85vh', // Slightly reduced to avoid cramped screens
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #0B1C2D 0%, #020617 100%)',
                            border: '1px solid rgba(56, 189, 248, 0.15)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 12000, // ✅ Fixed: Higher than backdrop
                            marginTop: '20px' // Ensure some vertical clearance
                        }}
                    >
                        {/* ✅ 2️⃣ Proper Visible Cross Button (Inside Container) */}
                        <motion.button
                            type="button"
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '18px',
                                right: '18px',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                zIndex: 13000, // ✅ Fixed: Higher than modal content
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(8px)', // ✅ 2️⃣ Backdrop blur
                                border: '1px solid rgba(56, 189, 248, 0.3)', // ✅ 2️⃣ subtle glow border
                                color: '#FFFFFF', // ✅ 2️⃣ White icon color
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer', // ✅ 2️⃣ Cursor pointer
                                transition: 'all 0.3s ease', // ✅ 2️⃣ Smooth transition
                                padding: 0,
                                outline: 'none'
                            }}
                            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)', background: 'rgba(255, 255, 255, 0.15)' }} // ✅ 2️⃣ Hover effect
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaTimes style={{ fontSize: '20px' }} />
                        </motion.button>

                        <div className="join-modal-header-premium" style={{ padding: '32px 32px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'transparent' }}>
                            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em' }}>
                                {title}
                            </h3>
                            <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#94A3B8' }}>
                                {subtitle}
                            </p>
                            <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #0EA5E9, transparent)', marginTop: '16px', borderRadius: '2px' }}></div>
                        </div>

                        <div className="join-modal-scroll-content" style={{ overflowY: 'auto', padding: '32px', flex: 1 }}>
                            {/* Scrollbar Styling for Webkit */}
                            <style>{`
                                .join-modal-scroll-content::-webkit-scrollbar { width: 6px; }
                                .join-modal-scroll-content::-webkit-scrollbar-track { background: transparent; }
                                .join-modal-scroll-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                                .join-modal-scroll-content::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.4); }
                            `}</style>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default JoinModal;
