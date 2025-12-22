import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: "postgresql://neondb_owner:npg_n1mlbW3zewHc@ep-shiny-tooth-a41uen9s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
});
