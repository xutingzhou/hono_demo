import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "mysql",
    schema: "./db/schema/*",
    out: "./drizzle",
    dbCredentials:{
        url: "mysql://root:MyNewPass4!@10.0.0.236:3306/hono_demo",
    }
});