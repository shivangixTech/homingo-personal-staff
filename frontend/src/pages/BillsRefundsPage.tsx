import { useEffect, useState } from 'react';
import {
  Receipt,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { BillItem, RefundItem } from '../types';
import { Card, MetricCard } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const BillsRefundsPage: React.FC = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<BillItem[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinancials() {
      try {
        const [billsData, refundsData] = await Promise.all([
          apiService.getBills(),
          apiService.getRefunds(),
        ]);
        setBills(billsData);
        setRefunds(refundsData);
      } catch (err) {
        console.error('Failed to load financials', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinancials();
  }, []);

  const totalUpcomingBills = bills
    .filter((b) => b.status === 'scheduled')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalRefundsTracked = refunds.reduce((sum, r) => sum + r.claimAmount, 0);

  const handleEscalateRefund = (refundId: string, merchant: string) => {
    toast({
      title: 'Automated Escalation Sent',
      description: `Follow-up inquiry delivered to ${merchant} dispute resolution team.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Household Bills & Autonomous Refunds
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Homingo audits monthly statements for surprise fees, reminds you of utility deadlines, and tracks merchant refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="md" dot>
            Audited via Bank & Utility Feeds
          </Badge>
        </div>
      </div>

      {/* Top Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Upcoming Household Bills"
          value={formatCurrency(totalUpcomingBills)}
          subValue="Due in next 10 days"
          trend={{ direction: 'neutral', text: 'ConEdison due tomorrow' }}
          icon={<CreditCard className="w-4 h-4 text-indigo-500" />}
        />
        <MetricCard
          label="Tracked Refunds & Claims"
          value={formatCurrency(totalRefundsTracked)}
          subValue="3 active claims"
          trend={{ direction: 'up', text: '$19.50 settled' }}
          icon={<RefreshCw className="w-4 h-4 text-emerald-500" />}
        />
        <MetricCard
          label="Rate Audit Protection"
          value="Normal Rates"
          subValue="Zero surprise increases"
          badge={<Badge variant="success" size="sm">Audited</Badge>}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* Two Columns: Upcoming Bills & Tracked Refunds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Bills (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Upcoming Bills & Subscriptions
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {bills.length} Monitored Payees
            </span>
          </div>

          <div className="space-y-3">
            {bills.map((bill) => (
              <Card
                key={bill.id}
                className="p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {bill.merchant}
                      </span>
                      <Badge
                        variant={
                          bill.status === 'paid'
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {bill.status}
                      </Badge>
                      {bill.autoPayEnabled ? (
                        <span className="text-[10px] text-slate-400 font-mono">
                          AutoPay ON
                        </span>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Manual Auth Required
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {bill.serviceCategory} • Due {formatDate(bill.dueDate)}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(bill.amount, bill.currency)}
                    </span>
                    {!bill.autoPayEnabled && bill.status === 'scheduled' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: 'Payment Queued',
                            description: `Authorized $135.20 to ${bill.merchant}.`,
                            type: 'success',
                          })
                        }
                      >
                        1-Click Pay
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {bill.status === 'paid' ? 'Paid on time' : 'Scheduled auto-debit'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Autonomous Refund Disputes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Disputes & Refund Claims
              </h3>
            </div>
            <Badge variant="indigo" size="sm">
              Homingo Active
            </Badge>
          </div>

          <div className="space-y-3">
            {refunds.map((refund) => {
              const isStalled = refund.status === 'under_review';
              return (
                <Card
                  key={refund.id}
                  className={`p-4 space-y-3 ${
                    isStalled ? 'border-amber-200 dark:border-amber-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {refund.merchant}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Tracking: {refund.trackingId}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{formatCurrency(refund.claimAmount, refund.currency)}
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant={
                            refund.status === 'refunded'
                              ? 'success'
                              : refund.status === 'merchant_approved'
                              ? 'indigo'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {refund.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border text-[11px] leading-relaxed bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Dispute Status:
                    </span>{' '}
                    {refund.negotiationStep}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Filed {formatDate(refund.dateInitiated)}</span>
                    {isStalled && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEscalateRefund(refund.id, refund.merchant)}
                        leftIcon={<Send className="w-3 h-3 text-indigo-500" />}
                      >
                        Ping Follow-up
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
