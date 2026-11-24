import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Mail,
  Calendar,
  Receipt,
  CheckCircle2,
  Activity,
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  pendingApprovalsCount?: number;
  onOpenCommandPalette?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'indigo' | 'warning';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  pendingApprovalsCount = 2,
  onOpenCommandPalette,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { profile } = useUser();

  const navItems: NavItem[] = [
    { name: 'Command Centre', path: '/', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/assistant', icon: Sparkles, badge: 'Live', badgeVariant: 'indigo' },
    { name: 'Email Management', path: '/emails', icon: Mail, badge: '2 Priority' },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Bills & Refunds', path: '/bills', icon: Receipt },
    {
      name: 'Approvals',
      path: '/approvals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeVariant: 'warning',
    },
    { name: 'Activity History', path: '/activity', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          'bg-white border-r border-slate-200/90 shadow-sm dark:bg-[#0c101b] dark:border-slate-800/80 dark:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/60">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-white">
                  HOMINGO
                </span>
                <span className="rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-1 py-0.2 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Personal Chief of Staff
              </span>
            </div>
          </NavLink>

          {/* Theme Quick Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Quick Command Trigger */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border transition-all group text-left cursor-pointer bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-slate-100 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">Quick Command</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Personal Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/90 shadow-xs dark:bg-slate-800/90 dark:text-white dark:border-slate-700/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200 border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        )}
                      />
                      <span className="tracking-wide">{item.name}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-mono font-medium border',
                          item.badgeVariant === 'warning'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                            : item.badgeVariant === 'indigo'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Autonomous Agent Health Status */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/60">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-800 dark:text-slate-300">
                  Assistant Active
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                MONITORING
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Watching everyday bills, emails, refunds, and appointments.
            </p>
          </div>
        </div>

        {/* Dynamic User Profile Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/60">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group w-full p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-white">
                {profile.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" /> Personal Tier
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-auto" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};
