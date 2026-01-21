"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tourData: TourData) => void;
  initialData?: TourData;
  isEdit?: boolean;
}

interface TourData {
  name: string;
  location: string;
  description: string;
  type: string;
  duration: number;
  price: number;
  maxPeople: number;
  languages: string[];
  includedItems: string[];
  images: string[];
  specialRequirements: string;
  status: string;
  tarifa2Pessoas?: number;
  tarifa4Pessoas?: number;
  tarifa6Pessoas?: number;
  tarifa8Pessoas?: number;
  tarifa10Pessoas?: number;
  sobConsultaTexto?: string;
}

export default function AddTourModal({ isOpen, onClose, onSubmit, initialData, isEdit = false }: AddTourModalProps) {
  const { uploadImage, uploading, error, clearError } = useImageUpload();

  const [formData, setFormData] = useState<TourData>(initialData || {
    name: "",
    location: "",
    description: "",
    type: "Cultural",
    duration: 0,
    price: 0,
    maxPeople: 10,
    languages: [],
    includedItems: [],
    images: [],
    specialRequirements: "",
    status: "Ativo",
    tarifa2Pessoas: 0,
    tarifa4Pessoas: 0,
    tarifa6Pessoas: 0,
    tarifa8Pessoas: 0,
    tarifa10Pessoas: 0,
    sobConsultaTexto: "",
  });

  // Atualizar formData quando initialData mudar (modo de edição)
  useEffect(() => {
    console.log('🔄 AddTourModal useEffect:', { isEdit, isOpen, initialData });

    if (initialData && isEdit) {
      console.log('✅ Carregando dados para edição:', initialData);
      setFormData(initialData);
    } else if (!isEdit) {
      // Reset para modo de adição
      console.log('➕ Modo de adição - resetando formulário');
      setFormData({
        name: "",
        location: "",
        description: "",
        type: "Cultural",
        duration: 0,
        price: 0,
        maxPeople: 10,
        languages: [],
        includedItems: [],
        images: [],
        specialRequirements: "",
        status: "Ativo",
      });
    }
  }, [initialData, isEdit, isOpen]);

  const [newLanguage, setNewLanguage] = useState("");
  const [newIncludedItem, setNewIncludedItem] = useState("");
  const [newImage, setNewImage] = useState("");

  const handleInputChange = (field: keyof TourData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addIncludedItem = () => {
    if (newIncludedItem.trim()) {
      setFormData(prev => ({
        ...prev,
        includedItems: [...prev.includedItems, newIncludedItem.trim()]
      }));
      setNewIncludedItem("");
    }
  };

  const removeIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage("");
    }
  };

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Resetar o valor para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  console.log('🎨 Renderizando AddTourModal:', {
    isEdit,
    isOpen,
    hasInitialData: !!initialData,
    formData: formData.name ? `${formData.name} (${formData.price})` : 'VAZIO'
  });

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Editar Passeio" : "Criar Novo Passeio"}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Passeio *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="Cultural">Cultural</option>
                <option value="Aventura">Aventura</option>
                <option value="Gastronômico">Gastronômico</option>
                <option value="Romântico">Romântico</option>
                <option value="Histórico">Histórico</option>
                <option value="Natureza">Natureza</option>
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Duração (horas) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxPeople">Máx. Pessoas</Label>
              <Input
                id="maxPeople"
                type="number"
                value={formData.maxPeople}
                onChange={(e) => handleInputChange("maxPeople", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">Tarifas por Número de Pessoas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tarifa2">Até 2 pessoas (R$)</Label>
                <Input
                  id="tarifa2"
                  type="number"
                  value={formData.tarifa2Pessoas}
                  onChange={(e) => handleInputChange("tarifa2Pessoas", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tarifa4">Até 4 pessoas (R$)</Label>
                <Input
                  id="tarifa4"
                  type="number"
                  value={formData.tarifa4Pessoas}
                  onChange={(e) => handleInputChange("tarifa4Pessoas", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tarifa6">Até 06 pessoas (R$)</Label>
                <Input
                  id="tarifa6"
                  type="number"
                  value={formData.tarifa6Pessoas}
                  onChange={(e) => handleInputChange("tarifa6Pessoas", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tarifa8">Até 08 pessoas (R$)</Label>
                <Input
                  id="tarifa8"
                  type="number"
                  value={formData.tarifa8Pessoas}
                  onChange={(e) => handleInputChange("tarifa8Pessoas", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tarifa10">Até 10 pessoas (R$)</Label>
                <Input
                  id="tarifa10"
                  type="number"
                  value={formData.tarifa10Pessoas}
                  onChange={(e) => handleInputChange("tarifa10Pessoas", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sobConsulta">Sob consulta (Texto explicativo)</Label>
              <Input
                id="sobConsulta"
                placeholder="Ex: Grupos com + de 8 pessoas, menores..."
                value={formData.sobConsultaTexto}
                onChange={(e) => handleInputChange("sobConsultaTexto", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">Idiomas</Label>
              <p className="text-xs text-gray-500 mt-1">Adicione os idiomas disponíveis para este passeio</p>
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Ex: Português"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" onClick={addLanguage} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors">
                  <span className="text-sm font-medium">{lang}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">Itens Inclusos</Label>
              <p className="text-xs text-gray-500 mt-1">Serviços e itens incluídos no passeio</p>
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Ex: Transporte"
                value={newIncludedItem}
                onChange={(e) => setNewIncludedItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIncludedItem())}
              />
              <Button type="button" onClick={addIncludedItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.includedItems.map((item, index) => (
                <div key={index} className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors">
                  <span className="text-sm font-medium">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeIncludedItem(index)}
                    className="text-green-500 hover:text-green-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">Imagens do Passeio</Label>
              <p className="text-xs text-gray-500 mt-1">Faça upload das imagens ou adicione URLs</p>
            </div>

            {/* Upload de arquivo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : 'hover:text-blue-600'}`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-600">
                    {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                  </span>
                  <span className="text-gray-500"> ou arraste uma imagem aqui</span>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG até 5MB</p>
              </label>
            </div>

            {/* Mostrar erro se houver */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* Ou adicionar URL manual */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">ou adicione uma URL</span>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
              />
              <Button type="button" onClick={addImage} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {/* Lista de imagens adicionadas */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Imagens adicionadas:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between hover:bg-purple-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Preview da imagem */}
                        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-sm text-purple-700 truncate font-medium">
                          {image.length > 40 ? `${image.substring(0, 40)}...` : image}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-purple-500 hover:text-purple-700 transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="specialRequirements">Requisitos Especiais</Label>
            <Textarea
              id="specialRequirements"
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Em Manutenção">Em Manutenção</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Salvar Passeio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
