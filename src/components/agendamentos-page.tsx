"use client";

import React, { useState, useOptimistic, useTransition, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Home, Calendar, CalendarDays, Users, Heart, DollarSign, LogOut,
  Plus, User, MapPin as Location, Clock, Edit, Trash2, Settings, MoreHorizontal, X
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import NovaTarefaModal from "./nova-tarefa-modal";
import { toast } from "sonner";
import {
  updateStatusAction,
  saveAgendamentoAction,
  deleteAgendamentoAction,
  saveColumnAction,
  deleteColumnAction,
  convertLeadAction
} from "@/app/admin/agendamentos/actions";
import type { Tarefa, Passeio, Cliente, Guia, NovaTarefaData, Status, KanbanColumn } from "@/types/agendamentos";

const COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-100 border-purple-200 text-purple-900",
  blue: "bg-blue-100 border-blue-200 text-blue-900",
  green: "bg-green-100 border-green-200 text-green-900",
  yellow: "bg-yellow-100 border-yellow-200 text-yellow-900",
  red: "bg-red-100 border-red-200 text-red-900",
  orange: "bg-orange-100 border-orange-200 text-orange-900",
  gray: "bg-gray-100 border-gray-200 text-gray-900",
  pink: "bg-pink-100 border-pink-200 text-pink-900",
};

const HEADER_COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  gray: "bg-gray-500",
  pink: "bg-pink-500",
};

const getStatusColor = (status: string, columns: KanbanColumn[]) => {
  const col = columns.find(c => c.id === status);
  const colorKey = col?.color || 'gray';

  // Return light bg for badges
  const map: Record<string, string> = {
    purple: "text-purple-700 bg-purple-50",
    blue: "text-blue-700 bg-blue-50",
    green: "text-green-700 bg-green-50",
    yellow: "text-yellow-700 bg-yellow-50",
    red: "text-red-700 bg-red-50",
    orange: "text-orange-700 bg-orange-50",
    gray: "text-gray-700 bg-gray-50",
    pink: "text-pink-700 bg-pink-50",
  };
  return map[colorKey] || map.gray;
};

