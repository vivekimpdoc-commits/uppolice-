import re
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login")

# --- JWT Authentication ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
        return {"user_id": user_id, "role": role}
    except JWTError:
        raise credentials_exception

# Role Checkers
def require_admin(user: dict = Depends(verify_token)):
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions. Admin role required.")
    return user

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
    
    def redact(self, text: str) -> str:
        if not text:
            return text
        
        redacted_text = text
        for pii_type, pattern in self.patterns.items():
            redacted_text = re.sub(pattern, f"[REDACTED {pii_type}]", redacted_text)
            
        return redacted_text

pii_redactor = PIIRedactor()
