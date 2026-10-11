"""Common response and error schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ErrorDetail(BaseModel):
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    errors: Optional[List[ErrorDetail]] = None

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "Urban Flood Risk API"
    version: str = "1.0.0"
    model_loaded: bool
    model_version: Optional[str] = None
    environment: str
