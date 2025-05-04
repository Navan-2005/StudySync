require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  apiVersion: "v1"
});

const quiz = async (topic) => {
  try {
    // Use a more structured format that is easier to parse
    const prompt = `Generate a quiz of 5 multiple choice questions on the topic of "${topic}".
    For each question:
    1. Provide the question text
    2. Provide four options labeled A), B), C), and D)
    3. Indicate which option is correct

    Format each question like this:
    Question: [Question text]
    A) [Option A]
    B) [Option B]
    C) [Option C]
    D) [Option D]
    Answer: [Correct letter]

    After generating all 5 questions, do not include any additional text or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw API response:", text);
    
    // Manual parsing of the text-based response
    const questions = [];
    const answers = [];
    
    // Split by questions (looking for patterns like "Question:" or "Q1:", etc.)
    const questionBlocks = text.split(/Question(?:\s\d+)?:|Q\d+:/).filter(block => block.trim());
    
    questionBlocks.forEach(block => {
      try {
        // Clean up the block
        const cleanBlock = block.trim();
        
        // Extract the question text (everything up to the first option)
        const questionMatch = cleanBlock.match(/^(.*?)(?=A\))/s);
        if (!questionMatch) return;
        
        const questionText = questionMatch[1].trim();
        
        // Extract options
        const options = [];
        const optionsText = cleanBlock.match(/[A-D]\).*?(?=[A-D]\)|Answer:|$)/gs);
        
        if (optionsText && optionsText.length > 0) {
          optionsText.forEach(option => {
            options.push(option.trim());
          });
        }
        
        // Extract the answer
        const answerMatch = cleanBlock.match(/Answer:\s*([A-D])/i);
        let answer = '';
        
        if (answerMatch && answerMatch[1]) {
          answer = answerMatch[1];
          answers.push(answer);
        }
        
        // Only add the question if we have all required parts
        if (questionText && options.length === 4 && answer) {
          questions.push({
            question: questionText,
            options
          });
        }
      } catch (err) {
        console.error("Error processing question block:", err);
      }
    });
    
    // If we couldn't parse enough questions, try a simpler fallback approach
    if (questions.length < 5) {
      console.log("Using fallback parsing method");
      
      // Clear existing data
      questions.length = 0;
      answers.length = 0;
      
      // Simple line-by-line parsing
      const lines = text.split('\n').filter(line => line.trim());
      let currentQuestion = null;
      let currentOptions = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is a question line
        if (line.match(/^(Question|Q\d+):/i)) {
          // Save previous question if exists
          if (currentQuestion && currentOptions.length === 4) {
            questions.push({
              question: currentQuestion,
              options: [...currentOptions]
            });
            currentOptions = [];
          }
          
          // Extract new question text
          currentQuestion = line.replace(/^(Question|Q\d+):\s*/i, '').trim();
        }
        // Check if this is an option line
        else if (line.match(/^[A-D]\)/)) {
          currentOptions.push(line);
        }
        // Check if this is an answer line
        else if (line.match(/^Answer:\s*[A-D]/i)) {
          const answerMatch = line.match(/^Answer:\s*([A-D])/i);
          if (answerMatch && answerMatch[1]) {
            answers.push(answerMatch[1]);
          }
        }
      }
      
      // Add the last question if it exists
      if (currentQuestion && currentOptions.length === 4 && answers.length === questions.length + 1) {
        questions.push({
          question: currentQuestion,
          options: [...currentOptions]
        });
      }
    }
    
    console.log("Parsed questions:", questions);
    console.log("Parsed answers:", answers);
    
    // Make sure we have valid data
    if (questions.length === 0 || answers.length === 0 || questions.length !== answers.length) {
      throw new Error("Failed to parse quiz data properly");
    }
    
    return { questions, answers };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

module.exports = quiz;