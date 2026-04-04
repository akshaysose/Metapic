const bcrypt = require('bcryptjs');
const Photographer = require('../models/Photographer'); // Import your updated model
const jwt = require('jsonwebtoken');
const express = require('express')
const router = express.Router()
const { photographerJwt } = require('../middleware/auth');
const upload = require('../middleware/uploadLimits'); // <--- FIXES YOUR ERROR
const streamifier = require('streamifier');           // You will need this for the image stream
const cloud = require('../services/cloudinary'); // You will need this to upload to cloud

// --- PHOTOGRAPHER SIGNUP ---
router.post('/photographer/signup', async (req, res) => {
    // 1. Destructure the input fields
    const { name, businessName, email, password } = req.body;

    try {
        // 2. Check if email exists
        const existingUser = await Photographer.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use" });

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the Photographer using your Specific Schema keys
        const newPhotographer = new Photographer({
            name,
            businessName,
            email,
            passwordHash: hashedPassword // MAPPING: input 'password' -> schema 'passwordHash'
        });

        await newPhotographer.save();
        res.status(201).json({ message: "Photographer registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering photographer" });
    }
});

// --- PHOTOGRAPHER LOGIN ---
router.post('/photographer/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const photographer = await Photographer.findOne({ email });
        if (!photographer) return res.status(404).json({ message: "User not found" });

        // Check Password
        const isMatch = await bcrypt.compare(password, photographer.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // --- GENERATE TOKEN (ADD THIS) ---
        const token = jwt.sign(
            { _id: photographer._id.toString() }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '7d' }
        );

        // Send token back to frontend
        res.status(200).json({ 
            message: "Login successful", 
            token, // <--- The frontend needs this!
            user: { name: photographer.name, email: photographer.email } 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route: POST /api/photographer/upload-avatar
router.post('/photographer/upload-avatar', photographerJwt, upload.single('avatar'), async (req, res) => {
    console.log("--- Starting Avatar Upload ---");
    
    // 1. Check if file exists
    if (!req.file) {
        console.log("Error: No file in request");
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // 2. Check if Cloudinary Keys are loaded
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error("CRITICAL ERROR: Cloudinary keys are missing in .env file!");
        return res.status(500).json({ message: 'Server misconfiguration: Cloudinary keys missing' });
    }

    try {
        // 3. Convert Buffer to Stream and Upload
        const stream = streamifier.createReadStream(req.file.buffer);
        const result = await cloud.uploadStream(stream, { 
            folder: 'kwikpic/avatars',
            resource_type: 'image'
        });

        console.log("Upload Success. URL:", result.secure_url);

        // 4. Save to Database
        const phot = await Photographer.findById(req.user._id);
        phot.avatarUrl = result.secure_url;
        await phot.save();

        res.json({ url: result.secure_url, message: 'Avatar updated successfully' });

    } catch (e) {
        console.error("UPLOAD FAILED:", e);
        res.status(500).json({ message: 'Upload failed: ' + e.message });
    }
});


module.exports = router