export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativeUploadDir = "/uploads";
    const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

    // Garante que o diretório existe
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    // Gera nome único para o arquivo
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, "-")}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const fileUrl = `${relativeUploadDir}/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: "Upload realizado com sucesso"
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo" }, { status: 500 });
  }
}
