from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
import os
import json

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/recommend', methods=['POST'])
def recommend_resources():
    data = request.json
    user_input = f"Zip Code: {data['zipCode']}, Income Range: {data['incomeRange']}, Education Level: {data['educationLevel']}, Number of Kids: {data.get('numKids', 'Not specified')}"

    # Call OpenAI API with structured format request
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant specializing in finding support resources for families. Provide comprehensive recommendations across multiple categories including: Educational Support, Financial Assistance, Healthcare Resources, Childcare Services, Career Development, Housing Assistance, and Community Programs."},
            {"role": "user", "content": f"Provide a detailed list of at least 6-8 support programs and resources across different categories for a family with the following details: {user_input}. Include a mix of local, state, and federal programs where applicable. Format the response as a plain JSON array with fields: category, name, description, eligibility, action, and url. Ensure each entry includes a valid URL for more information. The response should be a JSON array without any markdown formatting or triple backticks."}
        ]
    )

    # Debugging: Print the raw response
    raw_response = response.choices[0].message['content']
    print("Raw API Response:", raw_response)

    # Strip any markdown formatting
    stripped_response = raw_response.strip().strip('```')

    # Process the response
    try:
        resources = json.loads(stripped_response)
        if not isinstance(resources, list):
            return jsonify({"error": "API response is not a JSON array."}), 500
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        return jsonify({"error": "Failed to decode JSON from API response."}), 500

    return jsonify({"resources": resources})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
