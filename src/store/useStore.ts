import { create } from "zustand";

export type AssetType = "video" | "image" | "audio" | "text";

export interface Box {
  id: string;
  type: AssetType;
  trackId: number;
  startTime: number; // Position on timeline
  duration: number;
  trimStart?: number; // Offset in source video
  src: string;
  name: string;
  serverFilename?: string;
}

export interface Resource {
  id: string;
  type: AssetType;
  src: string;
  name: string;
  serverFilename?: string; // Filename on backend
}

interface EditorState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  tracks: Box[];
  resources: Resource[];
  selectedBoxId: string | null;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addBox: (box: Box) => void;
  updateBox: (id: string, updates: Partial<Box>) => void;
  addResource: (resource: Resource) => void;
  setSelectedBoxId: (id: string | null) => void;
}

export const useStore = create<EditorState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 30, // Default 30s timeline
  tracks: [
    {
      id: "1",
      type: "video",
      trackId: 0,
      startTime: 0,
      duration: 10,
      src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      name: "Sample Video Clip",
    },
  ],
  resources: [],
  selectedBoxId: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  addBox: (box) => set((state) => ({ tracks: [...state.tracks, box] })),
  updateBox: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  addResource: (resource) =>
    set((state) => ({ resources: [...state.resources, resource] })),
  setSelectedBoxId: (selectedBoxId) => set({ selectedBoxId }),
}));
