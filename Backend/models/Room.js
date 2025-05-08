const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  // quizId: { type: String, required: true },
  host: { type: String, required: true }, // User ID of host
  quizId: { type: String, required: true },
  participants: [{
    userId: String,
    username: String,
    score: Number,
    percentage: Number,
    submitted: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // Expires in 24h
});

module.exports = mongoose.model('Room', roomSchema);