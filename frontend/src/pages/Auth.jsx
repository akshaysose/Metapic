import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import '../components/AuthForm.css'; // Ensure this path points to where you saved the CSS

export default function Auth() {
  const { loginUser, loginPhotographer } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize API URL from your environment or default to localhost
  const API = import.meta.env.VITE_API || 'http://localhost:5000';

  // State management
  const [isSignup, setIsSignup] = useState(location.pathname.includes('signup'));
  const [userType, setUserType] = useState('user'); // 'user' or 'photographer'
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Message state: { text: string, type: 'success'|'error' } or null
  const [message, setMessage] = useState(null);

  // Auto-hide message after 5s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // Update mode when URL changes (if user clicks Login/Signup in Navbar)
  useEffect(() => {
    setIsSignup(location.pathname.includes('signup'));
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Switch between User and Photographer tabs
  const handleTabSwitch = (type) => {
    setUserType(type);
    setFormData({ name: '', businessName: '', email: '', password: '', confirmPassword: '' });
    setMessage(null);
  };

  // --- Validation helpers ---
  const validateEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Exactly 6 numeric digits
  const validateSixDigitPassword = (pwd) => {
    return /^\d{6}$/.test(pwd);
  };
  // --- End helpers ---

 const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous message
    setMessage(null);

    // --- Validation (replace alerts with message UI) ---
    if (isSignup && formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: 'error' });
      return;
    }

    if (!validateSixDigitPassword(formData.password)) {
      setMessage({ text: "Password must be exactly 6 numeric digits (e.g. 123456).", type: 'error' });
      return;
    }

    if (isSignup) {
      if (userType === 'user') {
        if (!formData.name?.trim()) {
          setMessage({ text: "Name is required for user signup.", type: 'error' });
          return;
        }
        if (!formData.email?.trim()) {
          setMessage({ text: "Email is required for user signup.", type: 'error' });
          return;
        }
        if (!validateEmail(formData.email)) {
          setMessage({ text: "Please enter a valid email address.", type: 'error' });
          return;
        }
      } else {
        // photographer signup
        if (!formData.name?.trim()) {
          setMessage({ text: "Name is required for photographer signup.", type: 'error' });
          return;
        }
        if (!formData.businessName?.trim()) {
          setMessage({ text: "Business Name is required for photographer signup.", type: 'error' });
          return;
        }
        if (!formData.email?.trim()) {
          setMessage({ text: "Email is required for photographer signup.", type: 'error' });
          return;
        }
        if (!validateEmail(formData.email)) {
          setMessage({ text: "Please enter a valid email address.", type: 'error' });
          return;
        }
      }
    } else {
      // Login validations
      if (userType === 'user') {
        if (!formData.name?.trim()) {
          setMessage({ text: "Please enter your name to login.", type: 'error' });
          return;
        }
      } else {
        if (!formData.email?.trim()) {
          setMessage({ text: "Please enter your email to login as photographer.", type: 'error' });
          return;
        }
        if (!validateEmail(formData.email)) {
          setMessage({ text: "Please enter a valid email address.", type: 'error' });
          return;
        }
      }
    }
    // --- End validation ---

    try {
      const rolePath = userType === 'user' ? '/api' : '/api/photographer';
      const actionPath = isSignup ? '/signup' : '/login';
      const fullUrl = `${API}${rolePath}${actionPath}`;

      let payload = {};
      if (userType === 'user') {
        payload = isSignup 
          ? { name: formData.name, email: formData.email, password: formData.password }
          : { name: formData.name, password: formData.password };
      } else {
        payload = isSignup 
          ? { name: formData.name, businessName: formData.businessName, email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password };
      }

      const response = await axios.post(fullUrl, payload);

      if (isSignup) {
        // Show success message in UI and switch to login view (do not navigate away)
        setMessage({ text: response?.data?.message || "Signup successful — please login.", type: 'success' });
        setIsSignup(false);
        // keep user on same page so they can see the message above the form
      } else {
        // --- LOGIN SUCCESS ---
        console.log("LOGIN RESPONSE:", response.data);

        const { token, user } = response.data;
        
        if (!token) {
            console.error("Backend did not send a token!", response.data);
            setMessage({ text: "Login failed: Server did not return a token.", type: 'error' });
            return;
        }

        if (userType === 'photographer') {
          loginPhotographer(token, user);
          // Redirect to Photographer Dashboard
          navigate('/photographer/dashboard'); 
        } else {
          loginUser(token, user);
          // Smart Redirect for Users (handles Deep Links like /join/123)
          const from = location.state?.from || '/dashboard';
          navigate(from, { replace: true });
        }
      }

    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "An error occurred";
      setMessage({ text: errMsg, type: 'error' });
    }
  };

  // Helper to manually dismiss message (×)
  const dismissMessage = () => setMessage(null);

  return (
    <div className="auth-container" style={{ marginTop: '80px' }}> 
      <div className="auth-box">
        {/* Message box shown above the form */}
        {message && (
          <div
            className={`form-message ${message.type === 'success' ? 'success' : 'error'}`}
            style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: 14, lineHeight: 1.2 }}>
              {message.text}
            </div>
            <button
              onClick={dismissMessage}
              aria-label="Dismiss message"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${userType === 'user' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('user')}
          >
            User
          </button>
          <button 
            className={`tab-btn ${userType === 'photographer' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('photographer')}
          >
            Photographer
          </button>
        </div>

        <h2>
          {userType === 'photographer' ? 'Photographer' : 'User'} {isSignup ? 'Signup' : 'Login'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* Name Field */}
          {(isSignup || userType === 'user') && (
            <div className="input-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {/* Business Name (Photographer Signup Only) */}
          {userType === 'photographer' && isSignup && (
            <div className="input-group">
              <label>Business Name</label>
              <input 
                type="text" 
                name="businessName" 
                placeholder="Studio Name" 
                value={formData.businessName} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {/* Email Field */}
          {(isSignup || userType === 'photographer') && (
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          {/* Password Field */}
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            <small style={{ display: 'block', marginTop: 6, color: '#666', fontSize: 12 }}>
              Password must be exactly 6 numeric digits.
            </small>
          </div>

          {/* Confirm Password (Signup Only) */}
          {isSignup && (
            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p 
          onClick={() => {
            const newPath = isSignup ? '/login' : '/signup';
            setIsSignup(!isSignup);
            navigate(newPath);
          }} 
          className="toggle-text"
        >
          {isSignup 
            ? `Already have a ${userType} account? Login` 
            : `Don't have a ${userType} account? Sign Up`}
        </p>
      </div>
    </div>
  );
}
