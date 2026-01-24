import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";
import { authAPI } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bgVideo from "../assets/realestate_video.mp4";
import MotionBackground from "../components/MotionBackground";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();

  // State from navigation
  const from = location.state?.from || "/";
  const returnTo = location.state?.returnTo;
  const property = location.state?.property;
  const message = location.state?.message;

  // Form State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ------------------ REDIRECT LOGIC ------------------
  const getRedirectPath = (isRegistration = false) => {
    if (isRegistration) {
      return "/";
    }
    // If coming from BookSiteVisit, redirect back with property data
    if (returnTo && returnTo.includes('/book-visit')) {
      return {
        path: '/book-visit',
        state: { property }
      };
    }
    return from === "/login" ? "/" : from;
  };

  // ------------------ RESET FORM ------------------
  const resetForm = useCallback(() => {
    setShowPassword(false);
    setFormData({ email: "", password: "" });
    setErrors({});
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check if user clicked login from header while already on login page
    if (location.state?.resetForm) {
      resetForm();
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => setErrors({}), 2000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  // ------------------ HANDLE INPUT ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // ------------------ VALIDATION ------------------
  const validate = useMemo(() => {
    return () => {
      const newErrors = {};
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

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [formData]);

  // ------------------ LOGIN ACTION ------------------
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    setErrors({});

    try {
      await authAPI.login(email, password);
      await refreshProfile();

      const redirectInfo = getRedirectPath(false);

      if (typeof redirectInfo === 'object' && redirectInfo.path) {
        navigate(redirectInfo.path, {
          state: redirectInfo.state,
          replace: true
        });
      } else {
        navigate(redirectInfo, { replace: true });
      }
    } catch (error) {
      let msg = "Login failed";
      if (error.message && (error.message.includes("not found") || error.message.includes("Invalid"))) {
        msg = "Invalid email or password";
      } else if (error.message && error.message.includes("Too many")) {
        msg = "Too many attempts. Try again later";
      } else {
        msg = error.message || "Login failed";
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }, [navigate, refreshProfile]); // removed getRedirectPath from deps as it's defined inside/constant

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    loginUser(formData.email, formData.password);
  }, [formData, validate, loginUser, loading]);

  // ------------------ RENDER ------------------
  return (
    <div className="login-page">
      <video
        autoPlay
        loop
        muted
        playsInline
        id="bg-video"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
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
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Manage your properties & bookings
          </motion.p>
        </div>

        {/* Redirect Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="error-box"
              style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e', marginBottom: '20px' }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="login-form">

          {/* Email Input */}
          <div className="floating-label-group">
            <input
              type="email"
              name="email"
              className="floating-input"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            <label className="floating-label">Email Address</label>
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="field-error"
              >
                {errors.email}
              </motion.div>
            )}
          </div>

          {/* Password Input */}
          <div className="floating-label-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="floating-input"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
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
            {errors.password && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="field-error"
              >
                {errors.password}
              </motion.div>
            )}
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <span
              onClick={() => navigate('/forgot-password')}
              className="forgot-link"
            >
              Forgot Password?
            </span>
          </div>

          {/* Submit Error */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                className="error-box"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <i className="fas fa-exclamation-circle"></i>
                <span>{errors.submit}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.button
            className="submit-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <div className="spinner" /> : "Login"}
          </motion.button>
        </form>

        <div className="register-area">
          Don't have an account?
          <span
            className="register-link"
            onClick={() => navigate('/register')}
          >
            Register with OTP
          </span>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
