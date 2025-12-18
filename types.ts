
import React from 'react';

export type TabType = 'schedule' | 'bookings' | 'support';

// Changed from union to string to allow custom categories
export type CategoryType = string; 

export type HighlightColor = 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'gray' | 'teal';

export interface HighlightTag {
  id: string;
  text: string;
  color: HighlightColor;
}

export interface Member {
  id: string;
  name: string;
  avatar: string; // URL
}

export interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow';
  temp: number;
  locationName: string;
}

export interface RelatedLink {
  text: string;
  url: string;
}

export interface GuideInfo {
  story: string | React.ReactNode;
  highlights?: HighlightTag[];
  tip?: string;
  relatedLink?: RelatedLink;
}

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (Internal use or fallback)
  displayTime?: string; // Visual display (e.g. "11:00\n20:00")
  title: string;
  enTitle?: string; // English Title for subtitle
  location: string;
  mapQuery?: string; // Custom query for Google Maps
  mapUrl?: string; // Direct URL for navigation
  businessHours?: string; // e.g. "10:00 - 20:00"
  category: CategoryType;
  categoryColor?: HighlightColor; // User selected color
  description?: string; // Subtext like "1F SUQQU..."
  coordinates?: { lat: number; lng: number };
  guideInfo?: GuideInfo;
  photos?: string[];
  isCompleted?: boolean;
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'train' | 'activity' | 'transfer';
  title: string;
  subTitle?: string;
  referenceNo: string;
  date: string; // YYYY-MM-DD
  time?: string;
  details: Record<string, string>; // label -> value
  fileUrl?: string;
  status: 'confirmed' | 'pending';
}
