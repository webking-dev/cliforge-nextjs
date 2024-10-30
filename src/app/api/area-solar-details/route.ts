import getAuthOptions from '@/lib/auth/options';
import GoogleSolarAPI from '@/lib/google-solar-api/apis';
import {
    cleanUpInsights,
    condenseBuildingInsights,
} from '@/lib/google-solar-api/utils';
import LatLngUtils from '@/lib/latlng/utils';
import { getStreetAddress } from '@/lib/mapbox/client';
import OverpassAPI from '@/lib/overpass/query';
import { transformToCSV } from '@/lib/utils';
import {
    BuildingInsightsCondensed,
    BuildingProperties,
    DataLayersAndPropertiesResponse,
    LayerId,
} from '@/types';
import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
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

        console.debug('searchParams', location);

        const latLng = {
            latitude: parseFloat(location['location.latitude']),
            longitude: parseFloat(location['location.longitude']),
        };

        // Google Data Layers API can only accept a radius of 100 meters
        const radius = 100; // meters
        const areaBounds = LatLngUtils.getBounds(latLng, radius);

        // Get data layers for the area
        const dataLayersPromise = GoogleSolarAPI.getDataLayers(
            latLng,
            radius,
            'IMAGERY_AND_ANNUAL_FLUX_LAYERS',
            [LayerId.Mask, LayerId.DSM, LayerId.AnnualFlux]
        );

        // Get buildings in the area
        const buildingFeaturesPromise =
            OverpassAPI.getBuildingsInBounds(areaBounds);

        const [dataLayers, buildingFeatures] = await Promise.all([
            dataLayersPromise,
            buildingFeaturesPromise,
        ]);

        // Find the centroid of each building
        const buildingProperties: BuildingProperties[] =
            buildingFeatures.features
                .map((f) => {
                    try {
                        let centroid = LatLngUtils.findCentroid(f);
                        let area = LatLngUtils.findArea(f);

                        if (!f.properties) f.properties = {};
                        f.properties.centroid = centroid;
                        f.properties.area = area;

                        return [area, centroid] as BuildingProperties;
                    } catch (error) {
                        console.warn(error);
                    }

                    return undefined;
                })
                .filter((p): p is BuildingProperties => !!p)
                .sort((a, b) => {
                    return b[0] - a[0];
                })
                .slice(0, 100);

        // Data aggregator for LLM input
        const aggregatedData: BuildingInsightsCondensed[] = [];
        const session = await getServerSession(getAuthOptions());
        const userId = session?.user?.email;
        const aggregatedDataKey = `solar-insights-${userId}`;

        async function* getInsights(buildingProperties: BuildingProperties[]) {
            // Get building insights for each building
            for (let index = 0; index < buildingProperties.length; index++) {
                const address = getStreetAddress({
                    longitude: buildingProperties[index][1].longitude,
                    latitude: buildingProperties[index][1].latitude,
                })();

                const insights = GoogleSolarAPI.getBuildingInsightsFindClosest(
                    buildingProperties[index][1],
                    index
                );

                await Promise.all([address, insights]).then(
                    ([address, insights]) => {
                        insights.streetAddress = address;
                    }
                );

                cleanUpInsights(await insights);

                aggregatedData.push(condenseBuildingInsights(await insights));

                yield insights;
            }
        }

        const dataLayersAndPropertiesResponse: DataLayersAndPropertiesResponse =
            {
                type: 'layers+features',
                dataLayers,
                buildingFeatures,
            };
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // First respond with dataLayers and buildingProperties
                controller.enqueue(
                    encoder.encode(
                        JSON.stringify(dataLayersAndPropertiesResponse) + '\n'
                    )
                );

                // Then continue with building insights
                for await (const chunk of getInsights(buildingProperties)) {
                    controller.enqueue(
                        encoder.encode(JSON.stringify(chunk) + '\n')
                    );
                }

                console.log('Aggregated Data:', aggregatedData.length);
                kv.set(aggregatedDataKey, transformToCSV(aggregatedData));
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
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
