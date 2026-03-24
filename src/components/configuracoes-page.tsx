"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Building, Landmark, Text } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    razao_social: "", slogan: "", email: "", telefone: "",
    p_iva: "", c_f: "", endereco_completo: "",
    banco_nome: "", banco_agencia: "", banco_conta: "", banco_pix: "", banco_beneficiario: ""
  });

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/configuracoes");
      const data = await res.json();
      if (data.success && data.configuracoes) {
        // Garantindo que varíáveis null do banco virem strings vazias para o Input do React não dar Warn.
        const parsed = {...data.configuracoes};
        Object.keys(parsed).forEach(k => { if(parsed[k] === null) parsed[k] = "" });
        setFormData(parsed);
      }
    } catch (e) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/configuracoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar: " + data.error);
      }
    } catch (e) {
      toast.error("Erro interno do servidor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Carregando configurações...</div>;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
          <p className="text-gray-600 mt-2">Personalize os dados fiscais e bancários que aparecerão nas Notas/Faturas impressas.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-gray-500" /> Identidade Básica</CardTitle>
            <CardDescription>Nome, logo e contatos diretos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Nome / Razão Social</Label><Input name="razao_social" value={formData.razao_social} onChange={handleChange} /></div>
            <div className="space-y-1"><Label>Slogan / Subtítulo</Label><Input name="slogan" value={formData.slogan} onChange={handleChange} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Email de Contato</Label><Input name="email" value={formData.email} onChange={handleChange} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input name="telefone" value={formData.telefone} onChange={handleChange} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Text className="h-5 w-5 text-gray-500" /> Fiscal & Endereço</CardTitle>
            <CardDescription>Dados tributários essenciais (Itália/Brasil).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>P.Iva (VAT)</Label><Input name="p_iva" value={formData.p_iva} onChange={handleChange} /></div>
              <div className="space-y-1"><Label>Codice Fiscale (C.F)</Label><Input name="c_f" value={formData.c_f} onChange={handleChange} /></div>
            </div>
            <div className="space-y-1">
              <Label>Endereço Completo</Label>
              <textarea name="endereco_completo" value={formData.endereco_completo} onChange={handleChange} className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-gray-500" /> Formulário Bancário (Pagamentos)</CardTitle>
            <CardDescription>Estes dados serão fixados no rodapé esquerdo da fatura para o cliente pagar na sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>Nome do Banco</Label><Input name="banco_nome" value={formData.banco_nome} onChange={handleChange} placeholder="Ex: Banco do Brasil" /></div>
            <div className="space-y-1"><Label>Tipo / Agência / Conta</Label><Input name="banco_conta" value={formData.banco_conta} onChange={handleChange} placeholder="Ex: Câmbio do turismo" /></div>
            <div className="space-y-1"><Label>Chave PIX ou IBAN</Label><Input name="banco_pix" value={formData.banco_pix} onChange={handleChange} /></div>
            <div className="space-y-1"><Label>Nome do Beneficiário</Label><Input name="banco_beneficiario" value={formData.banco_beneficiario} onChange={handleChange} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
