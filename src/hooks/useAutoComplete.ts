import { useState, useEffect } from 'react';
import autocomplete from '../lib/groqAutocomplete';
import type { QueryOption, Message, HistoryItem } from '../types';

export function useAutocomplete(
    searchTerms: string,
    history: HistoryItem[],
    schemaDescription: string
) {
    const [suggestions, setSuggestions] = useState<QueryOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            if (searchTerms.length > 2) {
                try {
                    setIsLoading(true);

                    const recentHistory = history
                        .filter(item => item.selectedIndex !== undefined)
                        .slice(-5);

                    const chatHistory: Message[] = recentHistory.flatMap(item => {
                        const selectedIndex = item.selectedIndex ?? 0;
                        const chosen = item.suggestions[selectedIndex];

                        return [
                            { 
                                role: 'user' as const, 
                                content: `Previous natural language query: ${item.userText}`
                            },
                            { 
                                role: 'assistant' as const, 
                                content: `Chosen SQL suggestion for the previous query: \nDescription: ${chosen.description} \nSQL: ${chosen.sqlQuery || '' }`
                            }
                        ];
                    });

                    const results = await autocomplete(
                        searchTerms,
                        chatHistory,
                        schemaDescription,
                        controller.signal
                    );

                    setSuggestions(results);
                } catch (error) {
                    if (error instanceof Error && error.name !== "AbortError") {
                        console.error(error);
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchTerms, history, schemaDescription]);

    return { suggestions, isLoading };
}