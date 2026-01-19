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

// Dados mockados dos leads
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Lucas Almeida",
    email: "lucas.almeida@tourguide.com",
    phone: "+55 11 91234-5678",
    origin: "referral",
    status: "converted",
    interests: ["História", "Cultura"],
    type: "lead",
  },
  {
    id: "2",
    name: "Carla Moreira",
    email: "carla.moreira@tourguide.com",
    phone: "+55 21 92345-6789",
    origin: "referral",
    status: "converted",
    interests: ["Gastronomia", "Vinhos"],
    type: "lead",
  },
  {
    id: "3",
    name: "Rafael Santos",
    email: "rafael.santos@tourguide.com",
    phone: "+55 85 93456-7890",
    origin: "website",
    status: "converted",
    interests: ["Aventura", "Natureza"],
    type: "lead",
  },
  {
    id: "4",
    name: "Beatriz Ferreira",
    email: "beatriz.ferreira@tourguide.com",
    phone: "+55 31 94567-8901",
    origin: "referral",
    status: "converted",
    interests: ["História", "Arquitetura"],
    type: "lead",
  },
  {
    id: "5",
    name: "Diego Costa",
    email: "diego.costa@tourguide.com",
    phone: "+55 47 95678-9012",
    origin: "social_media",
    status: "converted",
    interests: ["Cultura", "Gastronomia"],
    type: "lead",
  },
  {
    id: "6",
    name: "Patricia Alves",
    email: "patricia.alves@tourguide.com",
    phone: "+55 11 96789-0123",
    origin: "website",
    status: "converted",
    interests: ["Romântico", "História"],
    type: "lead",
  },
  {
    id: "7",
    name: "Marcos Silva",
    email: "marcos.silva@tourguide.com",
    phone: "+55 21 97890-1234",
    origin: "referral",
    status: "converted",
    interests: ["Aventura", "Esportes"],
    type: "lead",
  },
  {
    id: "8",
    name: "Ana Paula",
    email: "ana.paula@tourguide.com",
    phone: "+55 85 98901-2345",
    origin: "social_media",
    status: "converted",
    interests: ["Cultura", "Arte"],
    type: "lead",
  },
  {
    id: "9",
    name: "Roberto Lima",
    email: "roberto.lima@tourguide.com",
    phone: "+55 31 99012-3456",
    origin: "website",
    status: "converted",
    interests: ["Gastronomia", "História"],
    type: "lead",
  },
  {
    id: "10",
    name: "Fernanda Costa",
    email: "fernanda.costa@tourguide.com",
    phone: "+55 47 90123-4567",
    origin: "referral",
    status: "converted",
    interests: ["Natureza", "Fotografia"],
    type: "lead",
  },
  {
    id: "11",
    name: "Carlos Eduardo",
    email: "carlos.eduardo@tourguide.com",
    phone: "+55 11 91234-5679",
    origin: "website",
    status: "converted",
    interests: ["História", "Arquitetura"],
    type: "lead",
  },
  {
    id: "12",
    name: "Juliana Santos",
    email: "juliana.santos@tourguide.com",
    phone: "+55 21 92345-6780",
    origin: "social_media",
    status: "converted",
    interests: ["Cultura", "Gastronomia"],
    type: "lead",
  },
  {
    id: "13",
    name: "Ricardo Oliveira",
    email: "ricardo.oliveira@tourguide.com",
    phone: "+55 85 93456-7891",
    origin: "referral",
    status: "converted",
    interests: ["Aventura", "Esportes"],
    type: "lead",
  },
  {
    id: "14",
    name: "Mariana Silva",
    email: "mariana.silva@tourguide.com",
    phone: "+55 31 94567-8902",
    origin: "website",
    status: "converted",
    interests: ["Romântico", "História"],
    type: "lead",
  },
  {
    id: "15",
    name: "Thiago Almeida",
    email: "thiago.almeida@tourguide.com",
    phone: "+55 47 95678-9013",
    origin: "social_media",
    status: "converted",
    interests: ["Natureza", "Fotografia"],
    type: "lead",
  },
  {
    id: "16",
    name: "Camila Ferreira",
    email: "camila.ferreira@tourguide.com",
    phone: "+55 11 96789-0124",
    origin: "referral",
    status: "converted",
    interests: ["Gastronomia", "Vinhos"],
    type: "lead",
  },
];

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
  const { user, logout } = useAuth();
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
            id: item.id,
            name: item.nome,
            email: item.email,
            phone: item.telefone || "",
            origin: item.origin || 'website',
            status: item.status || 'novo',
            interests: (() => {
              if (!item.preferencias) return [];
              try {
                if (typeof item.preferencias === 'string') {
                  const pref = item.preferencias.trim();
                  // Apenas parsear se parecer JSON válido (array ou objeto ou string quoted)
                  if (pref.startsWith('[') || pref.startsWith('{') || pref.startsWith('"')) {
                    try {
                      const parsed = JSON.parse(pref);
                      return Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                      // Ignora erro e cai no fallback
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
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calcular métricas
  const totalClients = leads.filter(lead => lead.type === "client").length;
  const totalLeads = leads.filter(lead => lead.type === "lead").length;
  const convertedLeads = leads.filter(lead => lead.status === "converted").length;
  const newLeadsThisMonth = 2; // Mock data

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
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-3 lg:p-5 h-full overflow-auto">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          Gerenciar Clientes & Leads
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Visualize seus clientes ativos e leads em potencial.
        </p>
      </div>

      {/* Barra de busca */}
      <div className="flex justify-end mb-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
                <p className="text-xs font-medium text-gray-600 truncate">Novos Leads (Mês)</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{newLeadsThisMonth}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-100 flex-shrink-0 ml-3">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("clients")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "clients"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Clientes ({totalClients})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "leads"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Leads ({totalLeads})
            </button>
          </nav>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Interesses
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {lead.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lead potencial
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center text-xs text-gray-900">
                          <Mail className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={`${getOriginColor(lead.origin)} text-xs`}
                      >
                        {lead.origin}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(lead.status)} text-xs`}
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
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
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                      <ActionDropdown lead={lead} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
