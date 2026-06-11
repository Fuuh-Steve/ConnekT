import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/src/i18n/routing";
import { AuthProvider } from "@/src/context/AuthContext";
import { Layout } from "@/src/components/Layout";
import "@/src/index.css";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "ConnekT",
  description: "Connecting talented university students with top tech companies in Cameroon.",
  openGraph: {
    title: "ConnekT | Bridge Campus to Career in Cameroon",
    description: "Connecting talented university students with leading tech companies in Cameroon for internship opportunities and smart talent matching.",
    url: "/",
    siteName: "ConnekT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConnekT Open Graph Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnekT | Bridge Campus to Career in Cameroon",
    description: "Connecting talented university students with leading tech companies in Cameroon for internship opportunities and smart talent matching.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
              try {
                const theme = localStorage.getItem('theme');
                const root = document.documentElement;
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                }
              } catch (error) {
                console.warn('Theme init failed', error);
              }
            })();`}
        </Script>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
          {process.env.NODE_ENV === "development" && <LocalizationDebuggerLoader />}
        </NextIntlClientProvider>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

async function LocalizationDebuggerLoader() {
  const { LocalizationDebugger } = await import("@/src/components/dev/LocalizationDebugger");
  return <LocalizationDebugger />;
}
