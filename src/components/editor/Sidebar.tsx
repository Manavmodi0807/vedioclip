
import React, { useRef } from 'react';
import { LayoutGrid, Upload, Type, Music, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  activePanel: 'upload' | 'ai';
  setActivePanel: (panel: 'upload' | 'ai') => void;
}

const Sidebar = ({ activePanel, setActivePanel }: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addResource } = useStore();

  const handleUploadClick = () => {
    setActivePanel('upload');
    // If already on upload panel, open file dialog? Or maybe just keep it simple.
    // For now, let's keep the existing behavior: click icon -> open panel.
    // If "Upload" action specifically:
    if (activePanel === 'upload') {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      // Default resource without server filename first (optimistic)
      const id = crypto.randomUUID();
      
      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      
      try {
          const response = await fetch('http://localhost:8000/upload', {
              method: 'POST',
              body: formData
          });
          const data = await response.json();
          
          addResource({
            id,
            type: file.type.startsWith('video') ? 'video' : 'image',
            src: url,
            name: file.name,
            serverFilename: data.filename
          });
      } catch (e) {
          console.error("Upload failed", e);
          // Fallback: Add without server filename (export won't work for this file)
          addResource({
            id,
            type: file.type.startsWith('video') ? 'video' : 'image',
            src: url,
            name: file.name
          });
      }
    }
  };

  return (
    <div className="w-16 flex flex-col items-center py-4 bg-zinc-900 border-r border-zinc-800 h-full">
      <div className="flex flex-col gap-6">
        <SidebarItem 
            icon={<Upload size={20} />} 
            label="Upload" 
            active={activePanel === 'upload'} 
            onClick={() => {
                if (activePanel === 'upload') fileInputRef.current?.click();
                setActivePanel('upload');
            }} 
        />
        <SidebarItem icon={<LayoutGrid size={20} />} label="Templates" />
        <SidebarItem icon={<Type size={20} />} label="Text" />
        <SidebarItem icon={<Music size={20} />} label="Audio" />
        <SidebarItem 
            icon={<Sparkles size={20} />} 
            label="AI Tools" 
            active={activePanel === 'ai'}
            onClick={() => setActivePanel('ai')}
        />
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="video/*,image/*"
      />
    </div>
  );
};

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
      active ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Sidebar;
