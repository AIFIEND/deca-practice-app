# DECA Practice Web App

This is a full-stack quiz application to help DECA students prepare for multiple-choice exams.

Features:
- Multiple choice quizzes with instant feedback
- Question flagging for review
- Answer elimination
- Progress tracking
- Admin panel for managing questions

---

## 1. Tech Stack
Frontend: Next.js 15, React, Tailwind CSS
Backend: Flask, SQLAlchemy, Python
Database: SQLite (local development)
Authentication: NextAuth.js with Google OAuth

---

## 2. Getting Started

### Step 1 - Clone the repository
Open a terminal and run:
    git clone https://github.com/YOUR-USERNAME/deca-practice.git
    cd deca-practice

---

### Step 2 - Install frontend dependencies
    npm install

---

### Step 3 - Set up environment variables (frontend)
1. Copy the example file:
       cp .env.example .env.local
   (On Windows PowerShell: copy .env.example .env.local)

2. Open `.env.local` and replace the placeholder values with your real keys.

Example `.env.local`:
    NEXT_PUBLIC_API_URL="http://localhost:5000"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    NEXTAUTH_SECRET="your-nextauth-secret"
    NEXTAUTH_URL="http://localhost:3000"
    MONGODB_URI="your-mongodb-uri"

IMPORTANT:
- `.env.local` contains real keys and must NOT be committed to GitHub.
- `.env.example` only has placeholders and is safe to share.

---

### Step 4 - Set up backend (Flask)
1. Go into the backend folder:
       cd backend

2. Create a virtual environment:
       python -m venv venv

3. Activate the virtual environment:
   Windows PowerShell:
       .\venv\Scripts\Activate.ps1
   Mac/Linux:
       source venv/bin/activate

4. Install dependencies:
       pip install -r requirements.txt

---

### Step 5 - Create backend .env file
Inside `backend/`, create a file named `.env` with:

    SECRET_KEY="your-secret-key"
    SQLALCHEMY_DATABASE_URI="sqlite:///questions.db"
    ADMIN_PASSCODE="your-admin-passcode"

---

### Step 6 - Initialize the database
Make sure your backend virtual environment is active, then run:
    python init_db.py

---

### Step 7 - Start the backend
    python app.py

The backend will be available at:
    http://localhost:5000

---

### Step 8 - Start the frontend
Open a NEW terminal (keep backend running) and run:
    npm run dev

The frontend will be available at:
    http://localhost:3000

---

## 3. Admin Panel
- Go to `http://localhost:3000/admin`
- Enter the ADMIN_PASSCODE from your backend `.env` file.

---

## 4. Development Notes
- Hot reload is enabled for both frontend and backend.
- If you add new Python packages, run:
      pip freeze > requirements.txt
- Restart backend and frontend after changing environment variables.

---

## 5. License
MIT License - free to use and modify.
