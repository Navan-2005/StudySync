const express=require('express');
const router=express.Router();
const {generateQuiz,submitQuiz}=require('../controllers/aicontroller');

router.post('/generate-quiz',generateQuiz);

router.post('/submit-quiz', submitQuiz);

module.exports=router;