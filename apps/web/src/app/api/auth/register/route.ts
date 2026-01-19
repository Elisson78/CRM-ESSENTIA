import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, tipo } = await request.json();

    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: "Nome, email, senha e tipo são obrigatórios" },
        { status: 400 },
      );
    }

    if (!["admin", "guia", "cliente"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de usuário inválido" }, { status: 400 });
    }

    // Check if user already exists
    const existingUserResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(senha);

    // Insert new user
    // Note: gen_random_uuid() is used in default, but we should let DB handle ID generation if default is set, 
    // or we can just omit ID if the column has a default. 
    // Looking at schema earlier, ID has default(dbgenerated("gen_random_uuid()")).
    // User type default is 'cliente'.

    // We explicitly set columns.
    const insertResult = await db.query(
      `INSERT INTO users (email, password_hash, nome, user_type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_type`,
      [email, hashedPassword, nome, tipo]
    );

    const newUser = insertResult.rows[0];

    // Determine default redirect based on user type
    let redirectUrl = "/";
    if (tipo === 'admin') redirectUrl = "/admin";
    else if (tipo === 'guia') redirectUrl = "/guia";
    else redirectUrl = "/dashboard"; // Default for client

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      userId: newUser.id,
      redirectUrl
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
