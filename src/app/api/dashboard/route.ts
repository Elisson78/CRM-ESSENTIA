export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [allUsers, totalPasseios, allAgendamentos] = await Promise.all([
      prisma.user.findMany({ select: { userType: true } }),
      prisma.passeio.count(),
      prisma.agendamento.findMany()
    ]);

    const totalClientes = allUsers.filter((u) => u.userType === "cliente").length;
    const totalGuias = allUsers.filter((u) => u.userType === "guia").length;
    const totalAdmins = allUsers.filter((u) => u.userType === "admin").length;

    const agendamentosHoje = allAgendamentos.filter((a) => a.dataPasseio === todayKey).length;

    // Filter agendamentos for current month
    const agendamentosMes = allAgendamentos.filter((a) => {
      const d = new Date(a.dataPasseio);
      return d >= currentMonthStart && d <= currentMonthEnd;
    }).length;

    const agendamentosPendentes = allAgendamentos.filter((a) => a.status === "pendente_cliente" || a.status === "pendente").length;

    // Approximating revenue from agendamentos (completed ones) for current month
    const receitaMes = allAgendamentos
      .filter((a) => {
        const d = new Date(a.dataPasseio);
        return d >= currentMonthStart && d <= currentMonthEnd && (a.status === 'concluido' || a.status === 'confirmado');
      })
      .reduce((sum, a) => sum + (a.valorTotal || 0), 0);

    return NextResponse.json(
      {
        totalClientes,
        totalGuias,
        totalAdmins,
        totalPasseios,
        agendamentosHoje,
        agendamentosMes,
        receitaMes,
        agendamentosPendentes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);

    return NextResponse.json(
      {
        totalClientes: 0,
        totalGuias: 0,
        totalAdmins: 0,
        totalPasseios: 0,
        agendamentosHoje: 0,
        agendamentosMes: 0,
        receitaMes: 0,
        agendamentosPendentes: 0,
      },
      { status: 200 },
    );
  }
}
