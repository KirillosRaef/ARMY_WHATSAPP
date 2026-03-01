import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
      <Button
        variant={isAr ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 rounded-md px-2.5 text-xs font-medium transition-colors',
          !isAr && 'hover:bg-muted/50'
        )}
        onClick={() => i18n.changeLanguage('ar')}
      >
        عربي
      </Button>
      <Button
        variant={!isAr ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 rounded-md px-2.5 text-xs font-medium transition-colors',
          isAr && 'hover:bg-muted/50'
        )}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </Button>
    </div>
  );
}
