const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    uploader: { type: Schema.Types.ObjectId, ref: 'Photographer' },
    filename: String,

    // --- CHANGED: Support Multiple Faces ---
    // Was: embedding: { type: [Number], default: [] }
    // Now: Array of Arrays (List of faces)
    embeddings: { type: [[Number]], default: [] }, 
    // ---------------------------------------

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', PhotoSchema);
