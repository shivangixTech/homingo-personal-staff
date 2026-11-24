// HOMINGO AI - Central Data Store
// Personal Chief of Staff data for one small shop owner in Bhopal.
// This data matches the backend sample data exactly: same bills, same
// amounts, same dates, same refund and same licence renewal details.
// No personal name is used anywhere in this file.

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
} from '../types';

export const MOCK_USER: UserProfile = {
  id: 'usr_shop_owner',
  name: 'Shop Owner',
  email: 'shop-owner@bhopal.local',
  title: 'Small Shop Owner, Bhopal',
  company: 'My Shop, Bhopal',
  avatarUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234f46e5'/%3E%3Ctext x='50' y='66' font-size='44' font-family='sans-serif' font-weight='700' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E",
  timezone: 'Asia/Kolkata',
  executiveTone: 'concise',
  vipContacts: ['Supplier', 'Accountant', 'Online store'],
};

// Shop licence renewal (the one government service in scope).
// Documents present: Aadhaar. Documents missing: address proof.
export const GOVERNMENT_FORM = {
  service: 'Shop licence renewal',
  documentsPresent: ['Aadhaar'],
  documentsMissing: ['Address proof'],
  status: 'waiting for documents',
  nextStep: 'Submit address proof, then the renewal form can be filed.',
};

export const MOCK_DASHBOARD: DashboardSummary = {
  greeting: {
    salutation: 'Good evening',
    name: 'Shop Owner',
    title: 'Personal Chief of Staff',
    dateFormatted: 'Tuesday, Nov 24',
    briefSummary:
      'Homingo is watching 3 shop bills, 1 refund pending for 7 days (Rs 1,999, order 8891), 4 important mails, and 3 shop events. The shop licence renewal is waiting for address proof.',
  },
  metrics: {
    emailsTriaged: 5,
    meetingsOptimized: 3,
    refundsClaimed: 1999,
    pendingApprovalsCount: 0,
    aiTimeSavedHours: 2.5,
  },
  urgentAlerts: [
    {
      id: 'alert_bill_due',
      level: 'warning',
      title: 'Electricity Bill Due Soon (Rs 1,240)',
      description:
        'Electricity bill of Rs 1,240 is due on 28 Nov. Payment needs your approval first. Nothing is paid without it.',
      actionLabel: 'Review Bills',
      actionUrl: '/bills',
      timestamp: '2026-11-24T14:30:00+05:30',
    },
    {
      id: 'alert_refund_stalled',
      level: 'info',
      title: 'Refund Pending for 7 Days (Rs 1,999)',
      description:
        'Refund of Rs 1,999 for order 8891 has been pending for 7 days. Homingo has a follow-up message ready for the online store.',
      actionLabel: 'Track Refund',
      actionUrl: '/bills',
      timestamp: '2026-11-24T11:00:00+05:30',
    },
    {
      id: 'alert_supplier_meeting',
      level: 'info',
      title: 'Meeting with Supplier, 25 Nov at 11:00 AM',
      description:
        'Discuss the monthly stock order. Delivery at the shop follows the same day at 4:00 PM.',
      actionLabel: 'View Schedule',
      actionUrl: '/calendar',
      timestamp: '2026-11-24T09:00:00+05:30',
    },
  ],
};

export const MOCK_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'sug_meetings',
    title: 'What are my meetings today',
    prompt: 'aaj ki meeting batao',
    category: 'calendar',
  },
  {
    id: 'sug_bill',
    title: 'How much is the electricity bill',
    prompt: 'bijli ka bill kitna hai',
    category: 'finance',
  },
  {
    id: 'sug_emails',
    title: 'Show my important mails',
    prompt: 'mail batao',
    category: 'email',
  },
  {
    id: 'sug_licence',
    title: 'What do I need for licence renewal',
    prompt: 'licence renewal ke liye kya chahiye',
    category: 'briefing',
  },
];

