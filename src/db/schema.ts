import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportCategory =
  | "FLOODING"
  | "TREE_FALL"
  | "INFRASTRUCTURE_HOLE"
  | "GARBAGE_ACCUMULATION"
  | "LIGHTING_DEFECT"
  | "HEALTH_RISK"
  | "OTHER";

export type ReportStatus =
  | "OPEN"
  | "IN_TRIAGE"
  | "FORWARDED_TO_AUTHORITY"
  | "RESOLVED";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("CITIZEN"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const reports = sqliteTable(
  "reports",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").$type<ReportCategory>().notNull(),
    severity: text("severity").$type<SeverityLevel>().notNull(),
    urgencyScore: integer("urgency_score").notNull().default(1),
    responsibleOrgan: text("responsible_organ").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    address: text("address"),
    imageUrl: text("image_url"),
    status: text("status").$type<ReportStatus>().notNull().default("OPEN"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("reports_lat_lng_idx").on(table.latitude, table.longitude),
    index("reports_status_idx").on(table.status),
  ],
);

export const reportVotes = sqliteTable(
  "report_votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("report_votes_report_user_unique").on(table.reportId, table.userId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportVote = typeof reportVotes.$inferSelect;
export type NewReportVote = typeof reportVotes.$inferInsert;
