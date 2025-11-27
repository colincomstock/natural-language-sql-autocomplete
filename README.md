# Natural Language SQL Autocomplete

An autocomplete interface that generates SQL queries from natural language input using LLMs. Built with React, TypeScript, and Cloudflare Workers. Visual styling loosely based on the google homepage. Hosted here:

https://nl-sql-autocomplete.pages.dev/

## Features

- **Context-Aware Suggestions**: Maintains conversation history to handle follow-up queries (e.g., "make that by day" after a previous query)
- **3 Diverse Options**: Each query generates 3 varied SQL suggestions with different specificity, time scopes, and aggregations
- **Fast Response**: Debounced input (300ms) and smooth UX
- **Google-Style UI**: Clean, expandable sections for schema, query history, and results
- **Secure Architecture**: API keys protected via Cloudflare Worker proxy

## Architecture

### Frontend
- **React 19** + **TypeScript** for type-safe component architecture
- **Vite** for fast build and development
- **Lucide React** for icons
- Custom hook (`useAutocomplete`) for state management
- Component-based structure (SchemaView, HistoryView, TableView, SearchView)

### Backend
- **Cloudflare Worker** as API proxy to secure credentials
- **Groq SDK** with **llama-3.1-8b-instant** model (chosen for speed)
- CORS-enabled REST endpoint for frontend communication
- JSON response validation and error handling
## Design Decisions

### Speed vs Accuracy
I chose Groq as the provider because their LPU based archticture seems to be the market leader in speedy inferrence. Within their platform, I chose llama-3.1-8b-instant over larger models because autocomplete needs to feel instant and it needs to be cheap due to the high number of requests. The model occasionally returns imperfect suggestions, but users can pick from 3 options and the response time stays under a second. I first developed a local version that reached out to Groq, then moved it over to a Cloudflare Worker. My experience is that Cloudflare Workers offer incredibly fast responses and have an incredibly generous free tier. The speed on the local version and the deployed version appear functionally identical.

### Context Management
The system remembers your last 5 queries to understand follow-ups like "make that by day" or "only for US users." This balances conversation continuity with keeping prompts small enough for fast responses.

### Security
API keys live in the Cloudflare Worker, not in the frontend bundle.

### Error Handling
LLMs don't always return perfectly formatted JSON, so I added validation and fallbacks. The system also uses AbortController to cancel in-flight requests when you type quickly, preventing race conditions.

### UX Optimizations
The 300ms debounce seems to be the best balance between speed and numebr of requests sent. The interface only triggers a search after you've typed at least 3 characters and paused briefly.

## Example Queries

Try these natural language inputs:

1. **New query**: `"show me recent signups"`
   - Generates independent SQL from scratch

2. **Refinement**: `"make that by day"` (after query 1)
   - Modifies previous query to group by day

3. **Complex**: `"users who clicked more than 5 times last week"`
   - Handles joins, aggregations, time filters

## Trade-offs & Considerations

**What I optimized for:**
- Lowest latency possible
- Contextual awareness (follow-up queries work naturally)
- Diverse suggestions (3 meaningfully different options)

**What I deprioritized:**
- Perfect SQL accuracy
- Complex multi-turn conversations (limited to 5 queries of history)
- Result execution (placeholder UI only)

## What I could work on in the future
- This project is only optimized for desktop UI. Adding mobile styles would be top priority.
- Database filled with placeholder data to render a real table where it says "placeholder for table"
- Model choice/speed vs intelligence preference
- System Based light mode or dark mode

## Author

Colin Comstock - [GitHub](https://github.com/colincomstock)
