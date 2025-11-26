import { useState, useEffect } from 'react'
import autocomplete from './lib/groqAutocomplete';
import type { HistoryItem, QueryOption, Message } from './types';
import './App.css'

function App() {

	const [searchTerms, setSearchTerms] = useState('');
	const [suggestions, setSuggestions] = useState<QueryOption[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [history, setHistory] = useState<HistoryItem[]>([]);

	const SCHEMA_DESCRIPTION = `
Table: events
Description: User-generated analytics events such as page views, clicks, and custom actions.

Columns:
- id (bigint, primary key)
- user_id (bigint, foreign key to users.id) — the user who triggered the event
- name (text) — name of the event, e.g. "page_view", "signup", "purchase"
- properties (jsonb) — miscellaneous attributes describing the event
- occurred_at (timestamp) — timestamp when the event occurred`

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.currentTarget.value;
		setSearchTerms(value);
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	function handleSuggestionSelect(index: number) {
		if (!suggestions[index]) return;

		const newHistoryItem: HistoryItem = {
			id: Date.now().toString(),
			userText: searchTerms,
			suggestions: suggestions,
			selectedIndex: index
		};

		setHistory(prev => [...prev, newHistoryItem]);

		setSearchTerms("");
		setSuggestions([]);
	}

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
					SCHEMA_DESCRIPTION,
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
	}, [searchTerms, history])

	// TODO (stretch): Implement placeholder table that renders on query select

	return (
		<main>
		<div>
			<h1 className='header'>Natural Language SQL Autocomplete</h1>
		</div>
		<div className='content'>
			<h2>Query History</h2>
			{history.map((record, index) => (
				<div key={index} className='chatHistoryItem'>
					{record.selectedIndex !== undefined && (
						<div>
							<p>Prompt: {record.userText}</p>
							<p>Description: {record.suggestions[record.selectedIndex].description}</p>
							<p>SQL: {record.suggestions[record.selectedIndex].sqlQuery}</p>
						</div>
					)}
				</div>
			))}
			<form onSubmit={handleSubmit}>
				<input 
					type='text'
					placeholder='describe a SQL query you would like to perform' 
					aria-label='describe a SQL query you would like to perform'
					name='querySearch'
					onChange={handleChange}
					value={searchTerms}
					style={{width: "500px"}}
				/>
			</form>
			{isLoading && <div>Loading suggestions...</div>}
			{!isLoading && suggestions.length > 0 && (
				<div className='suggestions'>
					{suggestions.map((suggestion, index) => (
					<div key={index} className='suggestion'>
						<h3>Option {index + 1}</h3>
						<p><strong>Description:</strong> {suggestion.description}</p>
						<pre><code>{suggestion.sqlQuery}</code></pre>
						<button onClick={() => handleSuggestionSelect(index)}>select</button>
					</div>
					))}
				</div>
			)}
		</div>
		</main>
	)
}

export default App
