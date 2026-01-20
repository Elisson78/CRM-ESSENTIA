"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Heart,
  Plus,
  MapPin,
  ChevronRight,
  TrendingUp,
  User,
  LogOut,
  Home,
  CalendarDays,
  MapPin as MapPinIcon,
  DollarSign as DollarSignIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminMobileNav from "./admin-mobile-nav";
import AddTourModal from "./add-tour-modal";

// Tipos para os dados
interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  growth: string;
  color: string;
}

interface Task {
  id: string;
  status: string;
  people: number;
  value: number;
  date: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

// Componente para criar cards de métricas dinâmicos
const createMetricCards = (stats: any): MetricCard[] => [
  {
    title: "Total de Agendamentos",
    value: stats.agendamentosMes || 0,
    icon: <Calendar className="h-6 w-6" />,
    growth: "+12% este mês",
    color: "text-blue-600",
  },
  {
    title: "Agendamentos Hoje",
    value: stats.agendamentosHoje || 0,
    icon: <Clock className="h-6 w-6" />,
    growth: "+3 este mês",
    color: "text-orange-600",
  },
  {
    title: "Agendamentos Pendentes",
    value: 4,
    icon: <AlertTriangle className="h-6 w-6" />,
    growth: "+3 este mês",
    color: "text-orange-600",
  },
  {
    title: "Receita Total",
    value: formatCurrency(stats.receitaMes || 0),
    icon: <DollarSign className="h-6 w-6" />,
    growth: "+18% este mês",
    color: "text-green-600",
  },
  {
    title: "Administradores",
    value: stats.totalAdmins || 0,
    icon: <Users className="h-6 w-6" />,
    growth: "+1 este mês",
    color: "text-red-600",
  },
  {
    title: "Guias Ativos",
    value: stats.totalGuias || 0,
    icon: <Users className="h-6 w-6" />,
    growth: "+2 este mês",
    color: "text-blue-600",
  },
  {
    title: "Total de Clientes",
    value: stats.totalClientes || 0,
    icon: <Heart className="h-6 w-6" />,
    growth: "+5 este mês",
    color: "text-green-600",
  },
];

const recentTasks: Task[] = [
  {
    id: "a8b8169c",
    status: "Nova",
    people: 1,
    value: 120.00,
    date: "30/08/2025",
    icon: <Plus className="h-4 w-4" />,
    color: "bg-blue-500",
  },
  {
    id: "5aa33e49",
    status: "Em Progresso",
    people: 2,
    value: 400.00,
    date: "12/02/2025",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-purple-500",
  },
  {
    id: "5aa33e47",
    status: "Atribuída",
    people: 12,
    value: 2160.00,
    date: "05/02/2025",
    icon: <ChevronRight className="h-4 w-4" />,
    color: "bg-yellow-500",
  },
];

const quickActions: QuickAction[] = [
  {
    title: "Nova Tarefa",
    icon: <Plus className="h-4 w-4" />,
    color: "bg-orange-500 hover:bg-orange-600",
    href: "/agendamentos/nova",
  },
  {
    title: "Ver Agendamentos",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-blue-500 hover:bg-blue-600",
    href: "/agendamentos",
  },
  {
    title: "Gerenciar Guias",
    icon: <Users className="h-4 w-4" />,
    color: "bg-gray-500 hover:bg-gray-600",
    href: "/guias",
  },
  {
    title: "Cadastrar Passeio",
    icon: <MapPinIcon className="h-4 w-4" />,
    color: "bg-gray-500 hover:bg-gray-600",
    href: "/passeios/novo",
  },
  {
    title: "Relatório Financeiro",
    icon: <DollarSignIcon className="h-4 w-4" />,
    color: "bg-green-500 hover:bg-green-600",
    href: "/admin/financeiro",
  },
];

// Componente do card de métrica
const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 truncate">{metric.title}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{metric.value}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{metric.growth}</span>
            </p>
          </div>
          <div className={`p-2.5 rounded-lg ${metric.color} bg-opacity-10 flex-shrink-0 ml-3`}>
            <div className={metric.color}>{metric.icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Componente da barra lateral
const Sidebar: React.FC<{ onLogout: () => Promise<void>; user: any }> = ({ onLogout, user }) => (
  <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
    <div className="p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900">TourGuide CRM</h1>
          <p className="text-sm text-gray-600">Administrador</p>
        </div>
      </div>

      {/* Navegação */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Navegação
        </h3>
        <nav className="space-y-2">
          {[
            { icon: Home, label: "Dashboard", active: true, href: "/admin" },
            { icon: Calendar, label: "Agendamentos", href: "/admin/agendamentos" },
            { icon: CalendarDays, label: "Calendário Global", href: "/admin/calendario" },
            { icon: User, label: "Usuários", href: "/admin/usuarios" },
            { icon: Users, label: "Guias", href: "/admin/guias" },
            { icon: Heart, label: "Clientes", href: "/admin/clientes" },
            { icon: MapPinIcon, label: "Passeios", href: "/admin/passeios" },
            { icon: DollarSignIcon, label: "Financeiro", href: "/admin/financeiro" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Perfil do usuário */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.nome?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.nome || 'Usuário'}</p>
            <p className="text-xs text-gray-600">{user?.email || 'email@exemplo.com'}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onLogout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  </div>
);

// Componente principal do dashboard
export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalClientes: 0,
    totalGuias: 0,
    totalAdmins: 0,
    totalPasseios: 0,
    agendamentosHoje: 0,
    agendamentosMes: 0,
    receitaMes: 0
  });

  // Carregar estatísticas do dashboard
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        console.log('Carregando estatísticas do dashboard...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch('/api/dashboard', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const stats = await response.json();
          console.log('Estatísticas carregadas:', stats);
          setDashboardStats(stats);
        } else {
          console.error('Erro na resposta da API:', response.status);
          setDashboardStats({
            totalClientes: 0,
            totalGuias: 0,
            totalAdmins: 0,
            totalPasseios: 0,
            agendamentosHoje: 0,
            agendamentosMes: 0,
            receitaMes: 0
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Timeout ao carregar estatísticas do dashboard');
        } else {
          console.error('Erro ao carregar estatísticas:', error);
        }
        setDashboardStats({
          totalClientes: 0,
          totalGuias: 0,
          totalAdmins: 0,
          totalPasseios: 0,
          agendamentosHoje: 0,
          agendamentosMes: 0,
          receitaMes: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleAddTour = async (tourData: any) => {
    try {
      const response = await fetch('/api/passeios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Passeio criado:', result);
        // Recarregar estatísticas
        window.location.reload();
      } else {
        console.error('Erro ao criar passeio');
      }
    } catch (error) {
      console.error('Erro ao criar passeio:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navegação mobile */}
      <AdminMobileNav
        userName={user?.nome || 'Usuário'}
        userEmail={user?.email || 'email@exemplo.com'}
        onLogout={logout}
      />

      {/* Barra lateral */}
      <Sidebar onLogout={logout} user={user} />

      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64 ml-0">
        <div className="p-4 lg:p-6">
          {/* Cabeçalho */}
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bem-vindo, {user?.nome || 'Usuário'}. Aqui está um resumo do seu negócio.
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </Button>
          </div>

          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando estatísticas...</span>
              </div>
            ) : (
              (() => {
                const cards = createMetricCards(dashboardStats);
                console.log('Cards criados:', cards);
                return cards.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ));
              })()
            )}
          </div>

          {/* Seção inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {/* Tarefas Recentes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-green-600">▲</span>
                  Tarefas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${task.color}`}
                        >
                          <div className="text-white">{task.icon}</div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Tarefa ID: {task.id}
                          </p>
                          <p className="text-xs text-gray-600">
                            {task.people} pessoa(s) • R$ {task.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {task.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{task.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <div key={index}>
                      {action.title === "Cadastrar Passeio" ? (
                        <Button
                          className={`w-full justify-start ${action.color} text-white`}
                          variant="default"
                          onClick={() => setIsAddTourModalOpen(true)}
                        >
                          {action.icon}
                          <span className="ml-2">{action.title}</span>
                        </Button>
                      ) : (
                        <a href={action.href}>
                          <Button
                            className={`w-full justify-start ${action.color} text-white`}
                            variant="default"
                          >
                            {action.icon}
                            <span className="ml-2">{action.title}</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal para adicionar passeio */}
      <AddTourModal
        isOpen={isAddTourModalOpen}
        onClose={() => setIsAddTourModalOpen(false)}
        onSubmit={handleAddTour}
      />
    </div>
  );
};

export default AdminDashboard;
