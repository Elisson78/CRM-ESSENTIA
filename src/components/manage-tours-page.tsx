"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MapPin,
  Clock,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Home,
  Calendar,
  CalendarDays,
  Users,
  Heart,
  LogOut, Image as ImageIcon,
} from "lucide-react";
import AddTourModal from "./add-tour-modal";

interface Tour {
  id: string;
  name: string;
  location: string;
  price: number;
  duration: number;
  status: string;
  type: string;
  description: string;
  maxPeople?: number;
  languages?: string[];
  includedItems?: string[];
  images?: string[];
  specialRequirements?: string;
}

const mockTours: Tour[] = [
  {
    id: "1",
    name: "City Tour Histórico",
    location: "Centro Histórico",
    price: 150.0,
    duration: 4,
    status: "Ativo",
    type: "Histórico",
  },
  {
    id: "2",
    name: "Aventura na Natureza",
    location: "Parque Nacional",
    price: 280.0,
    duration: 8,
    status: "Ativo",
    type: "Aventura",
  },
  {
    id: "3",
    name: "Tour Gastronômico",
    location: "Distrito Gastronômico",
    price: 200.0,
    duration: 5,
    status: "Ativo",
    type: "Gastronômico",
  },
  {
    id: "4",
    name: "Passeio Cultural",
    location: "Bairro Cultural",
    price: 180.0,
    duration: 6,
    status: "Ativo",
    type: "Cultural",
  },
  {
    id: "5",
    name: "Vida Noturna Premium",
    location: "Centro de Entretenimento",
    price: 250.0,
    duration: 6,
    status: "Ativo",
    type: "Romântico",
  },
  {
    id: "6",
    name: "Tour pelo Centro Histórico",
    location: "Centro Histórico",
    price: 75.0,
    duration: 3,
    status: "Ativo",
    type: "Histórico",
  },
  {
    id: "7",
    name: "Aventura na Floresta",
    location: "Parque Nacional",
    price: 120.0,
    duration: 6,
    status: "Ativo",
    type: "Natureza",
  },
  {
    id: "8",
    name: "Tour Gastronômico",
    location: "Mercado Central",
    price: 95.0,
    duration: 4,
    status: "Ativo",
    type: "Gastronômico",
  },
];

const ActionDropdown: React.FC<{ tour: Tour; onEditTour: (id: string) => void; onDeleteTour: (id: string) => void }> = ({ tour, onEditTour, onDeleteTour }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              onEditTour(tour.id);
              setIsOpen(false);
            }}
          >
            <Edit className="h-4 w-4" /> Editar
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Eye className="h-4 w-4" /> Visualizar
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              onDeleteTour(tour.id);
              setIsOpen(false);
            }}
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        </div>
      )}
    </div>
  );
};

const ManageToursPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [isEditTourModalOpen, setIsEditTourModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState<Tour[]>(mockTours);

  // Carregar passeios ao montar o componente
  useEffect(() => {
    fetchTours();
  }, []);

  // Helper robusto para garantir array de strings
  const safeJsonParse = (value: unknown, fallback: string[] = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) {
      return value.filter(item => typeof item === 'string'); // Garantir apenas strings
    }
    if (typeof value === "object") return fallback;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.filter(item => typeof item === 'string');
        } catch (e) {
          console.warn("Erro ao fazer parse do JSON:", trimmed, e);
        }
      }
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
    return fallback;
  };

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/passeios?t=${Date.now()}`); // Cache busting
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched tours data:", data);
        setTours(
          data.map((tour: any) => ({
            id: tour.id,
            name: tour.nome,
            description: tour.descricao,
            maxPeople: tour.capacidadeMaxima,
            languages: safeJsonParse(tour.idiomas),
            includedItems: safeJsonParse(tour.inclusoes),
            images: safeJsonParse(tour.imagens || tour.images), // Tenta ambos
            specialRequirements: tour.requisitosEspeciais || "",
            // Parse price safely
            price: typeof tour.preco === 'number' ? tour.preco : parseFloat(tour.preco) || 0,
            location: tour.categoria || "Geral",
            duration: parseInt(tour.duracao?.replace("h", "") || "0", 10),
            status: tour.ativo ? "Ativo" : "Inativo",
            type: tour.categoria || "Geral",
          }))
        );
      } else {
        console.error("Erro ao carregar passeios");
      }
    } catch (error) {
      console.error("Erro ao buscar passeios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTour = async (tourData: any) => {
    try {
      const response = await fetch("/api/passeios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        const newTour = await response.json();
        setTours((prevTours) => [
          {
            id: newTour.id,
            name: newTour.nome,
            location: newTour.categoria,
            // Parse price safely to prevent crash
            price: typeof newTour.preco === 'number' ? newTour.preco : parseFloat(newTour.preco) || 0,
            duration: parseInt(newTour.duracao?.replace("h", "") || "0", 10),
            status: newTour.ativo ? "Ativo" : "Inativo",
            type: newTour.categoria,
            description: newTour.descricao,
            maxPeople: newTour.capacidadeMaxima,
            languages: safeJsonParse(newTour.idiomas),
            includedItems: safeJsonParse(newTour.inclusoes),
            images: safeJsonParse(newTour.imagens || newTour.images),
            specialRequirements: newTour.requisitosEspeciais || "",
          },
          ...prevTours,
        ]);
        setIsAddTourModalOpen(false);
      } else {
        console.error("Erro ao criar passeio");
      }
    } catch (error) {
      console.error("Erro ao criar passeio:", error);
    }
  };

  const handleEditTour = async (tourId: string) => {
    try {
      console.log('🔍 Buscando passeio:', tourId);
      const response = await fetch(`/api/passeios/${tourId}`);

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const passeioData = await response.json();
        console.log('✅ Dados do passeio:', passeioData);

        const formattedTour: Tour = {
          id: passeioData.id,
          name: passeioData.nome,
          location: passeioData.categoria,
          price: typeof passeioData.preco === 'number' ? passeioData.preco : parseFloat(passeioData.preco) || 0,
          duration: parseInt(passeioData.duracao?.replace("h", "") || "0", 10),
          status: passeioData.ativo ? "Ativo" : "Inativo",
          type: passeioData.categoria,
          description: passeioData.descricao || "",
          maxPeople: passeioData.capacidadeMaxima || 0,
          languages: safeJsonParse(passeioData.idiomas),
          includedItems: safeJsonParse(passeioData.inclusoes),
          images: safeJsonParse(passeioData.imagens || passeioData.images),
          specialRequirements: passeioData.requisitosEspeciais || "",
        };

        console.log('📝 Tour formatado:', formattedTour);
        setSelectedTour(formattedTour);
        setIsEditTourModalOpen(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erro ao buscar dados do passeio:", response.status, errorData);
        alert(`Erro ao buscar passeio: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar passeio:", error);
      alert(`Erro ao buscar passeio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleUpdateTour = async (tourData: any) => {
    try {
      const response = await fetch(`/api/passeios/${selectedTour?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        setIsEditTourModalOpen(false);
        setSelectedTour(null);
        await fetchTours();
      } else {
        console.error("Erro ao atualizar passeio");
      }
    } catch (error) {
      console.error("Erro ao atualizar passeio:", error);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm("Tem certeza que deseja excluir este passeio?")) return;

    try {
      const response = await fetch(`/api/passeios/${tourId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTours((prev) => prev.filter((t) => t.id !== tourId));
      } else {
        console.error("Erro ao excluir passeio");
        alert("Erro ao excluir passeio");
      }
    } catch (error) {
      console.error("Erro ao excluir passeio:", error);
      alert("Erro ao excluir passeio");
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Gerenciar Passeios
        </h1>
        <p className="text-gray-600 mt-2">
          Adicione, edite e organize todos os passeios oferecidos.
        </p>
      </div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsAddTourModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Passeio
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando passeios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passeio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tours.map((tour) => (
                    <tr key={tour.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {tour.images && tour.images.length > 0 ? (
                              <img
                                src={tour.images[0]}
                                alt={tour.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tour.name}</p>
                            <p className="text-sm text-gray-500">{tour.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{tour.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">
                          R$ {Number(tour.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{tour.duration}h</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            tour.status === "Ativo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {tour.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionDropdown tour={tour} onEditTour={handleEditTour} onDeleteTour={handleDeleteTour} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <AddTourModal
        key="add"
        isOpen={isAddTourModalOpen}
        onClose={() => setIsAddTourModalOpen(false)}
        onSubmit={handleAddTour}
      />
      <AddTourModal
        key={selectedTour?.id || 'edit'}
        isOpen={isEditTourModalOpen && !!selectedTour}
        onClose={() => {
          setIsEditTourModalOpen(false);
          setSelectedTour(null);
        }}
        onSubmit={handleUpdateTour}
        initialData={selectedTour || undefined}
        isEdit={!!selectedTour}
      />
    </div>
  );
};

export default ManageToursPage;
