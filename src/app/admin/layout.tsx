"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import AdminMobileNav from '@/components/admin-mobile-nav';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 AdminLayout - Estado:', { loading, user: user?.email, userType: user?.userType });

    if (loading) return;

    if (!user) {
      console.log('❌ AdminLayout - Sem usuário, redirecionando para login');
      router.push('/login?redirect=/admin');
      return;
    }

    if (user.userType !== 'admin') {
      console.log('❌ AdminLayout - Tipo não é admin:', user.userType);
      // Redirecionar para área correta
      if (user.userType === 'guia') {
        router.push('/guia');
      } else if (user.userType === 'cliente') {
        router.push('/cliente');
      } else {
        router.push('/login');
      }
    } else {
      console.log('✅ AdminLayout - Acesso permitido!');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
          <p className="mt-2 text-xs text-gray-400">Aguardando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'admin') {
    console.log('🚫 AdminLayout - Bloqueando acesso:', { user: !!user, userType: user?.userType });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Acesso negado. Redirecionando...</p>
          <p className="text-xs text-gray-400 mt-2">UserType: {user?.userType || 'undefined'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Navegação mobile */}
      <AdminMobileNav
        userName={user?.nome || 'Administrador'}
        userEmail={user?.email || 'admin@turguide.com'}
        userType={user?.userType}
        onLogout={logout}
      />

      {/* Barra lateral */}
      <AdminSidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64 ml-0 overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
