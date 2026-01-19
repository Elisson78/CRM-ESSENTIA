"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarDays,
  Users,
  Heart,
  MapPin,
  DollarSign,
  LogOut,
  Home,
  User,
} from "lucide-react";
import { usePathname } from 'next/navigation';

export const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Calendar, label: "Agendamentos", href: "/admin/agendamentos" },
    { icon: CalendarDays, label: "Calendário Global", href: "/admin/calendario" },
    { icon: User, label: "Usuários", href: "/admin/usuarios", adminOnly: true },
    { icon: Users, label: "Guias", href: "/admin/guias" },
    { icon: Heart, label: "Clientes", href: "/admin/clientes" },
    { icon: MapPin, label: "Passeios", href: "/admin/passeios" },
    { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
  ];

  // Filtrar itens baseado no tipo de usuário
  const filteredNavigationItems = navigationItems.filter(item => {
    // Se o item é apenas para admin, verificar se o usuário é admin
    if (item.adminOnly) {
      return user?.userType === 'admin' || user?.email === 'admin@turguide.com';
    }
    return true;
  });

  return (
    <div className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base text-gray-900 truncate">Essentia CRM</h1>
            <p className="text-xs text-gray-600 truncate">Administrador</p>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Navegação
          </h3>
          <nav className="space-y-1">
            {filteredNavigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil do usuário */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {user?.nome?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome || 'Administrador'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || 'admin@turguide.com'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-center hover:bg-gray-100" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;