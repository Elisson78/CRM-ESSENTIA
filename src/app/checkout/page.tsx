"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Check,
  Clock,
  Users,
  Euro,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";


interface BookingData {
  passeioId: string;
  passeioNome: string;
  data: Date;
  pessoas: number;
  tipoReserva: string;
  valorOriginal: number;
  valorTotal: number;
  desconto: number;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    observacoes: string;
  };
  preCadastro?: {
    success: boolean;
    clienteId: string;
    novoCliente: boolean;
    senhaGerada: string | null;
    cliente: {
      id: string;
      nome: string;
      email: string;
      telefone: string | null;
      status: string;
      atualizadoEm: string;
    } | null;
  };
}

export default function Checkout() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    cpf: ""
  });

  useEffect(() => {
    const savedBookingData = localStorage.getItem('bookingData');
    if (savedBookingData) {
      const data = JSON.parse(savedBookingData);
      data.data = new Date(data.data); // Converter string de volta para Date
      setBookingData(data);
    } else {
      // Redirecionar de volta se não houver dados de reserva
      router.push('/');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!bookingData) return;

    setProcessing(true);

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calcular valor final considerando PIX
      const valorFinalComPix = paymentMethod === "pix" ? bookingData.valorTotal * 0.95 : bookingData.valorTotal;

      // Usar API de teste para PIX, API normal para outros métodos
      const apiEndpoint = paymentMethod === 'pix' ? '/api/teste-pix' : '/api/reservas';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passeioId: bookingData.passeioId,
          passeioNome: bookingData.passeioNome,
          data: bookingData.data,
          pessoas: bookingData.pessoas,
          tipoReserva: bookingData.tipoReserva,
          valorTotal: valorFinalComPix,
          clienteNome: bookingData.cliente.nome,
          clienteEmail: bookingData.cliente.email,
          clienteTelefone: bookingData.cliente.telefone,
          clienteObservacoes: bookingData.cliente.observacoes,
          metodoPagamento: paymentMethod,
          // Enviar dados do precheck para evitar duplicação
          preCadastroClienteId: bookingData.preCadastro?.clienteId,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        const reservaSegura = {
          id: result.reservaId,
          passeioNome: bookingData.passeioNome,
          data: bookingData.data,
          pessoas: bookingData.pessoas,
          tipoReserva: bookingData.tipoReserva,
          valorTotal: valorFinalComPix,
          cliente: {
            nome: bookingData.cliente.nome,
            email: bookingData.cliente.email,
            telefone: bookingData.cliente.telefone
          },
          pagamento: {
            metodo: paymentMethod,
            processadoEm: new Date()
          },
          status: 'confirmada'
        };

        localStorage.setItem('ultimaReserva', JSON.stringify(reservaSegura));
        localStorage.removeItem('bookingData');

        // Priorizar dados do preCadastro que foram criados na primeira etapa
        const clienteId = bookingData.preCadastro?.clienteId ?? result.clienteId;
        const clienteDados = bookingData.preCadastro?.cliente ?? result.cliente ?? {
          id: clienteId,
          nome: bookingData.cliente.nome,
          email: bookingData.cliente.email,
          telefone: bookingData.cliente.telefone,
          status: 'ativo',
          criadoEm: new Date().toISOString(),
        };

        const clienteLogado = {
          id: clienteId,
          nome: clienteDados.nome ?? bookingData.cliente.nome,
          email: clienteDados.email ?? bookingData.cliente.email,
          telefone: clienteDados.telefone ?? bookingData.cliente.telefone,
          status: clienteDados.status ?? 'ativo',
          criadoEm: clienteDados.criadoEm ?? clienteDados.atualizadoEm ?? new Date().toISOString(),
          endereco: clienteDados.endereco ?? null,
        };

        localStorage.setItem('clienteLogado', JSON.stringify(clienteLogado));

        // Usar senha do preCadastro (primeira vez que o usuário foi criado)
        const senhaParaLogin = bookingData.preCadastro?.senhaGerada ?? null;
        const ehNovoCliente = bookingData.preCadastro?.novoCliente ?? false;

        console.log('🔐 Tentando login automático:', {
          ehNovoCliente,
          temSenha: !!senhaParaLogin,
          clienteId
        });

        if (ehNovoCliente && senhaParaLogin) {
          localStorage.setItem('senhaTemporaria', senhaParaLogin);
          try {
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: bookingData.cliente.email,
                password: senhaParaLogin
              })
            });

            if (loginResponse.ok) {
              const authData = await loginResponse.json();
              console.log('✅ Login automático realizado com sucesso!', authData.user?.id);
            } else {
              console.error('❌ Erro ao autenticar automaticamente');
            }
          } catch (authError) {
            console.warn('❌ Não foi possível autenticar automaticamente:', authError);
          }
        } else {
          console.log('ℹ️ Login automático não necessário (cliente já existente)');
        }

        router.push('/cliente/dashboard');
      } else {
        throw new Error('Erro ao processar reserva');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando informações da reserva...</p>
        </div>
      </div>
    );
  }

  const valorComPix = paymentMethod === "pix" ? bookingData.valorTotal * 0.95 : bookingData.valorTotal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/passeio/${bookingData.passeioId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Checkout</h1>
            <div className="w-20"></div> {/* Spacer para centralizar */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações de pagamento */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Pagamento Seguro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Método de pagamento */}
                  <div>
                    <Label className="text-base font-semibold">Escolha o método de pagamento</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="mt-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <div className="flex items-center gap-2 flex-1">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                            Cartão de Crédito/Débito
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="pix" id="pix" />
                        <div className="flex items-center gap-2 flex-1">
                          <Smartphone className="h-5 w-5 text-green-600" />
                          <Label htmlFor="pix" className="flex-1 cursor-pointer">
                            PIX (5% desconto adicional)
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                        <div className="flex items-center gap-2 flex-1">
                          <Building2 className="h-5 w-5 text-purple-600" />
                          <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                            Transferência Bancária
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Dados do cartão (apenas se cartão selecionado) */}
                  {paymentMethod === "credit_card" && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-semibold">Dados do cartão</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="cardNumber">Número do cartão</Label>
                          <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cardName">Nome no cartão</Label>
                          <Input
                            id="cardName"
                            placeholder="Nome como impresso no cartão"
                            value={paymentInfo.cardName}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Validade</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/AA"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="000"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={paymentInfo.cpf}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cpf: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "pix" && (
                    <div className="bg-green-50 p-4 rounded-lg border">
                      <h4 className="font-semibold text-green-800 mb-2">Pagamento via PIX</h4>
                      <p className="text-green-700 text-sm">
                        Após confirmar, você receberá o QR Code para pagamento instantâneo.
                        Ganhe 5% de desconto adicional pagando via PIX!
                      </p>
                    </div>
                  )}

                  {paymentMethod === "bank_transfer" && (
                    <div className="bg-purple-50 p-4 rounded-lg border">
                      <h4 className="font-semibold text-purple-800 mb-2">Transferência Bancária</h4>
                      <p className="text-purple-700 text-sm">
                        Você receberá por email os dados bancários para transferência.
                        O prazo para confirmação é de até 2 dias úteis.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Resumo da reserva */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo da reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Detalhes do passeio */}
                <div className="space-y-3">
                  <h3 className="font-semibold">{bookingData.passeioNome}</h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(bookingData.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{bookingData.pessoas} {bookingData.pessoas === 1 ? 'pessoa' : 'pessoas'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{bookingData.tipoReserva}</Badge>
                      {bookingData.desconto > 0 && <Badge className="bg-green-600">10% OFF</Badge>}
                    </div>
                  </div>
                </div>

                {/* Informações do cliente */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Dados do cliente</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Nome:</strong> {bookingData.cliente.nome}</p>
                    <p><strong>Email:</strong> {bookingData.cliente.email}</p>
                    {bookingData.cliente.telefone && (
                      <p><strong>Telefone:</strong> {bookingData.cliente.telefone}</p>
                    )}
                  </div>
                </div>

                {/* Cálculo do preço */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({bookingData.pessoas}x)</span>
                      <span>€ {bookingData.valorOriginal.toFixed(2)}</span>
                    </div>
                    {bookingData.desconto > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto grupo (10%)</span>
                        <span>-€ {(bookingData.valorOriginal * bookingData.desconto).toFixed(2)}</span>
                      </div>
                    )}
                    {paymentMethod === "pix" && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto PIX (5%)</span>
                        <span>-€ {(bookingData.valorTotal * 0.05).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>€ {valorComPix.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                  size="lg"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Confirmar pagamento
                    </div>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>🔒 Pagamento 100% seguro</p>
                  <p>Seus dados estão protegidos</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
