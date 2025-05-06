const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Room routes
router.post('/create', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.post('/submit', roomController.submitQuiz);
router.get('/:roomId/leaderboard', roomController.getLeaderboard);

module.exports = router;