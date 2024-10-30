import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env.local',
});

export default defineConfig({
    schema: './src/lib/db/schema',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.POSTGRES_URL!,
    },
    verbose: true,
    strict: true,
    extensionsFilters: ['postgis'],
});
