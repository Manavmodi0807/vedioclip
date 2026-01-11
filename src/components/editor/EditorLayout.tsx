import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Timeline from './Timeline';
import Player from './Player';
import PropertiesPanel from './PropertiesPanel';
import ResourcePanel from './ResourcePanel';
import AIToolsPanel from './AIToolsPanel';
import { useStore } from '../../store/useStore';
import { Loader2, Download } from 'lucide-react';

const EditorLayout = () => {
  const [activePanel, setActivePanel] = useState<'upload' | 'ai'>('upload');
  const [isExporting, setIsExporting] = useState(false);
  const { tracks } = useStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
        // Map tracks to backend format
        const backendTracks = tracks.map(t => {
            // Use serverFilename if available, otherwise fallback to name? 
            // The backend export logic expects a resolvable path.
            // If we don't have serverFilename, this will likely fail on backend unless it's a known server path.
            // For now, we assume if no serverFilename, we can't export it.
            return {
                id: t.id,
                src: t.serverFilename || t.name, // Fallback might fail if not in uploads/
                startTime: t.startTime,
                duration: t.duration,
                trimStart: t.trimStart || 0
            };
        });

        const response = await fetch('http://localhost:8000/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracks: backendTracks })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            // Trigger download
            window.open(data.downloadUrl, '_blank');
        } else {
            alert('Export failed: ' + (data.message || 'Unknown error'));
        }
    } catch (e) {
        console.error("Export error", e);
        alert("Export failed");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans">
      {/* Top Bar / Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-4 justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">V</div>
           <span className="font-semibold text-lg">Vedioclip</span>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isExporting ? <Loader2 size={14} className="animate-spin"/> : <Download size={14} />}
                {isExporting ? 'Exporting...' : 'Export'}
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />

        {/* Dynamic Panels */}
        {activePanel === 'upload' && <ResourcePanel />}
        {activePanel === 'ai' && <AIToolsPanel />}
        
        {/* Center Area (Player) */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <Player />
          <Timeline />
        </div>

        {/* Right Sidebar (Properties) */}
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default EditorLayout;
