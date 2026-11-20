"""
Dorm Derby Router
Calculates live inter-residence conservation standings and manages cheer wall messages.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from app.database import get_connection

router = APIRouter(prefix="/derby", tags=["Dorm Eco-Derby"])

class CheerMessage(BaseModel):
    author: str
    dorm: str
    message: str
    country: Optional[str] = "india"

# Pre-defined regional standings
REGIONAL_DERBY_DATA = {
    "india": [
        {"rank": 1, "name": "Ganga Hostel", "score": 94.8, "energy": "2.8", "water": "78", "waste": 94, "trend": "+4.2%", "delta": "+4.2%"},
        {"rank": 2, "name": "Nilgiri Bhavan", "score": 91.2, "energy": "3.1", "water": "84", "waste": 89, "trend": "+2.8%", "delta": "+2.8%"},
        {"rank": 3, "name": "Brahmaputra Quads", "score": 87.5, "energy": "3.5", "water": "92", "waste": 85, "trend": "+1.5%", "delta": "+1.5%"},
        {"rank": 4, "name": "Sarojini Naidu Hall", "score": 84.1, "energy": "3.8", "water": "98", "waste": 82, "trend": "-0.8%", "delta": "-0.8%"},
        {"rank": 5, "name": "Tagore Central Hall", "score": 79.4, "energy": "4.2", "water": "110", "waste": 76, "trend": "-1.4%", "delta": "-1.4%"}
    ],
    "usa": [
        {"rank": 1, "name": "Oak Hall", "score": 94.2, "energy": "3.1", "water": "19.4", "waste": 91, "trend": "+3.4%", "delta": "+3.4%"},
        {"rank": 2, "name": "Pine Haven", "score": 89.6, "energy": "3.4", "water": "21.2", "waste": 87, "trend": "+1.9%", "delta": "+1.9%"},
        {"rank": 3, "name": "Maple Towers", "score": 84.1, "energy": "3.8", "water": "23.5", "waste": 82, "trend": "+0.5%", "delta": "+0.5%"},
        {"rank": 4, "name": "Willow Quad", "score": 79.8, "energy": "4.2", "water": "26.8", "waste": 78, "trend": "-1.1%", "delta": "-1.1%"},
        {"rank": 5, "name": "Central Commons", "score": 74.3, "energy": "4.8", "water": "29.1", "waste": 73, "trend": "-2.0%", "delta": "-2.0%"}
    ],
    "uk": [
        {"rank": 1, "name": "Newton College", "score": 95.1, "energy": "2.9", "water": "74", "waste": 93, "trend": "+3.1%", "delta": "+3.1%"},
        {"rank": 2, "name": "Turing Hall", "score": 90.4, "energy": "3.3", "water": "81", "waste": 88, "trend": "+2.0%", "delta": "+2.0%"},
        {"rank": 3, "name": "Cavendish House", "score": 86.8, "energy": "3.6", "water": "89", "waste": 84, "trend": "+0.7%", "delta": "+0.7%"},
        {"rank": 4, "name": "Pembroke Quad", "score": 81.2, "energy": "4.0", "water": "95", "waste": 80, "trend": "-1.2%", "delta": "-1.2%"}
    ],
    "europe": [
        {"rank": 1, "name": "Van Gogh Pavilion", "score": 96.2, "energy": "2.6", "water": "71", "waste": 95, "trend": "+3.8%", "delta": "+3.8%"},
        {"rank": 2, "name": "Erasmus Eco-House", "score": 92.4, "energy": "2.9", "water": "76", "waste": 91, "trend": "+2.1%", "delta": "+2.1%"},
        {"rank": 3, "name": "Copernicus Lab", "score": 88.0, "energy": "3.4", "water": "84", "waste": 86, "trend": "+1.0%", "delta": "+1.0%"},
        {"rank": 4, "name": "Spinoza Hall", "score": 82.5, "energy": "3.9", "water": "91", "waste": 81, "trend": "-0.9%", "delta": "-0.9%"}
    ]
}

@router.get("/standings")
def get_standings(country: str = "india", metric: str = "overall"):
    standings = REGIONAL_DERBY_DATA.get(country, REGIONAL_DERBY_DATA["india"])
    
    # Sort by metric if requested
    if metric == "energy":
        sorted_standings = sorted(standings, key=lambda x: float(x["energy"]))
    elif metric == "water":
        sorted_standings = sorted(standings, key=lambda x: float(x["water"]))
    elif metric == "waste":
        sorted_standings = sorted(standings, key=lambda x: float(x["waste"]), reverse=True)
    else:
        sorted_standings = sorted(standings, key=lambda x: float(x["score"]), reverse=True)
    
    return {
        "country": country,
        "metric": metric,
        "standings": sorted_standings
    }

@router.get("/cheers")
def get_cheers(country: str = "india"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM derby_cheers WHERE country = ? ORDER BY id DESC LIMIT 20", (country,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/cheers")
def post_cheer(cheer: CheerMessage):
    conn = get_connection()
    cursor = conn.cursor()
    cheer_id = f"ch-{uuid.uuid4().hex[:6]}"
    cursor.execute("""
    INSERT INTO derby_cheers (id, author, dorm, message, timestamp, likes, country)
    VALUES (?, ?, ?, ?, 'Just now', 1, ?)
    """, (cheer_id, cheer.author, cheer.dorm, cheer.message, cheer.country or "india"))
    conn.commit()
    conn.close()
    return {"status": "success", "id": cheer_id, "message": "Cheer posted to Derby Wall!"}
