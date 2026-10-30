import { z } from "zod";

export const CreateReportInputSchema = z.object({
  title: z.string().min(5, "Título muito curto (mínimo 5 caracteres)").max(100),
  description: z
    .string()
    .min(15, "Descreva a ocorrência com mais detalhes (mínimo 15 caracteres)"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  imageUrl: z.url().optional().or(z.literal("")),
  userId: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportInputSchema>;

export const UpdateStatusInputSchema = z.object({
  status: z.enum(["OPEN", "IN_TRIAGE", "FORWARDED_TO_AUTHORITY", "RESOLVED"]),
});

export type UpdateStatusInput = z.infer<typeof UpdateStatusInputSchema>;
