"""
Microgrid & IoT Telemetry Router
Provides live solar generation, battery storage metrics, and 24-hour campus power curves.
"""
from fastapi import APIRouter
from typing import Dict, Any, List
import random
from datetime import datetime

router = APIRouter(prefix="/telemetry", tags=["Microgrid & IoT Telemetry"])

@router.get("/live")
def get_live_telemetry(country: str = "india") -> Dict[str, Any]:
    """Returns real-time telemetry matching current campus solar and grid intertie."""
    now = datetime.utcnow()
    # Fluctuate slightly to simulate realistic solar irradiance & microgrid readings
    jitter = random.uniform(-0.04, 0.04)
    base_solar = 1.54 if country == "india" else (1.42 if country == "usa" else 1.28)
    current_solar_kw = round((base_solar + jitter) * 1000, 1)
    
    return {
        "timestamp": now.isoformat(),
        "country": country,
        "solar_pv_kw": current_solar_kw,
        "solar_percentage": round(81.4 + (jitter * 20), 1),
        "solar_irradiance_wm2": round(920 + (jitter * 400)),
        "ambient_temp_c": 34.0 if country == "india" else 22.5,
        "weather_summary": "Sunny / Optimal PV Absorption",
        "battery_storage": {
            "capacity_kwh": 600,
            "current_soc_percentage": 94.2,
            "status": "charging",
            "flow_kw": "+185 kW"
        },
        "grid_intertie": {
            "import_kw": 280,
            "export_kw": 0,
            "status": "stabilized"
        },
        "sub_meters_online": 142
    }

@router.get("/history-24h")
def get_power_history(country: str = "india"):
    """Returns 24-hour power curve for Chart.js area chart."""
    hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
    demand = [680, 620, 610, 750, 1180, 1340, 1420, 1390, 1480, 1530, 1250, 920]
    solar = [0, 0, 0, 120, 540, 980, 1480, 1380, 890, 180, 0, 0]
    
    return {
        "labels": hours,
        "demand_kw": demand,
        "solar_gen_kw": solar
    }
