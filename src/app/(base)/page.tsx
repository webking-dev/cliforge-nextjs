'use client';

import AddressDetails from '@/components/address-details';
import AIFilter from '@/components/ai-filter';
import BuildingInsightsTable from '@/components/building-insights-table';
import BuildingList from '@/components/building-list';
import MapBox from '@/components/mapbox';
import ResidentInsightsTable from '@/components/resident-insights-table';
import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { getLayer } from '@/lib/google-solar-api/layer';
import useStreamingQuery from '@/lib/hooks/useStreamingQuery';
import {
    createCustomer,
    getAreaSolarDetailsURL,
    getCustomerWithAddress,
    getOwnerResidentDetails,
} from '@/lib/internal-apis/client';
import { getStreetAddress } from '@/lib/mapbox/client';
import useAppStateStore from '@/lib/stores/appStateStore';
import {
    AddressResponse,
    BuildingInsight,
    BuildingInsightsResponse,
    DataLayersAndPropertiesResponse,
    DataLayersDetailResponse,
    FeatureCollectionWithId,
    LatLng,
    Layer,
    LayerId,
    StreetAddress,
} from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PutCustomersRequestSchema } from '../api/customers/route';

const coordinateQueryKey = (coordinates?: LatLng) =>
    coordinates
        ? [
              `lat: ${coordinates.latitude.toFixed(6)}`,
              `lng: ${coordinates.longitude.toFixed(6)}`,
          ]
        : [''];

