"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    endereco: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Cliente criado com sucesso!");
        setFormData({ nome: "", email: "", telefone: "", cpf: "", endereco: "" });
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Erro ao criar cliente");
      }
    } catch (error) {
      toast.error("Erro interno do servidor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Novo Cliente</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input 
              value={formData.nome} 
              onChange={e => setFormData({...formData, nome: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
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
            <Label>CPF / CNPJ</Label>
            <Input 
              value={formData.cpf} 
              onChange={e => setFormData({...formData, cpf: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <textarea 
              value={formData.endereco} 
              onChange={e => setFormData({...formData, endereco: e.target.value})} 
              className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
