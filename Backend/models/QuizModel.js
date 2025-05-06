const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, default: 30 } // in seconds
});

const quizSchema = new mongoose.Schema({
  quizId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  title: { type: String, required: true },
  description: { type: String },
  topic: { type: String, required: true },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: false },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
});

// Add index for faster search
quizSchema.index({ title: 'text', topic: 'text' });

// Static method to get quizzes by creator
quizSchema.statics.findByCreator = function(userId) {
  return this.find({ createdBy: userId });
};

// Instance method to get basic info
quizSchema.methods.getInfo = function() {
  return {
    quizId: this.quizId,
    title: this.title,
    topic: this.topic,
    questionCount: this.questions.length,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Quiz', quizSchema);