export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando busca de usuários (SQL)...");

    const result = await db.query('SELECT * FROM users');
    const allUsers = result.rows;

    console.log("✅ Usuários encontrados:", allUsers.length);

    const formattedUsers = allUsers.map((user) => {
      // Map snake_case to camelCase
      const nome = user.nome || "";
      const [firstName, ...lastNameParts] = nome.split(" ");

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name || firstName || "",
        lastName: user.last_name || lastNameParts.join(" ") || "",
        userType: user.user_type,
        telefone: user.telefone,
        endereco: user.endereco,
        cpf: user.cpf,
        status: "ativo",
        // pg returns Date objects
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
        updatedAt: user.updated_at ? new Date(user.updated_at).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("💥 Erro geral ao buscar usuários:", error);
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando criação de usuário (SQL)...");

    const body = await request.json();
    const { firstName, lastName, email, userType, password } = body;

    if (!firstName || !lastName || !email || !userType || !password) {
      return NextResponse.json(
        { error: "Nome, sobrenome, email, tipo de usuário e senha são obrigatórios" },
        { status: 400 },
      );
    }

    if (!["admin", "guia", "cliente"].includes(userType)) {
      return NextResponse.json({ error: "Tipo de usuário inválido" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const nome = `${firstName} ${lastName}`;

    // Insert user
    const insertQuery = `
      INSERT INTO users (email, nome, password_hash, user_type, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, nome, user_type, first_name, last_name, created_at
    `;

    const result = await db.query(insertQuery, [
      email,
      nome,
      hashedPassword,
      userType,
      firstName,
      lastName
    ]);

    const newUser = result.rows[0];

    console.log("✅ Usuário criado com sucesso:", newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type,
        nome: newUser.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Iniciando atualização de usuário (SQL)...");

    const { id, firstName, lastName, email, userType, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (userType) {
      fields.push(`user_type = $${paramIndex++}`);
      values.push(userType);
    }
    if (firstName || lastName) {
      if (firstName) {
        fields.push(`first_name = $${paramIndex++}`);
        values.push(firstName);
      }
      if (lastName) {
        fields.push(`last_name = $${paramIndex++}`);
        values.push(lastName);
      }
      // Also update full name if components change
      const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
      if (fullName) {
        fields.push(`nome = $${paramIndex++}`);
        values.push(fullName);
      }
    }

    if (password) {
      const hashed = await hashPassword(password);
      fields.push(`password_hash = $${paramIndex++}`);
      values.push(hashed);
    }

    fields.push(`updated_at = NOW()`);

    if (fields.length === 0) {
      return NextResponse.json({ message: "Nada a atualizar" });
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updatedUser = result.rows[0];

    // Map back to expected format
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      nome: updatedUser.nome,
      userType: updatedUser.user_type,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Iniciando exclusão de usuário (SQL)...");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log("✅ Usuário removido da tabela");

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}