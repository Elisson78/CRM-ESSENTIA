"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface AddGuiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGuiaModal({ isOpen, onClose, onSuccess }: AddGuiaModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    especialidades: "",
    idiomas: "",
    biografia: "",
    percentual_comissao: 10,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Formatar arrays
      const payload = {
        ...formData,
        especialidades: formData.especialidades.split(',').map(s => s.trim()).filter(s => s),
        idiomas: formData.idiomas.split(',').map(s => s.trim()).filter(s => s),
        percentual_comissao: Number(formData.percentual_comissao)
      };

      const res = await fetch("/api/guias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Guia cadastrado com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Erro ao cadastrar guia");
      }
    } catch (error) {
      console.error("Erro ao cadastrar guia:", error);
      toast.error("Erro interno do servidor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Novo Guia</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input 
                value={formData.telefone} 
                onChange={e => setFormData({...formData, telefone: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input 
                value={formData.cpf} 
                onChange={e => setFormData({...formData, cpf: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidades (separadas por vírgula)</Label>
              <Input 
                placeholder="História, Gastronomia, Natureza"
                value={formData.especialidades} 
                onChange={e => setFormData({...formData, especialidades: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Idiomas (separados por vírgula)</Label>
              <Input 
                placeholder="Português, Inglês, Espanhol"
                value={formData.idiomas} 
                onChange={e => setFormData({...formData, idiomas: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input 
                type="number"
                value={formData.percentual_comissao} 
                onChange={e => setFormData({...formData, percentual_comissao: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label>Biografia / Observações</Label>
            <textarea 
              value={formData.biografia} 
              onChange={e => setFormData({...formData, biografia: e.target.value})} 
              className="w-full flex min-h-[100px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Cadastrar Guia
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
