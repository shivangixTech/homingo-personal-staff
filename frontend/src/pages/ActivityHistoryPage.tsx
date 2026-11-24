import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Search,
  Bot,
  User,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ActivityLogItem } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { formatRelativeTime } from '../utils/formatters';

export const ActivityHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await apiService.getActivityLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load activity logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const tabs = [
    { id: 'all' as const, label: 'All Executions', count: logs.length },
    {
      id: 'completed' as const,
      label: 'Completed Successfully',
      count: logs.filter((l) => l.status === 'completed').length,
    },
    {
      id: 'failed' as const,
      label: 'Failures & Errors',
      count: logs.filter((l) => l.status === 'failed').length,
    },
  ];

  const filteredLogs = logs.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.toolUsed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Activity History & Audit Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete, transparent record of actions performed by Homingo across your personal inbox, calendar, and household utility accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="md" dot>
            Verified Ledger
          </Badge>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Tabs tabs={tabs} activeTab={filterStatus} onChange={(s) => setFilterStatus(s)} />

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tool or task..."
            className="w-full rounded-xl border pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Audit List */}
      <div className="space-y-3">
        {filteredLogs.map((item) => (
          <Card key={item.id} className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {/* Status Icon */}
                <div className="mt-1 shrink-0">
                  {item.status === 'completed' && (
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'in_progress' && (
                    <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
                      <Clock className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'failed'
                          ? 'critical'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                      <Terminal className="w-3 h-3 text-indigo-500" />
                      {item.toolUsed}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {item.actor === 'Autonomous Agent' ? (
                        <Bot className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <User className="w-3 h-3 text-indigo-500" />
                      )}
                      {item.actor}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">
                      Duration: {item.durationFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No audit logs found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};
