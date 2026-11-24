// HOMINGO AI — Central Mock Data Store
// Realistic everyday Personal Chief of Staff data (non-generic, personal responsibilities)

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
  id: 'usr_jordan',
  name: 'Jordan Rivera',
  email: 'jordan@personal.homingo.ai',
  title: 'Principal Designer & Homeowner',
  company: 'Rivera Studio',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  timezone: 'America/New_York (EST)',
  executiveTone: 'concise',
  vipContacts: ['dr.aris@metrohealth.org', 'support@delta.com', 'building.mgmt@skyline.com'],
};

export const MOCK_DASHBOARD: DashboardSummary = {
  greeting: {
    salutation: 'Good afternoon',
    name: 'Jordan',
    title: 'Personal Chief of Staff',
    dateFormatted: 'Tuesday, Nov 24',
    briefSummary:
      'Homingo is monitoring 4 everyday priorities: your ConEdison power bill due tomorrow ($135.20), an airline refund pending for 7 days ($240.00), Dr. Aris clinic email awaiting reply, and your dental appointment at 4:00 PM.',
  },
  metrics: {
    emailsTriaged: 18,
    meetingsOptimized: 3,
    refundsClaimed: 240.00,
    pendingApprovalsCount: 2,
    aiTimeSavedHours: 3.8,
  },
  urgentAlerts: [
    {
      id: 'alert_power_due',
      level: 'warning',
      title: 'Electricity Bill Due Tomorrow ($135.20)',
      description: 'ConEdison billing cycle closes Nov 25. Auto-pay is disabled on this utility account. 1-click authorization ready.',
      actionLabel: 'Authorize Payment',
      actionUrl: '/approvals',
      timestamp: '2026-11-24T14:30:00Z',
    },
    {
      id: 'alert_refund_stalled',
      level: 'info',
      title: 'Delta Refund Pending for 7 Days ($240.00)',
      description: 'EU261 claim for flight DL 189 delay has had no merchant reply for 7 days. Homingo prepared an automated escalation follow-up.',
      actionLabel: 'Track Dispute',
      actionUrl: '/bills',
      timestamp: '2026-11-24T11:00:00Z',
    },
    {
      id: 'alert_doctor_buffer',
      level: 'info',
      title: 'Dental Appointment Today at 4:00 PM',
      description: 'Annual check-up at Metro Dental Clinic. Homingo protected a 20-minute travel buffer starting at 3:35 PM to avoid transit delay.',
      actionLabel: 'View Schedule',
      actionUrl: '/calendar',
      timestamp: '2026-11-24T09:00:00Z',
    },
  ],
};

export const MOCK_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'sug_emails',
    title: 'Check my important emails',
    prompt: 'Check my important emails and tell me what requires my personal attention today.',
    category: 'email',
  },
  {
    id: 'sug_refunds',
    title: 'Find my pending refunds',
    prompt: 'Find my pending refunds and check if any merchant disputes are stalled.',
    category: 'finance',
  },
  {
    id: 'sug_schedule',
    title: 'Organise my schedule for tomorrow',
    prompt: 'Organise my schedule for tomorrow with realistic buffers between commitments.',
    category: 'calendar',
  },
  {
    id: 'sug_bills',
    title: 'Remind me about upcoming bills',
    prompt: 'Remind me about upcoming bills due this week and flag any unusual price spikes.',
    category: 'finance',
  },
];

