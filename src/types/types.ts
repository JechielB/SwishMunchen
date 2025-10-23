// Shared app types
export type ShootingStyle =
  | "All-Around"
  | "Sharpshooter"
  | "Shot Creator"
  | "Slasher";

export type Player = {
  id: string;
  name: string;
  age: number;
  avatarDataUrl: string | null;
  ovr: 75 | 85 | 95;
  shootingStyle: ShootingStyle;
  xp: number; // 0..1000
  shotsMade: number; // cumulative (Practice)
  mode?: "Practice" | "PIG";
  pigBestRun?: number; // NEW: best makes in a single PIG run
  savedAt: string;
};

export type Dot = {
  id: number;
  x: number; // px relative to image bounding box (left)
  y: number; // px relative to image bounding box (top)
  inside: boolean;
};
