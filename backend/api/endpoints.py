from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List
from services.ml_hotspot import hotspot_predictor
from services.llm_summarizer import case_summarizer
from core.security import verify_token, require_admin, create_access_token
from datetime import timedelta

router = APIRouter()

# Schema for ML prediction request
class LocationData(BaseModel):
    lat: float
    lng: float
    severity: int
    timestamp: str

class HotspotRequest(BaseModel):
    historical_data: List[LocationData]

@router.post("/login", summary="Login to get access token (USER or ADMIN)")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Mock authentication logic for boilerplate
    # In production, verify against database using hashed passwords
    if form_data.username == "admin" and form_data.password == "admin123":
        role = "ADMIN"
    elif form_data.username == "officer" and form_data.password == "officer123":
        role = "USER"
    else:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(
        data={"sub": form_data.username, "role": role},
        expires_delta=timedelta(minutes=1440)
    )
    return {"access_token": access_token, "token_type": "bearer", "role": role}

@router.post("/predict-hotspots", summary="Predict Crime Hotspots for next 24h")
async def predict_hotspots(request: HotspotRequest, user: dict = Depends(verify_token)):
    """
    Takes past 5 years of FIR data coordinates and returns risk hotspots using Hybrid Clustering.
    Both USER and ADMIN can access this.
    """
    data_dicts = [item.model_dump() for item in request.historical_data]
    predictions = hotspot_predictor.predict_hotspots(data_dicts)
    return {"status": "success", "hotspots": predictions, "requested_by": user["user_id"]}

@router.post("/upload-casefile", summary="Upload 50+ page charge sheet for LLM Summarization")
async def upload_casefile(file: UploadFile = File(...), user: dict = Depends(require_admin)):
    """
    Accepts raw case file text (or PDF), redacts PII, chunks the data, and extracts vital intel.
    ONLY ADMIN can access this endpoint.
    """
    if file.content_type not in ["text/plain", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only text or PDF files allowed.")
        
    content = await file.read()
    raw_text = content.decode('utf-8', errors='ignore')
    
    # Process through LLM pipeline (includes PII redaction and chunking)
    analysis = case_summarizer.summarize_document(raw_text)
    
    return {
        "status": "success",
        "filename": file.filename,
        "ai_analysis": analysis,
        "processed_by_admin": user["user_id"]
    }