export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    id: 'th_daily_brief',
    title: 'Today’s Responsibilities & Doctor Sync',
    lastMessageSnippet: 'Reserved 20-min travel buffer before your 4:00 PM dental appointment.',
    updatedAt: '2026-11-24T14:15:00Z',
  },
  {
    id: 'th_delta_dispute',
    title: 'Delta Airlines Flight Refund ($240.00)',
    lastMessageSnippet: 'Follow-up inquiry drafted under DOT consumer flight delay guidelines.',
    updatedAt: '2026-11-23T16:30:00Z',
  },
  {
    id: 'th_home_utility',
    title: 'ConEdison & Home Utilities Review',
    lastMessageSnippet: 'ConEdison bill $135.20 analyzed. Consistent with seasonal heating.',
    updatedAt: '2026-11-22T10:00:00Z',
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    role: 'system',
    content: 'Homingo Personal Chief of Staff initialized. Connected to Personal Gmail, Apple Calendar, Chase Banking & Utility Accounts.',
    createdAt: '2026-11-24T08:00:00Z',
  },
  {
    id: 'msg_02',
    role: 'user',
    content: 'Good morning Homingo. What are the key personal things I need to take care of today?',
    createdAt: '2026-11-24T08:15:00Z',
  },
  {
    id: 'msg_03',
    role: 'assistant',
    content: `Good morning Jordan! Here is your personal briefing for today:

1. **Electricity Bill Due Tomorrow ($135.20)**
   - Provider: ConEdison (Account #9910-21)
   - Status: Needs your 1-click authorization to schedule debit before tomorrow's 5 PM cutoff.

2. **Pending Refund Alert ($240.00)**
   - Your Delta flight delay claim has been pending 7 days with no carrier reply. I have drafted an automated escalation inquiry.

3. **Important Email Awaiting Reply**
   - Dr. Aris Clinic sent your routine bloodwork summary. The doctor asks to confirm your choice between a quick telemedicine follow-up or in-person review.

4. **Today's Schedule**
   - Metro Dental cleaning at 4:00 PM. I added a 20-minute travel window starting at 3:35 PM so you won't feel rushed.`,
    createdAt: '2026-11-24T08:16:30Z',
    toolsExecuted: [
      {
        toolName: 'inbox_guardian.triage_personal',
        status: 'completed',
        input: { unreadCount: 18, senderWhitelist: ['metrohealth.org', 'coned.com'] },
        output: { importantFound: 2, spamFiltered: 16 },
        durationMs: 145,
      },
      {
        toolName: 'financial_radar.audit_upcoming_bills',
        status: 'completed',
        input: { dueWithinDays: 3 },
        output: { count: 1, merchant: 'ConEdison', amount: 135.20 },
        durationMs: 190,
      },
      {
        toolName: 'calendar_optimizer.protect_travel_buffer',
        status: 'completed',
        input: { event: 'Metro Dental', bufferMinutes: 20 },
        output: { bufferApplied: true, noConflicts: true },
        durationMs: 110,
      },
    ],
  },
  {
    id: 'msg_04',
    role: 'user',
    content: 'Check my important emails and show me the draft for Dr. Aris.',
    createdAt: '2026-11-24T12:30:00Z',
  },
  {
    id: 'msg_05',
    role: 'assistant',
    content: `I have reviewed the email from Dr. Aris. All routine lab metrics are normal. Here is the response drafted in your natural, friendly tone:

> **To:** Dr. Julian Aris <dr.aris@metrohealth.org>  
> **Subject:** Re: Annual Wellness Lab Results — Follow-up  
>
> Hi Dr. Aris,  
>
> Thank you for sharing the lab results and glad to hear the panels look great.  
> A quick 15-minute telemedicine call works best for my schedule. I'm available Thursday afternoon between 2:00 PM and 4:00 PM if any slot is open.  
>
> Best,  
> Jordan Rivera

You can send this with 1 click in your **Email Management** or **Approvals** tab.`,
    createdAt: '2026-11-24T12:31:10Z',
    toolsExecuted: [
      {
        toolName: 'email_agent.draft_personal_response',
        status: 'completed',
        input: { threadId: 'em_clinic_01', tone: 'warm_concise' },
        output: { status: 'draft_ready', confidence: 0.98 },
        durationMs: 230,
      },
    ],
  },
];

