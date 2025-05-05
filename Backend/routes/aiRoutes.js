const express=require('express');
const router=express.Router();
const {generateQuiz,submitQuiz,chatBot}=require('../controllers/aicontroller');

router.post('/generate-quiz',generateQuiz);

router.post('/submit-quiz', submitQuiz);

router.post('/chatbot',chatBot);

module.exports=router;