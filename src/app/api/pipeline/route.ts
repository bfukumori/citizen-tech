import { NextResponse } from "next/server";
import { getPipelineOverview } from "@/services/dataPipeline.service";

export async function GET() {
  try {
    const pipelineData = await getPipelineOverview();
    return NextResponse.json({
      success: true,
      data: pipelineData,
    });
  } catch (error) {
    console.error("Erro ao gerar visão do pipeline:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar dados do pipeline." },
      { status: 500 },
    );
  }
}
