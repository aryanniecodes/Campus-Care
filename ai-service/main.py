from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class SuggestionRequest(BaseModel):
    text: str

class SuggestionResponse(BaseModel):
    suggestions: List[str]
    category: str

@app.get("/")
def home():
    return {"message": "AI Service Running"}

@app.post("/classify")
def classify(data: dict):
    text = data.get("text", "").lower()

    if "fan" in text or "light" in text:
        return {"category": "electricity"}
    elif "water" in text or "leak" in text:
        return {"category": "plumbing"}
    elif "dirty" in text or "clean" in text:
        return {"category": "cleaning"}
    else:
        return {"category": "other"}

@app.post("/suggest", response_model=SuggestionResponse)
def suggest(request: SuggestionRequest):
    text = request.text.lower()
    
    # Simple rule-based logic for demo (In real case, this would call an LLM)
    if "light" in text or "fan" in text or "electricity" in text:
        return {
            "suggestions": ["Is the light flickering?", "Is it a broken switch?", "Is the whole wing affected?"],
            "category": "electric"
        }
    elif "leak" in text or "water" in text or "tap" in text:
        return {
            "suggestions": ["Is it a pipe burst?", "Is the water overflowing?", "Is it in the bathroom?"],
            "category": "plumbing"
        }
    elif "dirty" in text or "garbage" in text or "clean" in text:
        return {
            "suggestions": ["Is it a common area?", "Is there a bad odor?", "Is it a recurring issue?"],
            "category": "cleaning"
        }
    
    # Fallback
    return {
        "suggestions": ["Please provide more details", "Where is this located?", "When did it start?"],
        "category": "other"
    }