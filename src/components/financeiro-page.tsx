"use client";

import React, { useState, useEffect } from "react";
import NovaFaturaModal from "./nova-fatura-modal";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
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
  User,
  TrendingUp,
  Download,
  CreditCard,
  Wallet,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  data: string;
  cliente: string;
  passeio: string;
  guia: string;
  valorTotal: number;
  comissao: number;
  status: string;
  pagamento: string;
}

export interface Fatura {
  id: string;
  fatura_numero: string;
  cliente_nome: string;
  data_emissao: string;
  cotacao_cambio_turismo: number;
  total_eur: number;
  total_brl: number;
  status: string;
  criado_em: string;
}

interface FinancialMetric {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  subtitle?: string;
}

const transactionsData: Transaction[] = [
  {
    id: "1",
    data: "30/08/2025",
    cliente: "N/A",
    passeio: "Aventura na Trilha",
    guia: "Não atribuído",
    valorTotal: 120.00,
    comissao: 36.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "2",
    data: "12/02/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 400.00,
    comissao: 160.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "3",
    data: "08/02/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 840.00,
    comissao: 0.00,
    status: "Cancelado",
    pagamento: "Cancelado"
  },
  {
    id: "4",
    data: "05/02/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 2160.00,
    comissao: 821.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "5",
    data: "02/02/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 1000.00,
    comissao: 300.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "6",
    data: "18/01/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 225.00,
    comissao: 101.25,
    status: "Concluído",
    pagamento: "Pago"
  },
  {
    id: "7",
    data: "28/01/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 1000.00,
    comissao: 300.00,
    status: "Confirmado",
    pagamento: "Confirmado"
  },
  {
    id: "8",
    data: "26/01/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 1440.00,
    comissao: 547.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "9",
    data: "24/01/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 1200.00,
    comissao: 480.00,
    status: "Pendente",
    pagamento: "Pendente"
  },
  {
    id: "10",
    data: "22/01/2025",
    cliente: "N/A",
    passeio: "N/A",
    guia: "Não atribuído",
    valorTotal: 560.00,
    comissao: 168.00,
    status: "Pendente",
    pagamento: "Pendente"
  }
];

