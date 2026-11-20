"""
Bounties & Rewards Router
Handles daily student action bounties, streak multipliers, and eco-reward redemptions.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.database import get_connection

router = APIRouter(prefix="/bounties", tags=["Action Bounties & Rewards"])

class ClaimBountyRequest(BaseModel):
    bounty_id: str
    student_email: str = "aarav.sharma@campus.edu"
    bounty_title: str
    points: int

BOUNTIES_CATALOG = [
    {
        "id": "b-1",
        "title": "Kill Dorm Phantom Power",
        "desc": "Unplug unused study laptops & phone chargers before heading to lecture hall.",
        "points": 35,
        "impact": "0.4 kWh saved",
        "category": "energy",
        "co2": "0.32 kg",
        "icon": "zap",
        "popular": True
    },
    {
        "id": "b-2",
        "title": "Zero-Emission Lecture Transition",
        "desc": "Cycle or walk to academic lectures today rather than using campus auto or transit.",
        "points": 50,
        "impact": "1.8 km zero-emission",
        "category": "mobility",
        "co2": "0.45 kg",
        "icon": "bike",
        "popular": True
    },
    {
        "id": "b-3",
        "title": "BYO Reusable Thermos / Flask",
        "desc": "Skip single-use cups at the Student Union Cafe & Nescafe kiosk with reusable flask.",
        "points": 25,
        "impact": "1 plastic cup diverted",
        "category": "waste",
        "co2": "0.15 kg",
        "icon": "coffee",
        "popular": False
    }
]

REWARDS_CATALOG = [
    {
        "id": "rew-01",
        "title": "Nescafe Tapri Cutting Chai & Samosa",
        "points": 150,
        "category": "dining",
        "merchant": "SAC Nescafe & Canteen",
        "description": "Redeem for 1 hot cutting masala chai and hot samosa at the SAC kiosk.",
        "voucherCode": "CHAI-CAMPUS-26"
    },
    {
        "id": "rew-02",
        "title": "Campus EV Shuttle 10-Ride Green Pass",
        "points": 280,
        "category": "mobility",
        "merchant": "IIT Delhi Green Fleet",
        "description": "Unlimited 10-ride electronic hop-on ticket for on-campus battery electric shuttles.",
        "voucherCode": "SHUTTLE-GREEN-10"
    },
    {
        "id": "rew-03",
        "title": "Solar Power Bank 10,000mAh Checkout",
        "points": 450,
        "category": "tech",
        "merchant": "Ramanujan Innovation Hub",
        "description": "7-day rental of an ultra-durable solar-charging power bank for field trips.",
        "voucherCode": "SOLAR-BANK-PIONEER"
    }
]

@router.get("/")
def get_bounties():
    return BOUNTIES_CATALOG

@router.get("/rewards")
def get_rewards():
    return REWARDS_CATALOG

@router.post("/claim")
def claim_bounty(req: ClaimBountyRequest):
    conn = get_connection()
    cursor = conn.cursor()

    # Check if already claimed today
    cursor.execute("""
    SELECT COUNT(*) as cnt FROM bounty_claims 
    WHERE bounty_id = ? AND student_email = ? AND date(claimed_at) = date('now')
    """, (req.bounty_id, req.student_email))
    
    if cursor.fetchone()["cnt"] > 0:
        conn.close()
        return {
            "status": "already_claimed",
            "message": f"You've already claimed '{req.bounty_title}' today! Resets at midnight."
        }

    claim_id = f"CLM-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
    INSERT INTO bounty_claims (id, bounty_id, student_email, points_earned, claimed_at)
    VALUES (?, ?, ?, ?, ?)
    """, (claim_id, req.bounty_id, req.student_email, req.points, datetime.utcnow().isoformat()))

    cursor.execute("""
    UPDATE students SET points = points + ? WHERE email = ?
    """, (req.points, req.student_email))

    cursor.execute("SELECT points, streak FROM students WHERE email = ?", (req.student_email,))
    updated = cursor.fetchone()

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "claim_id": claim_id,
        "points_awarded": req.points,
        "total_points": updated["points"] if updated else 450,
        "streak": updated["streak"] if updated else 14,
        "message": f"Bounty claimed! +{req.points} EcoPoints added to your balance."
    }
