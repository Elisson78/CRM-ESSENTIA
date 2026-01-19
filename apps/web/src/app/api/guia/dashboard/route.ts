import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🎯 Iniciando busca de dados do dashboard do guia via SQL...");

    const { searchParams } = new URL(request.url);
    const guiaId = searchParams.get("guiaId");

    if (!guiaId) {
      return NextResponse.json({ error: "ID do guia é obrigatório" }, { status: 400 });
    }

    console.log("👤 Buscando dados para guia:", guiaId);

    // 1. Buscar dados do guia na tabela users primeiro
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [guiaId]);
    const usuario = userRes.rows[0];

    if (!usuario) {
      return NextResponse.json({ error: "Guia não encontrado" }, { status: 404 });
    }

    if (usuario.user_type !== 'guia') {
      return NextResponse.json({ error: "Usuário não é um guia" }, { status: 404 });
    }

    // 2. Tentar buscar dados extras na tabela guias (se existir)
    const guiaExtraRes = await db.query('SELECT * FROM guias WHERE id = $1', [guiaId]);
    const guiaExtra = guiaExtraRes.rows[0];

    // Combinar dados do usuário com dados extras do guia (se houver)
    // Note: DB columns are snake_case. Mapping to API camelCase expectation.
    const guia = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      avaliacaoMedia: guiaExtra?.avaliacao_media || 4.5,
      totalAvaliacoes: guiaExtra?.total_avaliacoes || 0,
      comissaoTotal: guiaExtra?.comissao_total || 0,
      percentualComissao: guiaExtra?.percentual_comissao || 30
    };

    // 3. Buscar agendamentos do guia com joins manuais (SQL style)
    const agendamentosQuery = `
        SELECT 
            a.id,
            a.data_passeio,
            a.horario_inicio,
            a.horario_fim,
            a.numero_pessoas,
            a.valor_total,
            a.valor_comissao,
            a.status,
            a.observacoes,
            p.nome as passeio_nome,
            c.nome as cliente_nome,
            c.telefone as cliente_telefone
        FROM agendamentos a
        LEFT JOIN passeios p ON a.passeio_id = p.id
        LEFT JOIN clientes c ON a.cliente_id = c.id
        WHERE a.guia_id = $1
    `;

    const agendamentosRes = await db.query(agendamentosQuery, [guiaId]);
    const agendamentosComDetalhes = agendamentosRes.rows;

    console.log("📊 Resultado busca agendamentos:", agendamentosComDetalhes.length);

    // 3. Calcular estatísticas
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const agendamentosMes = agendamentosComDetalhes.filter(a => {
      // Check for valid date
      if (!a.data_passeio) return false;
      const dataPasseio = new Date(a.data_passeio);
      return dataPasseio >= inicioMes && dataPasseio <= fimMes;
    });

    const agendamentosConcluidos = agendamentosComDetalhes.filter(a => a.status === 'concluido' || a.status === 'concluidas');

    const receitaMes = agendamentosMes
      .filter(a => a.status === 'concluido' || a.status === 'concluidas')
      .reduce((total, a) => total + (parseFloat(a.valor_comissao) || 0), 0);

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
      passeio_nome: agendamento.passeio_nome || "Passeio não informado",
      cliente_nome: agendamento.cliente_nome || "Cliente não informado",
      cliente_telefone: agendamento.cliente_telefone || "",
      data_passeio: agendamento.data_passeio,
      horario_inicio: agendamento.horario_inicio || "08:00",
      horario_fim: agendamento.horario_fim || "18:00",
      numero_pessoas: agendamento.numero_pessoas || 1,
      valor_total: agendamento.valor_total || 0,
      valor_comissao: agendamento.valor_comissao || 0,
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
    console.error("💥 Erro geral ao carregar dashboard do guia (SQL):", error);
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
