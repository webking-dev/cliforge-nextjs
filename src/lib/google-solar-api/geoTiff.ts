import { GeoTiff } from '@/types';
import * as geotiff from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';

/**
 * Downloads the pixel values for a Data Layer URL from the Solar API.
 *
 * @param  {string} url        URL from the Data Layers response.
 * @param  {string} apiKey     Google Cloud API key.
 * @return {Promise<GeoTiff>}  Pixel values with shape and lat/lon bounds.
 */
export async function downloadGeoTIFF(
	url: string,
	apiKey: string
): Promise<GeoTiff> {
	console.debug(`Downloading data layer: ${url}`);

	// Include your Google Cloud API key in the Data Layers URL.
	const solarUrl = url.includes('solar.googleapis.com')
		? url + `&key=${apiKey}`
		: url;
	const response = await fetch(solarUrl);
	if (response.status != 200) {
		const error = await response.json();
		console.error(`downloadGeoTIFF failed: ${url}\n`, error);
		throw error;
	}

	// Get the GeoTIFF rasters, which are the pixel values for each band.
	const arrayBuffer = await response.arrayBuffer();
	const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
	const image = await tiff.getImage();
	const rasters = await image.readRasters();

	// Reproject the bounding box into lat/lon coordinates.
	const geoKeys = image.getGeoKeys();
	const projObj = geokeysToProj4.toProj4(geoKeys);
	const projection = proj4(projObj.proj4, 'WGS84');
	const box = image.getBoundingBox();
	const sw = projection.forward({
		x: box[0] * projObj.coordinatesConversionParameters.x,
		y: box[1] * projObj.coordinatesConversionParameters.y,
	});
	const ne = projection.forward({
		x: box[2] * projObj.coordinatesConversionParameters.x,
		y: box[3] * projObj.coordinatesConversionParameters.y,
	});

	return {
		// Width and height of the data layer image in pixels.
		// Used to know the row and column since Javascript
		// stores the values as flat arrays.
		width: rasters.width,
		height: rasters.height,
		// Each raster reprents the pixel values of each band.
		// We convert them from `geotiff.TypedArray`s into plain
		// Javascript arrays to make them easier to process.
		rasters: [...Array(rasters.length).keys()].map((i) =>
			Array.from(rasters[i] as geotiff.TypedArray)
		),
		// The bounding box as a lat/lon rectangle.
		bounds: {
			north: ne.y,
			south: sw.y,
			east: ne.x,
			west: sw.x,
		},
	};
}
