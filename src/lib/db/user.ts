import {
    $Type,
    eq,
    getTableColumns,
    InferInsertModel,
    InferSelectModel,
} from 'drizzle-orm';
import db from '../postgres/client';
import { User, user } from './schema/user';

export type NewUser = InferInsertModel<typeof user>;

export function createUser(newUser: NewUser) {
    return db.insert(user).values(newUser).returning();
}

export function getPerson(id: NonNullable<User['id']>) {
    return db.query.user.findFirst({
        where: eq(user.id, id),
    });
}
