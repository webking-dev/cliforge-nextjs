import { Bounds, LatLng } from '@/types';

const LatLngUtils = {
	getBounds: (latLng: LatLng, radius: number): Bounds => {
		const earthRadius = 6378137.0; // meters

		// Angular distance in radians on a great circle
		const deltaLng =
			((radius / earthRadius) * (180 / Math.PI)) /
			Math.cos((latLng.latitude * Math.PI) / 180);
		const deltaLat = (radius / earthRadius) * (180 / Math.PI);

		// Bounding box coordinates
		const minLat = latLng.latitude - deltaLat;
		const maxLat = latLng.latitude + deltaLat;
		const minLng = latLng.longitude - deltaLng;
		const maxLng = latLng.longitude + deltaLng;

		return {
			north: maxLat,
			east: maxLng,
			south: minLat,
			west: minLng,
		};
	},
	findCentroid: (feature: GeoJSON.Feature): LatLng => {
		if (feature.geometry.type !== 'Polygon')
			throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);

		const coordinates = feature.geometry.coordinates[0];
		let sumX = 0;
		let sumY = 0;

		for (const point of coordinates) {
			sumX += point[0];
			sumY += point[1];
		}

		const centroidX = sumX / coordinates.length;
		const centroidY = sumY / coordinates.length;

		return { longitude: centroidX, latitude: centroidY };
	},
	findArea: (feature: GeoJSON.Feature): number => {
		if (feature.geometry.type !== 'Polygon')
			throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);

		const coordinates = feature.geometry.coordinates[0];
		let area = 0;

		for (let i = 0; i < coordinates.length - 1; i++) {
			const p1 = coordinates[i];
			const p2 = coordinates[i + 1];

			area += p1[0] * p2[1] - p2[0] * p1[1];
		}

		return Math.abs(area) / 2;
	},
};

export default LatLngUtils;
