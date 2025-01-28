from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/invention-date', methods=['POST'])
def get_invention_date():
    try:
        data = request.get_json()
        item = data.get('item')
        
        if not item:
            return jsonify({'error': 'No item provided'}), 400

        prompt = f"When was the {item} invented? Please respond with just the year (use negative numbers for BCE). If you're not certain, respond with 'unknown'."
        response = model.generate_content(prompt)
        
        try:
            year = int(response.text.strip())
            return jsonify({'year': year})
        except ValueError:
            return jsonify({'error': 'Could not determine invention date'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 