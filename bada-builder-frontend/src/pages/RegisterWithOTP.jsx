import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import bgVideo from "../assets/realestate_video.mp4";
import MotionBackground from "../components/MotionBackground";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RegisterWithOTP = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "individual",
  });

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (otpCooldown > 0) {
      setErrors({ submit: `Please wait ${otpCooldown}s before resending OTP` });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await axios.post(`${API_URL}/otp/send-otp`, {
        email: formData.email,
        name: formData.name,
      });

      setOtpSent(true);
      setStep(2);

      // Start 60-second cooldown
      setOtpCooldown(60);
      const interval = setInterval(() => {
        setOtpCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setErrors({ submit: "OTP sent to your email! Please check your inbox." });
      // Clear success message after 3 seconds
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.submit;
          return newErrors;
        });
      }, 3000);

    } catch (error) {
      let msg = "Failed to send OTP";
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await axios.post(`${API_URL}/otp/verify-and-register`, {
        email: formData.email,
        otp: otp,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || null,
        userType: formData.userType,
      });

      // Success - redirect to login
      navigate("/login", {
        state: {
          message: "Registration successful! Please login with your credentials.",
        },
      });
    } catch (error) {
      let msg = "Verification failed";
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // Go back to form
  const handleBackToForm = () => {
    setStep(1);
    setOtp("");
    setErrors({});
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
            {step === 1 ? "Create Account" : "Verify Email"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {step === 1 ? "Join us to manage your properties" : `Enter the OTP sent to ${formData.email}`}
          </motion.p>
        </div>

        {step === 1 ? (
          // Step 1: Registration Form
          <form onSubmit={handleSendOTP} className="login-form">
            {/* Name */}
            <div className="floating-label-group">
              <input
                name="name"
                className="floating-input"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="floating-label">Full Name</label>
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="floating-label-group">
              <input
                name="email"
                type="email"
                className="floating-input"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="floating-label">Email Address</label>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="floating-label-group">
              <input
                name="phone"
                type="tel"
                className="floating-input"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="floating-label">Phone Number</label>
            </div>

            {/* Password */}
            <div className="floating-label-group password-group">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="floating-input"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="floating-label">Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="floating-label-group password-group">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="floating-input"
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="floating-label">Confirm Password</label>
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                <i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
              {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
            </div>

            <AnimatePresence>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`error-box ${errors.submit.includes('sent') ? 'success-login' : ''}`}
                  style={errors.submit.includes('sent') ? { background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' } : {}}
                >
                  <span>{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              className="submit-btn"
              disabled={loading || otpCooldown > 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <div className="spinner"></div> :
                otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Send OTP"}
            </motion.button>
          </form>
        ) : (
          // Step 2: OTP Verification
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="floating-label-group">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                }}
                className="floating-input"
                placeholder=" "
                maxLength={6}
                disabled={loading}
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "5px" }}
                autoFocus
              />
              <label className="floating-label" style={{ left: "50%", transform: "translateX(-50%)" }}>Enter 6-digit OTP</label>
              {errors.otp && <div className="field-error" style={{ textAlign: 'center' }}>{errors.otp}</div>}
            </div>

            {errors.submit && (
              <div className={`error-box ${errors.submit.includes('sent') ? 'success-login' : ''}`}>
                {errors.submit}
              </div>
            )}

            <motion.button
              className="submit-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <div className="spinner"></div> : "Verify & Register"}
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span
                onClick={handleBackToForm}
                className="toggle-link"
                style={{ fontSize: '14px' }}
              >
                ← Back to Form
              </span>
            </div>
          </form>
        )}

        <div className="register-area">
          Already have an account?
          <span
            className="register-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterWithOTP;
