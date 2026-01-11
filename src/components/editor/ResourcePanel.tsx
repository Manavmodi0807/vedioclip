
import React from 'react';
import { useStore } from '../../store/useStore';
import { Plus } from 'lucide-react';

const ResourcePanel = () => {
  const { resources, addBox } = useStore();

  const handleAddBox = (resource: any) => {
    addBox({
        id: crypto.randomUUID(),
        type: resource.type,
        trackId: 0,
        startTime: 0,
        duration: 5, // Default duration
        src: resource.src,
        name: resource.name,
        serverFilename: resource.serverFilename
    });
  };

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Assets</h3>
      
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start">
        {resources.length === 0 ? (
            <div className="col-span-2 text-center text-zinc-500 text-xs mt-10">
                No assets uploaded.<br/>Click "Upload" in the sidebar.
            </div>
        ) : (
            resources.map((res) => (
                <div key={res.id} className="group relative aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-blue-500 transition-colors">
                    {res.type === 'video' ? (
                        <video src={res.src} className="w-full h-full object-cover" />
                    ) : (
                        <img src={res.src} alt={res.name} className="w-full h-full object-cover" />
                    )}
                    
                    <button 
                        onClick={() => handleAddBox(res)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                        <Plus className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-[10px] text-white truncate">{res.name}</p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ResourcePanel;
