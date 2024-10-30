import { getAIFilter } from '@/lib/internal-apis/client';
import { cn } from '@/lib/utils';
import { BuildingInsightsResponse } from '@/types';
import { MutationStatus, useMutation } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { LoadingSpinner } from './loading-spinner';
import { Button } from './ui/button';
import { Input } from './ui/input';

type Props = {
    isFetching: boolean;
    data: BuildingInsightsResponse[];
    children: (
        filteredData: BuildingInsightsResponse[],
        state: MutationStatus
    ) => React.ReactNode;
};

export default function AIFilter(props: Props) {
    const filterMutation = useMutation({
        mutationFn: (query: string) => getAIFilter(query)(),
    });

    const filteredData = useMemo(
        () =>
            props.data.filter((p) => {
                if (!filterMutation.data) return true;
                return filterMutation.data.includes(p.name);
            }),
        [filterMutation.data, props.data]
    );

    function aiSearchQuerySubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const query = (data.get('query') as string) || '';

        console.debug('AI Filter Query:', query);

        if (query.trim()) filterMutation.mutate(query);
        else filterMutation.reset();
    }

    const isLoading = props.isFetching || filterMutation.isPending;

    return (
        <div className="flex flex-col h-full space-y-4 pt-1">
            <form
                onSubmit={aiSearchQuerySubmit}
                className={cn(
                    'px-4 flex-grow-0 flex flex-row space-x-2',
                    props.isFetching && 'opacity-50'
                )}
            >
                <Input
                    placeholder="AI Search"
                    type="text"
                    name="query"
                    disabled={isLoading}
                />
                <Button type="submit" className="px-2" disabled={isLoading}>
                    {isLoading ? (
                        <LoadingSpinner className="mr-1" />
                    ) : (
                        <SearchIcon className="mr-1" />
                    )}
                </Button>
            </form>
            <div className="flex-1 overflow-auto">
                {props.children(filteredData, filterMutation.status)}
            </div>
        </div>
    );
}
