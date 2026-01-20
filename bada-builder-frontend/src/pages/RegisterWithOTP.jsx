import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    // Check cooldown
    if (otpCooldown > 0) {
      setErrors({ submit: `Please wait ${otpCooldown}s before resending OTP` });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/otp/send-otp`, {
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
      const response = await axios.post(`${API_URL}/otp/verify-and-register`, {
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
      {loading && (
        <motion.div
          className="fullscreen-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">
              {step === 1 ? "Sending OTP..." : "Verifying..."}
            </p>
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
          {step === 1 ? "Create Account" : "Verify Email"}
        </motion.h2>

        {step === 1 ? (
          // Step 1: Registration Form
          <form onSubmit={handleSendOTP} className="login-form">
            <label>Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your email"
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <label>Phone *</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter your phone number"
            />

            {/* <label>User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="individual">Individual</option>
              <option value="developer">Developer</option>
            </select> */}

            <label>Password *</label>
            <div className="password-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="password-input"
                disabled={loading}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <label>Confirm Password *</label>
            <div className="password-wrapper">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="password-input"
                disabled={loading}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={loading}
              >
                <i
                  className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"
                    }`}
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}

            {errors.submit && (
              <p className={`error submit-error ${errors.submit.includes('sent') ? 'success-login' : ''
                }`}>
                {errors.submit}
              </p>
            )}

            <button className="submit-btn" disabled={loading || otpCooldown > 0}>
              {loading ? <span className="spinner"></span> :
                otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Send OTP"}
            </button>
          </form>
        ) : (
          // Step 2: OTP Verification
          <form onSubmit={handleVerifyOTP} className="login-form">
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
              We've sent a 6-digit OTP to<br />
              <strong>{formData.email}</strong>
            </p>

            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
              }}
              disabled={loading}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              style={{
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "8px",
                fontWeight: "bold",
              }}
            />
            {errors.otp && <p className="error">{errors.otp}</p>}

            {errors.submit && (
              <p className={`error submit-error ${errors.submit.includes('sent') ? 'success-login' : ''
                }`}>
                {errors.submit}
              </p>
            )}

            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Verify & Register"}
            </button>

            <button
              type="button"
              onClick={handleBackToForm}
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
              ← Back to Form
            </button>
          </form>
        )}

        <p className="toggle-text">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="toggle-link"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterWithOTP;
