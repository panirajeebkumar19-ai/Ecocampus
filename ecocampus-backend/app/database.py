"""
EcoCampus SQLite Database Engine
Provides persistence for users, incidents, food reservations, bounty claims, and telemetry.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecocampus.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Students / Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        first_name TEXT NOT NULL,
        dorm TEXT NOT NULL,
        points INTEGER DEFAULT 450,
        streak INTEGER DEFAULT 14,
        co2_saved REAL DEFAULT 18.4,
        tier TEXT DEFAULT 'Emerald Pioneer',
        avatar TEXT DEFAULT 'AS',
        country TEXT DEFAULT 'india',
        updated_at TEXT
    )
    """)

    # 2. EcoPatrol Incidents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        reported_by TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        upvotes INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL,
        country TEXT DEFAULT 'india',
        image_url TEXT
    )
    """)

    # 3. Cafeteria Meal Reservations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meal_reservations (
        id TEXT PRIMARY KEY,
        meal_id TEXT NOT NULL,
        meal_title TEXT NOT NULL,
        cafeteria TEXT NOT NULL,
        student_email TEXT NOT NULL,
        price TEXT NOT NULL,
        eco_points_spent INTEGER DEFAULT 0,
        status TEXT DEFAULT 'confirmed',
        qr_code TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 4. Meal Inventory (Live overrides)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meal_inventory (
        meal_id TEXT PRIMARY KEY,
        remaining INTEGER NOT NULL,
        country TEXT DEFAULT 'india',
        updated_at TEXT NOT NULL
    )
    """)

    # 5. Bounty Claims
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bounty_claims (
        id TEXT PRIMARY KEY,
        bounty_id TEXT NOT NULL,
        student_email TEXT NOT NULL,
        points_earned INTEGER NOT NULL,
        claimed_at TEXT NOT NULL
    )
    """)

    # 6. Derby Cheers Wall
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS derby_cheers (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        dorm TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        country TEXT DEFAULT 'india'
    )
    """)

    conn.commit()

    # Seed Default Student (Aarav Sharma - IIT Delhi)
    cursor.execute("SELECT COUNT(*) as cnt FROM students WHERE email = 'aarav.sharma@campus.edu'")
    if cursor.fetchone()["cnt"] == 0:
        cursor.execute("""
        INSERT INTO students (email, name, first_name, dorm, points, streak, co2_saved, tier, avatar, country, updated_at)
        VALUES ('aarav.sharma@campus.edu', 'Aarav Sharma', 'Aarav', 'Ganga Hostel (Rm 214)', 450, 14, 18.4, 'Emerald Pioneer', 'AS', 'india', ?)
        """, (datetime.utcnow().isoformat(),))

    # Seed Default Incidents if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM incidents")
    if cursor.fetchone()["cnt"] == 0:
        incidents_seed = [
            ("inc-01", "Severe RO Filter Reject Water Leakage", "plumbing", "Nilgiri Bhavan 2nd Floor Common Pantry", "investigating", "Priya N. (Rm 204)", "high", 14, "8 mins ago", "india"),
            ("inc-02", "Corridor LED Floodlights Active at Noon", "electrical", "Aryabhatta Academic Block C - Zone 02", "open", "Rohan V. (M.Tech EE)", "medium", 9, "24 mins ago", "india"),
            ("inc-03", "Main HVAC Chiller Temp Drift (19°C -> 25°C)", "hvac", "Central Library Ground Floor Reading Hall", "open", "Staff Desk / Facility IoT", "low", 5, "1 hour ago", "india"),
            ("inc-04", "Cafeteria Solid Waste Overflow Near Bin #4", "waste", "Annapurna Dining Mess West Entrance", "resolved", "Aarav Sharma", "medium", 21, "3 hours ago", "india"),
        ]
        cursor.executemany("""
        INSERT INTO incidents (id, title, category, location, status, reported_by, severity, upvotes, timestamp, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, incidents_seed)

    # Seed Default Cheers if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM derby_cheers")
    if cursor.fetchone()["cnt"] == 0:
        cheers_seed = [
            ("ch-1", "Aarav S.", "Ganga Hostel", "Unplugged 12 laptop chargers in the study hall! Let's keep that #1 rank Ganga! 🔥", "5m ago", 12, "india"),
            ("ch-2", "Priya N.", "Nilgiri Bhavan", "Nilgiri is catching up, only 3.6 points behind! Let's shut off HVAC tonight team ⚡", "14m ago", 8, "india"),
            ("ch-3", "Devendra K.", "Brahmaputra Quads", "Rainwater cistern just topped 92% capacity today. Huge conservation boost 💧", "28m ago", 15, "india")
        ]
        cursor.executemany("""
        INSERT INTO derby_cheers (id, author, dorm, message, timestamp, likes, country)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, cheers_seed)

    conn.commit()
    conn.close()

init_db()
