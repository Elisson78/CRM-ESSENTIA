export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log("🌱 Seeding tours...");

    const tours = [
      {
        id: "tour-roma-1",
        nome: "Roma Imperial e Coliseu",
        descricao: "Um mergulho na história do Império Romano com acesso prioritário ao Coliseu e Fórum Romano.",
        preco: 120,
        duracao: "4h",
        categoria: "História",
        capacidade_maxima: 20,
        imagens: JSON.stringify(["https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000"]),
        ativo: 1
      },
      {
        id: "tour-veneza-1",
        nome: "Veneza Clássica e Gôndola",
        descricao: "Explore os canais mais famosos do mundo e a icônica Praça São Marcos em um passeio inesquecível.",
        preco: 180,
        duracao: "3h",
        categoria: "Romance",
        capacidade_maxima: 6,
        imagens: JSON.stringify(["https://images.unsplash.com/photo-1514890547357-a9ee2887a35f?auto=format&fit=crop&q=80&w=1000"]),
        ativo: 1
      },
      {
        id: "tour-toscana-1",
        nome: "Sabores da Toscana",
        descricao: "Degustação de vinhos e azeites em uma vinícola familiar no coração das colinas toscanas.",
        preco: 150,
        duracao: "6h",
        categoria: "Gastronomia",
        capacidade_maxima: 12,
        imagens: JSON.stringify(["https://images.unsplash.com/photo-1542135915-30912ee6bad2?auto=format&fit=crop&q=80&w=1000"]),
        ativo: 1
      }
    ];

    for (const tour of tours) {
      await db.query(`
        INSERT INTO passeios (id, nome, descricao, preco, duracao, categoria, capacidade_maxima, imagens, ativo, criado_em, atualizado_em)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET nome = EXCLUDED.nome, preco = EXCLUDED.preco, imagens = EXCLUDED.imagens
      `, [tour.id, tour.nome, tour.descricao, tour.preco, tour.duracao, tour.categoria, tour.capacidade_maxima, tour.imagens, tour.ativo]);
    }

    return NextResponse.json({ message: "Passeios semeados com sucesso" });
  } catch (error) {
    console.error("Error seeding tours:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
