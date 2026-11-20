"""
Authentication and Student Profile Router
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_connection

router = APIRouter(prefix="/auth", tags=["Authentication & Student Profile"])

class StudentProfile(BaseModel):
    email: str
    name: str
    first_name: str
    dorm: str
    points: int = 450
    streak: int = 14
    co2_saved: float = 18.4
    tier: str = "Emerald Pioneer"
    avatar: str = "AS"
    country: str = "india"

class UpdatePointsRequest(BaseModel):
    delta_points: int
    reason: Optional[str] = "Activity completed"

@router.get("/profile", response_model=StudentProfile)
def get_student_profile(email: str = "aarav.sharma@campus.edu"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        # Fallback to first student or create
        return StudentProfile(
            email=email,
            name="Aarav Sharma",
            first_name="Aarav",
            dorm="Ganga Hostel (Rm 214)",
            points=450,
            streak=14,
            co2_saved=18.4,
            tier="Emerald Pioneer",
            avatar="AS",
            country="india"
        )
    return dict(row)

@router.post("/login")
def login_student(profile: StudentProfile):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO students (email, name, first_name, dorm, points, streak, co2_saved, tier, avatar, country, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        first_name = excluded.first_name,
        dorm = excluded.dorm,
        avatar = excluded.avatar,
        country = excluded.country,
        updated_at = excluded.updated_at
    """, (
        profile.email, profile.name, profile.first_name, profile.dorm,
        profile.points, profile.streak, profile.co2_saved, profile.tier,
        profile.avatar, profile.country, datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Welcome back, {profile.first_name}!", "profile": profile}

@router.post("/points")
def update_points(req: UpdatePointsRequest, email: str = "aarav.sharma@campus.edu"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT points FROM students WHERE email = ?", (email,))
    row = cursor.fetchone()
    if not row:
        current_points = 450
    else:
        current_points = row["points"]
    
    new_points = max(0, current_points + req.delta_points)
    cursor.execute("""
    UPDATE students SET points = ?, updated_at = ? WHERE email = ?
    """, (new_points, datetime.utcnow().isoformat(), email))
    conn.commit()
    conn.close()
    return {"status": "success", "previous_points": current_points, "new_points": new_points, "delta": req.delta_points}
