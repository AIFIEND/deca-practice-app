# backend/app.py

import os
import datetime
import jwt
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

basedir = os.path.abspath(os.path.dirname(__file__))

# --- App & Database Configuration ---
app = Flask(__name__)
app.config["SECRET_KEY"] = "a-really-secret-key-that-should-be-in-an-env-file" # Your NextAuth secret could go here
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "questions.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# In backend/app.py

CORS(app, 
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Authorization", "Content-Type"], # <-- ADD THIS LINE
     supports_credentials=True
)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


# --- Database Model Definitions (No changes needed here) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    attempts = db.relationship('QuizAttempt', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Question(db.Model):
    # ... your Question model is unchanged
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    optionA = db.Column(db.String(255), nullable=True)
    optionB = db.Column(db.String(255), nullable=True)
    optionC = db.Column(db.String(255), nullable=True)
    optionD = db.Column(db.String(255), nullable=True)
    correctAnswer = db.Column(db.String(1), nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id, 'question': self.question,
            'options': [
                {'id': 'A', 'text': self.optionA}, {'id': 'B', 'text': self.optionB},
                {'id': 'C', 'text': self.optionC}, {'id': 'D', 'text': self.optionD},
            ],
            'correctAnswer': self.correctAnswer, 'explanation': self.explanation,
            'category': self.category, 'difficulty': self.difficulty,
        }

class QuizAttempt(db.Model):
    # ... your QuizAttempt model is unchanged
    id = db.Column(db.Integer, primary_key=True)
    test_name = db.Column(db.String(255), nullable=False, default="General Quiz")
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    def to_dict(self):
        return {
            'id': self.id, 'testName': self.test_name, 'score': self.score,
            'totalQuestions': self.total_questions, 'completedAt': self.timestamp.isoformat(),
        }


# --- NEW: Token Required Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] # Bearer <token>
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


# --- API Endpoints (Updated) ---
@app.route('/api/auth/credentials', methods=['POST'])
def verify_and_get_token():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # Create a token instead of logging in
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        # Return the user details AND the token
        return jsonify({
            'id': user.id,
            'name': user.username,
            'token': token
        }), 200
    
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/api/quiz/submit', methods=['POST'])
@token_required # Use the new decorator
def submit_quiz(current_user): # The decorator passes the user in
    data = request.get_json()
    attempt = QuizAttempt(
        score=data.get('score'),
        total_questions=data.get('totalQuestions'),
        test_name=data.get('testName', 'General Quiz'),
        user_id=current_user.id
    )
    db.session.add(attempt)
    db.session.commit()
    return jsonify({"message": "Quiz attempt saved successfully"}), 201

@app.route('/api/user/attempts', methods=['GET'])
@token_required # Use the new decorator
def get_user_attempts(current_user): # The decorator passes the user in
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in attempts])

# --- Unprotected endpoints (no changes) ---
@app.route('/api/questions')
def get_questions():
    # ...
    query = db.select(Question)
    categories = request.args.get('categories')
    difficulties = request.args.get('difficulties')
    if categories:
        query = query.where(Question.category.in_(categories.split(',')))
    if difficulties:
        query = query.where(Question.difficulty.in_(difficulties.split(',')))
    questions = db.session.execute(query).scalars().all()
    return jsonify([q.to_dict() for q in questions])

@app.route('/api/quiz-config')
def get_quiz_config():
    # ...
    categories = db.session.query(Question.category).distinct().all()
    difficulties = db.session.query(Question.difficulty).distinct().all()
    return jsonify({'categories': [c[0] for c in categories], 'difficulties': [d[0] for d in difficulties]})

if __name__ == '__main__':
    app.run(debug=True)