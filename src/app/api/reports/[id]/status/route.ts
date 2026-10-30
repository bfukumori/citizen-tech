import { count, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { reports, reportVotes } from "@/db/schema";
import { UpdateStatusInputSchema } from "@/schemas/report.schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reportId } = await params;
    const body = await request.json();

    const parseResult = UpdateStatusInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Status fornecido é inválido.",
          details: z.treeifyError(parseResult.error),
        },
        { status: 400 },
      );
    }

    const { status } = parseResult.data;

    const [updated] = await db
      .update(reports)
      .set({ status, updatedAt: new Date() })
      .where(eq(reports.id, reportId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Ocorrência não encontrada." },
        { status: 404 },
      );
    }

    const [voteCountResult] = await db
      .select({ value: count() })
      .from(reportVotes)
      .where(eq(reportVotes.reportId, reportId));

    return NextResponse.json({
      success: true,
      message: `Status atualizado para ${status}.`,
      data: {
        ...updated,
        _count: { votes: voteCountResult?.value ?? 0 },
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao atualizar status." },
      { status: 500 },
    );
  }
}
