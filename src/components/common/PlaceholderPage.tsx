import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  pageKey: string;
  icon: React.ReactNode;
  description: string;
}

export function PlaceholderPage({ pageKey, icon, description }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t(`nav.${pageKey}`)}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
          <Construction className="w-3.5 h-3.5" />
          <span>开发中 — Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