const financialMetrics: FinancialMetric[] = [
  {
    title: "Receita Total",
    value: "R$ 15315.00",
    growth: "+12%",
    icon: <DollarSign className="h-6 w-6" />,
    bgColor: "bg-green-50",
    iconColor: "bg-green-500",
  },
  {
    title: "Receita Líquida",
    value: "R$ 13025.35",
    growth: "+8%",
    icon: <CreditCard className="h-6 w-6" />,
    bgColor: "bg-blue-50",
    iconColor: "bg-blue-500",
  },
  {
    title: "Comissões Pagas",
    value: "R$ 2289.65",
    subtitle: "1 guias",
    growth: "",
    icon: <Users className="h-6 w-6" />,
    bgColor: "bg-purple-50",
    iconColor: "bg-purple-500",
  },
  {
    title: "Receita Pendente",
    value: "R$ 3460.00",
    subtitle: "4 agendamentos",
    growth: "",
    icon: <FileText className="h-6 w-6" />,
    bgColor: "bg-orange-50",
    iconColor: "bg-orange-500",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    "Pendente": { color: "bg-yellow-100 text-yellow-800", text: "Pendente" },
    "Cancelado": { color: "bg-red-100 text-red-800", text: "Cancelado" },
    "Concluído": { color: "bg-green-100 text-green-800", text: "Concluído" },
    "Confirmado": { color: "bg-blue-100 text-blue-800", text: "Confirmado" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pendente"];

  return (
    <Badge className={`${config.color} border-0`}>
      {config.text}
    </Badge>
  );
};

const getPagamentoBadge = (pagamento: string) => {
  const pagamentoConfig = {
    "Pendente": { color: "bg-gray-100 text-gray-800", text: "Pendente" },
    "Cancelado": { color: "bg-gray-100 text-gray-800", text: "Cancelado" },
    "Pago": { color: "bg-black text-white", text: "Pago" },
    "Confirmado": { color: "bg-gray-100 text-gray-800", text: "Confirmado" }
  };

  const config = pagamentoConfig[pagamento as keyof typeof pagamentoConfig] || pagamentoConfig["Pendente"];

  return (
    <Badge className={`${config.color} border-0`}>
      {config.text}
    </Badge>
  );
};

const FinancialMetricCard: React.FC<{ metric: FinancialMetric; index: number }> = ({ metric, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className={`${metric.bgColor} border-0 h-full`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-medium text-gray-600 mb-1 truncate">{metric.title}</h3>
            <p className="text-xl font-bold text-gray-900 mb-0.5">{metric.value}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {metric.growth && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-600 font-medium">{metric.growth}</span>
                </div>
              )}
              {metric.subtitle && (
                <span className={`text-xs font-medium ${metric.subtitle.includes("agendamentos")
                  ? "text-orange-600"
                  : "text-purple-600"
                  }`}>
                  {metric.subtitle}
                </span>
              )}
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${metric.iconColor} flex-shrink-0 ml-3`}>
            <div className="text-white">{metric.icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const FinanceiroPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isNovaFaturaOpen, setIsNovaFaturaOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os Status");
  const [monthFilter, setMonthFilter] = useState("Todos os Meses");
  
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaturas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faturas");
      const data = await res.json();
      if (data.success && data.faturas) {
        setFaturas(data.faturas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaturas();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta fatura permanentemente?")) return;
    
    try {
      const res = await fetch(`/api/faturas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchFaturas();
      } else {
        alert("Erro ao excluir: " + data.error);
      }
    } catch (err) {
      alert("Erro ao conectar com servidor.");
    }
  };

  const filteredTransactions = faturas.filter(transaction => {
    const matchesSearch =
      (transaction.fatura_numero || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.cliente_nome || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "Todos os Status" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Gestão Financeira
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Controle completo de receitas, comissões e pagamentos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsNovaFaturaOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white text-sm" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {financialMetrics.map((metric, index) => (
          <FinancialMetricCard key={index} metric={metric} index={index} />
        ))}
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou passeio..."
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

          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              {monthFilter}
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
            <CardTitle className="text-base">Transações Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Nº Fatura</th>
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Data</th>
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Cliente</th>
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Total EUR</th>
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Total BRL</th>
                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-600">Status</th>
                    <th className="text-right py-2 px-4 font-medium text-xs text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Carregando Faturas...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Nenhuma fatura encontrada.</td></tr>
                  ) : (
                  filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{transaction.fatura_numero}</td>
                      <td className="py-2.5 px-4 text-gray-900">{new Date(transaction.data_emissao).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2.5 px-4 text-gray-900">{transaction.cliente_nome || "Sem Nome"}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-purple-600 text-sm">
                          € {Number(transaction.total_eur).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-green-600 text-sm">
                          R$ {Number(transaction.total_brl).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                         <div className="flex justify-end gap-2">
                           <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => window.open(`/fatura/${transaction.id}/imprimir`, '_blank')}>
                             Imprimir
                           </Button>
                           <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500 hover:bg-red-50" onClick={() => handleDelete(transaction.id)}>
                             Excluir
                           </Button>
                         </div>
                      </td>
                    </motion.tr>
                  )))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <NovaFaturaModal
        isOpen={isNovaFaturaOpen}
        onClose={() => setIsNovaFaturaOpen(false)}
        onSuccess={(faturaId) => { 
          fetchFaturas(); // Recarrega a tabela
          window.open(`/fatura/${faturaId}/imprimir`, '_blank'); // Abre a fatura em nova guia
        }}
      />
    </div>
  );
};

export default FinanceiroPage;