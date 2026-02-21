import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiVolumeX, FiVolume2 } from "react-icons/fi";
import referEarnVideo from "../../assets/Refer & Earn.mp4";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

// ReferEligibilityModal component removed as it's now a separate page

const ReferEarn = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // 1. Play muted first (Browsers ALWAYS allow this)
      video.muted = true;
      video.play().then(() => {
        // 2. Once playing, try to unmute
        // If this fails, the video keeps playing but stays muted
        video.muted = false;
        setIsMuted(false);
      }).catch(error => {
        console.warn("Autoplay was blocked even while muted. This usually means a slow connection or low power mode.", error);
      });
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    video.muted = next;
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8 px-4 py-4 md:py-6 sm:px-6 lg:px-8">
        {/* Section 1: Hero Text + Video */}
        <motion.section
          className="flex flex-col items-center text-center py-4 md:py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto px-5 flex flex-col items-center gap-1.5">
            <div className="flex flex-col items-center w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative group cursor-default mb-2"
              >
                {/* Outer Glow Aura */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Rotating Conic Border effect */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#10b981_360deg)] opacity-40"
                  />

                  {/* Inner background to keep content clear */}
                  <div className="absolute inset-[1px] bg-slate-950 rounded-full z-[1]" />

                  <div className="relative z-10 flex items-center gap-2.5">
                    <div className="flex items-center">
                      <div className="relative w-2 h-2">
                        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <div className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                      </div>
                    </div>

                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                      Refer &amp; Earn
                    </span>

                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight md:leading-[1.2] max-w-3xl mx-auto">
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Earn up to 0.5% of property value
                </span>
              </h1>



              <p className="max-w-xl text-xs md:text-sm text-slate-300 mt-1 mx-auto leading-relaxed">
                Share trusted real estate opportunities with your circle and get
                rewarded when they buy through Bada Builder.
              </p>
            </div>

            <motion.div
              className="mt-2 relative rounded-2xl bg-slate-900/60 shadow-xl shadow-emerald-500/20 border border-slate-700/60 p-3 w-full max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-auto aspect-video object-contain rounded-xl bg-black"
                  controls
                  playsInline
                  autoPlay
                  muted
                  loop
                >
                  <source src={referEarnVideo} type="video/mp4" />
                </video>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Section 2: How It Works */}
        <section className="space-y-8 md:space-y-10 px-5 md:px-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold relative inline-block">
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                How it works
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </h2>
          </motion.div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            {[
              {
                title: "Share your property link",
                desc: "Invite your friends and family to explore curated properties.",
              },
              {
                title: "Your friend buys property",
                desc: "They complete a successful purchase through Bada Builder.",
              },
              {
                title: "You earn rewards",
                desc: "Get up to 0.5% of the property value as referral bonus.",
              },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                className="relative overflow-hidden rounded-2xl bg-white/5 p-6 md:px-4 md:py-5 shadow-lg shadow-slate-900/40 backdrop-blur-xl border border-white/10 group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                whileHover={{ y: -6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-cyan-400/5 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-row md:flex-col gap-5 md:gap-3 items-center md:items-start">
                  <div className="flex-shrink-0 inline-flex h-10 w-10 md:h-7 md:w-7 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-semibold text-emerald-200">
                    0{idx + 1}
                  </div>
                  <div className="space-y-1.5 md:space-y-2 text-left">
                    <h3 className="text-base md:text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-xs text-slate-300 md:text-slate-300 leading-relaxed md:leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3 & 4: Eligibility + Reward Details */}
        <section className="grid gap-8 md:gap-12 lg:grid-cols-[1.1fr,0.9fr] px-5 md:px-0">
          <motion.div
            className="rounded-2xl bg-white/5 p-5 border border-white/10 shadow-lg shadow-slate-900/40"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-3"
            >
              <h2 className="text-lg font-bold relative inline-block">
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Eligibility criteria
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </h2>
            </motion.div>
            <div className="space-y-4 md:space-y-3">
              {[
                "Must be an existing Bada Builder customer",
                "Must have purchased at least one property",
                "Valid PAN & registered mobile number required",
                "Must agree to Refer & Earn Terms & Conditions",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-[13px] md:text-sm text-slate-200 group"
                >
                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl bg-white/5 p-5 border border-white/10 shadow-lg shadow-slate-900/40"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-3"
            >
              <h2 className="text-lg font-bold relative inline-block">
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Reward details
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </h2>
            </motion.div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reward Amount</p>
                  <p className="text-xl md:text-lg font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                    Up to 0.5% Value
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="text-slate-400">Credit Timeline:</span>
                  <span className="font-semibold text-sky-400">~XX Business Days</span>
                </p>
                <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed italic">
                  * Final payout timelines are communicated upon eligibility confirmation.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 5 & 6: Terms + CTA */}
        <section className="space-y-10 md:space-y-12 px-5 md:px-0">
          <div className="rounded-2xl bg-white/5 p-5 border border-white/10 shadow-lg shadow-slate-900/40">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-2"
            >
              <h2 className="text-lg font-bold relative inline-block">
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Terms &amp; Conditions
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </h2>
            </motion.div>
            <p className="text-sm text-slate-300 mb-3">
              By proceeding, you confirm that you understand and agree to the
              full Refer &amp; Earn program terms, including payout timelines,
              eligibility checks, and compliance with applicable regulations.
            </p>
            <label className="flex items-start gap-4 md:gap-2 text-sm text-slate-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 md:mt-0.5 h-5 w-5 md:h-4 md:w-4 rounded border-slate-400 bg-slate-900 text-emerald-400 focus:ring-emerald-500"
              />
              <span>I agree to the Terms &amp; Conditions.</span>
            </label>
            <div className="pt-6 mt-6 border-t border-white/5 flex justify-center md:justify-start">
              <button
                type="button"
                disabled={!termsAccepted}
                onClick={() => navigate("/refer-earn/eligibility-result")}
                className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 px-8 py-4 md:px-6 md:py-3 text-base md:text-sm font-bold md:font-semibold text-slate-950 shadow-xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:shadow-none disabled:cursor-not-allowed"
              >
                Check Eligibility
              </button>
            </div>
          </div>
        </section>
      </div >
    </div >
  );
};

export default ReferEarn;

