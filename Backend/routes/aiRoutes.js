const express=require('express');
const router=express.Router();
const {generateQuiz,submitQuiz,chatBot,getLeaderboard,mentalhelper}=require('../controllers/aicontroller');

router.post('/generate-quiz',generateQuiz);

router.post('/submit-quiz', submitQuiz);

router.post('/chatbot',chatBot);

router.get('/leaderboard/:quizId',getLeaderboard);

router.post('/mental-uplifter',mentalhelper)
module.exports=router;