import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CommandPalette } from '../common/CommandPalette';
import { apiService } from '../../services/api';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiService.getApprovals('pending').then((items) => {
      if (active) setPendingApprovalsCount(items.length);
    });
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileMenuOpen(false);
        setCommandPaletteOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setMobileMenuOpen(false);
    }
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [mobileMenuOpen]);

  return (
    <div className="workspace-shell">
      <a className="skip-navigation" href="#workspace-content" inert={mobileMenuOpen}>Skip to content</a>
      <Sidebar
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        pendingApprovalsCount={pendingApprovalsCount}
      />
      <div className="workspace-main" inert={mobileMenuOpen}>
        <TopNavbar
          mobileMenuOpen={mobileMenuOpen}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <main className="workspace-content" id="workspace-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectPrompt={(prompt) => navigate('/assistant', { state: { initialPrompt: prompt } })}
      />
    </div>
  );
}
