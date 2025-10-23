import type { ShootingStyle } from "../types/types";
import type { Player } from "../types/types";
// lib/storage.ts

const USERS_KEY = "basketball_users";

export const loadUsers = (): Player[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const saveUsers = (users: Player[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const upsertUser = (u: Player) => {
  const all = loadUsers();
  const idx = all.findIndex((x) => x.id === u.id);
  if (idx >= 0) all[idx] = u;
  else all.push(u);
  saveUsers(all);
};

export const getCurrentPlayer = (): Player | null => {
  const list = loadUsers();
  return list.length ? list[list.length - 1] : null;
};

// ---------- Leaderboards ----------
export const topPractice = (users: Player[], limit = 10) =>
  users
    .slice()
    .sort((a, b) => (b.shotsMade || 0) - (a.shotsMade || 0))
    .slice(0, limit);

export const topPIG = (users: Player[], limit = 10) =>
  users
    .slice()
    .sort((a, b) => (b.pigBestRun || 0) - (a.pigBestRun || 0))
    .slice(0, limit);

// POTD across both modes (pick the higher of practice shotsMade vs pigBestRun)
export const playerOfTheDay = (users: Player[]) => {
  if (!users.length) return null;
  return users
    .slice()
    .sort(
      (a, b) =>
        Math.max(b.shotsMade || 0, b.pigBestRun || 0) -
        Math.max(a.shotsMade || 0, a.pigBestRun || 0)
    )[0];
};

// ---------- PIG save (only if logged in) ----------
export const recordPigRun = (made: number, xpEarned: number) => {
  const users = loadUsers();
  if (!users.length) return; // guest -> do NOT save

  const idx = users.length - 1;
  const p = users[idx];

  const next: Player = {
    ...p,
    pigBestRun: Math.max(p.pigBestRun || 0, made),
    xp: Math.min(1000, (p.xp || 0) + xpEarned),
    savedAt: new Date().toISOString(),
  };

  users[idx] = next;
  saveUsers(users);
};
