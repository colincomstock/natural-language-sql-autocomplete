export type HistoryItem = {
  id: string;
  userText: string;
  suggestions: QueryOption[];
  selectedIndex?: number | undefined;
}

export type QueryOption = {
    sqlQuery: string;
    description: string;
};

export type AutocompleteResponse = {
    suggestions: QueryOption[];
};

export interface Message {
    id?: string;
    role: 'system' | 'user' | 'assistant';
    content: 
        | string
        | Array<{
            type: 'text' | 'image' | 'input_text' | 'input_file';
            text?: string;
            data?: any;
            mimeType?: string;
        }>;
    name?: string;
    createdAt?: Date;
}