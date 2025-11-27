import type { QueryOption, Message } from '../types';

const WORKER_URL = 'https://autocomplete-worker.comstockcolin.workers.dev/';

export default async function autocomplete(
    userInput: string,
    conversationHistory: Message[],
    schemaDescription: string,
    signal?: AbortSignal
): Promise<QueryOption[]> {
    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userInput,
            conversationHistory,
            schemaDescription,
        }),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Worker request failed: ${response.statusText}`);
    }

    const suggestions = await response.json();
    return suggestions;
}