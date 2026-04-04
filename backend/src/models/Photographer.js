const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PhotographerSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // We will map 'password' to this
  name: { type: String, required: true }, // Made required based on your form needs
  
  avatarUrl: { type: String },
  // --- NEW FIELD ---
  businessName: { type: String, required: true }, 
  // ----------------
  
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
}, { timestamps: true })

module.exports = mongoose.model('Photographer', PhotographerSchema)