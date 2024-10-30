import getAuthOptions from '@/lib/auth/options';
import meta_llama_3_70b_instruct from '@/lib/replicate-ai/meta-llama-3-70b-instruct/input-config';
import { prompt } from '@/lib/replicate-ai/prompt';
import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// zod schema for request body
const SearchParamsSchema = z.object({
    query: z.string().min(1),
});
export type AIFilterRequestParams = z.infer<typeof SearchParamsSchema>;

// zod schema for response body
const ResponseSchema = z.array(z.string());
export type AIFilterResponse = z.infer<typeof ResponseSchema>;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const params = await SearchParamsSchema.parseAsync({
        query: searchParams.get('query')!,
    }).catch((error) => {
        throw new Error(error);
    });

    const session = await getServerSession(getAuthOptions());
    const userId = session?.user?.email;
    const aggregatedDataKey = `solar-insights-${userId}`;

    const data = await kv.get<string>(aggregatedDataKey);

    if (!data) {
        return new Response('Data not found', { status: 400 });
    }

    const filteredIds = await prompt(
        meta_llama_3_70b_instruct.modelIdentifier,
        meta_llama_3_70b_instruct.generateInput(data, params.query)
    );

    const response = await ResponseSchema.parseAsync(filteredIds);

    return new NextResponse(JSON.stringify(response), { status: 200 });
}
