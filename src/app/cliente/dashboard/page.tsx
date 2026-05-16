"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removido import de Tabs que não existe
import {
  User,
  Calendar,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Download,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Lock,
  Mail,
  Phone,
  Edit,
  LogOut
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  criadoEm: string;
}

interface Reserva {
  id: string;
  passeioNome: string;
  data: string;
  pessoas: number;
  valorTotal: number;
  status: string;
  metodoPagamento: string;
  criadoEm: string;
}

export default function ClienteDashboard() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showPassword, setShowPassword] = useState(false);
  const [senhaTemporaria, setSenhaTemporaria] = useState("");
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });
  const [perfilForm, setPerfilForm] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    endereco: ""
  });

  useEffect(() => {
    carregarDadosCliente();
  }, []);

  const carregarDadosCliente = async () => {
    try {
      // Buscar dados do cliente e reservas
      const clienteData = localStorage.getItem('clienteLogado');
      const senhaTemp = localStorage.getItem('senhaTemporaria');
      
      if (clienteData) {
        const dadosCliente = JSON.parse(clienteData);
        setCliente(dadosCliente);
        setPerfilForm({
          nome: dadosCliente.nome || "",
          telefone: dadosCliente.telefone || "",
          cpf: dadosCliente.cpf || "",
          endereco: dadosCliente.endereco || ""
        });

        // Buscar reservas do cliente (mockado para teste)
        if (dadosCliente.id.includes('teste')) {
          // Dados mockados para teste
          const reservasMock = [{
            id: 'agend_teste_123',
            passeioNome: 'Veneza Romântica',
            data: '2025-11-01',
            pessoas: 1,
            valorTotal: 171.00,
            status: 'confirmadas',
            metodoPagamento: 'pix',
            criadoEm: new Date().toISOString()
          }];
          setReservas(reservasMock);
        } else {
          // API real para clientes reais
          const reservasResponse = await fetch(`/api/cliente/reservas?clienteId=${dadosCliente.id}`);
          if (reservasResponse.ok) {
            const reservasData = await reservasResponse.json();
            setReservas(reservasData);
          }
        }
      }
      
      if (senhaTemp) {
        setSenhaTemporaria(senhaTemp);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const alterarSenha = async () => {
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert('Nova senha e confirmação não coincidem');
      return;
    }

    if (!cliente?.id) {
      alert('Erro: dados do cliente não encontrados');
      return;
    }

    try {
      const response = await fetch('/api/cliente/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: cliente.id,
          senhaAtual: senhaForm.senhaAtual,
          novaSenha: senhaForm.novaSenha
        })
      });

      if (response.ok) {
        alert('Senha alterada com sucesso!');
        setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setSenhaTemporaria(""); // Remove senha temporária
        localStorage.removeItem('senhaTemporaria');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar senha');
    }
  };

  const atualizarPerfil = async () => {
    if (!cliente?.id) {
      alert('Erro: dados do cliente não encontrados');
      return;
    }

    try {
      const response = await fetch('/api/cliente/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...perfilForm,
          clienteId: cliente.id
        })
      });

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        carregarDadosCliente();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  const baixarRecibo = (reservaId: string) => {
    // Implementar download do recibo
    window.open(`/api/cliente/recibo/${reservaId}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteLogado');
    localStorage.removeItem('senhaTemporaria');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Olá, {cliente?.nome}! 👋</h1>
              <p className="text-gray-600">Bem-vindo ao seu dashboard pessoal</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Cliente Ativo</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {senhaTemporaria && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-800">Senha Temporária</p>
                  <p className="text-orange-700 text-sm">
                    Sua senha temporária é: <strong>{senhaTemporaria}</strong>
                  </p>
                  <p className="text-orange-600 text-xs mt-1">Por segurança, altere sua senha na aba "Configurações"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" /> Dashboard
          </Button>
          <Button
            variant={activeTab === "reservas" ? "default" : "outline"}
            onClick={() => setActiveTab("reservas")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Minhas Reservas
          </Button>
          <Button
            variant={activeTab === "perfil" ? "default" : "outline"}
            onClick={() => setActiveTab("perfil")}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Editar Perfil
          </Button>
          <Button
            variant={activeTab === "configuracoes" ? "default" : "outline"}
            onClick={() => setActiveTab("configuracoes")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" /> Configurações
          </Button>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reservas.length}</div>
                  <p className="text-xs text-muted-foreground">Reservas realizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total Gasto</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€ {reservas.reduce((total, r) => total + r.valorTotal, 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Em todas as reservas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cliente desde</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {cliente?.criadoEm ? format(new Date(cliente.criadoEm), "MMM yyyy", { locale: ptBR }) : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">Data de cadastro</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Últimas Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                {reservas.slice(0, 3).map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{reserva.passeioNome}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(reserva.data), "dd/MM/yyyy", { locale: ptBR })} • {reserva.pessoas} pessoas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€ {reserva.valorTotal.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs">{reserva.status}</Badge>
                    </div>
                  </div>
                ))}
                {reservas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma reserva encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "reservas" && (
          <Card>
            <CardHeader>
              <CardTitle>Todas as Minhas Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{reserva.passeioNome}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(reserva.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {reserva.pessoas} pessoas
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {reserva.metodoPagamento}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{reserva.status}</Badge>
                          <span className="text-lg font-bold text-green-600">€ {reserva.valorTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => baixarRecibo(reserva.id)}
                        className="ml-4"
                      >
                        <Download className="h-4 w-4 mr-2" /> Recibo
                      </Button>
                    </div>
                  </div>
                ))}
                {reservas.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhuma reserva encontrada</p>
                    <p className="text-sm">Faça sua primeira reserva para vê-la aqui!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "perfil" && (
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={perfilForm.nome}
                    onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={perfilForm.telefone}
                    onChange={(e) => setPerfilForm({ ...perfilForm, telefone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={perfilForm.cpf}
                    onChange={(e) => setPerfilForm({ ...perfilForm, cpf: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={perfilForm.endereco}
                    onChange={(e) => setPerfilForm({ ...perfilForm, endereco: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email (não editável)</Label>
                <Input id="email" value={cliente?.email || ""} disabled className="mt-1 bg-gray-100" />
              </div>
              <Button onClick={atualizarPerfil} className="bg-orange-500 hover:bg-orange-600">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "configuracoes" && (
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative mt-1">
                  <Input
                    id="senhaAtual"
                    type={showPassword ? "text" : "password"}
                    value={senhaForm.senhaAtual}
                    onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })}
                    placeholder={senhaTemporaria ? `Use: ${senhaTemporaria}` : "Digite sua senha atual"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={senhaForm.novaSenha}
                  onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={senhaForm.confirmarSenha}
                  onChange={(e) => setSenhaForm({ ...senhaForm, confirmarSenha: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={alterarSenha} className="bg-orange-500 hover:bg-orange-600">
                <Lock className="h-4 w-4 mr-2" /> Alterar Senha
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
