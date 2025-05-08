const quiz = require('../services/quiz');
const User = require('../models/User'); // Assuming you have a User model
const chatbot = require('../services/chatbot');
const QuizModel=require('../models/QuizModel')
const mentalchatbot=require('../services/mentalchatbot');

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
        // if (userId) {
        //     try {
        //         // Save to database (assuming you have a User model with quizResults array)
        //         leaderboardEntry = await User.findByIdAndUpdate(
        //             userId,
        //             {
        //                 $push: {
        //                     quizResults: {
        //                         quizId,
        //                         topic: quizData.topic,
        //                         score,
        //                         percentage,
        //                         completedAt: new Date()
        //                     }
        //                 }
        //             },
        //             { new: true }
        //         );
        //     } 
//                catch (dbError) {
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

// const generateQuiz = async (req, res) => {
//   const { topic, title, description, difficulty } = req.body;
//   const userId = req.user?._id; // Assuming you're using auth middleware

//   if (!topic || !userId || !title) {
//       return res.status(400).json({ error: 'Topic, title, and user ID are required' });
//   }

//   try {
//       const quizData = await quiz(topic);

//       if (!quizData || !quizData.questions || !quizData.answers) {
//           return res.status(500).json({ error: 'Failed to generate a valid quiz' });
//       }

//       // Prepare question objects
//       const questions = quizData.questions.map((q, index) => ({
//           questionText: q.questionText,
//           options: q.options,
//           correctAnswer: quizData.answers[index],
//           timeLimit: q.timeLimit || 30
//       }));

//       // Create a new quiz document
//       const newQuiz = new Quiz({
//           title,
//           description: description || '',
//           topic,
//           questions,
//           createdBy: userId,
//           difficulty: difficulty || 'Medium',
//       });

//       // Save to database
//       await newQuiz.save();

//       res.status(201).json({
//           message: 'Quiz generated and saved successfully',
//           quizId: newQuiz.quizId,
//           questions: newQuiz.questions.map(q => ({
//               questionText: q.questionText,
//               options: q.options,
//               timeLimit: q.timeLimit
//           }))
//       });
//   } catch (error) {
//       console.error('Quiz generation error:', error);
//       res.status(500).json({ error: 'Failed to generate quiz' });
//   }
// };

const submitQuiz = async (req, res) => {
  const { quizId, topic, userAnswers, correctAnswers, userId } = req.body;
 const user=await User.findById(userId);
 const username=user.username;
  // Validate required fields
  if (!quizId || !userAnswers || !correctAnswers || !username) {
    return res.status(400).json({ error: 'Missing data in request' });
  }

  // Calculate score
  let score = 0;
  for (let i = 0; i < correctAnswers.length; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
      score++;
    }
  }

  const percentage = (score / correctAnswers.length) * 100;

  try {
    // Find or create the quiz entry
    const quizEntry = await QuizModel.findOneAndUpdate(
      { quizId: quizId },
      {
        $setOnInsert: { topic, createdAt: new Date() }, // Only set on insert
        $push: {
          users: {
            username,
            score,
            percentage
          }
        }
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true // Return the updated document
      }
    );

    // If you still want to update the user's quiz results (from your User model)
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            quizResults: {
              quizId,
              topic,
              score,
              percentage,
              completedAt: new Date()
            }
          }
        }
      );
    }

    // Respond with quiz submission results
    res.status(200).json({
      message: 'Quiz submitted successfully',
      quizId,
      userId,
      score,
      percentage,
      total: correctAnswers.length
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database update failed' });
  }
};

const chatBot=async(req,res)=>{
  const { prompt, history = [] } = req.body;

  try {
    const chat = await chatbot(prompt, history);
    res.status(200).json({ chat });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error generating reponse" });
  }
}
  

const getLeaderboard = async (req, res) => {
  try {
      const { quizId } = req.params; // Assuming quizId comes from URL params

      if (!quizId) {
          return res.status(400).json({ error: 'Quiz ID is required' });
      }

      // Find the quiz and get users sorted by percentage in descending order
      const quiz = await QuizModel.findOne(
          { quizID: quizId },
          { users: 1 } // Only return the users array
      ).sort({ 'users.percentage': -1 }); // Sort users by percentage (highest first)

      if (!quiz) {
          return res.status(404).json({ error: 'Quiz not found' });
      }

      // Sort the users array by percentage (highest to lowest)
      const sortedUsers = quiz.users.sort((a, b) => b.percentage - a.percentage);

      // Optionally limit the number of results (e.g., top 10)
      // const topUsers = sortedUsers.slice(0, 10);
      console.log('leaderboard : ',sortedUsers);
      
      res.status(200).json({
          success: true,
          leaderboard: sortedUsers,
          count: sortedUsers.length
      });

  } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const mentalhelper=async (req,res)=>{
  const { prompt, history = [] } = req.body;

  try {
    const chat = await chatbot(prompt, history);
    console.log(chat);
    
    res.status(200).json({ chat });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error generating reponse" });
  }
}

module.exports = {
    generateQuiz,
    submitQuiz,
    chatBot,
    getLeaderboard,
    mentalhelper
};