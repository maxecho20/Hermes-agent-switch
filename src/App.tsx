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
import { OnboardingPage } from './components/onboarding/OnboardingPage';
import { InstallPage } from './components/onboarding/InstallPage';
import { SetupWizard } from './components/onboarding/SetupWizard';
import {
  Radio,
  MessageSquare,
} from 'lucide-react';
import './lib/i18n';
import { api } from './lib/api';

// Application flow states
type AppScreen =
  | 'loading'       // Initial check
  | 'onboarding'    // First-time: hermes not installed
  | 'install'       // Running the installation
  | 'setup-wizard'  // Post-install: configure provider
  | 'main';         // Normal operation

function App() {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [activePage, setActivePage] = useState<NavPage>('providers');

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // On mount: detect hermes installation state
  useEffect(() => {
    (async () => {
      try {
        const status = await api.checkHermesInstallation();
        if (!status.cli_available && !status.installed) {
          // hermes not found at all
          setScreen('onboarding');
        } else if (!status.has_config) {
          // hermes is installed but not configured → setup wizard
          setScreen('setup-wizard');
        } else {
          // Fully set up → main app
          setScreen('main');
        }
      } catch {
        // On error, show main app (fallback)
        setScreen('main');
      }
    })();

    // Listen for install navigation event from OnboardingPage
    const handler = () => setScreen('install');
    window.addEventListener('navigate-to-install', handler);
    return () => window.removeEventListener('navigate-to-install', handler);
  }, []);

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

  // Loading screen
  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">正在初始化...</p>
        </div>
      </div>
    );
  }

  // Onboarding: hermes not installed
  if (screen === 'onboarding') {
    return (
      <div className="h-screen w-screen bg-background">
        <OnboardingPage
          onInstalled={() => setScreen('setup-wizard')}
        />
      </div>
    );
  }

  // Install screen
  if (screen === 'install') {
    return (
      <div className="h-screen w-screen bg-background">
        <InstallPage
          onSuccess={() => setScreen('setup-wizard')}
          onBack={() => setScreen('onboarding')}
        />
      </div>
    );
  }

  // Setup wizard: post-install or first-config
  if (screen === 'setup-wizard') {
    return (
      <div className="h-screen w-screen bg-background">
        <SetupWizard
          onComplete={() => setScreen('main')}
        />
      </div>
    );
  }

  // Main app
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
