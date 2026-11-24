// HOMINGO AI — Central API Service
// Read from backend API contracts defined in docs/API_CONTRACT.md
// Designed with replaceable adapter architecture (Mock Adapter <-> HTTP REST Adapter)

import type {
  UserProfile,
  DashboardSummary,
  ChatMessage,
  ChatThread,
  SuggestedPrompt,
  EmailItem,
  CalendarEvent,
  BillItem,
  RefundItem,
  ApprovalItem,
  ActivityLogItem,
  ConnectedAccount,
  AutonomousPermissions,
  EmailCategory,
} from '../types';

import {
  MOCK_USER,
  MOCK_DASHBOARD,
  MOCK_CHAT_MESSAGES,
  MOCK_CHAT_THREADS,
  MOCK_SUGGESTED_PROMPTS,
  MOCK_EMAILS,
  MOCK_CALENDAR_EVENTS,
  MOCK_BILLS,
  MOCK_REFUNDS,
  MOCK_APPROVALS,
  MOCK_ACTIVITY_LOGS,
  MOCK_CONNECTED_ACCOUNTS,
  MOCK_PERMISSIONS,
} from '../data/mockData';

export interface IApiService {
  // User
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile>;

  // Dashboard
  getDashboardSummary(): Promise<DashboardSummary>;

  // AI Assistant
  getChatThreads(): Promise<ChatThread[]>;
  getChatMessages(threadId?: string): Promise<ChatMessage[]>;
  getSuggestedPrompts(): Promise<SuggestedPrompt[]>;
  sendMessage(threadId: string, content: string): Promise<ChatMessage>;

  // Emails
  getEmails(category?: EmailCategory): Promise<EmailItem[]>;
  sendEmailReply(emailId: string, replyText: string): Promise<EmailItem>;
  markEmailRead(emailId: string): Promise<EmailItem>;

  // Calendar
  getCalendarEvents(): Promise<CalendarEvent[]>;
  scheduleCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;

  // Bills & Refunds
  getBills(): Promise<BillItem[]>;
  getRefunds(): Promise<RefundItem[]>;

  // Approvals
  getApprovals(statusFilter?: 'all' | 'pending' | 'approved' | 'rejected'): Promise<ApprovalItem[]>;
  decideApproval(approvalId: string, decision: 'approved' | 'rejected', comment?: string): Promise<ApprovalItem>;

  // Activity Logs
  getActivityLogs(): Promise<ActivityLogItem[]>;

  // Settings
  getConnectedAccounts(): Promise<ConnectedAccount[]>;
  toggleAccountConnection(accountId: string): Promise<ConnectedAccount>;
  getPermissions(): Promise<AutonomousPermissions>;
  updatePermissions(permissions: Partial<AutonomousPermissions>): Promise<AutonomousPermissions>;
}

// -------------------------------------------------------------
// Mock Implementation (First Milestone & Fallback)
// -------------------------------------------------------------
class MockApiService implements IApiService {
  private user: UserProfile = { ...MOCK_USER };
  private dashboard: DashboardSummary = { ...MOCK_DASHBOARD };
  private messages: ChatMessage[] = [...MOCK_CHAT_MESSAGES];
  private emails: EmailItem[] = [...MOCK_EMAILS];
  private calendarEvents: CalendarEvent[] = [...MOCK_CALENDAR_EVENTS];
  private bills: BillItem[] = [...MOCK_BILLS];
  private refunds: RefundItem[] = [...MOCK_REFUNDS];
  private approvals: ApprovalItem[] = [...MOCK_APPROVALS];
  private activityLogs: ActivityLogItem[] = [...MOCK_ACTIVITY_LOGS];
  private accounts: ConnectedAccount[] = [...MOCK_CONNECTED_ACCOUNTS];
  private permissions: AutonomousPermissions = { ...MOCK_PERMISSIONS };

  async getUserProfile(): Promise<UserProfile> {
    return { ...this.user };
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.user = { ...this.user, ...profile };
    return { ...this.user };
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const pendingCount = this.approvals.filter(a => a.status === 'pending').length;
    return {
      ...this.dashboard,
      metrics: {
        ...this.dashboard.metrics,
        pendingApprovalsCount: pendingCount,
      },
    };
  }

  async getChatThreads(): Promise<ChatThread[]> {
    return [...MOCK_CHAT_THREADS];
  }

  async getChatMessages(_threadId?: string): Promise<ChatMessage[]> {
    return [...this.messages];
  }

  async getSuggestedPrompts(): Promise<SuggestedPrompt[]> {
    return [...MOCK_SUGGESTED_PROMPTS];
  }

