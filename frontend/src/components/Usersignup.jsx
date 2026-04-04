import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const AuthForm = () => {
    const [isSignup, setIsSignup] = useState(true);
    const [userType, setUserType] = useState('user'); // 'user' or 'photographer'
    
    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const API_URL = 'http://localhost:4000/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper: simple email validation
    const validateEmail = (email) => {
        // basic RFC-like check (not exhaustive) — good for client-side validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Helper: password must be exactly 6 digits
    const validateSixDigitPassword = (pwd) => {
        return /^\d{6}$/.test(pwd); // exactly 6 numeric digits
    };

    // Handle Tab Switching
    const handleTabSwitch = (type) => {
        setUserType(type);
        setIsSignup(true); // Reset to signup view when switching tabs
        setFormData({ name: '', businessName: '', email: '', password: '', confirmPassword: '' }); // Clear form
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Validation START ---
        // Confirm password match (only meaningful during signup)
        if (isSignup && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Password rule: exactly 6 digits
        if (!validateSixDigitPassword(formData.password)) {
            alert("Password must be exactly 6 numeric digits (e.g. 123456).");
            return;
        }

        // For signup: ensure required fields are present depending on userType
        if (isSignup) {
            if (userType === 'user') {
                if (!formData.name?.trim()) {
                    alert("Name is required for user signup.");
                    return;
                }
                if (!formData.email?.trim()) {
                    alert("Email is required for user signup.");
                    return;
                }
                if (!validateEmail(formData.email)) {
                    alert("Please enter a valid email address.");
                    return;
                }
            } else { // photographer signup
                if (!formData.name?.trim()) {
                    alert("Name is required for photographer signup.");
                    return;
                }
                if (!formData.businessName?.trim()) {
                    alert("Business Name is required for photographer signup.");
                    return;
                }
                if (!formData.email?.trim()) {
                    alert("Email is required for photographer signup.");
                    return;
                }
                if (!validateEmail(formData.email)) {
                    alert("Please enter a valid email address.");
                    return;
                }
            }
        } else {
            // Login validations
            if (userType === 'user') {
                // Your login payload expects name + password for users
                if (!formData.name?.trim()) {
                    alert("Please enter your name to login.");
                    return;
                }
                // password already validated for 6 digits above
            } else {
                // photographer login expects email + password
                if (!formData.email?.trim()) {
                    alert("Please enter your email to login as photographer.");
                    return;
                }
                if (!validateEmail(formData.email)) {
                    alert("Please enter a valid email address.");
                    return;
                }
            }
        }
        // --- Validation END ---

        try {
            // Dynamic Endpoint based on User Type and Action
            const rolePath = userType === '/user' ? '' : '/photographer'; // Users go to /api/..., Photographers to /api/photographer/...
            const actionPath = isSignup ? '/signup' : '/login';
            const fullUrl = `${API_URL}${rolePath}${actionPath}`;

            // Prepare Payload
            let payload = {};
            
            if (userType === 'user') {
                // USER PAYLOAD
                payload = isSignup 
                    ? { name: formData.name, email: formData.email, password: formData.password }
                    : { name: formData.name, password: formData.password };
            } else {
                // PHOTOGRAPHER PAYLOAD
                payload = isSignup 
                    ? { name: formData.name, businessName: formData.businessName, email: formData.email, password: formData.password }
                    : { email: formData.email, password: formData.password }; // Photographer logs in with Email
            }

            const response = await axios.post(fullUrl, payload);
            alert(response.data.message);

            if (isSignup) {
                setIsSignup(false);
            } else {
                console.log("Logged in data:", response.data);
            }

        } catch (error) {
            alert(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                
                {/* TAB SWITCHER (Matches your screenshot) */}
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
                    
                    {/* Name Field - Common to both */}
                    {(isSignup || userType === 'user') && (
                        <div className="input-group">
                            <label>Name</label>
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        </div>
                    )}

                    {/* Business Name - Photographer Signup Only */}
                    {userType === 'photographer' && isSignup && (
                        <div className="input-group">
                            <label>Business Name</label>
                            <input type="text" name="businessName" placeholder="Studio/Brand Name" value={formData.businessName} onChange={handleChange} required />
                        </div>
                    )}

                    {/* Email - User Signup OR Photographer (Login & Signup) */}
                    {(isSignup || userType === 'photographer') && (
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                        </div>
                    )}

                    {/* Password - Common to both */}
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    </div>

                    {/* Confirm Password - Signup Only */}
                    {isSignup && (
                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {isSignup ? 'Sign Up' : 'Login'}
                    </button>
                </form>

                <p onClick={() => setIsSignup(!isSignup)} className="toggle-text">
                    {isSignup 
                        ? `Already have a ${userType} account? Login` 
                        : `Don't have a ${userType} account? Sign Up`}
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
