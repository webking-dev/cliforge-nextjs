import { CustomerStatus, EmailList, PhoneList, StreetAddress } from '@/types';
import { InferSelectModel } from 'drizzle-orm';
import {
    integer,
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';
import { user } from './user';

const customerStatusValues = Object.values(CustomerStatus) as [
    string,
    ...string[]
];
export const customerStatus = pgEnum('customer_status', customerStatusValues);

// Customer table
export const customer = pgTable(
    'customer',
    {
        id: uuid('id').defaultRandom().notNull(),
        userId: uuid('user')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        name: text('name').notNull(),
        createdAt: timestamp('created_at').notNull(),
        modifiedAt: timestamp('modified_at').notNull(),
        saleScore: integer('sale_score').notNull(),
        savingsRating: integer('savings_rating').notNull(),
        status: customerStatus('status')
            .notNull()
            .$type<CustomerStatus>()
            .default(CustomerStatus.NewLead),
        primaryEmail: text('primary_email').notNull(),
        emails: jsonb('emails').notNull().$type<EmailList>(),
        primaryPhone: text('primary_phone').notNull(),
        phones: jsonb('phones').notNull().$type<PhoneList>(),
        address: jsonb('address').notNull().$type<StreetAddress>(),
    },
    (table) => {
        return {
            primaryKey: primaryKey({ columns: [table.id] }),
            uniqueAddressPerson: uniqueIndex('unique_address_person').on(
                table.address,
                table.userId
            ),
        };
    }
);

export type Customer = InferSelectModel<typeof customer>;
