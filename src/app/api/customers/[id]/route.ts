import getAuthOptions from '@/lib/auth/options';
import { updateCustomer } from '@/lib/db/customer';
import { Customer, customer } from '@/lib/db/schema/customer';
import { CustomerStatus } from '@/types';
import { createInsertSchema } from 'drizzle-zod';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// MARK: POST
const UpdateCustomerSchema = createInsertSchema(customer, {
    address: z.object({
        line1: z.string(),
        line2: z.string(),
    }),
    emails: z.array(z.object({ type: z.string(), email: z.string() })),
    phones: z.array(z.object({ type: z.string(), phone: z.string() })),
    status: z.nativeEnum(CustomerStatus),
})
    .partial()
    .omit({ userId: true, createdAt: true, modifiedAt: true });
export type PostCustomersRequestSchema = z.infer<typeof UpdateCustomerSchema>;
export type PostCustomerResponse = (typeof customer.$inferSelect)[];

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await request.json();
    const customerPartial = await UpdateCustomerSchema.parseAsync(body).catch(
        (error) => {
            throw new Error(error);
        }
    );

    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) throw new Error('User not found');

    const updatedCustomer: Partial<Customer> = {
        ...customerPartial,
    };

    console.log('Updating customer:', updatedCustomer);

    const customer: PostCustomerResponse = await updateCustomer(
        params.id,
        updatedCustomer
    ).then((res) => res);

    return new NextResponse(JSON.stringify(customer), { status: 200 });
}
