const jwt = require('jsonwebtoken');
const Photographer = require('../models/Photographer');
const User = require('../models/user'); // Import User model

// Middleware for PHOTOGRAPHERS
const photographerJwt = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        const photographer = await Photographer.findOne({ _id: decoded._id });

        if (!photographer) {
            throw new Error();
        }

        req.token = token;
        req.user = photographer; // req.user will be a Photographer document
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate as a Photographer.' });
    }
};

// Middleware for STANDARD USERS
const userJwt = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        // Ensure we look for the user in the User collection
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user; // req.user will be a User document
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate as a User.' });
    }
};

module.exports = { photographerJwt, userJwt };