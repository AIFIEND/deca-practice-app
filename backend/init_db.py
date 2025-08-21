# backend/init_db.py
import sys
sys.path.append('.')           # ensure repo root is on sys.path
sys.path.append('backend')     # ensure backend/ is importable

from app import db, app

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database tables created.")
