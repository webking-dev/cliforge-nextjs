declare module "query-overpass" {
	type QueryOverpassOptions = {
		overpassUrl?: string;
		flatProperties?: boolean;
	};

	type QueryOverpassCallback = (error: Error | undefined, data: any) => void;

	function queryOverpass(
		query: string,
		cb: QueryOverpassCallback,
		options?: QueryOverpassOptions
	): any;

	export = queryOverpass;
}
