import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import AppLayoutWrapper from '../components/Layout/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'VIBE OS — Sistema Comercial, Operacional & CRM',
  description: 'Sistema Operacional Comercial da VIBE Design Tech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col font-sans">
        <AuthProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
