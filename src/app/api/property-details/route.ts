import { AddressResponse } from '@/types';
import axios from 'axios';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// zod schema for request body
const SearchParamsSchema = z.object({
    'address.line1': z.string(),
    'address.line2': z.string(),
});

export type PropertyDetailsSearchParams = z.infer<typeof SearchParamsSchema>;

// TODO: Rate limiting
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = await SearchParamsSchema.parseAsync({
            'address.line1': searchParams.get('address.line1')!,
            'address.line2': searchParams.get('address.line2')!,
        }).catch((error) => {
            // TODO: Better error handling
            throw new Error(error);
        });

        const headers = {
            'galaxy-ap-name': process.env.ENDATO_KEY!,
            'galaxy-ap-password': process.env.ENDATO_PASS!,
            'galaxy-search-type': 'DevAPIAddressID',
        };

        const data = {
            addressLine1: params['address.line1'],
            addressLine2: params['address.line2'],
            ExactMatch: 'CurrentOwner',
        };

        const response = await axios
            .post<AddressResponse>(
                'https://devapi.endato.com/Address/Id',
                data,
                {
                    headers,
                }
            )
            .catch((error) => {
                // TODO: Better error handling
                throw new Error(error);
            });

        return Response.json(response.data, {
            status: response.status,
        });
    } catch (error) {
        // TODO: Better error handling
        console.error(error);
        return Response.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}
