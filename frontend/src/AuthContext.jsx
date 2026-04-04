import React, { createContext, useState, useEffect } from 'react';

// Create the Context
export const AuthContext = createContext();

// Create the Provider Component
export const AuthProvider = ({ children }) => {
    // Load initial state from localStorage (if it exists)
    const [userToken, setUserToken] = useState(localStorage.getItem('userToken') || null);
    const [photToken, setPhotToken] = useState(localStorage.getItem('photToken') || null);
    
    // Try to parse stored profile, or null if invalid
    const [profile, setProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('profile')) || null;
        } catch {
            return null;
        }
    });

    // --- Actions ---

    // Login for Standard Users
    const loginUser = (token, userData) => {
        setUserToken(token);
        setProfile(userData);
        localStorage.setItem('userToken', token);
        localStorage.setItem('profile', JSON.stringify(userData));
    };

    // Login for Photographers
    const loginPhotographer = (token, photData) => {
        setPhotToken(token);
        setProfile(photData);
        localStorage.setItem('photToken', token);
        localStorage.setItem('profile', JSON.stringify(photData));
    };

    // Logout (Clear everything)
    const logout = () => {
        setUserToken(null);
        setPhotToken(null);
        setProfile(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('photToken');
        localStorage.removeItem('profile');
    };

    return (
        <AuthContext.Provider value={{ 
            userToken, 
            photToken, 
            profile, 
            setProfile,
            setUserToken,
            loginUser, 
            loginPhotographer, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};