export const MOCK_EMAILS: EmailItem[] = [
  {
    id: 'em_clinic_01',
    senderName: 'Dr. Julian Aris',
    senderEmail: 'dr.aris@metrohealth.org',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    subject: 'Annual Wellness Lab Results & Next Steps',
    snippet: 'Hi Jordan, good news: all panels from your bloodwork came back within healthy reference ranges. Would you like a quick 15-min call to review...',
    receivedAt: '2026-11-24T10:15:00Z',
    category: 'urgent',
    priority: 'high',
    aiSummary: 'Dr. Aris confirmed your routine bloodwork is normal and asks whether you prefer a quick telemedicine or in-person review this week.',
    suggestedReply: 'Hi Dr. Aris, glad to hear the labs look good. A 15-min telemedicine call works great for me—Thursday between 2:00 and 4:00 PM is ideal if that fits your clinic schedule.',
    replyStatus: 'drafted',
    isRead: false,
  },
  {
    id: 'em_landlord_02',
    senderName: 'Skyline Residences (Building Mgmt)',
    senderEmail: 'management@skylineapts.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    subject: 'Annual Lease Renewal Option & HVAC Maintenance Notice',
    snippet: 'Dear Resident, your lease renewal window for Unit 4B opens next month with identical rate terms. Also, routine HVAC filter changes occur this Friday...',
    receivedAt: '2026-11-24T08:30:00Z',
    category: 'team',
    priority: 'medium',
    aiSummary: 'Building management confirmed 0% rent increase option for lease renewal. Filter change scheduled for Friday 10 AM.',
    suggestedReply: 'Thank you for the update. We plan to renew under the same terms. Please proceed with the Friday filter change as scheduled.',
    replyStatus: 'drafted',
    isRead: true,
  },
  {
    id: 'em_coned_03',
    senderName: 'ConEdison Utilities',
    senderEmail: 'ebill@coned.com',
    subject: 'Your November Electric & Gas Statement is Ready ($135.20)',
    snippet: 'Your monthly bill for service through Nov 21 is $135.20. Payment is due by Nov 25, 2026...',
    receivedAt: '2026-11-23T14:10:00Z',
    category: 'financial',
    priority: 'high',
    aiSummary: 'Monthly electricity bill of $135.20 due tomorrow. Normal consumption levels; no unexpected price spikes.',
    replyStatus: 'none',
    isRead: true,
  },
  {
    id: 'em_delta_04',
    senderName: 'Delta Customer Care',
    senderEmail: 'customercare@delta.com',
    subject: 'Update on Claim #DL-88291 (Flight Delay Compensation)',
    snippet: 'We have received your claim documentation and are reviewing ticket details under European travel regulations...',
    receivedAt: '2026-11-17T11:20:00Z',
    category: 'financial',
    priority: 'medium',
    aiSummary: 'Dispute has had no status progression for 7 days. Homingo is holding an escalation follow-up ready to ping the carrier.',
    suggestedReply: 'Checking in regarding claim #DL-88291. It has been 7 days since receipt confirmation. Please confirm disbursement timeline.',
    replyStatus: 'drafted',
    isRead: false,
  },
  {
    id: 'em_substack_05',
    senderName: 'The Curious Architect',
    senderEmail: 'digest@curiousarchitect.substack.com',
    subject: 'Passive House Principles & Smart Living in 2027',
    snippet: 'Deep dive into bioclimatic architecture, natural lighting, and energy-neutral residences...',
    receivedAt: '2026-11-24T06:00:00Z',
    category: 'newsletter',
    priority: 'low',
    aiSummary: 'Weekly design digest exploring sustainable residential architecture and natural ventilation.',
    replyStatus: 'none',
    isRead: true,
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal_morning_routine',
    title: 'Morning Flow & AI Daily Plan',
    startTime: '2026-11-24T13:30:00Z',
    endTime: '2026-11-24T14:00:00Z',
    timeFormatted: '8:30 AM – 9:00 AM',
    location: 'Home Study',
    attendees: [{ name: 'Jordan Rivera', email: 'jordan@personal.homingo.ai' }],
    category: 'personal',
    conflict: false,
    prepNotes: 'Homingo reviewed overnight notifications and flagged electricity bill due tomorrow.',
  },
  {
    id: 'cal_studio_design',
    title: 'Focus: Eco-Pavilion Design Drafts',
    startTime: '2026-11-24T15:00:00Z',
    endTime: '2026-11-24T17:00:00Z',
    timeFormatted: '10:00 AM – 12:00 PM',
    location: 'Studio Desk (Deep Work)',
    attendees: [{ name: 'Jordan Rivera', email: 'jordan@personal.homingo.ai' }],
    category: 'focus',
    conflict: false,
    prepNotes: 'Protected focus window; notifications automatically silenced.',
  },
  {
    id: 'cal_contractor_call',
    title: 'Contractor Sync on Kitchen Remodel',
    startTime: '2026-11-24T19:00:00Z',
    endTime: '2026-11-24T19:30:00Z',
    timeFormatted: '2:00 PM – 2:30 PM',
    location: 'Phone Call',
    attendees: [
      { name: 'Jordan Rivera', email: 'jordan@personal.homingo.ai' },
      { name: 'Sam Miller', email: 'sam@millerbuilders.com' },
    ],
    category: 'meeting',
    conflict: false,
    prepNotes: 'Confirm cabinet delivery date and tile shipment receipt.',
  },
  {
    id: 'cal_travel_buffer',
    title: 'Transit Buffer to Metro Dental',
    startTime: '2026-11-24T20:35:00Z',
    endTime: '2026-11-24T21:00:00Z',
    timeFormatted: '3:35 PM – 4:00 PM',
    location: 'Downtown Transit',
    attendees: [{ name: 'Jordan Rivera', email: 'jordan@personal.homingo.ai' }],
    category: 'travel',
    conflict: false,
    prepNotes: 'Automated 25-min buffer protected by Homingo to guarantee on-time clinic arrival.',
  },
  {
    id: 'cal_dental_appt',
    title: 'Annual Dental Cleaning & Exam',
    startTime: '2026-11-24T21:00:00Z',
    endTime: '2026-11-24T21:45:00Z',
    timeFormatted: '4:00 PM – 4:45 PM',
    location: 'Metro Dental Clinic (Suite 300)',
    attendees: [
      { name: 'Jordan Rivera', email: 'jordan@personal.homingo.ai' },
      { name: 'Dr. Chloe Vance', email: 'reception@metrodental.com' },
    ],
    category: 'personal',
    conflict: false,
    prepNotes: 'Dental insurance card and ID pre-verified. Routine cleaning, zero copay with Delta Dental.',
  },
];

