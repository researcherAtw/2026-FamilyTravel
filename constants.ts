
import { TabType } from "./types";

export const APP_NAME = "Zen Travel";

export const NAV_ITEMS: { id: TabType; icon: string; label: string }[] = [
  { id: 'schedule', icon: 'fa-calendar-days', label: '行程' },
  { id: 'bookings', icon: 'fa-ticket', label: '預訂' },
];
