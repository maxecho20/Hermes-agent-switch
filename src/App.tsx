import { useState, useEffect } from 'react';
import { Sidebar, type NavPage } from './components/layout/Sidebar';
import { ProvidersPage } from './components/providers/ProvidersPage';
import { McpPage } from './components/mcp/McpPage';
import { SkillsPage } from './components/skills/SkillsPage';
import { TerminalPage } from './components/terminal/TerminalPage';
import { MemoryPage } from './components/memory/MemoryPage';
import { ConfigPage } from './components/config/ConfigPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { PlaceholderPage } from './components/common/PlaceholderPage';
import {
  Radio,
  MessageSquare,
} from 'lucide-react';
import './lib/i18n';

function App() {
  const [activePage, setActivePage] = useState<NavPage>('providers');
  const [isDark, setIsDark] = useState(true);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const renderPage = () => {
    switch (activePage) {
      case 'providers':
        return <ProvidersPage />;
      case 'mcp':
        return <McpPage />;
      case 'skills':
        return <SkillsPage />;
      case 'terminal':
        return <TerminalPage />;
      case 'gateway':
        return (
          <PlaceholderPage
            pageKey="gateway"
            icon={<Radio className="w-8 h-8 text-muted-foreground" />}
            description="管理 Telegram / Discord / Slack / WhatsApp / Email / Signal 网关集成"
          />
        );
      case 'sessions':
        return (
          <PlaceholderPage
            pageKey="sessions"
            icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
            description="浏览和搜索 Hermes Agent 的对话历史记录"
          />
        );
      case 'memory':
        return <MemoryPage />;
      case 'config':
        return <ConfigPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ProvidersPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-hidden bg-background">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
