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

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'creating', 'success', 'transitioning'

  // ------------------ RESET FORM FUNCTION ------------------
  const resetForm = useCallback(() => {
    setMode("login");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setLoading(false);
    setRegistrationStep('form');
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

      if (mode === "register" && !formData.name.trim()) {
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

      if (mode === "register") {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password.";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match.";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [mode, formData]);

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

  // ------------------ REGISTER ------------------
  const createUser = useCallback(async (email, password, name) => {
    setLoading(true);
    setErrors({});
    setRegistrationStep('creating');

    try {
      // Register user via API
      await authAPI.register({
        email,
        password,
        name,
      });

      // Show success message briefly, then transition
      setRegistrationStep('success');
      
      // Show success message briefly, then start transition
      setTimeout(() => {
        setRegistrationStep('transitioning');
        setLoading(true); // Keep loading overlay during transition
      }, 800);
      
      // Complete transition to login mode
      setTimeout(() => {
        setMode('login');
        setRegistrationStep('form');
        setLoading(false); // Remove loading overlay after UI transition is complete
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        setErrors({ submit: "Registration successful! Please login with your credentials." });
      }, 1200);

    } catch (error) {
      setRegistrationStep('form');
      setLoading(false);
      let msg = "Registration failed";
      if (error.message.includes("already exists") || error.message.includes("already registered")) {
        msg = "Email already registered";
      } else if (error.message.includes("weak") || error.message.includes("Password")) {
        msg = "Password is too weak";
      } else if (error.message.includes("Network") || error.message.includes("connection")) {
        msg = "Network error. Please check your connection";
      } else {
        msg = error.message || "Registration failed";
      }
      setErrors({ submit: msg });
    }
  }, []);

  // ------------------ SUBMIT ------------------
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Prevent submission if already loading
    if (loading) return;
    
    if (!validate()) return;

    if (mode === "login") {
      loginUser(formData.email, formData.password);
    } else {
      createUser(formData.email, formData.password, formData.name);
    }
  }, [mode, formData, validate, loginUser, createUser, loading]);

  // ------------------ TOGGLE ------------------
  const toggleMode = useCallback(() => {
    // Don't allow toggle during transition
    if (registrationStep === 'transitioning') return;
    
    // Switch mode
    setMode((prev) => (prev === "login" ? "register" : "login"));
    
    // Reset all form data
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    
    // Reset all states
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegistrationStep('form');
    setLoading(false);
  }, [registrationStep]);

  // ------------------ UI ------------------
  return (
    <div className="login-page">
      {/* Full-screen loading overlay */}
      {(loading && registrationStep !== 'success') || registrationStep === 'transitioning' ? (
        <motion.div
          className="fullscreen-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">
              {registrationStep === 'transitioning' ? "Switching to login..." :
               mode === "login" ? "Signing you in..." : 
               registrationStep === 'creating' ? "Creating your account..." : 
               "Processing..."}
            </p>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {mode === "login" ? "login" : "Create Account"}
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

        <form onSubmit={handleSubmit} className={`login-form ${loading || registrationStep === 'transitioning' ? 'form-disabled' : ''}`}>
          {mode === "register" && (
            <>
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} disabled={loading || registrationStep === 'transitioning'} />
              {errors.name && <p className="error">{errors.name}</p>}
            </>
          )}

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || registrationStep === 'transitioning'}
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
              disabled={loading || registrationStep === 'transitioning'}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading || registrationStep === 'transitioning'}
            >
              <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          {mode === "register" && (
            <>
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="password-input"
                  disabled={loading || registrationStep === 'transitioning'}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  disabled={loading || registrationStep === 'transitioning'}
                >
                  <i
                    className={`far ${
                      showConfirmPassword ? "fa-eye" : "fa-eye-slash"
                    }`}
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </>
          )}

          {errors.submit && (
            <p className={`error submit-error ${
              errors.submit.includes('successful') ? 'success-login' : 
              errors.submit.includes('reset') ? 'info-message' : ''
            }`}>
              {errors.submit}
            </p>
          )}

          {/* Registration Success Message */}
          {mode === "register" && registrationStep === 'success' && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="success">✓ Registration successful! Please login with your credentials.</p>
            </motion.div>
          )}

          <button 
            className="submit-btn" 
            disabled={loading || (mode === "register" && (registrationStep === 'success' || registrationStep === 'transitioning'))}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : mode === "register" && registrationStep === 'success' ? (
              "Registration successful!"
            ) : mode === "register" && registrationStep === 'transitioning' ? (
              "Switching to login..."
            ) : mode === "register" && registrationStep === 'creating' ? (
              "Creating account..."
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="toggle-text">
          {mode === "login" ? "Don't have an account?" : "Already have one?"}{" "}
          <span 
            onClick={loading || registrationStep === 'transitioning' ? undefined : toggleMode} 
            className={`toggle-link ${loading || registrationStep === 'transitioning' ? 'disabled' : ''}`}
          >
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
