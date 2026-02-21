import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import ReferEarnCard from "./ReferEarnCard";
import ReferLocationFilter from "./ReferLocationFilter";
import { referEarnAPI } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

const DetailItem = ({ label, value, icon, className = "" }) => (
    <div className={`p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group ${className}`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 transition-colors group-hover:text-emerald-600">{label}</p>
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-lg group-hover:scale-110 group-hover:text-emerald-600 transition-all duration-300">
                {icon}
            </div>
            <p className="text-[13px] font-bold text-slate-700 break-words leading-tight">{value || "--"}</p>
        </div>
    </div>
);

const ReferEarnResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [pan, setPan] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    // Auto-restore eligibility state from session
    const [result, setResult] = useState(() => {
        try {
            const saved = sessionStorage.getItem("referEarnResult");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse referEarnResult from session storage", e);
            return null;
        }
    });

    const [view, setView] = useState(() => {
        return sessionStorage.getItem("referEarnResult") ? "purchased" : "form";
    });

    const [selectedLocation, setSelectedLocation] = useState("");

    const handleBack = () => {
        navigate("/refer-earn");
    };

    const validatePanAndMobile = () => {
        const trimmedPan = pan.trim().toUpperCase();
        const trimmedMobile = mobile.trim();

        if (!trimmedPan || !panRegex.test(trimmedPan)) {
            setError("Please enter a valid PAN (e.g. ABCDE1234F).");
            return null;
        }

        if (!/^[0-9]{10}$/.test(trimmedMobile)) {
            setError("Please enter a valid 10-digit mobile number.");
            return null;
        }

        setError("");
        return { pan: trimmedPan, mobile: trimmedMobile };
    };

    const handleSendOtp = async () => {
        const validated = validatePanAndMobile();
        if (!validated) return;

        try {
            setLoading(true);
            setError("");
            setInfo("Checking eligibility...");

            // The backend /send-otp already checks eligibility first
            await axios.post(`${API_URL}/refer-earn/send-otp`, validated);

            setOtpSent(true);
            setInfo("OTP sent. Please enter it below.");
        } catch (err) {
            const message = err.response?.data?.error || "Failed to process request.";
            setError(message);
            setInfo("");

            // If the error message indicates ineligibility, we stop here as requested
            if (message.includes("not eligible")) {
                setView("ineligible");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndCheck = async () => {
        const validated = validatePanAndMobile();
        if (!validated) return;

        if (!otp || otp.trim().length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setInfo("Verifying and fetching your investment data...");

            const response = await axios.post(`${API_URL}/refer-earn/check`, {
                ...validated,
                otp: otp.trim(),
            });

            const data = response.data;

            if (data.eligible) {
                // Fetch posted properties to merge
                let postedProperties = [];
                try {
                    postedProperties = await referEarnAPI.getPostedProperties(true);
                } catch (e) {
                    console.error("Failed to fetch posted properties", e);
                }

                // 1. Normalize Isolated Properties
                const normalizedPosted = (postedProperties || []).map(p => ({
                    id: `posted-${p.id}`,
                    title: p.property_name,
                    price: p.price,
                    location: p.location,
                    type: p.property_type || 'Property',
                    description: p.description,
                    image: p.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                    source: 'refer-earn',
                    isIsolated: true
                }));

                // 2. Normalize Main Properties
                const normalizedAdmin = (data.adminReferralProperties || []).map(p => ({
                    id: `main-${p.id}`,
                    title: p.title || p.project_name,
                    price: p.group_price || p.regular_price_min || p.price || 'Price on Request',
                    location: p.location || p.project_location || 'Location Not Specified',
                    type: p.property_type || p.type || 'Property',
                    image: p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    source: 'refer-earn',
                    isIsolated: false
                }));

                // 3. Merge
                data.combinedReferralProperties = [...normalizedAdmin, ...normalizedPosted];

                setResult(data);
                sessionStorage.setItem("referEarnResult", JSON.stringify(data));
                setView("eligible");
            } else {
                setError(data.reason || "Eligibility check failed.");
                setView("ineligible");
            }

            setInfo("");
        } catch (err) {
            const message =
                err.response?.data?.error ||
                "Verification failed. Please check the OTP and try again.";
            setError(message);
            setInfo("");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className={`min-h-screen relative overflow-hidden font-sans selection:bg-emerald-500/30 transition-colors duration-700 ${view === 'form' ? 'bg-[#050b1a] bg-gradient-to-br from-[#050b1a] via-[#0a1a35] to-[#050b1a]' : 'bg-gray-50'}`}>
            {/* Ambient Background Glows - Only visible in dark mode (form) */}
            {view === 'form' && (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                </>
            )}

            <div className="relative z-10 w-full pt-2 md:pt-4 pb-8 px-4 md:px-10 min-h-screen flex flex-col">
                <div className="flex flex-col gap-3 mb-8 relative z-[100]">
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => navigate("/")}
                        className="w-fit flex items-center gap-2 !text-white !bg-[#1e293b] hover:!bg-[#334155] border border-[#334155] py-2 px-4 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 hover:!text-[#38BDF8] hover:-translate-x-1 shadow-lg"
                    >
                        <FaArrowLeft className="text-[#38BDF8]" /> Back to Home
                    </motion.button>

                    {view === "purchased" && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setView("eligible")}
                            className="w-fit flex items-center gap-2 bg-[#E5EDFB] text-[#2B4C7E] h-10 px-4 rounded-lg font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-[#d0deef] transition-all duration-300 shadow-md whitespace-nowrap"
                        >
                            Back to Profile
                        </motion.button>
                    )}
                </div>

                <div className="flex-grow flex items-start justify-center pt-0">
                    <AnimatePresence mode="wait">
                        {view === "form" && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                className="w-full max-w-xl bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
                            >
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
                                <div className="flex items-center justify-center gap-4 mb-10 relative z-10">
                                    <div className="text-left">
                                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                            >
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040 12.02 12.02 0 00-3 9c1.357 6.922 9.176 8.654 11.618 8.43 2.442.224 10.261-1.508 11.618-8.43a12.02 12.02 0 00-3-9z" />
                                                </svg>
                                            </motion.div> Refer & Earn Program
                                        </h2>
                                        <p className="text-white/40 font-bold uppercase tracking-[0.1em] text-[10px]">Verify eligibility to unlock rewards</p>
                                    </div>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 block">PAN Number</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={pan}
                                                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                                                    disabled={otpSent || loading}
                                                    placeholder="ABCDE1234F"
                                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-black tracking-widest outline-none focus:bg-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-white/5 uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 block">Mobile Number</label>
                                            <input
                                                type="tel"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                                                disabled={otpSent || loading}
                                                maxLength={10}
                                                placeholder="9876543210"
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-black tracking-widest outline-none focus:bg-white/10"
                                            />
                                        </div>
                                    </div>

                                    {otpSent && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <label className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">6-Digit Secure OTP</label>
                                            <input
                                                placeholder="000 000"
                                                type="tel"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                                maxLength={6}
                                                className="w-full h-16 bg-white/5 border-2 border-emerald-500/30 rounded-[1.5rem] text-3xl tracking-[0.4em] font-black text-center text-white outline-none"
                                            />
                                        </motion.div>
                                    )}

                                    <div className="pt-8">
                                        <motion.button
                                            whileHover="hover"
                                            whileTap="tap"
                                            initial="initial"
                                            onClick={otpSent ? handleVerifyAndCheck : handleSendOtp}
                                            disabled={loading}
                                            className="w-full h-16 rounded-full flex items-center justify-center relative overflow-hidden group shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] border border-white/10"
                                            style={{
                                                background: '#0f172a',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {/* 🌫️ Dynamic Rotating Background Mesh */}
                                            <div className="absolute inset-0 opacity-100 transition-opacity duration-700">
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 180, 360],
                                                    }}
                                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -top-1/2 -left-1/2 w-200% h-200% bg-[conic-gradient(from_0deg,#10b981_0%,transparent_40%,#059669_50%,transparent_90%,#10b981_100%)] opacity-30 blur-2xl"
                                                />
                                            </div>

                                            {/* ✨ Continuous Vortex Shine */}
                                            <motion.div
                                                variants={{
                                                    initial: { x: "-100%", skewX: -25 },
                                                    hover: { x: "200%", skewX: -25 }
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                                                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none"
                                            />

                                            <span className="relative z-10 text-white font-black uppercase tracking-[0.4em] text-[10px] group-hover:tracking-[0.5em] transition-all duration-500">
                                                {loading ? (
                                                    <div className="flex items-center gap-3">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                                                        />
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        {otpSent ? "Verify & Unlock Rewards" : "Verify Eligibility"}
                                                        <motion.svg
                                                            variants={{ hover: { x: 5 } }}
                                                            className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </motion.svg>
                                                    </div>
                                                )}
                                            </span>

                                            {/* Static Base Layer to ensure color when mesh is subtle */}
                                            <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors" />
                                        </motion.button>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 text-[10px] font-bold mt-5 text-center uppercase tracking-widest bg-red-500/10 py-3 rounded-2xl border border-red-500/20"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === "eligible" && result && (
                            <motion.div
                                key="eligible"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full space-y-6"
                            >
                                <motion.div
                                    className="bg-white rounded-[2.5rem] shadow-2xl p-5 md:p-10 border border-slate-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">

                                        {/* Top Section: Icon & Title in one row on mobile */}
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200 flex items-center justify-center text-white shrink-0">
                                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                                            </div>

                                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8">
                                                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                                                    Eligibility <span className="text-emerald-500">Confirmed!</span>
                                                </h2>
                                                <div className="hidden lg:block w-px h-8 bg-slate-100" />
                                            </div>
                                        </div>

                                        {/* Middle Section: Badges */}
                                        <div className="flex flex-wrap items-center gap-3 justify-start lg:translate-y-1">
                                            <span className="px-5 py-2 md:px-6 md:py-2.5 bg-slate-900 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] rounded-full shadow-xl">
                                                Verified Member
                                            </span>
                                            <span className="px-5 py-2 md:px-6 md:py-2.5 bg-emerald-50 text-emerald-600 text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] rounded-full border border-emerald-200">
                                                Portfolio Access Unlocked
                                            </span>
                                        </div>

                                        {/* Action Button: Full width on mobile, auto on desktop */}
                                        <motion.button
                                            whileHover="hover"
                                            whileTap="tap"
                                            initial="initial"
                                            onClick={() => setView("purchased")}
                                            className="w-full md:w-auto px-8 md:px-12 h-16 md:h-20 rounded-2xl md:rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 md:gap-6 group relative overflow-hidden border border-white/10"
                                            style={{ background: '#0f172a', cursor: 'pointer' }}
                                        >
                                            <motion.div
                                                variants={{ initial: { x: "-100%", skewX: -20 }, hover: { x: "200%", skewX: -20 } }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                                                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none"
                                            />
                                            <span className="relative z-10 text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-[12px]">
                                                Begin Referring Now
                                            </span>
                                            <motion.div
                                                variants={{ hover: { scale: 1.1, rotate: 5, backgroundColor: '#10b981' } }}
                                                className="relative z-10 w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5"
                                            >
                                                <motion.svg animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </motion.svg>
                                            </motion.div>
                                        </motion.button>
                                    </div>
                                </motion.div>

                                <motion.div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[380px]">
                                        <div className="p-8 md:p-10 flex flex-col justify-center space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                                                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-[0.2em]">Member Profile</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <DetailItem label="Full Name" value={result.investor_name} icon="👤" />
                                                <DetailItem label="Mobile" value={result.investor_phone} icon="📞" />
                                                <DetailItem label="Email Address" value={result.investor_email} icon="✉️" />
                                                <DetailItem label="Unit details" value={result.unit_details} icon="🔑" />
                                            </div>
                                        </div>
                                        <div className="relative group overflow-hidden bg-slate-900 min-h-[320px]">
                                            {(() => {
                                                const projectName = (result.project_name || result.property_name || "").toLowerCase();
                                                const matchedProperty =
                                                    (result.liveGroupingProperties || []).find(p => (p.title || "").toLowerCase() === projectName) ||
                                                    (result.adminReferralProperties || []).find(p => (p.title || "").toLowerCase() === projectName);

                                                const displayImage = matchedProperty?.image || result.property_image;

                                                return (
                                                    <img
                                                        src={displayImage}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        alt={result.project_name || "Purchased Property"}
                                                        onError={(e) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop";
                                                            e.target.className = "absolute inset-0 w-full h-full object-cover opacity-40 grayscale";
                                                        }}
                                                    />
                                                );
                                            })()}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-8 md:p-10 flex flex-col justify-end">
                                                <div className="space-y-4">
                                                    {/* Premium Location Badge */}
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-lg border border-emerald-500/30">
                                                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                        </svg>
                                                        <span className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.15em]">
                                                            {result.location}
                                                        </span>
                                                    </div>

                                                    {/* Bold Project Title */}
                                                    <div className="space-y-1">
                                                        <h4 className="text-white text-3xl md:text-4xl font-black uppercase leading-none tracking-tight drop-shadow-2xl">
                                                            {result.project_name || result.property_name}
                                                        </h4>
                                                        <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {view === "purchased" && result && (
                            <motion.div key="purchased" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-10 px-4">
                                <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 relative z-50">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-[#2B4C7E] text-xl md:text-2xl font-bold tracking-wider uppercase leading-none">
                                                    Begin Referring Now
                                                </h2>
                                            </div>
                                            <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-[9px] md:text-[10px] ml-4">
                                                Earn exclusive rewards by referring these hand-picked properties
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                            <ReferLocationFilter
                                                properties={result.combinedReferralProperties || []}
                                                selectedLocation={selectedLocation}
                                                onLocationSelect={setSelectedLocation}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {(result.combinedReferralProperties || [])
                                        .filter(p => {
                                            if (!selectedLocation) return true;
                                            const propLoc = p?.location?.split(',')[0]?.trim()?.toLowerCase() || "";
                                            const searchLoc = selectedLocation?.trim()?.toLowerCase() || "";
                                            return propLoc.includes(searchLoc);
                                        })
                                        .map((prop, idx) => (
                                            <motion.div
                                                key={prop.id || idx}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <ReferEarnCard property={prop} />
                                            </motion.div>
                                        ))}
                                </div>
                            </motion.div>
                        )}

                        {view === "ineligible" && (
                            <motion.div key="ineligible" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-xl text-center space-y-8">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-4xl">⚠️</div>
                                <h2 className="text-3xl font-black text-gray-900">Not Eligible</h2>
                                <p className="text-gray-500 font-medium">{error || "Verification failed."}</p>
                                <button onClick={() => setView("form")} className="px-10 h-16 bg-slate-900 text-white font-black uppercase rounded-xl transition-all">Try Again</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >
            </div >
        </div >
    );
};

export default ReferEarnResult;
