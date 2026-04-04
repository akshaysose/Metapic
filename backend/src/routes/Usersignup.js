const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const User = require('../models/user') // Adjust path to where you made the file above
const upload = require('../middleware/uploadLimits'); // Your existing upload middleware
const { userJwt } = require('../middleware/auth'); // Ensure you have auth middleware for users
const cloud = require('../services/cloudinary'); // Your existing cloudinary service
const streamifier = require('streamifier');
const jwt = require('jsonwebtoken'); // Ensure this is imported
const faceClient = require('../services/faceClient');
const Group = require('../models/Group');
// SIGNUP API
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // 1. Check if Name exists
        const existingName = await User.findOne({ name });
        if (existingName) {
            return res.status(400).json({ message: "User name already exists" });
        }

        // 2. Check if Email exists (CRITICAL ADDITION)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        // 4. Log the actual error to your terminal for debugging
        console.error("Signup Error:", error); 
        res.status(500).json({ message: "Server error during signup" });
    }
});

// LOGIN API
router.post('/login', async (req, res) => {
    // 1. Accept both 'name' (from your form) and 'email' (common practice)
    const { name, email, password } = req.body;
    
    try {
        // 2. Find User (Check by Name OR Email)
        const user = await User.findOne({ 
            $or: [{ name: name }, { email: email }] 
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // 3. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // --- CRITICAL SECTION STARTS HERE ---
        
        // 4. GENERATE TOKEN
        const token = jwt.sign(
            { _id: user._id.toString() }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '7d' }
        );

        // 5. SEND TOKEN TO FRONTEND
        res.status(200).json({ 
            message: "Login successful", 
            token: token, // <--- THIS MUST BE HERE
            user: { 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                joinedGroups: user.joinedGroups 
            } 
        });
        
        // --- CRITICAL SECTION ENDS ---

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});
// Route: POST /api/user/upload-avatar
router.post('/user/upload-avatar', userJwt, upload.single('avatar'), async (req, res) => {
    console.log("Hit /api/user/upload-avatar")
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // 1. Upload to Cloudinary
        const stream = streamifier.createReadStream(req.file.buffer);
        const result = await cloud.uploadStream(stream, { 
            folder: 'kwikpic/avatars',
            resource_type: 'image'
        });

        // 2. Update User in DB
        // We use findOneAndUpdate to ensure the change is saved immediately
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { selfieUrl: result.secure_url } }, // Saving to 'selfieUrl'
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ 
            url: result.secure_url, 
            message: 'Profile picture updated' 
        });

    } catch (e) {
        console.error("User Avatar Upload Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// GET /api/user/my-groups
router.get('/user/my-groups', userJwt, async (req, res) => {
    try {
        // 1. Find the logged-in user and Populate the 'joinedGroups' array
        const user = await User.findById(req.user._id).populate({
            path: 'joinedGroups',
            populate: { path: 'photos' } // Optional: Populate photos to get count/cover
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Format the data for the Dashboard
        const formattedGroups = user.joinedGroups.map(group => ({
            id: group._id,
            name: group.name,
            code: group.code,
            // Safety check in case photos are empty
            photoCount: group.photos ? group.photos.length : 0,
            // Use the first photo as cover, or null
            coverPhoto: group.photos && group.photos.length > 0 ? group.photos[0].url : null
        }));

        res.json(formattedGroups);

    } catch (e) {
        console.error("Fetch User Groups Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/user/join-group', userJwt, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Group code is required" });

        // 1. Find Group
        const group = await Group.findOne({ code });
        if (!group) return res.status(404).json({ message: "Invalid Group Code" });

        // 2. Add User to Group Participants
        if (!group.participants.includes(req.user._id)) {
            group.participants.push(req.user._id);
            await group.save();
        }

        // 3. Add Group to User's joinedGroups list (CRITICAL FOR DASHBOARD)
        const user = await User.findById(req.user._id);
        if (!user.joinedGroups.includes(group._id)) {
            user.joinedGroups.push(group._id);
            await user.save();
        }

        res.json({ 
            message: "Joined successfully!", 
            groupId: group._id, 
            name: group.name 
        });

    } catch (e) {
        console.error("Join Group Error:", e);
        res.status(500).json({ message: "Server error joining group" });
    }
});

// 1. GET GROUP PHOTOS (For "All Photos" Tab)
// GET /api/user/group/:code
router.get('/user/group/:code', userJwt, async (req, res) => {
    console.log("Hit /api/user/group/", req.params.code);
    try {
        const group = await Group.findOne({ code: req.params.code })
            .populate('photos'); 

        if (!group) {
            return res.status(404).json({ message: "Group code does not exist" });
        }

        // --- THE FIX: Robust String Comparison ---
        // Convert the User ID and the Array IDs to strings before checking
        const userId = req.user._id.toString();
        const isMember = group.participants.some(id => id.toString() === userId);

        console.log(`Checking User ${userId} in Group ${group.code}. Is Member? ${isMember}`);

        if (!isMember) {
             return res.status(403).json({ message: "Access Denied: You must join this group first." });
        }

        res.json(group);
    } catch (e) {
        console.error("Group View Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 2. SEARCH PHOTOS BY SELFIE (For "My Photos" Tab)
// POST /api/user/group/:code/search
// POST /api/user/group/:code/search
router.post('/user/group/:code/search', userJwt, upload.single('selfie'), async (req, res) => {
    try {
        const { code } = req.params;
        const group = await Group.findOne({ code }).populate('photos');
        
        if (!group) return res.status(404).json({ message: "Group not found" });
        if (!req.file) return res.status(400).json({ message: "Selfie is required" });

        // 1. Get Selfie Embedding (This is just 1 face)
        const embedResp = await faceClient.computeEmbeddingFromBuffer(req.file.buffer, req.file.originalname);
        
        // Handle response format (List of lists or single list)
        let selfieEmbedding = [];
        if (embedResp.embeddings && embedResp.embeddings.length > 0) {
            selfieEmbedding = embedResp.embeddings[0]; // Take the first face found in selfie
        } else if (embedResp.embedding && embedResp.embedding.length > 0) {
            selfieEmbedding = embedResp.embedding;
        }

        if (!selfieEmbedding || selfieEmbedding.length === 0) {
            return res.status(400).json({ message: "No face detected in selfie." });
        }

        const threshold = parseFloat(process.env.MATCH_THRESHOLD || '0.38');

        const buildMatches = (photos) => {
            const found = [];
            for (const photo of photos) {
                const candidates = (photo.embeddings && photo.embeddings.length > 0)
                    ? photo.embeddings
                    : (photo.embedding && photo.embedding.length > 0 ? [photo.embedding] : []);
                if (candidates.length === 0) continue;

                let bestScore = -1;
                for (const faceEmbedding of candidates) {
                    const score = faceClient.cosine(selfieEmbedding, faceEmbedding);
                    if (score > bestScore) bestScore = score;
                }

                if (bestScore >= threshold) {
                    found.push({ ...photo.toObject(), score: bestScore });
                }
            }
            return found.sort((a, b) => b.score - a.score);
        };

        const missingEmbeddings = group.photos.filter((photo) => {
            const hasMulti = Array.isArray(photo.embeddings) && photo.embeddings.length > 0;
            const hasLegacy = Array.isArray(photo.embedding) && photo.embedding.length > 0;
            return !hasMulti && !hasLegacy && !!photo.url;
        });

        if (missingEmbeddings.length > 0) {
            try {
                const bulk = await faceClient.computeBulkEmbeddingsFromUrls(missingEmbeddings.map((p) => p.url));
                const byUrl = new Map((bulk.items || []).map((it) => {
                    const arr = Array.isArray(it.embeddings)
                        ? it.embeddings
                        : (Array.isArray(it.embedding) && it.embedding.length > 0 ? [it.embedding] : []);
                    return [it.url, arr];
                }));

                for (const photo of missingEmbeddings) {
                    const arr = byUrl.get(photo.url) || [];
                    if (arr.length > 0) {
                        photo.embeddings = arr;
                        await photo.save();
                    }
                }
            } catch (embedBackfillErr) {
                console.warn('Embedding backfill skipped:', embedBackfillErr.message);
            }
        }

        // First pass with stored embeddings.
        let matches = buildMatches(group.photos);

        // If everything misses, force-refresh all group embeddings once and retry.
        if (matches.length === 0) {
            try {
                const photosWithUrls = group.photos.filter((photo) => !!photo.url);
                if (photosWithUrls.length > 0) {
                    const bulk = await faceClient.computeBulkEmbeddingsFromUrls(photosWithUrls.map((p) => p.url));
                    const byUrl = new Map((bulk.items || []).map((it) => {
                        const arr = Array.isArray(it.embeddings)
                            ? it.embeddings
                            : (Array.isArray(it.embedding) && it.embedding.length > 0 ? [it.embedding] : []);
                        return [it.url, arr];
                    }));

                    for (const photo of photosWithUrls) {
                        const arr = byUrl.get(photo.url) || [];
                        if (arr.length > 0) {
                            photo.embeddings = arr;
                            await photo.save();
                        }
                    }

                    matches = buildMatches(group.photos);
                }
            } catch (refreshErr) {
                console.warn('Embedding refresh retry skipped:', refreshErr.message);
            }
        }

        res.json({ matches });

    } catch (e) {
        console.error("Search Error:", e);
        res.status(500).json({ message: "Face search failed: " + e.message });
    }
});
module.exports = router
