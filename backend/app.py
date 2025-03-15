from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import uuid
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")
print(f"API Key loaded: {api_key[:10]}...")

openai.api_key = api_key

app = Flask(__name__)
CORS(app)

# Store chat sessions
sessions = {}

def get_all_resources(user_info):
    prompt = f"""Generate comprehensive resource recommendations as a JSON array. Each resource should include these fields:
    {{
        "name": "Program name",
        "category": "Type of assistance",
        "description": "Clear description",
        "eligibility": "Requirements",
        "contact": "Contact info",
        "hours": "Operating hours",
        "action": "Steps to access",
        "url": "Website",
        "priority": "emergency/primary/additional"
    }}

    User profile:
    - Has Emergency: {user_info.get('has_emergency', False)}
    - ZIP Code: {user_info.get('zip_code')}
    - Needs: {', '.join(user_info.get('needs', []))}
    - Household Size: {user_info.get('household_size')}
    - Monthly Income: {user_info.get('income')}

    Important:
    1. Mark resources as 'emergency' priority if they provide immediate crisis assistance
    2. Mark as 'primary' if they directly match user's needs
    3. Mark as 'additional' for supplementary support
    4. Ensure resources are relevant to their income level
    5. Include only realistic and actionable resources
    6. Return exactly 12 resources total
    7. Format as a clean JSON array only"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides well-organized resource recommendations in perfect JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message['content'].strip()
        if not content.startswith('[') or not content.endswith(']'):
            content = content[content.find('['):content.rfind(']')+1]
        
        resources = json.loads(content)
        return resources
    except Exception as e:
        print(f"Error generating resources: {str(e)}")
        return []

def get_detailed_resource_info(resource_name, base_info, zip_code):
    prompt = f"""Provide detailed information about this resource/organization in a natural, informative paragraph format:

Resource Name: {resource_name}
Base Category: {base_info.get('category')}
Location Area: Near ZIP code {zip_code}

Include in your response:
1. A detailed description of their services and programs
2. Their mission statement and values
3. Specific eligibility requirements and documentation needed
4. Complete contact information (phone, email, website)
5. Physical address or service locations
6. Hours of operation and availability
7. Application or enrollment process
8. Any important deadlines or waiting periods
9. Additional support services they may offer
10. Any partnerships with other organizations

