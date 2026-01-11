
import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Sparkles, Loader2, Plus } from 'lucide-react';

const AIToolsPanel = () => {
    const { addBox } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [scenes, setScenes] = useState<any[]>([]);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const analysisInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setCurrentFile(e.target.files[0]);
            setScenes([]);
        }
    };

    const handleAnalyze = async () => {
        if (!currentFile) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('http://localhost:8000/analyze-shorts', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.scenes) {
                setScenes(data.scenes);
            } else {
                console.error("Analysis failed", data);
            }
        } catch (error) {
            console.error("Error analyzing video", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addSceneToTimeline = (scene: any) => {
        if(!currentFile) return;
        
        // We use the same source video but different start/end times
        // In a real app we might clip it on server, but for now we reference the full source
        const url = URL.createObjectURL(currentFile);
        
        addBox({
            id: crypto.randomUUID(),
            type: 'video',
            trackId: 0,
            startTime: 0, // Start at beginning of timeline (or calculate next available slot)
            duration: scene.duration,
            trimStart: scene.startTime, // Offset in the source video
            src: url,
            name: `Short: ${scene.startTime.toFixed(1)}s`
        });
    };

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-blue-500" size={20} />
        <h3 className="text-sm font-semibold text-zinc-300">AI Tools</h3>
      </div>
      
      {/* Shorts Maker Tool */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 space-y-4">
        <h4 className="text-sm font-medium text-white mb-2">Shorts Maker</h4>
        <p className="text-xs text-zinc-400 mb-4">
            Automatically detect interesting scenes and create viral shorts.
        </p>

        {!currentFile ? (
             <button 
                onClick={() => analysisInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex flex-col items-center gap-2"
            >
                <Sparkles size={16} />
                <span className="text-xs">Select Video to Analyze</span>
            </button>
        ) : (
            <div className="space-y-3">
                 <div className="flex items-center justify-between bg-zinc-800 p-2 rounded text-xs">
                    <span className="truncate max-w-[150px]">{currentFile.name}</span>
                    <button onClick={() => setCurrentFile(null)} className="text-zinc-500 hover:text-white">x</button>
                 </div>
                 
                 <button 
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {isLoading ? 'Analyzing...' : 'Generate Shorts'}
                 </button>
            </div>
        )}

        {/* Results */}
        {scenes.length > 0 && (
            <div className="space-y-2 mt-4">
                <hr className="border-zinc-700 my-2"/>
                <p className="text-xs text-zinc-400 font-medium">{scenes.length} Scenes Found</p>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {scenes.map((scene, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded hover:border-zinc-600 group">
                            <div className="text-xs text-zinc-300">
                                {new Date(scene.startTime * 1000).toISOString().substr(14, 5)} - {new Date(scene.endTime * 1000).toISOString().substr(14, 5)}
                            </div>
                            <button 
                                onClick={() => addSceneToTimeline(scene)}
                                className="text-blue-500 hover:bg-blue-500/10 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <input 
            type="file" 
            ref={analysisInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="video/*"
        />
      </div>
    </div>
  );
};

export default AIToolsPanel;
