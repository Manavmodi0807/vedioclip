
import os
from moviepy.editor import VideoFileClip, CompositeVideoClip, concatenate_videoclips

def export_timeline(timeline_data, output_path="output.mp4"):
    """
    timeline_data: dict containing 'tracks' (list of clips)
    Each clip: { src, startTime, duration, trimStart, ... }
    """
    clips = []
    
    for track in timeline_data.get('tracks', []):
        # Resolve path - assuming src is a filename in uploads/ or full path
        # For this MVP, we strip common prefixes or assume filename in uploads
        filename = os.path.basename(track['src'])
        # If it's a blob URL, we can't do much unless we mapped it. 
        # But if we assume we uploaded it, we look in uploads/
        file_path = os.path.join("backend", "uploads", filename)
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        try:
            # Load clip
            clip = VideoFileClip(file_path)
            
            # Trim
            trim_start = track.get('trimStart', 0)
            duration = track.get('duration', clip.duration)
            clip = clip.subclip(trim_start, trim_start + duration)
            
            # Position on timeline
            clip = clip.set_start(track['startTime'])
            
            # Add to list
            clips.append(clip)
            
        except Exception as e:
            print(f"Error processing clip {filename}: {e}")

    if not clips:
        return None

    # Composite
    # We use CompositeVideoClip for multi-track/overlapping support
    final_video = CompositeVideoClip(clips)
    
    # Render
    final_video.write_videofile(output_path, fps=24)
    return output_path
