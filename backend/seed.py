## backend/seed.py (Clean Version)

import os
import pandas as pd
from app import app, db, Question

# Build Absolute Path to CSV
basedir = os.path.abspath(os.path.dirname(__file__))
csv_path = os.path.join(basedir, 'questions.csv')

# Load the questions from the CSV file
df = pd.read_csv(csv_path)

# Drop rows where any required column is empty
required_columns = ['category', 'optionA', 'optionB', 'optionC', 'optionD']
df.dropna(subset=required_columns, inplace=True)

with app.app_context():
    # Clear existing data
    db.session.query(Question).delete()

    # Iterate over the rows of the dataframe and add them to the database
    for index, row in df.iterrows():
        question = Question(
            id=row['id'],
            question=row['question'],
            optionA=row['optionA'],
            optionB=row['optionB'],
            optionC=row['optionC'],
            optionD=row['optionD'],
            correctAnswer=row['correctAnswer'],
            explanation=row['explanation'],
            category=row['category'],
            difficulty=row['difficulty']
        )
        db.session.add(question)

    # Commit the changes to the database
    db.session.commit()

print(f"Database has been seeded with {len(df)} questions! 🌱")