"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  Calendar,
  Users,
  Clock,
  Euro,
  Download,
  Share2,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface ReservaConcluida {
  id: string;
  passeioNome: string;
  data: Date;
  pessoas: number;
  tipoReserva: string;
  valorTotal: number;
  status: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  pagamento: {
    metodo: string;
    processadoEm: Date;
  };
}

export default function Confirmacao() {
  const [reserva, setReserva] = useState<ReservaConcluida | null>(null);

  useEffect(() => {
    const ultimaReserva = localStorage.getItem('ultimaReserva');
    if (ultimaReserva) {
      const data = JSON.parse(ultimaReserva);
      data.data = new Date(data.data);
      data.pagamento.processadoEm = new Date(data.pagamento.processadoEm);
      setReserva(data);
    }
  }, []);

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nenhuma reserva encontrada</h1>
          <p className="text-gray-600 mb-4">Não encontramos informações sobre sua reserva.</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getMetodoPagamento = (metodo: string) => {
    switch (metodo) {
      case 'credit_card': return 'Cartão de Crédito/Débito';
      case 'pix': return 'PIX';
      case 'bank_transfer': return 'Transferência Bancária';
      default: return metodo;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Confirmação Success */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reserva Confirmada! 🎉
            </h1>
            <p className="text-gray-600">
              Parabéns! Sua reserva foi confirmada com sucesso.
            </p>
          </motion.div>

          {/* Detalhes da reserva */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{reserva.passeioNome}</h2>
                    <p className="text-gray-600">ID da Reserva: #{reserva.id.split('_')[1]}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {reserva.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Detalhes do passeio */}
                  <div>
                    <h3 className="font-semibold mb-3">Detalhes do passeio</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(reserva.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{reserva.pessoas} {reserva.pessoas === 1 ? 'pessoa' : 'pessoas'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Badge variant="outline">{reserva.tipoReserva}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold text-green-600">€ {reserva.valorTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações do cliente */}
                  <div>
                    <h3 className="font-semibold mb-3">Suas informações</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Nome:</strong> {reserva.cliente.nome}</p>
                      <p><strong>Email:</strong> {reserva.cliente.email}</p>
                      {reserva.cliente.telefone && (
                        <p><strong>Telefone:</strong> {reserva.cliente.telefone}</p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Pagamento</h4>
                      <div className="text-sm text-gray-600">
                        <p><strong>Método:</strong> {getMetodoPagamento(reserva.pagamento.metodo)}</p>
                        <p><strong>Processado em:</strong> {format(reserva.pagamento.processadoEm, "dd/MM/yyyy 'às' HH:mm")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Próximos passos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Próximos passos</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Confirmação por email</p>
                      <p className="text-sm text-gray-600">Você receberá um email com todos os detalhes da sua reserva em até 15 minutos.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Instruções do passeio</p>
                      <p className="text-sm text-gray-600">24 horas antes do passeio, enviaremos o ponto de encontro e orientações importantes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Aproveite sua experiência</p>
                      <p className="text-sm text-gray-600">No dia do passeio, apresente-se no local indicado com 15 minutos de antecedência.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Baixar comprovante
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Avaliar experiência
            </Button>
          </motion.div>

          {/* CTA para mais passeios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center bg-gradient-to-br from-blue-600 to-orange-400 rounded-lg p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-2">Gostou da experiência?</h3>
            <p className="mb-4">Descubra outros passeios incríveis pela Itália!</p>
            <Link href="/#destinos">
              <Button variant="secondary" size="lg">
                Ver mais passeios
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}