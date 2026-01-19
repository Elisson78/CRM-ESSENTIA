"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar, MapPin, Phone, Mail } from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login?redirect=/cliente');
      return;
    }

    if (user.userType !== 'cliente') {
      if (user.userType === 'admin') {
        router.push('/admin');
      } else if (user.userType === 'guia') {
        router.push('/guia');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'cliente') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Área do Cliente</h1>
              <p className="text-gray-600">Bem-vindo, {user?.nome || 'Cliente'}</p>
            </div>
            <Button onClick={logout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meu Perfil
              </CardTitle>
              <CardDescription>
                Informações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user.telefone}</span>
                  </div>
                )}
                {user?.endereco && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user.endereco}</span>
                  </div>
                )}
                {user?.data_nascimento && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(user.data_nascimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximos Passeios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meus Passeios
              </CardTitle>
              <CardDescription>
                Passeios agendados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Você ainda não possui passeios agendados</p>
                <Button>
                  Explorar Passeios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo à ESSENTIA TRAVEL!</CardTitle>
              <CardDescription>
                Sua plataforma de turismo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Descubra Lugares</h3>
                  <p className="text-sm text-gray-600">
                    Explore destinos incríveis com nossos guias especializados
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Guias Qualificados</h3>
                  <p className="text-sm text-gray-600">
                    Nossos guias são profissionais experientes e certificados
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Agendamento Fácil</h3>
                  <p className="text-sm text-gray-600">
                    Agende seus passeios de forma simples e rápida
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
