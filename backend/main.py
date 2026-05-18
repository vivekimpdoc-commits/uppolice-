from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.endpoints import router as api_router
import asyncio
import json

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend Architecture for Smart Policing & AI Investigation Engine",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include REST APIs ---
app.include_router(api_router, prefix=settings.API_V1_STR)

# --- WebSockets: Real-Time Alerts for Field Officers ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_alert(self, message: str, risk_level: str):
        alert_payload = json.dumps({"alert": message, "risk": risk_level})
        for connection in self.active_connections:
            await connection.send_text(alert_payload)

manager = ConnectionManager()

@app.websocket("/ws/live-alerts")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for pushing live geospatial crime alerts to field officers.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages if any
            data = await websocket.receive_text()
            # Echo back or handle client acks
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Background Task to simulate sending alerts ---
async def simulate_live_alerts():
    while True:
        await asyncio.sleep(60) # Simulate a new hotspot alert every 60 seconds
        if manager.active_connections:
            await manager.broadcast_alert("New High-Risk Hotspot detected in Sector 15", "HIGH")

@app.on_event("startup")
async def startup_event():
    # Start the background task for live alerts
    asyncio.create_task(simulate_live_alerts())
    print(f"🚀 {settings.PROJECT_NAME} Backend Started.")

@app.get("/", tags=["Health Check"])
def health_check():
    return {"status": "Operational", "system": settings.PROJECT_NAME}

# To run locally:
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
