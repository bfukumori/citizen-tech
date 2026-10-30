import { and, count, desc, eq, like, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  type ReportCategory,
  type ReportStatus,
  reports,
  reportVotes,
} from "@/db/schema";
import { CreateReportInputSchema } from "@/schemas/report.schema";
import { triageCitizenReport } from "@/services/aiTriage.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions = [];

    if (category && category !== "ALL") {
      conditions.push(eq(reports.category, category as ReportCategory));
    }

    if (status && status !== "ALL") {
      conditions.push(eq(reports.status, status as ReportStatus));
    }

    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          like(reports.title, term),
          like(reports.description, term),
          like(reports.address, term),
          like(reports.responsibleOrgan, term),
        ),
      );
    }

    const fetchedReports = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        title: reports.title,
        description: reports.description,
        category: reports.category,
        severity: reports.severity,
        urgencyScore: reports.urgencyScore,
        responsibleOrgan: reports.responsibleOrgan,
        latitude: reports.latitude,
        longitude: reports.longitude,
        address: reports.address,
        imageUrl: reports.imageUrl,
        status: reports.status,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        votesCount: count(reportVotes.id),
      })
      .from(reports)
      .leftJoin(reportVotes, eq(reports.id, reportVotes.reportId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(reports.id)
      .orderBy(desc(reports.urgencyScore), desc(reports.createdAt));

    const formattedReports = fetchedReports.map((report) => ({
      ...report,
      _count: {
        votes: report.votesCount,
      },
    }));

    return NextResponse.json({
      success: true,
      count: formattedReports.length,
      data: formattedReports,
    });
  } catch (error) {
    console.error("Erro ao listar ocorrências:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna ao recuperar ocorrências." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = CreateReportInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de envio inválidos.",
          details: z.treeifyError(parseResult.error),
        },
        { status: 400 },
      );
    }

    const input = parseResult.data;

    // Executa triagem automatizada com Gemini (ou fallback resiliente)
    const triage = await triageCitizenReport(input.description, input.title);

    // Salva o relatório enriquecido no banco de dados
    const [createdReport] = await db
      .insert(reports)
      .values({
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address || "Localização identificada via GPS",
        imageUrl: input.imageUrl || null,
        category: triage.category,
        severity: triage.severity,
        urgencyScore: triage.urgencyScore,
        responsibleOrgan: triage.responsibleOrgan,
        status: "OPEN",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Ocorrência registrada e triada com sucesso!",
        triageSummary: triage.summaryReason,
        data: {
          ...createdReport,
          _count: { votes: 0 },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao registrar ocorrência no sistema." },
      { status: 500 },
    );
  }
}
