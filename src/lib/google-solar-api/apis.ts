import {
    BuildingInsightsResponse,
    DataLayerView,
    DataLayersDetailResponse,
    DataLayersResponse,
    GeoTiff,
    LatLng,
    LayerId,
    LayersGeoTiffResponse,
} from '@/types';
import axios from 'axios';
import throttledQueue from 'throttled-queue';
import { isStatusOK } from '../utils';
import { downloadGeoTIFF } from './geoTiff';

const rps = 1;
const throttle = throttledQueue(rps, 1000);

const GoogleSolarAPI = {
    getDataLayers: async (
        latLng: LatLng,
        radius: number,
        view: DataLayerView,
        layers: LayerId[]
    ): Promise<DataLayersDetailResponse> => {
        const key = process.env.GOOGLE_MAPS_API_KEY!;

        const params = new URLSearchParams({
            'location.latitude': latLng.latitude.toString(),
            'location.longitude': latLng.longitude.toString(),
            radiusMeters: radius.toString(),
            requiredQuality: 'LOW',
            view: view,
            pixelSizeMeters: '0.1',
            key,
        });

        const mapsUrl = `https://solar.googleapis.com/v1/dataLayers:get?${params}`;
        const layersResponse = await axios
            .get<DataLayersResponse>(mapsUrl)
            .then((res) => {
                if (isStatusOK(res.status)) {
                    return res.data;
                } else {
                    console.error(res);
                    throw new Error(`Failed to fetch data: ${res.statusText}`);
                }
            });

        const layersToDownload = layers.map((layer) => {
            switch (layer) {
                case LayerId.Mask:
                    return layersResponse.maskUrl;
                case LayerId.DSM:
                    return layersResponse.dsmUrl;
                case LayerId.AnnualFlux:
                    return layersResponse.annualFluxUrl;
                case LayerId.MonthlyFlux:
                    return layersResponse.monthlyFluxUrl;
                case LayerId.RGB:
                    return layersResponse.rgbUrl;
                case LayerId.HourlyShade:
                    return layersResponse.hourlyShadeUrls;
                default:
                    throw new Error(`Unknown layer: ${layer}`);
            }
        });

        const downloadedLayers = await Promise.all(
            layersToDownload.map((l) => {
                if (typeof l === 'string') return downloadGeoTIFF(l, key);
                return Promise.all(l.map((url) => downloadGeoTIFF(url, key)));
            })
        );

        const labeledLayers = layers.reduce((acc, layer, i) => {
            if (layer === LayerId.HourlyShade)
                acc[layer] = downloadedLayers[i] as GeoTiff[];
            else acc[layer] = downloadedLayers[i] as GeoTiff;
            return acc;
        }, {} as LayersGeoTiffResponse);

        return {
            ...layersResponse,
            ...labeledLayers,
        };
    },

    getBuildingInsightsFindClosest: async (
        latLng: LatLng,
        keyIndex: number = 0
    ): Promise<BuildingInsightsResponse> =>
        throttle(async () => {
            const keys = process.env.GOOGLE_MAPS_API_KEYS!.split(',');
            const keyCount = keys.length;
            const key = keys[keyIndex % keyCount];

            const params = new URLSearchParams({
                'location.latitude': latLng.latitude.toString(),
                'location.longitude': latLng.longitude.toString(),
                key,
            });

            const mapsUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`;
            const buildingInsights = await axios
                .get<BuildingInsightsResponse>(mapsUrl)
                .then((res) => {
                    if (isStatusOK(res.status)) {
                        return res.data;
                    } else {
                        throw new Error(
                            `Failed to fetch data: ${res.statusText}`
                        );
                    }
                });

            buildingInsights.type = 'buildingInsights';
            return buildingInsights;
        }),
};

export default GoogleSolarAPI;
