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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/action-steps', methods=['GET'])
def get_action_steps():
    # For prototype, using a fixed user_id
    user_id = 1
    steps = ActionStep.query.filter_by(user_id=user_id).order_by(ActionStep.order).all()
    return jsonify([{
        'id': step.id,
        'description': step.description,
        'completed': step.completed,
        'order': step.order
    } for step in steps])

@app.route('/api/action-steps', methods=['POST'])
def create_action_step():
    data = request.json
    new_step = ActionStep(
        user_id=1,  # Fixed user_id for prototype
        description=data['description'],
        order=data['order']
    )
    db.session.add(new_step)
    db.session.commit()
    return jsonify({
        'id': new_step.id,
        'description': new_step.description,
        'completed': new_step.completed,
        'order': new_step.order
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
    db.session.commit()
    return jsonify({
        'id': step.id,
        'description': step.description,
        'completed': step.completed,
        'order': step.order
    })

if __name__ == '__main__':
    app.run(debug=True)
