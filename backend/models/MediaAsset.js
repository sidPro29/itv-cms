const mongoose = require('mongoose');

const MediaAssetSchema = new mongoose.Schema({
  wp_asset_id: { type: Number },
  type: { type: String, enum: ['video', 'tvshow', 'movie', 'episode', 'movies', 'tvshows'], required: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  images: [{ type: String }], 
  videoUrl: [{ type: String }], 
  trailerUrl: { type: String },
  program: {
    programName: String,
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset' } 
  },
  languages: [{ type: String }],
  genres: [{ type: String }],
  tags: [{ type: String }],
  membership_level: [{
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planName: String
  }],
  publishedDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MediaAsset', MediaAssetSchema);
