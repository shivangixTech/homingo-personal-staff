import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, ChevronRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_DASHBOARD } from '../../data/mockData';

interface TopNavbarProps {
  mobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

const titles: Record<string, string> = {
  '/': 'Command Centre',
  '/assistant': 'AI Assistant',
  '/emails': 'Email Management',
  '/calendar': 'Shop Calendar',
  '/bills': 'Bills & Refunds',
  '/approvals': 'Pending Approvals',
  '/activity': 'Activity History',
  '/settings': 'Settings',
};

export function TopNavbar({ mobileMenuOpen, onOpenMobileMenu, onOpenCommandPalette }: TopNavbarProps) {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [showReminders, setShowReminders] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = titles[pathname] || 'Homingo';

  function closeReminders() {
    setShowReminders(false);
    trigger.current?.focus();
  }

  return (
    <header className="workspace-topbar">
      <div className="workspace-breadcrumb">
        <button id="workspace-menu-button" className="workspace-icon mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} aria-controls="workspace-sidebar" onClick={onOpenMobileMenu}>
          <Menu aria-hidden="true" />
        </button>
        <span className="breadcrumb-label">Workspace</span>
        <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
        {pathname === '/' ? <span className="workspace-page-title">{title}</span> : <h1 className="workspace-page-title">{title}</h1>}
      </div>
      <div className="workspace-controls">
        <button className="workspace-search" type="button" aria-label="Open quick commands" onClick={onOpenCommandPalette}>
          <Search aria-hidden="true" /> <span>Quick commands</span><kbd>⌘ / Ctrl K</kbd>
        </button>
        <button className="workspace-icon" type="button" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
        <div
          className="reminder-control"
          onKeyDown={(event) => { if (event.key === 'Escape' && showReminders) closeReminders(); }}
        >
          <button className="workspace-icon" type="button" ref={trigger} aria-label="Shop reminders" aria-expanded={showReminders} onClick={() => setShowReminders((open) => !open)}>
            <Bell aria-hidden="true" />
          </button>
          {showReminders && (
            <section className="reminder-popover" aria-labelledby="reminders-title">
              <div className="reminder-heading">
                <h2 id="reminders-title">Shop reminders</h2>
                <button className="workspace-icon" type="button" onClick={closeReminders} aria-label="Close reminders"><X aria-hidden="true" /></button>
              </div>
              {MOCK_DASHBOARD.urgentAlerts.map((alert) => (
                <Link key={alert.id} to={alert.actionUrl || '/'} onClick={() => setShowReminders(false)}>
                  <div><strong>{alert.title}</strong><p>{alert.description}</p></div>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </header>
  );
}
