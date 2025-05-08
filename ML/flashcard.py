import google.generativeai as genai  # Google Gemini API
import json                          # For handling JSON responses
from PyPDF2 import PdfReader         # To read text from PDF files
# from fpdf import FPDF                # To generate PDF documents
# from datetime import datetime        # To add date in PDF
# import time                          # For timer (optional)
# import os     
from flask import Flask,request,jsonify


genai.configure(api_key="AIzaSyBVUNtLJ0euKK6OOdkKKZvMfbs7zTJysjE")
def extract_text_from_pdf(pdf_file):
    pdf_reader = PdfReader(pdf_file)
    return "".join(page.extract_text() for page in pdf_reader.pages)

def generate_flashcards(text, count=5, difficulty="medium"):
    prompt = f"""
    Generate {count} {difficulty}-level flashcards from the following educational content.

    Return STRICTLY and ONLY valid JSON in this format:
    [
      {{
        "topic": "...",
        "info": "..."
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
    
app = Flask(__name__)

@app.route("/generate-flashcards", methods=["POST"])
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

if __name__ == "__main__":
    app.run(debug=True)
