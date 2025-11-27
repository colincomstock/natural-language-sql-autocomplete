import { SearchCode, Database, X, CircleArrowRight, CirclePlus } from "lucide-react";
import type { QueryOption } from "../types";

interface SearchViewProps {
    search: string;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSearchTerms: (value: string) => void;
    suggestions: QueryOption[];
    handleSuggestionSelect: (index: number) => void;

}

export default function SearchView({ search, handleChange, setSearchTerms, suggestions, handleSuggestionSelect }: SearchViewProps) {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}
    
    return(
        <div className='search-container'>
            <form className='ntrl-input' onSubmit={handleSubmit}>
                <SearchCode />
                <input 
                    type='text'
                    placeholder='describe a SQL query you would like to perform in plain terms' 
                    aria-label='describe a SQL query you would like to perform in plain terms'
                    name='querySearch'
                    onChange={handleChange}
                    value={search}
                />
                <button className='clear-button' onClick={() => setSearchTerms('')}>
                    {search ? <X className='clear-icon'/> : null}
                </button>
            </form>
            {suggestions.length > 0 && (
                <div className='results'>
                    {suggestions.map((suggestion, index) => (
                        <div onClick={() => handleSuggestionSelect(index)} key={index} className='suggestion'>
                            <Database />
                            {suggestion.description.includes("expanding on previous") ? 
                                <CircleArrowRight /> :
                                <CirclePlus />
                            }
                            <div className='suggestion-content'>
                                <p>{suggestion.description
                                    .replace('(expanding on previous) ', '')
                                    .replace('(new query)', '')}</p>
                                <pre><code>{suggestion.sqlQuery}</code></pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}