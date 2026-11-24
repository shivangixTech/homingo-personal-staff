import { useEffect, useState } from 'react';
import {
  Send,
  Sparkles,
  Search,
  Check,
  Edit3,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { EmailItem, EmailCategory } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Tabs } from '../components/common/Tabs';
import { formatRelativeTime } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const EmailPage: React.FC = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmail, setActiveEmail] = useState<EmailItem | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, [selectedCategory]);

  const loadEmails = async () => {
    try {
      const data = await apiService.getEmails(selectedCategory);
      setEmails(data);
      if (data.length > 0 && !activeEmail) {
        setActiveEmail(data[0]);
        setDraftContent(data[0].suggestedReply || '');
      }
    } catch (err) {
      console.error('Failed to load emails', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = (email: EmailItem) => {
    setActiveEmail(email);
    setDraftContent(email.suggestedReply || '');
    setIsEditingDraft(false);
  };

  const handleSendReply = async () => {
    if (!activeEmail) return;
    try {
      const updated = await apiService.sendEmailReply(activeEmail.id, draftContent);
      setEmails((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setActiveEmail(updated);
      setIsEditingDraft(false);
      toast({
        title: 'Response Dispatched via Gmail',
        description: `Delivered to ${updated.senderName} (${updated.senderEmail}).`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to dispatch reply', err);
      toast({ title: 'Failed to send email', type: 'critical' });
    }
  };

  const tabs = [
    { id: 'all' as EmailCategory, label: 'All Personal Inbox', count: emails.length },
    { id: 'urgent' as EmailCategory, label: 'Doctor & Urgent Action' },
    { id: 'financial' as EmailCategory, label: 'Bills & Utilities' },
    { id: 'team' as EmailCategory, label: 'Apartment & Living' },
    { id: 'newsletter' as EmailCategory, label: 'Subscriptions' },
  ];

  const filteredEmails = emails.filter((e) => {
    const matchesSearch =
      e.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.aiSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Email Triage & Drafts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Homingo screens incoming emails, generates personalized draft replies, and asks for your 1-click confirmation before sending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="md" dot>
            2 Priority Briefs Ready
          </Badge>
        </div>
      </div>

      {/* Category Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Tabs
          tabs={tabs}
          activeTab={selectedCategory}
          onChange={(cat) => setSelectedCategory(cat)}
        />

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email threads..."
            className="w-full rounded-xl border pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Split Inbound List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Email List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 overflow-y-auto max-h-[700px] pr-1">
          {filteredEmails.map((email) => {
            const isSelected = activeEmail?.id === email.id;
            return (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-sm dark:bg-slate-800/90 dark:border-indigo-500/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {email.avatar ? (
                      <img
                        src={email.avatar}
                        alt={email.senderName}
                        className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {email.senderName[0]}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {email.senderName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {email.replyStatus === 'drafted' && (
                      <Badge variant="indigo" size="sm">
                        Draft Ready
                      </Badge>
                    )}
                    {email.replyStatus === 'sent' && (
                      <Badge variant="success" size="sm">
                        Sent
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(email.receivedAt)}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mb-1">
                  {email.subject}
                </h4>

                {/* AI Personal Summary Snippet */}
                <div className="p-2.5 rounded-xl text-[11px] leading-relaxed flex items-start gap-1.5 mt-2 bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-950/60 dark:border-slate-800/80 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{email.aiSummary}</p>
                </div>
              </div>
            );
          })}

          {filteredEmails.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No emails matching your filter criteria.
            </div>
          )}
        </div>

        {/* Selected Email & Draft Reply Card (7 cols) */}
        <div className="lg:col-span-7">
          {activeEmail ? (
            <Card className="h-full flex flex-col justify-between space-y-4 p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activeEmail.priority === 'high'
                            ? 'warning'
                            : activeEmail.priority === 'medium'
                            ? 'indigo'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {activeEmail.priority} priority
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {activeEmail.category}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {activeEmail.subject}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      From: <span className="text-slate-800 dark:text-slate-200 font-medium">{activeEmail.senderName}</span> ({activeEmail.senderEmail})
                    </p>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {formatRelativeTime(activeEmail.receivedAt)}
                  </span>
                </div>

                {/* AI Executive Analysis Card */}
                <div className="p-4 rounded-2xl border space-y-1.5 bg-gradient-to-r from-indigo-50/80 to-slate-50 border-indigo-200 dark:from-indigo-950/40 dark:to-slate-900 dark:border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Chief of Staff Context & Advice
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeEmail.aiSummary}
                  </p>
                </div>

                {/* Original Message Snippet */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Original Message
                  </span>
                  <div className="p-3.5 rounded-xl border text-xs leading-relaxed font-mono bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                    {activeEmail.snippet}
                  </div>
                </div>

                {/* Suggested Reply Area */}
                {activeEmail.suggestedReply && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                        AI Drafted Response
                      </span>
                      {activeEmail.replyStatus === 'sent' && (
                        <Badge variant="success" size="sm">
                          Dispatched via Gmail
                        </Badge>
                      )}
                    </div>

                    <div className="relative rounded-2xl border p-4 transition-all bg-white border-indigo-200 shadow-xs dark:bg-slate-950/70 dark:border-indigo-500/30">
                      {isEditingDraft ? (
                        <textarea
                          value={draftContent}
                          onChange={(e) => setDraftContent(e.target.value)}
                          rows={4}
                          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {draftContent}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDraft(!isEditingDraft)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  {isEditingDraft ? 'Cancel Editing' : 'Edit Draft'}
                </Button>

                <div className="flex items-center gap-2">
                  {activeEmail.replyStatus !== 'sent' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSendReply}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Approve & Send Draft
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      Response Dispatched
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an email from the left column to view the thread and AI draft.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
