from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
from services.ml_hotspot import hotspot_predictor
from services.llm_summarizer import case_summarizer

router = APIRouter()

# Schema for ML prediction request
class LocationData(BaseModel):
    lat: float
    lng: float
    severity: int
    timestamp: str

class HotspotRequest(BaseModel):
    historical_data: List[LocationData]

# Dummy dependency for JWT/RBAC check
def verify_token_and_role():
    # In a real app, this would decode the JWT and check the role
    # e.g., if user.role not in ["INVESTIGATOR", "ADMIN"]: raise HTTPException(...)
    return {"user_id": "officer_123", "role": "INVESTIGATOR"}

@router.post("/predict-hotspots", summary="Predict Crime Hotspots for next 24h")
async def predict_hotspots(request: HotspotRequest, user: dict = Depends(verify_token_and_role)):
    """
    Takes past 5 years of FIR data coordinates and returns risk hotspots using Hybrid Clustering.
    """
    data_dicts = [item.dict() for item in request.historical_data]
    predictions = hotspot_predictor.predict_hotspots(data_dicts)
    return {"status": "success", "hotspots": predictions, "requested_by": user["user_id"]}

@router.post("/upload-casefile", summary="Upload 50+ page charge sheet for LLM Summarization")
async def upload_casefile(file: UploadFile = File(...), user: dict = Depends(verify_token_and_role)):
    """
    Accepts raw case file text (or PDF), redacts PII, chunks the data, and extracts vital intel.
    """
    if file.content_type not in ["text/plain", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only text or PDF files allowed.")
        
    content = await file.read()
    raw_text = content.decode('utf-8', errors='ignore')
    
    # Process through LLM pipeline (includes PII redaction and chunking)
    analysis = case_summarizer.summarize_document(raw_text)
    
    # In a real app, this unstructured result is saved to MongoDB (motor)
    
    return {
        "status": "success",
        "filename": file.filename,
        "ai_analysis": analysis
    }
