# backend/app.py

import os
import datetime
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

basedir = os.path.abspath(os.path.dirname(__file__))

# --- App & Database Configuration ---
app = Flask(__name__)
# IMPORTANT: This line is crucial for securely signing the session cookie
app.config["SECRET_KEY"] = os.urandom(24) 
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "questions.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Enable CORS to allow your Next.js frontend to connect and send cookies
CORS(app, supports_credentials=True) 

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
admin = Admin(app, name='DECA Admin', template_mode='bootstrap3')

# --- Login Manager Setup ---
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Database Model Definitions ---
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    attempts = db.relationship('QuizAttempt', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return self.username

class Question(db.Model):
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
            'id': self.id,
            'question': self.question,
            'options': [
                {'id': 'A', 'text': self.optionA},
                {'id': 'B', 'text': self.optionB},
                {'id': 'C', 'text': self.optionC},
                {'id': 'D', 'text': self.optionD},
            ],
            'correctAnswer': self.correctAnswer,
            'explanation': self.explanation,
            'category': self.category,
            'difficulty': self.difficulty,
        }

class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'score': self.score,
            'total_questions': self.total_questions,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        }

# --- Add Models to Admin Interface ---
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Question, db.session))
admin.add_view(ModelView(QuizAttempt, db.session))

# --- API Endpoints ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "Username already exists"}), 409
    new_user = User(username=data.get('username'))
    new_user.set_password(data.get('password'))
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify({"message": "User registered successfully", "user": {"username": new_user.username}}), 201

# In backend/app.py

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    print(f"SECRET KEY IS SET: {app.secret_key}")
    print(f"Attempting login for user: {data.get('username')}")

    if user and user.check_password(data.get('password')):
        login_user(user)
        session['test'] = 'value' # <-- ADD THIS LINE
        print("Login successful, session should be created.")
        return jsonify({"message": "Logged in successfully", "user": {"username": user.username}}), 200

    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/profile')
def profile():
    if current_user.is_authenticated:
        return jsonify({"username": current_user.username})
    return jsonify({"message": "User not logged in"}), 401

@app.route('/api/questions')
def get_questions():
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
    categories = db.session.query(Question.category).distinct().all()
    difficulties = db.session.query(Question.difficulty).distinct().all()
    return jsonify({'categories': [c[0] for c in categories], 'difficulties': [d[0] for d in difficulties]})

@app.route('/api/quiz/submit', methods=['POST'])
@login_required # Added to ensure only logged-in users can submit
def submit_quiz():
    data = request.get_json()
    score = data.get('score')
    total_questions = data.get('totalQuestions')
    if score is None or total_questions is None:
        return jsonify({"message": "Missing score or total questions"}), 400
    attempt = QuizAttempt(score=score, total_questions=total_questions, user_id=current_user.id)
    db.session.add(attempt)
    db.session.commit()
    return jsonify({"message": "Quiz attempt saved successfully"}), 201

@app.route('/api/user/attempts')
@login_required
def get_user_attempts():
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in attempts])

@app.cli.command("init-db")
def init_db_command():
    with app.app_context():
        db.create_all()
    print("Initialized the database.")

if __name__ == '__main__':
    app.run(debug=True)