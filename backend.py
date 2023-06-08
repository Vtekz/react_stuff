from flask import Flask, request, jsonify
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter
import openai
import os
import re
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "https://comfyworkspace.com/blog-generator/"}})  # Replace with your React app's domain

load_dotenv()
# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Rate limiting to prevent abuse
limiter = Limiter(key_func=get_remote_address)
limiter.init_app(app)


def validate_data(data):
    # Perform some validation on the data
    required_params = ['content_type', 'target_audience', 'keywords', 'blog_length', 'tone']
    if not all(param in data for param in required_params):
        raise ValueError("Missing parameters in request")

    if not isinstance(data['keywords'], list) or len(data['keywords']) == 0:
        raise ValueError("Keywords should be a list with at least one keyword")

    if not isinstance(data['blog_length'], int) or data['blog_length'] < 1:
        raise ValueError("Blog length should be a positive integer")

    if 'additional_instructions' in data and not isinstance(data['additional_instructions'], list):
        raise ValueError("Additional instructions should be a list")

    if not re.match("^[a-zA-Z0-9_]*$", data['tone']):
        raise ValueError("Tone should be alphanumeric")

@app.route('/generate', methods=['POST'])
@limiter.limit("5/minute")  # adjust to your needs
def generate():
    # Check if request is in JSON format
    if not request.is_json:
        return jsonify({"message": "Missing JSON in request"}), 400

    data = request.get_json()

    try:
        validate_data(data)
    except ValueError as e:
        return jsonify({"message": "Validation failed: " + str(e)}), 400

        # handle when 'additional_instructions' might not be present
    additional_instructions = ''
    if 'additional_instructions' in data:
        additional_instructions = ', '.join(data['additional_instructions'])

    # Create prompt
    # Create prompt
    prompt = f"Write a {data['content_type']} blog post targeted at {data['target_audience']} on the topic of {', '.join(data['keywords'])}. The post should be {data['blog_length']} words long, use a {data['tone']} tone, and include the following points: {additional_instructions}. Please format the output using HTML tags, including headings (e.g. <h1>, <h2>, <h3>, <h4>, <h5>, <h6>), sections, paragraphs (<p>), bullet points (<ul> and <li>), ordered lists (<ol>), blockquotes (<blockquote>), preformatted text and code snippets (<pre> and <code>), hyperlinks (<a>), images (<img>), bold text (<strong> or <b>), italic text (<em> or <i>), underlined text (<u>), strikethrough text (<s> or <del>), subscript text (<sub>), superscript text (<sup>), horizontal rules (<hr>), and tables (<table>, <thead>, <tbody>, <tfoot>, <tr>, <th>, <td>)."

    try:
        # Generate text
        response = openai.Completion.create(
            engine="text-davinci-003",  # replace with your engine of choice
            prompt=prompt,
            max_tokens=2048  # this may need to be adjusted depending on desired length of generated content
        )

        # Extract generated text from the response
        generated_text = response['choices'][0]['text'].strip()

        # Return the generated text
        return jsonify({"generated_text": generated_text}), 200

    except Exception as e:
        print("Exception:", e)  # Add this line to log the exception details
        return jsonify({"message": "Error generating text"}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=False)
