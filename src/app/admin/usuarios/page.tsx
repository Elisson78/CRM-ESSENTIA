"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'admin' | 'guia' | 'cliente';
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const UsersManagementPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    userType: "cliente" as 'admin' | 'guia' | 'cliente',
    password: ""
  });
  const [editUser, setEditUser] = useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    userType: "cliente" as 'admin' | 'guia' | 'cliente',
    password: ""
  });

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user && user.userType !== 'admin' && user.email !== 'admin@turguide.com') {
      router.push('/admin');
    }
  }, [user, router]);

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/users?t=${Date.now()}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      console.log('🚀 Iniciando criação de usuário...', {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType,
        hasPassword: !!newUser.password
      });

      // Validação dos campos obrigatórios
      if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.userType || !newUser.password) {
        alert('Por favor, preencha todos os campos obrigatórios incluindo a senha');
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        alert('Por favor, insira um email válido');
        return;
      }

      console.log('📤 Enviando requisição para criar usuário...');

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userType: newUser.userType,
          password: newUser.password,
        }),
      });

      console.log('📥 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      let result;
      try {
        const responseText = await response.text();
        console.log('📄 Resposta bruta:', responseText);
        result = JSON.parse(responseText);
        console.log('📊 Resultado parseado:', result);
      } catch (jsonError) {
        console.error('❌ Erro ao fazer parse do JSON:', jsonError);
        alert(`Erro na resposta do servidor. Status: ${response.status}`);
        return;
      }

      if (response.ok) {
        console.log('✅ Usuário criado com sucesso!');
        alert('Usuário criado com sucesso!');
        await fetchUsers();
        setIsCreateModalOpen(false);
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          userType: "cliente",
          password: ""
        });
      } else {
        console.error('❌ Erro na resposta:', result);
        const errorMessage = result.error || result.details || 'Erro desconhecido';
        alert(`Erro ao criar usuário: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Erro detalhado ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setEditUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      password: ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      console.log('Iniciando atualização de usuário...', { ...editUser, password: editUser.password ? '[HIDDEN]' : '[NOT_PROVIDED]' });

      // Validação dos campos obrigatórios (exceto senha que é opcional)
      if (!editUser.email || !editUser.firstName || !editUser.lastName || !editUser.userType) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUser.email)) {
        alert('Por favor, insira um email válido');
        return;
      }

      console.log('Enviando requisição para atualizar usuário...');

      const updateData: any = {
        id: editUser.id,
        email: editUser.email,
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        userType: editUser.userType,
      };

      // Só incluir senha se foi fornecida
      if (editUser.password.trim()) {
        updateData.password = editUser.password;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      console.log('Resposta recebida:', response.status, response.statusText);

      let result;
      try {
        result = await response.json();
        console.log('Resultado:', result);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON:', jsonError);
        alert('Erro na resposta do servidor');
        return;
      }

      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        await fetchUsers();
        setIsEditModalOpen(false);
        setEditingUser(null);
        setEditUser({
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          userType: "cliente",
          password: ""
        });
      } else {
        console.error('Erro na resposta:', result);
        alert(`Erro ao atualizar usuário: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao atualizar usuário:', error);
      alert(`Erro ao atualizar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteUser = async (user: Usuario) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      console.log('Iniciando exclusão de usuário:', user.id);

      const response = await fetch(`/api/users?id=${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log('Resposta recebida:', response.status, response.statusText);

      let result;
      try {
        result = await response.json();
        console.log('Resultado:', result);
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON:', jsonError);
        alert('Erro na resposta do servidor');
        return;
      }

      if (response.ok) {
        alert('Usuário excluído com sucesso!');
        await fetchUsers();
      } else {
        console.error('Erro na resposta:', result);
        alert(`Erro ao excluir usuário: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro detalhado ao excluir usuário:', error);
      alert(`Erro ao excluir usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'guia':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'cliente':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    console.log('🏷️ Gerando badge para tipo:', type, typeof type);

    const typeConfig = {
      admin: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Administrador",
        icon: <Shield className="h-3 w-3" />
      },
      guia: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Guia",
        icon: <UserCheck className="h-3 w-3" />
      },
      cliente: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Cliente",
        icon: <User className="h-3 w-3" />
      }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: type || "Indefinido",
      icon: <User className="h-3 w-3" />
    };

    console.log('🎨 Config do badge:', config);

    return (
      <Badge className={`${config.color} border font-medium px-2 py-1 inline-flex items-center gap-1.5`}>
        {config.icon}
        <span className="text-xs">{config.label}</span>
      </Badge>
    );
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 overflow-auto h-full">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie administradores, guias e clientes do sistema
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Senha"
                />
              </div>

              <div>
                <Label htmlFor="userType">Tipo de Usuário</Label>
                <Select value={newUser.userType} onValueChange={(value: any) => setNewUser({ ...newUser, userType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="guia">Guia</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>
                  Criar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">Nome</Label>
                  <Input
                    id="editFirstName"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Sobrenome</Label>
                  <Input
                    id="editLastName"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="editPassword">Nova Senha (opcional)</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>

              <div>
                <Label htmlFor="editUserType">Tipo de Usuário</Label>
                <Select value={editUser.userType} onValueChange={(value: any) => setEditUser({ ...editUser, userType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="guia">Guia</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser}>
                  Atualizar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.userType === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Guias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.userType === 'guia').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.userType === 'cliente').length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Tabela de usuários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagementPage;