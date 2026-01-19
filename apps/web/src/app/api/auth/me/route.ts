import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    // Fetch fresh user data from DB using direct SQL
    // Note: DB columns are likely snake_case based on previous schema checks
    const result = await db.query(
      `SELECT id, email, nome, user_type, first_name, last_name, profile_image_url, telefone, endereco, cpf, data_nascimento 
         FROM users WHERE id = $1`,
      [session.id]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Return safe user data mapped to camelCase for frontend consistency
    const safeUser = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImage: user.profile_image_url,
      telefone: user.telefone,
      endereco: user.endereco,
      cpf: user.cpf,
      // data_nascimento might be a Date object from pg driver, or string. 
      // Frontend likely expects string or handles date. 
      data_nascimento: user.data_nascimento,
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Me route error (SQL):", error);
    // Return null user instead of 500 to gracefully handle "not logged in" state if DB fails
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
