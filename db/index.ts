import mysql from "mysql2/promise";
import {drizzle} from "drizzle-orm/mysql2";

const poolConnection = mysql.createPool({
    host: "10.0.0.236",
    port: 3306,
    user: "root",
    password: "MyNewPass4!",
    database: "hono_demo",
    charset: "utf8mb4",
    debug: true,
});
export const db = drizzle(poolConnection);

export class NotFoundEntityException extends Error {

}