import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  LayoutDashboard,
  Mail,
  Calendar,
  Receipt,
  CheckCircle2,
  Activity,
  Settings,
  Sun,
  Moon,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'ai-emails',
      label: 'Check my important emails',
      category: 'AI Assistant',
      icon: <Mail className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onClose();
        if (onSelectPrompt) {
          onSelectPrompt('Check my important emails');
        } else {
          navigate('/assistant');
        }
      },
    },
    {
      id: 'ai-refunds',
      label: 'Find my pending refunds',
      category: 'AI Assistant',
      icon: <Receipt className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onClose();
        if (onSelectPrompt) {
          onSelectPrompt('Find my pending refunds');
        } else {
          navigate('/assistant');
        }
      },
    },
    {
      id: 'ai-schedule',
      label: 'Organise my schedule for tomorrow',
      category: 'AI Assistant',
      icon: <Calendar className="w-4 h-4 text-amber-500" />,
      action: () => {
        onClose();
        if (onSelectPrompt) {
          onSelectPrompt('Organise my schedule for tomorrow');
        } else {
          navigate('/assistant');
        }
      },
    },
    {
      id: 'ai-bills',
      label: 'Remind me about upcoming bills',
      category: 'AI Assistant',
      icon: <Receipt className="w-4 h-4 text-rose-500" />,
      action: () => {
        onClose();
        if (onSelectPrompt) {
          onSelectPrompt('Remind me about upcoming bills');
        } else {
          navigate('/assistant');
        }
      },
    },
    {
      id: 'nav-dash',
      label: 'Go to Personal Command Centre',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-slate-500" />,
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'nav-approvals',
      label: 'View Pending Approvals (2 actions)',
      category: 'Navigation',
      icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />,
      action: () => {
        navigate('/approvals');
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
      action: () => {
        toggleTheme();
        toast({ title: `Switched to ${isDark ? 'Light' : 'Dark'} Mode`, type: 'info' });
        onClose();
      },
    },
  ];

  const filtered = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    if (onSelectPrompt) {
      onSelectPrompt(query);
    } else {
      navigate('/assistant');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleCustomSubmit} className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or ask Homingo anything (e.g. 'Pay ConEd', 'Delta refund')..."
            className="w-full py-4 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {query.trim().length > 0 && (
            <button
              onClick={handleCustomSubmit}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium">Ask Homingo: "{query}"</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}

          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <span className="text-xs font-medium block">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          {filtered.length === 0 && query.trim().length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching actions. Press Enter to ask Homingo.
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Navigate with ↑ ↓ • Select with ↵</span>
          <span>ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
