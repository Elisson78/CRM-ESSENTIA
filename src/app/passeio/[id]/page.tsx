"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatCurrency, useIsClient } from "@/lib/format-utils";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPt as Calendar } from "@/components/calendar-pt";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  Euro,
  Users,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  User,
  Heart,
  Share2,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configurar o locale português como padrão para date-fns
setDefaultOptions({ locale: ptBR });
import Link from "next/link";
import Image from "next/image";

interface Passeio {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  categoria: string;
  imagens?: string[];
  inclusoes?: string[];
  idiomas?: string[];
  capacidadeMaxima?: number;
  ativo: number;
  tarifa2Pessoas?: number;
  tarifa4Pessoas?: number;
  tarifa6Pessoas?: number;
  tarifa8Pessoas?: number;
  tarifa10Pessoas?: number;
  sobConsultaTexto?: string;
}

export default function PasseioDetalhes() {
  const params = useParams();
  const router = useRouter();
  const isClient = useIsClient();
  const [passeio, setPasseio] = useState<Passeio | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedPeople, setSelectedPeople] = useState(1);
  const [isGroup, setIsGroup] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    nome: "",
    email: "",
    telefone: "",
    observacoes: ""
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const carregarPasseio = async () => {
      try {
        const response = await fetch(`/api/passeios/${params.id}`);
        if (response.ok) {
          const passeioData = await response.json();
          setPasseio(passeioData);
        } else {
          console.error('Passeio não encontrado');
          setPasseio(null);
        }
      } catch (error) {
        console.error('Erro ao carregar passeio:', error);
        setPasseio(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      carregarPasseio();
    }
  }, [params.id]);

  const handleBooking = async () => {
    if (!selectedDate || !customerInfo.nome || !customerInfo.email) {
      alert("Por favor, preencha todos os campos obrigatórios e selecione uma data.");
      return;
    }

    setProcessing(true);
    try {
      // Fluxo de Lead: Envia para /api/leads
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: customerInfo.nome,
          email: customerInfo.email,
          telefone: customerInfo.telefone,
          passeioId: passeio?.id,
          passeioNome: passeio?.nome,
          data: selectedDate,
          pessoas: selectedPeople,
          observacoes: customerInfo.observacoes
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação.');
      }

      // Sucesso
      const data = await response.json();
      console.log('Lead criado:', data);

      alert(`Solicitação de reserva recebida com sucesso!\n\nUm de nossos consultores entrará em contato pelo email ${customerInfo.email} para confirmar os detalhes e o pagamento.`);

      // Limpar formulário ou redirecionar para home
      router.push('/');

    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      alert('Houve um erro ao enviar sua solicitação. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes do passeio...</p>
        </div>
      </div>
    );
  }

  if (!passeio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Passeio não encontrado</h1>
          <p className="text-gray-600 mb-4">O passeio que você procura não existe ou não está disponível.</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const inclusoes = passeio.inclusoes || [];
  const idiomas = passeio.idiomas || [];
  const valorTotal = passeio.preco * selectedPeople;
  const desconto = isGroup && selectedPeople >= 5 ? 0.1 : 0;
  const valorFinal = valorTotal * (1 - desconto);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna principal - Informações do passeio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero do passeio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm"
            >
              {/* Imagem do passeio */}
              <div className="h-80 relative overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <Badge className="bg-blue-600 text-white">{passeio.categoria}</Badge>
                  <Badge className="bg-green-600 text-white">Disponível</Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-orange-500 text-white">
                    {isGroup && selectedPeople >= 5 ? "10% OFF Grupo" : "Melhor Preço"}
                  </Badge>
                </div>
                {(() => {
                  const imagensArray = passeio.imagens || [];
                  const primeiraImagem = imagensArray.length > 0 ? imagensArray[0] : null;

                  if (primeiraImagem) {
                    return (
                      <Image
                        src={primeiraImagem}
                        alt={passeio.nome}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                        className="object-cover"
                        priority
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', primeiraImagem);
                        }}
                      />
                    );
                  } else {
                    // Fallback para emoji se não houver imagem
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center">
                        <span className="text-8xl">🏛️</span>
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{passeio.nome}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{passeio.duracao}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Máx: {passeio.capacidadeMaxima} pessoas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{passeio.categoria}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-sm text-gray-500">(127 avaliações)</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(passeio.preco)}
                      <span className="text-sm text-gray-500 font-normal">/pessoa</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Sobre este passeio</h3>
                  <p className="text-gray-600 leading-relaxed">{passeio.descricao}</p>
                </div>

                {(passeio.tarifa2Pessoas || passeio.tarifa4Pessoas || passeio.tarifa6Pessoas || passeio.tarifa8Pessoas || passeio.tarifa10Pessoas) && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Euro className="w-5 h-5 text-orange-500" />
                      Tabela de Tarifas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {passeio.tarifa2Pessoas !== undefined && passeio.tarifa2Pessoas > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-600">Até 2 pessoas</span>
                          <span className="font-bold text-gray-900">{formatCurrency(passeio.tarifa2Pessoas)}</span>
                        </div>
                      )}
                      {passeio.tarifa4Pessoas !== undefined && passeio.tarifa4Pessoas > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-600">Até 4 pessoas</span>
                          <span className="font-bold text-gray-900">{formatCurrency(passeio.tarifa4Pessoas)}</span>
                        </div>
                      )}
                      {passeio.tarifa6Pessoas !== undefined && passeio.tarifa6Pessoas > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-600">Até 6 pessoas</span>
                          <span className="font-bold text-gray-900">{formatCurrency(passeio.tarifa6Pessoas)}</span>
                        </div>
                      )}
                      {passeio.tarifa8Pessoas !== undefined && passeio.tarifa8Pessoas > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-gray-600">Até 8 pessoas</span>
                          <span className="font-bold text-gray-900">{formatCurrency(passeio.tarifa8Pessoas)}</span>
                        </div>
                      )}
                      {passeio.tarifa10Pessoas !== undefined && passeio.tarifa10Pessoas > 0 && (
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <span className="text-orange-800 font-medium">Grupos até 10 pessoas</span>
                          <span className="font-bold text-orange-900">{formatCurrency(passeio.tarifa10Pessoas)}</span>
                        </div>
                      )}
                    </div>
                    {passeio.sobConsultaTexto && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                        <div className="text-blue-500 mt-1">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-blue-900 font-semibold text-sm">Sob consulta:</p>
                          <p className="text-blue-800 text-sm italic">{passeio.sobConsultaTexto}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Inclusos */}
            {inclusoes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      O que está incluído
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {inclusoes.map((item: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Idiomas */}
            {idiomas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Idiomas disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {idiomas.map((idioma: string, index: number) => (
                        <Badge key={index} variant="outline">{idioma}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Formulário de reserva */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Reserve seu passeio</CardTitle>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(valorFinal)}
                  {desconto > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(valorTotal)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de data */}
                <div>
                  <Label htmlFor="date" className="text-base font-semibold text-gray-900">Data do passeio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2 h-12 border-2 hover:border-orange-300",
                          !selectedDate && "text-muted-foreground border-gray-200",
                          selectedDate && "border-orange-200 bg-orange-50"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-orange-500" />
                        {selectedDate ? (
                          <span className="text-gray-900 font-medium">
                            {isClient ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data selecionada'}
                          </span>
                        ) : (
                          <span className="text-gray-500">Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-2 border-orange-200 shadow-lg" align="start">
                      <div className="bg-white rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                          <h3 className="font-semibold text-lg">Escolha a data do seu passeio</h3>
                          <p className="text-orange-100 text-sm">Selecione uma data disponível</p>
                        </div>
                        <div className="p-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="rounded-md border-0"
                            classNames={{
                              months: "space-y-4",
                              month: "space-y-4",
                              caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                              caption_label: "text-lg font-bold text-gray-900",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-orange-100 rounded-md",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-gray-600 rounded-md w-10 font-medium text-sm text-center",
                              row: "flex w-full mt-2",
                              cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-orange-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-orange-100 rounded-md transition-colors",
                              day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-600 focus:text-white font-semibold",
                              day_today: "bg-orange-100 text-orange-900 font-semibold",
                              day_outside: "text-gray-400 opacity-50",
                              day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                              day_range_middle: "aria-selected:bg-orange-100 aria-selected:text-orange-900",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t">
                          <p className="text-xs text-gray-600 text-center">
                            ✨ Disponibilidade em tempo real • Confirmação imediata
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Tipo de reserva */}
                <div>
                  <Label className="text-base font-semibold text-gray-900">Tipo de reserva</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={!isGroup ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setIsGroup(false); setSelectedPeople(1); }}
                      className={cn(
                        "flex-1 h-11 border-2 transition-all",
                        !isGroup
                          ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                      )}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Individual
                    </Button>
                    <Button
                      type="button"
                      variant={isGroup ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setIsGroup(true); setSelectedPeople(5); }}
                      className={cn(
                        "flex-1 h-11 border-2 transition-all",
                        isGroup
                          ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Grupo
                      {isGroup && <Badge className="ml-2 bg-green-500 text-white text-xs">10% OFF</Badge>}
                    </Button>
                  </div>
                </div>

                {/* Número de pessoas */}
                <div>
                  <Label htmlFor="people" className="text-base font-semibold text-gray-900">Número de pessoas</Label>
                  <Select
                    value={selectedPeople.toString()}
                    onValueChange={(value) => setSelectedPeople(Number(value))}
                  >
                    <SelectTrigger className="mt-2 h-12 border-2 hover:border-orange-300 focus:border-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-orange-200">
                      {Array.from({ length: passeio.capacidadeMaxima || 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()} className="hover:bg-orange-50">
                          <div className="flex items-center justify-between w-full">
                            <span>{num} {num === 1 ? 'pessoa' : 'pessoas'}</span>
                            {num >= 5 && (
                              <Badge className="ml-2 bg-green-500 text-white text-xs">
                                10% OFF
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Informações do cliente */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Suas informações</h4>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome" className="text-sm font-semibold text-gray-900">Nome completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Digite seu nome completo"
                        value={customerInfo.nome}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, nome: e.target.value })}
                        className="mt-2 h-11 border-2 hover:border-orange-300 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="mt-2 h-11 border-2 hover:border-orange-300 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone" className="text-sm font-semibold text-gray-900">Telefone</Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        value={customerInfo.telefone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, telefone: e.target.value })}
                        className="mt-2 h-11 border-2 hover:border-orange-300 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observacoes" className="text-sm font-semibold text-gray-900">Observações</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Alguma solicitação especial ou informação importante?"
                        value={customerInfo.observacoes}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, observacoes: e.target.value })}
                        className="mt-2 border-2 hover:border-orange-300 focus:border-orange-500 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo do valor */}
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Resumo da reserva</h5>
                  <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{formatCurrency(passeio.preco)} × {selectedPeople} {selectedPeople === 1 ? 'pessoa' : 'pessoas'}</span>
                      <span className="font-medium">{formatCurrency(valorTotal)}</span>
                    </div>
                    {desconto > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1">
                          🎉 Desconto grupo (10%)
                        </span>
                        <span className="font-medium">-{formatCurrency(valorTotal * desconto)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-900">Total</span>
                        <span className="text-orange-600">{formatCurrency(valorFinal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                  disabled={processing}
                >
                  {processing ? 'Enviando...' : '📝 Solicitar Reserva'}
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500">
                    🔒 Pagamento realizado apenas após confirmação do consultor.
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Cancelamento gratuito até 24h antes
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
