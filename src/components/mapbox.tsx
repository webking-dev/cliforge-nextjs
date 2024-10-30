import { FeatureCollectionWithId, LatLng, Layer } from '@/types';
import mapboxgl, {
	CanvasSourceOptions,
	GeoJSONSource,
	GeoJSONSourceRaw,
	LngLat,
} from 'mapbox-gl';
import { HTMLAttributes, useEffect, useRef, useState } from 'react';
import PulsingMarker from './pulsing-marker';
import { AnimatePresence, motion } from 'framer-motion';
import { BotMessageSquare, Navigation } from 'lucide-react';
import useAppStateStore from '@/lib/stores/appStateStore';
import { Button } from './ui/button';
import { Switch } from "@/components/ui/switch"


type MapBoxProps = {
	latLng: LatLng;
	zoom: number;
	onClick: (latLng: LatLng) => void;
	markers: { [key: 'default' | string]: LatLng };
	// TODO: Add imperative ref handlers
	// setMarker: (key: string, latLng: LatLng) => void;
	// removeMarker: (key: string) => void;
	className: HTMLAttributes<HTMLDivElement>['className'];
	canvasLayers?: Layer[];
	geoJsonFeatureCollections?: FeatureCollectionWithId[];
};

const pulsarId = 'pulsing-dot';

