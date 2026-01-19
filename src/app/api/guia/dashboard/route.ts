export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🎯 Iniciando busca de dados do dashboard do guia...");

    const { searchParams } = new URL(request.url);
    const guiaId = searchParams.get("guiaId");

    if (!guiaId) {
      return NextResponse.json({ error: "ID do guia é obrigatório" }, { status: 400 });
    }

    console.log("👤 Buscando dados para guia:", guiaId);

    // 1. Buscar dados do guia na tabela users primeiro
    const usuario = await prisma.user.findUnique({
      where: { id: guiaId },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Guia não encontrado" }, { status: 404 });
    }

    if (usuario.userType !== 'guia') {
      return NextResponse.json({ error: "Usuário não é um guia" }, { status: 404 });
    }

    // 2. Tentar buscar dados extras na tabela guias (se existir)
    const guiaExtra = await prisma.guia.findUnique({
      where: { id: guiaId },
    });

    // Combinar dados do usuário com dados extras do guia (se houver)
    const guia = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      avaliacaoMedia: guiaExtra?.avaliacaoMedia || 4.5, // Valor padrão
      totalAvaliacoes: guiaExtra?.totalAvaliacoes || 0,
      comissaoTotal: guiaExtra?.comissaoTotal || 0,
      percentualComissao: guiaExtra?.percentualComissao || 30
    };

    // 3. Buscar agendamentos do guia com joins manuais (Prisma style)
    const agendamentosList = await prisma.agendamento.findMany({
      where: { guiaId },
    });

    // Since we don't have relations defined in Prisma schema yet to keep it simple, 
    // we'll fetch related data if needed or just use what we have.
    // The previous code used leftJoin. Let's simulate that logic.

    const agendamentosComDetalhes = await Promise.all(agendamentosList.map(async (agendamento) => {
      const [passeio, cliente] = await Promise.all([
        prisma.passeio.findUnique({ where: { id: agendamento.passeioId } }),
        agendamento.clienteId ? prisma.cliente.findUnique({ where: { id: agendamento.clienteId } }) : null
      ]);

      return {
        ...agendamento,
        passeioNome: passeio?.nome,
        clienteNome: cliente?.nome,
        clienteTelefone: cliente?.telefone
      };
    }));

    console.log("📊 Resultado busca agendamentos:", agendamentosComDetalhes.length);

    // 3. Calcular estatísticas
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const agendamentosMes = agendamentosComDetalhes.filter(a => {
      const dataPasseio = new Date(a.dataPasseio);
      return dataPasseio >= inicioMes && dataPasseio <= fimMes;
    });

    const agendamentosConcluidos = agendamentosComDetalhes.filter(a => a.status === 'concluido' || a.status === 'concluidas');
    const receitaMes = agendamentosMes
      .filter(a => a.status === 'concluido' || a.status === 'concluidas')
      .reduce((total, a) => total + (a.valorComissao || 0), 0);

    // 4. Organizar agendamentos por status
    const agendamentosPorStatus = {
      pendentes: agendamentosComDetalhes.filter(a => a.status === 'pendente_cliente' || a.status === 'pendente'),
      confirmados: agendamentosComDetalhes.filter(a => a.status === 'confirmado' || a.status === 'confirmadas'),
      emAndamento: agendamentosComDetalhes.filter(a => a.status === 'em_progresso'),
      concluidos: agendamentosConcluidos,
      cancelados: agendamentosComDetalhes.filter(a => a.status === 'cancelado' || a.status === 'canceladas')
    };

    // 5. Formatar dados para o frontend
    const formatarAgendamento = (agendamento: any) => ({
      id: agendamento.id,
      passeio_nome: agendamento.passeioNome || "Passeio não informado",
      cliente_nome: agendamento.clienteNome || "Cliente não informado",
      cliente_telefone: agendamento.clienteTelefone || "",
      data_passeio: agendamento.dataPasseio,
      horario_inicio: agendamento.horarioInicio || "08:00",
      horario_fim: agendamento.horarioFim || "18:00",
      numero_pessoas: agendamento.numeroPessoas || 1,
      valor_total: agendamento.valorTotal || 0,
      valor_comissao: agendamento.valorComissao || 0,
      status: agendamento.status,
      observacoes: agendamento.observacoes
    });

    const dashboardData = {
      success: true,
      stats: {
        totalAgendamentos: agendamentosConcluidos.length,
        agendamentosMes: agendamentosMes.length,
        receitaMes: receitaMes,
        avaliacaoMedia: guia.avaliacaoMedia || 0,
        totalAvaliacoes: guia.totalAvaliacoes || 0
      },
      agendamentos: {
        pendentes: agendamentosPorStatus.pendentes.map(formatarAgendamento),
        confirmados: agendamentosPorStatus.confirmados.map(formatarAgendamento),
        emAndamento: agendamentosPorStatus.emAndamento.map(formatarAgendamento),
        concluidos: agendamentosPorStatus.concluidos.map(formatarAgendamento),
        cancelados: agendamentosPorStatus.cancelados.map(formatarAgendamento)
      }
    };

    console.log("✅ Dashboard do guia carregado com sucesso");
    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error("💥 Erro geral ao carregar dashboard do guia:", error);
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
