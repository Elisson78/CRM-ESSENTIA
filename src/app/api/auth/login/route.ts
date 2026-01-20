export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log(`🔑 Attempting login for: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Find user by email using direct SQL query
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.warn(`❌ Login failed: User not found for email ${email}`);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      console.error(`❌ Login failed: User ${email} has no password_hash in database`);
      return NextResponse.json(
        { error: "Erro de configuração da conta" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    console.log(`🔐 Password verification for ${email}: ${isValid ? 'SUCCESS' : 'FAILED'}`);

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Create session
    const sessionPayload = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      userType: user.user_type,
    };

    console.log(`🎟️ Creating session for ${email} with type: ${user.user_type}`);
    await createSession(sessionPayload);

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (error) {
    console.error("💥 Critical Login error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}