export default function MapBox(props: MapBoxProps) {
	const mapRef = useRef<mapboxgl.Map>();
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
	const canvasLayerIdsRef = useRef<string[]>([]);
	const geoJsonSourceIdsRef = useRef<string[]>([]);
	const isHeaderExpanded = useAppStateStore((state) => state.isHeaderExpanded);
	const [isOffCenter, setIsOffCenter] = useState(false);
	const [isSwitched, setIsSwitched] = useState(false);
	const [currentCenter, setCurrentCenter] = useState<mapboxgl.LngLat>(
		new LngLat(props.latLng.longitude, props.latLng.latitude)
	);
	const distance =
		props.markers.default && currentCenter
			? currentCenter.distanceTo(
					new LngLat(
						props.markers.default.longitude,
						props.markers.default.latitude
					)
			  )
			: undefined;

	const calculateOffCenterState = () => {
		if (!mapRef.current) return;
		setCurrentCenter(mapRef.current!.getCenter());
	};

	const centerToDefaultMarker = () => {
		if (mapRef.current && props.markers.default)
			mapRef.current.flyTo({
				center: [
					props.markers.default.longitude,
					props.markers.default.latitude,
				],
			});
	};

	// initializes the mapboxgl library and creates a new map instance.
	useEffect(() => {
		mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

		if (!mapContainerRef.current) return;

		
		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: 'mapbox://styles/mapbox/satellite-streets-v12',
			center: [props.latLng.longitude, props.latLng.latitude],
			zoom: props.zoom,
			attributionControl: true,
		});
		
		const nav = new mapboxgl.NavigationControl();
		mapRef.current.addControl(nav, 'bottom-left')

		mapRef.current.on('style.load', () => {
			const pulsar = PulsingMarker(100, mapRef.current!);
			mapRef.current!.addImage(pulsarId, pulsar, { pixelRatio: 2 });
			if (mapRef.current!.getSource(pulsarId))
				mapRef.current!.removeSource(pulsarId);

			const pointFeature: GeoJSON.Feature<
				GeoJSON.Point,
				GeoJSON.GeoJsonProperties
			> = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [props.latLng.longitude, props.latLng.latitude], // icon position [lng, lat]
				},
				properties: {},
			};
			const source: GeoJSONSourceRaw = {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: [pointFeature],
				},
			};
			mapRef.current!.addSource(pulsarId, source);
		});

		mapRef.current.on('click', (e) => {
			console.debug('Map clicked at', e.lngLat);
			props.onClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
		});

		mapRef.current.on('moveend', calculateOffCenterState);
		mapRef.current.on('dragend', calculateOffCenterState);

		return () => mapRef.current?.remove();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// set center of the map to the given latitude and longitude
	useEffect(() => {
		if (!mapRef.current) return;
		mapRef.current.setCenter({
			lat: props.latLng.latitude,
			lng: props.latLng.longitude,
		});
	}, [props.latLng]);

	// set zoom level of the map to the given zoom level
	useEffect(() => {
		if (!mapRef.current) return;

		mapRef.current.setZoom(props.zoom);
	}, [props.zoom]);

	// add markers to the map
	useEffect(() => {
		if (!mapRef.current) return;

		// update existing markers or add new markers
		for (const key in props.markers) {
			if (markersRef.current[key]) {
				markersRef.current[key].setLngLat({
					lat: props.markers[key].latitude,
					lng: props.markers[key].longitude,
				});
			} else {
				if (key === 'default') {
					if (!mapRef.current.getLayer(pulsarId))
						mapRef.current.addLayer({
							id: pulsarId,
							type: 'symbol',
							source: pulsarId,
							layout: {
								'icon-image': pulsarId,
							},
						});

					const pointFeature: GeoJSON.Feature<
						GeoJSON.Point,
						GeoJSON.GeoJsonProperties
					> = {
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [
								props.markers[key].longitude,
								props.markers[key].latitude,
							], // icon position [lng, lat]
						},
						properties: {},
					};
					const pulsarSource = mapRef.current.getSource(
						pulsarId
					) as GeoJSONSource;
					pulsarSource.setData(pointFeature);
					mapRef.current.flyTo({
						center: [props.markers[key].longitude, props.markers[key].latitude],
					});
				} else {
					markersRef.current[key] = new mapboxgl.Marker({ color: '#5851ec' })
						.setLngLat({
							lat: props.markers[key].latitude,
							lng: props.markers[key].longitude,
						})
						.addTo(mapRef.current);
				}
			}
		}

		// remove markers that are not in the props
		for (const key in markersRef.current) {
			if (!(key in props.markers)) {
				markersRef.current[key].remove();
				delete markersRef.current[key];
			}
		}
	}, [props.markers]);

	// add canvas layers to the map
	useEffect(() => {
		if (!mapRef.current) return;

		// update existing canvas layers or add new canvas layers
		for (const canvasLayer of props.canvasLayers ?? []) {
			// remove existing canvas layer
			if (canvasLayerIdsRef.current.includes(canvasLayer.id)) {
				mapRef.current.getLayer(canvasLayer.id) &&
					mapRef.current.removeLayer(canvasLayer.id);
				mapRef.current.getSource(canvasLayer.id) &&
					mapRef.current.removeSource(canvasLayer.id);
				canvasLayerIdsRef.current = canvasLayerIdsRef.current.filter(
					(id) => id !== canvasLayer.id
				);
			}

			canvasLayerIdsRef.current.push(canvasLayer.id);
			const coordinates = [
				[canvasLayer.bounds.west, canvasLayer.bounds.north],
				[canvasLayer.bounds.east, canvasLayer.bounds.north],
				[canvasLayer.bounds.east, canvasLayer.bounds.south],
				[canvasLayer.bounds.west, canvasLayer.bounds.south],
			];
			const sourceOptions: CanvasSourceOptions = {
				canvas: canvasLayer.render(true)[0],
				coordinates,
			};
			mapRef.current.addSource(canvasLayer.id, {
				type: 'canvas',
				...sourceOptions,
			});
			mapRef.current.addLayer(
				{
					id: canvasLayer.id,
					type: 'raster',
					source: canvasLayer.id,
					paint: {
						'raster-opacity': 1,
					},
				},
				pulsarId
			);
		}

		// remove canvas layers that are not in the props
		for (const canvasLayerId of canvasLayerIdsRef.current) {
			if (
				!(props.canvasLayers ?? []).some(
					(canvasLayer) => canvasLayer.id === canvasLayerId
				)
			) {
				mapRef.current.getLayer(canvasLayerId) &&
					mapRef.current.removeLayer(canvasLayerId);
				mapRef.current.getSource(canvasLayerId) &&
					mapRef.current.removeSource(canvasLayerId);
				canvasLayerIdsRef.current = canvasLayerIdsRef.current.filter(
					(id) => id !== canvasLayerId
				);
			}
		}
	}, [props.canvasLayers]);

	// add geojson feature collections to the map
	useEffect(() => {
		if (!mapRef.current) return;

		// update existing geojson feature collections or add new geojson feature collections
		for (const geoJsonFeatureCollection of props.geoJsonFeatureCollections ??
			[]) {
			// remove existing geojson feature collection
			if (geoJsonSourceIdsRef.current.includes(geoJsonFeatureCollection.id)) {
				mapRef.current.getLayer(geoJsonFeatureCollection.id) &&
					mapRef.current.removeLayer(geoJsonFeatureCollection.id);
				mapRef.current.getSource(geoJsonFeatureCollection.id) &&
					mapRef.current.removeSource(geoJsonFeatureCollection.id);
				geoJsonSourceIdsRef.current = geoJsonSourceIdsRef.current.filter(
					(id) => id !== geoJsonFeatureCollection.id
				);
			}

			geoJsonSourceIdsRef.current.push(geoJsonFeatureCollection.id);
			const sourceOptions: GeoJSONSourceRaw = {
				type: 'geojson',
				data: geoJsonFeatureCollection,
			};
			mapRef.current.addSource(geoJsonFeatureCollection.id, sourceOptions);
			mapRef.current.addLayer(
				{
					id: geoJsonFeatureCollection.id,
					type: 'line',
					source: geoJsonFeatureCollection.id,
					paint: {
						'line-color': '#5851ec',
						'line-width': 2,
						'line-opacity': 0.6,
						// 'fill-color': '#088',
						// 'fill-opacity': 0.4,
					},
				},
				pulsarId
			);
		}

		// remove geojson feature collections that are not in the props
		for (const geoJsonSourceId of geoJsonSourceIdsRef.current) {
			if (
				!(props.geoJsonFeatureCollections ?? []).some(
					(geoJsonFeatureCollection) =>
						geoJsonFeatureCollection.id === geoJsonSourceId
				)
			) {
				mapRef.current.getLayer(geoJsonSourceId) &&
					mapRef.current.removeLayer(geoJsonSourceId);
				mapRef.current.getSource(geoJsonSourceId) &&
					mapRef.current.removeSource(geoJsonSourceId);
				geoJsonSourceIdsRef.current = geoJsonSourceIdsRef.current.filter(
					(id) => id !== geoJsonSourceId
				);
			}
		}
	}, [props.geoJsonFeatureCollections]);

	//toggle the style
	useEffect(() => {
		if (!mapRef.current) return;
		const style = isSwitched 
			? 'mapbox://styles/mapbox/streets-v12'
			: 'mapbox://styles/mapbox/satellite-streets-v12';
		mapRef.current.setStyle(style);
	}, [isSwitched]);

	return (
		<>
			<div className={props.className} ref={mapContainerRef} />
			<div className="absolute bottom-10 left-14 z-40 pointer-events-auto">
				<div className="bg-white/60 backdrop-blur-lg px-4 py-2 border-2 border-white/40 rounded-lg shadow-2xl flex items-center gap-2">
					<Switch
						checked={isSwitched}
						onCheckedChange={() => setIsSwitched(!isSwitched)}
					/>
					<span className="text-sm font-medium">Street View</span>
				</div>
			</div>
			<AnimatePresence>
				{!isHeaderExpanded && !props.markers.default && (
					<motion.div
					className='absolute top-32 left-0 right-0 p-4 pointer-events-none flex items-center justify-center z-40'
					initial={{ opacity: 0, scale: 0.5, translateY: -20 }}
					animate={{ opacity: 1, scale: 1, translateY: 0 }}
					exit={{
						opacity: 0,
						scale: 0.5,
						translateY: -20,
						transition: { delay: 0 },
					}}
					transition={{ duration: 0.4, delay: 2 }}
					>
						<div className=' bg-white/60 backdrop-blur-lg px-4 py-2 border-2 border-white/40 rounded-lg shadow-2xl inline-flex items-center gap-2'>
							<BotMessageSquare className='w-5 h-5 text-foreground' />
							<small className='text-sm font-medium leading-none text-foreground'>
								Click on the map to get started
							</small>
						</div>
					</motion.div>
				)}
				{distance && distance > 100 && (
					<motion.div
						className='absolute bottom-32 left-0 right-0 p-4 pointer-events-none flex items-center justify-center z-40'
						initial={{ opacity: 0, scale: 0.5, translateY: -20 }}
						animate={{ opacity: 1, scale: 1, translateY: 0 }}
						exit={{
							opacity: 0,
							scale: 0.5,
							translateY: -20,
							transition: { delay: 0 },
						}}
						transition={{ duration: 0.4, delay: 2 }}
					>
						<Button
							variant={'ghost'}
							className='pointer-events-auto bg-white/60 backdrop-blur-lg px-4 py-2 border-2 border-white/40 rounded-lg shadow-2xl inline-flex items-center gap-2'
							onClick={centerToDefaultMarker}
						>
							<Navigation className='w-5 h-5 text-foreground' />
							<small className='text-sm font-medium leading-none text-foreground'>
								Go back to selection
							</small>
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
