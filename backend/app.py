from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
import os
import json
import urllib.parse

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def create_google_search_url(query):
    """Create a Google search URL for a given query"""
    base_url = "https://www.google.com/search"
    params = {"q": query}
    return f"{base_url}?{urllib.parse.urlencode(params)}"

def ensure_valid_url(resource):
    """Ensure the resource has a valid URL, fallback to Google search if not"""
    if not resource.get('url') or not resource['url'].startswith(('http://', 'https://')):
        search_query = f"{resource['name']} {resource['category']} program"
        resource['url'] = create_google_search_url(search_query)
    return resource

@app.route('/recommend', methods=['POST'])
def recommend_resources():
    data = request.json
    user_input = f"Zip Code: {data['zipCode']}, Income Range: {data['incomeRange']}, Education Level: {data['educationLevel']}, Number of Kids: {data.get('numKids', 'Not specified')}"

    # Call OpenAI API with structured format request
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": """You are a helpful assistant specializing in finding support resources for families. 
            Provide comprehensive recommendations across multiple categories including: 
            - Educational Support (e.g., tutoring programs, school choice, adult education)
            - Financial Assistance (e.g., SNAP, TANF, utility assistance, tax credits)
            - Healthcare Resources (e.g., Medicaid, CHIP, free clinics, mental health)
            - Childcare Services (e.g., Head Start, subsidized daycare, after-school programs)
            - Career Development (e.g., job training, resume help, workforce programs)
            - Housing Assistance (e.g., Section 8, public housing, rental assistance)
            - Community Programs (e.g., food banks, clothing assistance, transportation)
            
            For each category, provide at least 2-3 specific programs or resources. Include both local and national programs.
            Be specific with program names and ensure descriptions are detailed and actionable."""},
            {"role": "user", "content": f"""Provide a detailed list of at least 15-20 support programs and resources across different categories for a family with the following details: {user_input}. 
            Include a mix of local, state, and federal programs.
            For each resource, provide:
            1. A specific program name
            2. Detailed description of services
            3. Clear eligibility criteria
            4. Specific action steps to apply or access the service
            5. A URL for more information (if you're not 100% certain about a URL, leave it blank)
            
            Format the response as a plain JSON array with fields: category, name, description, eligibility, action, and url.
            The response should be a JSON array without any markdown formatting or triple backticks."""}
        ],
        temperature=0.7,
        max_tokens=2500  # Increased token limit for more comprehensive responses
    )

    # Process the response
    try:
        raw_response = response.choices[0].message['content'].strip().strip('```')
        resources = json.loads(raw_response)
        
        if not isinstance(resources, list):
            return jsonify({"error": "API response is not a JSON array."}), 500
            
        # Ensure valid URLs for each resource
        resources = [ensure_valid_url(resource) for resource in resources]
        
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        return jsonify({"error": "Failed to decode JSON from API response."}), 500

    return jsonify({"resources": resources})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=True)
