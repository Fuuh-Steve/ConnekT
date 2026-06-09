'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useRouter, usePathname } from '../i18n/navigation';
import { Globe } from 'lucide-react';

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === 'en' ? 'fr' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={locale === 'en' ? 'Switch to French' : 'Passer en anglais'}
      className="p-3 bg-[rgb(var(--bg-side))] rounded-2xl border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] hover:border-[rgb(var(--accent))]/50 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
    >
      <Globe className="w-5 h-5" />
      <span>{locale === 'en' ? 'FR' : 'EN'}</span>
    </button>
  );
};
