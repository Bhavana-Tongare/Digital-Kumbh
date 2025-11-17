
export type UserRole = 'user' | 'authority' | 'admin';

export type Language = 'english' | 'hindi' | 'marathi';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  preferredLanguage: Language;
  createdAt: Date;
}

export type LostPersonStatus = 'pending' | 'under_review' | 'found' | 'closed';
export type FoundPersonStatus = 'pending' | 'under_review' | 'matched' | 'closed';

export interface LostPersonReport {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  clothing: string;
  lastSeenLocation: string;
  lastSeenTime: Date;
  category?: 'child' | 'elderly' | 'disabled' | 'adult';
  status: LostPersonStatus;
  reporterId: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  authorityId?: string;
  authorityName?: string;
  authorityPhone?: string;
  authorityAssignedAt?: Date;
  foundBy?: string; // UID of the authority who marked this as found
  // User/Reporter information
  reporterName?: string;
  reporterPhone?: string;
}

export interface FoundPersonReport {
  id: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  clothing?: string;
  foundLocation: string;
  foundTime: Date;
  category?: 'child' | 'elderly' | 'disabled' | 'adult';
  status: FoundPersonStatus;
  foundById: string;
  matchedWithReportId?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  reportId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  readAt?: Date;
}

export interface Route {
  id: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  estimatedTime: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  isBlocked: boolean;
  waypoints: string[];
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'temple' | 'hospital' | 'police';
  location: string;
  distance: number;
  rating?: number;
  isOpen: boolean;
  contact?: string;
  photo?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  type: 'police' | 'ambulance' | 'fire' | 'disaster' | 'women' | 'child' | 'general';
}
