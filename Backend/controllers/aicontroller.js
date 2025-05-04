const quiz = require('../services/quiz');
// const User = require('../models/User'); // Assuming you have a User model

const generateQuiz = async (req, res) => {
    const { topic } = req.body;
    
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }
    
    try {
        const quizData = await quiz(topic);
        console.log('Quiz data : ',quizData.questions);
        console.log('Quiz answers : ',quizData.answers);
        
        if (!quizData || !quizData.questions || !quizData.answers) {
            return res.status(500).json({ error: 'Failed to generate a valid quiz' });
        }
        
        // Generate a unique quiz ID
        const quizId = Date.now().toString();
        
        // Store quiz in session or database
        req.session = req.session || {};
        req.session.quizzes = req.session.quizzes || {};
        req.session.quizzes[quizId] = {
            topic,
            questions: quizData.questions,
            answers: quizData.answers,
            createdAt: new Date()
        };
        
        // Return only questions to the client (not answers)
        res.status(200).json({
            quizId,
            topic,
            questions: quizData.questions,
            answers:quizData.answers
        });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
};

// const submitQuiz = async (req, res) => {
//     const { quizId, userAnswers, userId } = req.body;
    
//     if (!quizId || !userAnswers || !Array.isArray(userAnswers)) {
//         return res.status(400).json({ error: 'Invalid quiz submission' });
//     }
    
//     try {
//         // Retrieve quiz data from session
//         const quizData = req.session?.quizzes?.[quizId];
        
//         if (!quizData) {
//             return res.status(404).json({ error: 'Quiz not found' });
//         }
        
//         // Calculate score
//         let score = 0;
//         const results = userAnswers.map((answer, index) => {
//             const isCorrect = quizData.answers[index] === answer;
//             if (isCorrect) score++;
//             return {
//                 question: index,
//                 userAnswer: answer,
//                 correctAnswer: quizData.answers[index],
//                 isCorrect
//             };
//         });
        
//         // Calculate percentage
//         const percentage = (score / quizData.answers.length) * 100;
        
//         // Save to leaderboard (if userId provided)
//         let leaderboardEntry = null;
//         if (userId) {
//             try {
//                 // Save to database (assuming you have a User model with quizResults array)
//                 leaderboardEntry = await User.findByIdAndUpdate(
//                     userId,
//                     {
//                         $push: {
//                             quizResults: {
//                                 quizId,
//                                 topic: quizData.topic,
//                                 score,
//                                 percentage,
//                                 completedAt: new Date()
//                             }
//                         }
//                     },
//                     { new: true }
//                 );
//             } catch (dbError) {
//                 console.error('Database error:', dbError);
//                 // Continue with response even if DB update fails
//             }
//         }
//         console.log('Score : ',score);
        
//         // Return results
//         res.status(200).json({
//             score,
//             total: quizData.answers.length,
//             percentage,
//             results,
//             leaderboardEntry
//         });
//     } catch (error) {
//         console.error('Quiz submission error:', error);
//         res.status(500).json({ error: 'Failed to process quiz submission' });
//     }
// };

const submitQuiz = async (req, res) => {
    const { quizId, userAnswers, correctAnswers, userId } = req.body;
  
    if (!quizId || !userAnswers || !correctAnswers ) {
      return res.status(400).json({ error: 'Missing data in request' });
    }
  
    let score = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        score++;
      }
    }
  
    console.log('Score : ',score);
    // You could store the result in a DB here if needed
  
    res.status(200).json({
      message: 'Quiz submitted successfully',
      quizId,
      userId,
      score,
      total: correctAnswers.length
    });
  };
  

// const getLeaderboard = async (req, res) => {
//     const { topic } = req.query;
    
//     try {
//         const query = topic ? { 'quizResults.topic': topic } : {};
        
//         const leaderboard = await User.aggregate([
//             { $match: query },
//             { $unwind: '$quizResults' },
//             ...(topic ? [{ $match: { 'quizResults.topic': topic } }] : []),
//             { $sort: { 'quizResults.percentage': -1, 'quizResults.completedAt': 1 } },
//             { $limit: 10 },
//             {
//                 $project: {
//                     _id: 0,
//                     userId: '$_id',
//                     username: '$username',
//                     topic: '$quizResults.topic',
//                     score: '$quizResults.score',
//                     percentage: '$quizResults.percentage',
//                     completedAt: '$quizResults.completedAt'
//                 }
//             }
//         ]);
        
//         res.status(200).json({ leaderboard });
//     } catch (error) {
//         console.error('Leaderboard retrieval error:', error);
//         res.status(500).json({ error: 'Failed to retrieve leaderboard' });
//     }
// };

module.exports = {
    generateQuiz,
    submitQuiz
    // getLeaderboard
};