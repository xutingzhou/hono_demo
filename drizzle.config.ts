import {defineConfig} from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    schema: "./db/schema/*",
    out: "./drizzle",
    dbCredentials: {
        host: "10.0.0.236",
        port: 3306,
        user: "root",
        password: "MyNewPass4!",
        database: "hono_demo",
    }
});