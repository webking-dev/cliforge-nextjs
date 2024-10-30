/*
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {
	AreaSolarDetailsResponse,
	Bounds,
	DataLayersDetailResponse,
	DataLayersResponse,
	Layer,
	LayerId,
} from '@/types';
import {
	binaryPalette,
	ironPalette,
	rainbowPalette,
	sunlightPalette,
} from './colors';

import { renderPalette, renderRGB } from './visualize';

export function getLayer(
	layerId: LayerId,
	areaSolarDetailsResponse: DataLayersDetailResponse
): Layer {
	const get: Record<LayerId, () => Layer> = {
		mask: () => {
			const mask = areaSolarDetailsResponse.mask;
			const colors = binaryPalette;
			return {
				id: layerId,
				bounds: mask.bounds,
				palette: {
					colors: colors,
					min: 'No roof',
					max: 'Roof',
				},
				render: (showRoofOnly) => [
					renderPalette({
						data: mask,
						mask: showRoofOnly ? mask : undefined,
						colors: colors,
					}),
				],
			};
		},
		dsm: () => {
			const [mask, data] = [
				areaSolarDetailsResponse.mask,
				areaSolarDetailsResponse.dsm,
			];
			const sortedValues = Array.from(data.rasters[0]).sort((x, y) => x - y);
			const minValue = sortedValues[0];
			const maxValue = sortedValues.slice(-1)[0];
			const colors = rainbowPalette;
			return {
				id: layerId,
				bounds: mask.bounds,
				palette: {
					colors: colors,
					min: `${minValue.toFixed(1)} m`,
					max: `${maxValue.toFixed(1)} m`,
				},
				render: (showRoofOnly) => [
					renderPalette({
						data: data,
						mask: showRoofOnly ? mask : undefined,
						colors: colors,
						min: sortedValues[0],
						max: sortedValues.slice(-1)[0],
					}),
				],
			};
		},
		rgb: () => {
			const [mask, data] = [
				areaSolarDetailsResponse.mask,
				areaSolarDetailsResponse.rgb,
			];
			return {
				id: layerId,
				bounds: mask.bounds,
				render: (showRoofOnly) => [
					renderRGB(data, showRoofOnly ? mask : undefined),
				],
			};
		},
		annualFlux: () => {
			const [mask, data] = [
				areaSolarDetailsResponse.mask,
				areaSolarDetailsResponse.annualFlux,
			];
			const colors = ironPalette;
			return {
				id: layerId,
				bounds: mask.bounds,
				palette: {
					colors: colors,
					min: 'Shady',
					max: 'Sunny',
				},
				render: (showRoofOnly) => [
					renderPalette({
						data: data,
						mask: showRoofOnly ? mask : undefined,
						colors: colors,
						min: 0,
						max: 1800,
					}),
				],
			};
		},
		monthlyFlux: () => {
			const [mask, data] = [
				areaSolarDetailsResponse.mask,
				areaSolarDetailsResponse.monthlyFlux,
			];
			const colors = ironPalette;
			return {
				id: layerId,
				bounds: mask.bounds,
				palette: {
					colors: colors,
					min: 'Shady',
					max: 'Sunny',
				},
				render: (showRoofOnly) =>
					[...Array(12).keys()].map((month) =>
						renderPalette({
							data: data,
							mask: showRoofOnly ? mask : undefined,
							colors: colors,
							min: 0,
							max: 200,
							index: month,
						})
					),
			};
		},
		hourlyShade: () => {
			const [mask, ...months] = [
				areaSolarDetailsResponse.mask,
				...areaSolarDetailsResponse.hourlyShade,
			];
			const colors = sunlightPalette;
			return {
				id: layerId,
				bounds: mask.bounds,
				palette: {
					colors: colors,
					min: 'Shade',
					max: 'Sun',
				},
				render: (showRoofOnly, month = 0, day = 0) =>
					[...Array(24).keys()].map((hour) =>
						renderPalette({
							data: {
								...months[month],
								rasters: months[month].rasters.map((values) =>
									values.map((x) => x & (1 << (day - 1)))
								),
							},
							mask: showRoofOnly ? mask : undefined,
							colors: colors,
							min: 0,
							max: 1,
							index: hour,
						})
					),
			};
		},
	};
	try {
		return get[layerId]();
	} catch (e) {
		console.error(`Error getting layer: ${layerId}\n`, e);
		throw e;
	}
}