export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    id: 'th_daily_brief',
    title: 'Today at the Shop',
    lastMessageSnippet: '3 shop events, 3 bills due, 1 refund pending for 7 days.',
    updatedAt: '2026-11-24T14:15:00+05:30',
  },
  {
    id: 'th_refund_8891',
    title: 'Refund for Order 8891 (Rs 1,999)',
    lastMessageSnippet: 'Refund pending for 7 days. Follow-up message drafted.',
    updatedAt: '2026-11-23T16:30:00+05:30',
  },
  {
    id: 'th_licence',
    title: 'Shop Licence Renewal',
    lastMessageSnippet: 'Aadhaar is on file. Address proof is still missing.',
    updatedAt: '2026-11-22T10:00:00+05:30',
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    role: 'system',
    content:
      'Homingo Personal Chief of Staff is ready. It reads shop mail, manages the calendar, tracks bills and refunds, and helps with the shop licence renewal. It never pays a bill or sends a mail without your approval.',
    createdAt: '2026-11-24T08:00:00+05:30',
  },
  {
    id: 'msg_02',
    role: 'user',
    content: 'What do I need to take care of today at the shop?',
    createdAt: '2026-11-24T08:15:00+05:30',
  },
  {
    id: 'msg_03',
    role: 'assistant',
    content: `Here is your shop briefing for today:

1. **Electricity Bill Due 28 Nov (Rs 1,240)**
   - Supplier bill of Rs 8,500 is due 30 Nov and internet bill of Rs 799 is due 5 Dec.
   - I will not pay anything until you approve it.

2. **Refund Pending for 7 Days (Rs 1,999)**
   - Refund for order 8891 is still pending. I have drafted a follow-up message for the online store.

3. **Important Mails (4)**
   - Supplier invoice, refund update for order 8891, electricity bill reminder, and shop licence renewal reminder.

4. **Today at the Shop**
   - Meeting with supplier on 25 Nov at 11:00 AM, delivery at the shop at 4:00 PM, and a call with the accountant on 26 Nov at 10:00 AM.

5. **Shop Licence Renewal**
   - Aadhaar is already on file. Address proof is still missing.`,
    createdAt: '2026-11-24T08:16:30+05:30',
    toolsExecuted: [
      {
        toolName: 'email_agent.read_mail',
        status: 'completed',
        input: { importantOnly: true },
        output: { importantFound: 4, total: 5 },
        durationMs: 145,
      },
      {
        toolName: 'finance_agent.check_bills',
        status: 'completed',
        input: { dueWithinDays: 10 },
        output: { count: 3, totalDue: 10539 },
        durationMs: 190,
      },
      {
        toolName: 'finance_agent.track_refund',
        status: 'completed',
        input: { orderId: '8891' },
        output: { amount: 1999, daysPending: 7 },
        durationMs: 110,
      },
    ],
  },
];

export const MOCK_EMAILS: EmailItem[] = [
  {
    id: 'mail-1',
    senderName: 'Supplier',
    senderEmail: 'supplier@shop.local',
    subject: 'Supplier invoice for this month',
    snippet: 'The supplier sent the monthly invoice. Amount Rs 8,500, due 30 Nov.',
    receivedAt: '2026-11-24T10:15:00+05:30',
    category: 'financial',
    priority: 'high',
    aiSummary: 'Monthly supplier invoice of Rs 8,500, due 30 Nov.',
    suggestedReply:
      'Thank you for the invoice. I have noted Rs 8,500 due on 30 Nov and will confirm the payment after checking the stock.',
    replyStatus: 'drafted',
    isRead: false,
  },
  {
    id: 'mail-2',
    senderName: 'Online store',
    senderEmail: 'support@store.local',
    subject: 'Refund update for order 8891',
    snippet: 'The refund of Rs 1,999 is still being processed. It has been pending for 7 days.',
    receivedAt: '2026-11-23T14:10:00+05:30',
    category: 'financial',
    priority: 'medium',
    aiSummary: 'Refund of Rs 1,999 for order 8891 is still pending after 7 days.',
    suggestedReply:
      'Hello, I am following up on the refund of Rs 1,999 for order 8891. It has been 7 days. Please confirm when it will be credited.',
    replyStatus: 'drafted',
    isRead: false,
  },
  {
    id: 'mail-3',
    senderName: 'Bank',
    senderEmail: 'alerts@bank.local',
    subject: 'Electricity bill reminder',
    snippet: 'The electricity bill of Rs 1,240 is due on 28 Nov.',
    receivedAt: '2026-11-23T09:30:00+05:30',
    category: 'financial',
    priority: 'high',
    aiSummary: 'Electricity bill of Rs 1,240 is due on 28 Nov.',
    replyStatus: 'none',
    isRead: true,
  },
  {
    id: 'mail-4',
    senderName: 'Customer',
    senderEmail: 'customer@shop.local',
    subject: 'Question about shop timings',
    snippet: 'A customer asked about the shop opening time.',
    receivedAt: '2026-11-24T06:00:00+05:30',
    category: 'team',
    priority: 'low',
    aiSummary: 'A customer asked about the shop opening time.',
    suggestedReply:
      'Hello, thank you for asking. The shop opens at 10:00 AM every day. Please visit us anytime after that.',
    replyStatus: 'drafted',
    isRead: true,
  },
  {
    id: 'mail-5',
    senderName: 'Local office',
    senderEmail: 'office@bhopal.local',
    subject: 'Shop licence renewal reminder',
    snippet: 'The shop licence renewal needs address proof. Aadhaar is already on file.',
    receivedAt: '2026-11-24T08:30:00+05:30',
    category: 'urgent',
    priority: 'high',
    aiSummary: 'Shop licence renewal is waiting for address proof. Aadhaar is already on file.',
    replyStatus: 'none',
    isRead: false,
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Meeting with supplier',
    startTime: '2026-11-25T11:00:00+05:30',
    endTime: '2026-11-25T11:30:00+05:30',
    timeFormatted: '11:00 AM - 11:30 AM',
    location: 'At the shop',
    attendees: [{ name: 'Supplier', email: 'supplier@shop.local' }],
    category: 'meeting',
    conflict: false,
    prepNotes: 'Discuss the monthly stock order.',
  },
  {
    id: 'event-2',
    title: 'Delivery at the shop',
    startTime: '2026-11-25T16:00:00+05:30',
    endTime: '2026-11-25T16:30:00+05:30',
    timeFormatted: '4:00 PM - 4:30 PM',
    location: 'At the shop',
    attendees: [{ name: 'Shop Owner', email: 'shop-owner@bhopal.local' }],
    category: 'personal',
    conflict: false,
    prepNotes: 'Check the goods against the delivery note.',
  },
  {
    id: 'event-3',
    title: 'Call with accountant',
    startTime: '2026-11-26T10:00:00+05:30',
    endTime: '2026-11-26T10:30:00+05:30',
    timeFormatted: '10:00 AM - 10:30 AM',
    location: 'Phone call',
    attendees: [{ name: 'Accountant', email: 'accountant@shop.local' }],
    category: 'meeting',
    conflict: false,
    prepNotes: "Review this month's bills.",
  },
];

