import {
    LatLng,
    RetrieveSearchSuggestionResponse,
    SearchSuggestResponse,
    StreetAddress,
    Suggestion,
} from '@/types';
import axios from 'axios';

export function getStreetAddress(latLng: LatLng): () => Promise<StreetAddress> {
    return async () => {
        if (!latLng) {
            throw new Error('No coordinates provided');
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${latLng.longitude},${latLng.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
        console.debug('Fetching URL:', url);

        const response = await axios.get(url);

        const address = response.data.features[0]?.place_name as string;
        const lines = address.split(',');
        const line1 = lines.slice(0, -3).join(',');
        const line2 = lines.slice(-3).join(',');
        const streetAddress = { line1, line2 } as StreetAddress;

        return streetAddress;
    };
}

export function getStreetAddressList(
    latLng: LatLng[]
): () => Promise<StreetAddress[]> {
    return async () => {
        const url = `https://api.mapbox.com/search/geocode/v6/batch?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
        console.debug('Fetching URL:', url);
        const data = latLng.map((d) => ({
            types: ['address'],
            longitude: d.longitude,
            latitude: d.latitude,
        }));

        const response = await axios.post(url, data);
        const streets: StreetAddress[] = response.data.batch.map((d: any) => ({
            line1: d.features[0]?.properties?.name,
            line2: d.features[0]?.properties?.place_formatted,
        }));

        return streets;
    };
}

export function getSearchSuggestions(
    query: string,
    session_token: string
): () => Promise<Suggestion[]> {
    return async () => {
        const params = new URLSearchParams({
            q: query,
            limit: '5',
            session_token: session_token,
            country: 'US',
            access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
            types: 'region,postcode,district,place,city,locality,neighborhood,street,address,poi',
        });

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`;
        console.debug('Fetching URL:', url);

        const response = await axios.get<SearchSuggestResponse>(url);

        return response.data.suggestions;
    };
}

export function getRetrieveSearchSuggestion(
    id: string,
    session_token: string
): () => Promise<RetrieveSearchSuggestionResponse> {
    return async () => {
        const params = new URLSearchParams({
            session_token: session_token,
            access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
        });
        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}?${params}`;
        console.debug('Fetching URL:', url);

        const response = await axios.get<RetrieveSearchSuggestionResponse>(url);

        return response.data;
    };
}
