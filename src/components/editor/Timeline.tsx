
import React, { useRef, MouseEvent, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const Timeline = () => {
  const { currentTime, duration, tracks, setCurrentTime, updateBox } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<{ id: string, side: 'left' | 'right' } | null>(null);
  const dragStartRef = useRef<{ x: number, startTime: number, duration: number } | null>(null);

  // Handle Playhead seeking
  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingId || resizingId) return; // Don't seek if we just finished dragging/resizing
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setCurrentTime(percent * duration);
  };

  const playheadPos = (currentTime / duration) * 100;

  // Dragging Logic (Move)
  const handleClipMouseDown = (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    dragStartRef.current = { x: e.clientX, startTime: tracks.find(t=>t.id===id)?.startTime || 0, duration: 0 };
  };

    // Resizing Logic (Trim)
  const handleResizeMouseDown = (e: MouseEvent, id: string, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setResizingId({ id, side });
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    dragStartRef.current = { x: e.clientX, startTime: track.startTime, duration: track.duration };
  };

  useEffect(() => {
    if (draggingId) {
      const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (!timelineRef.current || !dragStartRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        
        // Calculate delta
        const deltaPixels = e.clientX - dragStartRef.current.x;
        const deltaSeconds = (deltaPixels / rect.width) * duration;
        
        let newStartTime = dragStartRef.current.startTime + deltaSeconds;
        newStartTime = Math.max(0, newStartTime); // Cannot go before 0
        
        updateBox(draggingId, { startTime: newStartTime });
      };

      const handleMouseUp = () => {
        setDraggingId(null);
        dragStartRef.current = null;
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }

    if (resizingId) {
        const handleMouseMove = (e: globalThis.MouseEvent) => {
          if (!timelineRef.current || !dragStartRef.current) return;
          const rect = timelineRef.current.getBoundingClientRect();
          const { startTime, duration: startDuration } = dragStartRef.current;

          const deltaPixels = e.clientX - dragStartRef.current.x;
          const deltaSeconds = (deltaPixels / rect.width) * duration;
          
          if (resizingId.side === 'right') {
              // Adjust duration
              const newDuration = Math.max(0.5, startDuration + deltaSeconds); // Min 0.5s
              updateBox(resizingId.id, { duration: newDuration });
          } else {
              // Adjust start time AND duration (so end time stays same)
              const newStartTime = Math.max(0, startTime + deltaSeconds);
              const newDuration = Math.max(0.5, startDuration - (newStartTime - startTime));
              
              if (newDuration > 0.5) {
                   updateBox(resizingId.id, { startTime: newStartTime, duration: newDuration });
              }
          }
        };
  
        const handleMouseUp = () => {
          setResizingId(null);
          dragStartRef.current = null;
        };
  
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
    }
  }, [draggingId, resizingId, duration, updateBox]);


  return (
    <div className="h-64 bg-zinc-900 border-t border-zinc-800 flex flex-col select-none">
      {/* Time Ruler & Scrubber Area */}
      <div 
        ref={timelineRef}
        className="h-8 border-b border-zinc-800 bg-zinc-900 w-full relative cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Time Markers */}
        <div className="absolute inset-0 flex items-end px-2 pointer-events-none">
             {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <div key={p} className="absolute text-[10px] text-zinc-500 bottom-1" style={{ left: `${p * 100}%` }}>
                    {new Date(p * duration * 1000).toISOString().substr(14, 5)}
                </div>
             ))}
        </div>

        {/* Playhead */}
        <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `${playheadPos}%` }}
        >
            <div className="w-3 h-3 bg-red-500 transform -translate-x-1/2 rotate-45 -mt-1 rounded-sm shadow-sm" />
            <div className="w-px h-[200px] bg-red-500/50" />
        </div>
      </div>
      
      {/* Tracks Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
         {/* Playhead Line in Tracks area */}
         <div 
            className="absolute top-0 bottom-0 w-px bg-red-500/30 z-20 pointer-events-none"
            style={{ left: `${playheadPos}%` }}
        />

        {/* Empty State / Tracks */}
        {tracks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                Drag and drop assets here enabled soon...
            </div>
        ) : (
            tracks.map((track, i) => (
                <div key={i} className="h-16 bg-zinc-800/50 rounded-md border border-zinc-700/50 relative overflow-hidden group">
                     {/* Clip rendering */}
                     <div 
                          onMouseDown={(e) => handleClipMouseDown(e, track.id)}
                          className={`absolute top-0 bottom-0 bg-blue-500/30 border border-blue-500/50 cursor-grab active:cursor-grabbing hover:bg-blue-500/40 transition-colors group/clip ${draggingId === track.id ? 'z-50 ring-2 ring-white/50' : ''}`}
                          style={{ left: `${(track.startTime/duration)*100}%`, width: `${(track.duration/duration)*100}%` }}
                     >
                          <span className="text-xs text-white p-1 truncate block pointer-events-none select-none">{track.name}</span>
                          
                          {/* Left Handle */}
                          <div 
                            onMouseDown={(e) => handleResizeMouseDown(e, track.id, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white/50 z-20" 
                          />
                          
                          {/* Right Handle */}
                          <div 
                            onMouseDown={(e) => handleResizeMouseDown(e, track.id, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/50 z-20" 
                          />
                     </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
