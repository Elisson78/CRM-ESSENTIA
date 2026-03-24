"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface NovaFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (faturaId: string) => void;
}

interface FaturaItem {
  id: string;
  servico_descricao: string;
  fornecedor: string;
  valor_eur: number;
}

interface Cliente {
  id: string;
  nome: string;
}

export default function NovaFaturaModal({ isOpen, onClose, onSuccess }: NovaFaturaModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [saving, setSaving] = useState(false);

  const hoje = format(new Date(), "yyyy-MM-dd");

  const [clienteId, setClienteId] = useState("");
  const [faturaNumero, setFaturaNumero] = useState(`FT-${Math.floor(Math.random() * 10000)}`);
  const [dataEmissao, setDataEmissao] = useState(hoje);
  const [dataVencimento, setDataVencimento] = useState(hoje);
  const [cotacaoCambio, setCotacaoCambio] = useState(6.45);
  const [itens, setItens] = useState<FaturaItem[]>([
    { id: (Math.random().toString(36).substring(2, 9) + Date.now().toString(36)), servico_descricao: "", fornecedor: "", valor_eur: 0 }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadClientes();
      // Reset form
      setFaturaNumero(`FT-${Math.floor(Math.random() * 10000)}`);
      setDataEmissao(hoje);
      setDataVencimento(hoje);
      setItens([{ id: (Math.random().toString(36).substring(2, 9) + Date.now().toString(36)), servico_descricao: "", fornecedor: "", valor_eur: 0 }]);
      setClienteId("");
    }
  }, [isOpen, hoje]);

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);
      const res = await fetch("/api/clientes");
      const data = await res.json();
      if (Array.isArray(data)) {
         setClientes(data);
      } else if (data.success && data.clientes) {
         setClientes(data.clientes);
      }
    } catch (error) {
      console.error("Failed to load clientes", error);
      toast.error("Erro ao carregar lista de clientes.");
    } finally {
      setLoadingClientes(false);
    }
  };

  const wrapSetItens = (newItens: FaturaItem[]) => {
    setItens(newItens);
  };

  const handleAddItem = () => {
    wrapSetItens([...itens, { id: (Math.random().toString(36).substring(2, 9) + Date.now().toString(36)), servico_descricao: "", fornecedor: "", valor_eur: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (itens.length === 1) return;
    wrapSetItens(itens.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FaturaItem, value: any) => {
    wrapSetItens(itens.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (itens.some(i => !i.servico_descricao)) {
      toast.error("Preencha a descrição de todos os serviços.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/faturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          fatura_numero: faturaNumero,
          data_emissao: dataEmissao,
          data_vencimento: dataVencimento,
          cotacao_cambio_turismo: cotacaoCambio,
          status: "Pendente",
          itens: itens
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Fatura criada com sucesso!");
        onSuccess(data.fatura_id);
        onClose();
      } else {
        toast.error(data.error || "Erro ao criar fatura.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno ao salvar fatura.");
    } finally {
      setSaving(false);
    }
  };

  const totalEur = itens.reduce((acc, item) => acc + (Number(item.valor_eur) || 0), 0);
  const totalBrl = totalEur * cotacaoCambio;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gerar Nova Fatura (Fattura)</h2>
            <p className="text-sm text-gray-500">Preencha os dados dos serviços para emitir a fatura.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Sessão 1: Dados Gerais */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              Dados Gerais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <select
                  id="cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {loadingClientes ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faturaNumero">Nº da Fatura (Fattura N.) *</Label>
                <Input
                  id="faturaNumero"
                  value={faturaNumero}
                  onChange={(e) => setFaturaNumero(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 group relative">
                <Label htmlFor="cotacao">Taxa Câmbio Turismo (R$ para 1€) *</Label>
                <Input
                  id="cotacao"
                  type="number"
                  step="0.01"
                  value={cotacaoCambio}
                  onChange={(e) => setCotacaoCambio(Number(e.target.value))}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Usado para cálculo final em reais.</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emissao">Data (Emissão) *</Label>
                  <Input
                    id="emissao"
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Vencimento (Due Date) *</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sessão 2: Itens do Serviço */}
          <section className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                Serviços e Planos
              </h3>
              <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-1" /> Add Serviço
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-500 px-1">
                <div className="col-span-6">Descrição do Serviço / Plano</div>
                <div className="col-span-3">Fornecedor (Opcional)</div>
                <div className="col-span-2 text-right">Valor (€)</div>
                <div className="col-span-1"></div>
              </div>

              {itens.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                  <div className="col-span-6">
                    <Input 
                      placeholder="Ex: Transfer de Siena para Firenze..."
                      value={item.servico_descricao}
                      onChange={(e) => handleItemChange(item.id, 'servico_descricao', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      placeholder="Ex: Veículo Privativo / Guia"
                      value={item.fornecedor}
                      onChange={(e) => handleItemChange(item.id, 'fornecedor', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      className="text-right"
                      value={item.valor_eur}
                      onChange={(e) => handleItemChange(item.id, 'valor_eur', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-span-1 flex justify-center mt-2">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={itens.length === 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      title="Remover serviço"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 px-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">€ {totalEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Câmbio ({cotacaoCambio}):</span>
                  <span>x {cotacaoCambio}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>Total a Pagar:</span>
                  <span>R$ {totalBrl.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="border-gray-300">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Salvando..." : "Gerar Fatura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
