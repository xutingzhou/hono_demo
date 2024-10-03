import {mysqlTable, serial, text, timestamp, varchar} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    phone: varchar("phone", {length: 20}).unique(),
    password: varchar("password", {length: 128}),
    role: text('role', {enum: ['admin', 'user']}).notNull().default('user'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
