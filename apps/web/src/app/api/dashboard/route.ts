import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Parallelize queries for performance
    const [usersResult, passeiosCountResult, agendamentosResult] = await Promise.all([
      db.query('SELECT user_type FROM users'),
      db.query('SELECT COUNT(*) FROM passeios'),
      db.query('SELECT * FROM agendamentos')
    ]);

    const allUsers = usersResult.rows;
    // count returns a string in pg
    const totalPasseios = parseInt(passeiosCountResult.rows[0].count, 10);
    const allAgendamentos = agendamentosResult.rows;

    // Filter users
    const totalClientes = allUsers.filter((u) => u.user_type === "cliente").length;
    const totalGuias = allUsers.filter((u) => u.user_type === "guia").length;
    const totalAdmins = allUsers.filter((u) => u.user_type === "admin").length;

    // Mapping Agendamentos DB columns to logic
    // DB: data_passeio, status, valor_total

    // Using data_passeio as confirmed in schema.

    const agendamentosHoje = allAgendamentos.filter((a) => {
      // Handle potential naming variations just in case
      const dateStr = a.data_passeio || '';
      return dateStr === todayKey;
    }).length;

    // Filter agendamentos for current month
    const agendamentosMes = allAgendamentos.filter((a) => {
      const dateStr = a.data_passeio || '';
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= currentMonthStart && d <= currentMonthEnd;
    }).length;

    const agendamentosPendentes = allAgendamentos.filter((a) =>
      (a.status === "pendente_cliente" || a.status === "pendente")
    ).length;

    // Revenue
    const receitaMes = allAgendamentos
      .filter((a) => {
        const dateStr = a.data_passeio || '';
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d >= currentMonthStart && d <= currentMonthEnd && (a.status === 'concluido' || a.status === 'confirmado');
      })
      .reduce((sum, a) => sum + (parseFloat(a.valor_total || '0') || 0), 0);

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
    console.error("Erro ao buscar estatísticas do dashboard (SQL):", error);

    // Return zero'd object on error to avoid 500 on frontend
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
