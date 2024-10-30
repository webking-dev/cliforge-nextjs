import {
    CustomerStatus,
    Filter,
    PaginatedResult,
    Pagination,
    Sorting,
    SortOrder,
} from '@/types';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import db from '../postgres/client';
import { Customer, customer } from './schema/customer';

export type NewCustomer = typeof customer.$inferInsert;

export function createCustomer(newCustomer: NewCustomer) {
    return db.insert(customer).values(newCustomer).returning();
}

export function getCustomer(id: NonNullable<NewCustomer['id']>) {
    return db.query.customer.findFirst({
        where: eq(customer.id, id),
    });
}

export function getCustomersForUser(userId: NonNullable<Customer['userId']>) {
    return db.query.customer.findMany({
        where: eq(customer.userId, userId),
    });
}

export function updateCustomer(
    id: NonNullable<Customer['id']>,
    customerDetails: Partial<NewCustomer>
) {
    return db.update(customer).set(customerDetails).where(eq(customer.id, id));
}

export function getCustomerForUser(
    userId: NonNullable<Customer['userId']>,
    address: NonNullable<Customer['address']>
) {
    return db.query.customer.findFirst({
        where: and(eq(customer.userId, userId), eq(customer.address, address)),
    });
}

export async function getCustomersForUserPaginated(
    userId: NonNullable<Customer['userId']>,
    pagination: Pagination,
    sorting: Sorting<Customer>,
    filter?: Filter<Customer>
): Promise<PaginatedResult<Customer>> {
    const customers = await db.query.customer.findMany({
        where: and(
            eq(customer.userId, userId),
            filter ? eq(customer[filter.key], filter.value) : undefined
        ),
        limit: pagination.pageSize,
        offset: pagination.pageNumber * pagination.pageSize,
        orderBy: sorting.sortBy
            ? sorting.sortOrder === SortOrder.Ascending
                ? asc(customer[sorting.sortBy])
                : desc(customer[sorting.sortBy])
            : undefined,
    });

    const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(customer)
        .where(
            and(
                eq(customer.userId, userId),
                filter ? eq(customer[filter.key], filter.value) : undefined
            )
        );

    return {
        data: customers,
        metadata: {
            totalCount,
            pagination,
            sorting,
        },
    };
}

export function getCustomerCountForUser(
    userId: NonNullable<Customer['userId']>
) {
    return db
        .select({ count: count() })
        .from(customer)
        .where(eq(customer.userId, userId));
}

export function getStatusCountForUser(
    status: CustomerStatus,
    userId: NonNullable<Customer['userId']>
) {
    return db
        .select({ count: count() })
        .from(customer)
        .where(and(eq(customer.userId, userId), eq(customer.status, status)));
}
