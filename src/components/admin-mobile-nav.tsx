"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Home,
  Calendar,
  CalendarDays,
  Users,
  Heart,
  MapPin,
  DollarSign,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
  userName: string;
  userEmail: string;
  userType?: 'admin' | 'guia' | 'cliente';
  onLogout: () => Promise<void>;
}

export const AdminMobileNav: React.FC<MobileNavProps> = ({
  userName,
  userEmail,
  userType,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Calendar, label: "Agendamentos", href: "/admin/agendamentos" },
    { icon: CalendarDays, label: "Calendário Global", href: "/admin/calendario" },
    { icon: User, label: "Usuários", href: "/admin/usuarios", adminOnly: true },
    { icon: Users, label: "Guias", href: "/admin/guias" },
    { icon: Heart, label: "Clientes", href: "/admin/clientes" },
    { icon: MapPin, label: "Passeios", href: "/admin/passeios" },
    { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
    { icon: Settings, label: "Configurações", href: "/admin/configuracoes", adminOnly: true },
  ];

  // Filtrar itens baseado no tipo de usuário
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.adminOnly) {
      return userType === 'admin' || userEmail === 'admin@turguide.com';
    }
    return true;
  });

  return (
    <>
      {/* Botão do menu mobile */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay do menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">
                    Essentia CRM
                  </h1>
                  <p className="text-sm text-gray-600">Administrador</p>
                </div>
              </div>

              {/* Navegação */}
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Navegação
                </h3>
                <nav className="space-y-2">
                  {filteredNavigationItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Perfil do usuário */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-600">{userEmail}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    void onLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminMobileNav;

