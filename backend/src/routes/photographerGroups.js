const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { photographerJwt } = require('../middleware/auth');
const Photo = require('../models/Photo'); // Import Photo Model
const upload = require('../middleware/uploadLimits');
const streamifier = require('streamifier');
const cloud = require('../services/cloudinary');
const faceClient = require('../services/faceClient');
// 1. GET ALL GROUPS (For Dashboard)
// URL: /api/photographer/my-groups
// 1. GET ALL GROUPS (For Dashboard)
router.get('/my-groups', photographerJwt, async (req, res) => {
    try {
        const groups = await Group.find({ photographer: req.user._id })
            .sort({ createdAt: -1 }); 
        
        const formatted = groups.map(g => ({
            _id: g._id,
            name: g.name,
            code: g.code,
            // FIX: Check if array exists before reading length, otherwise default to 0
            photoCount: g.photos ? g.photos.length : 0,
            participantCount: g.participants ? g.participants.length : 0
        }));
        
        res.json(formatted);
    } catch (e) {
        console.error("Fetch Groups Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 2. CREATE GROUP
// URL: /api/photographer/create-group
router.post('/create-group', photographerJwt, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Group Name is required" });

        // Generate a unique 6-digit code
        let code;
        let exists = true;
        while (exists) {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            const found = await Group.findOne({ code });
            if (!found) exists = false;
        }

        const newGroup = new Group({
            name,
            code,
            photographer: req.user._id,
            photos: [],
            participants: []
        });

        await newGroup.save();
        
        // Add to Photographer's list (Optional, depends on your Schema)
        // req.user.groups.push(newGroup._id);
        // await req.user.save();

        res.status(201).json(newGroup);

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// 3. GET SINGLE GROUP (For Group Manager Page)
// URL: /api/photographer/group/:code
router.get('/group/:code', photographerJwt, async (req, res) => {
    try {
        const group = await Group.findOne({ code: req.params.code, photographer: req.user._id })
            .populate('photos')       
            .populate('participants', 'name email selfieUrl'); 

        if (!group) return res.status(404).json({ message: "Group not found" });

        res.json(group);
    } catch (e) {
        console.error("Get Group Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 4. UPLOAD PHOTOS TO GROUP
// URL: /api/photographer/group/:code/upload
// 4. UPLOAD PHOTOS TO GROUP
router.post('/group/:code/upload', photographerJwt, upload.array('photos'), async (req, res) => {
    try {
        const { code } = req.params;
        const group = await Group.findOne({ code, photographer: req.user._id });
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No photos uploaded" });

        const createdPhotos = [];

        for (const file of req.files) {
            // A. Upload to Cloudinary
            const stream = streamifier.createReadStream(file.buffer);
            const result = await cloud.uploadStream(stream, { 
                folder: `kwikpic/${code}`, 
                resource_type: 'image'
            });

            // B. Generate Face Embeddings (Multi-Face)
            let allEmbeddings = [];
            try {
                const embedResp = await faceClient.computeEmbeddingFromBuffer(file.buffer, file.originalname);
                // Python now returns { "embeddings": [[...], [...]] }
                if (embedResp.embeddings) {
                    allEmbeddings = embedResp.embeddings; 
                } else if (embedResp.embedding && embedResp.embedding.length > 0) {
                    allEmbeddings = [embedResp.embedding];
                }
            } catch (err) {
                console.error(`Face embed error:`, err.message);
            }

            // C. Create Photo Document
            const newPhoto = new Photo({
                url: result.secure_url,
                publicId: result.public_id,
                group: group._id,
                uploader: req.user._id,
                filename: file.originalname,
                
                // SAVE ALL FACES
                embeddings: allEmbeddings 
            });
            
            await newPhoto.save();
            group.photos.push(newPhoto._id);
            createdPhotos.push(newPhoto);
        }

        await group.save();
        res.json({ message: "Uploaded successfully", photos: createdPhotos });

    } catch (e) {
        console.error("Upload Error:", e);
        res.status(500).json({ message: e.message });
    }
});
// 5. DELETE PHOTOS (Selected OR All)
// URL: /api/photographer/group/:code/delete-photos
router.post('/group/:code/delete-photos', photographerJwt, async (req, res) => {
    try {
        const { photoIds, deleteAll } = req.body;
        const group = await Group.findOne({ code: req.params.code, photographer: req.user._id });

        if (!group) return res.status(404).json({ message: "Group not found" });

        let idsToDelete = [];

        if (deleteAll) {
            // Delete ALL photos in this group
            idsToDelete = group.photos;
            
            // 1. Delete from Photo Collection
            await Photo.deleteMany({ group: group._id });
            
            // 2. Clear Group photo array
            group.photos = [];
        } else {
            // Delete SELECTED photos
            idsToDelete = photoIds;

            if (!idsToDelete || idsToDelete.length === 0) {
                return res.status(400).json({ message: "No photos selected" });
            }

            // 1. Delete from Photo Collection
            await Photo.deleteMany({ _id: { $in: idsToDelete } });

            // 2. Remove specific IDs from Group array
            group.photos = group.photos.filter(pid => !idsToDelete.includes(pid.toString()));
        }

        await group.save();
        res.json({ message: "Photos deleted successfully" });

    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 6. DELETE ENTIRE GROUP
// URL: /api/photographer/group/:code
router.delete('/group/:code', photographerJwt, async (req, res) => {
    try {
        const group = await Group.findOne({ code: req.params.code, photographer: req.user._id });
        if (!group) return res.status(404).json({ message: "Group not found" });

        // 1. Delete all Photos associated with this group
        await Photo.deleteMany({ group: group._id });

        // 2. Delete the Group itself
        await Group.findByIdAndDelete(group._id);

        res.json({ message: "Group and all photos deleted successfully" });
    } catch (e) {
        console.error("Delete Group Error:", e);
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
