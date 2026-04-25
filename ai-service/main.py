from fastapi import FastAPI

app = FastAPI()

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