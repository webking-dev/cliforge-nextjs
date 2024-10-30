import getAuthOptions from '@/lib/auth/options';
import {
    createCustomer,
    getCustomerForUser,
    getCustomersForUserPaginated,
    NewCustomer,
} from '@/lib/db/customer';
import { customer, Customer } from '@/lib/db/schema/customer';
import {
    CustomerStatus,
    Filter,
    PaginatedResult,
    PaginatedSearchParamsOverride,
    Pagination,
    Sorting,
    SortOrder,
    StreetAddress,
} from '@/types';
import { createInsertSchema } from 'drizzle-zod';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CustomersSearchParams as SearchParams } from './types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

type CustomerKeys = keyof typeof customer.$inferSelect;
const customerKeys = Object.keys(customer) as [CustomerKeys, ...CustomerKeys[]];

// zod schema for request body
const SearchParamsSchema = z.object({
    [SearchParams.Line1]: z.string().min(1).optional(),
    [SearchParams.Line2]: z.string().min(1).optional(),
    [SearchParams.PageSize]: z
        .string()
        .transform((val) => parseInt(val, 10))
        .transform((val) => (isNaN(val) ? 10 : Math.min(Math.max(val, 1), 100)))
        .default('10')
        .optional(),
    [SearchParams.PageNumber]: z
        .string()
        .transform((val) => parseInt(val, 10))
        .transform((val) => (isNaN(val) ? 0 : Math.max(val, 0)))
        .default('0')
        .optional(),
    [SearchParams.SortBy]: z
        .enum(customerKeys)
        .optional()
        .default('createdAt')
        .optional(),
    [SearchParams.SortOrder]: z
        .nativeEnum(SortOrder)
        .optional()
        .default(SortOrder.Descending)
        .optional(),
    [SearchParams.FilterKey]: z.enum(customerKeys).optional(),
    [SearchParams.FilterValue]: z.string().optional(),
});

export type CustomersRequestParams = z.infer<typeof SearchParamsSchema> &
    PaginatedSearchParamsOverride;
export type GetCustomerResponse = PaginatedResult<Customer>;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let streetAddress: StreetAddress | null = null;
    const paginationParams = await SearchParamsSchema.parseAsync({
        [SearchParams.PageSize]:
            searchParams.get(SearchParams.PageSize) ?? '10',
        [SearchParams.PageNumber]:
            searchParams.get(SearchParams.PageNumber) ?? '0',
    }).catch((error) => {
        throw new Error(error);
    });
    const pagination: Pagination = {
        pageSize: paginationParams.pageSize ?? 10,
        pageNumber: paginationParams.pageNumber ?? 0,
    };

    const sortParams = await SearchParamsSchema.parseAsync({
        [SearchParams.SortBy]:
            searchParams.get(SearchParams.SortBy) ?? 'createdAt',
        [SearchParams.SortOrder]:
            searchParams.get(SearchParams.SortOrder) ?? SortOrder.Descending,
    }).catch((error) => {
        throw new Error(error);
    });
    const sorting: Sorting<Customer> = {
        sortBy: sortParams.sortBy ?? 'createdAt',
        sortOrder: sortParams.sortOrder ?? SortOrder.Descending,
    };

    let filter: Filter<Customer> | undefined;
    if (
        searchParams.has(SearchParams.FilterKey) ||
        searchParams.has(SearchParams.FilterValue)
    ) {
        const filterParams = await SearchParamsSchema.parseAsync({
            [SearchParams.FilterKey]: searchParams.get(SearchParams.FilterKey),
            [SearchParams.FilterValue]: searchParams.get(
                SearchParams.FilterValue
            ),
        }).catch((error) => {
            throw new Error(error);
        });

        if (
            !filterParams[SearchParams.FilterKey] ||
            !filterParams[SearchParams.FilterValue]
        ) {
            throw new Error('Filter key and value must be non-empty');
        }

        filter = {
            key: filterParams[SearchParams.FilterKey],
            value: filterParams[SearchParams.FilterValue],
        };
    }

    if (
        searchParams.has(SearchParams.Line1) ||
        searchParams.has(SearchParams.Line2)
    ) {
        const addressParams = await SearchParamsSchema.parseAsync({
            [SearchParams.Line1]: searchParams.get(SearchParams.Line1),
            [SearchParams.Line2]: searchParams.get(SearchParams.Line2),
        }).catch((error) => {
            throw new Error(error);
        });

        if (
            !addressParams['address.line1'] ||
            !addressParams['address.line2']
        ) {
            throw new Error('Both line1 and line2 must be non-empty');
        }

        streetAddress = {
            line1: addressParams['address.line1'],
            line2: addressParams['address.line2'],
        };
    }
    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) throw new Error('User not found');

    const userId = session!.user!.id;

    let response: GetCustomerResponse = {
        data: [],
        metadata: {
            totalCount: 0,
            pagination: {
                pageNumber: 0,
                pageSize: 0,
            },
            sorting,
        },
    };

    if (streetAddress) {
        const customer = await getCustomerForUser(userId, streetAddress);
        if (customer)
            response = {
                data: [customer],
                metadata: {
                    totalCount: 1,
                    pagination: {
                        pageNumber: 0,
                        pageSize: 0,
                    },
                    sorting,
                },
            };
    } else {
        const customers = await getCustomersForUserPaginated(
            userId,
            pagination,
            sorting,
            filter
        );
        response = customers;
    }

    const headers: HeadersInit = {
        'x-total-count': response.metadata.totalCount.toString(),
    };

    return new NextResponse(JSON.stringify(response), { status: 200, headers });
}

// MARK: PUT
// zod schema for request body
const CreateCustomerSchema = createInsertSchema(customer, {
    address: z.object({
        line1: z.string(),
        line2: z.string(),
    }),
    emails: z.array(z.object({ type: z.string(), email: z.string() })),
    phones: z.array(z.object({ type: z.string(), phone: z.string() })),
    status: z.nativeEnum(CustomerStatus),
}).omit({ id: true, userId: true, createdAt: true, modifiedAt: true });
export type PutCustomersRequestSchema = z.infer<typeof CreateCustomerSchema>;
export type PutCustomerResponse = (typeof customer.$inferSelect)[];

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const newCustomerPartial = await CreateCustomerSchema.parseAsync(
        body
    ).catch((error) => {
        throw new Error(error);
    });

    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) throw new Error('User not found');

    const newCustomer: NewCustomer = {
        ...newCustomerPartial,
        userId: session!.user!.id,
        createdAt: new Date(),
        modifiedAt: new Date(),
    };

    const customer: PutCustomerResponse = await createCustomer(
        newCustomer
    ).then((res) => res);

    return new NextResponse(JSON.stringify(customer), { status: 200 });
}
