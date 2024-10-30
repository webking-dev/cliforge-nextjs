import { useEffect, useState } from 'react';

type StreamingQueryResult<T> = {
    data: T[];
    error: Error | null;
    isFetching: boolean;
};

type UseStreamingQueryOptions<T> = {
    enabled?: boolean;
    queryKey?: string | string[];
    onChunkFetched?: (chunk: T) => void;
};

function useStreamingQuery<T>(
    url: () => string,
    options: UseStreamingQueryOptions<T> = {}
): StreamingQueryResult<T> & { refetch: () => void } {
    const { enabled = true, queryKey } = options;
    const [data, setData] = useState<T[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false); // Add isFetching state
    const _queryKey = queryKey?.toString();

    const refetch = () => {
        // Trigger a refetch by resetting the data, error, and isFetching states
        setData([]);
        setError(null);
        setIsFetching(true);
    };

    useEffect(() => {
        if (!enabled) {
            return;
        }
        console.debug('fetching streaming query', url());
        const controller = new AbortController();

        setIsFetching(true); // Set isFetching to true when the fetch starts
        fetch(url(), { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                if (response.body === null) {
                    throw new Error('Response body is null');
                }
                return response.body;
            })
            .then((body) => {
                const reader = body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                function processChunk({
                    done,
                    value,
                }: ReadableStreamReadResult<Uint8Array>): Promise<void> | void {
                    if (done) {
                        // Handle any remaining data in the buffer
                        if (buffer) {
                            try {
                                const jsonObject = JSON.parse(buffer);
                                options.onChunkFetched?.(jsonObject);
                            } catch (e) {
                                console.error(
                                    'Failed to parse final JSON buffer',
                                    e
                                );
                            }
                        }
                        setIsFetching(false);
                        return;
                    }

                    // Decode the chunk
                    buffer += decoder.decode(value, { stream: true });

                    // Split the buffer into lines (individual JSON objects)
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

                    for (const line of lines) {
                        if (line) {
                            try {
                                const jsonObject = JSON.parse(line);
                                options.onChunkFetched?.(jsonObject);
                            } catch (e) {
                                console.error('Failed to parse JSON line', e);
                            }
                        }
                    }

                    // Read the next chunk
                    return reader?.read().then(processChunk);
                }

                return reader?.read().then(processChunk);
            })
            .catch((error) => {
                setError(error);
                setIsFetching(false); // Set isFetching to false when there is an error
            });

        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, _queryKey]);

    return { data, error, isFetching, refetch }; // Return isFetching in the result object
}

export default useStreamingQuery;
