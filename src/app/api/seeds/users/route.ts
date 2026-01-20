export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    console.log("🌱 Seeding users...");

    const users = [
      {
        email: "admin@essentia.com",
        nome: "Administrador Essentia",
        user_type: "admin",
        password: "admin123"
      },
      {
        email: "guia@essentia.com",
        nome: "Guia Local",
        user_type: "guia",
        password: "guia123"
      }
    ];

    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await db.query(`
        INSERT INTO users (email, nome, password_hash, user_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE 
        SET password_hash = EXCLUDED.password_hash, nome = EXCLUDED.nome
      `, [user.email, user.nome, hashedPassword, user.user_type]);
    }

    return NextResponse.json({ message: "Usuários semeados com sucesso" });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
