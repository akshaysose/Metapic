// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // --- CHANGED FROM avatarUrl TO selfieUrl ---
    selfieUrl: { type: String }, 
    // ------------------------------------------

    joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
});

module.exports = mongoose.model('User', UserSchema);