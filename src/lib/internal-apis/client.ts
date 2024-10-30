import { AIFilterResponse } from '@/app/api/ai-filter/route';
import { PostCustomersRequestSchema } from '@/app/api/customers/[id]/route';
import {
    CustomersRequestParams,
    GetCustomerResponse,
    PutCustomersRequestSchema,
} from '@/app/api/customers/route';
import { CustomersSearchParams } from '@/app/api/customers/types';
import { PropertyDetailsSearchParams } from '@/app/api/property-details/route';
import { SolarDetailsSearchParams } from '@/app/api/solar-details/route';
import {
    AddressResponse,
    AreaSolarDetailsResponse,
    BuildingInsightsResponse,
    Filter,
    LatLng,
    Pagination,
    Sorting,
    StreetAddress,
} from '@/types';
import axios from 'axios';
import { Customer } from '../db/schema/customer';

export type ApiFn<T> = () => Promise<T>;

export function getSolarDetails(
    latLng: LatLng
): ApiFn<BuildingInsightsResponse> {
    return async () => {
        const params = new URLSearchParams({
            'location.latitude': latLng.latitude.toString(),
            'location.longitude': latLng.longitude.toString(),
        } as SolarDetailsSearchParams);

        const url = `/api/solar-details?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<BuildingInsightsResponse>(url).then((res) => res.data);
    };
}

export function getOwnerResidentDetails(
    address?: StreetAddress
): ApiFn<AddressResponse> {
    return async () => {
        if (!address) return Promise.reject('Address is required');

        const params = new URLSearchParams({
            'address.line1': address.line1,
            'address.line2': address.line2,
        } as PropertyDetailsSearchParams);

        const url = `/api/property-details?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<AddressResponse>(url).then((res) => res.data);
    };
}

export function getAreaSolarDetails(
    latLng: LatLng
): ApiFn<AreaSolarDetailsResponse> {
    return async () => {
        const params = new URLSearchParams({
            'location.latitude': latLng.latitude.toFixed(4),
            'location.longitude': latLng.longitude.toFixed(4),
        } as SolarDetailsSearchParams);

        const url = `/api/area-solar-details?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<AreaSolarDetailsResponse>(url).then((res) => res.data);
    };
}

export function getAreaSolarDetailsURL(latLng: LatLng): () => string {
    return () => {
        const params = new URLSearchParams({
            'location.latitude': latLng.latitude.toFixed(4),
            'location.longitude': latLng.longitude.toFixed(4),
        } as SolarDetailsSearchParams);

        return `/api/area-solar-details?${params}`;
    };
}

export function getAIFilter(query: string): ApiFn<AIFilterResponse> {
    return async () => {
        const params = new URLSearchParams({ query });
        const url = `/api/ai-filter?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<AIFilterResponse>(url).then((res) => res.data);
    };
}

export function getCustomerWithAddress(
    address?: StreetAddress
): ApiFn<GetCustomerResponse> {
    return async () => {
        if (!address) return Promise.reject('Address is required');
        const params = new URLSearchParams({
            [CustomersSearchParams.Line1]: address.line1,
            [CustomersSearchParams.Line2]: address.line2,
        } as CustomersRequestParams);

        const url = `/api/customers?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<GetCustomerResponse>(url).then((res) => res.data);
    };
}

export function getCustomers(
    pagination: Pagination,
    sorting: Sorting<Customer>,
    filter?: Filter<Customer>
): ApiFn<GetCustomerResponse> {
    return async () => {
        const params = new URLSearchParams({
            [CustomersSearchParams.PageNumber]: pagination.pageNumber,
            [CustomersSearchParams.PageSize]: pagination.pageSize,
            [CustomersSearchParams.SortBy]: sorting.sortBy,
            [CustomersSearchParams.SortOrder]: sorting.sortOrder,
        } as CustomersRequestParams);

        if (filter) {
            params.set(CustomersSearchParams.FilterKey, filter.key);
            params.set(CustomersSearchParams.FilterValue, filter.value);
        }

        const url = `/api/customers?${params}`;
        console.debug('Fetching URL:', url);

        return axios.get<GetCustomerResponse>(url).then((res) => res.data);
    };
}

export function getCustomersCount(
    filter?: Filter<Customer>
): ApiFn<{ totalCount: number; filter?: Filter<Customer> }> {
    return async () => {
        const params = new URLSearchParams({} as CustomersRequestParams);

        if (filter) {
            params.set(CustomersSearchParams.FilterKey, filter.key);
            params.set(CustomersSearchParams.FilterValue, filter.value);
        }

        const url = `/api/customers?${params}`;
        console.debug('Fetching URL:', url);

        return axios.head<GetCustomerResponse>(url).then((res) => {
            console.log(res);
            return {
                totalCount: res.headers['x-total-count'],
                filter,
            };
        });
    };
}

export function createCustomer(
    newCustomer: PutCustomersRequestSchema
): ApiFn<GetCustomerResponse> {
    return async () => {
        const url = '/api/customers';
        console.debug('Putting URL:', url, newCustomer);

        return axios
            .put<GetCustomerResponse>(url, newCustomer)
            .then((res) => res.data);
    };
}

export function updateCustomer(
    id: Customer['id'],
    updates: PostCustomersRequestSchema
): ApiFn<GetCustomerResponse> {
    return async () => {
        const url = `/api/customers/${id}`;
        console.debug('Updating URL:', url, updates);

        return axios
            .post<GetCustomerResponse>(url, updates)
            .then((res) => res.data);
    };
}
