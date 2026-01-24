import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import bgVideo from "../assets/realestate_video.mp4";
import MotionBackground from "../components/MotionBackground";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState(""); // Token from verify-otp

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await axios.post(`${API_URL}/forgot-password/send-otp`, { email });
            setSuccess("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP. User may not exist.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${API_URL}/forgot-password/verify-otp`, {
                email,
                otp
            });

            setResetToken(response.data.resetToken); // Store token for step 3
            setSuccess("OTP Verified! Please set your new password.");
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await axios.post(`${API_URL}/forgot-password/reset-password`, {
                email,
                newPassword,
                resetToken
            });

            setSuccess("Password reset successfully!");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login", {
                    state: { message: "Password reset successfully. Please login with your new password." }
                });
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <video autoPlay loop muted playsInline id="bg-video">
                <source src={bgVideo} type="video/mp4" />
            </video>
            <div className="login-overlay" />
            <MotionBackground />

            <motion.div
                className="glass-card"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="login-header">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {step === 1 && "Forgot Password"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Reset Password"}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && `Enter the OTP sent to ${email}`}
                        {step === 3 && "Create a new secure password"}
                    </motion.p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="error-box"
                            style={{ marginBottom: '20px' }}
                        >
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="error-box success-login"
                            style={{
                                marginBottom: '20px',
                                background: '#ecfdf5',
                                borderColor: '#a7f3d0',
                                color: '#059669'
                            }}
                        >
                            <span>{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="login-form">
                        <div className="floating-label-group">
                            <input
                                type="email"
                                className="floating-input"
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <label className="floating-label">Email Address</label>
                        </div>

                        <motion.button
                            className="submit-btn"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <div className="spinner"></div> : "Send OTP"}
                        </motion.button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <div className="floating-label-group">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="floating-input"
                                placeholder=" "
                                maxLength={6}
                                disabled={loading}
                                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "5px" }}
                                autoFocus
                            />
                            <label className="floating-label" style={{ left: "50%", transform: "translateX(-50%)" }}>Enter 6-digit OTP</label>
                        </div>

                        <motion.button
                            className="submit-btn"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <div className="spinner"></div> : "Verify OTP"}
                        </motion.button>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <span
                                onClick={() => setStep(1)}
                                className="toggle-link"
                                style={{ fontSize: '14px' }}
                            >
                                ← Back
                            </span>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="login-form">
                        <div className="floating-label-group password-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="floating-input"
                                placeholder=" "
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <label className="floating-label">New Password</label>
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                tabIndex="-1"
                            >
                                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                            </button>
                        </div>

                        <div className="floating-label-group password-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="floating-input"
                                placeholder=" "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            <label className="floating-label">Confirm New Password</label>
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                                tabIndex="-1"
                            >
                                <i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
                            </button>
                        </div>

                        <motion.button
                            className="submit-btn"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? <div className="spinner"></div> : "Reset Password"}
                        </motion.button>
                    </form>
                )}

                {step === 1 && (
                    <div className="register-area" style={{ marginTop: '20px' }}>
                        Remember your password?{" "}
                        <span
                            className="register-link"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </div>
                )}

            </motion.div>
        </div>
    );
};

export default ForgotPassword;
