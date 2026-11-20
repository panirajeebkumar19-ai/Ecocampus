"""
EcoCampus FastAPI Main Application
Provides a unified REST API for IoT telemetry, Dorm Derby, Cafeteria Food Rescue, and EcoPatrol.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
from datetime import datetime
from app.routers import auth, telemetry, derby, meals, incidents, bounties, chatbot
from app.database import init_db

# Initialize SQLite database tables
init_db()

app = FastAPI(
    title="EcoCampus Sustainability Hub API",
    description="High-performance async REST backend powering IoT Microgrid, Dorm Derby, Food Rescue, and EcoPatrol.",
    version="1.0.0"
)

# Enable CORS for frontend clients (Vite, dev server, local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(telemetry.router, prefix="/api")
app.include_router(derby.router, prefix="/api")
app.include_router(meals.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(bounties.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "EcoCampus Sustainability Hub API",
        "status": "online",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "active_campus": "IN IIT Delhi"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ecocampus-backend",
        "version": "1.0.0"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        base_solar = 1540.0
        while True:
            jitter = random.uniform(-18.0, 18.0)
            solar_kw = round(base_solar + jitter, 1)
            solar_pct = round(81.4 + (jitter / 10.0), 1)
            irradiance = round(920 + (jitter * 4.5))
            battery_soc = round(94.2 + (jitter / 40.0), 1)
            
            payload = {
                "type": "telemetry_tick",
                "timestamp": datetime.utcnow().isoformat(),
                "solar_pv_kw": solar_kw,
                "solar_percentage": solar_pct,
                "solar_irradiance_wm2": irradiance,
                "ambient_temp_c": 34.2,
                "battery_soc_percentage": battery_soc,
                "battery_flow_kw": "+185 kW",
                "grid_import_kw": 280,
                "sub_meters_online": 142
            }
            await websocket.send_json(payload)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
