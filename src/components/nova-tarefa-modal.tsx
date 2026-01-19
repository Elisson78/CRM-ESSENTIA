"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CalendarDays, User, MapPin, DollarSign, Users, X } from "lucide-react";

import type { NovaTarefaData, Passeio, Cliente, Guia } from "@/types/agendamentos";

interface NovaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NovaTarefaData) => Promise<void> | void;
  passeios: Passeio[];
  clientes: Cliente[];
  guias: Guia[];
  editingTarefa?: any;
  isSubmitting?: boolean;
  onConvert?: (id: string) => void;
}

const emptyForm: NovaTarefaData = {
  passeioId: "",
  clienteId: undefined,
  guiaId: undefined,
  data: "",
  numeroPessoas: 1,
  observacoes: "",
  comissaoPercentual: 30,
};

const NovaTarefaModal: React.FC<NovaTarefaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  passeios,
  clientes,
  guias,
  editingTarefa,
  isSubmitting = false,
  onConvert,
}) => {
  const [formData, setFormData] = useState<NovaTarefaData>({ ...emptyForm });

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingTarefa) {
      const formatDateForInput = (dateVal: any) => {
        if (!dateVal) return "";
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        passeioId: editingTarefa.passeio_id,
        clienteId: editingTarefa.cliente_id || undefined,
        guiaId: editingTarefa.guia_id || undefined,
        data: formatDateForInput(editingTarefa.data_passeio),
        numeroPessoas: editingTarefa.numero_pessoas,
        observacoes: editingTarefa.observacoes || "",
        comissaoPercentual: editingTarefa.percentual_comissao || 30
      });
    } else {
      setFormData({ ...emptyForm });
    }
  }, [editingTarefa]);

  useEffect(() => {
    if (!isOpen && !editingTarefa) {
      setFormData({ ...emptyForm });
    }
  }, [isOpen, editingTarefa]);

  const selectedPasseio = passeios.find(p => p.id === formData.passeioId);
  const numeroPessoas = Number(formData.numeroPessoas ?? 1);
  const comissaoPercentual = Number(formData.comissaoPercentual ?? 30);

  const valorTotal = selectedPasseio ? selectedPasseio.preco * numeroPessoas : 0;
  const comissaoValor = valorTotal * (comissaoPercentual / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.passeioId && formData.data) {
      const submitData: NovaTarefaData = {
        ...formData,
        clienteId: formData.clienteId === "none" ? undefined : formData.clienteId,
        guiaId: formData.guiaId === "none" ? undefined : formData.guiaId
      };
      await onSubmit(submitData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingTarefa ? (editingTarefa.isLead ? 'Gerenciar Lead' : 'Editar Agendamento') : 'Criar Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              {/* Passeio */}
              <div className="space-y-2">
                <Label htmlFor="passeio" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Passeio *
                </Label>
                <Select
                  value={formData.passeioId || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, passeioId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o passeio" />
                  </SelectTrigger>
                  <SelectContent>
                    {passeios.map((passeio) => (
                      <SelectItem key={passeio.id} value={passeio.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{passeio.nome}</span>
                          <span className="text-sm text-gray-500">
                            R$ {passeio.preco.toFixed(2)} • {passeio.duracao}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Guia */}
              <div className="space-y-2">
                <Label htmlFor="guia" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guia (Opcional)
                </Label>
                <Select
                  value={formData.guiaId || "none"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, guiaId: value === "none" ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um guia (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">Nenhum guia selecionado</span>
                    </SelectItem>
                    {guias.map((guia) => (
                      <SelectItem key={guia.id} value={guia.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{guia.nome}</span>
                          <span className="text-sm text-gray-500">
                            {Array.isArray(guia.especialidades) ? guia.especialidades.join(", ") : guia.especialidades || "N/A"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Pessoas */}
              <div className="space-y-2">
                <Label htmlFor="pessoas" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Pessoas
                </Label>
                <Input
                  type="number"
                  id="pessoas"
                  min="1"
                  value={formData.numeroPessoas}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroPessoas: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações especiais..."
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente (Opcional)
                </Label>
                {editingTarefa?.isLead && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-0">LEAD</Badge>
                      <span className="font-bold text-sm">Resumo do Lead</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between border-b border-blue-100 pb-1">
                        <span className="text-blue-600/70 font-medium">Nome:</span>
                        <span className="font-semibold">{editingTarefa.cliente_nome?.replace(' (Lead)', '')}</span>
                      </p>
                      <p className="flex justify-between border-b border-blue-100 pb-1">
                        <span className="text-blue-600/70 font-medium">Email:</span>
                        <span className="font-medium underline decoration-blue-200">{editingTarefa.leadEmail || 'N/A'}</span>
                      </p>
                      <p className="flex justify-between border-b border-blue-100 pb-1">
                        <span className="text-blue-600/70 font-medium">Telefone:</span>
                        <span className="font-medium">{editingTarefa.leadPhone || 'N/A'}</span>
                      </p>
                    </div>
                    <p className="mt-3 text-[10px] text-blue-500 italic bg-white/50 p-1.5 rounded border border-blue-50">
                      * Este registro passará para a lista de Clientes após a conversão.
                    </p>
                  </div>
                )}
                <Select
                  value={formData.clienteId || "none"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value === "none" ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">Nenhum cliente selecionado</span>
                    </SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nome}</span>
                          <span className="text-sm text-gray-500">{cliente.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Hora */}
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Data e Hora *
                </Label>
                <Input
                  type="datetime-local"
                  id="data"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>

              {/* Comissão */}
              <div className="space-y-2">
                <Label htmlFor="comissao" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  % Comissão do Guia
                </Label>
                <Input
                  type="number"
                  id="comissao"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.comissaoPercentual}
                  onChange={(e) => setFormData(prev => ({ ...prev, comissaoPercentual: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-sm text-gray-600">R$ {comissaoValor.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          {selectedPasseio && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total: R$ {valorTotal.toFixed(2)}</span>
                <span className="font-medium text-blue-600">Comissão: R$ {comissaoValor.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center bg-gray-50 p-6 rounded-lg border-t mt-4">
            <div>
              {editingTarefa?.isLead && (
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
                  onClick={() => onConvert?.(editingTarefa.id)}
                  disabled={isSubmitting}
                >
                  <User className="h-4 w-4" />
                  CONVERTER PARA CLIENTE
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-300">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                disabled={isSubmitting || !formData.passeioId || !formData.data}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : editingTarefa
                    ? 'Salvar Alterações'
                    : 'Criar Tarefa'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaTarefaModal;
