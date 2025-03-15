from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///opportunity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class ActionStep(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)  # In a real app, this would be a foreign key
    description = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, nullable=False)
    details = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/action-steps', methods=['GET'])
def get_action_steps():
    user_id = 1  # For prototype, using a fixed user_id
    simplified = request.args.get('simplified', 'false') == 'true'
    steps = ActionStep.query.filter_by(user_id=user_id).order_by(ActionStep.order).all()
    
    if simplified:
        # Return only incomplete steps, limited to 3 at a time
        steps = [step for step in steps if not step.completed][:3]
    
    return jsonify([{
        'id': step.id,
        'description': step.description,
        'completed': step.completed,
        'order': step.order,
        'details': step.details,
        'difficulty': step.difficulty
    } for step in steps])

@app.route('/api/action-steps', methods=['POST'])
def create_action_step():
    data = request.json
    new_step = ActionStep(
        user_id=1,  # Fixed user_id for prototype
        description=data['description'],
        order=data.get('order', 999),
        details=data.get('details', ''),
        difficulty=data.get('difficulty', 'medium')
    )
    db.session.add(new_step)
    db.session.commit()
    return jsonify({
        'id': new_step.id,
        'description': new_step.description,
        'completed': new_step.completed,
        'order': new_step.order,
        'details': new_step.details,
        'difficulty': new_step.difficulty
    })

@app.route('/api/action-steps/<int:step_id>', methods=['PUT'])
def update_action_step(step_id):
    step = ActionStep.query.get_or_404(step_id)
    data = request.json
    if 'description' in data:
        step.description = data['description']
    if 'completed' in data:
        step.completed = data['completed']
    if 'order' in data:
        step.order = data['order']
    if 'details' in data:
        step.details = data['details']
    if 'difficulty' in data:
        step.difficulty = data['difficulty']
    db.session.commit()
    return jsonify({
        'id': step.id,
        'description': step.description,
        'completed': step.completed,
        'order': step.order,
        'details': step.details,
        'difficulty': step.difficulty
    })

@app.route('/api/action-steps/reorder', methods=['POST'])
def reorder_steps():
    data = request.json
    for step_data in data:
        step = ActionStep.query.get(step_data['id'])
        if step:
            step.order = step_data['order']
    db.session.commit()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
