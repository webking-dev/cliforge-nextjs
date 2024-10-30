import { drizzle } from 'drizzle-orm/postgres-js';
import schema from '../db/schema';
import postgres from 'postgres';

if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL not set');
}

export const client = postgres(process.env.POSTGRES_URL, { prepare: false });

const db = drizzle(client, { schema });

export default db;
