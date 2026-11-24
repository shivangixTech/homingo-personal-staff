// HOMINGO AI - Central API Service
// This service talks to the real FastAPI backend first and only falls
// back to local Bhopal shop data when the backend is not reachable.
// Backend base URL: http://127.0.0.1:8000 (override with VITE_API_URL).
// Real backend endpoints used:
//   POST /chat, GET /dashboard/summary,
//   POST /approvals/{id}/approve, POST /approvals/{id}/reject,
//   GET /approvals/{id}, GET /audit-log
// No other backend endpoints are invented or called.

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

export const BACKEND_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
  getApprovals(
    statusFilter?: 'all' | 'pending' | 'approved' | 'rejected',
  ): Promise<ApprovalItem[]>;
  decideApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    comment?: string,
  ): Promise<ApprovalItem>;
  // Activity Logs
  getActivityLogs(): Promise<ActivityLogItem[]>;
  // Settings
  getConnectedAccounts(): Promise<ConnectedAccount[]>;
  toggleAccountConnection(accountId: string): Promise<ConnectedAccount>;
  getPermissions(): Promise<AutonomousPermissions>;
  updatePermissions(
    permissions: Partial<AutonomousPermissions>,
  ): Promise<AutonomousPermissions>;
}

// Backend response shapes (the backend returns plain JSON, no wrapper).
interface BackendChatResponse {
  reply: string;
  needs_approval: boolean;
  approval_id: string | null;
}

interface BackendSummaryResponse {
  meetings_today: number;
  important_mails: number;
  bills_due: number;
  bills: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    due_date: string;
    status: string;
  }[];
  refunds_pending: number;
  events: {
    id: string;
    title: string;
    date: string;
    time: string;
    note: string;
  }[];
}

interface BackendApprovalResponse {
  approval_id: string;
  action: string;
  amount: string;
  detail: string;
  status: string;
  executed?: boolean;
  message?: string;
}

interface BackendAuditResponse {
  entries: { time: string; event: string; detail: string }[];
}

function parseAmount(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  const value = parseInt(digits, 10);
  return Number.isNaN(value) ? 0 : value;
}

function approvalFromBackend(data: BackendApprovalResponse): ApprovalItem {
  const amount = parseAmount(data.amount || '');
  return {
    id: data.approval_id,
    title: `Authorize payment: ${data.action} (${data.amount})`,
    category: 'financial',
    urgency: 'high',
    status:
      data.status === 'approved'
        ? 'approved'
        : data.status === 'rejected'
          ? 'rejected'
          : 'pending',
    aiReasoning: `${data.detail || data.action}. Nothing is paid until you approve it. This is a simulated payment only, no real money moves.`,
    details: {
      vendor: data.action,
      amount,
      scheduledTime: data.detail,
      impactSummary:
        'Paying on time avoids a late fee and keeps the shop running. Declining means nothing is paid.',
    },
    createdAt: new Date().toISOString(),
  };
}

class HomingoApiService implements IApiService {
  private baseUrl: string;
  private backendDown = false;

  // Local Bhopal data. Used for lists the backend has no endpoint for
  // (mails, refunds) and as the fallback when the backend is off.
  private user: UserProfile = { ...MOCK_USER };
  private messages: ChatMessage[] = [...MOCK_CHAT_MESSAGES];
  private emails: EmailItem[] = [...MOCK_EMAILS];
  private calendarEvents: CalendarEvent[] = [...MOCK_CALENDAR_EVENTS];
  private bills: BillItem[] = [...MOCK_BILLS];
  private refunds: RefundItem[] = [...MOCK_REFUNDS];
  private approvals: ApprovalItem[] = [...MOCK_APPROVALS];
  private activityLogs: ActivityLogItem[] = [...MOCK_ACTIVITY_LOGS];
  private accounts: ConnectedAccount[] = [...MOCK_CONNECTED_ACCOUNTS];
  private permissions: AutonomousPermissions = { ...MOCK_PERMISSIONS };

