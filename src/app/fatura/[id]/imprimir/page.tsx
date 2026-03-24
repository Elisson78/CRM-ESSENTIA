import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/print-button';

export default async function FaturaPrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const faturaId = params.id;

  const result = await db.query(`
    SELECT f.*, 
           COALESCE(c.nome, u.nome) as cliente_nome, 
           COALESCE(c.email, u.email) as cliente_email, 
           COALESCE(c.telefone, u.telefone) as cliente_telefone, 
           c.endereco as cliente_endereco, 
           c.cpf as cliente_cpf
    FROM faturas f
    LEFT JOIN clientes c ON f.cliente_id = c.id
    LEFT JOIN users u ON f.cliente_id = u.id
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

  const configResult = await db.query('SELECT * FROM empresa_configuracoes WHERE id = 1');
  const empresa = configResult.rows[0] || {
    razao_social: "Essentia Travel", slogan: "", email: "", telefone: "",
    p_iva: "", c_f: "", banco_nome: "", banco_conta: "", banco_pix: "", banco_beneficiario: ""
  };

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
          @page { size: A4; margin: 5mm; }
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
            width: 200mm;
            min-height: 287mm;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
        }
        .print-exact {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}} />

      {/* Container A4 */}
      <div id="print-area" className="bg-white w-[210mm] min-h-[297mm] shadow-xl pt-16 pb-16 px-16 print:shadow-none print:w-[200mm] print:p-8 mx-auto relative font-sans text-gray-800">
        
        {/* Print Button (Hidden on Print) */}
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-8">
          {/* Company Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 mb-2">
              <span className="text-[#991b1b] text-3xl">✿</span>
              {empresa.razao_social || 'Essentia CRM'}
            </h1>
            <div className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-widest pl-1">
              {empresa.slogan}
            </div>
            <div className="text-xs text-gray-700 leading-relaxed font-medium pl-1">
              {empresa.endereco_completo && <div>{empresa.endereco_completo}</div>}
              {empresa.email && <div>Email: {empresa.email}</div>}
              {empresa.telefone && <div>Tel: {empresa.telefone}</div>}
            </div>
          </div>

          {/* Invoice Labels */}
          <div className="text-right flex flex-col items-end">
            <h2 className="text-4xl font-light text-gray-300 tracking-widest uppercase mb-6">Fatura</h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-900 mb-1.5">
              <span className="text-gray-400 uppercase tracking-widest w-24 text-right">Nº Doc:</span>
              <span className="w-24 text-right">{fatura.fatura_numero}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-800 mb-1.5">
              <span className="text-gray-400 uppercase tracking-widest w-24 text-right">Emissão:</span>
              <span className="w-24 text-right">{formatDate(fatura.data_emissao)}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-800">
              <span className="text-gray-400 uppercase tracking-widest w-24 text-right">Vencimento:</span>
              <span className="w-24 text-right">{formatDate(fatura.data_vencimento)}</span>
            </div>
          </div>
        </div>

        {/* Client & Tax Info */}
        <div className="flex justify-between items-start mb-14">
          <div className="w-1/2">
            <h3 className="text-[10px] font-bold tracking-widest text-[#991b1b] mb-3 uppercase">Faturado Para</h3>
            <div className="text-sm font-bold text-gray-900 mb-1.5 uppercase tracking-wide">
              {fatura.cliente_nome}
            </div>
            <div className="text-xs text-gray-600 leading-relaxed max-w-[250px] whitespace-pre-wrap">
              {fatura.cliente_endereco || 'Endereço não informado'}
            </div>
            {fatura.cliente_cpf && (
              <div className="text-xs text-gray-800 mt-2 font-semibold">
                <span className="text-gray-400 font-medium">DOC: </span> {fatura.cliente_cpf}
              </div>
            )}
          </div>
          <div className="w-1/2 text-right">
            <h3 className="text-[10px] font-bold tracking-widest text-[#991b1b] mb-3 uppercase">Dados Fiscais Emissor</h3>
            {empresa.p_iva && (
              <div className="text-xs text-gray-800 font-bold mb-1.5">
                <span className="text-gray-400 font-medium mr-2">P.IVA:</span> {empresa.p_iva}
              </div>
            )}
            {empresa.c_f && (
              <div className="text-xs text-gray-800 font-bold">
                <span className="text-gray-400 font-medium mr-2">C.F:</span> {empresa.c_f}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10 min-h-[300px]">
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="border-y-2 border-gray-900 print-exact bg-gray-50 uppercase tracking-widest">
                <th className="py-3 px-3 font-bold text-gray-900 w-3/5">Descrição dos Serviços</th>
                <th className="py-3 px-3 font-bold text-gray-900 text-center">Fornecedor</th>
                <th className="py-3 px-3 font-bold text-gray-900 text-right">Valor (EUR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 print-exact">
                  <td className="py-4 px-3 text-gray-800 font-medium leading-relaxed pr-8">{item.servico_descricao}</td>
                  <td className="py-4 px-3 text-gray-500 text-center">{item.fornecedor || '-'}</td>
                  <td className="py-4 px-3 text-gray-900 font-bold text-right tracking-wide">{formatEuro(item.valor_eur)}</td>
                </tr>
              ))}
              {itens.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400 italic">Nenhum item adicionado a esta fatura</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Box */}
          <div className="flex justify-end mt-12">
            <div className="w-full max-w-[320px]">
              <div className="flex justify-between py-2 text-xs text-gray-600 font-medium border-b border-gray-100">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span className="text-gray-900">{formatEuro(fatura.total_eur)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-xs text-gray-500 italic border-b border-gray-100">
                <span>Câmbio Turismo Aplicado</span>
                <span>R$ {Number(fatura.cotacao_cambio_turismo).toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between py-4 text-sm font-black text-gray-900 border-b-2 border-gray-900">
                <span className="uppercase tracking-widest text-[#14532d]">Total Devido (EUR)</span>
                <span className="text-base">{formatEuro(fatura.total_eur)}</span>
              </div>
              <div className="flex justify-between py-3.5 text-xs font-bold text-[#14532d] bg-green-50 px-4 mt-4 print-exact rounded-sm shadow-sm print:shadow-none border border-green-100">
                <span className="uppercase tracking-widest">Equivalente Real</span>
                <span className="text-sm">{formatBrl(fatura.total_brl)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Bank info) */}
        <div className="mt-20 pt-8 border-t-2 border-gray-100">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Instruções de Pagamento / Transferência</h3>
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-x-12 gap-y-4 text-xs text-gray-800 font-medium">
            {empresa.banco_nome && <div><span className="text-gray-400 font-normal mr-2">Banco:</span><span className="font-bold">{empresa.banco_nome}</span></div>}
            {empresa.banco_conta && <div><span className="text-gray-400 font-normal mr-2">Ag/Conta:</span><span className="font-bold">{empresa.banco_conta}</span></div>}
            {empresa.banco_pix && <div><span className="text-gray-400 font-normal mr-2">PIX/IBAN:</span><span className="font-bold">{empresa.banco_pix}</span></div>}
            {empresa.banco_beneficiario && <div><span className="text-gray-400 font-normal mr-2">Titular:</span><span className="uppercase tracking-wide">{empresa.banco_beneficiario}</span></div>}
          </div>
          <div className="text-[9px] text-gray-400 mt-10 md:text-center uppercase tracking-widest font-semibold flex justify-center items-center gap-2">
            <span className="w-12 h-[1px] bg-gray-200"></span>
            Documento Emitido Via Essentia CRM
            <span className="w-12 h-[1px] bg-gray-200"></span>
          </div>
        </div>

      </div>
    </div>
  );
}
