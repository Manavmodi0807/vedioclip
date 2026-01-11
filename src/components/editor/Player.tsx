
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Player = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, setDuration, tracks } = useStore();
  const [activeTrack, setActiveTrack] = useState<any>(null);

  // Find active track based on currentTime
  useEffect(() => {
    const track = tracks.find(t => 
        t.type === 'video' && 
        currentTime >= t.startTime && 
        currentTime < t.startTime + t.duration
    );
    setActiveTrack(track || null);
  }, [currentTime, tracks]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Sync video time with store when playing
  // Note: We only update store from video if video is actually playing the active track
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying && activeTrack) {
        // Calculate global time from video time
        // videoTime = (globalTime - trackStart) + trimStart
        // globalTime = videoTime - trimStart + trackStart
        const videoTime = videoRef.current.currentTime;
        const globalTime = videoTime - (activeTrack.trimStart || 0) + activeTrack.startTime;
        setCurrentTime(globalTime);
    }
  };

  // Main Playback Logic Loop
  useEffect(() => {
      let animationFrame: number;

      const loop = () => {
          if (isPlaying) {
              const now = performance.now();
              // In a real app we'd use delta time, but here we rely on video event or simple increment if no video
              if (!activeTrack) {
                  // If no video, just increment time manually
                  setCurrentTime(currentTime + 0.033); // ~30fps
              }
          }
          // animationFrame = requestAnimationFrame(loop);
      };

      // Interval for non-video playback or checking
      const interval = setInterval(() => {
          if (isPlaying && !activeTrack) {
               setCurrentTime(currentTime + 0.1); 
          }
      }, 100);

      return () => clearInterval(interval);
  }, [isPlaying, activeTrack, currentTime, setCurrentTime]);


  // Sync Video Element with State
  useEffect(() => {
    if (!videoRef.current) return;

    if (activeTrack) {
        // Check if src changed
        if (videoRef.current.src !== activeTrack.src) {
            videoRef.current.src = activeTrack.src;
        }

        // Calculate expected video time
        const expectedTime = (currentTime - activeTrack.startTime) + (activeTrack.trimStart || 0);
        
        // Sync if drifted
        if (Math.abs(videoRef.current.currentTime - expectedTime) > 0.5) {
            videoRef.current.currentTime = expectedTime;
        }

        if (isPlaying && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
        } else if (!isPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
        }
    } else {
        // No track, pause video
        if (!videoRef.current.paused) videoRef.current.pause();
        // Maybe clear src or hide?
        // videoRef.current.src = "";
    }
  }, [currentTime, activeTrack, isPlaying]);


  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-8 relative">
      <div className="aspect-video w-full max-w-3xl bg-black rounded-lg shadow-2xl border border-zinc-800 flex items-center justify-center overflow-hidden relative">
        {activeTrack ? (
            <video 
                ref={videoRef}
                className="w-full h-full object-contain"
                // onTimeUpdate={handleTimeUpdate} // causing loop issues, using interval/check instead?
                onEnded={() => {
                    // When clip ends, maybe pause? Or just let logic handle next frame?
                }}
            />
        ) : (
            <div className="text-zinc-600 text-sm">No Clip</div>
        )}
        
        {/* Overlay Info */}
        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
            {activeTrack ? `Playing: ${activeTrack.name}` : `Time: ${currentTime.toFixed(2)}`}
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="flex items-center gap-4 mt-4 bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800">
        <button className="text-zinc-400 hover:text-white" onClick={() => {
            setCurrentTime(0);
        }}>
            <SkipBack size={20} />
        </button>
        
        <button className="text-white hover:text-blue-500" onClick={togglePlay}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        
        <button className="text-zinc-400 hover:text-white" onClick={() => {
             setCurrentTime(currentTime + 5);
        }}>
            <SkipForward size={20} />
        </button>

         <div className="text-xs font-mono text-zinc-400 ml-2">
            {new Date(currentTime * 1000).toISOString().substr(14, 5)}
         </div>
      </div>
    </div>
  );
};

export default Player;
