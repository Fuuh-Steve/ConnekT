import type { Metadata } from "next";
import { AuthProvider } from "@/src/context/AuthContext";
import { Layout } from "@/src/components/Layout";
import "@/src/index.css";

export const metadata: Metadata = {
  title: "ConnekT",
  description: "Connecting talented students with top companies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
