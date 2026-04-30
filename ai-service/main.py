from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class SuggestionRequest(BaseModel):
    text: str

class SuggestionResponse(BaseModel):
    suggestions: List[str]
    category: str

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UnifiedResponse(BaseModel):
    suggestions: List[str] = []
    category: str = ""
    improvedText: str = ""

@app.get("/")
def home():
    return {"message": "AI Service Running"}

@app.post("/classify")
def classify(data: dict):
    try:
        text = data.get("text", "").lower()

        if "fan" in text or "light" in text:
            return {"category": "electric"}
        elif "water" in text or "leak" in text:
            return {"category": "plumbing"}
        elif "dirty" in text or "clean" in text:
            return {"category": "cleaning"}
        else:
            return {"category": "other"}
    except Exception as e:
        logger.error(f"Error in /classify: {str(e)}")
        return {"category": "other"}

@app.post("/suggest", response_model=UnifiedResponse)
def suggest(request: SuggestionRequest):
    try:
        if not request.text:
            return UnifiedResponse()

        text = request.text.lower()
        
        if "light" in text or "fan" in text or "electricity" in text:
            return UnifiedResponse(
                suggestions=["Is the light flickering?", "Is it a broken switch?", "Is the whole wing affected?"],
                category="electric"
            )
        elif "leak" in text or "water" in text or "tap" in text:
            return UnifiedResponse(
                suggestions=["Is it a pipe burst?", "Is the water overflowing?", "Is it in the bathroom?"],
                category="plumbing"
            )
        elif "dirty" in text or "garbage" in text or "clean" in text:
            return UnifiedResponse(
                suggestions=["Is it a common area?", "Is there a bad odor?", "Is it a recurring issue?"],
                category="cleaning"
            )
        
        return UnifiedResponse()
    except Exception as e:
        logger.error(f"Error in /suggest: {str(e)}")
        return UnifiedResponse()

class ImproveRequest(BaseModel):
    title: str
    description: str

@app.post("/improve-description", response_model=UnifiedResponse)
def improve_description(request: ImproveRequest):
    try:
        if not request.title and not request.description:
            return UnifiedResponse()

        title = request.title.lower()
        desc = request.description
        
        location_keywords = ["room", "hostel", "floor", "block", "lab", "canteen", "library", "ground"]
        found_location = ""
        
        words = desc.split()
        for i, word in enumerate(words):
            if word.lower() in location_keywords:
                start = max(0, i - 1)
                end = min(len(words), i + 3)
                found_location = " ".join(words[start:end])
                break

        if "light" in title or "fan" in title or "electricity" in title:
            improved = f"The {title} is malfunctioning and requires immediate attention. This issue is causing significant inconvenience and potentially poses a safety concern. Please dispatch a technician to inspect and resolve this at the earliest."
        elif "leak" in title or "water" in title or "tap" in title:
            improved = f"There is a persistent {title} issue which is leading to water wastage and potential damage to the surroundings. This requires urgent repair to prevent further escalation. Kindly prioritize this maintenance request."
        elif "dirty" in title or "garbage" in title or "clean" in title:
            improved = f"The area is currently in an unsanitary condition due to {title}. This is affecting the hygiene and environment of the premises. We request a thorough cleaning and waste removal as soon as possible."
        elif "wifi" in title or "internet" in title or "network" in title:
            improved = f"There is a disruption in the {title} connectivity, which is hindering academic activities and communication. Stable access is critical at this time. Please look into the network configuration or hardware."
        else:
            improved = f"This is a formal complaint regarding {title}. The current state is unsatisfactory and needs to be addressed by the maintenance team. We appreciate your prompt action in resolving this matter."

        if found_location and found_location.lower() not in improved.lower():
            improved = f"{improved} Location: {found_location}."
        elif found_location == "" and desc:
            if len(desc) > len(title) and desc.lower() not in improved.lower():
                improved = f"{desc}. {improved}"

        return UnifiedResponse(improvedText=improved)
    except Exception as e:
        logger.error(f"Error in /improve-description: {str(e)}")
        return UnifiedResponse(improvedText=request.description or "")
