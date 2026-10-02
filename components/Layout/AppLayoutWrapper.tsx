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
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !isAuthenticated && !isLoginPage) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-[#070B14]">{children}</main>;
  }

  // If still checking authentication or unauthenticated, show sleek security gate
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-[#06B6D4] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06B6D4]" />
        <span className="text-xs font-mono text-[#64748B] tracking-wider uppercase">
          Validando sessão VIBE OS...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#070B14]">
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
