"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Home, MapPin, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Hotel } from "@/types/agendamentos";
import { getHoteis, saveHotelAction, deleteHotelAction } from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const HoteisPage: React.FC = () => {
    const [hoteis, setHoteis] = useState<Hotel[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchHoteis = async () => {
        setIsLoading(true);
        const data = await getHoteis();
        setHoteis(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchHoteis();
    }, []);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: Partial<Hotel> = {
            id: editingHotel?.id,
            nome: formData.get("nome") as string,
            endereco: formData.get("endereco") as string,
            cidade: formData.get("cidade") as string,
            telefone: formData.get("telefone") as string,
        };

        startTransition(async () => {
            const result = await saveHotelAction(data);
            if (result.success) {
                toast.success(editingHotel ? "Hotel atualizado" : "Hotel criado");
                setIsModalOpen(false);
                setEditingHotel(null);
                fetchHoteis();
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este hotel?")) return;
        
        const result = await deleteHotelAction(id);
        if (result.success) {
            toast.success("Hotel excluído");
            fetchHoteis();
        } else {
            toast.error(result.error);
        }
    };

    const filteredHoteis = Array.isArray(hoteis) ? hoteis.filter(h => 
        h.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Home className="h-6 w-6 text-blue-600" />
                        Gestão de Hotéis
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Cadastre e gerencie os hotéis utilizados nos roteiros.
                    </p>
                </div>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                        setEditingHotel(null);
                        setIsModalOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Hotel
                </Button>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Buscar por nome ou cidade..."
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
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Endereço/Cidade</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Telefone</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            Carregando hotéis...
                                        </td>
                                    </tr>
                                ) : filteredHoteis.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            Nenhum hotel encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHoteis.map((hotel) => (
                                        <tr key={hotel.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">{hotel.nome}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {hotel.endereco || "N/A"}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{hotel.cidade || ""}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {hotel.telefone || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingHotel(hotel);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(hotel.id)}
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
                        <DialogTitle>{editingHotel ? "Editar Hotel" : "Novo Hotel"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Hotel *</Label>
                            <Input id="nome" name="nome" defaultValue={editingHotel?.nome} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input id="endereco" name="endereco" defaultValue={editingHotel?.endereco} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" name="cidade" defaultValue={editingHotel?.cidade} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" name="telefone" defaultValue={editingHotel?.telefone} />
                            </div>
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

export default HoteisPage;
