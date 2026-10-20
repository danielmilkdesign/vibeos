'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../lib/auth-context';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isPublicPage = pathname === '/login' || pathname.startsWith('/acesso');

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPage) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, isPublicPage, router]);

  if (isPublicPage) {
    return <main className="min-h-screen w-full bg-[#080C14] text-slate-100">{children}</main>;
  }

  // If still checking authentication or unauthenticated, show sleek minimal gate
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/[0.08] border-t-cyan-400" />
        <span className="text-xs text-slate-400 tracking-wide">
          Carregando VIBE OS...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080C14] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