const TaskCard: React.FC<{
  tarefa: Tarefa;
  index: number;
  columns: KanbanColumn[];
  onEdit: (tarefa: Tarefa) => void;
  onAprovar: (id: string) => void;
  onRemover: (id: string) => void;
}> = ({ tarefa, index, columns, onEdit, onAprovar, onRemover }) => (
  <Draggable draggableId={tarefa.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`bg-white rounded-lg border p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        style={{
          ...provided.draggableProps.style,
        }}
        onClick={() => onEdit(tarefa)}
      >
        <div className="flex items-start justify-between mb-2">
          <Badge className={`${getStatusColor(tarefa.status, columns)} border-0 text-xs`}>
            {columns.find(c => c.id === tarefa.status)?.title || tarefa.status}
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tarefa);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            {tarefa.status !== 'confirmadas' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onAprovar(tarefa.id);
                }}
                title="Aprovar"
              >
                <Calendar className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onRemover(tarefa.id);
              }}
              title="Remover"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-2">{tarefa.passeio_nome || 'Passeio não encontrado'}</h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-3 w-3" />
            <span>{tarefa.cliente_nome || 'Sem cliente'}</span>
            {tarefa.isLead && <Badge variant="outline" className="ml-2 text-[10px] h-4 border-blue-200 text-blue-700 bg-blue-50">LEAD</Badge>}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Location className="h-3 w-3" />
            <span>{tarefa.guia_nome || 'Sem guia'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{tarefa.data_passeio ? new Date(tarefa.data_passeio).toLocaleDateString('pt-BR') : 'Data n/a'}</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t mt-2">
          <span>{tarefa.numero_pessoas} pessoas</span>
          <span className="font-medium">R$ {(tarefa.valor_total || 0).toFixed(2)}</span>
        </div>
      </div>
    )}
  </Draggable>
);

const ColumnManagerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  column: Partial<KanbanColumn> | null;
  onSave: (col: Partial<KanbanColumn>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, column, onSave, onDelete }) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("gray");

  useEffect(() => {
    if (column) {
      setTitle(column.title || "");
      setColor(column.color || "gray");
    } else {
      setTitle("");
      setColor("gray");
    }
  }, [column, isOpen]);

  const handleSubmit = async () => {
    if (!title) return toast.error("Título obrigatório");
    await onSave({ ...column, title, color });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{column?.id ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título da Coluna</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Arquivados" />
          </div>
          <div className="space-y-2">
            <Label>Cor do Cabeçalho</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma cor" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(HEADER_COLOR_MAP).map(key => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${HEADER_COLOR_MAP[key]}`} />
                      <span className="capitalize">{key}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between w-full">
          {column?.id && column.id !== 'new' ? (
            <Button variant="destructive" onClick={() => {
              if (confirm("Remover esta coluna?")) {
                onDelete(column.id!);
                onClose();
              }
            }}>
              Excluir
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AgendamentosClientPageProps {
  initialAgendamentos: Tarefa[];
  passeios: Passeio[];
  clientes: Cliente[];
  guias: Guia[];
  columns: KanbanColumn[];
}

const AgendamentosClientPage: React.FC<AgendamentosClientPageProps> = ({
  initialAgendamentos,
  passeios,
  clientes,
  guias,
  columns: serverColumns
}) => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [isPending, startTransition] = useTransition();

  // Columns State
  const [columns, setColumns] = useState(serverColumns);
  const [editingColumn, setEditingColumn] = useState<Partial<KanbanColumn> | null>(null);
  const [isColModalOpen, setIsColModalOpen] = useState(false);

  useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  // State Management (Replacing useOptimistic)
  const [agendamentos, setAgendamentos] = useState(initialAgendamentos);

  useEffect(() => {
    setAgendamentos(initialAgendamentos);
  }, [initialAgendamentos]);

  const getTarefasByStatus = (status: Status) => {
    return agendamentos.filter(agendamento => agendamento.status === status);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) return;

    const novoStatus = destination.droppableId as Status;
    const oldStatus = source.droppableId as Status;

    // Optimistic Update
    setAgendamentos(prev => prev.map(t =>
      t.id === draggableId ? { ...t, status: novoStatus } : t
    ));

    try {
      // Server Action
      const res = await updateStatusAction(draggableId, novoStatus);
      if (!res.success) throw new Error(res.error || "Falha ao atualizar");
      toast.success("Status atualizado");
    } catch (error) {
      toast.error(String(error));
      // Revert on failure
      setAgendamentos(prev => prev.map(t =>
        t.id === draggableId ? { ...t, status: oldStatus } : t
      ));
    }
  };

  // Task Handlers...
  const handleNovaTarefa = async (data: NovaTarefaData) => {
    startTransition(async () => {
      const result = await saveAgendamentoAction(data);
      if (result.success) {
        toast.success('Agendamento criado.');
        setIsModalOpen(false);
      } else toast.error(result.error);
    });
  };

  const handleEditarTarefa = async (data: NovaTarefaData) => {
    if (!editingTarefa) return;
    startTransition(async () => {
      const result = await saveAgendamentoAction(data, editingTarefa.id);
      if (result.success) {
        toast.success('Atualizado.');
        setIsModalOpen(false);
        setEditingTarefa(null);
      } else toast.error(result.error);
    });
  };

  const handleAprovarAgendamento = async (id: string) => {
    // Optimistic
    setAgendamentos(prev => prev.map(t => t.id === id ? { ...t, status: 'confirmadas' } : t));

    startTransition(async () => {
      const result = await updateStatusAction(id, 'confirmadas');
      if (result.success) {
        toast.success('Confirmado');
      } else {
        toast.error(result.error);
        // Revert?? Ideally yes, but revalidatePath usually covers it.
      }
    });
  };

  const handleRemoverAgendamento = async (id: string) => {
    if (!confirm("Remover agendamento?")) return;
    await deleteAgendamentoAction(id);
    toast.success('Removido');
  };

  const handleConvertLead = async (id: string) => {
    if (!confirm("Deseja converter este lead em um cliente e agendamento confirmado?")) return;
    startTransition(async () => {
      const result = await convertLeadAction(id);
      if (result.success) {
        toast.success('Lead convertido com sucesso!');
        setIsModalOpen(false);
        setEditingTarefa(null);
      } else {
        toast.error(result.error || 'Falha ao converter lead');
      }
    });
  };

  // Column Handlers
  const handleEditColumn = (col: KanbanColumn) => {
    setEditingColumn(col);
    setIsColModalOpen(true);
  };

  const handleNewColumn = () => {
    setEditingColumn({ id: 'new_' + Date.now(), title: '', color: 'gray', order_index: columns.length });
    setIsColModalOpen(true);
  };

  const handleSaveColumn = async (col: Partial<KanbanColumn>) => {
    startTransition(async () => {
      const result = await saveColumnAction(col);
      if (result.success) toast.success("Coluna salva");
      else toast.error(result.error);
    });
  };

  const handleDeleteColumn = async (id: string) => {
    startTransition(async () => {
      const result = await deleteColumnAction(id);
      if (result.success) toast.success("Coluna removida");
      else toast.error(result.error);
    });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Agendamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie o fluxo de agendamentos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewColumn} variant="outline" className="border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Nova Coluna
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setEditingTarefa(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agendamento
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 items-start h-[calc(100vh-200px)]">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col h-full bg-gray-100/50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">

              {/* Colored Header */}
              <div className={`p-3 flex items-center justify-between ${HEADER_COLOR_MAP[column.color || 'gray']} text-white rounded-t-xl`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm uppercase tracking-wide">{column.title}</span>
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {getTarefasByStatus(column.id).length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => handleEditColumn(column)}>
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-gray-100' : ''
                      }`}
                  >
                    {getTarefasByStatus(column.id).map((tarefa, index) => (
                      <TaskCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        index={index}
                        columns={columns}
                        onEdit={(t) => { setEditingTarefa(t); setIsModalOpen(true); }}
                        onAprovar={handleAprovarAgendamento}
                        onRemover={handleRemoverAgendamento}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            </div>
          ))}
        </div>
      </DragDropContext>

      <NovaTarefaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingTarefa ? (d) => handleEditarTarefa(d as NovaTarefaData) : (d) => handleNovaTarefa(d as NovaTarefaData)}
        passeios={passeios}
        clientes={clientes}
        guias={guias}
        editingTarefa={editingTarefa}
        isSubmitting={isPending}
        onConvert={handleConvertLead}
      />

      <ColumnManagerModal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        column={editingColumn}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
      />
    </div>
  );
};

export default AgendamentosClientPage;
