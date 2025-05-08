const Room = require('../models/Room');
const Quiz = require('../models/QuizModel');
const { getIO } = require('../services/socket');

// Create a new quiz room
exports.createRoom = async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    // Generate unique room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = new Room({
      roomId,
      host: userId,
      quizId:'12345',
      participants: [{
        userId,
        username,
        score: 0,
        percentage: 0,
        submitted: false
      }]
    });
    
    await room.save();
    
    res.status(201).json({
      success: true,
      roomId,
      message: 'Room created successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join an existing room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, userId, username } = req.body;
    
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    // Check if user already joined
    const existingParticipant = room.participants.find(p => p.userId === userId);
    if (!existingParticipant) {
      room.participants.push({
        userId,
        username,
        score: 0,
        percentage: 0,
        submitted: false
      });
      await room.save();
    }
    
    // Notify all clients in the room
    getIO().to(roomId).emit('participant-joined', { userId, username });
    
    res.status(200).json({
      success: true,
      quizId: room.quizId,
      roomId: room.roomId,
      participants: room.participants
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quiz results
exports.submitQuiz = async (req, res) => {
  try {
    const { roomId, userId, score, percentage } = req.body;
    
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    // Update participant's score
    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.score = score;
      participant.percentage = percentage;
      participant.submitted = true;
      await room.save();
    }
    
    // Notify all clients in the room
    getIO().to(roomId).emit('quiz-submitted', { 
      userId, 
      username: participant.username,
      score,
      percentage 
    });
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    // Sort participants by score (descending)
    const leaderboard = room.participants
      .filter(p => p.submitted)
      .sort((a, b) => b.percentage - a.percentage);
    
    res.status(200).json({
      success: true,
      leaderboard,
      quizId: room.quizId
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz for a room
// exports.getRoomQuiz = async (req, res) => {
//     try {
//       const { roomId } = req.params;
      
//       const room = await Room.findOne({ roomId });
//       if (!room) return res.status(404).json({ error: 'Room not found' });
      
//       const quiz = await Quiz.findOne({ quizId: room.quizId });
//       if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
      
//       // Return quiz without correct answers
//       const quizForParticipants = {
//         ...quiz.toObject(),
//         questions: quiz.questions.map(q => ({
//           questionText: q.questionText,
//           options: q.options,
//           timeLimit: q.timeLimit
//         }))
//       };
      
//       res.status(200).json({
//         success: true,
//         quiz: quizForParticipants
//       });
      
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
