import { useState } from 'react'
import type { HistoryItem } from './types';
import SchemaView from './components/SchemaView';
import HistoryView from './components/HistoryView';
import TableView from './components/TableView'
import SearchView from './components/SearchView';
import './App.css'
import { useAutocomplete } from './hooks/useAutoComplete';
import Footer from './components/Footer';

function App() {

	const [searchTerms, setSearchTerms] = useState('');
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [schemaExpanded, setSchemaExpanded] = useState(false);
	const [historyExpanded, setHistoryExpanded] = useState(false);
	const [tableExpanded, setTableExpanded] = useState(false);

	const SCHEMA_DESCRIPTION = `
Table: events
Description: User-generated analytics events such as page views, clicks, and custom actions.

Columns:
- id (bigint, primary key)
- user_id (bigint, foreign key to users.id) — the user who triggered the event
- name (text) — name of the event, e.g. "page_view", "signup", "purchase"
- properties (jsonb) — miscellaneous attributes describing the event
- occurred_at (timestamp) — timestamp when the event occurred`

	const {suggestions} = useAutocomplete(searchTerms, history, SCHEMA_DESCRIPTION);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.currentTarget.value;
		setSearchTerms(value);
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
		setTableExpanded(true);
	}

	return (
		<main>
			<div className='content'>
				<h1>SQL Autocomplete</h1>
				<SchemaView 
					schemaDescription={SCHEMA_DESCRIPTION}
					isExpanded={schemaExpanded}
					toggle={() => setSchemaExpanded(prev => !prev)}
				/>
				<HistoryView 
					history={history}
					isExpanded={historyExpanded}
					toggle={() => setHistoryExpanded(prev => !prev)}
				/>
				{history.length !== 0 && 
					<TableView 
						history={history}
						historyIsExpanded={historyExpanded}
						tableIsExpanded={tableExpanded}
						toggle={() => setTableExpanded(prev => !prev)}
					/>}

				<SearchView 
					search={searchTerms}
					handleChange={handleChange}
					setSearchTerms={setSearchTerms}
					suggestions={suggestions}
					handleSuggestionSelect={handleSuggestionSelect}
				/>
			</div>
		<Footer />
		</main>
	)
}

export default App
