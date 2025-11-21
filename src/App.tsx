import { useState, useEffect } from 'react'
import autocomplete, { type QueryOption } from './lib/groqAutocomplete';
import './App.css'

function App() {

const [searchTerms, setSearchTerms] = useState('');
const [suggestions, setSuggestions] = useState<QueryOption[]>([]);
const [isLoading, setIsLoading] = useState(false);

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const value = event.currentTarget.value;
  setSearchTerms(value);
}

useEffect(() => {
  const controller = new AbortController();

  const timer = setTimeout(async () => {
    if (searchTerms.length > 2) {
      try {
        setIsLoading(true);

        const results = await autocomplete(
          searchTerms,
          controller.signal
        );

        setSuggestions(results);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  }, 600);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [searchTerms])

  return (
    <main>
      <div>
        <h1 className='header'>Natural Language SQL Autocomplete</h1>
      </div>
      <div className='content'>
        <input 
          type='text'
          placeholder='natural language sql search' 
          aria-label='search for your desired SQL query'
          name='querySearch'
          onChange={handleChange}
          value={searchTerms}
          style={{width: "500px"}}
        />
        {isLoading && <div>Loading suggestions...</div>}
        {!isLoading && suggestions.length > 0 && (
          <div className='suggestions'>
            {suggestions.map((suggestion, index) => (
              <div key={index} className='suggestion'>
                <h3>Option {index + 1}</h3>
                <p><strong>Description:</strong> {suggestion.description}</p>
                <pre><code>{suggestion.sqlQuery}</code></pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default App
