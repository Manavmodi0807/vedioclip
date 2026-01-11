
import React from 'react';

const PropertiesPanel = () => {
  return (
    <div className="w-64 bg-zinc-900 border-l border-zinc-800 p-4 hidden lg:block">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">Properties</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500">Scale</label>
          <input type="range" className="w-full accent-blue-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-zinc-500">Opacity</label>
          <input type="range" className="w-full accent-blue-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        
        <div className="p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 border border-zinc-800">
          No item selected
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
