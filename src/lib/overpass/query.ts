import { Bounds } from "@/types";
import query_overpass from "query-overpass";

const OverpassAPI = {
	getBuildingsInBounds: async (bounds: Bounds) => {
		const query = `[out:json][timeout:25];
(nwr["building"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});); 
out geom;`;

		console.info("Running overpass query:", query);

		return new Promise<GeoJSON.FeatureCollection>((resolve, reject) => {
			query_overpass(query, (error: Error | undefined, data: any) => {
				if (error) {
					reject(error);
				} else {
					resolve(data as GeoJSON.FeatureCollection);
				}
			});
		});
	},
};

export default OverpassAPI;
