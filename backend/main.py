
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from .shorts_logic import detect_scenes
from .export_logic import export_timeline
from pydantic import BaseModel
from typing import List, Optional

class Clip(BaseModel):
    id: str
    src: str
    startTime: float
    duration: float
    trimStart: Optional[float] = 0.0

class TimelineData(BaseModel):
    tracks: List[Clip]

app = FastAPI()

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "backend/uploads"
OUTPUT_DIR = "backend/outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Ssemble Clone API is running!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "url": f"http://localhost:8000/uploads/{file.filename}"} # Mock URL

@app.post("/analyze-shorts")
async def analyze_shorts(file: UploadFile = File(...)):
    temp_file_path = f"{UPLOAD_DIR}/{file.filename}"
    
    try:
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Detect scenes
        scenes = detect_scenes(temp_file_path)
        return {"scenes": scenes}
        
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.post("/export")
async def export_video(data: TimelineData):
    try:
        output_filename = "exported_video.mp4"
        output_path = f"{OUTPUT_DIR}/{output_filename}"
        
        # Convert Pydantic model to dict
        timeline_dict = data.dict()
        
        result = export_timeline(timeline_dict, output_path)
        
        if result:
            return {"status": "success", "downloadUrl": f"http://localhost:8000/outputs/{output_filename}"}
        else:
            return {"status": "error", "message": "Export failed"}
            
    except Exception as e:
        print(f"Error export: {e}")
        return {"error": str(e)}

from fastapi.staticfiles import StaticFiles
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

@app.get("/health")
def health_check():
    return {"status": "ok"}
