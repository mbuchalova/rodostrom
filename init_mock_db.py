import sqlite3
import random

# Connect to SQLite database
conn = sqlite3.connect('ancestors.db')
c = conn.cursor()

# Create a regular table for ancestors
c.execute('''
CREATE TABLE IF NOT EXISTS ancestors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT,
    birth_date TEXT,
    death_date TEXT,
    birth_city TEXT,
    death_city TEXT,
    gender TEXT
)
''')

# Create an FTS5 table for full-text search
c.execute('''
CREATE VIRTUAL TABLE IF NOT EXISTS ancestors_fts USING fts5(
    name, surname, birth_city, death_city
)
''')

# Sample data
first_names = ["Ján", "Mária", "Peter", "Anna", "Jozef", "Eva", "Milan", "Lucia", "František", "Katarína"]
surnames = ["Sokol", "Kováčová", "Novák", "Horváthová", "Malý", "Král", "Kučera", "Varga", "Nagy", "Polák"]
cities = ["Bratislava", "Košice", "Smolenice", "Banská Bystrica", "Trenčín"]
genders = ["male", "female"]

# Insert random records
for _ in range(15):
    first_name = random.choice(first_names)
    surname = random.choice(surnames)
    birth_date = f"{random.randint(1800, 1950)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
    death_date = f"{random.randint(1951, 2023)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
    birth_city = random.choice(cities)
    death_city = random.choice(cities)
    gender = random.choice(genders)

    # Insert into ancestors table
    c.execute('''
    INSERT INTO ancestors (name, surname, birth_date, death_date, birth_city, death_city, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (first_name, surname, birth_date, death_date, birth_city, death_city, gender))

    # Insert into FTS table
    c.execute('''
    INSERT INTO ancestors_fts (name, surname, birth_city, death_city)
    VALUES (?, ?, ?, ?)
    ''', (first_name, surname, birth_city, death_city))

# Commit and close
conn.commit()
conn.close()

print("Mock data with full-text search support inserted into ancestors.db")