Make the information detailed but easy to read. If certain details aren't typically available for this type of service, provide general guidance instead.
Focus on making the information actionable and helpful for someone seeking these services."""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a knowledgeable resource coordinator providing detailed, accurate information about community services and support programs."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        print(f"Error getting detailed resource info: {str(e)}")
        return None

@app.route('/chat/start', methods=['POST'])
def start_chat():
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'user_info': {},
        'current_step': 'initial'
    }
    
    return jsonify({
        'sessionId': session_id,
        'message': "Hi! I'm here to help you find resources and support programs. I'll ask you a few questions to understand your situation better.",
        'nextQuestion': {
            'type': 'emergency',
            'message': "First, are you currently facing any urgent needs or emergency situations?",
            'options': ['Yes', 'No']
        }
    })

@app.route('/chat/respond', methods=['POST'])
def chat_respond():
    data = request.json
    session_id = data.get('sessionId')
    question_type = data.get('questionType')
    answer = data.get('answer')
    
    if not session_id or session_id not in sessions:
        return jsonify({'error': 'Invalid session'}), 400
    
    session = sessions[session_id]
    
    # Update user info based on current question
    if question_type == 'emergency':
        session['user_info']['has_emergency'] = answer == 'Yes'
        return jsonify({
            'message': "Thank you for letting me know. What's your ZIP code? This helps me find local resources.",
            'nextQuestion': {
                'type': 'zip_code',
                'message': "What's your ZIP code?"
            }
        })
    
    elif question_type == 'zip_code':
        session['user_info']['zip_code'] = answer
        return jsonify({
            'message': "What specific types of assistance are you looking for? Select all that apply.",
            'nextQuestion': {
                'type': 'needs',
                'message': "What types of help do you need?",
                'options': [
                    'Housing/Shelter',
                    'Food Assistance',
                    'Healthcare',
                    'Mental Health',
                    'Employment',
                    'Education/Training',
                    'Childcare',
                    'Transportation',
                    'Legal Aid',
                    'Financial Assistance'
                ],
                'multiple': True
            }
        })
    
    elif question_type == 'needs':
        session['user_info']['needs'] = answer
        return jsonify({
            'message': "How many people are in your household?",
            'nextQuestion': {
                'type': 'household_size',
                'message': "Household size (including yourself):",
                'options': ['1', '2', '3', '4', '5+']
            }
        })
    
    elif question_type == 'household_size':
        session['user_info']['household_size'] = answer
        return jsonify({
            'message': "What's your approximate monthly household income? This helps me find programs you may qualify for.",
            'nextQuestion': {
                'type': 'income',
                'message': "Monthly household income:",
                'options': [
                    'Less than $1,000',
                    '$1,000 - $2,000',
                    '$2,000 - $3,000',
                    '$3,000 - $4,000',
                    'More than $4,000'
                ]
            }
        })
    
    elif question_type == 'income':
        session['user_info']['income'] = answer
        # Now that we have all info, generate comprehensive resources
        all_resources = get_all_resources(session['user_info'])
        
        # Store resources in session for later reference
        session['all_resources'] = all_resources
        
        # Organize resources by priority and category
        emergency_resources = []
        primary_resources = []
        additional_resources = []
        
        for resource in all_resources:
            if resource.get('priority') == 'emergency':
                emergency_resources.append(resource)
            elif resource.get('priority') == 'primary':
                primary_resources.append(resource)
            else:
                additional_resources.append(resource)
        
        # Prepare response messages
        messages = []
        if session['user_info'].get('has_emergency') and emergency_resources:
            messages.append({
                'type': 'section_header',
                'content': "🚨 Immediate Assistance",
                'description': "These resources can help you right away:"
            })
            messages.append({
                'type': 'resources',
                'content': emergency_resources
            })
        
        if primary_resources:
            messages.append({
                'type': 'section_header',
                'content': "📍 Recommended Programs",
                'description': "Based on your needs and eligibility:"
            })
            messages.append({
                'type': 'resources',
                'content': primary_resources
            })
        
        if additional_resources:
            messages.append({
                'type': 'section_header',
                'content': "📌 Additional Resources",
                'description': "Other programs that might be helpful:"
            })
            messages.append({
                'type': 'resources',
                'content': additional_resources
            })
        
        return jsonify({
            'messages': messages,
            'nextQuestion': {
                'type': 'more_info',
                'message': "Would you like more information about any of these resources?",
                'options': ['Yes', 'No']
            }
        })
    
    elif question_type == 'more_info':
        if answer == 'Yes':
            # Get all resource names from the stored resources
            resource_names = [r['name'] for r in session.get('all_resources', [])]
            return jsonify({
                'message': "Which resource would you like to know more about?",
                'nextQuestion': {
                    'type': 'resource_detail',
                    'message': "Select a resource:",
                    'options': resource_names
                }
            })
        else:
            return jsonify({
                'message': "I hope these resources are helpful! If you need anything else, feel free to start a new chat.",
                'nextQuestion': None
            })
            
    elif question_type == 'resource_detail':
        # Find the selected resource
        selected_resource = None
        for resource in session.get('all_resources', []):
            if resource['name'] == answer:
                selected_resource = resource
                break
                
        if selected_resource:
            # Get detailed information from OpenAI
            detailed_info = get_detailed_resource_info(
                selected_resource['name'],
                selected_resource,
                session['user_info'].get('zip_code')
            )
            
            if detailed_info:
                messages = [
                    {
                        'type': 'section_header',
                        'content': f"📋 Detailed Information: {selected_resource['name']}",
                        'description': "Here's everything you need to know about this resource:"
                    },
                    {
                        'type': 'detailed_info',
                        'content': detailed_info
                    }
                ]
                
                return jsonify({
                    'messages': messages,
                    'nextQuestion': {
                        'type': 'more_info',
                        'message': "Would you like information about another resource?",
                        'options': ['Yes', 'No']
                    }
                })
            else:
                return jsonify({
                    'message': "I apologize, but I couldn't retrieve detailed information at the moment. Would you like to try another resource?",
                    'nextQuestion': {
                        'type': 'more_info',
                        'message': "Would you like to select a different resource?",
                        'options': ['Yes', 'No']
                    }
                })
        else:
            return jsonify({
                'message': "I couldn't find that resource. Would you like to try another?",
                'nextQuestion': {
                    'type': 'more_info',
                    'message': "Would you like to select a different resource?",
                    'options': ['Yes', 'No']
                }
            })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007, debug=True)