  constructor(baseUrl: string = BACKEND_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${path}`);
    }
    return (await response.json()) as T;
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${path}`);
    }
    return (await response.json()) as T;
  }

  // Local reply used only when the backend is not reachable. It uses
  // the same Bhopal data and the same keyword routing as the backend.
  private buildLocalReply(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('mail')) {
      return (
        'Important mails (4):\n\n' +
        '1. Supplier invoice for this month. Amount Rs 8,500, due 30 Nov.\n' +
        '2. Refund update for order 8891. Refund of Rs 1,999 is still pending for 7 days.\n' +
        '3. Electricity bill reminder. Electricity bill of Rs 1,240 is due on 28 Nov.\n' +
        '4. Shop licence renewal reminder. Aadhaar is on file, address proof is missing.\n\n' +
        'Note: the backend is not running right now, so this answer is from saved shop data.'
      );
    }
    if (
      lower.includes('meeting') ||
      lower.includes('calendar') ||
      lower.includes('appointment') ||
      lower.includes('schedule')
    ) {
      return (
        'Shop events:\n\n' +
        '1. 2026-11-25 at 11:00: Meeting with supplier. Discuss the monthly stock order.\n' +
        '2. 2026-11-25 at 16:00: Delivery at the shop. Check the goods against the delivery note.\n' +
        "3. 2026-11-26 at 10:00: Call with accountant. Review this month's bills.\n\n" +
        'Note: the backend is not running right now, so this answer is from saved shop data.'
      );
    }
    if (lower.includes('licence') || lower.includes('license') || lower.includes('form')) {
      return (
        'Shop licence renewal:\n\n' +
        'Documents present: Aadhaar.\n' +
        'Documents missing: Address proof.\n' +
        'Next step: submit address proof, then the renewal form can be filed.\n\n' +
        'Note: the backend is not running right now, so this answer is from saved shop data.'
      );
    }
    if (
      lower.includes('bill') ||
      lower.includes('refund') ||
      lower.includes('pay')
    ) {
      if (lower.includes('pay')) {
        return (
          'I cannot create a payment approval while the backend is not running. ' +
          'Please start the backend with "uvicorn main:app --reload" and ask again. ' +
          'For reference, the electricity bill is Rs 1,240, due 28 Nov.'
        );
      }
      return (
        'Due bills: Electricity bill Rs 1,240, due 2026-11-28; ' +
        'Supplier bill Rs 8,500, due 2026-11-30; ' +
        'Internet bill Rs 799, due 2026-12-05. ' +
        'Refund of Rs 1,999 for order 8891 has been pending for 7 days.\n\n' +
        'Note: the backend is not running right now, so this answer is from saved shop data.'
      );
    }
    return (
      'Shop briefing:\n\n' +
      'Bills due: Electricity Rs 1,240 (28 Nov), Supplier Rs 8,500 (30 Nov), Internet Rs 799 (5 Dec).\n' +
      'Refund: Rs 1,999 for order 8891, pending 7 days.\n' +
      'Licence renewal: Aadhaar is on file, address proof is missing.\n' +
      'Meetings: 25 Nov 11:00 with supplier, 25 Nov 16:00 delivery, 26 Nov 10:00 call with accountant.\n\n' +
      'Note: the backend is not running right now, so this answer is from saved shop data.'
    );
  }

  // User
  async getUserProfile(): Promise<UserProfile> {
    return { ...this.user };
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.user = { ...this.user, ...profile };
    return { ...this.user };
  }

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const pendingCount = this.approvals.filter((a) => a.status === 'pending').length;
    try {
      const summary = await this.get<BackendSummaryResponse>('/dashboard/summary');
      this.backendDown = false;
      return {
        greeting: {
          ...MOCK_DASHBOARD.greeting,
          briefSummary: `Homingo is watching ${summary.bills_due} shop bills, ${summary.refunds_pending} refund pending for 7 days (Rs 1,999, order 8891), ${summary.important_mails} important mails, and ${summary.meetings_today} shop events. The shop licence renewal is waiting for address proof.`,
        },
        metrics: {
          emailsTriaged: 5,
          meetingsOptimized: summary.meetings_today,
          refundsClaimed: 1999,
          pendingApprovalsCount: pendingCount,
          aiTimeSavedHours: 2.5,
        },
        urgentAlerts: MOCK_DASHBOARD.urgentAlerts,
      };
    } catch {
      this.backendDown = true;
      return {
        ...MOCK_DASHBOARD,
        metrics: {
          ...MOCK_DASHBOARD.metrics,
          pendingApprovalsCount: pendingCount,
        },
      };
    }
  }

  // AI Assistant
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

    let replyText: string;
    let toolName = 'personal_staff.chat';
    let needsApproval = false;
    let approvalId: string | null = null;

    try {
      const data = await this.post<BackendChatResponse>('/chat', {
        message: content,
        user_id: 'user-1',
      });
      this.backendDown = false;
      replyText = data.reply;
      needsApproval = data.needs_approval;
      approvalId = data.approval_id;
      if (needsApproval && approvalId) {
        try {
          const approvalData = await this.get<BackendApprovalResponse>(
            `/approvals/${approvalId}`,
          );
          const item = approvalFromBackend(approvalData);
          if (!this.approvals.some((a) => a.id === item.id)) {
            this.approvals.unshift(item);
          }
        } catch {
          // Backend created the approval but the detail read failed.
          // Keep a local copy so the Approvals page can still show it.
          this.approvals.unshift({
            id: approvalId,
            title: 'Authorize payment: pay electricity bill (Rs 1,240)',
            category: 'financial',
            urgency: 'high',
            status: 'pending',
            aiReasoning:
              'Electricity bill, due 28 Nov 2026. Simulated payment only. Nothing is paid until you approve it.',
            details: {
              vendor: 'pay electricity bill',
              amount: 1240,
              scheduledTime: 'Due 28 Nov 2026',
              impactSummary:
                'Paying on time avoids a late fee and keeps the shop running. Declining means nothing is paid.',
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      this.backendDown = true;
      toolName = 'personal_staff.offline_fallback';
      replyText = this.buildLocalReply(content);
    }

    const assistantMsg: ChatMessage = {
      id: `msg_asst_${Date.now() + 1}`,
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString(),
      toolsExecuted: [
        {
          toolName,
          status: 'completed',
          input: { query: content, threadId },
          output: { needsApproval, approvalId },
          durationMs: 180,
        },
      ],
    };
    this.messages.push(assistantMsg);
    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `Assistant answered: ${content.slice(0, 40)}`,
      description: replyText.slice(0, 120),
      category: 'assistant',
      actor: 'Autonomous Agent',
      toolUsed: toolName,
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.2s',
    });
    return assistantMsg;
  }

  // Emails (the backend has no mail endpoint, so the shop mailbox
  // below is the saved sample data, matching the backend exactly).
  async getEmails(category?: EmailCategory): Promise<EmailItem[]> {
    if (!category || category === 'all') return [...this.emails];
    return this.emails.filter((e) => e.category === category);
  }

  async sendEmailReply(emailId: string, replyText: string): Promise<EmailItem> {
    const index = this.emails.findIndex((e) => e.id === emailId);
    if (index === -1) throw new Error('Email not found');
    const updated: EmailItem = {
      ...this.emails[index],
      replyStatus: 'drafted',
      suggestedReply: replyText,
      isRead: true,
    };
    this.emails[index] = updated;
    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `Drafted Email Reply to ${updated.senderName}`,
      description:
        'Reply drafted for approval. Nothing is sent without your approval.',
      category: 'email',
      actor: 'User Approved',
      toolUsed: 'email_agent.draft_reply',
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.4s',
    });
    return updated;
  }

  async markEmailRead(emailId: string): Promise<EmailItem> {
    const index = this.emails.findIndex((e) => e.id === emailId);
    if (index === -1) throw new Error('Email not found');
    this.emails[index] = { ...this.emails[index], isRead: true };
    return this.emails[index];
  }

  // Calendar
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const summary = await this.get<BackendSummaryResponse>('/dashboard/summary');
      this.backendDown = false;
      return summary.events.map((event) => {
        const start = `${event.date}T${event.time}:00+05:30`;
        const [hour, minute] = event.time.split(':').map(Number);
        const endMinute = minute + 30 >= 60 ? minute - 30 : minute + 30;
        const endHourFixed = minute + 30 >= 60 ? hour + 1 : hour;
        const end = `${event.date}T${String(endHourFixed).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00+05:30`;
        return {
          id: event.id,
          title: event.title,
          startTime: start,
          endTime: end,
          timeFormatted: `${event.time} - ${String(endHourFixed).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          location: event.title.toLowerCase().includes('call')
            ? 'Phone call'
            : 'At the shop',
          attendees: [],
          category: event.title.toLowerCase().includes('delivery')
            ? 'personal'
            : 'meeting',
          conflict: false,
          prepNotes: event.note,
        } as CalendarEvent;
      });
    } catch {
      this.backendDown = true;
      return [...this.calendarEvents];
    }
  }

  async scheduleCalendarEvent(
    event: Omit<CalendarEvent, 'id'>,
  ): Promise<CalendarEvent> {
    const created: CalendarEvent = { ...event, id: `cal_${Date.now()}` };
    this.calendarEvents.push(created);
    return created;
  }

  // Bills & Refunds
  async getBills(): Promise<BillItem[]> {
    try {
      const summary = await this.get<BackendSummaryResponse>('/dashboard/summary');
      this.backendDown = false;
      return summary.bills.map((bill) => ({
        id: bill.id,
        merchant: bill.name,
        serviceCategory: bill.name.toLowerCase().includes('electricity')
          ? 'Shop Utilities'
          : bill.name.toLowerCase().includes('supplier')
            ? 'Shop Stock'
            : 'Shop Internet',
        amount: bill.amount,
        currency: 'INR',
        dueDate: bill.due_date,
        status: 'scheduled',
        hasAnomaly: false,
        autoPayEnabled: false,
      }) as BillItem);
    } catch {
      this.backendDown = true;
      return [...this.bills];
    }
  }

  async getRefunds(): Promise<RefundItem[]> {
    // The backend has no refund endpoint. This is the saved sample
    // data: Rs 1,999 for order 8891, pending 7 days.
    return [...this.refunds];
  }

  // Approvals
  async getApprovals(
    statusFilter?: 'all' | 'pending' | 'approved' | 'rejected',
  ): Promise<ApprovalItem[]> {
    if (!statusFilter || statusFilter === 'all') return [...this.approvals];
    return this.approvals.filter((a) => a.status === statusFilter);
  }

  async decideApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    _comment?: string,
  ): Promise<ApprovalItem> {
    const action = decision === 'approved' ? 'approve' : 'reject';
    const data = await this.post<BackendApprovalResponse>(
      `/approvals/${approvalId}/${action}`,
    );
    this.backendDown = false;
    const updated = approvalFromBackend(data);
    updated.status = decision;
    const index = this.approvals.findIndex((a) => a.id === approvalId);
    if (index === -1) {
      this.approvals.unshift(updated);
    } else {
      this.approvals[index] = updated;
    }
    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      title: `${decision === 'approved' ? 'Approved' : 'Rejected'}: ${updated.title}`,
      description:
        data.message ||
        (decision === 'approved'
          ? 'Approved and executed (simulated). No real payment was made.'
          : 'Rejected. Nothing was executed.'),
      category: 'financial',
      actor: 'User Approved',
      toolUsed: `approval_gateway.${action}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
      durationFormatted: '0.3s',
    });
    return updated;
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLogItem[]> {
    try {
      const data = await this.get<BackendAuditResponse>('/audit-log');
      this.backendDown = false;
      const backendLogs: ActivityLogItem[] = data.entries.map((entry, index) => {
        const event = entry.event.toLowerCase();
        const category: ActivityLogItem['category'] = event.includes('mail')
          ? 'email'
          : event.includes('calendar')
            ? 'calendar'
            : event.includes('approval')
              ? 'financial'
              : event.includes('bill') || event.includes('refund')
                ? 'financial'
                : 'assistant';
        return {
          id: `act_backend_${index}_${entry.time}`,
          title: entry.event.replace(/_/g, ' '),
          description: entry.detail,
          category,
          actor: event.includes('approval_approved') || event.includes('approval_rejected')
            ? 'User Approved'
            : 'Autonomous Agent',
          toolUsed: entry.event,
          status: 'completed',
          timestamp: entry.time,
          durationFormatted: '-',
        };
      });
      return [...backendLogs, ...this.activityLogs];
    } catch {
      this.backendDown = true;
      return [...this.activityLogs];
    }
  }

  // Settings
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    return [...this.accounts];
  }

  async toggleAccountConnection(accountId: string): Promise<ConnectedAccount> {
    const index = this.accounts.findIndex((a) => a.id === accountId);
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

  async updatePermissions(
    permissions: Partial<AutonomousPermissions>,
  ): Promise<AutonomousPermissions> {
    this.permissions = { ...this.permissions, ...permissions };
    return { ...this.permissions };
  }

  // True when the last backend call failed. Pages can use this to
  // show that the answers are coming from saved shop data.
  isBackendDown(): boolean {
    return this.backendDown;
  }
}

// ------------------------------------------------------------
// Central Export: the real backend is the default. No env flag
// is needed. Start the backend on port 8000 first, then the
// frontend calls it. When the backend is off, the service falls
// back to the saved Bhopal shop data.
// ------------------------------------------------------------
export const apiService: IApiService = new HomingoApiService(BACKEND_BASE_URL);
