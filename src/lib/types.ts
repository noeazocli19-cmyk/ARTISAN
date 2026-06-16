// =============================================================================
// Artisan Connect — Shared TypeScript Interfaces
// =============================================================================

// ---------------------------------------------------------------------------
// User & Auth
// ---------------------------------------------------------------------------

export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: string;
  country?: string;
  bio?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Artisan Profile
// ---------------------------------------------------------------------------

export type ArtisanBadge = "bronze" | "silver" | "gold" | "platinum";

export interface ArtisanProfile {
  id: string;
  userId: string;
  specialties: string[];
  skills: string[];
  hourlyRate: number;
  experience: number; // years
  badge: ArtisanBadge;
  rating: number;
  reviewCount: number;
  missionCount: number;
  isAvailable: boolean;
  certifications: string[];
  user?: User;
}

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------

export type MissionStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MissionCategory =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "painting"
  | "masonry"
  | "welding"
  | "tailoring"
  | "catering"
  | "cleaning"
  | "other";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  status: MissionStatus;
  budget: number;
  location: string;
  clientId: string;
  artisanId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  rating: number;
  comment: string;
  authorId: string;
  artisanId: string;
  missionId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  artisanCount: number;
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  content: string;
  senderId: string;
  missionId: string;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Chat (Real-time messaging)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  roomId: string;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export interface PortfolioItem {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminStats {
  totalUsers: number;
  totalArtisans: number;
  totalMissions: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
  recentSignups: number;
  completionRate: number;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export type NotificationType =
  | "mission"
  | "message"
  | "review"
  | "system"
  | "payment";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchFilters {
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
}

// ---------------------------------------------------------------------------
// App View
// ---------------------------------------------------------------------------

export type AppView =
  | "landing"
  | "dashboard"
  | "search"
  | "artisan-detail"
  | "chat"
  | "map"
  | "admin"
  | "onboarding"
  | "portfolio"
  | "booking"
  | "payment"
  | "gamification"
  | "quotes"
  | "emergency"
  | "referral";

// ---------------------------------------------------------------------------
// Aggregated App State (for reference / serialisation)
// ---------------------------------------------------------------------------

export interface AppState {
  auth: AuthState;
  currentView: AppView;
  selectedArtisanId: string | null;
  searchQuery: string;
  searchResults: ArtisanProfile[];
  searchFilters: SearchFilters;
  notifications: Notification[];
}

// ---------------------------------------------------------------------------
// API Response helpers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Register payload
// ---------------------------------------------------------------------------

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  location?: string;
  country?: string;
}

// ---------------------------------------------------------------------------
// Booking / Calendar
// ---------------------------------------------------------------------------

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface TimeSlot {
  id: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  available: boolean;
}

export interface Booking {
  id: string;
  artisanId: string;
  artisanName: string;
  clientId: string;
  clientName: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  location: string;
  notes?: string;
  price: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Payment / Mobile Money
// ---------------------------------------------------------------------------

export type PaymentMethod = "orange_money" | "mtn_money" | "wave" | "moov_money" | "card" | "cash";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  missionId?: string;
  bookingId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  phoneNumber?: string;
  reference: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: Payment[];
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export type BadgeCategory = "achievement" | "social" | "skill" | "loyalty" | "special";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  totalXp: number;
}

export interface GamificationProfile {
  level: UserLevel;
  points: number;
  badges: Badge[];
  streak: number;
  streakMax: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// Quote Request
// ---------------------------------------------------------------------------

export type QuoteStatus = "pending" | "responded" | "accepted" | "rejected" | "expired";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  requestId: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanRating: number;
  artisanBadge: string;
  items: QuoteItem[];
  totalAmount: number;
  estimatedDuration: string;
  availability: string;
  message: string;
  status: QuoteStatus;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: { min: number; max: number };
  urgency: "low" | "medium" | "high";
  photos: string[];
  quotes: Quote[];
  status: "open" | "closed" | "awarded";
  createdAt: string;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Emergency Service
// ---------------------------------------------------------------------------

export type EmergencyType = "plumbing" | "electrical" | "locksmith" | "gas" | "flood" | "other";
export type EmergencyStatus = "dispatching" | "en_route" | "on_site" | "resolved" | "cancelled";

export interface EmergencyRequest {
  id: string;
  type: EmergencyType;
  description: string;
  location: string;
  clientName: string;
  clientPhone: string;
  status: EmergencyStatus;
  assignedArtisan?: {
    name: string;
    avatar: string;
    rating: number;
    eta: string;
    phone: string;
  };
  createdAt: string;
  resolvedAt?: string;
}

// ---------------------------------------------------------------------------
// Referral Program
// ---------------------------------------------------------------------------

export interface ReferralStats {
  code: string;
  totalInvites: number;
  successfulReferrals: number;
  creditsEarned: number;
  creditsUsed: number;
  creditsAvailable: number;
}

export interface ReferralInvite {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  status: "pending" | "registered" | "completed";
  creditsEarned: number;
  date: string;
}
