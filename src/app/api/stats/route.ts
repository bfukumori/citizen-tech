import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports, reportVotes } from "@/db/schema";

export async function GET() {
  try {
    const [totalReportsResult] = await db
      .select({ value: count() })
      .from(reports);

    const [openReportsResult] = await db
      .select({ value: count() })
      .from(reports)
      .where(
        inArray(reports.status, [
          "OPEN",
          "IN_TRIAGE",
          "FORWARDED_TO_AUTHORITY",
        ]),
      );

    const [resolvedReportsResult] = await db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "RESOLVED"));

    const [criticalReportsResult] = await db
      .select({ value: count() })
      .from(reports)
      .where(
        and(eq(reports.severity, "CRITICAL"), ne(reports.status, "RESOLVED")),
      );

    // Agrupamento por categoria
    const categoryGroup = await db
      .select({
        category: reports.category,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.category);

    // Agrupamento por severidade
    const severityGroup = await db
      .select({
        severity: reports.severity,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.severity);

    // Agrupamento por órgão responsável
    const organGroup = await db
      .select({
        organ: reports.responsibleOrgan,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.responsibleOrgan)
      .orderBy(desc(count()))
      .limit(5);

    // Total de votos da comunidade registrados
    const [totalVotesResult] = await db
      .select({ value: count() })
      .from(reportVotes);

    const totalReports = totalReportsResult?.value ?? 0;
    const openReports = openReportsResult?.value ?? 0;
    const resolvedReports = resolvedReportsResult?.value ?? 0;
    const criticalReports = criticalReportsResult?.value ?? 0;
    const totalVotes = totalVotesResult?.value ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          total: totalReports,
          open: openReports,
          resolved: resolvedReports,
          critical: criticalReports,
          totalCommunityEndorsements: totalVotes,
          resolutionRate:
            totalReports > 0
              ? Math.round((resolvedReports / totalReports) * 100)
              : 0,
        },
        byCategory: categoryGroup.map((item) => ({
          category: item.category,
          count: item.count,
        })),
        bySeverity: severityGroup.map((item) => ({
          severity: item.severity,
          count: item.count,
        })),
        topOrgans: organGroup.map((item) => ({
          organ: item.organ,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar estatísticas:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao obter dados estatísticos." },
      { status: 500 },
    );
  }
}
