import {boolean, mysqlTable, serial, text, timestamp, varchar} from "drizzle-orm/mysql-core";
import {db, NotFoundEntityException} from "../index";
import {eq} from "drizzle-orm";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    phone: varchar("phone", {length: 20}).notNull().unique(),
    password: varchar("password", {length: 128}).notNull(),
    role: text('role', {enum: ['admin', 'user']}).notNull().default('user'),
    passwordChangeTime: timestamp('password_change_time').notNull().defaultNow(),
    isActivate: boolean('is_activate').notNull().default(true),
    isDelete: boolean('is_delete').notNull().default(false),
    modifiedAt: timestamp('modified_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const getUsers = async () => await db.select().from(users);
export const getUserByUsername = async (username: string) => {
    const usersResult = await db.select().from(users).where(eq(users.phone, username));
    if (usersResult.length == 0) {
        throw new NotFoundEntityException("不存在该用户");
    }
    return usersResult[0];
};
export const addUser = async (params: NewUser) => await db.insert(users).values(params);