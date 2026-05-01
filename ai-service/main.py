import os
import logging
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# ─── ENVIRONMENT SETUP ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, "campus-backend", ".env")
load_dotenv(ENV_PATH)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # We log this but don't crash yet to allow local fallback to work
    logging.warning("[AI] OPENAI_API_KEY not found in environment. Service will use local fallback only.")

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI Client safely
client = None
if OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        logger.error(f"[AI] Failed to initialize OpenAI client: {str(e)}")

class SuggestionRequest(BaseModel):
    text: str

class ImproveRequest(BaseModel):
    title: str
    description: str

class UnifiedResponse(BaseModel):
    success: bool = True
    suggestions: List[str] = []
    category: str = ""
    improvedText: str = ""
    message: str = ""

@app.get("/")
def home():
    return {"message": "AI Service Running", "openai_status": "configured" if client else "local_only"}

@app.post("/classify", response_model=UnifiedResponse)
def classify(data: dict):
    try:
        text = data.get("text", "").lower()
        category = "other"

        # Logic remains the same (rule-based for classification)
        if "fan" in text or "light" in text:
            category = "electric"
        elif "water" in text or "leak" in text:
            category = "plumbing"
        elif "dirty" in text or "clean" in text:
            category = "cleaning"

        return UnifiedResponse(success=True, category=category)
    except Exception as e:
        logger.error(f"Error in /classify: {str(e)}")
        return UnifiedResponse(success=False, category="other")

@app.post("/suggest", response_model=UnifiedResponse)
def suggest(request: SuggestionRequest):
    try:
        if not request.text:
            return UnifiedResponse(success=False, message="Empty text")

        # ─── PRIMARY: OpenAI ───
        if client:
            try:
                prompt = f"Given this partial campus maintenance complaint: '{request.text}', suggest 3 short follow-up questions for the student to clarify the issue. Return ONLY the questions as a semicolon-separated string."
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "system", "content": "You are a helpful campus maintenance assistant."}, {"role": "user", "content": prompt}],
                    max_tokens=60
                )
                questions_str = response.choices[0].message.content.strip()
                questions = [q.strip() for q in questions_str.split(";") if q.strip()]
                
                # Simple category detection
                text = request.text.lower()
                category = "other"
                if any(w in text for w in ["light", "fan", "electricity"]): category = "electric"
                elif any(w in text for w in ["leak", "water", "tap"]): category = "plumbing"
                elif any(w in text for w in ["dirty", "garbage", "clean"]): category = "cleaning"

                return UnifiedResponse(success=True, suggestions=questions[:3], category=category)
            except Exception as e:
                logger.error(f"[AI] OpenAI error in /suggest: {str(e)}")
                # OpenAI failed (e.g. 429 quota) — return rich contextual fallback
                input_text = request.text
                return UnifiedResponse(
                    success=True,
                    suggestions=[
                        f"Clearly describe the issue: {input_text}",
                        "Mention exact location (room number / block / floor)",
                        "Include when the issue first started",
                        "Explain how it is affecting daily routine",
                        "Specify urgency level (low / medium / high)"
                    ],
                    category="general"
                )

        # ─── FALLBACK: Local Logic ───
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
        
        return UnifiedResponse(success=True)
    except Exception as e:
        logger.error(f"Error in /suggest: {str(e)}")
        return UnifiedResponse(success=False, suggestions=[])

@app.post("/improve-description", response_model=UnifiedResponse)
def improve_description(request: ImproveRequest):
    try:
        if not request.title and not request.description:
            return UnifiedResponse(success=False, message="Missing title or description")

        # ─── PRIMARY: OpenAI ───
        if client:
            try:
                prompt = f"Improve this campus maintenance request description to be professional and concise.\nTitle: {request.title}\nOriginal Description: {request.description}\nReturn ONLY the improved text."
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "system", "content": "You are a professional dispatcher."}, {"role": "user", "content": prompt}],
                    max_tokens=150
                )
                improved = response.choices[0].message.content.strip()
                return UnifiedResponse(success=True, improvedText=improved)
            except Exception as e:
                logger.error(f"[AI] OpenAI error in /improve-description: {str(e)}")
                # OpenAI failed (e.g. 429 quota) — return improved fallback
                input_text = f"{request.description}"
                return UnifiedResponse(
                    success=True,
                    improvedText=f"{input_text}. This issue requires prompt attention from the maintenance team. Kindly resolve it at the earliest to avoid further inconvenience."
                )

        # ─── FALLBACK: Local logic ───
        title = request.title.lower()
        desc = request.description
        
        if "light" in title or "fan" in title or "electricity" in title:
            improved = f"The {title} is malfunctioning and requires immediate attention. This issue is causing significant inconvenience."
        elif "leak" in title or "water" in title or "tap" in title:
            improved = f"There is a persistent {title} issue which is leading to water wastage. This requires urgent repair."
        else:
            improved = f"This is a formal complaint regarding {title}. {desc}"

        return UnifiedResponse(success=True, improvedText=improved)
    except Exception as e:
        logger.error(f"Error in /improve-description: {str(e)}")
        return UnifiedResponse(success=True, improvedText=request.description or "")