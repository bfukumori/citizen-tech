import { db } from "./index";
import { reports, reportVotes, users } from "./schema";

async function main() {
  console.log("Iniciando seed de dados cívicos para demonstração...");

  // Limpa registros anteriores para permitir re-seed
  await db.delete(reportVotes);
  await db.delete(reports);
  await db.delete(users);

  await db.insert(users).values({
    name: "Central de Triagem Defesa Civil",
    email: "central@defesacivil.sp.gov.br",
    role: "ADMIN",
  });

  const [citizen] = await db
    .insert(users)
    .values({
      name: "Mariana Souza (Munícipe)",
      email: "mariana.souza@exemplo.com",
      role: "CITIZEN",
    })
    .returning();

  const sampleReports = [
    {
      title: "Árvore de grande porte caída sobre cabos elétricos com faíscas",
      description:
        "Galho imenso da tipuana tombou com a tempestade de vento na fiação de média tensão. Há fiação desencapada emitindo faíscas no asfalto e ninguém consegue passar.",
      category: "TREE_FALL" as const,
      severity: "CRITICAL" as const,
      urgencyScore: 5,
      responsibleOrgan: "Defesa Civil e Concessionária de Energia",
      latitude: -23.5614,
      longitude: -46.6559,
      address: "Alameda Santos, 1200 - Cerqueira César, São Paulo - SP",
      status: "IN_TRIAGE" as const,
      votesCount: 14,
    },
    {
      title: "Alagamento intransitável de pista sob o Viaduto",
      description:
        "Bueiros totalmente entupidos por galhos. A água da chuva já atinge o nível das portas dos veículos e motoristas estão ilhados aguardando socorro.",
      category: "FLOODING" as const,
      severity: "CRITICAL" as const,
      urgencyScore: 5,
      responsibleOrgan: "Defesa Civil e Secretaria de Infraestrutura",
      latitude: -23.5475,
      longitude: -46.6361,
      address:
        "Vale do Anhangabaú / Viaduto do Chá, Centro Histórico, São Paulo - SP",
      status: "FORWARDED_TO_AUTHORITY" as const,
      votesCount: 22,
    },
    {
      title: "Cratera perigosa na faixa direita da avenida de alta velocidade",
      description:
        "Buraco com cerca de 1,20m de diâmetro após chuva forte. Vários motoristas estouraram pneus nas últimas duas horas e motoqueiros quase caíram.",
      category: "INFRASTRUCTURE_HOLE" as const,
      severity: "HIGH" as const,
      urgencyScore: 4,
      responsibleOrgan: "Secretaria Municipal de Obras e Vias Públicas",
      latitude: -23.5702,
      longitude: -46.6853,
      address: "Av. Rebouças, 2100 - Pinheiros, São Paulo - SP",
      status: "OPEN" as const,
      votesCount: 9,
    },
    {
      title:
        "Descarte irregular de restos de reforma e entulho bloqueando pedestres",
      description:
        "Despejo clandestino de caçambas com gesso, tijolos e sacos rasgados ocupando metade da calçada em frente ao ponto de ônibus.",
      category: "GARBAGE_ACCUMULATION" as const,
      severity: "MEDIUM" as const,
      urgencyScore: 3,
      responsibleOrgan: "Autoridade Municipal de Limpeza Urbana",
      latitude: -23.5412,
      longitude: -46.6198,
      address: "Rua Maria Marcolina, 450 - Brás, São Paulo - SP",
      status: "OPEN" as const,
      votesCount: 6,
    },
    {
      title: "Foco de água parada em terreno abandonado com risco de Dengue",
      description:
        "Pneus velhos e piscina desativada acumulando larvas visíveis após tempestades frequentes. Moradores do quarteirão relatam casos confirmados.",
      category: "HEALTH_RISK" as const,
      severity: "HIGH" as const,
      urgencyScore: 4,
      responsibleOrgan: "Vigilância Sanitária e Secretaria de Saúde",
      latitude: -23.5558,
      longitude: -46.6009,
      address: "Rua da Mooca, 1780 - Mooca, São Paulo - SP",
      status: "FORWARDED_TO_AUTHORITY" as const,
      votesCount: 18,
    },
    {
      title:
        "Poste de iluminação pública com lâmpada apagada gerando insegurança",
      description:
        "Lâmpada de vapor queimada há mais de uma semana na praça, tornando a saída da estação de metrô escura e perigosa para estudantes noturnos.",
      category: "LIGHTING_DEFECT" as const,
      severity: "LOW" as const,
      urgencyScore: 2,
      responsibleOrgan: "Departamento de Iluminação Pública",
      latitude: -23.5505,
      longitude: -46.6333,
      address: "Praça da Sé, s/n - Sé, São Paulo - SP",
      status: "RESOLVED" as const,
      votesCount: 4,
    },
  ];

  for (const item of sampleReports) {
    const [report] = await db
      .insert(reports)
      .values({
        title: item.title,
        description: item.description,
        category: item.category,
        severity: item.severity,
        urgencyScore: item.urgencyScore,
        responsibleOrgan: item.responsibleOrgan,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
        status: item.status,
        userId: citizen.id,
      })
      .returning();

    // Cria votos reais no banco para simular o engajamento comunitário
    const countToCreate = item.votesCount || 1;
    for (let i = 0; i < countToCreate; i++) {
      const voterEmail = `cidadao_${report.id.substring(0, 8)}_${i}@exemplo.com`;
      const [voter] = await db
        .insert(users)
        .values({
          name: `Munícipe ${i + 1}`,
          email: voterEmail,
          role: "CITIZEN",
        })
        .returning();

      await db.insert(reportVotes).values({
        reportId: report.id,
        userId: voter.id,
      });
    }
  }

  console.log(
    "Seed concluído com sucesso! 6 ocorrências reais criadas com endossos comunitários.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