export const MOCK_BILLS: BillItem[] = [
  {
    id: 'bill-1',
    merchant: 'Electricity bill',
    serviceCategory: 'Shop Utilities',
    amount: 1240,
    currency: 'INR',
    dueDate: '2026-11-28',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: false,
  },
  {
    id: 'bill-2',
    merchant: 'Supplier bill',
    serviceCategory: 'Shop Stock',
    amount: 8500,
    currency: 'INR',
    dueDate: '2026-11-30',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: false,
  },
  {
    id: 'bill-3',
    merchant: 'Internet bill',
    serviceCategory: 'Shop Internet',
    amount: 799,
    currency: 'INR',
    dueDate: '2026-12-05',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: false,
  },
];

export const MOCK_REFUNDS: RefundItem[] = [
  {
    id: 'refund-1',
    merchant: 'Online store',
    trackingId: '8891',
    claimAmount: 1999,
    currency: 'INR',
    dateInitiated: '2026-11-17',
    expectedDate: '2026-11-26',
    status: 'under_review',
    negotiationStep:
      'Refund of Rs 1,999 for order 8891 has been pending for 7 days. Homingo drafted a follow-up message for the online store.',
  },
];

// Approvals start empty on purpose. The backend creates a real approval
// only when the user asks for a risky action in chat, for example
// "bill pay kar do". Those approvals appear here through the API service.
export const MOCK_APPROVALS: ApprovalItem[] = [];

export const MOCK_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act_read_mail',
    title: 'Read 5 Shop Mails, Flagged 4 Important Ones',
    description:
      'Supplier invoice, refund update for order 8891, electricity bill reminder, and licence renewal reminder flagged as important.',
    category: 'email',
    actor: 'Autonomous Agent',
    toolUsed: 'email_agent.read_mail',
    status: 'completed',
    timestamp: '2026-11-24T13:45:00+05:30',
    durationFormatted: '1.2s',
  },
  {
    id: 'act_check_bills',
    title: 'Checked 3 Shop Bills Due This Month',
    description:
      'Electricity Rs 1,240 due 28 Nov, supplier Rs 8,500 due 30 Nov, internet Rs 799 due 5 Dec. No payment made without approval.',
    category: 'financial',
    actor: 'Autonomous Agent',
    toolUsed: 'finance_agent.check_bills',
    status: 'completed',
    timestamp: '2026-11-24T11:20:00+05:30',
    durationFormatted: '0.8s',
  },
  {
    id: 'act_track_refund',
    title: 'Checked Refund for Order 8891',
    description:
      'Refund of Rs 1,999 has been pending for 7 days. Follow-up message drafted for the online store.',
    category: 'financial',
    actor: 'Autonomous Agent',
    toolUsed: 'finance_agent.track_refund',
    status: 'completed',
    timestamp: '2026-11-23T18:00:00+05:30',
    durationFormatted: '1.4s',
  },
  {
    id: 'act_licence_check',
    title: 'Checked Shop Licence Renewal Documents',
    description:
      'Aadhaar is already on file. Address proof is still missing. Renewal cannot be filed until it is submitted.',
    category: 'assistant',
    actor: 'Autonomous Agent',
    toolUsed: 'task_agent.licence_checklist',
    status: 'completed',
    timestamp: '2026-11-23T12:10:00+05:30',
    durationFormatted: '0.6s',
  },
];

export const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc_google',
    name: 'Google (Shop Mail and Calendar)',
    provider: 'google',
    icon: 'Mail',
    connected: true,
    lastSyncedAt: '2026-11-24T16:00:00+05:30',
    scopes: ['gmail.readonly', 'calendar.events'],
  },
  {
    id: 'acc_payments',
    name: 'Shop Payments (Sample Data Only)',
    provider: 'stripe',
    icon: 'CreditCard',
    connected: false,
    scopes: ['transactions.read'],
  },
];

export const MOCK_PERMISSIONS: AutonomousPermissions = {
  autoApproveExpensesUnder: 0,
  requireApprovalForExternalEmails: true,
  allowAutoRescheduleMeetings: false,
  allowRefundDisputeAutonomousClaims: false,
  dailyExecutiveBriefingTime: '08:00 AM',
  dataSharingForAiFineTuning: false,
};