export default function Home() {
    const { data: session } = useSession();
    const [markers, setMarkers] = useState<{
        [key: 'default' | string]: LatLng;
    }>({});
    const [selectedCoordinates, setSelectedCoordinates] = useState<
        LatLng | undefined
    >();
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedBuildingInsight, setSelectedBuildingInsight] = useState<
        BuildingInsight | undefined
    >();
    const [areaSolarDataLayers, setAreaSolarDataLayers] =
        useState<DataLayersDetailResponse>();
    const [buildingFeatures, setBuildingFeatures] = useState<
        FeatureCollectionWithId[]
    >([]);
    const [buildingInsights, setBuildingInsights] = useState<
        BuildingInsightsResponse[]
    >([]);

    const proximityCenter = useAppStateStore((state) => state.proximityCenter);

    const { isFetching: areaDetailsIsFetching } = useStreamingQuery<
        DataLayersAndPropertiesResponse | BuildingInsightsResponse
    >(getAreaSolarDetailsURL(selectedCoordinates!), {
        enabled: !!selectedCoordinates,
        queryKey: [
            'areaSolarDetails',
            ...coordinateQueryKey(selectedCoordinates),
        ],
        onChunkFetched: (chunk) => {
            if (chunk.type === 'buildingInsights') {
                setBuildingInsights((prev) =>
                    prev.find((p) => p.name === chunk.name)
                        ? prev
                        : [...prev, chunk]
                );
            } else {
                setAreaSolarDataLayers(chunk.dataLayers);
                const geoJsonFeatureCollections: (GeoJSON.FeatureCollection & {
                    id: string;
                })[] = [chunk?.buildingFeatures]
                    .filter((p): p is GeoJSON.FeatureCollection => !!p)
                    .map((p) => ({
                        id: moment().toString(),
                        ...p,
                    }));
                setBuildingFeatures(geoJsonFeatureCollections);
            }
        },
    });

    const { data: streetAddress, isFetching: addressIsFetching } =
        useQuery<StreetAddress>({
            enabled: !!selectedCoordinates,
            queryKey: [
                'streetAddress',
                ...coordinateQueryKey(selectedCoordinates),
            ],
            queryFn: getStreetAddress(selectedCoordinates!),
        });

    const {
        data: residentDetails,
        isFetching: residentDetailsIsFetching,
        refetch: refetchResidentDetails,
    } = useQuery<AddressResponse>({
        enabled: false,
        queryKey: [
            'ownerResidentDetails',
            ...coordinateQueryKey(selectedBuildingInsight?.rawData.center),
        ],
        queryFn: getOwnerResidentDetails(selectedBuildingInsight?.address),
    });

    const {
        data: customerData,
        isFetching: customerDataIsFetching,
        refetch: refetchCustomerData,
    } = useQuery({
        enabled: !!selectedBuildingInsight,
        queryKey: [
            'customer-with-address',
            selectedBuildingInsight?.address,
            selectedBuildingInsight?.rawData.center,
        ],
        queryFn: getCustomerWithAddress(selectedBuildingInsight?.address),
    });

    const createCustomerMutation = useMutation({
        mutationFn: (newCustomer: PutCustomersRequestSchema) =>
            createCustomer(newCustomer)(),
        onMutate: async () => {
            console.log('onMutate');
        },
        onError: (error) => {
            console.error('Error', error);
        },
        onSuccess: (data) => {
            console.log('Success', data);
            refetchCustomerData();
        },
    });

    const isAnythingLoading =
        addressIsFetching || residentDetailsIsFetching || areaDetailsIsFetching;

    // build layer from areaSolarDetails
    useEffect(() => {
        if (areaSolarDataLayers) {
            const mask = getLayer(LayerId.Mask, areaSolarDataLayers);
            const annualFlux = getLayer(
                LayerId.AnnualFlux,
                areaSolarDataLayers
            );
            setLayers([mask, annualFlux]);
        }
    }, [areaSolarDataLayers]);

    function mapOnClickAction(latLng: LatLng) {
        console.debug('Map clicked at', latLng);
        setMarkers({ default: latLng });
        setSelectedCoordinates(latLng);
    }

    function buildingInsightSelectedAction(buildingInsight: BuildingInsight) {
        setMarkers({
            ...markers,
            selectedBuilding: buildingInsight.rawData.center,
        });
        setSelectedBuildingInsight(buildingInsight);
    }

    function buildingInsightBackAction() {
        setMarkers((prevState) => {
            const { selectedBuilding, ...newItems } = prevState;
            return newItems;
        });
        setSelectedBuildingInsight(undefined);
    }
    const router = useRouter();
    async function crmAction() {
        if (customerData?.data && customerData.data.length > 0) {
            router.push(`/crm`);
            return;
        }

        let resDetails: AddressResponse | undefined = residentDetails;
        if (!resDetails) {
            const res = await refetchResidentDetails().then((res) => res.data);
            if (!res || res.isError) {
                console.error('Failed to fetch resident details');
                return;
            }
            resDetails = res;
        }

        const emails = resDetails.persons
            .map((p) => p.emails)
            .flat()
            .map((e) => ({
                type: e.isBusiness ? 'business' : 'personal',
                email: e.email,
            }));
        const phones = resDetails.persons
            .map((p) => p.phones)
            .flat()
            .map((p) => ({ type: p.type, phone: p.number }));
        const name =
            resDetails.persons[0].name.firstName +
            ' ' +
            resDetails.persons[0].name.lastName;

        const newCustomer: PutCustomersRequestSchema = {
            name,
            address: selectedBuildingInsight!.address,
            emails,
            phones,
            primaryEmail: emails?.[0]?.email,
            primaryPhone: phones?.[0]?.phone,
            saleScore: 0,
            savingsRating: 0,
        };

        createCustomerMutation.mutate(newCustomer);
    }

    return (
        <main className="flex min-h-screen min-w-screen">
            <div className="flex-1">
                <MapBox
                    className="map-container min-h-screen"
                    latLng={
                        proximityCenter || {
                            latitude: selectedCoordinates?.latitude || 41.8387,
                            longitude:
                                selectedCoordinates?.longitude || -87.6553,
                        }
                    }
                    zoom={17}
                    markers={markers}
                    canvasLayers={layers}
                    geoJsonFeatureCollections={buildingFeatures}
                    onClick={mapOnClickAction}
                />
                <Sidebar isVisible={!!selectedCoordinates}>
                    <AIFilter
                        data={buildingInsights}
                        isFetching={areaDetailsIsFetching}
                    >
                        {(data, status) =>
                            areaDetailsIsFetching &&
                            buildingInsights.length == 0 ? (
                                <div className="mx-4 px-4 py-2 bg-white bg-opacity-60 rounded-lg border-white border-4 border-opacity-40">
                                    <p className="text-lg font-semibold">
                                        Hang tight, analyzing area!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        This will take about 2 minutes
                                    </p>
                                </div>
                            ) : (
                                <BuildingList
                                    data={data}
                                    onSelect={buildingInsightSelectedAction}
                                />
                            )
                        }
                    </AIFilter>
                </Sidebar>
                <Sidebar
                    isVisible={!!selectedBuildingInsight}
                    backButtonAction={buildingInsightBackAction}
                >
                    <div className="px-4">
                        <AddressDetails
                            address={selectedBuildingInsight?.address}
                        />
                        <Button
                            variant="default"
                            className="my-2 w-full"
                            onClick={crmAction}
                            disabled={
                                customerDataIsFetching ||
                                createCustomerMutation.isPending
                            }
                        >
                            {customerData?.data && customerData.data.length > 0
                                ? 'View on CRM'
                                : 'Add to CRM'}
                        </Button>
                        <BuildingInsightsTable
                            data={selectedBuildingInsight?.rawData}
                        />
                        <ResidentInsightsTable
                            data={residentDetails}
                            requestData={() => {
                                if (!residentDetailsIsFetching)
                                    refetchResidentDetails();
                            }}
                        />
                    </div>
                </Sidebar>
            </div>
        </main>
    );
}
