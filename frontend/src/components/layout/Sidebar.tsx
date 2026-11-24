import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Activity, Calendar, ChevronDown, CircleCheck, LayoutDashboard, Mail, Receipt,
  Settings, Sparkles, Store, X,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  pendingApprovalsCount: number;
}

const navigation = [
  { label: 'Command Centre', to: '/', icon: LayoutDashboard },
  { label: 'AI Assistant', to: '/assistant', icon: Sparkles },
  { label: 'Inbox', to: '/emails', icon: Mail },
  { label: 'Calendar', to: '/calendar', icon: Calendar },
  { label: 'Bills & refunds', to: '/bills', icon: Receipt },
  { label: 'Approvals', to: '/approvals', icon: CircleCheck },
  { label: 'Activity history', to: '/activity', icon: Activity },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onCloseMobile, pendingApprovalsCount }: SidebarProps) {
  const { profile } = useUser();
  const closeButton = useRef<HTMLButtonElement>(null);
  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('');

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  function closeAndRestoreFocus() {
    onCloseMobile();
    requestAnimationFrame(() => document.getElementById('workspace-menu-button')?.focus());
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" aria-hidden="true" onClick={closeAndRestoreFocus} />}
      <aside
        className="workspace-sidebar"
        id="workspace-sidebar"
        data-open={isOpen}
        aria-label="Workspace navigation"
        onKeyDown={(event) => {
          if (isOpen && event.key === 'Escape') closeAndRestoreFocus();
        }}
      >
        <div className="sidebar-brand-row">
          <Link className="workspace-brand" to="/" onClick={onCloseMobile}>
            <span className="workspace-brand-icon"><Store aria-hidden="true" /></span>
            <span>Homingo<span className="brand-period">.</span></span>
          </Link>
          <button className="workspace-icon sidebar-close" type="button" ref={closeButton} aria-label="Close navigation" onClick={closeAndRestoreFocus}>
            <X aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onCloseMobile}>
              <Icon aria-hidden="true" /> <span>{label}</span>
              {to === '/approvals' && pendingApprovalsCount > 0 && (
                <span className="nav-count" aria-label={`${pendingApprovalsCount} pending`}>{pendingApprovalsCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <Link className="sidebar-profile" to="/settings" onClick={onCloseMobile}>
          <span className="workspace-avatar" aria-hidden="true">{initials}</span>
          <span className="workspace-profile-copy"><strong>{profile.name}</strong><span>{profile.company}</span></span>
          <ChevronDown aria-hidden="true" />
        </Link>
      </aside>
    </>
  );
}
