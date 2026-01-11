
import os
from scenedetect import open_video, SceneManager, split_video_ffmpeg
from scenedetect.detectors import ContentDetector
from scenedetect.scene_manager import save_images

def detect_scenes(video_path: str, threshold=30.0):
    """
    Detects scenes in a video using ContentDetector.
    Returns a list of dicts with start_time, end_time (in seconds) and duration.
    """
    video = open_video(video_path)
    scene_manager = SceneManager()
    
    # ContentDetector finds cuts where pixel content changes by more than 'threshold'
    scene_manager.add_detector(ContentDetector(threshold=threshold))
    
    # Detect scenes
    scene_manager.detect_scenes(video, show_progress=False)
    scene_list = scene_manager.get_scene_list()
    
    results = []
    for i, scene in enumerate(scene_list):
        start, end = scene
        duration = end.get_seconds() - start.get_seconds()
        
        # Filter out very short clips if needed (e.g. < 1s)
        if duration < 1.0:
            continue
            
        results.append({
            "id": f"scene_{i}",
            "startTime": start.get_seconds(),
            "endTime": end.get_seconds(),
            "duration": duration
        })
        
    return results