  async sendMessage(threadId: string, content: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(userMsg);

    const lower = content.toLowerCase();
    let responseText = '';
    let toolName = 'homingo.personal_reasoner';
    let toolOutput: Record<string, any> = { status: 'completed' };

    if (lower.includes('email') || lower.includes('inbox')) {
      toolName = 'inbox_guardian.triage_personal';
      toolOutput = { emailsScanned: 18, importantFound: 2, actionRequired: 1 };
      responseText = `I reviewed your inbox. You have **2 important messages** requiring attention today:\n\n1. **Dr. Julian Aris (Clinic)**: Your annual wellness bloodwork is normal. The clinic is asking whether you prefer a quick 15-min telemedicine call or in-person review.\n2. **ConEdison**: Monthly electric statement ($135.20) is due tomorrow.\n\nI have already drafted a friendly reply for Dr. Aris in your **Email Management** tab. Would you like me to send it?`;
    } else if (lower.includes('refund')) {
      toolName = 'refund_negotiator.status_check';
      toolOutput = { activeClaims: 2, totalPending: 288.20, stalledCount: 1 };
      responseText = `Here is your current refund status:\n\n• **Delta Air Lines ($240.00)**: Stalled for 7 days with no carrier reply. I have formulated an escalation message under DOT passenger protection guidelines.\n• **Target Store Return ($48.20)**: Approved; currently settling into your bank account.\n\nYou can review the Delta escalation in **Bills & Refunds**.`;
    } else if (lower.includes('bill') || lower.includes('payment')) {
      toolName = 'financial_radar.audit_upcoming_bills';
      toolOutput = { billsMonitored: 4, dueTomorrow: 1, nextWeek: 2 };
      responseText = `Here are your upcoming household bills:\n\n1. **ConEdison Electricity & Gas — $135.20**\n   - **Due Tomorrow (Nov 25)**\n   - Auto-pay is off on this account. I have queued a 1-click authorization in your **Approvals** tab.\n\n2. **Verizon Fios Fiber — $79.99**\n   - Due Nov 29 (Auto-pay ON)\n\nNo unexpected rate hikes were detected this billing cycle.`;
    } else if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('tomorrow')) {
      toolName = 'calendar_optimizer.protect_travel_buffer';
      toolOutput = { scheduleChecked: true, buffersReserved: '20 mins' };
      responseText = `I have organized your upcoming schedule with protected travel and deep-work buffers:\n\n• **Today at 4:00 PM**: Annual dental check-up at Metro Dental (Suite 300). I protected a 25-minute transit buffer starting at 3:35 PM.\n• **Tomorrow Morning**: Clear morning focus window (9:00 AM – 11:30 AM), followed by a 2:00 PM contractor call for your kitchen remodel.\n\nAll conflict risks are currently zero.`;
    } else {
      responseText = `I have logged and analyzed your request: "${content}".\n\nI checked your schedule, active reminders, and household queues. Everything is in order and relevant actions have been logged in your **Personal Command Centre**. Let me know if you would like me to draft a message, adjust a reminder, or authorize a payment.`;
    }

    const assistantMsg: ChatMessage = {
      id: `msg_asst_${Date.now() + 1}`,
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString(),
      toolsExecuted: [
        {
          toolName,
          status: 'completed',
          input: { query: content, threadId },
          output: toolOutput,
          durationMs: 160,
        },
      ],
    };

