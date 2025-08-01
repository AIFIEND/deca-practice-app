# backend/app.py

import os
from datetime import datetime, timedelta
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
    id               = db.Column(db.Integer, primary_key=True)
    test_name        = db.Column(db.String(128), nullable=False)
    score            = db.Column(db.Integer, nullable=True)
    total_questions  = db.Column(db.Integer, nullable=False)
    timestamp        = db.Column(db.DateTime, default=datetime.utcnow)
    user_id          = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_ids     = db.Column(db.JSON, nullable=False)           # new
    answers          = db.Column(db.JSON, default=dict, nullable=False)  # new
    is_complete      = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'test_name': self.test_name,
            'score': self.score,
            'total_questions': self.total_questions,
            'timestamp': self.timestamp.isoformat(),
            'user_id': self.user_id,
            'question_ids': self.question_ids,
            'answers': self.answers,
            'is_complete': self.is_complete
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

# --- NEW: Register endpoint ----------------------------------------
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    # Basic input checks
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    # Reject duplicates
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400

    # Create and save the user
    user = User(username=username)
    user.set_password(password)        # hashes via Bcrypt
    db.session.add(user)
    db.session.commit()

    # Return a fresh JWT so the user can be auto‑logged‑in
    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    return jsonify({'id': user.id, 'name': user.username, 'token': token}), 201
# --------------------------------------------------------------------

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
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        # Return the user details AND the token
        return jsonify({
            'id': user.id,
            'name': user.username,
            'token': token
        }), 200
    
    return jsonify({"message": "Invalid username or password"}), 401

# --- NEW: Start Quiz endpoint -------------------------------------
@app.route('/api/quiz/start', methods=['POST'])
@token_required
def start_quiz(current_user):
    data = request.get_json() or {}
    cats  = data.get('categories', [])
    diffs = data.get('difficulties', [])

    # 1) select questions
    q = Question.query
    if cats:  q = q.filter(Question.category.in_(cats))
    if diffs: q = q.filter(Question.difficulty.in_(diffs))
    selected = q.all()
    ids = [q.id for q in selected]

    # 2) record the attempt with question_ids
    new_attempt = QuizAttempt(
        test_name       = data.get('testName', 'Practice Quiz'),
        total_questions = len(ids),
        user_id         = current_user.id,
        question_ids    = ids,
        answers         = {},           # empty at start
        is_complete     = False
    )
    db.session.add(new_attempt)
    db.session.commit()

    # 3) return attemptId plus full question data
    return jsonify({
        'attemptId': new_attempt.id,
        'questions': [q.to_dict() for q in selected]
    }), 200
# -------------------------------------------------------------------
@app.route('/api/quiz/answer', methods=['POST'])
@token_required
def save_answer(current_user):
    data = request.get_json() or {}
    attempt_id  = data.get('attemptId')
    question_id = data.get('questionId')
    answer      = data.get('answer')

    # Lookup the attempt
    attempt = QuizAttempt.query.filter_by(
        id=attempt_id, user_id=current_user.id
    ).first()
    if not attempt:
        return jsonify({'message':'Attempt not found'}), 404

    # Merge into the JSON answers field
    ans = attempt.answers or {}
    ans[str(question_id)] = answer
    attempt.answers = ans
    db.session.commit()
    return jsonify({'message':'Answer saved'}), 200


@app.route('/api/quiz/submit', methods=['POST'])
@token_required
def submit_quiz(current_user):
    data = request.get_json() or {}

    # 1) Extract required fields
    attempt_id = data.get('attemptId')
    score      = data.get('score')

    if attempt_id is None or score is None:
        return jsonify({'message': 'attemptId and score required'}), 400

    # 2) Look up the existing attempt for this user
    attempt = QuizAttempt.query.filter_by(
        id=attempt_id,
        user_id=current_user.id
    ).first()

    if not attempt:
        return jsonify({'message': 'Attempt not found'}), 404

    # 3) Update score & mark complete
    attempt.score       = score
    attempt.is_complete = True
    db.session.commit()

    # 4) Return the updated attempt
    return jsonify({'message': 'Quiz submitted', 'attempt': attempt.to_dict()}), 200

@app.route('/api/user/attempts', methods=['GET'])
@token_required # Use the new decorator
def get_user_attempts(current_user): # The decorator passes the user in
    attempts = (
    QuizAttempt.query
        .filter_by(user_id=current_user.id)
        .order_by(QuizAttempt.timestamp.desc())
        .all()
)
    return jsonify([a.to_dict() for a in attempts])

@app.route('/api/quiz/resume/<int:attempt_id>', methods=['GET'])
@token_required
def resume_quiz(current_user, attempt_id):
    # fetch the attempt
    attempt = QuizAttempt.query.filter_by(
        id=attempt_id,
        user_id=current_user.id
    ).first()
    if not attempt:
        return jsonify({'message':'Attempt not found'}), 404

    # re‑load those questions in the original order
    qs = Question.query.filter(Question.id.in_(attempt.question_ids)).all()
    # preserve order:
    id_to_q = {q.id:q for q in qs}
    ordered = [id_to_q[qid] for qid in attempt.question_ids if qid in id_to_q]

    return jsonify({
        'questions': [q.to_dict() for q in ordered],
        'answersSoFar': attempt.answers
    }), 200

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