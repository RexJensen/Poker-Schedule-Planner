import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const myListTable = pgTable("my_list", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MyListItem = typeof myListTable.$inferSelect;
