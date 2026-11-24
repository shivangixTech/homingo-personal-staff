import { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Link2,
  Sliders,
  Check,
  Mail,
  MessageSquare,
  CreditCard,
  BookOpen,
  Code2,
  FileCode,
  Sun,
  Moon,
  Globe,
  Lock,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { UserProfile, ConnectedAccount, AutonomousPermissions } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { formatCurrency } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, detectedTimezone } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [permissions, setPermissions] = useState<AutonomousPermissions | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'accounts' | 'permissions' | 'security'>('profile');
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [accData, permData] = await Promise.all([
          apiService.getConnectedAccounts(),
          apiService.getPermissions(),
        ]);
        setAccounts(accData);
        setPermissions(permData);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggleAccount = async (id: string) => {
    try {
      const updated = await apiService.toggleAccountConnection(id);
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast({
        title: updated.connected ? 'Account Connected' : 'Account Disconnected',
        description: updated.name,
        type: updated.connected ? 'success' : 'info',
      });
    } catch (err) {
      console.error('Failed to toggle account', err);
      toast({ title: 'Error toggling account', type: 'critical' });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateProfile(formData);
      await apiService.updateUserProfile(formData);
      setIsSaved(true);
      toast({
        title: 'Profile Updated',
        description: `Preferences saved for ${formData.name}.`,
        type: 'success',
      });
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile', err);
      toast({ title: 'Failed to save', type: 'critical' });
    }
  };

  const handleUpdatePermission = async (key: keyof AutonomousPermissions, val: any) => {
    if (!permissions) return;
    const updated = { ...permissions, [key]: val };
    setPermissions(updated);
    await apiService.updatePermissions(updated);
    toast({
      title: 'Autonomous Boundary Updated',
      description: `Configured ${String(key)}.`,
      type: 'info',
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-indigo-500" />;
      case 'notion':
        return <BookOpen className="w-5 h-5 text-slate-700 dark:text-slate-200" />;
      case 'github':
        return <Code2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Link2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Personal Profile', icon: <User className="w-3.5 h-3.5" /> },
    {
      id: 'accounts' as const,
      label: 'Connected Accounts',
      icon: <Link2 className="w-3.5 h-3.5" />,
      count: accounts.filter((a) => a.connected).length,
    },
    { id: 'permissions' as const, label: 'Safety & Boundaries', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'security' as const, label: 'Security & Theme', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  if (loading || !permissions) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Settings & Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalize your assistant's tone, adjust autonomous spending limits, and manage connected household accounts.
          </p>
        </div>

        {isSaved && (
          <Badge variant="success" size="md">
            <Check className="w-3.5 h-3.5 mr-1" /> Preferences Saved
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t)} />

      {/* 1. Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-3xl">
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <img
                src={formData.avatarUrl}
                alt={formData.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {formData.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formData.email}</p>
                <Badge variant="indigo" size="sm" className="mt-1">
                  Personal Assistant Active
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Role / Description
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Timezone (Auto-detected)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-slate-900 dark:text-white bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, timezone: detectedTimezone })}
                    className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 text-slate-600 dark:text-slate-300"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Communication Tone Setting */}
            <div className="pt-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                Assistant Response Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(['concise', 'formal', 'detailed', 'conversational'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setFormData({ ...formData, executiveTone: tone })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.executiveTone === tone
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-600/15 dark:border-indigo-500/60 dark:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="capitalize font-semibold text-xs block">
                      {tone}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {tone === 'concise' && 'Action-oriented bullets'}
                      {tone === 'formal' && 'Polished & respectful'}
                      {tone === 'detailed' && 'Comprehensive context'}
                      {tone === 'conversational' && 'Warm & personal'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Save Personal Profile
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* 2. Connected Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4 max-w-3xl">
          <div className="space-y-3">
            {accounts.map((acc) => (
              <Card key={acc.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                    {getProviderIcon(acc.provider)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {acc.name}
                      </h4>
                      <Badge variant={acc.connected ? 'success' : 'neutral'} size="sm">
                        {acc.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Scopes: {acc.scopes.join(', ')}
                    </p>
                  </div>
                </div>

                <Button
                  variant={acc.connected ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleAccount(acc.id)}
                >
                  {acc.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. Safety & Autonomous Boundaries Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4 max-w-3xl">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Autonomous Safety Thresholds
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define the rules under which Homingo AI can act without explicit human approval.
              </p>
            </div>

            {/* Threshold Slider: Auto-approve spend */}
            <div className="space-y-2 p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Auto-Approve Recurring Expenses Under:
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Any charge exceeding this limit will trigger an approval card.
                  </span>
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCurrency(permissions.autoApproveExpensesUnder)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={permissions.autoApproveExpensesUnder}
                onChange={(e) =>
                  handleUpdatePermission('autoApproveExpensesUnder', Number(e.target.value))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rs 0 (Always require 1-click approval)</span>
                <span>Rs 5,000</span>
                <span>Rs 10,000</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Require Confirmation for Shop & Customer Emails
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Drafts are prepared automatically, but never dispatched without your sign-off.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.requireApprovalForExternalEmails}
                  onChange={(e) =>
                    handleUpdatePermission('requireApprovalForExternalEmails', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Protect 20-min Transit Buffers Around Appointments
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically block transit windows to avoid schedule rushes.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowAutoRescheduleMeetings}
                  onChange={(e) =>
                    handleUpdatePermission('allowAutoRescheduleMeetings', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Security & Theme Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4 max-w-3xl">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Visual Theme Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose between Dark Midnight or Warm Light theme.
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={toggleTheme}
                leftIcon={isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              >
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </Button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Zero API Keys Exposed</span>
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Client frontend never stores provider secrets. All AI and integration credentials reside on the secure backend service.
                </p>
              </div>

              <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Backend Integration Contract</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                    docs/API_CONTRACT.md
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Frontend service adapter uses clean replaceable design. Toggle <code className="font-mono text-slate-800 dark:text-slate-200">VITE_USE_BACKEND=true</code> to switch to live server.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
