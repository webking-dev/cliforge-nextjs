import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { user } from './user';

export const account = pgTable(
    'account',
    {
        userId: uuid('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        type: text('type').notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('providerAccountId').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (table) => {
        return {
            compoundKey: primaryKey({
                columns: [table.provider, table.providerAccountId],
            }),
        };
    }
);
