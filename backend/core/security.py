import re
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from core.config import settings

# --- JWT Authentication ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- PII Redaction Layer (Zero-Disclosure) ---
class PIIRedactor:
    def __init__(self):
        # Regular expressions for common PII in India context
        self.patterns = {
            "AADHAAR": r"\b\d{4}\s?\d{4}\s?\d{4}\b",
            "PAN_CARD": r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b",
            "PHONE": r"\b(\+91[\-\s]?)?[6-9]\d{9}\b",
            "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        }
        # In a real-world scenario, you would also use an NLP NER model (e.g., SpaCy) 
        # to identify and redact names and specific locations.
    
    def redact(self, text: str) -> str:
        if not text:
            return text
        
        redacted_text = text
        for pii_type, pattern in self.patterns.items():
            redacted_text = re.sub(pattern, f"[REDACTED {pii_type}]", redacted_text)
            
        # Example naive name redaction (for demo purposes)
        # Should be replaced with proper NLP NER Pipeline.
        return redacted_text

pii_redactor = PIIRedactor()
