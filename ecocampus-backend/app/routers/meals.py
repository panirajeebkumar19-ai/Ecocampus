"""
Cafeteria Food Rescue Router
Handles meal listings, real-time inventory decrement, reservations, and QR code redemption.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.database import get_connection

router = APIRouter(prefix="/meals", tags=["Cafeteria Food Rescue"])

class ReservationRequest(BaseModel):
    meal_id: str
    meal_title: str
    cafeteria: str
    student_email: str
    price: str
    eco_points_spent: int = 0

MEALS_DATA = {
    "india": [
        {
            "id": "in-meal-01",
            "title": "Deluxe North/South Mess Lunch Thali",
            "cafeteria": "Annapurna Central Dining Mess",
            "cutoffTime": "14:45 PM (Post-Lunch)",
            "remaining": 18,
            "dietary": "Pure Veg / Jain Available",
            "originalPrice": "₹80",
            "rescuePrice": "₹20",
            "ecoPointsCost": 35,
            "co2Offset": "2.1 kg"
        },
        {
            "id": "in-meal-02",
            "title": "Canteen Afternoon Samosas & Poha Tray",
            "cafeteria": "Student Activity Center (SAC) Canteen",
            "cutoffTime": "17:30 PM (Evening Tea)",
            "remaining": 14,
            "dietary": "Fresh Hot Canteen Snacks",
            "originalPrice": "₹50",
            "rescuePrice": "₹15",
            "ecoPointsCost": 25,
            "co2Offset": "1.4 kg"
        },
        {
            "id": "in-meal-03",
            "title": "Night Canteen Special: Rajma Chawal Bowl",
            "cafeteria": "Hostel 4 Late-Night Canteen",
            "cutoffTime": "23:45 PM (Midnight Cram)",
            "remaining": 10,
            "dietary": "High Protein / Freshly Packaged",
            "originalPrice": "₹95",
            "rescuePrice": "₹25",
            "ecoPointsCost": 40,
            "co2Offset": "2.8 kg"
        },
        {
            "id": "in-meal-04",
            "title": "Steamed Idli-Vada & Sambar Combo",
            "cafeteria": "Nilgiri Bhavan Ground Floor Kiosk",
            "cutoffTime": "10:30 AM (Morning Window)",
            "remaining": 8,
            "dietary": "Healthy Steamed / Gluten-Free",
            "originalPrice": "₹65",
            "rescuePrice": "₹15",
            "ecoPointsCost": 30,
            "co2Offset": "1.2 kg"
        }
    ]
}

@router.get("/")
def get_meals(country: str = "india"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT meal_id, remaining FROM meal_inventory WHERE country = ?", (country,))
    inventory_map = {row["meal_id"]: row["remaining"] for row in cursor.fetchall()}
    conn.close()

    meals = MEALS_DATA.get(country, MEALS_DATA["india"])
    result = []
    for m in meals:
        item = dict(m)
        if item["id"] in inventory_map:
            item["remaining"] = inventory_map[item["id"]]
        result.append(item)
    return result

@router.post("/reserve")
def reserve_meal(req: ReservationRequest):
    conn = get_connection()
    cursor = conn.cursor()

    # Check student balance if eco_points used
    cursor.execute("SELECT points FROM students WHERE email = ?", (req.student_email,))
    student_row = cursor.fetchone()
    current_points = student_row["points"] if student_row else 450

    if req.eco_points_spent > 0 and current_points < req.eco_points_spent:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient EcoPoints balance")

    # Decrement inventory in DB
    cursor.execute("SELECT remaining FROM meal_inventory WHERE meal_id = ?", (req.meal_id,))
    inv_row = cursor.fetchone()
    
    if inv_row is None:
        # Default starting remaining from meal catalog
        starting_remaining = 15
        for m in MEALS_DATA.get("india", []):
            if m["id"] == req.meal_id:
                starting_remaining = m["remaining"]
                break
        remaining = max(0, starting_remaining - 1)
        cursor.execute("""
        INSERT INTO meal_inventory (meal_id, remaining, country, updated_at)
        VALUES (?, ?, 'india', ?)
        """, (req.meal_id, remaining, datetime.utcnow().isoformat()))
    else:
        remaining = max(0, inv_row["remaining"] - 1)
        cursor.execute("""
        UPDATE meal_inventory SET remaining = ?, updated_at = ? WHERE meal_id = ?
        """, (remaining, datetime.utcnow().isoformat(), req.meal_id))

    # Deduct EcoPoints
    if req.eco_points_spent > 0 and student_row:
        new_points = current_points - req.eco_points_spent
        cursor.execute("UPDATE students SET points = ? WHERE email = ?", (new_points, req.student_email))

    reservation_id = f"RES-{uuid.uuid4().hex[:8].upper()}"
    qr_code = f"ECO-CLAIM:{reservation_id}:{req.meal_id}:{req.student_email}"
    
    cursor.execute("""
    INSERT INTO meal_reservations (id, meal_id, meal_title, cafeteria, student_email, price, eco_points_spent, status, qr_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
    """, (reservation_id, req.meal_id, req.meal_title, req.cafeteria, req.student_email, req.price, req.eco_points_spent, qr_code, datetime.utcnow().isoformat()))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "reservation_id": reservation_id,
        "qr_code": qr_code,
        "remaining_inventory": remaining,
        "message": f"Successfully reserved '{req.meal_title}'! Flash your QR code at {req.cafeteria}."
    }

@router.get("/reservations")
def get_reservations(student_email: str = "aarav.sharma@campus.edu"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM meal_reservations WHERE student_email = ? ORDER BY created_at DESC", (student_email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
