import React from 'react';
import { Tarefa } from '@/types/agendamentos';
import { MapPin, User, Users, Calendar, Clock, Building2, Info, Phone } from 'lucide-react';

interface VoucherImpressaoProps {
    tarefa: Tarefa;
}

const VoucherImpressao: React.FC<VoucherImpressaoProps> = ({ tarefa }) => {
    if (!tarefa) return null;

    return (
        <div className="voucher-print-container p-8 bg-white text-black font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tighter text-blue-900 mb-1">ESSENTIA CRM</h1>
                    <p className="text-sm text-gray-600 uppercase tracking-widest font-semibold">Ordem de Serviço / Voucher</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">Data de Emissão:</p>
                    <p className="text-sm">{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-gray-500 mt-1">Ref: {tarefa.id.substring(0, 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Tour Info */}
            <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informações do Passeio
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Passeio</p>
                        <p className="text-lg font-semibold">{tarefa.passeio_nome}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Data e Hora</p>
                        <p className="text-lg font-semibold">
                            {tarefa.data_passeio ? new Date(tarefa.data_passeio).toLocaleString('pt-BR', {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            }) : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pessoas</p>
                        <p className="text-lg font-semibold">{tarefa.numero_pessoas} {tarefa.numero_pessoas === 1 ? 'Pessoa' : 'Pessoas'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Guia</p>
                        <p className="text-lg font-semibold">{tarefa.guia_nome || 'Nenhum guia selecionado'}</p>
                    </div>
                </div>
            </div>

            {/* Logistics */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        HOTEL / PICKUP
                    </h3>
                    <p className="font-bold text-gray-900">{tarefa.hotel_nome || 'Não informado'}</p>
                    <p className="text-sm text-gray-600 mt-1 italic">Favor estar pronto 10min antes do horário agendado.</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        LOCAL / DESTINO
                    </h3>
                    <p className="font-bold text-gray-900">{tarefa.local_nome || 'Conforme roteiro'}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 border-2 border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-100 p-3 font-bold text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    DADOS DO CLIENTE
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Nome do Titular</p>
                        <p className="font-semibold">{tarefa.cliente_nome?.replace(' (Lead)', '')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Contato</p>
                        <p className="font-semibold">{tarefa.leadPhone || 'Verificar ficha do cliente'}</p>
                    </div>
                </div>
            </div>

            {/* Observations */}
            <div className="mb-12">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-orange-500" />
                    OBSERVAÇÕES E NOTAS ESPECIAIS
                </h3>
                <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg min-h-[100px] text-gray-700">
                    {tarefa.observacoes || 'Nenhuma observação especial para este passeio.'}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t pt-6 text-center text-xs text-gray-400">
                <p>Este documento é uma confirmação de serviço gerada pelo Essentia CRM.</p>
                <p className="mt-1">© 2026 Essentia Tour & Travel - Todos os direitos reservados.</p>
            </div>

            {/* CSS para Impressão - Abordagem mais agressiva para garantir visibilidade */}
            <style jsx global>{`
                @media screen {
                    .voucher-print-container {
                        display: none !important;
                    }
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    html, body {
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                    }
                    .voucher-print-container {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 1cm !important;
                        display: block !important;
                        background: white !important;
                        z-index: 9999999 !important;
                        visibility: visible !important;
                    }
                    .voucher-print-container * {
                        visibility: visible !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default VoucherImpressao;
