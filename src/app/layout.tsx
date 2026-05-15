import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/src/context/AuthContext";
import { Layout } from "@/src/components/Layout";
import "@/src/index.css";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "ConnekT",
  description: "Connecting talented students with top companies",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
