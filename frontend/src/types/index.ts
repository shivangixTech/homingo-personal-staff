// HOMINGO AI - Type Definitions
// Aligned with docs/API_CONTRACT.md

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'in_progress';

// 1. User & Auth
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  avatarUrl: string;
  timezone: string;
  executiveTone: 'concise' | 'formal' | 'detailed' | 'conversational';
  vipContacts: string[];
}

// 2. Dashboard
export interface DashboardMetrics {
  emailsTriaged: number;
  meetingsOptimized: number;
  refundsClaimed: number;
  pendingApprovalsCount: number;
  aiTimeSavedHours: number;
}

export interface UrgentAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  timestamp: string;
}

export interface DashboardSummary {
  greeting: {
    salutation: string;
    name: string;
    title: string;
    dateFormatted: string;
    briefSummary: string;
  };
  metrics: DashboardMetrics;
  urgentAlerts: UrgentAlert[];
}

// 3. AI Assistant
export interface ToolExecution {
  toolName: string;
  status: 'running' | 'completed' | 'failed';
  input?: Record<string, any>;
  output?: Record<string, any>;
  durationMs?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  toolsExecuted?: ToolExecution[];
  isThinking?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessageSnippet: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface SuggestedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'calendar' | 'email' | 'briefing' | 'finance';
}

// 4. Email Management
export type EmailCategory = 'all' | 'investor' | 'urgent' | 'financial' | 'team' | 'newsletter';
export type EmailPriority = 'high' | 'medium' | 'low';
export type EmailReplyStatus = 'none' | 'drafted' | 'approved' | 'sent';

export interface EmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  avatar?: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  category: EmailCategory;
  priority: EmailPriority;
  aiSummary: string;
  suggestedReply?: string;
  replyStatus: EmailReplyStatus;
  isRead: boolean;
}

// 5. Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  timeFormatted: string;
  location: string;
  meetUrl?: string;
  attendees: { name: string; email: string; avatar?: string }[];
  category: 'meeting' | 'focus' | 'travel' | 'personal';
  conflict: boolean;
  conflictDetails?: string;
  prepNotes?: string;
}

// 6. Bills & Refunds
export interface BillItem {
  id: string;
  merchant: string;
  serviceCategory: string;
  logo?: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'scheduled' | 'paid' | 'overdue' | 'disputed';
  hasAnomaly: boolean;
  anomalyNote?: string;
  autoPayEnabled: boolean;
}

export interface RefundItem {
  id: string;
  merchant: string;
  trackingId: string;
  claimAmount: number;
  currency: string;
  dateInitiated: string;
  expectedDate?: string;
  status: 'claim_filed' | 'under_review' | 'merchant_approved' | 'refunded';
  negotiationStep: string;
  supportThreadUrl?: string;
}

// 7. Approvals
export interface ApprovalItem {
  id: string;
  title: string;
  category: 'financial' | 'email' | 'calendar' | 'contract';
  urgency: UrgencyLevel;
  status: 'pending' | 'approved' | 'rejected';
  aiReasoning: string;
  details: {
    vendor?: string;
    amount?: number;
    recipient?: string;
    scheduledTime?: string;
    contractName?: string;
    impactSummary: string;
  };
  createdAt: string;
}

// 8. Activity History
export interface ActivityLogItem {
  id: string;
  title: string;
  description: string;
  category: 'email' | 'calendar' | 'financial' | 'assistant' | 'system' | 'contract';
  actor: 'Autonomous Agent' | 'User Approved' | 'Executive Command';
  toolUsed: string;
  status: 'completed' | 'failed' | 'in_progress';
  timestamp: string;
  durationFormatted: string;
  details?: Record<string, any>;
}

// 9. Settings
export interface ConnectedAccount {
  id: string;
  name: string;
  provider: 'google' | 'slack' | 'stripe' | 'github' | 'notion' | 'zoom';
  icon: string;
  connected: boolean;
  lastSyncedAt?: string;
  scopes: string[];
}

export interface AutonomousPermissions {
  autoApproveExpensesUnder: number;
  requireApprovalForExternalEmails: boolean;
  allowAutoRescheduleMeetings: boolean;
  allowRefundDisputeAutonomousClaims: boolean;
  dailyExecutiveBriefingTime: string;
  dataSharingForAiFineTuning: boolean;
}
