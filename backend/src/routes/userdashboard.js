const express = require('express')
const router = express.Router()
const Group = require('../models/Group');
const { userJwt } = require('../middleware/auth');

// GET /api/user/my-groups
router.get('user/my-groups', userJwt, async (req, res) => {
    try {
        // Find the user and populate the 'joinedGroups' array with actual Group data
        const user = await User.findById(req.user._id).populate({
            path: 'joinedGroups',
            select: 'name code photos coverPhoto participants' // Select fields you need
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Format data for the dashboard card
        const formattedGroups = user.joinedGroups.map(group => ({
            id: group._id,
            name: group.name,
            code: group.code,
            photoCount: group.photos ? group.photos.length : 0,
            participantCount: group.participants ? group.participants.length : 1, // Mocking if field missing
            coverPhoto: group.coverPhoto || (group.photos && group.photos.length > 0 ? group.photos[0] : null)
        }));

        res.json(formattedGroups);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});
module.exports = router