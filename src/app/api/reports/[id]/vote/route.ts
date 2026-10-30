import { and, count, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, reportVotes, users } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reportId } = await params;
    const body = await request.json().catch(() => ({}));

    // Obter ou criar um munícipe representativo para o apoio comunitário
    let userId = body.userId;

    if (!userId) {
      // Garante a existência de um usuário comunitário para a sessão pública
      const [citizen] = await db
        .select()
        .from(users)
        .where(eq(users.email, "comunidade@zeladoria.sp.gov.br"));

      if (!citizen) {
        const [newCitizen] = await db
          .insert(users)
          .values({
            name: "Cidadão Participativo",
            email: "comunidade@zeladoria.sp.gov.br",
            role: "CITIZEN",
          })
          .returning();
        userId = newCitizen.id;
      } else {
        userId = citizen.id;
      }
    } else {
      // Garante o cadastro do munícipe identificado pelo cliente
      const [existingCitizen] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!existingCitizen) {
        await db.insert(users).values({
          id: userId,
          name: "Munícipe Participativo",
          email: `${userId}@municipe.cidadao`,
          role: "CITIZEN",
        });
      }
    }

    // Verifica se a ocorrência existe
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId));

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Ocorrência não encontrada." },
        { status: 404 },
      );
    }

    // Verifica se já votou
    const [existingVote] = await db
      .select()
      .from(reportVotes)
      .where(
        and(eq(reportVotes.reportId, reportId), eq(reportVotes.userId, userId)),
      );

    if (existingVote) {
      // Se já votou, remove o voto (toggle amigável para o cidadão)
      await db.delete(reportVotes).where(eq(reportVotes.id, existingVote.id));

      const [updatedResult] = await db
        .select({ value: count() })
        .from(reportVotes)
        .where(eq(reportVotes.reportId, reportId));

      return NextResponse.json({
        success: true,
        voted: false,
        message: "Apoio comunitário removido.",
        totalVotes: updatedResult?.value ?? 0,
      });
    }

    // Adiciona novo apoio
    await db.insert(reportVotes).values({
      reportId,
      userId,
    });

    const [updatedResult] = await db
      .select({ value: count() })
      .from(reportVotes)
      .where(eq(reportVotes.reportId, reportId));

    return NextResponse.json({
      success: true,
      voted: true,
      message: "Seu apoio a este chamado foi registrado com sucesso!",
      totalVotes: updatedResult?.value ?? 0,
    });
  } catch (error) {
    console.error("Erro ao registrar voto/apoio:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar endosso do chamado." },
      { status: 500 },
    );
  }
}
