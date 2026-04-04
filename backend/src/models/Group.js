const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: String,
  code: { type: String, required: true, unique: true }, // 6-digit Unique Code
  
  // Link to the Photographer
  photographer: { type: Schema.Types.ObjectId, ref: 'Photographer' },
  
  // Array of Photo IDs
  photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],

  // --- NEW FIELD (REQUIRED FOR JOINING) ---
  // This stores the IDs of Users (Clients) who join the group
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
  // ----------------------------------------

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);