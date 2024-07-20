from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Retrieve the OpenAI API key from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/update_text', methods=['POST'])
def update_text():
    data = request.json
    text = data['text']
    target_language = data['target_language']

    detected_language = detect_language(text)
    translated_text = translate_text(text, target_language)

    return jsonify({
        'detected_language': detected_language,
        'translated_text': translated_text
    })

def detect_language(text):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a language detection assistant."},
            {"role": "user", "content": f"Detect the language of the following text:\n\n{text}"}
        ]
    )
    return response['choices'][0]['message']['content'].strip()

def translate_text(text, target_language):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a translation assistant."},
            {"role": "user", "content": f"Translate the following text to {target_language}:\n\n{text}"}
        ]
    )
    return response['choices'][0]['message']['content'].strip()

if __name__ == "__main__":
    app.run(debug=True)
