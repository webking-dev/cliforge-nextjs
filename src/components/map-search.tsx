import {
	getRetrieveSearchSuggestion,
	getSearchSuggestions,
} from '@/lib/mapbox/client';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { v4 as uuid } from 'uuid';
import { Suggestion } from '@/types';
import useAppStateStore from '@/lib/stores/appStateStore';
import LatLngUtils from '@/lib/latlng/utils';
import Search from './ui/search';

export default function MapSearch() {

	const [searchQuery, setSearchQuery] = useState<string>('');
	const debouncedSearchQuery = useDebounce(searchQuery, 500);
	const current_token = useRef(uuid()).current;

	const selectedMapBoxIdRef = useRef<string | undefined>();
	const proximityCenter = useAppStateStore((state) => state.proximityCenter);
	
	const setProximityCenter = useAppStateStore(
		(state) => state.setProximityCenter
	);

	const setHeaderExpanded = useAppStateStore(
		(state) => state.setHeaderExpanded
	);

	const { data: suggestions, isFetching: isSearchFetching } = useQuery({
		enabled: !!debouncedSearchQuery,
		queryKey: ['searchSuggestions', debouncedSearchQuery],
		queryFn: getSearchSuggestions(debouncedSearchQuery!, current_token),
	});

	const handleSuggestionClick = (suggestion: Suggestion) => {
		console.debug('Suggestion clicked', suggestion);
		selectedMapBoxIdRef.current = suggestion.mapbox_id;
		setSearchQuery(suggestion.name);
	};

	const { data: retrievedSearchSuggestion, isFetching: isRetrieveFetching } = 
		useQuery({
			enabled: !!debouncedSearchQuery && !!selectedMapBoxIdRef.current,
			queryKey: [
				'searchSuggestions',
				debouncedSearchQuery,
				selectedMapBoxIdRef.current,
			],
			queryFn: getRetrieveSearchSuggestion(
				selectedMapBoxIdRef.current!,
				current_token
			),
		});

	useEffect(() => {
		console.debug('Retrieved search suggestion', retrievedSearchSuggestion);
		const [lng, lat] =
			retrievedSearchSuggestion?.features?.[0]?.geometry?.coordinates ?? [];
		if (lng && lat) {
			const LatLng = { latitude: lat, longitude: lng };
			setProximityCenter(LatLng);
			setHeaderExpanded(false);
		}
	}, [setProximityCenter, retrievedSearchSuggestion, setHeaderExpanded]);

	return (
		<Search searchQuery={searchQuery} placeholderText='Solar Leads near S Layman St'
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
		>
			
			{!suggestions && !isSearchFetching && ( // No suggestions or search
				<div className='flex items-center justify-center p-4 text-sm text-muted-foreground'>
					Try searching for a location
				</div>
			)}

			{suggestions && suggestions.length === 0 && ( // No results found
				<div className='flex items-center justify-center p-4 text-sm text-muted-foreground'>
					No results found
				</div>
			)}

			{suggestions && suggestions.length > 0 && ( // suggestions and results found
				<div className='px-2 divide-y divide-gray-200'>
					{suggestions.map((suggestion) => (
						<Button
							key={suggestion.mapbox_id}
							variant={'ghost'}
							onClick={handleSuggestionClick.bind(null, suggestion)}
							className='w-full h-auto px-2 rounded-none'
						>
							<div className='w-full p-0 flex flex-col justify-center items-start'>
								<div className='text-base font-semibold text-ellipsis'>
									{suggestion.name}
								</div>
								<p className='text-sm text-muted-foreground min-w-0'>
									{suggestion.place_formatted}
								</p>
							</div>
						</Button>
					))}
				</div>
			)}
		</Search>
	);
}
