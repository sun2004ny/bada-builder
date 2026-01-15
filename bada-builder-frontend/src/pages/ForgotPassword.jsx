import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
            {loading && (
                <motion.div
                    className="fullscreen-loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="loading-content">
                        <div className="loading-spinner-large"></div>
                        <p className="loading-text">Processing...</p>
                    </div>
                </motion.div>
            )}

            <motion.div
                className="login-box"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Reset Password"}
                </motion.h2>

                {error && <p className="error" style={{ textAlign: "center", marginBottom: "15px" }}>{error}</p>}
                {success && <p className="success-login" style={{ textAlign: "center", marginBottom: "15px", color: "green" }}>{success}</p>}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="login-form">
                        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
                            Enter your registered email address and we'll send you an OTP to reset your password.
                        </p>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            autoFocus
                        />
                        <button className="submit-btn" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <p className="toggle-text">
                            Remember your password?{" "}
                            <span onClick={() => navigate("/login")} className="toggle-link">
                                Login
                            </span>
                        </p>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
                            Enter the 6-digit OTP sent to<br />
                            <strong>{email}</strong>
                        </p>

                        <label>Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            disabled={loading}
                            placeholder="Min 6 digits"
                            maxLength={6}
                            style={{
                                textAlign: "center",
                                fontSize: "24px",
                                letterSpacing: "8px",
                                fontWeight: "bold",
                            }}
                            autoFocus
                        />

                        <button className="submit-btn" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            disabled={loading}
                            style={{
                                marginTop: "10px",
                                background: "none",
                                border: "1px solid #ccc",
                                color: "#666",
                                padding: "10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            ← Back
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="login-form">
                        <label>New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="password-input"
                                disabled={loading}
                                placeholder="At least 6 characters"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                            </button>
                        </div>

                        <label>Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="password-input"
                                disabled={loading}
                                placeholder="Re-enter password"
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                <i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
                            </button>
                        </div>

                        <button className="submit-btn" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
