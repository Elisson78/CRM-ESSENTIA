"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsClient, formatCurrency } from "@/lib/format-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Users,
  DollarSign,
  Clock,
  Home,
  CalendarDays,
  Users as UsersIcon,
  Heart,
  MapPin as MapPinIcon,
  DollarSign as DollarSignIcon,
  LogOut,
  Edit2
} from "lucide-react";

import type { Tarefa, Passeio, Cliente, Guia, KanbanColumn, Status, NovaTarefaData } from "@/types/agendamentos";
import NovaTarefaModal from "./nova-tarefa-modal";
import { saveAgendamentoAction, deleteAgendamentoAction } from "@/app/admin/agendamentos/actions";

interface CalendarioGlobalProps {
  initialAgendamentos: Tarefa[];
  initialPasseios: Passeio[];
  initialClientes: Cliente[];
  initialGuias: Guia[];
  initialColumns: KanbanColumn[];
}

const CalendarioGlobal: React.FC<CalendarioGlobalProps> = ({
  initialAgendamentos,
  initialPasseios,
  initialClientes,
  initialGuias,
  initialColumns
}) => {
  const { user, logout } = useAuth();
  const isClient = useIsClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Tarefa[]>(initialAgendamentos);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);

  // Sincronizar dados iniciais se eles mudarem
  useEffect(() => {
    setAgendamentos(initialAgendamentos);
  }, [initialAgendamentos]);

  // Navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Adicionar dias vazios do fim para completar a grade
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  // Obter eventos para um dia específico
  const getEventsForDay = (date: Date) => {
    return agendamentos.filter(agendamento => {
      if (agendamento.isLead) return false; // Não mostrar leads cru no calendário por enquanto?
      if (!['confirmadas', 'em_progresso', 'pendente_cliente', 'concluidas'].includes(agendamento.status)) return false;

      const eventDate = new Date(agendamento.data_passeio);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const handleEditTask = (task: Tarefa) => {
    setEditingTarefa(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (data: NovaTarefaData) => {
    startTransition(async () => {
      const result = await saveAgendamentoAction(data, editingTarefa?.id);
      if (result.success) {
        toast.success("Agendamento atualizado");
        setIsModalOpen(false);
        setEditingTarefa(null);
        // Os dados serão revidados via Page async
      } else {
        toast.error(result.error);
      }
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmadas': return 'bg-green-100 border-green-200 text-green-800';
      case 'em_progresso': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'pendente_cliente': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'concluidas': return 'bg-gray-100 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Calendário Global
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize todos os agendamentos ativos em um calendário unificado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = '/admin/agendamentos'}
          >
            Board Kanban
          </Button>
        </div>
      </div>

      {/* Calendário */}
      <Card className="mb-8 border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 py-6">
          <CardTitle className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            {monthName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="grid grid-cols-7 bg-gray-100 gap-[1px]">
            {days.map((day, index) => {
              const events = day ? getEventsForDay(day) : [];
              const isToday = isClient && day ? day.toDateString() === new Date().toDateString() : false;
              const isCurrentMonth = day ? day.getMonth() === currentDate.getMonth() : false;

              return (
                <div
                  key={index}
                  className={`min-h-[140px] p-2 bg-white transition-colors duration-200 ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'hover:bg-gray-50/30'
                    }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-2 flex items-center justify-center w-7 h-7 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                        }`}>
                        {day.getDate()}
                      </div>

                      <div className="space-y-1.5">
                        {events.map(evento => (
                          <div
                            key={evento.id}
                            onClick={() => handleEditTask(evento)}
                            className={`group relative p-1.5 rounded border text-[10px] leading-tight cursor-pointer shadow-sm hover:shadow transition-all ${getStatusColor(evento.status)}`}
                            title={`${evento.passeio_nome} - ${evento.cliente_nome}`}
                          >
                            <div className="font-bold truncate">
                              {evento.passeio_nome}
                            </div>
                            <div className="truncate opacity-90">
                              {evento.cliente_nome?.split(' ')[0]} ({evento.numero_pessoas}p)
                            </div>
                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 className="h-2 w-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Simples */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-emerald-50 text-emerald-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Total Confirmados</p>
            <h3 className="text-3xl font-bold">{agendamentos.filter(a => a.status === 'confirmadas').length}</h3>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 text-blue-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Em Progresso</p>
            <h3 className="text-3xl font-bold">{agendamentos.filter(a => a.status === 'em_progresso').length}</h3>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-yellow-50 text-yellow-900">
          <CardContent className="p-6">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Pendente Cliente</p>
            <h3 className="text-3xl font-bold">{agendamentos.filter(a => a.status === 'pendente_cliente').length}</h3>
          </CardContent>
        </Card>
      </div>

      <NovaTarefaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTarefa(null);
        }}
        onSubmit={handleSaveTask}
        passeios={initialPasseios}
        clientes={initialClientes}
        guias={initialGuias}
        editingTarefa={editingTarefa}
        isSubmitting={isPending}
      />
    </div>
  );
};

export { CalendarioGlobal };