    this.messages.push(assistantMsg);

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `Personal Assistant: ${content.slice(0, 32)}...`,
      description: `Executed query and synthesized response for Jordan.`,
      category: 'assistant',
      actor: 'Executive Command',
      toolUsed: toolName,
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.2s',
    });

    return assistantMsg;
  }

  async getEmails(category?: EmailCategory): Promise<EmailItem[]> {
    if (!category || category === 'all') return [...this.emails];
    return this.emails.filter(e => e.category === category);
  }

  async sendEmailReply(emailId: string, replyText: string): Promise<EmailItem> {
    const emailIndex = this.emails.findIndex(e => e.id === emailId);
    if (emailIndex === -1) throw new Error('Email not found');
    const updated: EmailItem = {
      ...this.emails[emailIndex],
      replyStatus: 'sent',
      suggestedReply: replyText,
      isRead: true,
    };
    this.emails[emailIndex] = updated;

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `Dispatched Email Reply to ${updated.senderName}`,
      description: `Reply confirmed and queued via Google Workspace API.`,
      category: 'email',
      actor: 'User Approved',
      toolUsed: 'gmail.send_message',
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.4s',
    });

    return updated;
  }

  async markEmailRead(emailId: string): Promise<EmailItem> {
    const emailIndex = this.emails.findIndex(e => e.id === emailId);
    if (emailIndex === -1) throw new Error('Email not found');
    this.emails[emailIndex] = { ...this.emails[emailIndex], isRead: true };
    return this.emails[emailIndex];
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return [...this.calendarEvents];
  }

  async scheduleCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal_${Date.now()}`,
    };
    this.calendarEvents.push(newEvent);

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `Scheduled Calendar Event: ${newEvent.title}`,
      description: `Synchronized with Google Calendar and verified non-conflict slots.`,
      category: 'calendar',
      actor: 'Autonomous Agent',
      toolUsed: 'calendar.insert_event',
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.6s',
    });

    return newEvent;
  }

  async getBills(): Promise<BillItem[]> {
    return [...this.bills];
  }

  async getRefunds(): Promise<RefundItem[]> {
    return [...this.refunds];
  }

  async getApprovals(statusFilter?: 'all' | 'pending' | 'approved' | 'rejected'): Promise<ApprovalItem[]> {
    if (!statusFilter || statusFilter === 'all') return [...this.approvals];
    return this.approvals.filter(a => a.status === statusFilter);
  }

  async decideApproval(approvalId: string, decision: 'approved' | 'rejected', comment?: string): Promise<ApprovalItem> {
    const index = this.approvals.findIndex(a => a.id === approvalId);
    if (index === -1) throw new Error('Approval item not found');
    const updated: ApprovalItem = {
      ...this.approvals[index],
      status: decision,
    };
    this.approvals[index] = updated;

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `${decision === 'approved' ? 'Approved' : 'Rejected'}: ${updated.title}`,
      description: comment ? `Executive note: "${comment}"` : `Decision committed by executive.`,
      category: updated.category,
      actor: 'User Approved',
      toolUsed: 'approval_gateway.commit_decision',
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.3s',
    });

    return updated;
  }

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    return [...this.activityLogs];
  }

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return [...this.accounts];
  }

  async toggleAccountConnection(accountId: string): Promise<ConnectedAccount> {
    const index = this.accounts.findIndex(a => a.id === accountId);
    if (index === -1) throw new Error('Account not found');
    const current = this.accounts[index];
    const updated: ConnectedAccount = {
      ...current,
      connected: !current.connected,
      lastSyncedAt: !current.connected ? new Date().toISOString() : undefined,
    };
    this.accounts[index] = updated;
    return updated;
  }

  async getPermissions(): Promise<AutonomousPermissions> {
    return { ...this.permissions };
  }

  async updatePermissions(perms: Partial<AutonomousPermissions>): Promise<AutonomousPermissions> {
    this.permissions = { ...this.permissions, ...perms };
    return { ...this.permissions };
  }
}

// -------------------------------------------------------------
// Real HTTP Service Implementation (Replaceable Adapter)
// Used when connecting to actual backend service
// -------------------------------------------------------------
class HttpApiService implements IApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // In production, token is retrieved from secure session storage or auth provider
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP error ${response.status}`);
    }

    const payload = await response.json();
    return payload.data;
  }

  getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/user/profile');
  }

  updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  getChatThreads(): Promise<ChatThread[]> {
    return this.request<ChatThread[]>('/assistant/threads');
  }

  getChatMessages(threadId?: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/assistant/threads/${threadId || 'default'}`);
  }

  getSuggestedPrompts(): Promise<SuggestedPrompt[]> {
    return this.request<SuggestedPrompt[]>('/assistant/suggested-prompts');
  }

  sendMessage(threadId: string, content: string): Promise<ChatMessage> {
    return this.request<ChatMessage>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ threadId, content }),
    });
  }

  getEmails(category?: EmailCategory): Promise<EmailItem[]> {
    const q = category && category !== 'all' ? `?category=${category}` : '';
    return this.request<EmailItem[]>(`/emails${q}`);
  }

  sendEmailReply(emailId: string, replyText: string): Promise<EmailItem> {
    return this.request<EmailItem>(`/emails/${emailId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply: replyText }),
    });
  }

  markEmailRead(emailId: string): Promise<EmailItem> {
    return this.request<EmailItem>(`/emails/${emailId}/read`, { method: 'POST' });
  }

  getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.request<CalendarEvent[]>('/calendar/events');
  }

  scheduleCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  getBills(): Promise<BillItem[]> {
    return this.request<BillItem[]>('/financials/bills');
  }

  getRefunds(): Promise<RefundItem[]> {
    return this.request<RefundItem[]>('/financials/refunds');
  }

  getApprovals(statusFilter?: 'all' | 'pending' | 'approved' | 'rejected'): Promise<ApprovalItem[]> {
    const q = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    return this.request<ApprovalItem[]>(`/approvals${q}`);
  }

  decideApproval(approvalId: string, decision: 'approved' | 'rejected', comment?: string): Promise<ApprovalItem> {
    return this.request<ApprovalItem>(`/approvals/${approvalId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
  }

  getActivityLogs(): Promise<ActivityLogItem[]> {
    return this.request<ActivityLogItem[]>('/activity/logs');
  }

  getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return this.request<ConnectedAccount[]>('/settings/integrations');
  }

  toggleAccountConnection(accountId: string): Promise<ConnectedAccount> {
    return this.request<ConnectedAccount>(`/settings/integrations/${accountId}/toggle`, {
      method: 'POST',
    });
  }

  getPermissions(): Promise<AutonomousPermissions> {
    return this.request<AutonomousPermissions>('/settings/permissions');
  }

  updatePermissions(permissions: Partial<AutonomousPermissions>): Promise<AutonomousPermissions> {
    return this.request<AutonomousPermissions>('/settings/permissions', {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  }
}

// -------------------------------------------------------------
// Service Factory / Central Export
// Easily switch between mock and real backend via env variable
// -------------------------------------------------------------
const USE_REAL_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiService: IApiService = USE_REAL_BACKEND
  ? new HttpApiService(API_BASE_URL)
  : new MockApiService();
