import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleMobileMenu,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentTimeFormatted, detectedTimezone } = useUser();

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    switch (pathname) {
      case '/':
        return {
          title: 'Command Centre',
          subtitle: 'Everyday responsibilities, schedule & smart insights',
        };
      case '/assistant':
        return {
          title: 'AI Assistant',
          subtitle: 'Conversational workspace with tool execution & reasoning',
        };
      case '/emails':
        return {
          title: 'Email Management',
          subtitle: 'Autonomous personal inbox triage & response drafting',
        };
      case '/calendar':
        return {
          title: 'Personal Calendar',
          subtitle: 'Protected transit buffers, appointments & daily agenda',
        };
      case '/bills':
        return {
          title: 'Bills & Refunds',
          subtitle: 'Household spend monitoring & autonomous dispute recovery',
        };
      case '/approvals':
        return {
          title: 'Pending Approvals',
          subtitle: 'Human-in-the-loop authorization queue for bills & emails',
        };
      case '/activity':
        return {
          title: 'Activity History',
          subtitle: 'Transparent audit log of autonomous and guided tasks',
        };
      case '/settings':
        return {
          title: 'Settings & Policy',
          subtitle: 'Personalization, connected accounts & safety boundaries',
        };
      default:
        return { title: 'HOMINGO AI', subtitle: 'Personal Chief of Staff' };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  const personalNotifications = [
    {
      id: 'notif_coned',
      type: 'warning',
      title: 'Electricity Bill Due Tomorrow',
      desc: 'ConEdison bill ($135.20) requires 1-click payment authorization.',
      time: '1h ago',
      link: '/approvals',
    },
    {
      id: 'notif_delta',
      type: 'info',
      title: 'Delta Refund Follow-up',
      desc: 'Dispute stalled for 7 days. Homingo prepared escalation note.',
      time: '3h ago',
      link: '/bills',
    },
    {
      id: 'notif_doctor',
      type: 'calendar',
      title: 'Metro Dental at 4:00 PM',
      desc: '25-min transit buffer starting at 3:35 PM is protected.',
      time: 'Today',
      link: '/calendar',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 backdrop-blur-xl transition-colors bg-white/85 border-slate-200/90 dark:bg-[#090d16]/85 dark:border-slate-800/80">
      {/* Left: Mobile trigger & Page Info */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="lg:hidden text-slate-600 dark:text-slate-400"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <Badge variant="indigo" size="sm" className="hidden sm:inline-flex">
              Live
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Command Bar, Clock, Theme Toggle, Notification Bell */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search / Command Palette Pill */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700 shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Ask Homingo anything...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Live Detected Time & Timezone */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800/80 dark:text-slate-400">
          <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
          <span>{currentTimeFormatted}</span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl border text-slate-600 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950" />
          </Button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Important Insights
                  </h4>
                  <Badge variant="indigo" size="sm">
                    3 Active
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {personalNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to={notif.link}
                    onClick={() => setShowNotifications(false)}
                    className="block p-2.5 rounded-xl border transition-colors bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-700/40"
                  >
                    <div className="flex items-start gap-2.5">
                      {notif.type === 'warning' && (
                        <div className="p-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.type === 'info' && (
                        <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {notif.type === 'calendar' && (
                        <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          {notif.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-3 pt-2 text-center border-t border-slate-200 dark:border-slate-800">
                <Link
                  to="/activity"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View full activity history →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
