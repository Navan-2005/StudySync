from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import PyPDF2
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app1 = Flask(__name__)
CORS(app1)

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

def extract_text_from_pdf(pdf_file):
    """Extract text content from a PDF file"""
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def generate_mcqs(text, num_questions=5):
    """Generate MCQs using Gemini AI model"""
    prompt = f"""
    Generate {num_questions} multiple-choice questions based on the following text. 
    For each question, provide 4 options with exactly one correct answer.
    Format the output as a JSON array of objects with the following structure:
    [
        {{
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
        }}
    ]
    
    Here's the text:
    {text[:10000]}
    """
    
    response = model.generate_content(prompt)
    
    try:
        # Extract the JSON portion from the response
        response_text = response.text
        # Find JSON array in the response
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']') + 1
        
        if start_idx == -1 or end_idx == 0:
            return {"error": "Failed to parse MCQs from AI response"}
        
        json_str = response_text[start_idx:end_idx]
        mcqs = json.loads(json_str)
        return mcqs
    except Exception as e:
        print(f"Error parsing response: {e}")
        return {"error": f"Failed to generate MCQs: {str(e)}"}

@app1.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle PDF upload and MCQ generation"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "Only PDF files are supported"}), 400
    
    try:
        # Get number of questions (default to 5)
        num_questions = int(request.form.get('numQuestions', 5))
        
        # Extract text from PDF
        text = extract_text_from_pdf(file)
        
        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400
        
        # Generate MCQs
        mcqs = generate_mcqs(text, num_questions)
        
        return jsonify({"mcqs": mcqs})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app1.run(debug=True)