
import { TabType } from "./types";

export const APP_NAME = "Zen Travel";

export const NAV_ITEMS: { id: TabType | 'search'; icon: string; label: string }[] = [
  { id: 'schedule', icon: 'fa-dungeon', label: '副本' },
  { id: 'alchemy', icon: 'fa-flask', label: '煉金' },
  { id: 'search', icon: 'fa-magnifying-glass', label: '探索' },
  { id: 'bookings', icon: 'fa-wand-magic-sparkles', label: '傳送' },
  { id: 'support', icon: 'fa-shield-heart', label: '支援' },
];
