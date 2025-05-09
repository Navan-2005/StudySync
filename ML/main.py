# import os
# from youtube_transcript_api import YouTubeTranscriptApi
# import google.generativeai as genai
# from dotenv import load_dotenv

# # Load API key
# load_dotenv()
# api_key ="AIzaSyBVUNtLJ0euKK6OOdkKKZvMfbs7zTJysjE"
# genai.configure(api_key=api_key)

# def summarize_video(video_url):
#     try:
#         video_id = video_url.split("v=")[-1].split("&")[0]

#         # Get transcript
#         transcript = YouTubeTranscriptApi.get_transcript(video_id)
#         text = " ".join([t['text'] for t in transcript])

#         # Prepare prompt
#         prompt = f"""
#         Summarize this transcript as follows:
#         1. Introduction
#         2. Main Topics Covered
#         3. Key Takeaways
#         4. Conclusion

#         Transcript:
#         {text[:12000]}
#         """

#         # Generate summary
#         model = genai.GenerativeModel("gemini-1.5-flash")
#         response = model.generate_content(prompt)

#         return response.text

#     except Exception as e:
#         return f"❌ Error: {str(e)}"

# if _name_ == '_main_':
#     print("🔗 Enter a YouTube video URL to summarize:")
#     url = input("URL: ").strip()
#     print("\n⏳ Summarizing...\n")
#     summary = summarize_video(url)
#     print("📄 Summary:\n")
#     print(summary)
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json                          # For handling JSON responses
from PyPDF2 import PdfReader 
# import cv2
# from deepface import DeepFace

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Check if API key is available
if not api_key:
    print("⚠ WARNING: GEMINI_API_KEY not found in environment variables")

app = Flask(__name__)  # Fixed: __name_ has double underscores
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for all origins



def extract_text_from_pdf(pdf_file):
    pdf_reader = PdfReader(pdf_file)
    return "".join(page.extract_text() for page in pdf_reader.pages)

def generate_flashcards(text, count=7, difficulty="medium"):
    prompt = f"""
    Generate {count} {difficulty}-level flashcards from the following educational content.

    Return STRICTLY and ONLY valid JSON in this format:
    [
      {{
        "topic": "...",
        "definition": "..."
      }},
      ...
    ]

    Text:
    {text[:8000]}
    """
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    try:
        raw = response.text.strip()
        clean_output = raw.replace("```json", "").replace("```", "").strip()
        flashcards = json.loads(clean_output)
        return flashcards
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return []
    


@app.route('/summarize', methods=['POST'])
def summarize_video():
    try:
        # Log the request origin and referer to see where the request is coming from
        request_origin = request.headers.get('Origin')
        request_referer = request.headers.get('Referer')
        
        # Print or log the origin and referer
        print(f"Request received from Origin: {request_origin}, Referer: {request_referer}")
        
        # Extract the URL from the incoming request
        data = request.get_json()
        
        # Validate that data and URL exist
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        video_url = data.get('url')
        if not video_url:
            return jsonify({"error": "No URL provided in request"}), 400
            
        print(f"Processing URL: {video_url}")
        
        # Handle different YouTube URL formats
        if "v=" in video_url:
            video_id = video_url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in video_url:
            video_id = video_url.split("youtu.be/")[1].split("?")[0]
        else:
            return jsonify({"error": "Invalid YouTube URL format"}), 400
            
        print(f"Extracted video ID: {video_id}")
        
        # Get the transcript using YouTubeTranscriptApi
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            text = " ".join([t['text'] for t in transcript])
            print(f"Transcript retrieved, length: {len(text)} characters")
        except Exception as transcript_error:
            print(f"Transcript error: {transcript_error}")
            return jsonify({"error": f"Failed to retrieve transcript: {str(transcript_error)}"}), 404
        
        # Summarize using Gemini
        try:
            prompt = f"""
            Summarize this transcript as follows:
            1. Introduction
            2. Main Topics Covered
            3. Key Takeaways
            4. Conclusion
            
            Transcript:
            {text[:12000]}
            """
            
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            summary = response.text
            
            print("Summary generated successfully")
            return jsonify({"summary": summary})
        except Exception as gemini_error:
            print(f"Gemini API error: {gemini_error}")
            return jsonify({"error": f"Failed to generate summary: {str(gemini_error)}"}), 500
            
    except Exception as e:
        print(f"General error: {e}")
        return jsonify({"error": str(e)}), 400

# Add a new route for generating flashcards
@app.route('/flashcard', methods=['POST'])
def generate_flashcards_endpoint():
     if 'pdf' not in request.files:
        return jsonify({"error": "PDF file is required."}), 400
     
     # Get the uploaded PDF file
     pdf_file = request.files['pdf']
     
     # Extract text from the PDF
     extracted_text = extract_text_from_pdf(pdf_file)
     
     # Generate flashcards using the extracted text
     flashcards = generate_flashcards(extracted_text)

     if not flashcards:
        return jsonify({"error": "Failed to generate flashcards."}), 500
     
     return jsonify({"flashcards": flashcards})

# @app.route('/emotion', methods=['POST'])
# def detect_emotion():
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         raise IOError("Cannot open webcam")

#     ret, frame = cap.read()
#     cap.release()

#     if not ret:
#         return {"error": "Failed to capture frame"}

#     try:
#         result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
#         dominant_emotion = result[0]['dominant_emotion']
#         return {"dominant_emotion": dominant_emotion}
#     except Exception as e:
#         return {"error": str(e)}


# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == '__main__':  # Fixed: __name_ has double underscores
    print("App Server will start on http://localhost:8000")
    app.run(debug=True, host='0.0.0.0', port=8000)