export const MOCK_BILLS: BillItem[] = [
  {
    id: 'bill_coned',
    merchant: 'ConEdison Electricity & Gas',
    serviceCategory: 'Home Utilities',
    amount: 135.20,
    currency: 'USD',
    dueDate: '2026-11-25',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: false,
  },
  {
    id: 'bill_verizon_fiber',
    merchant: 'Verizon Fios 1-Gig Fiber',
    serviceCategory: 'Home Internet',
    amount: 79.99,
    currency: 'USD',
    dueDate: '2026-11-29',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: true,
  },
  {
    id: 'bill_cloud_storage',
    merchant: 'Apple One Family Premier',
    serviceCategory: 'Cloud & Entertainment',
    amount: 37.95,
    currency: 'USD',
    dueDate: '2026-12-02',
    status: 'scheduled',
    hasAnomaly: false,
    autoPayEnabled: true,
  },
  {
    id: 'bill_gym_monthly',
    merchant: 'Equinox Fitness Club',
    serviceCategory: 'Health & Wellness',
    amount: 280.00,
    currency: 'USD',
    dueDate: '2026-11-18',
    status: 'paid',
    hasAnomaly: false,
    autoPayEnabled: true,
  },
];

export const MOCK_REFUNDS: RefundItem[] = [
  {
    id: 'ref_delta_flight',
    merchant: 'Delta Air Lines',
    trackingId: 'DL-EU261-88291',
    claimAmount: 240.00,
    currency: 'USD',
    dateInitiated: '2026-11-17',
    expectedDate: '2026-11-26',
    status: 'under_review',
    negotiationStep: 'Claim filed for 4-hour delay on flight DL 189. Stalled for 7 days; Homingo drafted status follow-up.',
    supportThreadUrl: 'https://delta.com/claims/DL-88291',
  },
  {
    id: 'ref_target_return',
    merchant: 'Target Store Return',
    trackingId: 'TGT-RET-4921',
    claimAmount: 48.20,
    currency: 'USD',
    dateInitiated: '2026-11-22',
    expectedDate: '2026-11-25',
    status: 'merchant_approved',
    negotiationStep: 'Return processed in store. Bank credit pending settlement.',
  },
  {
    id: 'ref_double_charge',
    merchant: 'Whole Foods Market',
    trackingId: 'WFM-DISP-1102',
    claimAmount: 19.50,
    currency: 'USD',
    dateInitiated: '2026-11-20',
    status: 'refunded',
    negotiationStep: 'Autonomous dispute approved for duplicate coffee bag charge.',
  },
];

export const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr_coned_pay',
    title: 'Authorize $135.20 Payment to ConEdison',
    category: 'financial',
    urgency: 'high',
    status: 'pending',
    aiReasoning: 'Bill is due tomorrow (Nov 25). Auto-pay is disabled on this account to prevent unexpected charges. Requires your 1-click confirmation.',
    details: {
      vendor: 'ConEdison Utilities (Account #9910-21)',
      amount: 135.20,
      scheduledTime: 'Due Nov 25, 2026 (Tomorrow)',
      impactSummary: 'Prevents late fees ($7.50) and maintains active utility service.',
    },
    createdAt: '2026-11-24T08:00:00Z',
  },
  {
    id: 'appr_clinic_email',
    title: 'Send Doctor Follow-up to Dr. Julian Aris',
    category: 'email',
    urgency: 'medium',
    status: 'pending',
    aiReasoning: 'Doctor requested confirmation of review format. Homingo drafted a concise reply proposing a 15-min telemedicine call Thursday 2-4 PM.',
    details: {
      recipient: 'Dr. Julian Aris (dr.aris@metrohealth.org)',
      contractName: 'Annual Wellness Review',
      impactSummary: 'Secures preferred telemedicine time slot before clinic fills up.',
    },
    createdAt: '2026-11-24T12:35:00Z',
  },
  {
    id: 'appr_cleaner_paid',
    title: 'Paid $120.00 for Home Deep Cleaning',
    category: 'financial',
    urgency: 'low',
    status: 'approved',
    aiReasoning: 'Standard pre-authorized bi-weekly home cleaning service.',
    details: {
      vendor: 'Sparkle Cleaners NYC',
      amount: 120.00,
      impactSummary: 'Service completed on Monday.',
    },
    createdAt: '2026-11-23T15:00:00Z',
  },
];

