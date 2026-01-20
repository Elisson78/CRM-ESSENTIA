"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronDown,
  MapPin,
  Home,
  Calendar,
  CalendarDays,
  Users,
  Heart,
  DollarSign,
  LogOut,
  TrendingUp,
  Download,
  Plus,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Guia {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  idiomas: string[];
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  passeiosRealizados: number;
  comissaoTotal: number;
  status: "Ativo" | "Inativo" | "Pendente";
  dataRegistro: string;
  proximoPasseio?: string;
}

interface GuiaMetric {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  subtitle?: string;
}

// Dados serão carregados via tRPC do SQLite

const guiaMetrics: GuiaMetric[] = [
  {
    title: "Total de Guias",
    value: "6",
    growth: "+2 este mês",
    icon: <Users className="h-6 w-6" />,
    bgColor: "bg-blue-50",
    iconColor: "bg-blue-500",
  },
  {
    title: "Guias Ativos",
    value: "4",
    growth: "67% taxa de atividade",
    icon: <UserCheck className="h-6 w-6" />,
    bgColor: "bg-green-50",
    iconColor: "bg-green-500",
  },
  {
    title: "Avaliação Média",
    value: "4.8",
    subtitle: "673 avaliações totais",
    growth: "",
    icon: <Star className="h-6 w-6" />,
    bgColor: "bg-yellow-50",
    iconColor: "bg-yellow-500",
  },
  {
    title: "Comissões Pagas",
    value: "R$ 66.280",
    subtitle: "Este mês",
    growth: "",
    icon: <DollarSign className="h-6 w-6" />,
    bgColor: "bg-purple-50",
    iconColor: "bg-purple-500",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    "Ativo": { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
    "Inativo": { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
    "Pendente": { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pendente"];

  return (
    <Badge className={`${config.color} border-0 flex items-center gap-1`}>
      {config.icon}
      {status}
    </Badge>
  );
};

const GuiaMetricCard: React.FC<{ metric: GuiaMetric; index: number }> = ({ metric, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className={`${metric.bgColor} border-0 h-full`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <div className="flex items-center gap-2">
              {metric.growth && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{metric.growth}</span>
                </div>
              )}
              {metric.subtitle && (
                <span className="text-sm text-gray-600 font-medium">
                  {metric.subtitle}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${metric.iconColor}`}>
            <div className="text-white">{metric.icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Sidebar: React.FC<{ user: any; onLogout: () => Promise<void> }> = ({ user, onLogout }) => (
  <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
    <div className="p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900">TourGuide CRM</h1>
          <p className="text-sm text-gray-600">Administrador</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          NAVEGAÇÃO
        </h3>
        <nav className="space-y-2">
          {[
            { icon: Home, label: "Dashboard", href: "/admin" },
            { icon: Calendar, label: "Agendamentos", href: "/admin/agendamentos" },
            { icon: CalendarDays, label: "Calendário Global", href: "/admin/calendario" },
            { icon: Users, label: "Guias", href: "/admin/guias", active: true },
            { icon: Heart, label: "Clientes", href: "/admin/clientes" },
            { icon: MapPin, label: "Passeios", href: "/admin/passeios" },
            { icon: DollarSign, label: "Financeiro", href: "/admin/financeiro" },
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

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.nome?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.nome || 'Administrador'}</p>
            <p className="text-xs text-gray-600">{user?.email || 'admin@turguide.com'}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  </div>
);

const GuiasPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os Status");
  const [guiasData, setGuiasData] = useState<Guia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar guias da API
  useEffect(() => {
    const fetchGuias = async () => {
      try {
        const response = await fetch('/api/guias');
        if (response.ok) {
          const data = await response.json();
          const formattedGuias: Guia[] = data.map((guia: any) => {
            // Função para tratar especialidades e idiomas
            const parseArrayField = (field: any): string[] => {
              if (!field) return [];
              if (Array.isArray(field)) return field;
              if (typeof field === 'string') {
                try {
                  // Tenta fazer parse JSON primeiro
                  const parsed = JSON.parse(field);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  // Se não for JSON válido, trata como string simples
                  return field.split(',').map(item => item.trim()).filter(item => item);
                }
              }
              return [];
            };

            return {
              id: guia.id,
              nome: guia.nome,
              email: guia.email,
              telefone: guia.telefone,
              especialidades: parseArrayField(guia.especialidades),
              idiomas: parseArrayField(guia.idiomas),
              avaliacaoMedia: guia.avaliacao_media || 0,
              totalAvaliacoes: guia.total_avaliacoes || 0,
              passeiosRealizados: guia.passeios_realizados || 0,
              comissaoTotal: guia.comissao_total || 0,
              status: guia.status === "ativo" ? "Ativo" : "Inativo",
              dataRegistro: guia.criado_em,
              proximoPasseio: guia.proximo_passeio
            };
          });
          setGuiasData(formattedGuias);
        }
      } catch (error) {
        console.error('Erro ao carregar guias:', error);
        toast.error('Erro ao carregar guias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuias();
  }, []);

  const filteredGuias = guiasData.filter(guia => {
    const matchesSearch =
      guia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guia.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guia.especialidades && Array.isArray(guia.especialidades) &&
        guia.especialidades.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === "Todos os Status" || guia.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 ml-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando guias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Gestão de Guias
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie sua equipe de guias turísticos e acompanhe performance.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Lista
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Guia
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {guiaMetrics.map((metric, index) => (
              <GuiaMetricCard key={index} metric={metric} index={index} />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou especialidade..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  {statusFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lista de Guias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Nome</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Contato</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Especialidades</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Avaliação</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Passeios</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Comissão</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Status</th>
                        <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Próximo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuias.map((guia, index) => (
                        <motion.tr
                          key={guia.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{guia.nome}</p>
                              <p className="text-xs text-gray-600">{Array.isArray(guia.idiomas) ? guia.idiomas.join(", ") : guia.idiomas || "N/A"}</p>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600 truncate">{guia.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-600">{guia.telefone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(guia.especialidades) ? (
                                <>
                                  {guia.especialidades.slice(0, 2).map((esp, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {esp}
                                    </Badge>
                                  ))}
                                  {guia.especialidades.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{guia.especialidades.length - 2}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {guia.especialidades || "N/A"}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current flex-shrink-0" />
                              <span className="font-medium text-sm text-gray-900">
                                {guia.avaliacaoMedia > 0 ? guia.avaliacaoMedia.toFixed(1) : "-"}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({guia.totalAvaliacoes})
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-sm text-gray-900">
                              {guia.passeiosRealizados}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-sm text-green-600">
                              R$ {guia.comissaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {getStatusBadge(guia.status)}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="text-xs text-gray-600">
                              {guia.proximoPasseio || "-"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GuiasPage;