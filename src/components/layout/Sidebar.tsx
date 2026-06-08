import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import {
  Layers,
  Network,
  Zap,
  Terminal,
  Radio,
  MessageSquare,
  Brain,
  FileCode,
  Settings,
} from 'lucide-react';

export type NavPage =
  | 'providers'
  | 'mcp'
  | 'skills'
  | 'terminal'
  | 'gateway'
  | 'sessions'
  | 'memory'
  | 'config'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const navItems: { key: NavPage; icon: React.ElementType; section?: string }[] = [
  { key: 'providers', icon: Layers, section: 'core' },
  { key: 'mcp', icon: Network, section: 'core' },
  { key: 'skills', icon: Zap, section: 'core' },
  { key: 'terminal', icon: Terminal, section: 'tools' },
  { key: 'gateway', icon: Radio, section: 'tools' },
  { key: 'sessions', icon: MessageSquare, section: 'data' },
  { key: 'memory', icon: Brain, section: 'data' },
  { key: 'config', icon: FileCode, section: 'advanced' },
  { key: 'settings', icon: Settings, section: 'advanced' },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  const sections = [
    { id: 'core', items: navItems.filter((i) => i.section === 'core') },
    { id: 'tools', items: navItems.filter((i) => i.section === 'tools') },
    { id: 'data', items: navItems.filter((i) => i.section === 'data') },
    { id: 'advanced', items: navItems.filter((i) => i.section === 'advanced') },
  ];

  return (
    <aside className="glass-sidebar w-56 flex flex-col h-full" data-tauri-drag-region>
      {/* Logo / Title */}
      <div className="px-4 py-5 flex items-center gap-3" data-tauri-drag-region>
        <img src="/logo.png" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-primary/10 border border-border/20" alt="Logo" />
        <div>
          <h1 className="text-sm font-bold text-foreground">Hermes Switch</h1>
          <p className="text-[10px] text-muted-foreground">v0.1.5</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-${item.key}`}
                  className={cn('sidebar-item w-full', isActive && 'active')}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{t(`nav.${item.key}`)}</span>
                  {item.key === 'providers' && (
                    <span className="ml-auto badge-primary text-[10px]">
                      Core
                    </span>
                  )}
                </button>
              );
            })}
            {section.id !== 'advanced' && (
              <div className="my-2 border-t border-border/30" />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-3 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span>Hermes Agent</span>
        </div>
      </div>
    </aside>
  );
}