export const MOCK_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act_triage_inbox',
    title: 'Analysed 18 Personal & Household Emails',
    description: 'Flagged Dr. Aris lab results, archived 16 marketing messages, generated 1 draft reply.',
    category: 'email',
    actor: 'Autonomous Agent',
    toolUsed: 'gmail.personal_triage',
    status: 'completed',
    timestamp: '2026-11-24T13:45:00Z',
    durationFormatted: '1.2s',
  },
  {
    id: 'act_bill_audit',
    title: 'Audited ConEdison November Energy Statement',
    description: 'Verified $135.20 usage against historical seasonal averages. Prepared payment authorization.',
    category: 'financial',
    actor: 'Autonomous Agent',
    toolUsed: 'utilities.bill_analyzer',
    status: 'completed',
    timestamp: '2026-11-24T11:20:00Z',
    durationFormatted: '0.8s',
  },
  {
    id: 'act_buffer_protect',
    title: 'Protected 25-Min Transit Buffer for Metro Dental',
    description: 'Estimated transit time via Google Maps. Reserved 3:35 PM to 4:00 PM to eliminate delay risk.',
    category: 'calendar',
    actor: 'Autonomous Agent',
    toolUsed: 'calendar.smart_travel_guard',
    status: 'completed',
    timestamp: '2026-11-24T09:15:00Z',
    durationFormatted: '0.6s',
  },
  {
    id: 'act_refund_escalate',
    title: 'Detected 7-Day Stall on Delta Refund Claim',
    description: 'Identified lack of airline response on claim #DL-88291. Formulated polite follow-up brief.',
    category: 'financial',
    actor: 'Autonomous Agent',
    toolUsed: 'refund_negotiator.status_check',
    status: 'completed',
    timestamp: '2026-11-23T18:00:00Z',
    durationFormatted: '1.4s',
  },
  {
    id: 'act_sync_failed_test',
    title: 'Attempted Sync with Apartment Key Fob Portal',
    description: 'Resident portal session expired; prompted notification to reconnect credentials.',
    category: 'system',
    actor: 'Autonomous Agent',
    toolUsed: 'smart_home.keyfob_bridge',
    status: 'failed',
    timestamp: '2026-11-23T12:10:00Z',
    durationFormatted: '2.1s',
  },
];

export const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc_google',
    name: 'Google Workspace (Personal Mail, Calendar, Drive)',
    provider: 'google',
    icon: 'Mail',
    connected: true,
    lastSyncedAt: '2026-11-24T16:00:00Z',
    scopes: ['gmail.readonly', 'gmail.compose', 'calendar.events'],
  },
  {
    id: 'acc_slack',
    name: 'Household & Family Slack Channel',
    provider: 'slack',
    icon: 'MessageSquare',
    connected: true,
    lastSyncedAt: '2026-11-24T15:45:00Z',
    scopes: ['chat:write', 'channels:read'],
  },
  {
    id: 'acc_stripe',
    name: 'Chase Banking & Utility Billing Feed',
    provider: 'stripe',
    icon: 'CreditCard',
    connected: true,
    lastSyncedAt: '2026-11-24T14:30:00Z',
    scopes: ['transactions.read', 'invoices.read'],
  },
  {
    id: 'acc_notion',
    name: 'Personal Life Wiki & Home Documents',
    provider: 'notion',
    icon: 'BookOpen',
    connected: true,
    lastSyncedAt: '2026-11-24T12:00:00Z',
    scopes: ['pages.read', 'databases.read'],
  },
];

export const MOCK_PERMISSIONS: AutonomousPermissions = {
  autoApproveExpensesUnder: 100,
  requireApprovalForExternalEmails: true,
  allowAutoRescheduleMeetings: true,
  allowRefundDisputeAutonomousClaims: true,
  dailyExecutiveBriefingTime: '08:00 AM',
  dataSharingForAiFineTuning: false,
};
