import { InferSelectModel } from 'drizzle-orm';
import {
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

export const user = pgTable(
    'user',
    {
        id: uuid('id').defaultRandom().notNull().primaryKey(),
        name: text('name'),
        email: text('email'),
        emailVerified: timestamp('emailVerified', { mode: 'date' }),
        image: text('image'),
    },
    (user) => {
        return {
            userEmailKeyIndex: uniqueIndex('user_email_key').on(user.email),
        };
    }
);

export type User = InferSelectModel<typeof user>;
