import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Mail,
  Receipt,
  Mic,
  MicOff,
  Send,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Square,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Terminal,
  Activity,
  Bot,
  ExternalLink,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { DashboardSummary, CalendarEvent, ApprovalItem, BillItem, RefundItem, ActivityLogItem } from '../types';
import { MetricCard, Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

interface PriorityItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  completed: boolean;
  actionLabel: string;
  actionUrl: string;
}

export const DashboardPage: React.FC = () => {
  const { profile, salutation, currentTimeFormatted, currentDateFormatted, detectedTimezone } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Command Centre Interactive State
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeChatReply, setActiveChatReply] = useState<string | null>(null);
  const [executedTool, setExecutedTool] = useState<string | null>(null);

  // Section C: Today's Priorities
  const [priorities, setPriorities] = useState<PriorityItem[]>([
    {
      id: 'prio_coned',
      title: 'Authorize ConEdison Electricity Bill ($135.20)',
      priority: 'high',
      deadline: 'Tomorrow, 5:00 PM',
      completed: false,
      actionLabel: '1-Click Pay',
      actionUrl: '/approvals',
    },
    {
      id: 'prio_clinic',
      title: 'Reply to Dr. Julian Aris Clinic (Lab Results)',
      priority: 'high',
      deadline: 'Today, 6:00 PM',
      completed: false,
      actionLabel: 'Send Draft',
      actionUrl: '/emails',
    },
    {
      id: 'prio_dental',
      title: 'Annual Dental Cleaning at Metro Dental',
      priority: 'medium',
      deadline: 'Today, 4:00 PM',
      completed: false,
      actionLabel: 'View Transit',
      actionUrl: '/calendar',
    },
    {
      id: 'prio_delta',
      title: 'Check Stalled Delta Refund Escalation ($240.00)',
      priority: 'medium',
      deadline: 'Pending 7 days',
      completed: true,
      actionLabel: 'Track Status',
      actionUrl: '/bills',
    },
  ]);

  useEffect(() => {
    async function loadAllDashboardData() {
      try {
        const [dashData, calData, approvalsData, billsData, refundsData, activityData] =
          await Promise.all([
            apiService.getDashboardSummary(),
            apiService.getCalendarEvents(),
            apiService.getApprovals('pending'),
            apiService.getBills(),
            apiService.getRefunds(),
            apiService.getActivityLogs(),
          ]);
        setDashboard(dashData);
        setCalendarEvents(calData);
        setPendingApprovals(approvalsData);
        setBills(billsData);
        setRefunds(refundsData);
        setRecentActivities(activityData.slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllDashboardData();
  }, []);

  const handleCommandSubmit = async (queryText?: string) => {
    const text = queryText || commandInput;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setActiveChatReply(null);
    setExecutedTool(null);

    try {
      const response = await apiService.sendMessage('th_dashboard_quick', text);
      setActiveChatReply(response.content);
      if (response.toolsExecuted && response.toolsExecuted.length > 0) {
        setExecutedTool(response.toolsExecuted[0].toolName);
      }
      setCommandInput('');
      toast({
        title: 'Homingo processed request',
        description: `Executed via ${response.toolsExecuted?.[0]?.toolName || 'personal agent'}`,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error processing command', type: 'critical' });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      toast({
        title: 'Voice input activated',
        description: 'Listening for your instructions...',
        type: 'info',
      });
      // Simulate speech-to-text input after 1.5 seconds
      setTimeout(() => {
        setCommandInput('Check my important emails and upcoming bills.');
        setIsVoiceActive(false);
      }, 2000);
    } else {
      setIsVoiceActive(false);
    }
  };

  const handleTogglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.completed;
          toast({
            title: nextState ? 'Task marked completed' : 'Task restored to pending',
            description: p.title,
            type: nextState ? 'success' : 'info',
          });
          return { ...p, completed: nextState };
        }
        return p;
      })
    );
  };

  const handleQuickApprove = async (approvalId: string) => {
    try {
      await apiService.decideApproval(approvalId, 'approved', 'Authorized via Personal Command Centre');
      setPendingApprovals((prev) => prev.filter((a) => a.id !== approvalId));
      toast({
        title: 'Action Approved & Scheduled',
        description: 'Homingo committed transaction to verified ledger.',
        type: 'success',
      });
    } catch (err) {
      toast({ title: 'Failed to approve', type: 'critical' });
    }
  };

  const handleQuickReject = async (approvalId: string) => {
    try {
      await apiService.decideApproval(approvalId, 'rejected', 'Declined via Personal Command Centre');
      setPendingApprovals((prev) => prev.filter((a) => a.id !== approvalId));
      toast({
        title: 'Action Declined',
        description: 'No payment or message was dispatched.',
        type: 'warning',
      });
    } catch (err) {
      toast({ title: 'Failed to decline', type: 'critical' });
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
          <p className="text-xs text-slate-500 font-mono">Synchronizing Personal Command Centre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ============================================================ */}
      {/* SECTION A: PERSONAL WELCOME & BRIEFING                      */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/50 border-slate-200/90 shadow-sm shadow-slate-100 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 dark:border-indigo-500/20 dark:shadow-none">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" size="sm" dot>
                Personal Chief of Staff
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {currentDateFormatted} • {currentTimeFormatted} ({detectedTimezone.split('/')[1]?.replace('_', ' ') || detectedTimezone})
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {salutation},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-300 dark:via-indigo-200 dark:to-white">
                {profile.name}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {dashboard.greeting.briefSummary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/assistant">
              <Button
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4 text-indigo-200" />}
                className="shadow-md shadow-indigo-600/25"
              >
                Open Full Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION B: AI COMMAND CENTRE (The Visual Centerpiece!)       */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all bg-white border-slate-200/90 shadow-lg shadow-indigo-500/5 dark:bg-slate-900/90 dark:border-indigo-500/30 dark:shadow-2xl dark:shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                AI Command Centre
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct conversational interface with your Personal Chief of Staff
              </p>
            </div>
          </div>

          <Badge variant="neutral" size="sm" className="hidden sm:inline-flex">
            Ready for instructions
          </Badge>
        </div>

        {/* Input Bar with Natural Language & Voice Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommandSubmit();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Tell Homingo what to do (e.g., 'Pay ConEd', 'Check flight refund', 'Organise tomorrow')..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-300/80 px-4 py-3.5 pr-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              disabled={isProcessing}
            />

            {/* Voice button inside input */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isVoiceActive ? 'Stop listening' : 'Start voice command'}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                isVoiceActive
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:text-indigo-400 dark:hover:bg-slate-800'
              }`}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!commandInput.trim() || isProcessing}
            isLoading={isProcessing}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="h-11 sm:px-5"
          >
            Execute
          </Button>
        </form>

        {/* Suggested Prompts Pill Bar */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
            Suggested Prompts:
          </span>
          {[
            'Check my important emails.',
            'Find my pending refunds.',
            'Organise my schedule for tomorrow.',
            'Remind me about upcoming bills.',
          ].map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCommandSubmit(promptText)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              "{promptText}"
            </button>
          ))}
        </div>

        {/* Live Inline Response / Tool Execution Box */}
        {(isProcessing || activeChatReply) && (
          <div className="mt-4 p-4 rounded-2xl border transition-all animate-in fade-in duration-200 bg-slate-50 border-indigo-200/70 dark:bg-slate-950 dark:border-indigo-500/30">
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Chief of Staff is reasoning...
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scanning personal inbox, utility billing portal & calendar timeline.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Homingo Response
                    </span>
                    {executedTool && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {executedTool}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveChatReply(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeChatReply}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION D: SMART INSIGHTS                                    */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Smart Personal Insights
            </h3>
          </div>
          <Badge variant="indigo" size="sm">
            Autonomous Detection
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Insight 1: Electricity bill */}
          <div className="p-4 rounded-2xl border transition-all hover:shadow-md bg-white border-amber-200/80 dark:bg-slate-900/70 dark:border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Electricity Bill Due Tomorrow
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  ConEdison $135.20 due Nov 25. Auto-pay off.
                </p>
                <Link
                  to="/approvals"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  Pay with 1 click →
                </Link>
              </div>
            </div>
          </div>

          {/* Insight 2: Refund pending for 7 days */}
          <div className="p-4 rounded-2xl border transition-all hover:shadow-md bg-white border-indigo-200/80 dark:bg-slate-900/70 dark:border-indigo-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 mt-0.5">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Refund Pending for 7 Days
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Delta delay claim ($240.00). Follow-up ready.
                </p>
                <Link
                  to="/bills"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  View dispute →
                </Link>
              </div>
            </div>
          </div>

          {/* Insight 3: Important email awaiting response */}
          <div className="p-4 rounded-2xl border transition-all hover:shadow-md bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Doctor Lab Results Email
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Dr. Julian Aris awaiting telemedicine slot.
                </p>
                <Link
                  to="/emails"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  Send draft reply →
                </Link>
              </div>
            </div>
          </div>

          {/* Insight 4: Upcoming doctor appointment */}
          <div className="p-4 rounded-2xl border transition-all hover:shadow-md bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Dental Check-up at 4 PM
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Metro Dental Clinic. 25-min buffer added.
                </p>
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  View timeline →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION C & SECTION H: PRIORITIES & PENDING APPROVALS         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION C: TODAY'S PRIORITIES (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Today's Important Priorities
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {priorities.filter((p) => !p.completed).length} Pending
            </span>
          </div>

          <Card className="space-y-2.5 p-4">
            {priorities.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                  item.completed
                    ? 'bg-slate-50/60 border-slate-200/60 opacity-60 dark:bg-slate-950/40 dark:border-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className="flex items-start gap-3 flex-1 cursor-pointer"
                  onClick={() => handleTogglePriority(item.id)}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.priority === 'high'
                            ? 'warning'
                            : item.priority === 'medium'
                            ? 'indigo'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {!item.completed && (
                  <Link to={item.actionUrl} className="shrink-0">
                    <Button variant="secondary" size="sm">
                      {item.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* SECTION H: PENDING APPROVALS (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Pending Approvals (Human-in-the-Loop)
              </h3>
            </div>
            <Badge variant="warning" size="sm" dot>
              {pendingApprovals.length} Actions Awaiting Review
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((appr) => (
              <Card
                key={appr.id}
                className="p-4 border-amber-200/90 dark:border-amber-500/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">
                        {appr.category.toUpperCase()}
                      </Badge>
                      {appr.details.amount && (
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {formatCurrency(appr.details.amount)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {appr.title}
                    </h4>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Reason:
                    </span>{' '}
                    {appr.aiReasoning}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Consequence:</span> {appr.details.impactSummary}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickReject(appr.id)}
                    leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleQuickApprove(appr.id)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Authorize Action
                  </Button>
                </div>
              </Card>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                No pending approval actions. All clear!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION E: DAILY SCHEDULE & SECTION F: FINANCIAL OVERVIEW     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION E: DAILY SCHEDULE (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Daily Schedule Timeline
              </h3>
            </div>
            <Link
              to="/calendar"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {calendarEvents.map((evt) => (
              <Card key={evt.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200 dark:border-slate-800 w-24 shrink-0 text-center">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 mb-0.5" />
                    <span className="text-xs font-mono font-bold leading-tight">
                      {evt.timeFormatted.split('–')[0]?.trim()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {evt.title}
                      </h4>
                      <Badge variant={evt.category === 'travel' ? 'indigo' : 'neutral'} size="sm">
                        {evt.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {evt.location}
                    </p>
                    {evt.prepNotes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                        "{evt.prepNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <Link to="/calendar" className="shrink-0 self-center">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION F: FINANCIAL OVERVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Financial Overview (Household & Refunds)
              </h3>
            </div>
            <Link
              to="/bills"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Details →
            </Link>
          </div>

          <Card className="space-y-4 p-5">
            {/* Upcoming Bills */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Upcoming Bills
              </span>
              <div className="space-y-2">
                {bills.slice(0, 3).map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs dark:bg-slate-950 dark:border-slate-800"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {bill.merchant}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Due {formatDate(bill.dueDate)} • {bill.status}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount, bill.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Refunds */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Tracked Refunds
              </span>
              <div className="space-y-2">
                {refunds.slice(0, 2).map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs dark:bg-slate-950 dark:border-slate-800"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {ref.merchant}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {ref.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(ref.claimAmount, ref.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION G: RECENT AI ACTIVITY                                */}
      {/* ============================================================ */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent AI Actions Performed by Homingo
            </h3>
          </div>
          <Badge variant="neutral" size="sm">
            Live Audit Stream
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recentActivities.map((act) => (
            <Card key={act.id} className="p-4 space-y-2 hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {act.toolUsed}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {act.durationFormatted}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {act.title}
              </h4>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {act.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
