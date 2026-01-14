import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import "./Login.css";
import { authAPI } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const from = location.state?.from || "/";
  const returnTo = location.state?.returnTo;
  const property = location.state?.property;
  const message = location.state?.message;
  
  // For registration, always redirect to home page, not back to login
  const getRedirectPath = (isRegistration = false) => {
    if (isRegistration) {
      return "/"; // Always go to home after registration
    }
    
    // If coming from BookSiteVisit, redirect back with property data
    if (returnTo && returnTo.includes('/book-visit')) {
      return { 
        path: '/book-visit', 
        state: { property } 
      };
    }
    
    return from === "/login" ? "/" : from; // Don't redirect back to login page
  };

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ------------------ RESET FORM FUNCTION ------------------
  const resetForm = useCallback(() => {
    setShowPassword(false);
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
    setLoading(false);
  }, []);

  // ------------------ HANDLE HEADER LOGIN CLICK ------------------
  useEffect(() => {
    // Check if user clicked login from header while already on login page
    if (location.state?.resetForm) {
      resetForm();
      // Show brief reset confirmation
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => {
        setErrors({});
      }, 2000); // Reduced from 3000ms to 2000ms
      // Clear the state to prevent repeated resets
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  // ------------------ HANDLE INPUT ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific errors immediately
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

  // ------------------ LOGIN ------------------
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login(email, password);
      
      // Refresh profile in context
      await refreshProfile();
      
      // Navigate immediately after auth success
      const redirectInfo = getRedirectPath(false);
      
      if (typeof redirectInfo === 'object' && redirectInfo.path) {
        // Special redirect with state (like BookSiteVisit with property data)
        navigate(redirectInfo.path, { 
          state: redirectInfo.state, 
          replace: true 
        });
      } else {
        // Normal redirect
        navigate(redirectInfo, { replace: true });
      }
    } catch (error) {
      let msg = "Login failed";
      if (error.message.includes("not found") || error.message.includes("Invalid")) {
        msg = "Invalid email or password";
      } else if (error.message.includes("Too many")) {
        msg = "Too many attempts. Try again later";
      } else {
        msg = error.message || "Login failed";
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }, [navigate, getRedirectPath, refreshProfile]);

  // ------------------ SUBMIT ------------------
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Prevent submission if already loading
    if (loading) return;
    
    if (!validate()) return;

    loginUser(formData.email, formData.password);
  }, [formData, validate, loginUser, loading]);

  // ------------------ UI ------------------
  return (
    <div className="login-page">
      {/* Full-screen loading overlay */}
      {loading && (
        <motion.div
          className="fullscreen-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">Signing you in...</p>
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
          Login
        </motion.h2>

        {/* Message from redirect (e.g., from BookSiteVisit) */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="redirect-message"
            style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #fbbf24',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className={`login-form ${loading ? 'form-disabled' : ''}`}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              disabled={loading}
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

          {errors.submit && (
            <p className={`error submit-error ${
              errors.submit.includes('successful') ? 'success-login' : 
              errors.submit.includes('reset') ? 'info-message' : ''
            }`}>
              {errors.submit}
            </p>
          )}

          <button 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          Don't have an account?{" "}
          <span 
            onClick={() => navigate('/register')} 
            className="toggle-link"
          >
            Register with OTP
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
