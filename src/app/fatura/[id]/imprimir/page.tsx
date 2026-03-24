import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/print-button';

export default async function FaturaPrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const faturaId = params.id;

  const result = await db.query(`
    SELECT f.*, c.nome as cliente_nome, c.email as cliente_email, c.telefone as cliente_telefone, c.endereco as cliente_endereco
    FROM faturas f
    LEFT JOIN clientes c ON f.cliente_id = c.id
    WHERE f.id = $1
  `, [faturaId]);

  if (result.rows.length === 0) {
    return notFound();
  }

  const fatura = result.rows[0];

  const itensResult = await db.query(`
    SELECT * FROM fatura_itens WHERE fatura_id = $1
  `, [faturaId]);

  const itens = itensResult.rows;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const formatEuro = (value: number) => {
    return Number(value).toFixed(2) + '€';
  };

  const formatBrl = (value: number) => {
    return Number(value).toFixed(0) + ' reais';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 print:py-0 print:bg-white font-sans text-gray-800">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            margin: 0;
            padding: 0;
          }
        }
      `}} />
      {/* Container A4 */}
      <div id="print-area" className="bg-white w-[210mm] min-h-[297mm] shadow-xl p-16 print:shadow-none print:w-auto print:min-h-0 print:p-0 mx-auto relative">
        
        {/* Print Button (Hidden on Print) */}
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        {/* Header (Company Logo) */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#14532d] tracking-tight">
              <span className="text-[#991b1b] text-4xl mr-1">✿</span>
              Marise Nakagawa
            </h1>
          </div>
          <div className="text-sm text-gray-900 font-semibold mb-1 tracking-wide">
            Guia e receptivo na Toscana
          </div>
          <div className="text-xs text-gray-700 font-semibold mb-1">
            mariseinflorence@gmail.com
          </div>
          <div className="text-xs text-gray-700 font-bold mb-1">
            P.Iva: 05603120485
          </div>
          <div className="text-xs text-gray-700 font-bold">
            C.F.: NKGMRS70S46Z602U
          </div>
        </div>

        {/* Client & Invoice Info */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-xs w-1/2 pr-8">
            <h2 className="font-bold tracking-widest text-gray-900 mb-3 uppercase">Emitido Para:</h2>
            <div className="text-gray-800 uppercase tracking-wider leading-relaxed font-medium">
              <div>{fatura.cliente_nome}</div>
              {fatura.cliente_endereco ? (
                <div>{fatura.cliente_endereco}</div>
              ) : (
                <div className="text-gray-400">Rua e Endereço não informado</div>
              )}
            </div>
          </div>
          
          <div className="text-xs w-1/2 text-right">
            <div className="flex justify-end items-end gap-3 mb-6">
              <h2 className="font-bold tracking-widest text-gray-900 uppercase">Fattura N.:</h2>
              <span className="font-bold text-sm tracking-widest">{fatura.fatura_numero}</span>
            </div>
            
            <table className="w-full text-right ml-auto" style={{ maxWidth: '200px' }}>
              <tbody>
                <tr>
                  <td className="uppercase tracking-widest text-gray-600 font-semibold py-1 pr-4">Date:</td>
                  <td className="font-medium tracking-wider">{formatDate(fatura.data_emissao)}</td>
                </tr>
                <tr>
                  <td className="uppercase tracking-widest text-gray-600 font-semibold py-1 pr-4">Due Date:</td>
                  <td className="font-medium tracking-wider">{formatDate(fatura.data_vencimento)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table line decor */}
        <div className="w-full h-8 bg-[#e8e1da] mb-8"></div>

        {/* Invoice Items Table */}
        <div className="mb-4">
          <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 px-2">
            <div className="col-span-6">Serviço</div>
            <div className="col-span-4">Fornecedor</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-6 px-2 mb-10 text-xs font-medium tracking-wide leading-relaxed text-gray-800">
            {itens.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-6 pr-4">{item.servico_descricao}</div>
                <div className="col-span-4 pr-2 whitespace-pre-wrap">{item.fornecedor || '-'}</div>
                <div className="col-span-2 text-right font-semibold">{formatEuro(item.valor_eur)}</div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="grid grid-cols-12 px-2 mt-12 mb-16 text-xs font-bold uppercase tracking-widest text-gray-900">
            <div className="col-span-10 text-left">Subtotal</div>
            <div className="col-span-2 text-right">{formatEuro(fatura.total_eur)}</div>
          </div>
        </div>

        {/* Cambial Rate */}
        <div className="text-right text-xs font-medium tracking-wider text-gray-700 mb-2 px-2">
          taxa câmbio turismo: {Number(fatura.cotacao_cambio_turismo).toFixed(2).replace('.', ',')} reais
        </div>

        {/* Line decor bottom */}
        <div className="w-full h-8 bg-[#e8e1da] mb-4"></div>

        {/* Final Totals */}
        <div className="flex flex-col items-end px-2 space-y-4 mb-20">
          <div className="flex justify-between w-48 text-xs font-bold uppercase tracking-widest">
            <span>Total</span>
          </div>
          <div className="font-bold text-sm tracking-widest">
            {formatEuro(fatura.total_eur)}
          </div>
          <div className="font-bold text-sm tracking-widest">
            {formatBrl(fatura.total_brl)}
          </div>
        </div>

        {/* Footer info (Bank info) */}
        <div className="text-xs tracking-wider leading-relaxed px-2 font-medium">
          <h3 className="font-bold uppercase tracking-widest text-gray-900 mb-3">Conta para a transferência</h3>
          <div className="text-gray-800 uppercase">
            <div>Banco do Brasil</div>
            <div>Câmbio do turismo</div>
            <div>Chave pix: 11510084860</div>
            <div>CPF Marise da Silva Nakagawa</div>
          </div>
        </div>

      </div>
    </div>
  );
}
