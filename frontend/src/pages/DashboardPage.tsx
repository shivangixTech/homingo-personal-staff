import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Calendar, Check, CircleCheck, FileText,
  Mail, MapPin, Mic, Receipt, RefreshCw, Send, ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { apiService } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GOVERNMENT_FORM } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

const quickPrompts = [
  { label: 'Electricity bill', prompt: 'bijli ka bill kitna hai', icon: Receipt },
  { label: 'Shop meetings', prompt: 'aaj ki meeting batao', icon: Calendar },
  { label: 'Important mail', prompt: 'mail batao', icon: Mail },
  { label: 'Licence renewal', prompt: 'licence renewal ke liye kya chahiye', icon: FileText },
  { label: 'Pending refunds', prompt: 'Find my pending refunds', icon: RefreshCw },
];

async function loadDashboard() {
  const [summary, events, approvals, bills, refunds, activities, emails] = await Promise.all([
    apiService.getDashboardSummary(),
    apiService.getCalendarEvents(),
    apiService.getApprovals('pending'),
    apiService.getBills(),
    apiService.getRefunds(),
    apiService.getActivityLogs(),
    apiService.getEmails(),
  ]);
  return { summary, events, approvals, bills, refunds, activities, emails };
}

export function DashboardPage() {
  const { profile, salutation, currentDateFormatted } = useUser();
  const { toast } = useToast();
  const [data, setData] = useState<Awaited<ReturnType<typeof loadDashboard>> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [reply, setReply] = useState('');
  const [asking, setAsking] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadDashboard().then(
      (result) => { if (active) setData(result); },
      () => { if (active) setLoadFailed(true); },
    );
    return () => { active = false; };
  }, []);

  async function ask(query: string) {
    const text = query.trim();
    if (!text || asking) return;
    setAsking(true);
    setReply('');
    try {
      const response = await apiService.sendMessage('th_dashboard_quick', text);
      setCommand('');
      setReply(response.content);
      const approvals = await apiService.getApprovals('pending');
      setData((current) => current && { ...current, approvals });
    } catch {
      toast({ title: 'Could not send your message', type: 'critical' });
    } finally {
      setAsking(false);
    }
  }

  async function decide(id: string, decision: 'approved' | 'rejected') {
    if (deciding) return;
    setDeciding(id);
    try {
      await apiService.decideApproval(id, decision, 'Reviewed from the Command Centre');
      setData((current) => current && {
        ...current,
        approvals: current.approvals.filter((item) => item.id !== id),
      });
      toast({ title: decision === 'approved' ? 'Action authorized' : 'Action declined', type: 'success' });
    } catch {
      toast({ title: 'Could not update this approval', type: 'critical' });
    } finally {
      setDeciding(null);
    }
  }

  if (loadFailed) {
    return <p className="dash-panel dashboard-state" role="alert">The dashboard couldn’t load. Refresh the page to try again.</p>;
  }
  if (!data) {
    return <p className="dash-panel dashboard-state" role="status">Loading your shop overview…</p>;
  }

  const billsDue = data.bills.filter((bill) => bill.status === 'scheduled' || bill.status === 'overdue');
  const pendingRefunds = data.refunds.filter((refund) => refund.status !== 'refunded');
  const importantMail = data.emails.filter((email) => email.priority !== 'low');
  const stats = [
    { label: 'Bills due', value: billsDue.length, detail: 'Review upcoming payments', icon: Receipt, tone: 'amber', to: '/bills' },
    { label: 'Important mail', value: importantMail.length, detail: 'Open the shop inbox', icon: Mail, tone: 'pine', to: '/emails' },
    { label: 'Shop events', value: data.summary.metrics.meetingsOptimized, detail: 'See your schedule', icon: Calendar, tone: 'blue', to: '/calendar' },
    { label: 'Pending refunds', value: pendingRefunds.length, detail: 'Track refund progress', icon: RefreshCw, tone: 'plum', to: '/bills' },
  ];
  const priorities = [
    ...data.summary.urgentAlerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      detail: alert.description,
      to: alert.actionUrl,
      action: alert.actionLabel,
      urgent: alert.level !== 'info',
    })),
    {
      id: 'licence', title: 'Shop licence renewal',
      detail: `${GOVERNMENT_FORM.documentsPresent.join(', ')} on file. Missing ${GOVERNMENT_FORM.documentsMissing.join(', ').toLowerCase()}.`,
      to: '/emails', action: 'View reminder', urgent: true,
    },
  ];
  const pendingCount = priorities.filter((item) => !completed.includes(item.id)).length;

  return (
    <div className="dashboard">
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <div className="hero-copy">
          <p className="hero-location"><MapPin aria-hidden="true" /> Bhopal shop <span aria-hidden="true">·</span> {currentDateFormatted}</p>
          <h1 id="dashboard-title">{salutation},<br />{profile.name}.</h1>
          <p>Your shop’s bills, messages and schedule in one place.</p>
          <Link to="/assistant" className="hero-action">
            <Sparkles aria-hidden="true" /> Open Assistant <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Shop at a glance">
        {stats.map(({ label, value, detail, icon: Icon, tone, to }) => (
          <Link className="dashboard-stat" key={label} to={to}>
            <span className="stat-icon" data-tone={tone}><Icon aria-hidden="true" /></span>
            <span className="stat-copy">
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
            </span>
            <ArrowUpRight className="stat-arrow" aria-hidden="true" />
            <span className="stat-detail">{detail}</span>
          </Link>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="dash-panel" aria-labelledby="priorities-title">
          <header className="dash-panel-header">
            <h2 id="priorities-title">Needs attention</h2>
            <span className="panel-count">{pendingCount} open</span>
          </header>
          <ul className="dash-list">
            {priorities.map((item) => {
              const done = completed.includes(item.id);
              return (
                <li className="priority-row" key={item.id}>
                  <button
                    className="priority-check"
                    type="button"
                    aria-pressed={done}
                    aria-label={`Complete: ${item.title}`}
                    onClick={() => setCompleted((current) => done ? current.filter((id) => id !== item.id) : [...current, item.id])}
                  >
                    <span>{done && <Check aria-hidden="true" />}</span>
                  </button>
                  <div className={done ? 'priority-copy is-complete' : 'priority-copy'}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  {!done && item.urgent && <span className="priority-tag">Review</span>}
                  {item.to && item.action && (
                    <Link className="row-link" to={item.to} aria-label={`${item.action}: ${item.title}`}>
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="dash-panel ask-panel" aria-labelledby="ask-title">
          <header className="dash-panel-header">
            <div className="panel-title-icon"><Sparkles aria-hidden="true" /><h2 id="ask-title">Ask Homingo</h2></div>
            <Link className="panel-link" to="/assistant">Full chat <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <div className="ask-content">
            <p className="ask-hint">Ask a question in Hindi or English.</p>
            <form className="ask-form" onSubmit={(event) => { event.preventDefault(); void ask(command); }}>
              <input aria-label="Ask Homingo" placeholder="Ask about your shop…" value={command} onChange={(event) => setCommand(event.target.value)} disabled={asking} />
              <button className="ask-voice" type="button" aria-label="Insert sample voice prompt" title="Voice input demo" onClick={() => setCommand("Check my important emails and upcoming bills.")} disabled={asking}><Mic aria-hidden="true" /></button>
              <button type="submit" aria-label="Send question" disabled={asking || !command.trim()}><Send aria-hidden="true" /></button>
            </form>
            <div className="ask-prompts" aria-label="Suggested questions">
              {quickPrompts.map(({ label, prompt, icon: Icon }) => (
                <button type="button" key={label} disabled={asking} onClick={() => void ask(prompt)}>
                  <Icon aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
            {asking && <p className="ask-response" role="status">Homingo is working on your request…</p>}
            {reply && (
              <div className="ask-response">
                <button className="row-link reply-dismiss" type="button" onClick={() => setReply('')} aria-label="Dismiss reply"><X aria-hidden="true" /></button>
                <p role="status">{reply}</p>
              </div>
            )}
          </div>
        </section>

        <section className="dash-panel" aria-labelledby="finances-title">
          <header className="dash-panel-header">
            <h2 id="finances-title">Bills &amp; refunds</h2>
            <Link className="panel-link" to="/bills">View finances <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <ul className="dash-list">
            {billsDue.slice(0, 3).map((bill) => (
              <li className="overview-row" key={bill.id}>
                <span className="row-icon" data-tone="amber"><Receipt aria-hidden="true" /></span>
                <div><h3>{bill.merchant}</h3><p>Due {formatDate(bill.dueDate)}</p></div>
                <strong>{formatCurrency(bill.amount, bill.currency)}</strong>
              </li>
            ))}
            {pendingRefunds.slice(0, 2).map((refund) => (
              <li className="overview-row" key={refund.id}>
                <span className="row-icon" data-tone="pine"><RefreshCw aria-hidden="true" /></span>
                <div><h3>{refund.merchant}</h3><p>Refund {refund.trackingId} · {refund.status.replaceAll('_', ' ')}</p></div>
                <strong className="refund-amount">+{formatCurrency(refund.claimAmount, refund.currency)}</strong>
              </li>
            ))}
          </ul>
          {!billsDue.length && !pendingRefunds.length && <p className="panel-empty">No open bills or refunds.</p>}
        </section>

        <section className="dash-panel" aria-labelledby="schedule-title">
          <header className="dash-panel-header">
            <h2 id="schedule-title">Shop schedule</h2>
            <Link className="panel-link" to="/calendar">Open calendar <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <ul className="dash-list">
            {data.events.slice(0, 3).map((event) => (
              <li className="overview-row" key={event.id}>
                <time className="schedule-date" dateTime={event.startTime}>{shortDate.format(new Date(event.startTime))}</time>
                <div><h3>{event.title}</h3><p>{event.timeFormatted.split(' - ')[0]} · {event.location}</p></div>
              </li>
            ))}
          </ul>
          {!data.events.length && <p className="panel-empty">No events on the calendar.</p>}
        </section>

        <section className="dash-panel" aria-labelledby="approvals-title">
          <header className="dash-panel-header">
            <div className="panel-title-icon"><ShieldCheck aria-hidden="true" /><h2 id="approvals-title">Pending approvals</h2></div>
            <Link className="panel-link" to="/approvals">View queue <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          {data.approvals.length ? (
            <ul className="dash-list">
              {data.approvals.map((item) => (
                <li className="approval-row" key={item.id}>
                  <Badge variant="warning">{item.category}</Badge>
                  <h3>{item.title}</h3>
                  <p>{item.aiReasoning}</p>
                  <p>{item.details.impactSummary}</p>
                  <div className="approval-buttons">
                    <Button variant="outline" disabled={!!deciding} onClick={() => void decide(item.id, 'rejected')}>Decline</Button>
                    <Button disabled={!!deciding} onClick={() => void decide(item.id, 'approved')}>Authorize action</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="panel-empty"><CircleCheck aria-hidden="true" /> Nothing waiting for approval.</p>}
        </section>

        <section className="dash-panel" aria-labelledby="activity-title">
          <header className="dash-panel-header">
            <div className="panel-title-icon"><Activity aria-hidden="true" /><h2 id="activity-title">Recent activity</h2></div>
            <Link className="panel-link" to="/activity">View history <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <ul className="dash-list">
            {data.activities.slice(0, 4).map((item) => (
              <li className="overview-row" key={item.id}>
                <span className="row-icon" data-tone="pine"><Activity aria-hidden="true" /></span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </ul>
          {!data.activities.length && <p className="panel-empty">No activity recorded yet.</p>}
        </section>
      </div>
    </div>
  );
}
