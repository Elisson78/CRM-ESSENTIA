"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Star,
  TrendingUp,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  origin: string;
  status: string;
  interests: string[];
  type: "lead" | "client";
}

// Componente do dropdown de ações
const ActionDropdown: React.FC<{ lead: Lead }> = ({ lead }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative dropdown-container">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                console.log("Visualizar lead:", lead.id);
                setIsOpen(false);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                console.log("Editar lead:", lead.id);
                setIsOpen(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                console.log("Excluir lead:", lead.id);
                setIsOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageClientsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"clients" | "leads">("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar clientes do banco
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clientes');
        if (response.ok) {
          const data = await response.json();
          const formattedLeads: Lead[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.nome || "Sem Nome",
            email: item.email || "Sem Email",
            phone: item.telefone || "",
            origin: item.origin || 'website',
            status: item.status || 'novo',
            interests: (() => {
              if (!item.preferencias) return [];
              try {
                if (typeof item.preferencias === 'string') {
                  const pref = item.preferencias.trim();
                  if (pref.startsWith('[') || pref.startsWith('{') || pref.startsWith('"')) {
                    try {
                      const parsed = JSON.parse(pref);
                      return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                      // fallback
                    }
                  }
                  return pref.split(',').map((s: string) => s.trim());
                }
                return Array.isArray(item.preferencias) ? item.preferencias : [item.preferencias];
              } catch {
                return [];
              }
            })(),
            type: (item.type === 'client' || item.type === 'lead') ? item.type : 'lead',
          }));
          setLeads(formattedLeads);
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filtrar leads baseado no termo de busca e aba ativa (Client vs Lead)
  const filteredLeads = leads
    .filter(lead => activeTab === 'clients' ? lead.type === 'client' : lead.type === 'lead')
    .filter(lead =>
      (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calcular métricas
  const totalClients = leads.filter(lead => lead.type === "client").length;
  const totalLeads = leads.filter(lead => lead.type === "lead").length;
  const convertedLeads = leads.filter(lead => lead.status === "converted").length;
  const newLeadsThisMonth = 0; // Mock 

  // Obter origem colorida
  const getOriginColor = (origin: string) => {
    switch (origin) {
      case "referral":
        return "bg-green-100 text-green-800";
      case "website":
        return "bg-blue-100 text-blue-800";
      case "social_media":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obter status colorido
  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "novo":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Gerenciar Clientes & Leads
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize seus clientes ativos e leads em potencial.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total de Clientes</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{totalClients}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-100 flex-shrink-0 ml-3">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total de Leads</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{totalLeads}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-100 flex-shrink-0 ml-3">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Leads Convertidos</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{convertedLeads}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-green-100 flex-shrink-0 ml-3">
                <Star className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Informaçoes</p>
                <p className="text-xl font-bold text-gray-900 mt-1">Geral</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-100 flex-shrink-0 ml-3">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("clients")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "clients"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Clientes ({totalClients})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "leads"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Leads ({totalLeads})
            </button>
          </nav>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interesses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-sm font-medium text-blue-600">
                              {(lead.name || "C").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">{lead.name || "Sem Nome"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center text-xs text-gray-900">
                            <Mail className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{lead.email || "Sem Email"}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={`${getOriginColor(lead.origin)} text-xs border-0`}
                        >
                          {lead.origin}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(lead.status)} text-xs border-0`}
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.interests && lead.interests.length > 0 ? (
                            <>
                              {lead.interests.slice(0, 2).map((interest, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {lead.interests.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{lead.interests.length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionDropdown lead={lead} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
