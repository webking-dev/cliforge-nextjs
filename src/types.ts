// ENDATO API response schema
export interface AddressResponse {
    persons: Person[];
    isError: boolean;
}

type PersonEmail = {
    email: string;
    isBusiness: boolean;
    isValidated: boolean;
};

type PersonPhone = {
    number: string;
    type: string;
    isConnected: boolean;
    firstReportedDate: string;
    lastReportedDate: string;
};

export interface Person {
    name: Name;
    age: string;
    addresses: any[];
    phones: PersonPhone[];
    emails: PersonEmail[];
}

export interface Name {
    firstName: string;
    middleName: string;
    lastName: string;
}

export type StreetAddress = {
    line1: string;
    line2: string;
};

// Google Maps Solar API response schema
export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface LatLngBox {
    sw: LatLng;
    ne: LatLng;
}

export interface DateInParts {
    year: number;
    month: number;
    day: number;
}

export interface BuildingInsightsResponse {
    type: 'buildingInsights';
    name: string;
    streetAddress: StreetAddress;
    center: LatLng;
    boundingBox?: LatLngBox;
    imageryDate: DateInParts;
    imageryProcessedDate?: DateInParts;
    postalCode?: string;
    administrativeArea?: string;
    statisticalArea?: string;
    regionCode?: string;
    solarPotential: SolarPotential;
    imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BuildingInsightsCondensed {
    id: string;
    streetAddress: string;
    wholeRoofArea: number;
    maxSunshineHours: number;
    maxArrayArea: number;
    maxPanelCount: number;
    carbonOffsetFactor: number;
}

export interface DataLayersResponse {
    imageryDate: DateInParts;
    imageryProcessedDate: DateInParts;
    dsmUrl: string;
    rgbUrl: string;
    maskUrl: string;
    annualFluxUrl: string;
    monthlyFluxUrl: string;
    hourlyShadeUrls: string[];
    imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type DataLayersDetailResponse = DataLayersResponse &
    LayersGeoTiffResponse;

export type BuildingProperties = [area: number, centroid: LatLng];

export interface AreaSolarDetailsResponse {
    imageryDate: DateInParts;
    imageryProcessedDate: DateInParts;
    dsmUrl: string;
    rgbUrl: string;
    maskUrl: string;
    annualFluxUrl: string;
    monthlyFluxUrl: string;
    hourlyShadeUrls: string[];
    dsm: GeoTiff;
    rgb: GeoTiff;
    mask: GeoTiff;
    annualFlux: GeoTiff;
    monthlyFlux: GeoTiff;
    hourlyShade: GeoTiff[];
    imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    buildingFeatures: GeoJSON.FeatureCollection;
    buildingInsights: BuildingInsightsResponse[];
}

export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface GeoTiff {
    width: number;
    height: number;
    rasters: Array<number>[];
    bounds: Bounds;
}

export interface SolarPotential {
    maxArrayPanelsCount: number;
    panelCapacityWatts?: number;
    panelHeightMeters?: number;
    panelWidthMeters?: number;
    panelLifetimeYears?: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    carbonOffsetFactorKgPerMwh: number;
    wholeRoofStats: SizeAndSunshineStats;
    buildingStats?: SizeAndSunshineStats;
    roofSegmentStats?: RoofSegmentSizeAndSunshineStats[];
    solarPanels?: SolarPanel[];
    solarPanelConfigs?: SolarPanelConfig[];
    financialAnalyses?: object;
}

export interface SizeAndSunshineStats {
    areaMeters2: number;
    sunshineQuantiles?: number[];
    groundAreaMeters2: number;
}

export interface RoofSegmentSizeAndSunshineStats {
    pitchDegrees: number;
    azimuthDegrees: number;
    stats: SizeAndSunshineStats;
    center: LatLng;
    boundingBox: LatLngBox;
    planeHeightAtCenterMeters: number;
}

export interface SolarPanel {
    center: LatLng;
    orientation: 'LANDSCAPE' | 'PORTRAIT';
    segmentIndex: number;
    yearlyEnergyDcKwh: number;
}

export interface SolarPanelConfig {
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    roofSegmentSummaries?: RoofSegmentSummary[];
}

export interface RoofSegmentSummary {
    pitchDegrees: number;
    azimuthDegrees: number;
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    segmentIndex: number;
}

export type DataLayerView =
    | 'DSM_LAYER'
    | 'IMAGERY_LAYERS'
    | 'IMAGERY_AND_ANNUAL_FLUX_LAYERS'
    | 'IMAGERY_AND_ALL_FLUX_LAYERS'
    | 'FULL_LAYERS';

export enum LayerId {
    Mask = 'mask',
    DSM = 'dsm',
    AnnualFlux = 'annualFlux',
    MonthlyFlux = 'monthlyFlux',
    RGB = 'rgb',
    HourlyShade = 'hourlyShade',
}

export type LayersGeoTiffResponse = {
    [key in LayerId]: key extends LayerId.HourlyShade ? GeoTiff[] : GeoTiff;
};

export interface Palette {
    colors: string[];
    min: string;
    max: string;
}

export interface Layer {
    id: LayerId;
    render: (
        showRoofOnly: boolean,
        month?: number,
        day?: number
    ) => HTMLCanvasElement[];
    bounds: Bounds;
    palette?: Palette;
}

export type BuildingInsight = {
    name: string;
    address: StreetAddress;
    imageryDate: string;
    roofSize: string;
    maxPanelCount: number;
    maxArrayArea: string;
    maxSunshineHours: string;
    rawData: BuildingInsightsResponse;
};

// Search Suggestions API response schema

export interface SearchSuggestResponse {
    suggestions: Suggestion[];
    attribution: string;
}

export interface Suggestion {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
    place_formatted: string;
    context: Context;
    language: string;
    maki: string;
    poi_category: string[];
    poi_category_ids: string[];
    external_ids: ExternalIDS;
    metadata: Metadata;
}

export interface Context {
    country: Country;
    region: Region;
    postcode: Neighborhood;
    place: Neighborhood;
    neighborhood: Neighborhood;
    street: Neighborhood;
}

export interface Country {
    name: string;
    country_code: string;
    country_code_alpha_3: string;
}

export interface Neighborhood {
    name: string;
}

export interface Region {
    name: string;
    region_code: string;
    region_code_full: string;
}

export interface ExternalIDS {
    safegraph: string;
    foursquare: string;
}

export interface Metadata {}

// Retrieve Search Suggestions API response schema

export interface RetrieveSearchSuggestionResponse {
    type: string;
    features: Feature[];
    attribution: string;
}

export interface Feature {
    type: string;
    geometry: Geometry;
    properties: Properties;
}

export interface Geometry {
    coordinates: number[];
    type: string;
}

export interface Properties {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
    place_formatted: string;
    context: Context;
    coordinates: Coordinates;
    language: string;
    maki: string;
    poi_category: string[];
    poi_category_ids: string[];
    external_ids: ExternalIDS;
    metadata: Metadata;
    operational_status: string;
}

export interface Context {
    country: Country;
    region: Region;
    postcode: Neighborhood;
    place: Neighborhood;
    neighborhood: Neighborhood;
    address: Address;
    street: Neighborhood;
}

export interface Address {
    id: string;
    name: string;
    address_number: string;
    street_name: string;
}

export type FullAddress = {
    street_address: string;
    unit: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
};

export type PhoneList = {
    type: string;
    phone: string;
}[];

export type EmailList = {
    type: string;
    email: string;
}[];

export enum CustomerStatus {
    NewLead = 'new-lead',
    QualifiedLead = 'qualified-lead',
    DisqualifiedLead = 'disqualified-lead',
    Nurture = 'nurture',
    Open = 'open',
    ProposalSent = 'proposal-sent',
    Negotiation = 'negotiation',
    ContractSent = 'contract-sent',
    ContractSigned = 'contract-signed',
    ClosedWon = 'closed-won',
    ClosedLost = 'closed-lost',
    OnHold = 'on-hold',
    Renewal = 'renewal',
    UpsellCrossSellOpportunity = 'upsell-cross-sell-opportunity',
    Pending = 'pending',
    FollowUp = 'follow-up',
    Research = 'research',
    MeetingScheduled = 'meeting-scheduled',
}

export const CustomerStatusDisplay: Record<CustomerStatus, string> = {
    [CustomerStatus.NewLead]: 'New Lead',
    [CustomerStatus.QualifiedLead]: 'Qualified Lead',
    [CustomerStatus.DisqualifiedLead]: 'Disqualified Lead',
    [CustomerStatus.Nurture]: 'Nurture',
    [CustomerStatus.Open]: 'Open',
    [CustomerStatus.ProposalSent]: 'Proposal Sent',
    [CustomerStatus.Negotiation]: 'Negotiation',
    [CustomerStatus.ContractSent]: 'Contract Sent',
    [CustomerStatus.ContractSigned]: 'Contract Signed',
    [CustomerStatus.ClosedWon]: 'Closed Won',
    [CustomerStatus.ClosedLost]: 'Closed Lost',
    [CustomerStatus.OnHold]: 'On Hold',
    [CustomerStatus.Renewal]: 'Renewal',
    [CustomerStatus.UpsellCrossSellOpportunity]:
        'Upsell/Cross-Sell Opportunity',
    [CustomerStatus.Pending]: 'Pending',
    [CustomerStatus.FollowUp]: 'Follow-Up',
    [CustomerStatus.Research]: 'Research',
    [CustomerStatus.MeetingScheduled]: 'Meeting Scheduled',
};

export interface Country {
    id: string;
    name: string;
    country_code: string;
    country_code_alpha_3: string;
}

export interface Neighborhood {
    id: string;
    name: string;
}

export interface Region {
    id: string;
    name: string;
    region_code: string;
    region_code_full: string;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
    routable_points: RoutablePoint[];
}

export interface RoutablePoint {
    name: string;
    latitude: number;
    longitude: number;
}

export interface ExternalIDS {
    foursquare: string;
}

export interface Metadata {
    wheelchair_accessible: boolean;
    primary_photo: string;
}

export type DataLayersAndPropertiesResponse = {
    type: 'layers+features';
    dataLayers: DataLayersDetailResponse;
    buildingFeatures: GeoJSON.FeatureCollection;
};

export type FeatureCollectionWithId = GeoJSON.FeatureCollection & {
    id: string;
};

export type PaginatedResult<T> = {
    data: T[];
    metadata: {
        totalCount: number;
        pagination: Pagination;
        sorting: Sorting<T>;
    };
};

export enum SortOrder {
    Ascending = 'asc',
    Descending = 'desc',
}

export type PaginatedSearchParamsOverride = {
    pageNumber: string;
    pageSize: string;
};

export type Pagination = {
    pageNumber: number;
    pageSize: number;
};

export type Sorting<T> = {
    sortBy: keyof T;
    sortOrder: SortOrder;
};

export type Filter<T> = {
    key: keyof T;
    value: string;
};
