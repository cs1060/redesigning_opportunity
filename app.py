from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from datetime import datetime
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Required for SocketIO
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///opportunity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app)

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

# Initialize NLTK components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

class ActionStep(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text, nullable=True)
    focus_area = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_bot = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# Intent patterns
INTENT_PATTERNS = {
    'show_steps': [
        r'what.*next.*step.*',
        r'show.*steps.*',
        r'what.*do.*now.*',
        r'what.*should.*do.*',
    ],
    'mark_completed': [
        r'mark.*done',
        r'mark.*complete.*',
        r'finished.*',
        r'completed.*',
        r'done.*with.*',
    ],
    'show_progress': [
        r'progress.*',
        r'how.*doing.*',
        r'status.*',
    ]
}

def detect_intent(text):
    text = text.lower()
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text):
                return intent
    return 'unknown'

def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words]
    return ' '.join(tokens)

def generate_bot_response(intent, user_id, text=None):
    if intent == 'show_steps':
        incomplete_steps = ActionStep.query.filter_by(
            user_id=user_id, 
            completed=False
        ).order_by(ActionStep.order).limit(3).all()
        
        if not incomplete_steps:
            return "Great job! You've completed all your action steps. Would you like to generate a new action plan?"
        
        response = "Here are your next steps:\n\n"
        for i, step in enumerate(incomplete_steps, 1):
            response += f"{i}. {step.description}\n"
        return response

    elif intent == 'mark_completed':
        # Try to find step number in text
        step_num = None
        if text:
            numbers = re.findall(r'\d+', text)
            if numbers:
                step_num = int(numbers[0])
        
        if step_num:
            steps = ActionStep.query.filter_by(
                user_id=user_id,
                completed=False
            ).order_by(ActionStep.order).all()
            
            if 1 <= step_num <= len(steps):
                step = steps[step_num - 1]
                step.completed = True
                db.session.commit()
                return f"Great job completing '{step.description}'! Would you like to see your next steps?"
        
        return "Which step would you like to mark as completed? Please specify the step number."

    elif intent == 'show_progress':
        total = ActionStep.query.filter_by(user_id=user_id).count()
        completed = ActionStep.query.filter_by(user_id=user_id, completed=True).count()
        if total == 0:
            return "You haven't started an action plan yet. Would you like to create one?"
        
        percentage = (completed / total) * 100
        return f"You've completed {completed} out of {total} steps ({percentage:.0f}% complete)!"

    return "I'm not sure what you mean. You can ask me to show your next steps, mark steps as completed, or check your progress."

@app.route('/')
def home():
    return render_template('index.html')

@socketio.on('send_message')
def handle_message(data):
    user_id = 1  # For prototype, using fixed user_id
    message = data['message']
    
    # Save user message
    user_chat = ChatMessage(user_id=user_id, content=message, is_bot=False)
    db.session.add(user_chat)
    
    # Process message and generate response
    intent = detect_intent(message)
    response = generate_bot_response(intent, user_id, message)
    
    # Save bot response
    bot_chat = ChatMessage(user_id=user_id, content=response, is_bot=True)
    db.session.add(bot_chat)
    db.session.commit()
    
    socketio.emit('receive_message', {
        'message': response,
        'is_bot': True
    })

@app.route('/api/chat-history')
def get_chat_history():
    user_id = 1  # For prototype, using fixed user_id
    messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.timestamp).all()
    return jsonify([{
        'content': msg.content,
        'is_bot': msg.is_bot,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages])

@app.route('/api/action-steps/generate', methods=['POST'])
def generate_action_plan():
    user_id = 1  # For prototype, using fixed user_id
    data = request.json
    focus_area = data.get('focus_area')
    
    # Clear existing incomplete steps
    incomplete_steps = ActionStep.query.filter_by(user_id=user_id, completed=False).all()
    for step in incomplete_steps:
        db.session.delete(step)
    
    # Sample action steps based on focus area
    action_steps = {
        'schools': [
            ('Research local school performance metrics', 'Gather data on academic performance, graduation rates, and student engagement'),
            ('Schedule meetings with school administrators', 'Discuss current challenges and potential improvements'),
            ('Identify key areas for improvement', 'Based on data and discussions, prioritize areas that need attention')
        ],
        'community': [
            ('Map existing community programs', 'Create a comprehensive list of current educational programs'),
            ('Identify program gaps', 'Analyze where new programs might be needed'),
            ('Connect with community leaders', 'Build relationships with key stakeholders')
        ],
        'resources': [
            ('Create inventory of available resources', 'Document current educational resources and their utilization'),
            ('Identify resource needs', 'Determine what additional resources would be most beneficial'),
            ('Develop resource sharing plan', 'Create strategy for optimal resource distribution')
        ]
    }
    
    # Create new steps
    steps = action_steps.get(focus_area, [])
    for i, (description, details) in enumerate(steps, 1):
        step = ActionStep(
            user_id=user_id,
            description=description,
            details=details,
            order=i,
            focus_area=focus_area
        )
        db.session.add(step)
    
    db.session.commit()
    
    response = "I've created your action plan! Would you like me to show you your next steps?"
    bot_chat = ChatMessage(user_id=user_id, content=response, is_bot=True)
    db.session.add(bot_chat)
    db.session.commit()
    
    return jsonify({'message': response})

if __name__ == '__main__':
    socketio.run(app, debug=True)
