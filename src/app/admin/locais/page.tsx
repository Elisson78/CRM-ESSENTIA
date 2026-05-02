"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, MapPin, Info } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Local } from "@/types/agendamentos";
import { getLocais, saveLocalAction, deleteLocalAction } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LocaisPage: React.FC = () => {
    const [locais, setLocais] = useState<Local[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocal, setEditingLocal] = useState<Local | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchLocais = async () => {
        setIsLoading(true);
        const data = await getLocais();
        setLocais(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLocais();
    }, []);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<Local> = {
            id: editingLocal?.id,
            nome: formData.get("nome") as string,
            descricao: formData.get("descricao") as string,
        };

        startTransition(async () => {
            const result = await saveLocalAction(data);
            if (result.success) {
                toast.success(editingLocal ? "Local atualizado" : "Local criado");
                setIsModalOpen(false);
                setEditingLocal(null);
                fetchLocais();
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este local?")) return;
        
        const result = await deleteLocalAction(id);
        if (result.success) {
            toast.success("Local excluído");
            fetchLocais();
        } else {
            toast.error(result.error);
        }
    };

    const filteredLocais = Array.isArray(locais) ? locais.filter(l => 
        l.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        Gestão de Locais
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Gerencie destinos e pontos de encontro para os passeios.
                    </p>
                </div>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                        setEditingLocal(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Local
                </Button>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Buscar por nome..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Descrição</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-500">
                                            Carregando locais...
                                        </td>
                                    </tr>
                                ) : filteredLocais.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-500">
                                            Nenhum local encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLocais.map((local) => (
                                        <tr key={local.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">{local.nome}</td>
                                            <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                                                {local.descricao || "-"}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingLocal(local);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(local.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLocal ? "Editar Local" : "Novo Local"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Local *</Label>
                            <Input id="nome" name="nome" defaultValue={editingLocal?.nome} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea id="descricao" name="descricao" defaultValue={editingLocal?.descricao} rows={4} />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LocaisPage;
