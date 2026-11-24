import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Check,
  X,
  ShieldAlert,
  AlertCircle,
  FileText,
  DollarSign,
  Mail,
  Calendar,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ApprovalItem } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const ApprovalsPage: React.FC = () => {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [decisionModal, setDecisionModal] = useState<{
    item: ApprovalItem;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    try {
      const data = await apiService.getApprovals(filter);
      setApprovals(data);
    } catch (err) {
      console.error('Failed to load approvals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitDecision = async () => {
    if (!decisionModal) return;
    try {
      const updated = await apiService.decideApproval(
        decisionModal.item.id,
        decisionModal.action,
        decisionComment
      );
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setDecisionModal(null);
      setDecisionComment('');
      toast({
        title: decisionModal.action === 'approved' ? 'Action Approved' : 'Action Declined',
        description: `Recorded for "${decisionModal.item.title}".`,
        type: decisionModal.action === 'approved' ? 'success' : 'warning',
      });
    } catch (err) {
      console.error('Failed to commit decision', err);
      toast({ title: 'Failed to record decision', type: 'critical' });
    }
  };

  const tabs = [
    { id: 'all' as const, label: 'All Authorizations' },
    {
      id: 'pending' as const,
      label: 'Pending Decisions',
      count: approvals.filter((a) => a.status === 'pending').length,
    },
    { id: 'approved' as const, label: 'Authorized' },
    { id: 'rejected' as const, label: 'Declined' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pending Approvals Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Human-in-the-loop safety protocol. Homingo drafts responses and flags utility debits, but never commits without your authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning" size="md" dot>
            {approvals.filter((a) => a.status === 'pending').length} Actions Awaiting Review
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={tabs} activeTab={filter} onChange={(f) => setFilter(f)} />

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((item) => (
          <Card
            key={item.id}
            className={`p-5 transition-all ${
              item.status === 'pending'
                ? 'border-amber-200 shadow-sm dark:border-amber-500/30 dark:bg-slate-900/80'
                : 'opacity-85'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              <div className="space-y-3 flex-1">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      item.urgency === 'critical'
                        ? 'critical'
                        : item.urgency === 'high'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {item.urgency} urgency
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {item.category}
                  </Badge>
                  <Badge
                    variant={
                      item.status === 'approved'
                        ? 'success'
                        : item.status === 'rejected'
                        ? 'critical'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Queued {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {item.title}
                </h3>

                {/* AI Reasoning Pill */}
                <div className="p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 bg-indigo-50/60 border-indigo-200 text-slate-700 dark:bg-slate-950 dark:border-indigo-500/20 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      Reason for Action:
                    </span>{' '}
                    {item.aiReasoning}
                  </div>
                </div>

                {/* Structured Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {item.details.vendor && (
                    <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payee / Account:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.details.vendor}</span>
                    </div>
                  )}
                  {item.details.amount !== undefined && (
                    <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Amount:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {formatCurrency(item.details.amount)}
                      </span>
                    </div>
                  )}
                  {item.details.recipient && (
                    <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recipient:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{item.details.recipient}</span>
                    </div>
                  )}
                  {item.details.scheduledTime && (
                    <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Deadline:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{item.details.scheduledTime}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2 p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Consequence / Impact:</span>
                    <span className="text-slate-800 dark:text-slate-200">{item.details.impactSummary}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0">
                {item.status === 'pending' ? (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setDecisionModal({ item, action: 'approved' })}
                      leftIcon={<Check className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Authorize Action
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setDecisionModal({ item, action: 'rejected' })}
                      leftIcon={<X className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Decline
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Decision Recorded</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {approvals.length === 0 && (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No approval requests in this category. All clear!
          </div>
        )}
      </div>

      {/* Confirmation & Note Modal */}
      {decisionModal && (
        <Modal
          isOpen={true}
          onClose={() => setDecisionModal(null)}
          title={
            decisionModal.action === 'approved'
              ? 'Authorize Action'
              : 'Decline Action'
          }
          description={`Are you sure you want to mark "${decisionModal.item.title}" as ${decisionModal.action}?`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Optional Note / Instructions
              </label>
              <textarea
                rows={3}
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder="Add instruction or context for audit log..."
                className="w-full rounded-xl border p-3 text-xs text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDecisionModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant={decisionModal.action === 'approved' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleCommitDecision}
              >
                Confirm {decisionModal.action === 'approved' ? 'Authorization' : 'Decline'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
