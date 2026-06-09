import { setRequestLocale } from 'next-intl/server';
import { AuthPage } from '@/src/views/AuthPage';

export default async function AuthRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AuthPage />;
}
