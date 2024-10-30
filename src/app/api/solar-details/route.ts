import GoogleSolarAPI from '@/lib/google-solar-api/apis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// zod schema for request body
const SearchParamsSchema = z.object({
    'location.latitude': z
        .string()
        .refine((check) => !isNaN(parseFloat(check))),
    'location.longitude': z
        .string()
        .refine((check) => !isNaN(parseFloat(check))),
});

export type SolarDetailsSearchParams = z.infer<typeof SearchParamsSchema>;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const location = await SearchParamsSchema.parseAsync({
            'location.latitude': searchParams.get('location.latitude')!,
            'location.longitude': searchParams.get('location.longitude')!,
        }).catch((error) => {
            throw new Error(error);
        });

        const latLng = {
            latitude: parseFloat(location['location.latitude']),
            longitude: parseFloat(location['location.longitude']),
        };

        const buildingInsights =
            await GoogleSolarAPI.getBuildingInsightsFindClosest(latLng);

        return NextResponse.json(buildingInsights, {
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return Response.json(
            { message: 'Something went wrong' },
            {
                status: 500,
            }
        );
    }
}
